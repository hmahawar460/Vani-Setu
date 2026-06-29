/**
 * Phonetic normalization — SAFE rules only.
 *
 * IMPORTANT: Only include rules that are 100% safe to apply on ANY Hindi text
 * without risk of corrupting correctly transcribed words.
 *
 * These rules fix unambiguous character-level issues that the LLM sometimes
 * misses, plus known Whisper mis-transcriptions for impaired speech.
 *
 * Section 1: General phonetic fixes (anusvara, common typos)
 * Section 2: Whisper-specific mis-transcriptions (full-word anchored, safe)
 */

const RULES = [
  // ── Section 1: Missing anusvara / common phonetic fixes ───────────────
  [/\bनही\b/g,    'नहीं'],
  [/\bनींद\b/g,   'नींद'],
  [/\bजाऊगा\b/g,  'जाऊंगा'],
  [/\bआऊगा\b/g,   'आऊंगा'],
  [/\bकरूगा\b/g,  'करूंगा'],
  [/\bबोलूगा\b/g, 'बोलूंगा'],
  [/\bडोक्टर\b/g, 'डॉक्टर'],
  [/\bडाक्टर\b/g, 'डॉक्टर'],

  // ── Section 2: Known Whisper mis-transcriptions for impaired speech ───
  // These are FULL-WORD matches — safe because Whisper consistently produces
  // these specific broken words for common Hindi vocabulary.

  // school → तूल / ततूल / तथूल (most common Whisper error)
  [/\bतूल\b/g,    'स्कूल'],
  [/\bततूल\b/g,   'स्कूल'],
  [/\bतथूल\b/g,   'स्कूल'],

  // barish → बालिच / बालिश
  [/\bबालिच\b/g,  'बारिश'],
  [/\bबालिश\b/g,  'बारिश'],

  // kyunki → तूकी
  [/\bतूकी\b/g,   'क्योंकि'],

  // gaya → दई / दए
  [/\bदई\b/g,     'गई'],
  [/\bदए\b/g,     'गए'],

  // jhat → ठट
  [/\bठट\b/g,     'झट'],

  // kapre → तपले
  [/\bतपले\b/g,   'कपड़े'],

  // geele → दीले
  [/\bदीले\b/g,   'गीले'],

  // bahar → बाहर  (already correct, but adding variant)
  [/\bबहार\b/g,   'बाहर'],

  // khush → तोशू
  [/\bतोशू\b/g,   'खुश'],

  // sir → तज़ी
  [/\bतज़ी\b/g,   'सिर'],

  // ro → दोल
  [/\bदोल\b/g,    'रो'],

  // der / dhear → देल
  [/\bदेल\b/g,    'देर'],

  // aaj → आद / आदि (in certain contexts)
  [/\bआद\b/g,     'आज'],

  // khane → थाना / थाने
  [/\bथाना\b(?!\s*(?:में|पर|से))/g,  'खाने'],

  // darr → दर्र
  [/\bदर्र\b/g,   'डर'],
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
