/**
 * Per-user correction helpers.
 *
 * The browser owns the user's dataset in localStorage and sends a compact copy
 * with each API request. Keeping the server stateless avoids deploying or
 * sharing a corrections.json file on Vercel.
 */

function wordCount(value) {
  const trimmed = String(value ?? '').trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function classifyType(raw) {
  const wc = wordCount(raw);
  if (wc === 1) return 'word';
  if (wc <= 6) return 'phrase';
  return 'para';
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeCorrections(corrections) {
  if (!Array.isArray(corrections)) return [];

  const byRaw = new Map();

  for (const entry of corrections) {
    const raw = cleanString(entry?.raw);
    const corrected = cleanString(entry?.corrected);
    if (!raw || !corrected) continue;
    if (raw.toLowerCase() === corrected.toLowerCase()) continue;

    const key = raw.toLowerCase();
    const existing = byRaw.get(key);
    const count = Math.max(1, Number(entry?.count) || 1);
    const updatedAt = cleanString(entry?.updatedAt) || new Date(0).toISOString();

    const normalized = {
      raw,
      corrected,
      type: entry?.type || classifyType(raw),
      count,
      updatedAt,
    };

    if (!existing || Date.parse(existing.updatedAt) <= Date.parse(updatedAt)) {
      byRaw.set(key, normalized);
    }
  }

  return [...byRaw.values()];
}

/**
 * Apply stored word/phrase corrections to text before LLM correction.
 * Paragraph examples are reserved for LLM context.
 */
export function applyCorrections(text, corrections = []) {
  if (!text) return text;

  const entries = normalizeCorrections(corrections)
    .filter((c) => c.type === 'word' || c.type === 'phrase');
  if (!entries.length) return text;

  let result = text;
  const sorted = [...entries].sort(
    (a, b) => wordCount(b.raw) - wordCount(a.raw) || b.raw.length - a.raw.length,
  );

  const devaRange = '\u0900-\u097F';

  for (const entry of sorted) {
    const escaped = entry.raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      const regex = new RegExp(
        `(?<![${devaRange}a-zA-Z])${escaped}(?![${devaRange}a-zA-Z])`,
        'gi',
      );
      result = result.replace(regex, entry.corrected);
    } catch {
      // Ignore invalid user-provided correction entries.
    }
  }

  return result;
}

export function getWordCorrectionsForLLM(corrections = []) {
  return normalizeCorrections(corrections)
    .filter((c) => c.type === 'word' || c.type === 'phrase')
    .sort((a, b) => (b.count || 1) - (a.count || 1))
    .slice(0, 40)
    .map((c) => `"${c.raw}"->"${c.corrected}"`)
    .join(', ');
}

export function getParaExamplesForLLM(corrections = []) {
  return normalizeCorrections(corrections)
    .filter((c) => c.type === 'para')
    .sort((a, b) => (b.count || 1) - (a.count || 1))
    .slice(0, 3);
}
