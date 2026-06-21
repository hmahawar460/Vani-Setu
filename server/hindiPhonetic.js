/**
 * Phonetic normalization — SAFE rules only.
 *
 * IMPORTANT: Only include rules that are 100% safe to apply on ANY Hindi text
 * without risk of corrupting correctly transcribed words.
 *
 * Removed all Roman/Hinglish fragment rules because Whisper for impaired speech
 * outputs broken Devanagari (not Roman), and rules like /\bha\b/ fire incorrectly
 * inside Devanagari words, corrupting the text further.
 *
 * The LLM layer handles all complex correction. These rules only fix
 * unambiguous character-level issues that the LLM sometimes misses.
 */

const RULES = [
  // ── Missing anusvara on specific high-frequency words only ────────────────
  // These are safe because they match full Devanagari words, not fragments
  [/\bनही\b/g,  'नहीं'],   // nahi → nahin (extremely common in impaired speech)
  [/\bनीद\b/g,  'नींद'],   // neend
  [/\bजाऊगा\b/g, 'जाऊंगा'],
  [/\bआऊगा\b/g,  'आऊंगा'],
  [/\bकरूगा\b/g, 'करूंगा'],
  [/\bबोलूगा\b/g, 'बोलूंगा'],
  [/\bडोक्टर\b/g, 'डॉक्टर'],
  [/\bडाक्टर\b/g, 'डॉक्टर'],
];

/**
 * Apply safe phonetic rules to input text.
 * @param {string} text
 * @returns {string}
 */
export function applyPhoneticRules(text) {
  if (!text) return text;
  let result = text;
  for (const [pattern, replacement] of RULES) {
    result = result.replace(pattern, replacement);
  }
  return result;
}
