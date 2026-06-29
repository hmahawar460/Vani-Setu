/**
 * Apply user pronunciation profile from alphabet/varnmala tests.
 * Maps how THIS user pronounces sounds → correct letters/words.
 */

function normalizeKey(value = '') {
  return String(value).trim().toLowerCase().replace(/[^\w\u0900-\u097F]/g, '');
}

export function normalizePronunciationProfile(profile) {
  if (!Array.isArray(profile)) return [];

  const byHeard = new Map();
  for (const entry of profile) {
    const heard = String(entry?.heard ?? '').trim();
    const expected = String(entry?.expected ?? entry?.letter ?? '').trim();
    if (!heard || !expected) continue;
    if (heard.toLowerCase() === expected.toLowerCase()) continue;

    byHeard.set(normalizeKey(heard), {
      heard,
      expected,
      script: entry?.script ?? 'hi',
    });
  }
  return [...byHeard.values()];
}

export function applyPronunciationProfile(text, profile = []) {
  if (!text?.trim() || !profile.length) return text;

  const entries = normalizePronunciationProfile(profile)
    .sort((a, b) => b.heard.length - a.heard.length);

  let result = text;
  const devaRange = '\u0900-\u097F';

  for (const entry of entries) {
    const escaped = entry.heard.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      const regex = new RegExp(
        `(?<![${devaRange}a-zA-Z])${escaped}(?![${devaRange}a-zA-Z])`,
        'gi',
      );
      result = result.replace(regex, entry.expected);
    } catch {
      /* skip invalid */
    }
  }

  return result;
}

export function getPronunciationHintsForLLM(profile = []) {
  return normalizePronunciationProfile(profile)
    .slice(0, 30)
    .map((p) => `"${p.heard}" → "${p.expected}"`)
    .join(', ');
}

export function matchWordByPronunciation(rawWord, expectedWord, profile = []) {
  const key = normalizeKey(rawWord);
  const expKey = normalizeKey(expectedWord);
  if (!key || !expKey) return null;

  if (key === expKey) return expectedWord;

  for (const p of normalizePronunciationProfile(profile)) {
    if (normalizeKey(p.heard) === key && normalizeKey(p.expected) === expKey) {
      return expectedWord;
    }
    if (normalizeKey(p.heard) === key) {
      return p.expected;
    }
  }

  return null;
}
