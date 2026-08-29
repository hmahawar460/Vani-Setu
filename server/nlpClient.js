/**
 * nlpClient.js — HTTP client for the WisperFlow Python ML sidecar.
 *
 * All calls use a configurable timeout (default 5000 ms).
 * On any timeout or network error the functions return the input text unchanged,
 * so the Node.js pipeline degrades gracefully without throwing.
 *
 * Uses ES module syntax (package.json has "type": "module").
 */

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────
const baseUrl = process.env.ML_SIDECAR_URL ?? 'http://localhost:8000';
const timeoutMs = Number(process.env.ML_SIDECAR_TIMEOUT_MS ?? 5000);

// ─────────────────────────────────────────────────────────────────────────────
// Sidecar availability cache — re-checked at most every 30 seconds
// ─────────────────────────────────────────────────────────────────────────────
let _sidecarAvailable = false;
let _sidecarCheckedAt = 0;
const AVAILABILITY_CACHE_MS = 30_000;

/**
 * GET /health — check whether the sidecar is reachable.
 * Result is cached for 30 s to avoid per-request overhead.
 * Returns false on any error.
 */
export async function isSidecarAvailable() {
  const now = Date.now();
  if (now - _sidecarCheckedAt < AVAILABILITY_CACHE_MS) {
    return _sidecarAvailable;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`${baseUrl}/health`, { signal: controller.signal });
    clearTimeout(timer);
    _sidecarAvailable = res.ok;
  } catch (err) {
    console.warn('[nlp-client] health check failed:', err.message ?? err);
    _sidecarAvailable = false;
  }

  _sidecarCheckedAt = Date.now();
  return _sidecarAvailable;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helper — POST with timeout + graceful error handling
// ─────────────────────────────────────────────────────────────────────────────
async function sidecarPost(endpoint, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      console.warn(`[nlp-client] ${endpoint} returned HTTP ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      console.warn(`[nlp-client] ${endpoint} timed out after ${timeoutMs}ms`);
    } else {
      console.warn(`[nlp-client] ${endpoint} network error:`, err.message ?? err);
    }
    // Invalidate availability cache on network error so next call re-checks
    _sidecarAvailable = false;
    _sidecarCheckedAt = 0;
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Task 2.1 — Spell correction via Spello.
 * POST /spell-correct → returns corrected string, or `text` unchanged on failure.
 * @param {string} text
 * @param {string} [lang] — optional: 'hindi' | 'hinglish' | 'english'
 * @returns {Promise<string>}
 */
export async function spellCorrect(text, lang) {
  const body = { text };
  if (lang) body.lang = lang;

  const data = await sidecarPost('/spell-correct', body);
  if (data?.corrected != null) {
    return data.corrected;
  }
  return text;
}

/**
 * Task 2.2 — Hindi grammar correction via GEC-mT5-Small-Hindi.
 * POST /grammar-hindi → returns corrected string, or `text` on failure.
 * @param {string} text
 * @returns {Promise<string>}
 */
export async function grammarCorrectHindi(text) {
  const data = await sidecarPost('/grammar-hindi', { text });
  return data?.corrected ?? text;
}

/**
 * Task 2.3 — English grammar correction via GrammarCorrectionTransformer.
 * POST /grammar-english → returns corrected string, or `text` on failure.
 * @param {string} text
 * @returns {Promise<string>}
 */
export async function grammarCorrectEnglish(text) {
  const data = await sidecarPost('/grammar-english', { text });
  return data?.corrected ?? text;
}

/**
 * Task 2.4 — Full Hinglish pipeline via hindiwsd.
 * POST /hinglish-pipeline → returns full response object, or graceful fallback on failure.
 * @param {string} text
 * @returns {Promise<{spell_corrected: string, devanagari: string, pos: Array, wsd: Array, confidence: number}>}
 */
export async function hinglishPipeline(text) {
  const fallback = { spell_corrected: text, devanagari: text, pos: [], wsd: [], confidence: 0 };
  const data = await sidecarPost('/hinglish-pipeline', { text });
  if (data != null && typeof data.devanagari === 'string') {
    return data;
  }
  return fallback;
}
