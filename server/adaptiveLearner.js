/**
 * adaptiveLearner.js — In-memory adaptive correction model for WisperFlow.
 *
 * License: MIT
 *
 * Learns from past pipeline mistakes by tracking:
 *  1. Which raw→corrected pairs the pipeline got right vs wrong
 *  2. Accumulated error frequency per token pattern
 *  3. Dynamic priority scoring that boosts high-error patterns
 *
 * Architecture: No external ML library. Pure frequency-based Bayesian
 * update rule — simple, fast, deterministic, and zero-dependency.
 *
 * How it integrates into the pipeline:
 *  - BEFORE LLM call: injects top learned corrections into the system prompt
 *  - AFTER pipeline output: compares against expected (when available) and
 *    records token-level errors to update weights
 *
 * Persistence: In-memory only (resets on server restart). For production
 * persistence, call exportState() and store the JSON in a DB/Redis.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types (JSDoc)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {{ raw: string, corrected: string, hits: number, misses: number, score: number, lastSeen: number }} LearnedEntry
 */

// ─────────────────────────────────────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────────────────────────────────────

/** @type {Map<string, LearnedEntry>} key = raw.toLowerCase() */
const _store = new Map();

/** Hyperparameters */
const ALPHA       = 0.7;  // weight of new observation vs historical (higher = faster learning)
const DECAY_RATE  = 0.995; // per-call score decay (prevents stale patterns dominating)
const MAX_ENTRIES = 2000;  // cap learned entries to avoid unbounded memory growth
const MIN_SCORE_TO_INJECT = 0.30; // min score for a learned correction to be injected into LLM prompt

let _totalCalls   = 0;
let _totalErrors  = 0;
let _totalHits    = 0;

// ─────────────────────────────────────────────────────────────────────────────
// Core update logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalize a token for lookup (remove punctuation, lowercase).
 * @param {string} token
 * @returns {string}
 */
function norm(token) {
  return String(token ?? '').trim().toLowerCase().replace(/[.,!?।॥]+/g, '');
}

/**
 * Record that a raw→corrected pair was CORRECT (pipeline got it right).
 * @param {string} raw
 * @param {string} corrected
 */
function recordHit(raw, corrected) {
  const key = norm(raw);
  if (!key) return;

  const existing = _store.get(key);
  if (existing) {
    existing.hits++;
    existing.score = Math.min(1.0, existing.score + ALPHA * (1 - existing.score));
    existing.lastSeen = Date.now();
  } else {
    _store.set(key, {
      raw,
      corrected,
      hits: 1,
      misses: 0,
      score: 0.5 + ALPHA * 0.5,
      lastSeen: Date.now(),
    });
  }
  _totalHits++;
  _evictIfNeeded();
}

/**
 * Record that a raw→corrected pair was WRONG (pipeline produced bad output).
 * The expected correct form must be provided.
 * @param {string} raw           - What Whisper/pipeline produced
 * @param {string} pipelineOut   - What our pipeline output (wrong)
 * @param {string} expected      - What the correct answer should have been
 */
function recordMiss(raw, pipelineOut, expected) {
  const key = norm(raw);
  if (!key || !expected) return;

  const existing = _store.get(key);
  if (existing) {
    existing.misses++;
    // Penalize score and update the corrected target to the expected value
    existing.score = Math.max(0, existing.score - ALPHA * existing.score);
    existing.corrected = expected; // learn the right answer
    existing.lastSeen = Date.now();
  } else {
    _store.set(key, {
      raw,
      corrected: expected,
      hits: 0,
      misses: 1,
      score: ALPHA * 0.5, // start with moderate confidence
      lastSeen: Date.now(),
    });
  }
  _totalErrors++;
  _evictIfNeeded();
}

/**
 * Apply score decay to all entries (called on each pipeline run).
 * Prevents old patterns from dominating indefinitely.
 */
function _applyDecay() {
  for (const entry of _store.values()) {
    entry.score *= DECAY_RATE;
  }
}

/**
 * Evict lowest-score entries when the store is at capacity.
 */
function _evictIfNeeded() {
  if (_store.size <= MAX_ENTRIES) return;

  // Sort by score ascending, evict bottom 10%
  const sorted = [..._store.entries()].sort(([, a], [, b]) => a.score - b.score);
  const toEvict = Math.ceil(_store.size * 0.10);
  for (let i = 0; i < toEvict; i++) {
    _store.delete(sorted[i][0]);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Token-level diff utilities
// ─────────────────────────────────────────────────────────────────────────────

function tokenize(text) {
  return String(text ?? '').trim().split(/\s+/).filter(Boolean);
}

/**
 * Compute token-level diffs between pipeline output and expected.
 * Returns an array of { raw, pipelineOut, expected } for each mismatched position.
 *
 * @param {string[]} outputTokens
 * @param {string[]} expectedTokens
 * @returns {{ raw: string, pipelineOut: string, expected: string }[]}
 */
function diffTokens(outputTokens, expectedTokens) {
  const diffs = [];
  const len = Math.max(outputTokens.length, expectedTokens.length);
  for (let i = 0; i < len; i++) {
    const out = outputTokens[i] ?? '';
    const exp = expectedTokens[i] ?? '';
    if (norm(out) !== norm(exp)) {
      diffs.push({ raw: out, pipelineOut: out, expected: exp });
    }
  }
  return diffs;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Called after each pipeline run. Compares output to expected (if known)
 * and records hits/misses at the token level.
 *
 * @param {string} rawInput       - Original Whisper input
 * @param {string} pipelineOutput - What the pipeline produced
 * @param {string|null} expected  - Ground truth (from test mode or user feedback)
 */
export function recordPipelineResult(rawInput, pipelineOutput, expected) {
  _totalCalls++;
  _applyDecay();

  if (!expected) return; // nothing to learn from without ground truth

  const rawTokens    = tokenize(rawInput);
  const outTokens    = tokenize(pipelineOutput);
  const expTokens    = tokenize(expected);

  // For each position in the input, check if pipeline got the right word
  const len = Math.min(rawTokens.length, expTokens.length, outTokens.length);
  for (let i = 0; i < len; i++) {
    const raw = rawTokens[i];
    const out = outTokens[i] ?? '';
    const exp = expTokens[i] ?? '';

    if (norm(out) === norm(exp)) {
      recordHit(raw, exp);
    } else {
      recordMiss(raw, out, exp);
    }
  }

  // Also record full-phrase learning if short enough (2-4 words)
  if (rawTokens.length <= 4 && norm(pipelineOutput) !== norm(expected)) {
    recordMiss(rawInput.trim(), pipelineOutput.trim(), expected.trim());
  } else if (rawTokens.length <= 4) {
    recordHit(rawInput.trim(), expected.trim());
  }
}

/**
 * Apply learned corrections to text (pre-LLM step).
 * Only applies corrections with score above MIN_SCORE_TO_INJECT.
 *
 * @param {string} text
 * @returns {string}
 */
export function applyLearnedCorrections(text) {
  if (!text || _store.size === 0) return text;

  // Full-phrase check first
  const fullKey = norm(text.trim());
  const fullEntry = _store.get(fullKey);
  if (fullEntry && fullEntry.score >= MIN_SCORE_TO_INJECT && fullEntry.corrected !== fullEntry.raw) {
    console.log(`[adaptive] full-phrase hit: "${text.trim()}" → "${fullEntry.corrected}" (score=${fullEntry.score.toFixed(2)})`);
    return fullEntry.corrected;
  }

  // Token-level check
  const tokens = text.split(/(\s+)/);
  let changed = false;

  const result = tokens.map(token => {
    const key = norm(token);
    if (!key) return token;
    const entry = _store.get(key);
    if (!entry || entry.score < MIN_SCORE_TO_INJECT) return token;
    if (norm(entry.corrected) === key) return token; // no-op correction
    const trailing = token.trim().match(/[.,!?।॥]+$/)?.[0] ?? '';
    changed = true;
    console.log(`[adaptive] token "${token.trim()}" → "${entry.corrected}" (score=${entry.score.toFixed(2)})`);
    return entry.corrected + trailing;
  });

  return changed ? result.join('') : text;
}

/**
 * Get top learned corrections for injection into the LLM system prompt.
 * Returns only high-confidence, frequently-seen patterns.
 *
 * @param {number} limit - Max number of hints to return
 * @returns {string} Formatted hint string: "raw→corrected, ..."
 */
export function getLearnedHintsForLLM(limit = 20) {
  if (_store.size === 0) return '';

  const entries = [..._store.values()]
    .filter(e => e.score >= MIN_SCORE_TO_INJECT && norm(e.corrected) !== norm(e.raw))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (!entries.length) return '';

  return entries.map(e => `"${e.raw}"→"${e.corrected}"`).join(', ');
}

/**
 * Export the current state for persistence (e.g., save to Redis).
 * @returns {{ entries: LearnedEntry[], stats: object }}
 */
export function exportState() {
  return {
    entries: [..._store.values()],
    stats: getStats(),
  };
}

/**
 * Import previously persisted state.
 * @param {{ entries: LearnedEntry[] }} state
 */
export function importState(state) {
  if (!Array.isArray(state?.entries)) return;
  _store.clear();
  for (const entry of state.entries) {
    const key = norm(entry.raw);
    if (key) _store.set(key, entry);
  }
  console.log(`[adaptive] imported ${_store.size} learned entries`);
}

/**
 * Get runtime statistics.
 * @returns {{ storeSize: number, totalCalls: number, totalErrors: number, totalHits: number, accuracy: number }}
 */
export function getStats() {
  const total = _totalHits + _totalErrors;
  return {
    storeSize: _store.size,
    totalCalls: _totalCalls,
    totalErrors: _totalErrors,
    totalHits: _totalHits,
    accuracy: total > 0 ? Math.round((_totalHits / total) * 100) : null,
  };
}

/**
 * Reset all learned state (useful for testing).
 */
export function resetLearner() {
  _store.clear();
  _totalCalls = 0;
  _totalErrors = 0;
  _totalHits = 0;
}
