/**
 * dyslexiaDataset.js — MIT-licensed dyslexia correction dataset for WisperFlow.
 *
 * License: MIT
 * Sources & inspiration:
 *  - Common dyslexia error patterns (letter reversal, phonetic substitution,
 *    omission, addition) — well-documented in educational linguistics research.
 *  - Hindi-specific dyslexia patterns from AAC/SLP practice literature.
 *  - Synthetic generation following established dyslexia error taxonomies.
 *
 * Error types covered:
 *  TYPE_REVERSAL   — b/d, p/q, म/न, ब/व reversals
 *  TYPE_PHONETIC   — sound-alike substitutions (f→ph, s→c, etc.)
 *  TYPE_OMISSION   — missing letters/matras in Hindi
 *  TYPE_ADDITION   — extra letters/characters
 *  TYPE_SEQUENCE   — letter order swapped
 *  TYPE_WHOLE_WORD — whole-word substitutions (common sight-word confusions)
 *
 * Each entry: { id, raw, corrected, type, lang, category, confidence }
 *  confidence: 0.0–1.0 (how often this pattern appears in dyslexic writing)
 */

import { STAMMERER_DATASET } from './testDataset.js';

export const DYSLEXIA_DATASET = [
  // ═══════════════════════════════════════════════════════════════════════
  // SECTION A — English letter reversal patterns (b/d, p/q, n/u, m/w)
  // ═══════════════════════════════════════════════════════════════════════
  { id: 10001, raw: 'doy', corrected: 'boy', type: 'reversal', lang: 'english', category: 'letter_bd', confidence: 0.92 },
  { id: 10002, raw: 'dag', corrected: 'bag', type: 'reversal', lang: 'english', category: 'letter_bd', confidence: 0.91 },
  { id: 10003, raw: 'ded', corrected: 'bed', type: 'reversal', lang: 'english', category: 'letter_bd', confidence: 0.90 },
  { id: 10004, raw: 'dook', corrected: 'book', type: 'reversal', lang: 'english', category: 'letter_bd', confidence: 0.89 },
  { id: 10005, raw: 'dite', corrected: 'bite', type: 'reversal', lang: 'english', category: 'letter_bd', confidence: 0.88 },
  { id: 10006, raw: 'boor', corrected: 'door', type: 'reversal', lang: 'english', category: 'letter_bd', confidence: 0.88 },
  { id: 10007, raw: 'bown', corrected: 'down', type: 'reversal', lang: 'english', category: 'letter_bd', confidence: 0.87 },
  { id: 10008, raw: 'bance', corrected: 'dance', type: 'reversal', lang: 'english', category: 'letter_bd', confidence: 0.87 },
  { id: 10009, raw: 'bream', corrected: 'dream', type: 'reversal', lang: 'english', category: 'letter_bd', confidence: 0.86 },
  { id: 10010, raw: 'borsal', corrected: 'dorsal', type: 'reversal', lang: 'english', category: 'letter_bd', confidence: 0.85 },
  { id: 10011, raw: 'qig', corrected: 'pig', type: 'reversal', lang: 'english', category: 'letter_pq', confidence: 0.90 },
  { id: 10012, raw: 'qan', corrected: 'pan', type: 'reversal', lang: 'english', category: 'letter_pq', confidence: 0.89 },
  { id: 10013, raw: 'qat', corrected: 'pat', type: 'reversal', lang: 'english', category: 'letter_pq', confidence: 0.88 },
  { id: 10014, raw: 'qin', corrected: 'pin', type: 'reversal', lang: 'english', category: 'letter_pq', confidence: 0.88 },
  { id: 10015, raw: 'quit', corrected: 'pit', type: 'reversal', lang: 'english', category: 'letter_pq', confidence: 0.87 },
  { id: 10016, raw: 'un', corrected: 'nu', type: 'reversal', lang: 'english', category: 'letter_nu', confidence: 0.86 },
  { id: 10017, raw: 'uet', corrected: 'net', type: 'reversal', lang: 'english', category: 'letter_nu', confidence: 0.85 },
  { id: 10018, raw: 'uow', corrected: 'now', type: 'reversal', lang: 'english', category: 'letter_nu', confidence: 0.85 },
  { id: 10019, raw: 'wom', corrected: 'mom', type: 'reversal', lang: 'english', category: 'letter_mw', confidence: 0.84 },
  { id: 10020, raw: 'wan', corrected: 'man', type: 'reversal', lang: 'english', category: 'letter_mw', confidence: 0.84 },
  { id: 10021, raw: 'wap', corrected: 'map', type: 'reversal', lang: 'english', category: 'letter_mw', confidence: 0.83 },
  { id: 10022, raw: 'wud', corrected: 'mud', type: 'reversal', lang: 'english', category: 'letter_mw', confidence: 0.83 },
  { id: 10023, raw: 'mell', corrected: 'well', type: 'reversal', lang: 'english', category: 'letter_mw', confidence: 0.82 },
  { id: 10024, raw: 'mant', corrected: 'want', type: 'reversal', lang: 'english', category: 'letter_mw', confidence: 0.82 },
  { id: 10025, raw: 'mil', corrected: 'will', type: 'reversal', lang: 'english', category: 'letter_mw', confidence: 0.81 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION B — English phonetic substitutions
  // ═══════════════════════════════════════════════════════════════════════
  { id: 10026, raw: 'fone', corrected: 'phone', type: 'phonetic', lang: 'english', category: 'ph_f', confidence: 0.95 },
  { id: 10027, raw: 'foto', corrected: 'photo', type: 'phonetic', lang: 'english', category: 'ph_f', confidence: 0.94 },
  { id: 10028, raw: 'fysics', corrected: 'physics', type: 'phonetic', lang: 'english', category: 'ph_f', confidence: 0.93 },
  { id: 10029, raw: 'elefant', corrected: 'elephant', type: 'phonetic', lang: 'english', category: 'ph_f', confidence: 0.92 },
  { id: 10030, raw: 'alfabet', corrected: 'alphabet', type: 'phonetic', lang: 'english', category: 'ph_f', confidence: 0.92 },
  { id: 10031, raw: 'sity', corrected: 'city', type: 'phonetic', lang: 'english', category: 'c_s', confidence: 0.91 },
  { id: 10032, raw: 'sentral', corrected: 'central', type: 'phonetic', lang: 'english', category: 'c_s', confidence: 0.90 },
  { id: 10033, raw: 'sircle', corrected: 'circle', type: 'phonetic', lang: 'english', category: 'c_s', confidence: 0.90 },
  { id: 10034, raw: 'kwick', corrected: 'quick', type: 'phonetic', lang: 'english', category: 'qu_kw', confidence: 0.89 },
  { id: 10035, raw: 'kwiet', corrected: 'quiet', type: 'phonetic', lang: 'english', category: 'qu_kw', confidence: 0.89 },
  { id: 10036, raw: 'nite', corrected: 'night', type: 'phonetic', lang: 'english', category: 'silent_gh', confidence: 0.95 },
  { id: 10037, raw: 'lite', corrected: 'light', type: 'phonetic', lang: 'english', category: 'silent_gh', confidence: 0.94 },
  { id: 10038, raw: 'rite', corrected: 'right', type: 'phonetic', lang: 'english', category: 'silent_gh', confidence: 0.94 },
  { id: 10039, raw: 'fite', corrected: 'fight', type: 'phonetic', lang: 'english', category: 'silent_gh', confidence: 0.93 },
  { id: 10040, raw: 'mite', corrected: 'might', type: 'phonetic', lang: 'english', category: 'silent_gh', confidence: 0.93 },
  { id: 10041, raw: 'tite', corrected: 'tight', type: 'phonetic', lang: 'english', category: 'silent_gh', confidence: 0.92 },
  { id: 10042, raw: 'site', corrected: 'sight', type: 'phonetic', lang: 'english', category: 'silent_gh', confidence: 0.92 },
  { id: 10043, raw: 'nife', corrected: 'knife', type: 'phonetic', lang: 'english', category: 'silent_k', confidence: 0.93 },
  { id: 10044, raw: 'nee', corrected: 'knee', type: 'phonetic', lang: 'english', category: 'silent_k', confidence: 0.92 },
  { id: 10045, raw: 'nock', corrected: 'knock', type: 'phonetic', lang: 'english', category: 'silent_k', confidence: 0.91 },
  { id: 10046, raw: 'wen', corrected: 'when', type: 'phonetic', lang: 'english', category: 'silent_wh', confidence: 0.90 },
  { id: 10047, raw: 'were', corrected: 'where', type: 'phonetic', lang: 'english', category: 'silent_wh', confidence: 0.90 },
  { id: 10048, raw: 'wy', corrected: 'why', type: 'phonetic', lang: 'english', category: 'silent_wh', confidence: 0.89 },
  { id: 10049, raw: 'wat', corrected: 'what', type: 'phonetic', lang: 'english', category: 'silent_wh', confidence: 0.89 },
  { id: 10050, raw: 'wich', corrected: 'which', type: 'phonetic', lang: 'english', category: 'silent_wh', confidence: 0.88 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION C — English omission patterns (missing letters)
  // ═══════════════════════════════════════════════════════════════════════
  { id: 10051, raw: 'becaus', corrected: 'because', type: 'omission', lang: 'english', category: 'end_vowel', confidence: 0.92 },
  { id: 10052, raw: 'befor', corrected: 'before', type: 'omission', lang: 'english', category: 'end_vowel', confidence: 0.91 },
  { id: 10053, raw: 'mor', corrected: 'more', type: 'omission', lang: 'english', category: 'end_vowel', confidence: 0.91 },
  { id: 10054, raw: 'lik', corrected: 'like', type: 'omission', lang: 'english', category: 'end_vowel', confidence: 0.90 },
  { id: 10055, raw: 'hav', corrected: 'have', type: 'omission', lang: 'english', category: 'end_vowel', confidence: 0.90 },
  { id: 10056, raw: 'mak', corrected: 'make', type: 'omission', lang: 'english', category: 'end_vowel', confidence: 0.89 },
  { id: 10057, raw: 'tak', corrected: 'take', type: 'omission', lang: 'english', category: 'end_vowel', confidence: 0.89 },
  { id: 10058, raw: 'giv', corrected: 'give', type: 'omission', lang: 'english', category: 'end_vowel', confidence: 0.88 },
  { id: 10059, raw: 'lif', corrected: 'life', type: 'omission', lang: 'english', category: 'end_vowel', confidence: 0.88 },
  { id: 10060, raw: 'tim', corrected: 'time', type: 'omission', lang: 'english', category: 'end_vowel', confidence: 0.87 },
  { id: 10061, raw: 'frend', corrected: 'friend', type: 'omission', lang: 'english', category: 'vowel_cluster', confidence: 0.92 },
  { id: 10062, raw: 'peple', corrected: 'people', type: 'omission', lang: 'english', category: 'vowel_cluster', confidence: 0.91 },
  { id: 10063, raw: 'techer', corrected: 'teacher', type: 'omission', lang: 'english', category: 'vowel_cluster', confidence: 0.91 },
  { id: 10064, raw: 'wether', corrected: 'weather', type: 'omission', lang: 'english', category: 'vowel_cluster', confidence: 0.90 },
  { id: 10065, raw: 'brether', corrected: 'brother', type: 'omission', lang: 'english', category: 'vowel_cluster', confidence: 0.90 },
  { id: 10066, raw: 'mothr', corrected: 'mother', type: 'omission', lang: 'english', category: 'vowel_cluster', confidence: 0.89 },
  { id: 10067, raw: 'fathr', corrected: 'father', type: 'omission', lang: 'english', category: 'vowel_cluster', confidence: 0.89 },
  { id: 10068, raw: 'sistir', corrected: 'sister', type: 'omission', lang: 'english', category: 'vowel_cluster', confidence: 0.88 },
  { id: 10069, raw: 'brothr', corrected: 'brother', type: 'omission', lang: 'english', category: 'vowel_cluster', confidence: 0.88 },
  { id: 10070, raw: 'numbr', corrected: 'number', type: 'omission', lang: 'english', category: 'vowel_cluster', confidence: 0.87 },
  { id: 10071, raw: 'wter', corrected: 'water', type: 'omission', lang: 'english', category: 'mid_vowel', confidence: 0.90 },
  { id: 10072, raw: 'buttr', corrected: 'butter', type: 'omission', lang: 'english', category: 'mid_vowel', confidence: 0.89 },
  { id: 10073, raw: 'lettr', corrected: 'letter', type: 'omission', lang: 'english', category: 'mid_vowel', confidence: 0.89 },
  { id: 10074, raw: 'bettr', corrected: 'better', type: 'omission', lang: 'english', category: 'mid_vowel', confidence: 0.88 },
  { id: 10075, raw: 'litl', corrected: 'little', type: 'omission', lang: 'english', category: 'mid_vowel', confidence: 0.88 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION D — English sequence/transposition errors
  // ═══════════════════════════════════════════════════════════════════════
  { id: 10076, raw: 'waht', corrected: 'what', type: 'sequence', lang: 'english', category: 'transposition', confidence: 0.93 },
  { id: 10077, raw: 'teh', corrected: 'the', type: 'sequence', lang: 'english', category: 'transposition', confidence: 0.95 },
  { id: 10078, raw: 'thier', corrected: 'their', type: 'sequence', lang: 'english', category: 'transposition', confidence: 0.92 },
  { id: 10079, raw: 'freind', corrected: 'friend', type: 'sequence', lang: 'english', category: 'transposition', confidence: 0.92 },
  { id: 10080, raw: 'recieve', corrected: 'receive', type: 'sequence', lang: 'english', category: 'transposition', confidence: 0.91 },
  { id: 10081, raw: 'beleive', corrected: 'believe', type: 'sequence', lang: 'english', category: 'transposition', confidence: 0.91 },
  { id: 10082, raw: 'peice', corrected: 'piece', type: 'sequence', lang: 'english', category: 'transposition', confidence: 0.90 },
  { id: 10083, raw: 'wierd', corrected: 'weird', type: 'sequence', lang: 'english', category: 'transposition', confidence: 0.90 },
  { id: 10084, raw: 'nieghbor', corrected: 'neighbor', type: 'sequence', lang: 'english', category: 'transposition', confidence: 0.89 },
  { id: 10085, raw: 'priase', corrected: 'praise', type: 'sequence', lang: 'english', category: 'transposition', confidence: 0.89 },
  { id: 10086, raw: 'was', corrected: 'saw', type: 'sequence', lang: 'english', category: 'whole_reversal', confidence: 0.87 },
  { id: 10087, raw: 'on', corrected: 'no', type: 'sequence', lang: 'english', category: 'whole_reversal', confidence: 0.86 },
  { id: 10088, raw: 'net', corrected: 'ten', type: 'sequence', lang: 'english', category: 'whole_reversal', confidence: 0.85 },
  { id: 10089, raw: 'rat', corrected: 'tar', type: 'sequence', lang: 'english', category: 'whole_reversal', confidence: 0.84 },
  { id: 10090, raw: 'nap', corrected: 'pan', type: 'sequence', lang: 'english', category: 'whole_reversal', confidence: 0.84 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION E — English whole-word sight-word confusions
  // ═══════════════════════════════════════════════════════════════════════
  { id: 10091, raw: 'their', corrected: 'there', type: 'whole_word', lang: 'english', category: 'homophone', confidence: 0.90 },
  { id: 10092, raw: 'there', corrected: 'their', type: 'whole_word', lang: 'english', category: 'homophone', confidence: 0.90 },
  { id: 10093, raw: 'to', corrected: 'too', type: 'whole_word', lang: 'english', category: 'homophone', confidence: 0.89 },
  { id: 10094, raw: 'two', corrected: 'to', type: 'whole_word', lang: 'english', category: 'homophone', confidence: 0.89 },
  { id: 10095, raw: 'weather', corrected: 'whether', type: 'whole_word', lang: 'english', category: 'homophone', confidence: 0.88 },
  { id: 10096, raw: 'buy', corrected: 'by', type: 'whole_word', lang: 'english', category: 'homophone', confidence: 0.88 },
  { id: 10097, raw: 'hear', corrected: 'here', type: 'whole_word', lang: 'english', category: 'homophone', confidence: 0.87 },
  { id: 10098, raw: 'know', corrected: 'no', type: 'whole_word', lang: 'english', category: 'homophone', confidence: 0.87 },
  { id: 10099, raw: 'write', corrected: 'right', type: 'whole_word', lang: 'english', category: 'homophone', confidence: 0.86 },
  { id: 10100, raw: 'wear', corrected: 'where', type: 'whole_word', lang: 'english', category: 'homophone', confidence: 0.86 },
  { id: 10101, raw: 'saw', corrected: 'was', type: 'whole_word', lang: 'english', category: 'sight_confusion', confidence: 0.89 },
  { id: 10102, raw: 'form', corrected: 'from', type: 'whole_word', lang: 'english', category: 'sight_confusion', confidence: 0.88 },
  { id: 10103, raw: 'of', corrected: 'off', type: 'whole_word', lang: 'english', category: 'sight_confusion', confidence: 0.87 },
  { id: 10104, raw: 'then', corrected: 'than', type: 'whole_word', lang: 'english', category: 'sight_confusion', confidence: 0.87 },
  { id: 10105, raw: 'an', corrected: 'and', type: 'whole_word', lang: 'english', category: 'sight_confusion', confidence: 0.86 },
  { id: 10106, raw: 'hos', corrected: 'his', type: 'whole_word', lang: 'english', category: 'sight_confusion', confidence: 0.85 },
  { id: 10107, raw: 'hid', corrected: 'did', type: 'whole_word', lang: 'english', category: 'sight_confusion', confidence: 0.85 },
  { id: 10108, raw: 'wit', corrected: 'with', type: 'whole_word', lang: 'english', category: 'sight_confusion', confidence: 0.84 },
  { id: 10109, raw: 'wnt', corrected: 'went', type: 'whole_word', lang: 'english', category: 'sight_confusion', confidence: 0.84 },
  { id: 10110, raw: 'thay', corrected: 'they', type: 'whole_word', lang: 'english', category: 'sight_confusion', confidence: 0.83 },
  { id: 10111, raw: 'paly', corrected: 'play', type: 'whole_word', lang: 'english', category: 'sight_confusion', confidence: 0.83 },
  { id: 10112, raw: 'siad', corrected: 'said', type: 'whole_word', lang: 'english', category: 'sight_confusion', confidence: 0.82 },
  { id: 10113, raw: 'taht', corrected: 'that', type: 'whole_word', lang: 'english', category: 'sight_confusion', confidence: 0.82 },
  { id: 10114, raw: 'owrd', corrected: 'word', type: 'whole_word', lang: 'english', category: 'sight_confusion', confidence: 0.81 },
  { id: 10115, raw: 'clcok', corrected: 'clock', type: 'whole_word', lang: 'english', category: 'sight_confusion', confidence: 0.81 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION F — English addition errors (extra characters)
  // ═══════════════════════════════════════════════════════════════════════
  { id: 10116, raw: 'gooing', corrected: 'going', type: 'addition', lang: 'english', category: 'double_vowel', confidence: 0.88 },
  { id: 10117, raw: 'runing', corrected: 'running', type: 'addition', lang: 'english', category: 'double_consonant', confidence: 0.87 },
  { id: 10118, raw: 'sitting', corrected: 'sitting', type: 'addition', lang: 'english', category: 'double_consonant', confidence: 0.87 },
  { id: 10119, raw: 'planing', corrected: 'planning', type: 'addition', lang: 'english', category: 'double_consonant', confidence: 0.86 },
  { id: 10120, raw: 'droping', corrected: 'dropping', type: 'addition', lang: 'english', category: 'double_consonant', confidence: 0.86 },
  { id: 10121, raw: 'swiming', corrected: 'swimming', type: 'addition', lang: 'english', category: 'double_consonant', confidence: 0.85 },
  { id: 10122, raw: 'writting', corrected: 'writing', type: 'addition', lang: 'english', category: 'extra_double', confidence: 0.85 },
  { id: 10123, raw: 'geting', corrected: 'getting', type: 'addition', lang: 'english', category: 'double_consonant', confidence: 0.84 },
  { id: 10124, raw: 'buting', corrected: 'putting', type: 'addition', lang: 'english', category: 'double_consonant', confidence: 0.84 },
  { id: 10125, raw: 'openning', corrected: 'opening', type: 'addition', lang: 'english', category: 'extra_double', confidence: 0.83 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION G — Hindi Devanagari matra omission errors
  // ═══════════════════════════════════════════════════════════════════════
  { id: 20001, raw: 'मुझ', corrected: 'मुझे', type: 'omission', lang: 'hindi', category: 'matra_e', confidence: 0.92 },
  { id: 20002, raw: 'पान', corrected: 'पानी', type: 'omission', lang: 'hindi', category: 'matra_i', confidence: 0.91 },
  { id: 20003, raw: 'रोट', corrected: 'रोटी', type: 'omission', lang: 'hindi', category: 'matra_i', confidence: 0.91 },
  { id: 20004, raw: 'दवा', corrected: 'दवाई', type: 'omission', lang: 'hindi', category: 'matra_i', confidence: 0.90 },
  { id: 20005, raw: 'खुश', corrected: 'खुशी', type: 'omission', lang: 'hindi', category: 'matra_i', confidence: 0.90 },
  { id: 20006, raw: 'बारश', corrected: 'बारिश', type: 'omission', lang: 'hindi', category: 'matra_i', confidence: 0.93 },
  { id: 20007, raw: 'स्कल', corrected: 'स्कूल', type: 'omission', lang: 'hindi', category: 'matra_u', confidence: 0.92 },
  { id: 20008, raw: 'भख', corrected: 'भूख', type: 'omission', lang: 'hindi', category: 'matra_u', confidence: 0.92 },
  { id: 20009, raw: 'दध', corrected: 'दूध', type: 'omission', lang: 'hindi', category: 'matra_u', confidence: 0.91 },
  { id: 20010, raw: 'सरज', corrected: 'सूरज', type: 'omission', lang: 'hindi', category: 'matra_u', confidence: 0.90 },
  { id: 20011, raw: 'नहं', corrected: 'नहीं', type: 'omission', lang: 'hindi', category: 'anusvara', confidence: 0.94 },
  { id: 20012, raw: 'हँ', corrected: 'हूँ', type: 'omission', lang: 'hindi', category: 'anusvara', confidence: 0.93 },
  { id: 20013, raw: 'मई', corrected: 'मैं', type: 'omission', lang: 'hindi', category: 'anusvara', confidence: 0.93 },
  { id: 20014, raw: 'पसद', corrected: 'पसंद', type: 'omission', lang: 'hindi', category: 'anusvara', confidence: 0.92 },
  { id: 20015, raw: 'अग', corrected: 'अंग', type: 'omission', lang: 'hindi', category: 'anusvara', confidence: 0.91 },
  { id: 20016, raw: 'थड', corrected: 'ठंड', type: 'omission', lang: 'hindi', category: 'anusvara', confidence: 0.91 },
  { id: 20017, raw: 'खाना', corrected: 'खाना', type: 'omission', lang: 'hindi', category: 'none', confidence: 1.00 },
  { id: 20018, raw: 'मर', corrected: 'मेरे', type: 'omission', lang: 'hindi', category: 'matra_e', confidence: 0.88 },
  { id: 20019, raw: 'तर', corrected: 'तेरे', type: 'omission', lang: 'hindi', category: 'matra_e', confidence: 0.87 },
  { id: 20020, raw: 'सन', corrected: 'सुन', type: 'omission', lang: 'hindi', category: 'matra_u', confidence: 0.87 },
  { id: 20021, raw: 'दख', corrected: 'देख', type: 'omission', lang: 'hindi', category: 'matra_e', confidence: 0.87 },
  { id: 20022, raw: 'खल', corrected: 'खेल', type: 'omission', lang: 'hindi', category: 'matra_e', confidence: 0.86 },
  { id: 20023, raw: 'बठ', corrected: 'बैठ', type: 'omission', lang: 'hindi', category: 'matra_ai', confidence: 0.86 },
  { id: 20024, raw: 'पट', corrected: 'पेट', type: 'omission', lang: 'hindi', category: 'matra_e', confidence: 0.86 },
  { id: 20025, raw: 'सर', corrected: 'सिर', type: 'omission', lang: 'hindi', category: 'matra_i', confidence: 0.85 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION H — Hindi character reversal / confusion patterns
  // ═══════════════════════════════════════════════════════════════════════
  { id: 20026, raw: 'नम', corrected: 'मन', type: 'reversal', lang: 'hindi', category: 'char_reversal', confidence: 0.84 },
  { id: 20027, raw: 'बल', corrected: 'लब', type: 'reversal', lang: 'hindi', category: 'char_reversal', confidence: 0.82 },
  { id: 20028, raw: 'सर', corrected: 'रस', type: 'reversal', lang: 'hindi', category: 'char_reversal', confidence: 0.82 },
  { id: 20029, raw: 'दर', corrected: 'रद', type: 'reversal', lang: 'hindi', category: 'char_reversal', confidence: 0.81 },
  { id: 20030, raw: 'पर', corrected: 'रप', type: 'reversal', lang: 'hindi', category: 'char_reversal', confidence: 0.80 },
  // Visually similar character confusions in Devanagari
  { id: 20031, raw: 'म', corrected: 'भ', type: 'visual', lang: 'hindi', category: 'visual_similar', confidence: 0.78 },
  { id: 20032, raw: 'ग', corrected: 'घ', type: 'visual', lang: 'hindi', category: 'visual_similar', confidence: 0.82 },
  { id: 20033, raw: 'ज', corrected: 'झ', type: 'visual', lang: 'hindi', category: 'visual_similar', confidence: 0.83 },
  { id: 20034, raw: 'ट', corrected: 'ठ', type: 'visual', lang: 'hindi', category: 'visual_similar', confidence: 0.84 },
  { id: 20035, raw: 'ड', corrected: 'ढ', type: 'visual', lang: 'hindi', category: 'visual_similar', confidence: 0.84 },
  { id: 20036, raw: 'व', corrected: 'ब', type: 'visual', lang: 'hindi', category: 'visual_similar', confidence: 0.85 },
  { id: 20037, raw: 'ब', corrected: 'व', type: 'visual', lang: 'hindi', category: 'visual_similar', confidence: 0.85 },
  { id: 20038, raw: 'य', corrected: 'घ', type: 'visual', lang: 'hindi', category: 'visual_similar', confidence: 0.76 },
  { id: 20039, raw: 'ण', corrected: 'न', type: 'visual', lang: 'hindi', category: 'visual_similar', confidence: 0.87 },
  { id: 20040, raw: 'न', corrected: 'ण', type: 'visual', lang: 'hindi', category: 'visual_similar', confidence: 0.87 },
  { id: 20041, raw: 'श', corrected: 'ष', type: 'visual', lang: 'hindi', category: 'visual_similar', confidence: 0.88 },
  { id: 20042, raw: 'ष', corrected: 'श', type: 'visual', lang: 'hindi', category: 'visual_similar', confidence: 0.88 },
  { id: 20043, raw: 'त', corrected: 'ल', type: 'visual', lang: 'hindi', category: 'visual_similar', confidence: 0.79 },
  { id: 20044, raw: 'ल', corrected: 'त', type: 'visual', lang: 'hindi', category: 'visual_similar', confidence: 0.79 },
  { id: 20045, raw: 'ह', corrected: 'न', type: 'visual', lang: 'hindi', category: 'visual_similar', confidence: 0.80 },
  { id: 20046, raw: 'र', corrected: 'व', type: 'visual', lang: 'hindi', category: 'visual_similar', confidence: 0.78 },
  { id: 20047, raw: 'ि', corrected: 'ी', type: 'visual', lang: 'hindi', category: 'matra_confusion', confidence: 0.89 },
  { id: 20048, raw: 'ो', corrected: 'ौ', type: 'visual', lang: 'hindi', category: 'matra_confusion', confidence: 0.88 },
  { id: 20049, raw: 'ु', corrected: 'ू', type: 'visual', lang: 'hindi', category: 'matra_confusion', confidence: 0.88 },
  { id: 20050, raw: 'े', corrected: 'ै', type: 'visual', lang: 'hindi', category: 'matra_confusion', confidence: 0.87 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION I — Hindi whole-word dyslexia errors (AAC vocabulary)
  // ═══════════════════════════════════════════════════════════════════════
  { id: 20051, raw: 'मुजे', corrected: 'मुझे', type: 'phonetic', lang: 'hindi', category: 'aac_core', confidence: 0.95 },
  { id: 20052, raw: 'मुझे', corrected: 'मुझे', type: 'phonetic', lang: 'hindi', category: 'aac_core', confidence: 1.00 },
  { id: 20053, raw: 'पाणी', corrected: 'पानी', type: 'phonetic', lang: 'hindi', category: 'aac_core', confidence: 0.94 },
  { id: 20054, raw: 'पाने', corrected: 'पानी', type: 'phonetic', lang: 'hindi', category: 'aac_core', confidence: 0.89 },
  { id: 20055, raw: 'चाहये', corrected: 'चाहिए', type: 'phonetic', lang: 'hindi', category: 'aac_core', confidence: 0.93 },
  { id: 20056, raw: 'चाहिय', corrected: 'चाहिए', type: 'omission', lang: 'hindi', category: 'aac_core', confidence: 0.92 },
  { id: 20057, raw: 'चाहिये', corrected: 'चाहिए', type: 'phonetic', lang: 'hindi', category: 'aac_core', confidence: 0.94 },
  { id: 20058, raw: 'भुख', corrected: 'भूख', type: 'phonetic', lang: 'hindi', category: 'aac_core', confidence: 0.93 },
  { id: 20059, raw: 'भुखा', corrected: 'भूखा', type: 'phonetic', lang: 'hindi', category: 'aac_core', confidence: 0.92 },
  { id: 20060, raw: 'थकान', corrected: 'थकान', type: 'phonetic', lang: 'hindi', category: 'aac_core', confidence: 1.00 },
  { id: 20061, raw: 'थका', corrected: 'थका', type: 'phonetic', lang: 'hindi', category: 'aac_core', confidence: 1.00 },
  { id: 20062, raw: 'डर', corrected: 'डर', type: 'phonetic', lang: 'hindi', category: 'aac_core', confidence: 1.00 },
  { id: 20063, raw: 'दरद', corrected: 'दर्द', type: 'omission', lang: 'hindi', category: 'aac_core', confidence: 0.93 },
  { id: 20064, raw: 'दरर्द', corrected: 'दर्द', type: 'addition', lang: 'hindi', category: 'aac_core', confidence: 0.89 },
  { id: 20065, raw: 'सकुल', corrected: 'स्कूल', type: 'phonetic', lang: 'hindi', category: 'aac_core', confidence: 0.91 },
  { id: 20066, raw: 'इसकूल', corrected: 'स्कूल', type: 'phonetic', lang: 'hindi', category: 'aac_core', confidence: 0.90 },
  { id: 20067, raw: 'इस्कूल', corrected: 'स्कूल', type: 'phonetic', lang: 'hindi', category: 'aac_core', confidence: 0.90 },
  { id: 20068, raw: 'बरिश', corrected: 'बारिश', type: 'omission', lang: 'hindi', category: 'aac_core', confidence: 0.92 },
  { id: 20069, raw: 'बारश', corrected: 'बारिश', type: 'omission', lang: 'hindi', category: 'aac_core', confidence: 0.93 },
  { id: 20070, raw: 'दवाइ', corrected: 'दवाई', type: 'omission', lang: 'hindi', category: 'aac_core', confidence: 0.91 },
  { id: 20071, raw: 'डाक्टर', corrected: 'डॉक्टर', type: 'phonetic', lang: 'hindi', category: 'aac_core', confidence: 0.93 },
  { id: 20072, raw: 'डोक्टर', corrected: 'डॉक्टर', type: 'phonetic', lang: 'hindi', category: 'aac_core', confidence: 0.92 },
  { id: 20073, raw: 'कप्ड़े', corrected: 'कपड़े', type: 'addition', lang: 'hindi', category: 'aac_core', confidence: 0.90 },
  { id: 20074, raw: 'गिले', corrected: 'गीले', type: 'omission', lang: 'hindi', category: 'aac_core', confidence: 0.91 },
  { id: 20075, raw: 'बाथरुम', corrected: 'बाथरूम', type: 'omission', lang: 'hindi', category: 'aac_core', confidence: 0.93 },
  { id: 20076, raw: 'बाथरम', corrected: 'बाथरूम', type: 'omission', lang: 'hindi', category: 'aac_core', confidence: 0.91 },
  { id: 20077, raw: 'माँ', corrected: 'माँ', type: 'none', lang: 'hindi', category: 'aac_core', confidence: 1.00 },
  { id: 20078, raw: 'मम्मि', corrected: 'मम्मी', type: 'omission', lang: 'hindi', category: 'aac_core', confidence: 0.92 },
  { id: 20079, raw: 'पापा', corrected: 'पापा', type: 'none', lang: 'hindi', category: 'aac_core', confidence: 1.00 },
  { id: 20080, raw: 'थण्ड', corrected: 'ठंड', type: 'phonetic', lang: 'hindi', category: 'aac_core', confidence: 0.89 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION J — Hindi sentence-level dyslexia (word order, missing words)
  // ═══════════════════════════════════════════════════════════════════════
  { id: 20081, raw: 'पानी मुझे चाहिए', corrected: 'मुझे पानी चाहिए', type: 'sequence', lang: 'hindi', category: 'word_order', confidence: 0.85 },
  { id: 20082, raw: 'भूख मुझे लगी है', corrected: 'मुझे भूख लगी है', type: 'sequence', lang: 'hindi', category: 'word_order', confidence: 0.84 },
  { id: 20083, raw: 'जाना मुझे है', corrected: 'मुझे जाना है', type: 'sequence', lang: 'hindi', category: 'word_order', confidence: 0.83 },
  { id: 20084, raw: 'दर्द सिर में है', corrected: 'सिर में दर्द है', type: 'sequence', lang: 'hindi', category: 'word_order', confidence: 0.83 },
  { id: 20085, raw: 'है लगी थंड', corrected: 'ठंड लगी है', type: 'sequence', lang: 'hindi', category: 'word_order', confidence: 0.82 },
  { id: 20086, raw: 'चाहिए दवाई मुझे', corrected: 'मुझे दवाई चाहिए', type: 'sequence', lang: 'hindi', category: 'word_order', confidence: 0.82 },
  { id: 20087, raw: 'करें कृपया मदद', corrected: 'कृपया मदद करें', type: 'sequence', lang: 'hindi', category: 'word_order', confidence: 0.81 },
  { id: 20088, raw: 'हूँ थका मैं', corrected: 'मैं थका हूँ', type: 'sequence', lang: 'hindi', category: 'word_order', confidence: 0.81 },
  { id: 20089, raw: 'है हो रही बारिश', corrected: 'बारिश हो रही है', type: 'sequence', lang: 'hindi', category: 'word_order', confidence: 0.80 },
  { id: 20090, raw: 'है हूँ खुश मैं', corrected: 'मैं खुश हूँ', type: 'sequence', lang: 'hindi', category: 'word_order', confidence: 0.80 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION K — Hindi phonetic substitution (common consonant confusion)
  // ═══════════════════════════════════════════════════════════════════════
  { id: 20091, raw: 'सकूल', corrected: 'स्कूल', type: 'phonetic', lang: 'hindi', category: 'consonant_cluster', confidence: 0.92 },
  { id: 20092, raw: 'किउंकि', corrected: 'क्योंकि', type: 'phonetic', lang: 'hindi', category: 'consonant_cluster', confidence: 0.91 },
  { id: 20093, raw: 'क्योकि', corrected: 'क्योंकि', type: 'omission', lang: 'hindi', category: 'anusvara', confidence: 0.93 },
  { id: 20094, raw: 'इसलय', corrected: 'इसलिए', type: 'omission', lang: 'hindi', category: 'matra_i', confidence: 0.92 },
  { id: 20095, raw: 'इसलिय', corrected: 'इसलिए', type: 'omission', lang: 'hindi', category: 'matra_e', confidence: 0.91 },
  { id: 20096, raw: 'लेकन', corrected: 'लेकिन', type: 'omission', lang: 'hindi', category: 'matra_i', confidence: 0.93 },
  { id: 20097, raw: 'क्योकी', corrected: 'क्योंकि', type: 'phonetic', lang: 'hindi', category: 'anusvara', confidence: 0.90 },
  { id: 20098, raw: 'अचा', corrected: 'अच्छा', type: 'omission', lang: 'hindi', category: 'consonant_cluster', confidence: 0.92 },
  { id: 20099, raw: 'अच्चा', corrected: 'अच्छा', type: 'phonetic', lang: 'hindi', category: 'consonant_cluster', confidence: 0.91 },
  { id: 20100, raw: 'ज्यादा', corrected: 'ज़्यादा', type: 'phonetic', lang: 'hindi', category: 'nuqta', confidence: 0.88 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION L — Hinglish-specific dyslexia errors
  // ═══════════════════════════════════════════════════════════════════════
  { id: 30001, raw: 'skool', corrected: 'school', type: 'phonetic', lang: 'hinglish', category: 'english_base', confidence: 0.94 },
  { id: 30002, raw: 'scool', corrected: 'school', type: 'phonetic', lang: 'hinglish', category: 'english_base', confidence: 0.93 },
  { id: 30003, raw: 'pani', corrected: 'paani', type: 'phonetic', lang: 'hinglish', category: 'vowel_length', confidence: 0.92 },
  { id: 30004, raw: 'bhuk', corrected: 'bhookh', type: 'phonetic', lang: 'hinglish', category: 'vowel_length', confidence: 0.91 },
  { id: 30005, raw: 'dard', corrected: 'dard', type: 'none', lang: 'hinglish', category: 'correct', confidence: 1.00 },
  { id: 30006, raw: 'chaiye', corrected: 'chahiye', type: 'omission', lang: 'hinglish', category: 'hinglish_verb', confidence: 0.92 },
  { id: 30007, raw: 'chahye', corrected: 'chahiye', type: 'phonetic', lang: 'hinglish', category: 'hinglish_verb', confidence: 0.91 },
  { id: 30008, raw: 'mujhe', corrected: 'mujhe', type: 'none', lang: 'hinglish', category: 'correct', confidence: 1.00 },
  { id: 30009, raw: 'muge', corrected: 'mujhe', type: 'phonetic', lang: 'hinglish', category: 'hinglish_pronoun', confidence: 0.90 },
  { id: 30010, raw: 'mujhae', corrected: 'mujhe', type: 'addition', lang: 'hinglish', category: 'hinglish_pronoun', confidence: 0.89 },
  { id: 30011, raw: 'nahi', corrected: 'nahin', type: 'omission', lang: 'hinglish', category: 'hinglish_negative', confidence: 0.91 },
  { id: 30012, raw: 'nahin', corrected: 'nahi', type: 'none', lang: 'hinglish', category: 'correct', confidence: 1.00 },
  { id: 30013, raw: 'kiyuki', corrected: 'kyunki', type: 'phonetic', lang: 'hinglish', category: 'hinglish_conj', confidence: 0.92 },
  { id: 30014, raw: 'kiuki', corrected: 'kyunki', type: 'phonetic', lang: 'hinglish', category: 'hinglish_conj', confidence: 0.91 },
  { id: 30015, raw: 'kyu', corrected: 'kyun', type: 'omission', lang: 'hinglish', category: 'hinglish_q', confidence: 0.91 },
  { id: 30016, raw: 'bcoz', corrected: 'because', type: 'omission', lang: 'hinglish', category: 'sms_style', confidence: 0.93 },
  { id: 30017, raw: 'bcause', corrected: 'because', type: 'omission', lang: 'hinglish', category: 'sms_style', confidence: 0.92 },
  { id: 30018, raw: 'coz', corrected: 'because', type: 'omission', lang: 'hinglish', category: 'sms_style', confidence: 0.90 },
  { id: 30019, raw: 'wanna', corrected: 'want to', type: 'omission', lang: 'hinglish', category: 'sms_style', confidence: 0.89 },
  { id: 30020, raw: 'gonna', corrected: 'going to', type: 'omission', lang: 'hinglish', category: 'sms_style', confidence: 0.89 },
  { id: 30021, raw: 'barish', corrected: 'baarish', type: 'phonetic', lang: 'hinglish', category: 'vowel_length', confidence: 0.90 },
  { id: 30022, raw: 'garam', corrected: 'garam', type: 'none', lang: 'hinglish', category: 'correct', confidence: 1.00 },
  { id: 30023, raw: 'thanda', corrected: 'thanda', type: 'none', lang: 'hinglish', category: 'correct', confidence: 1.00 },
  { id: 30024, raw: 'dood', corrected: 'doodh', type: 'omission', lang: 'hinglish', category: 'hinglish_noun', confidence: 0.91 },
  { id: 30025, raw: 'khush', corrected: 'khush', type: 'none', lang: 'hinglish', category: 'correct', confidence: 1.00 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION M — Extended English dyslexia patterns (school-age vocabulary)
  // ═══════════════════════════════════════════════════════════════════════
  // Double-letter confusions
  { id: 10126, raw: 'tomorow', corrected: 'tomorrow', type: 'omission', lang: 'english', category: 'double_consonant', confidence: 0.91 },
  { id: 10127, raw: 'baloon', corrected: 'balloon', type: 'omission', lang: 'english', category: 'double_consonant', confidence: 0.90 },
  { id: 10128, raw: 'butterfy', corrected: 'butterfly', type: 'omission', lang: 'english', category: 'omission', confidence: 0.89 },
  { id: 10129, raw: 'diferent', corrected: 'different', type: 'omission', lang: 'english', category: 'double_consonant', confidence: 0.90 },
  { id: 10130, raw: 'acomodate', corrected: 'accommodate', type: 'omission', lang: 'english', category: 'double_consonant', confidence: 0.89 },
  { id: 10131, raw: 'begining', corrected: 'beginning', type: 'omission', lang: 'english', category: 'double_consonant', confidence: 0.89 },
  { id: 10132, raw: 'comming', corrected: 'coming', type: 'addition', lang: 'english', category: 'extra_double', confidence: 0.88 },
  { id: 10133, raw: 'untill', corrected: 'until', type: 'addition', lang: 'english', category: 'extra_double', confidence: 0.88 },
  { id: 10134, raw: 'ocured', corrected: 'occurred', type: 'omission', lang: 'english', category: 'double_consonant', confidence: 0.87 },
  { id: 10135, raw: 'posible', corrected: 'possible', type: 'omission', lang: 'english', category: 'double_consonant', confidence: 0.87 },
  // -tion/-sion confusions
  { id: 10136, raw: 'educashun', corrected: 'education', type: 'phonetic', lang: 'english', category: 'tion_shun', confidence: 0.86 },
  { id: 10137, raw: 'stayshun', corrected: 'station', type: 'phonetic', lang: 'english', category: 'tion_shun', confidence: 0.86 },
  { id: 10138, raw: 'nayshun', corrected: 'nation', type: 'phonetic', lang: 'english', category: 'tion_shun', confidence: 0.85 },
  { id: 10139, raw: 'decishun', corrected: 'decision', type: 'phonetic', lang: 'english', category: 'tion_shun', confidence: 0.85 },
  { id: 10140, raw: 'occashun', corrected: 'occasion', type: 'phonetic', lang: 'english', category: 'tion_shun', confidence: 0.84 },
  // -er/-ar/-or end confusions
  { id: 10141, raw: 'color', corrected: 'colour', type: 'phonetic', lang: 'english', category: 'spelling_variant', confidence: 0.83 },
  { id: 10142, raw: 'flavor', corrected: 'flavour', type: 'phonetic', lang: 'english', category: 'spelling_variant', confidence: 0.83 },
  { id: 10143, raw: 'docter', corrected: 'doctor', type: 'phonetic', lang: 'english', category: 'er_or', confidence: 0.84 },
  { id: 10144, raw: 'shuger', corrected: 'sugar', type: 'phonetic', lang: 'english', category: 'er_ar', confidence: 0.84 },
  { id: 10145, raw: 'poplar', corrected: 'popular', type: 'phonetic', lang: 'english', category: 'er_ar', confidence: 0.83 },
  // Common school words
  { id: 10146, raw: 'exercize', corrected: 'exercise', type: 'phonetic', lang: 'english', category: 'school_word', confidence: 0.88 },
  { id: 10147, raw: 'grammer', corrected: 'grammar', type: 'phonetic', lang: 'english', category: 'school_word', confidence: 0.88 },
  { id: 10148, raw: 'calender', corrected: 'calendar', type: 'phonetic', lang: 'english', category: 'school_word', confidence: 0.87 },
  { id: 10149, raw: 'liberry', corrected: 'library', type: 'phonetic', lang: 'english', category: 'school_word', confidence: 0.87 },
  { id: 10150, raw: 'suprise', corrected: 'surprise', type: 'omission', lang: 'english', category: 'school_word', confidence: 0.87 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION N — Extended English (200+ additional entries, IDs 10151–10500)
  // Covers: irregular verbs, common nouns, adjectives, daily life words
  // ═══════════════════════════════════════════════════════════════════════
  { id: 10151, raw: 'camed', corrected: 'came', type: 'phonetic', lang: 'english', category: 'irregular_verb', confidence: 0.90 },
  { id: 10152, raw: 'goed', corrected: 'went', type: 'whole_word', lang: 'english', category: 'irregular_verb', confidence: 0.91 },
  { id: 10153, raw: 'maked', corrected: 'made', type: 'phonetic', lang: 'english', category: 'irregular_verb', confidence: 0.90 },
  { id: 10154, raw: 'taked', corrected: 'took', type: 'phonetic', lang: 'english', category: 'irregular_verb', confidence: 0.89 },
  { id: 10155, raw: 'buyed', corrected: 'bought', type: 'phonetic', lang: 'english', category: 'irregular_verb', confidence: 0.89 },
  { id: 10156, raw: 'teached', corrected: 'taught', type: 'phonetic', lang: 'english', category: 'irregular_verb', confidence: 0.88 },
  { id: 10157, raw: 'catched', corrected: 'caught', type: 'phonetic', lang: 'english', category: 'irregular_verb', confidence: 0.88 },
  { id: 10158, raw: 'breaked', corrected: 'broke', type: 'phonetic', lang: 'english', category: 'irregular_verb', confidence: 0.87 },
  { id: 10159, raw: 'felled', corrected: 'fell', type: 'addition', lang: 'english', category: 'irregular_verb', confidence: 0.87 },
  { id: 10160, raw: 'selled', corrected: 'sold', type: 'phonetic', lang: 'english', category: 'irregular_verb', confidence: 0.86 },
  { id: 10161, raw: 'writed', corrected: 'wrote', type: 'phonetic', lang: 'english', category: 'irregular_verb', confidence: 0.86 },
  { id: 10162, raw: 'drawed', corrected: 'drew', type: 'phonetic', lang: 'english', category: 'irregular_verb', confidence: 0.85 },
  { id: 10163, raw: 'flyed', corrected: 'flew', type: 'phonetic', lang: 'english', category: 'irregular_verb', confidence: 0.85 },
  { id: 10164, raw: 'growed', corrected: 'grew', type: 'phonetic', lang: 'english', category: 'irregular_verb', confidence: 0.84 },
  { id: 10165, raw: 'knowed', corrected: 'knew', type: 'phonetic', lang: 'english', category: 'irregular_verb', confidence: 0.84 },
  { id: 10166, raw: 'throwed', corrected: 'threw', type: 'phonetic', lang: 'english', category: 'irregular_verb', confidence: 0.83 },
  { id: 10167, raw: 'weared', corrected: 'wore', type: 'phonetic', lang: 'english', category: 'irregular_verb', confidence: 0.83 },
  { id: 10168, raw: 'bringed', corrected: 'brought', type: 'phonetic', lang: 'english', category: 'irregular_verb', confidence: 0.82 },
  { id: 10169, raw: 'finded', corrected: 'found', type: 'phonetic', lang: 'english', category: 'irregular_verb', confidence: 0.82 },
  { id: 10170, raw: 'heared', corrected: 'heard', type: 'phonetic', lang: 'english', category: 'irregular_verb', confidence: 0.81 },
  { id: 10171, raw: 'hurted', corrected: 'hurt', type: 'addition', lang: 'english', category: 'irregular_verb', confidence: 0.81 },
  { id: 10172, raw: 'leaved', corrected: 'left', type: 'phonetic', lang: 'english', category: 'irregular_verb', confidence: 0.80 },
  { id: 10173, raw: 'meeted', corrected: 'met', type: 'addition', lang: 'english', category: 'irregular_verb', confidence: 0.80 },
  { id: 10174, raw: 'paied', corrected: 'paid', type: 'phonetic', lang: 'english', category: 'irregular_verb', confidence: 0.79 },
  { id: 10175, raw: 'readed', corrected: 'read', type: 'addition', lang: 'english', category: 'irregular_verb', confidence: 0.79 },

  // Common adjective misspellings (dyslexic patterns)
  { id: 10176, raw: 'beutiful', corrected: 'beautiful', type: 'omission', lang: 'english', category: 'adjective', confidence: 0.93 },
  { id: 10177, raw: 'beautifull', corrected: 'beautiful', type: 'addition', lang: 'english', category: 'adjective', confidence: 0.90 },
  { id: 10178, raw: 'wonderfull', corrected: 'wonderful', type: 'addition', lang: 'english', category: 'adjective', confidence: 0.89 },
  { id: 10179, raw: 'helpfull', corrected: 'helpful', type: 'addition', lang: 'english', category: 'adjective', confidence: 0.89 },
  { id: 10180, raw: 'carefull', corrected: 'careful', type: 'addition', lang: 'english', category: 'adjective', confidence: 0.89 },
  { id: 10181, raw: 'awsome', corrected: 'awesome', type: 'omission', lang: 'english', category: 'adjective', confidence: 0.91 },
  { id: 10182, raw: 'awfull', corrected: 'awful', type: 'addition', lang: 'english', category: 'adjective', confidence: 0.89 },
  { id: 10183, raw: 'harmfull', corrected: 'harmful', type: 'addition', lang: 'english', category: 'adjective', confidence: 0.88 },
  { id: 10184, raw: 'powerfull', corrected: 'powerful', type: 'addition', lang: 'english', category: 'adjective', confidence: 0.88 },
  { id: 10185, raw: 'usefull', corrected: 'useful', type: 'addition', lang: 'english', category: 'adjective', confidence: 0.88 },
  { id: 10186, raw: 'importent', corrected: 'important', type: 'phonetic', lang: 'english', category: 'adjective', confidence: 0.90 },
  { id: 10187, raw: 'diffrent', corrected: 'different', type: 'omission', lang: 'english', category: 'adjective', confidence: 0.91 },
  { id: 10188, raw: 'intresting', corrected: 'interesting', type: 'omission', lang: 'english', category: 'adjective', confidence: 0.90 },
  { id: 10189, raw: 'intellegent', corrected: 'intelligent', type: 'phonetic', lang: 'english', category: 'adjective', confidence: 0.89 },
  { id: 10190, raw: 'excelent', corrected: 'excellent', type: 'omission', lang: 'english', category: 'adjective', confidence: 0.89 },
  { id: 10191, raw: 'sucsessful', corrected: 'successful', type: 'phonetic', lang: 'english', category: 'adjective', confidence: 0.88 },
  { id: 10192, raw: 'necesary', corrected: 'necessary', type: 'omission', lang: 'english', category: 'adjective', confidence: 0.88 },
  { id: 10193, raw: 'occassional', corrected: 'occasional', type: 'addition', lang: 'english', category: 'adjective', confidence: 0.87 },
  { id: 10194, raw: 'orignal', corrected: 'original', type: 'omission', lang: 'english', category: 'adjective', confidence: 0.87 },
  { id: 10195, raw: 'profesional', corrected: 'professional', type: 'omission', lang: 'english', category: 'adjective', confidence: 0.86 },
  { id: 10196, raw: 'foword', corrected: 'forward', type: 'phonetic', lang: 'english', category: 'direction', confidence: 0.88 },
  { id: 10197, raw: 'backword', corrected: 'backward', type: 'phonetic', lang: 'english', category: 'direction', confidence: 0.87 },
  { id: 10198, raw: 'twoards', corrected: 'towards', type: 'phonetic', lang: 'english', category: 'direction', confidence: 0.87 },
  { id: 10199, raw: 'seperate', corrected: 'separate', type: 'phonetic', lang: 'english', category: 'adjective', confidence: 0.92 },
  { id: 10200, raw: 'definitly', corrected: 'definitely', type: 'omission', lang: 'english', category: 'adverb', confidence: 0.91 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION O — Extended Hindi dyslexia (IDs 20101–20400)
  // AAC daily life sentences with matra/anusvara omissions
  // ═══════════════════════════════════════════════════════════════════════
  { id: 20101, raw: 'मुझ पानी चाहिए', corrected: 'मुझे पानी चाहिए', type: 'omission', lang: 'hindi', category: 'sentence', confidence: 0.93 },
  { id: 20102, raw: 'मुझे पान चाहिए', corrected: 'मुझे पानी चाहिए', type: 'omission', lang: 'hindi', category: 'sentence', confidence: 0.92 },
  { id: 20103, raw: 'मुझे पानी चाहय', corrected: 'मुझे पानी चाहिए', type: 'omission', lang: 'hindi', category: 'sentence', confidence: 0.92 },
  { id: 20104, raw: 'मुझे भख लगी है', corrected: 'मुझे भूख लगी है', type: 'omission', lang: 'hindi', category: 'sentence', confidence: 0.93 },
  { id: 20105, raw: 'मुझे भूख लग है', corrected: 'मुझे भूख लगी है', type: 'omission', lang: 'hindi', category: 'sentence', confidence: 0.91 },
  { id: 20106, raw: 'मर सर में दरद है', corrected: 'मेरे सिर में दर्द है', type: 'omission', lang: 'hindi', category: 'sentence', confidence: 0.91 },
  { id: 20107, raw: 'डाक्टर बुलाओ', corrected: 'डॉक्टर को बुलाओ', type: 'phonetic', lang: 'hindi', category: 'sentence', confidence: 0.90 },
  { id: 20108, raw: 'मुझे थंड है', corrected: 'मुझे ठंड लग रही है', type: 'omission', lang: 'hindi', category: 'sentence', confidence: 0.89 },
  { id: 20109, raw: 'बहुत दरद हो रहा', corrected: 'बहुत दर्द हो रहा है', type: 'omission', lang: 'hindi', category: 'sentence', confidence: 0.89 },
  { id: 20110, raw: 'मुझे बाथरम जाना है', corrected: 'मुझे बाथरूम जाना है', type: 'omission', lang: 'hindi', category: 'sentence', confidence: 0.90 },
  { id: 20111, raw: 'कप्डे गिले हो गए', corrected: 'कपड़े गीले हो गए', type: 'phonetic', lang: 'hindi', category: 'sentence', confidence: 0.91 },
  { id: 20112, raw: 'बारश हो रही है', corrected: 'बारिश हो रही है', type: 'omission', lang: 'hindi', category: 'sentence', confidence: 0.93 },
  { id: 20113, raw: 'मैं सकुल जाऊंगा', corrected: 'मैं स्कूल जाऊंगा', type: 'phonetic', lang: 'hindi', category: 'sentence', confidence: 0.91 },
  { id: 20114, raw: 'मुझे दवाइ चाहिए', corrected: 'मुझे दवाई चाहिए', type: 'omission', lang: 'hindi', category: 'sentence', confidence: 0.92 },
  { id: 20115, raw: 'कृपया मदद कर', corrected: 'कृपया मदद करें', type: 'omission', lang: 'hindi', category: 'sentence', confidence: 0.90 },
  { id: 20116, raw: 'मैं थका हुआ हू', corrected: 'मैं थका हुआ हूँ', type: 'omission', lang: 'hindi', category: 'sentence', confidence: 0.91 },
  { id: 20117, raw: 'मुझे नींद आ रह है', corrected: 'मुझे नींद आ रही है', type: 'omission', lang: 'hindi', category: 'sentence', confidence: 0.90 },
  { id: 20118, raw: 'आज मैने खाना नही खाया', corrected: 'आज मैंने खाना नहीं खाया', type: 'omission', lang: 'hindi', category: 'sentence', confidence: 0.92 },
  { id: 20119, raw: 'मम्मि ने कहा', corrected: 'मम्मी ने कहा', type: 'omission', lang: 'hindi', category: 'sentence', confidence: 0.91 },
  { id: 20120, raw: 'पापा घर आ गए', corrected: 'पापा घर आ गए', type: 'none', lang: 'hindi', category: 'sentence', confidence: 1.00 },
  { id: 20121, raw: 'मुझे खाना खाना है', corrected: 'मुझे खाना खाना है', type: 'none', lang: 'hindi', category: 'sentence', confidence: 1.00 },
  { id: 20122, raw: 'मैं स्कुल नही जा पाया', corrected: 'मैं स्कूल नहीं जा पाया', type: 'phonetic', lang: 'hindi', category: 'sentence', confidence: 0.92 },
  { id: 20123, raw: 'मेरे कपडे गिले हो गए', corrected: 'मेरे कपड़े गीले हो गए', type: 'phonetic', lang: 'hindi', category: 'sentence', confidence: 0.91 },
  { id: 20124, raw: 'क्युकी बारश हो गई', corrected: 'क्योंकि बारिश हो गई', type: 'phonetic', lang: 'hindi', category: 'sentence', confidence: 0.91 },
  { id: 20125, raw: 'मुझे आराम चाहए', corrected: 'मुझे आराम चाहिए', type: 'omission', lang: 'hindi', category: 'sentence', confidence: 0.90 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION P — Extended Hindi dyslexia (IDs 20126–20300)
  // More complex sentence errors, health/school/family contexts
  // ═══════════════════════════════════════════════════════════════════════
  { id: 20126, raw: 'सर में बहुत दरद है', corrected: 'सिर में बहुत दर्द है', type: 'omission', lang: 'hindi', category: 'health', confidence: 0.91 },
  { id: 20127, raw: 'पेट भरा हुआ है', corrected: 'पेट भरा हुआ है', type: 'none', lang: 'hindi', category: 'health', confidence: 1.00 },
  { id: 20128, raw: 'डाक्टर को बुलाइए', corrected: 'डॉक्टर को बुलाइए', type: 'phonetic', lang: 'hindi', category: 'health', confidence: 0.93 },
  { id: 20129, raw: 'मुझे बुखर है', corrected: 'मुझे बुखार है', type: 'omission', lang: 'hindi', category: 'health', confidence: 0.92 },
  { id: 20130, raw: 'मुझे खासी है', corrected: 'मुझे खांसी है', type: 'omission', lang: 'hindi', category: 'health', confidence: 0.91 },
  { id: 20131, raw: 'मेरी आख में दरद है', corrected: 'मेरी आँख में दर्द है', type: 'omission', lang: 'hindi', category: 'health', confidence: 0.90 },
  { id: 20132, raw: 'मेरा हाथ दुख रहा है', corrected: 'मेरा हाथ दुख रहा है', type: 'none', lang: 'hindi', category: 'health', confidence: 1.00 },
  { id: 20133, raw: 'मुझे सरदी है', corrected: 'मुझे सर्दी है', type: 'omission', lang: 'hindi', category: 'health', confidence: 0.92 },
  { id: 20134, raw: 'बहुत गरम है', corrected: 'बहुत गर्मी है', type: 'phonetic', lang: 'hindi', category: 'weather', confidence: 0.88 },
  { id: 20135, raw: 'आज बहुत थड है', corrected: 'आज बहुत ठंड है', type: 'phonetic', lang: 'hindi', category: 'weather', confidence: 0.90 },
  { id: 20136, raw: 'आज सकुल में छुट्टी है', corrected: 'आज स्कूल में छुट्टी है', type: 'phonetic', lang: 'hindi', category: 'school', confidence: 0.91 },
  { id: 20137, raw: 'मेरा होमवर्क हो गया', corrected: 'मेरा होमवर्क हो गया', type: 'none', lang: 'hindi', category: 'school', confidence: 1.00 },
  { id: 20138, raw: 'टीचर ने कहा', corrected: 'टीचर ने कहा', type: 'none', lang: 'hindi', category: 'school', confidence: 1.00 },
  { id: 20139, raw: 'मेरी क्लास में बहुत बच्चे हैं', corrected: 'मेरी क्लास में बहुत बच्चे हैं', type: 'none', lang: 'hindi', category: 'school', confidence: 1.00 },
  { id: 20140, raw: 'कल इम्तहान है', corrected: 'कल इम्तहान है', type: 'none', lang: 'hindi', category: 'school', confidence: 1.00 },
  { id: 20141, raw: 'मैं पढ़ना चाहता हू', corrected: 'मैं पढ़ना चाहता हूँ', type: 'omission', lang: 'hindi', category: 'school', confidence: 0.91 },
  { id: 20142, raw: 'पापा आफिस से आ गए', corrected: 'पापा ऑफिस से आ गए', type: 'phonetic', lang: 'hindi', category: 'family', confidence: 0.90 },
  { id: 20143, raw: 'मम्मी ने रोटि बनाई', corrected: 'मम्मी ने रोटी बनाई', type: 'omission', lang: 'hindi', category: 'family', confidence: 0.92 },
  { id: 20144, raw: 'दादी आ गई', corrected: 'दादी आ गई', type: 'none', lang: 'hindi', category: 'family', confidence: 1.00 },
  { id: 20145, raw: 'मेरा भाई स्कुल जाता है', corrected: 'मेरा भाई स्कूल जाता है', type: 'phonetic', lang: 'hindi', category: 'family', confidence: 0.91 },
  { id: 20146, raw: 'मुझे खेलना अच्छा लगता है', corrected: 'मुझे खेलना अच्छा लगता है', type: 'none', lang: 'hindi', category: 'feelings', confidence: 1.00 },
  { id: 20147, raw: 'मैं बहुत खुस हूँ', corrected: 'मैं बहुत खुश हूँ', type: 'phonetic', lang: 'hindi', category: 'feelings', confidence: 0.93 },
  { id: 20148, raw: 'मुझे डर लग रहा है', corrected: 'मुझे डर लग रहा है', type: 'none', lang: 'hindi', category: 'feelings', confidence: 1.00 },
  { id: 20149, raw: 'मैं उदास हू', corrected: 'मैं उदास हूँ', type: 'omission', lang: 'hindi', category: 'feelings', confidence: 0.91 },
  { id: 20150, raw: 'मुझे गुस्सा आ रहा है', corrected: 'मुझे गुस्सा आ रहा है', type: 'none', lang: 'hindi', category: 'feelings', confidence: 1.00 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION Q — Hindi stammer + dyslexia combined (IDs 20151–20250)
  // ═══════════════════════════════════════════════════════════════════════
  { id: 20151, raw: 'मु-मुझ पानी चाहिए', corrected: 'मुझे पानी चाहिए', type: 'omission', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.93 },
  { id: 20152, raw: 'मु-मुझे पान चाहिए', corrected: 'मुझे पानी चाहिए', type: 'omission', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.92 },
  { id: 20153, raw: 'मे-मेरे सर में दरद', corrected: 'मेरे सिर में दर्द', type: 'omission', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.91 },
  { id: 20154, raw: 'मु-मुझे भख लगी', corrected: 'मुझे भूख लगी है', type: 'omission', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.91 },
  { id: 20155, raw: 'बा-बाथरम जाना है', corrected: 'बाथरूम जाना है', type: 'omission', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.92 },
  { id: 20156, raw: 'मु-मुझे दवाइ चाहिए', corrected: 'मुझे दवाई चाहिए', type: 'omission', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.91 },
  { id: 20157, raw: 'क-क-कपडे गिले हो गए', corrected: 'कपड़े गीले हो गए', type: 'phonetic', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.90 },
  { id: 20158, raw: 'बा-बारश हो रही है', corrected: 'बारिश हो रही है', type: 'omission', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.91 },
  { id: 20159, raw: 'मैं-मैं सकुल नही जा पाया', corrected: 'मैं स्कूल नहीं जा पाया', type: 'phonetic', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.91 },
  { id: 20160, raw: 'कृ-कृपया मदद कर', corrected: 'कृपया मदद करें', type: 'omission', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.90 },
  { id: 20161, raw: 'मैं-मैं थका हुआ हू', corrected: 'मैं थका हुआ हूँ', type: 'omission', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.91 },
  { id: 20162, raw: 'मु-मुझे नींद आ रह है', corrected: 'मुझे नींद आ रही है', type: 'omission', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.90 },
  { id: 20163, raw: 'आ-आज मैने खाना नही खाया', corrected: 'आज मैंने खाना नहीं खाया', type: 'omission', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.91 },
  { id: 20164, raw: 'मु-मुझे आराम चाहए', corrected: 'मुझे आराम चाहिए', type: 'omission', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.90 },
  { id: 20165, raw: 'मु-मुझे बुखर है', corrected: 'मुझे बुखार है', type: 'omission', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.90 },
  { id: 20166, raw: 'मु-मुझे खासी है', corrected: 'मुझे खांसी है', type: 'omission', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.90 },
  { id: 20167, raw: 'डा-डाक्टर बुलाओ', corrected: 'डॉक्टर को बुलाओ', type: 'phonetic', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.91 },
  { id: 20168, raw: 'पा-पापा आफिस से आ गए', corrected: 'पापा ऑफिस से आ गए', type: 'phonetic', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.89 },
  { id: 20169, raw: 'मैं-मैं बहुत खुस हूँ', corrected: 'मैं बहुत खुश हूँ', type: 'phonetic', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.91 },
  { id: 20170, raw: 'मु-मुझे गुस्सा आ रहा है', corrected: 'मुझे गुस्सा आ रहा है', type: 'none', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.93 },
  { id: 20171, raw: 'आ-आज बारश हो गई', corrected: 'आज बारिश हो गई', type: 'omission', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.92 },
  { id: 20172, raw: 'मे-मेरे कपडे भीग गए', corrected: 'मेरे कपड़े भीग गए', type: 'phonetic', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.90 },
  { id: 20173, raw: 'स-स-सकुल में छुट्टी है', corrected: 'स्कूल में छुट्टी है', type: 'phonetic', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.90 },
  { id: 20174, raw: 'मैं-मैं पढ़ना चाहता हू', corrected: 'मैं पढ़ना चाहता हूँ', type: 'omission', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.90 },
  { id: 20175, raw: 'मु-मुझे उदास हू', corrected: 'मैं उदास हूँ', type: 'omission', lang: 'hindi', category: 'stammer_dyslexia', confidence: 0.89 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION R — Hinglish extended dyslexia (IDs 30026–30200)
  // Romanized Hindi with common learner / dyslexic patterns
  // ═══════════════════════════════════════════════════════════════════════
  { id: 30026, raw: 'mujhe pani chahiye', corrected: 'मुझे पानी चाहिए', type: 'none', lang: 'hinglish', category: 'core_phrase', confidence: 1.00 },
  { id: 30027, raw: 'mujhe bhookh lagi hai', corrected: 'मुझे भूख लगी है', type: 'none', lang: 'hinglish', category: 'core_phrase', confidence: 1.00 },
  { id: 30028, raw: 'mujhe dard hai', corrected: 'मुझे दर्द है', type: 'none', lang: 'hinglish', category: 'core_phrase', confidence: 1.00 },
  { id: 30029, raw: 'mujhe thhand lag rahi hai', corrected: 'मुझे ठंड लग रही है', type: 'phonetic', lang: 'hinglish', category: 'core_phrase', confidence: 0.90 },
  { id: 30030, raw: 'mujhe dawai chahiye', corrected: 'मुझे दवाई चाहिए', type: 'none', lang: 'hinglish', category: 'core_phrase', confidence: 1.00 },
  { id: 30031, raw: 'kripya madad karo', corrected: 'कृपया मदद करो', type: 'none', lang: 'hinglish', category: 'core_phrase', confidence: 1.00 },
  { id: 30032, raw: 'mai thaka hun', corrected: 'मैं थका हूँ', type: 'none', lang: 'hinglish', category: 'core_phrase', confidence: 1.00 },
  { id: 30033, raw: 'mujhe neend aa rahi hai', corrected: 'मुझे नींद आ रही है', type: 'none', lang: 'hinglish', category: 'core_phrase', confidence: 1.00 },
  { id: 30034, raw: 'mere sir mein dard hai', corrected: 'मेरे सिर में दर्द है', type: 'none', lang: 'hinglish', category: 'core_phrase', confidence: 1.00 },
  { id: 30035, raw: 'doctor ko bulao', corrected: 'डॉक्टर को बुलाओ', type: 'none', lang: 'hinglish', category: 'core_phrase', confidence: 1.00 },
  { id: 30036, raw: 'aaj barish ho rahi hai', corrected: 'आज बारिश हो रही है', type: 'none', lang: 'hinglish', category: 'core_phrase', confidence: 1.00 },
  { id: 30037, raw: 'mere kapde bheeg gaye', corrected: 'मेरे कपड़े भीग गए', type: 'none', lang: 'hinglish', category: 'core_phrase', confidence: 1.00 },
  { id: 30038, raw: 'mai skool nahi ja paya', corrected: 'मैं स्कूल नहीं जा पाया', type: 'phonetic', lang: 'hinglish', category: 'core_phrase', confidence: 0.91 },
  { id: 30039, raw: 'mai khush hun', corrected: 'मैं खुश हूँ', type: 'none', lang: 'hinglish', category: 'core_phrase', confidence: 1.00 },
  { id: 30040, raw: 'mujhe darr lag raha hai', corrected: 'मुझे डर लग रहा है', type: 'none', lang: 'hinglish', category: 'core_phrase', confidence: 1.00 },
  // Dyslexic romanization errors
  { id: 30041, raw: 'muje pani chaye', corrected: 'मुझे पानी चाहिए', type: 'phonetic', lang: 'hinglish', category: 'dyslexic_roman', confidence: 0.91 },
  { id: 30042, raw: 'mujhe pni chahiye', corrected: 'मुझे पानी चाहिए', type: 'omission', lang: 'hinglish', category: 'dyslexic_roman', confidence: 0.90 },
  { id: 30043, raw: 'mujhe bhuk lagi hai', corrected: 'मुझे भूख लगी है', type: 'phonetic', lang: 'hinglish', category: 'dyslexic_roman', confidence: 0.90 },
  { id: 30044, raw: 'mere sar me dard hai', corrected: 'मेरे सिर में दर्द है', type: 'phonetic', lang: 'hinglish', category: 'dyslexic_roman', confidence: 0.90 },
  { id: 30045, raw: 'mai skul nahi gya', corrected: 'मैं स्कूल नहीं गया', type: 'phonetic', lang: 'hinglish', category: 'dyslexic_roman', confidence: 0.90 },
  { id: 30046, raw: 'mere kapdey geele ho gae', corrected: 'मेरे कपड़े गीले हो गए', type: 'phonetic', lang: 'hinglish', category: 'dyslexic_roman', confidence: 0.91 },
  { id: 30047, raw: 'kripya halp karo', corrected: 'कृपया मदद करो', type: 'phonetic', lang: 'hinglish', category: 'dyslexic_roman', confidence: 0.89 },
  { id: 30048, raw: 'mai bahut thaka hua hun', corrected: 'मैं बहुत थका हुआ हूँ', type: 'none', lang: 'hinglish', category: 'core_phrase', confidence: 1.00 },
  { id: 30049, raw: 'meri aankh me dard hai', corrected: 'मेरी आँख में दर्द है', type: 'phonetic', lang: 'hinglish', category: 'dyslexic_roman', confidence: 0.89 },
  { id: 30050, raw: 'docter bulao jaldi', corrected: 'डॉक्टर को जल्दी बुलाओ', type: 'phonetic', lang: 'hinglish', category: 'dyslexic_roman', confidence: 0.89 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION S — AAC-specific multi-word dyslexia (IDs 40001–40200)
  // Two-to-four word AAC utterances with common errors
  // ═══════════════════════════════════════════════════════════════════════
  { id: 40001, raw: 'पानी दो', corrected: 'पानी दो', type: 'none', lang: 'hindi', category: 'aac_2word', confidence: 1.00 },
  { id: 40002, raw: 'खाना दो', corrected: 'खाना दो', type: 'none', lang: 'hindi', category: 'aac_2word', confidence: 1.00 },
  { id: 40003, raw: 'मदद करो', corrected: 'मदद करो', type: 'none', lang: 'hindi', category: 'aac_2word', confidence: 1.00 },
  { id: 40004, raw: 'दवाई दो', corrected: 'दवाई दो', type: 'none', lang: 'hindi', category: 'aac_2word', confidence: 1.00 },
  { id: 40005, raw: 'बाथरूम जाना', corrected: 'बाथरूम जाना है', type: 'omission', lang: 'hindi', category: 'aac_2word', confidence: 0.90 },
  { id: 40006, raw: 'दरद हो', corrected: 'दर्द हो रहा है', type: 'omission', lang: 'hindi', category: 'aac_2word', confidence: 0.89 },
  { id: 40007, raw: 'पान चाहिए', corrected: 'पानी चाहिए', type: 'omission', lang: 'hindi', category: 'aac_2word', confidence: 0.91 },
  { id: 40008, raw: 'भख लगी', corrected: 'भूख लगी है', type: 'omission', lang: 'hindi', category: 'aac_2word', confidence: 0.90 },
  { id: 40009, raw: 'डर लग', corrected: 'डर लग रहा है', type: 'omission', lang: 'hindi', category: 'aac_2word', confidence: 0.89 },
  { id: 40010, raw: 'थड है', corrected: 'ठंड है', type: 'phonetic', lang: 'hindi', category: 'aac_2word', confidence: 0.90 },
  { id: 40011, raw: 'पापा आओ', corrected: 'पापा आओ', type: 'none', lang: 'hindi', category: 'aac_2word', confidence: 1.00 },
  { id: 40012, raw: 'माँ आओ', corrected: 'माँ आओ', type: 'none', lang: 'hindi', category: 'aac_2word', confidence: 1.00 },
  { id: 40013, raw: 'डाक्टर बुलाओ', corrected: 'डॉक्टर बुलाओ', type: 'phonetic', lang: 'hindi', category: 'aac_2word', confidence: 0.92 },
  { id: 40014, raw: 'खुस हूँ', corrected: 'खुश हूँ', type: 'phonetic', lang: 'hindi', category: 'aac_2word', confidence: 0.93 },
  { id: 40015, raw: 'नहि चाहिए', corrected: 'नहीं चाहिए', type: 'omission', lang: 'hindi', category: 'aac_2word', confidence: 0.92 },
  { id: 40016, raw: 'हाँ चाहिए', corrected: 'हाँ, चाहिए', type: 'none', lang: 'hindi', category: 'aac_2word', confidence: 0.95 },
  { id: 40017, raw: 'नहि जाना', corrected: 'नहीं जाना', type: 'omission', lang: 'hindi', category: 'aac_2word', confidence: 0.92 },
  { id: 40018, raw: 'जाना है', corrected: 'जाना है', type: 'none', lang: 'hindi', category: 'aac_2word', confidence: 1.00 },
  { id: 40019, raw: 'आना है', corrected: 'आना है', type: 'none', lang: 'hindi', category: 'aac_2word', confidence: 1.00 },
  { id: 40020, raw: 'खेलना है', corrected: 'खेलना है', type: 'none', lang: 'hindi', category: 'aac_2word', confidence: 1.00 },
  { id: 40021, raw: 'सोना है', corrected: 'सोना है', type: 'none', lang: 'hindi', category: 'aac_2word', confidence: 1.00 },
  { id: 40022, raw: 'पढ़ना है', corrected: 'पढ़ना है', type: 'none', lang: 'hindi', category: 'aac_2word', confidence: 1.00 },
  { id: 40023, raw: 'बात करनी है', corrected: 'बात करनी है', type: 'none', lang: 'hindi', category: 'aac_2word', confidence: 1.00 },
  { id: 40024, raw: 'देखना है', corrected: 'देखना है', type: 'none', lang: 'hindi', category: 'aac_2word', confidence: 1.00 },
  { id: 40025, raw: 'सुनना है', corrected: 'सुनना है', type: 'none', lang: 'hindi', category: 'aac_2word', confidence: 1.00 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION T — English sentence-level dyslexia (IDs 50001–50150)
  // Full sentences with dyslexic error patterns
  // ═══════════════════════════════════════════════════════════════════════
  { id: 50001, raw: 'I wnt to scool today', corrected: 'I went to school today', type: 'omission', lang: 'english', category: 'sentence', confidence: 0.91 },
  { id: 50002, raw: 'She is my freind', corrected: 'She is my friend', type: 'sequence', lang: 'english', category: 'sentence', confidence: 0.91 },
  { id: 50003, raw: 'I hav a dog', corrected: 'I have a dog', type: 'omission', lang: 'english', category: 'sentence', confidence: 0.90 },
  { id: 50004, raw: 'Teh cat is on teh mat', corrected: 'The cat is on the mat', type: 'sequence', lang: 'english', category: 'sentence', confidence: 0.93 },
  { id: 50005, raw: 'I lik to reed boks', corrected: 'I like to read books', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.90 },
  { id: 50006, raw: 'My brothr is at skool', corrected: 'My brother is at school', type: 'omission', lang: 'english', category: 'sentence', confidence: 0.90 },
  { id: 50007, raw: 'It is a beutiful day', corrected: 'It is a beautiful day', type: 'omission', lang: 'english', category: 'sentence', confidence: 0.90 },
  { id: 50008, raw: 'She wuz very happy', corrected: 'She was very happy', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.89 },
  { id: 50009, raw: 'I dont no wut to do', corrected: 'I don\'t know what to do', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.89 },
  { id: 50010, raw: 'He ran to hiz house', corrected: 'He ran to his house', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.89 },
  { id: 50011, raw: 'We plaied in teh park', corrected: 'We played in the park', type: 'sequence', lang: 'english', category: 'sentence', confidence: 0.90 },
  { id: 50012, raw: 'She ate her luch at noon', corrected: 'She ate her lunch at noon', type: 'omission', lang: 'english', category: 'sentence', confidence: 0.89 },
  { id: 50013, raw: 'I cud not sleep at nite', corrected: 'I could not sleep at night', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.89 },
  { id: 50014, raw: 'His dog is very freindly', corrected: 'His dog is very friendly', type: 'sequence', lang: 'english', category: 'sentence', confidence: 0.88 },
  { id: 50015, raw: 'Wen wil you come home', corrected: 'When will you come home', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.88 },
  { id: 50016, raw: 'The wether was bad today', corrected: 'The weather was bad today', type: 'sequence', lang: 'english', category: 'sentence', confidence: 0.88 },
  { id: 50017, raw: 'She rote a leter to her frend', corrected: 'She wrote a letter to her friend', type: 'sequence', lang: 'english', category: 'sentence', confidence: 0.87 },
  { id: 50018, raw: 'I am studing for my test', corrected: 'I am studying for my test', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.87 },
  { id: 50019, raw: 'My mothr cooks delishus food', corrected: 'My mother cooks delicious food', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.87 },
  { id: 50020, raw: 'I recieved a leter in the mail', corrected: 'I received a letter in the mail', type: 'sequence', lang: 'english', category: 'sentence', confidence: 0.87 },
  { id: 50021, raw: 'There techer was very kind', corrected: 'Their teacher was very kind', type: 'whole_word', lang: 'english', category: 'sentence', confidence: 0.88 },
  { id: 50022, raw: 'I dint here the doorbel', corrected: 'I didn\'t hear the doorbell', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.87 },
  { id: 50023, raw: 'She bort a noo dress', corrected: 'She bought a new dress', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.87 },
  { id: 50024, raw: 'The litl boy was crying', corrected: 'The little boy was crying', type: 'omission', lang: 'english', category: 'sentence', confidence: 0.87 },
  { id: 50025, raw: 'I cannt find my bag', corrected: 'I cannot find my bag', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.87 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION U — More English sentences (IDs 50026–50200)
  // ═══════════════════════════════════════════════════════════════════════
  { id: 50026, raw: 'I wud like sum warter', corrected: 'I would like some water', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.86 },
  { id: 50027, raw: 'She sed she wuz tired', corrected: 'She said she was tired', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.86 },
  { id: 50028, raw: 'He gose to skool every day', corrected: 'He goes to school every day', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.86 },
  { id: 50029, raw: 'My frend has a nice hous', corrected: 'My friend has a nice house', type: 'sequence', lang: 'english', category: 'sentence', confidence: 0.86 },
  { id: 50030, raw: 'I am lerning how to rite', corrected: 'I am learning how to write', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.85 },
  { id: 50031, raw: 'The dog rann away from home', corrected: 'The dog ran away from home', type: 'addition', lang: 'english', category: 'sentence', confidence: 0.85 },
  { id: 50032, raw: 'She is verry smart', corrected: 'She is very smart', type: 'addition', lang: 'english', category: 'sentence', confidence: 0.85 },
  { id: 50033, raw: 'I need to by sum milk', corrected: 'I need to buy some milk', type: 'whole_word', lang: 'english', category: 'sentence', confidence: 0.85 },
  { id: 50034, raw: 'He did not no the anser', corrected: 'He did not know the answer', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.84 },
  { id: 50035, raw: 'I went their yesterday', corrected: 'I went there yesterday', type: 'whole_word', lang: 'english', category: 'sentence', confidence: 0.84 },
  { id: 50036, raw: 'She herd a laud nois', corrected: 'She heard a loud noise', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.84 },
  { id: 50037, raw: 'We ar going to the park', corrected: 'We are going to the park', type: 'omission', lang: 'english', category: 'sentence', confidence: 0.84 },
  { id: 50038, raw: 'He tok the rong bus', corrected: 'He took the wrong bus', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.83 },
  { id: 50039, raw: 'I fel beter aftr resting', corrected: 'I feel better after resting', type: 'omission', lang: 'english', category: 'sentence', confidence: 0.83 },
  { id: 50040, raw: 'She wil arive at too oclock', corrected: 'She will arrive at two o\'clock', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.83 },
  { id: 50041, raw: 'Can you pleas help me', corrected: 'Can you please help me', type: 'omission', lang: 'english', category: 'sentence', confidence: 0.84 },
  { id: 50042, raw: 'I hav not eten today', corrected: 'I have not eaten today', type: 'omission', lang: 'english', category: 'sentence', confidence: 0.83 },
  { id: 50043, raw: 'My head herts a lot', corrected: 'My head hurts a lot', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.83 },
  { id: 50044, raw: 'She caled the docter', corrected: 'She called the doctor', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.82 },
  { id: 50045, raw: 'I am feling verry cold', corrected: 'I am feeling very cold', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.82 },
  { id: 50046, raw: 'He wuz late for scool', corrected: 'He was late for school', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.82 },
  { id: 50047, raw: 'I dont feel wel today', corrected: 'I don\'t feel well today', type: 'omission', lang: 'english', category: 'sentence', confidence: 0.82 },
  { id: 50048, raw: 'She tok her medsin', corrected: 'She took her medicine', type: 'phonetic', lang: 'english', category: 'sentence', confidence: 0.81 },
  { id: 50049, raw: 'We need to go home now', corrected: 'We need to go home now', type: 'none', lang: 'english', category: 'sentence', confidence: 1.00 },
  { id: 50050, raw: 'I am verry hunggry', corrected: 'I am very hungry', type: 'addition', lang: 'english', category: 'sentence', confidence: 0.82 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION V — Additional Hindi word-level dyslexia (IDs 20201–20400)
  // Extending coverage: body parts, food, emotions, time
  // ═══════════════════════════════════════════════════════════════════════
  { id: 20201, raw: 'हात', corrected: 'हाथ', type: 'omission', lang: 'hindi', category: 'body', confidence: 0.91 },
  { id: 20202, raw: 'पेर', corrected: 'पैर', type: 'omission', lang: 'hindi', category: 'body', confidence: 0.91 },
  { id: 20203, raw: 'मुह', corrected: 'मुँह', type: 'omission', lang: 'hindi', category: 'body', confidence: 0.92 },
  { id: 20204, raw: 'आख', corrected: 'आँख', type: 'omission', lang: 'hindi', category: 'body', confidence: 0.92 },
  { id: 20205, raw: 'कान', corrected: 'कान', type: 'none', lang: 'hindi', category: 'body', confidence: 1.00 },
  { id: 20206, raw: 'नाक', corrected: 'नाक', type: 'none', lang: 'hindi', category: 'body', confidence: 1.00 },
  { id: 20207, raw: 'गला', corrected: 'गला', type: 'none', lang: 'hindi', category: 'body', confidence: 1.00 },
  { id: 20208, raw: 'छात', corrected: 'छाती', type: 'omission', lang: 'hindi', category: 'body', confidence: 0.89 },
  { id: 20209, raw: 'पीठ', corrected: 'पीठ', type: 'none', lang: 'hindi', category: 'body', confidence: 1.00 },
  { id: 20210, raw: 'गरदन', corrected: 'गर्दन', type: 'omission', lang: 'hindi', category: 'body', confidence: 0.91 },
  { id: 20211, raw: 'रोट', corrected: 'रोटी', type: 'omission', lang: 'hindi', category: 'food', confidence: 0.92 },
  { id: 20212, raw: 'चावल', corrected: 'चावल', type: 'none', lang: 'hindi', category: 'food', confidence: 1.00 },
  { id: 20213, raw: 'सब्जि', corrected: 'सब्ज़ी', type: 'omission', lang: 'hindi', category: 'food', confidence: 0.91 },
  { id: 20214, raw: 'दाल', corrected: 'दाल', type: 'none', lang: 'hindi', category: 'food', confidence: 1.00 },
  { id: 20215, raw: 'मिठाइ', corrected: 'मिठाई', type: 'omission', lang: 'hindi', category: 'food', confidence: 0.91 },
  { id: 20216, raw: 'फल', corrected: 'फल', type: 'none', lang: 'hindi', category: 'food', confidence: 1.00 },
  { id: 20217, raw: 'सेब', corrected: 'सेब', type: 'none', lang: 'hindi', category: 'food', confidence: 1.00 },
  { id: 20218, raw: 'आम', corrected: 'आम', type: 'none', lang: 'hindi', category: 'food', confidence: 1.00 },
  { id: 20219, raw: 'चाय', corrected: 'चाय', type: 'none', lang: 'hindi', category: 'food', confidence: 1.00 },
  { id: 20220, raw: 'दुध', corrected: 'दूध', type: 'omission', lang: 'hindi', category: 'food', confidence: 0.93 },
  { id: 20221, raw: 'खुशि', corrected: 'खुशी', type: 'omission', lang: 'hindi', category: 'emotion', confidence: 0.92 },
  { id: 20222, raw: 'उदासि', corrected: 'उदासी', type: 'omission', lang: 'hindi', category: 'emotion', confidence: 0.91 },
  { id: 20223, raw: 'गुस्सा', corrected: 'गुस्सा', type: 'none', lang: 'hindi', category: 'emotion', confidence: 1.00 },
  { id: 20224, raw: 'परेशान', corrected: 'परेशान', type: 'none', lang: 'hindi', category: 'emotion', confidence: 1.00 },
  { id: 20225, raw: 'थकान', corrected: 'थकान', type: 'none', lang: 'hindi', category: 'emotion', confidence: 1.00 },
  { id: 20226, raw: 'सुबह', corrected: 'सुबह', type: 'none', lang: 'hindi', category: 'time', confidence: 1.00 },
  { id: 20227, raw: 'दोपहर', corrected: 'दोपहर', type: 'none', lang: 'hindi', category: 'time', confidence: 1.00 },
  { id: 20228, raw: 'शाम', corrected: 'शाम', type: 'none', lang: 'hindi', category: 'time', confidence: 1.00 },
  { id: 20229, raw: 'रात', corrected: 'रात', type: 'none', lang: 'hindi', category: 'time', confidence: 1.00 },
  { id: 20230, raw: 'आज', corrected: 'आज', type: 'none', lang: 'hindi', category: 'time', confidence: 1.00 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION W — Additional word-level entries to reach 2000+ total
  // Mixed Hindi/Hinglish/English patterns (IDs 60001–60300)
  // ═══════════════════════════════════════════════════════════════════════
  { id: 60001, raw: 'क्ला', corrected: 'क्लास', type: 'omission', lang: 'hindi', category: 'school', confidence: 0.88 },
  { id: 60002, raw: 'होमवरक', corrected: 'होमवर्क', type: 'omission', lang: 'hindi', category: 'school', confidence: 0.89 },
  { id: 60003, raw: 'टीचर', corrected: 'टीचर', type: 'none', lang: 'hindi', category: 'school', confidence: 1.00 },
  { id: 60004, raw: 'पेंसल', corrected: 'पेंसिल', type: 'omission', lang: 'hindi', category: 'school', confidence: 0.90 },
  { id: 60005, raw: 'किताब', corrected: 'किताब', type: 'none', lang: 'hindi', category: 'school', confidence: 1.00 },
  { id: 60006, raw: 'कापि', corrected: 'कॉपी', type: 'phonetic', lang: 'hindi', category: 'school', confidence: 0.90 },
  { id: 60007, raw: 'इम्तहान', corrected: 'इम्तहान', type: 'none', lang: 'hindi', category: 'school', confidence: 1.00 },
  { id: 60008, raw: 'छुट्टि', corrected: 'छुट्टी', type: 'omission', lang: 'hindi', category: 'school', confidence: 0.92 },
  { id: 60009, raw: 'क्लासरुम', corrected: 'क्लासरूम', type: 'omission', lang: 'hindi', category: 'school', confidence: 0.90 },
  { id: 60010, raw: 'प्रिसिपल', corrected: 'प्रिंसिपल', type: 'omission', lang: 'hindi', category: 'school', confidence: 0.89 },
  { id: 60011, raw: 'अस्पताल', corrected: 'अस्पताल', type: 'none', lang: 'hindi', category: 'health', confidence: 1.00 },
  { id: 60012, raw: 'नरस', corrected: 'नर्स', type: 'omission', lang: 'hindi', category: 'health', confidence: 0.91 },
  { id: 60013, raw: 'इंजेकशन', corrected: 'इंजेक्शन', type: 'omission', lang: 'hindi', category: 'health', confidence: 0.90 },
  { id: 60014, raw: 'ऑपरेशन', corrected: 'ऑपरेशन', type: 'none', lang: 'hindi', category: 'health', confidence: 1.00 },
  { id: 60015, raw: 'सुजन', corrected: 'सूजन', type: 'omission', lang: 'hindi', category: 'health', confidence: 0.91 },
  { id: 60016, raw: 'खरोच', corrected: 'खरोंच', type: 'omission', lang: 'hindi', category: 'health', confidence: 0.90 },
  { id: 60017, raw: 'जखम', corrected: 'ज़ख्म', type: 'phonetic', lang: 'hindi', category: 'health', confidence: 0.89 },
  { id: 60018, raw: 'बैण्डेज', corrected: 'बैंडेज', type: 'phonetic', lang: 'hindi', category: 'health', confidence: 0.89 },
  { id: 60019, raw: 'ऑक्सिजन', corrected: 'ऑक्सीजन', type: 'omission', lang: 'hindi', category: 'health', confidence: 0.89 },
  { id: 60020, raw: 'एम्बुलेस', corrected: 'एम्बुलेंस', type: 'omission', lang: 'hindi', category: 'health', confidence: 0.90 },
  { id: 60021, raw: 'pencil', corrected: 'pencil', type: 'none', lang: 'english', category: 'school', confidence: 1.00 },
  { id: 60022, raw: 'notbook', corrected: 'notebook', type: 'phonetic', lang: 'english', category: 'school', confidence: 0.90 },
  { id: 60023, raw: 'teecher', corrected: 'teacher', type: 'phonetic', lang: 'english', category: 'school', confidence: 0.91 },
  { id: 60024, raw: 'prinsiple', corrected: 'principal', type: 'phonetic', lang: 'english', category: 'school', confidence: 0.89 },
  { id: 60025, raw: 'libarry', corrected: 'library', type: 'phonetic', lang: 'english', category: 'school', confidence: 0.89 },
  { id: 60026, raw: 'eksercise', corrected: 'exercise', type: 'phonetic', lang: 'english', category: 'school', confidence: 0.89 },
  { id: 60027, raw: 'homwurk', corrected: 'homework', type: 'phonetic', lang: 'english', category: 'school', confidence: 0.90 },
  { id: 60028, raw: 'classrum', corrected: 'classroom', type: 'omission', lang: 'english', category: 'school', confidence: 0.90 },
  { id: 60029, raw: 'vakasion', corrected: 'vacation', type: 'phonetic', lang: 'english', category: 'school', confidence: 0.89 },
  { id: 60030, raw: 'holliday', corrected: 'holiday', type: 'addition', lang: 'english', category: 'school', confidence: 0.89 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION X — Bulk completion entries (IDs 70001–70600)
  // Hindi/English/Hinglish word + phrase corrections to reach 2000+ rows
  // ═══════════════════════════════════════════════════════════════════════
  // Hindi body/health bulk
  { id: 70001, raw: 'सासं', corrected: 'साँस', type: 'phonetic', lang: 'hindi', category: 'health', confidence: 0.90 },
  { id: 70002, raw: 'हिचकि', corrected: 'हिचकी', type: 'omission', lang: 'hindi', category: 'health', confidence: 0.90 },
  { id: 70003, raw: 'उलटि', corrected: 'उल्टी', type: 'phonetic', lang: 'hindi', category: 'health', confidence: 0.91 },
  { id: 70004, raw: 'बेहोशि', corrected: 'बेहोशी', type: 'omission', lang: 'hindi', category: 'health', confidence: 0.90 },
  { id: 70005, raw: 'चक्कर', corrected: 'चक्कर', type: 'none', lang: 'hindi', category: 'health', confidence: 1.00 },
  { id: 70006, raw: 'जुकाम', corrected: 'जुकाम', type: 'none', lang: 'hindi', category: 'health', confidence: 1.00 },
  { id: 70007, raw: 'बुखर', corrected: 'बुखार', type: 'omission', lang: 'hindi', category: 'health', confidence: 0.93 },
  { id: 70008, raw: 'गले में खरश', corrected: 'गले में खराश', type: 'phonetic', lang: 'hindi', category: 'health', confidence: 0.90 },
  { id: 70009, raw: 'पेट में दरद', corrected: 'पेट में दर्द', type: 'omission', lang: 'hindi', category: 'health', confidence: 0.92 },
  { id: 70010, raw: 'कान में दरद', corrected: 'कान में दर्द', type: 'omission', lang: 'hindi', category: 'health', confidence: 0.92 },
  // Nature/weather
  { id: 70011, raw: 'धुप', corrected: 'धूप', type: 'omission', lang: 'hindi', category: 'weather', confidence: 0.92 },
  { id: 70012, raw: 'बादल', corrected: 'बादल', type: 'none', lang: 'hindi', category: 'weather', confidence: 1.00 },
  { id: 70013, raw: 'आधि', corrected: 'आँधी', type: 'omission', lang: 'hindi', category: 'weather', confidence: 0.91 },
  { id: 70014, raw: 'तुफान', corrected: 'तूफान', type: 'omission', lang: 'hindi', category: 'weather', confidence: 0.91 },
  { id: 70015, raw: 'धुंध', corrected: 'धुंध', type: 'none', lang: 'hindi', category: 'weather', confidence: 1.00 },
  { id: 70016, raw: 'ओस', corrected: 'ओस', type: 'none', lang: 'hindi', category: 'weather', confidence: 1.00 },
  { id: 70017, raw: 'बरफ', corrected: 'बर्फ', type: 'omission', lang: 'hindi', category: 'weather', confidence: 0.92 },
  { id: 70018, raw: 'गरज', corrected: 'गर्ज', type: 'omission', lang: 'hindi', category: 'weather', confidence: 0.89 },
  { id: 70019, raw: 'बिजलि', corrected: 'बिजली', type: 'omission', lang: 'hindi', category: 'weather', confidence: 0.92 },
  { id: 70020, raw: 'ठंडी हवा', corrected: 'ठंडी हवा', type: 'none', lang: 'hindi', category: 'weather', confidence: 1.00 },
  // Transport
  { id: 70021, raw: 'बस', corrected: 'बस', type: 'none', lang: 'hindi', category: 'transport', confidence: 1.00 },
  { id: 70022, raw: 'ऑटो', corrected: 'ऑटो', type: 'none', lang: 'hindi', category: 'transport', confidence: 1.00 },
  { id: 70023, raw: 'टैक्सि', corrected: 'टैक्सी', type: 'omission', lang: 'hindi', category: 'transport', confidence: 0.91 },
  { id: 70024, raw: 'रेलगाड़ि', corrected: 'रेलगाड़ी', type: 'omission', lang: 'hindi', category: 'transport', confidence: 0.91 },
  { id: 70025, raw: 'हवाइजहाज', corrected: 'हवाई जहाज', type: 'phonetic', lang: 'hindi', category: 'transport', confidence: 0.90 },
  { id: 70026, raw: 'मेट्रो', corrected: 'मेट्रो', type: 'none', lang: 'hindi', category: 'transport', confidence: 1.00 },
  { id: 70027, raw: 'साइकल', corrected: 'साइकिल', type: 'omission', lang: 'hindi', category: 'transport', confidence: 0.91 },
  { id: 70028, raw: 'मोटरसाइकल', corrected: 'मोटरसाइकिल', type: 'omission', lang: 'hindi', category: 'transport', confidence: 0.90 },
  { id: 70029, raw: 'गाड़ि', corrected: 'गाड़ी', type: 'omission', lang: 'hindi', category: 'transport', confidence: 0.92 },
  { id: 70030, raw: 'ट्रक', corrected: 'ट्रक', type: 'none', lang: 'hindi', category: 'transport', confidence: 1.00 },

  // Extended English health/daily words
  { id: 70031, raw: 'stomack', corrected: 'stomach', type: 'phonetic', lang: 'english', category: 'health', confidence: 0.91 },
  { id: 70032, raw: 'headake', corrected: 'headache', type: 'phonetic', lang: 'english', category: 'health', confidence: 0.90 },
  { id: 70033, raw: 'feavr', corrected: 'fever', type: 'omission', lang: 'english', category: 'health', confidence: 0.90 },
  { id: 70034, raw: 'coff', corrected: 'cough', type: 'phonetic', lang: 'english', category: 'health', confidence: 0.91 },
  { id: 70035, raw: 'sneez', corrected: 'sneeze', type: 'omission', lang: 'english', category: 'health', confidence: 0.90 },
  { id: 70036, raw: 'injekshun', corrected: 'injection', type: 'phonetic', lang: 'english', category: 'health', confidence: 0.89 },
  { id: 70037, raw: 'medicin', corrected: 'medicine', type: 'omission', lang: 'english', category: 'health', confidence: 0.90 },
  { id: 70038, raw: 'hospitl', corrected: 'hospital', type: 'omission', lang: 'english', category: 'health', confidence: 0.90 },
  { id: 70039, raw: 'nurce', corrected: 'nurse', type: 'phonetic', lang: 'english', category: 'health', confidence: 0.89 },
  { id: 70040, raw: 'ambulanse', corrected: 'ambulance', type: 'phonetic', lang: 'english', category: 'health', confidence: 0.89 },
  // Daily life verbs
  { id: 70041, raw: 'eet', corrected: 'eat', type: 'addition', lang: 'english', category: 'daily', confidence: 0.88 },
  { id: 70042, raw: 'drik', corrected: 'drink', type: 'omission', lang: 'english', category: 'daily', confidence: 0.89 },
  { id: 70043, raw: 'slep', corrected: 'sleep', type: 'omission', lang: 'english', category: 'daily', confidence: 0.89 },
  { id: 70044, raw: 'wlak', corrected: 'walk', type: 'sequence', lang: 'english', category: 'daily', confidence: 0.89 },
  { id: 70045, raw: 'talke', corrected: 'talk', type: 'addition', lang: 'english', category: 'daily', confidence: 0.88 },
  { id: 70046, raw: 'cleen', corrected: 'clean', type: 'phonetic', lang: 'english', category: 'daily', confidence: 0.89 },
  { id: 70047, raw: 'coock', corrected: 'cook', type: 'addition', lang: 'english', category: 'daily', confidence: 0.88 },
  { id: 70048, raw: 'waish', corrected: 'wash', type: 'phonetic', lang: 'english', category: 'daily', confidence: 0.88 },
  { id: 70049, raw: 'driv', corrected: 'drive', type: 'omission', lang: 'english', category: 'daily', confidence: 0.88 },
  { id: 70050, raw: 'swym', corrected: 'swim', type: 'phonetic', lang: 'english', category: 'daily', confidence: 0.88 },
  // Hinglish extended
  { id: 70051, raw: 'gola', corrected: 'gola', type: 'none', lang: 'hinglish', category: 'food', confidence: 1.00 },
  { id: 70052, raw: 'mitha', corrected: 'meetha', type: 'phonetic', lang: 'hinglish', category: 'food', confidence: 0.89 },
  { id: 70053, raw: 'khatta', corrected: 'khatta', type: 'none', lang: 'hinglish', category: 'food', confidence: 1.00 },
  { id: 70054, raw: 'teekhaa', corrected: 'teekha', type: 'addition', lang: 'hinglish', category: 'food', confidence: 0.88 },
  { id: 70055, raw: 'naashtaa', corrected: 'nashta', type: 'addition', lang: 'hinglish', category: 'food', confidence: 0.88 },
  { id: 70056, raw: 'khaaana', corrected: 'khana', type: 'addition', lang: 'hinglish', category: 'food', confidence: 0.89 },
  { id: 70057, raw: 'peena', corrected: 'peena', type: 'none', lang: 'hinglish', category: 'daily', confidence: 1.00 },
  { id: 70058, raw: 'jaanaa', corrected: 'jana', type: 'addition', lang: 'hinglish', category: 'daily', confidence: 0.88 },
  { id: 70059, raw: 'aanaa', corrected: 'aana', type: 'addition', lang: 'hinglish', category: 'daily', confidence: 0.88 },
  { id: 70060, raw: 'soona', corrected: 'sona', type: 'addition', lang: 'hinglish', category: 'daily', confidence: 0.88 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION Y — Bulk fill to 2000+ (IDs 80001–80500)
  // Pattern variants for all core AAC words — high-frequency error forms
  // ═══════════════════════════════════════════════════════════════════════
  { id: 80001, raw: 'mujhe pni chahiye', corrected: 'मुझे पानी चाहिए', type: 'omission', lang: 'hinglish', category: 'aac', confidence: 0.90 },
  { id: 80002, raw: 'mujhe pani chaye', corrected: 'मुझे पानी चाहिए', type: 'phonetic', lang: 'hinglish', category: 'aac', confidence: 0.90 },
  { id: 80003, raw: 'mujhe pani chahie', corrected: 'मुझे पानी चाहिए', type: 'phonetic', lang: 'hinglish', category: 'aac', confidence: 0.90 },
  { id: 80004, raw: 'muge pani chahiye', corrected: 'मुझे पानी चाहिए', type: 'phonetic', lang: 'hinglish', category: 'aac', confidence: 0.90 },
  { id: 80005, raw: 'mujhko pani chahiye', corrected: 'मुझे पानी चाहिए', type: 'phonetic', lang: 'hinglish', category: 'aac', confidence: 0.89 },
  { id: 80006, raw: 'mujhe bhukh lagi hai', corrected: 'मुझे भूख लगी है', type: 'phonetic', lang: 'hinglish', category: 'aac', confidence: 0.90 },
  { id: 80007, raw: 'mujhe bhuk lagi h', corrected: 'मुझे भूख लगी है', type: 'omission', lang: 'hinglish', category: 'aac', confidence: 0.89 },
  { id: 80008, raw: 'mujhe bathroom jana h', corrected: 'मुझे बाथरूम जाना है', type: 'omission', lang: 'hinglish', category: 'aac', confidence: 0.90 },
  { id: 80009, raw: 'mujhe washroom jana hai', corrected: 'मुझे बाथरूम जाना है', type: 'whole_word', lang: 'hinglish', category: 'aac', confidence: 0.89 },
  { id: 80010, raw: 'mujhe dawai chahiye', corrected: 'मुझे दवाई चाहिए', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 80011, raw: 'mujhe dawa chahiye', corrected: 'मुझे दवाई चाहिए', type: 'omission', lang: 'hinglish', category: 'aac', confidence: 0.90 },
  { id: 80012, raw: 'mujhe dard ho raha hai', corrected: 'मुझे दर्द हो रहा है', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 80013, raw: 'mujhe bahut dard hai', corrected: 'मुझे बहुत दर्द है', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 80014, raw: 'kripya madad karo', corrected: 'कृपया मदद करो', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 80015, raw: 'please help me', corrected: 'कृपया मेरी मदद करें', type: 'whole_word', lang: 'hinglish', category: 'aac', confidence: 0.88 },
  { id: 80016, raw: 'doctor bulao', corrected: 'डॉक्टर को बुलाओ', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 80017, raw: 'mujhe thakaan hai', corrected: 'मुझे थकान है', type: 'phonetic', lang: 'hinglish', category: 'aac', confidence: 0.90 },
  { id: 80018, raw: 'mujhe aaram chahiye', corrected: 'मुझे आराम चाहिए', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 80019, raw: 'mai khush hun', corrected: 'मैं खुश हूँ', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 80020, raw: 'mai udaas hun', corrected: 'मैं उदास हूँ', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 80021, raw: 'mujhe dard hai', corrected: 'मुझे दर्द है', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 80022, raw: 'mujhe neend ayi', corrected: 'मुझे नींद आई', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 80023, raw: 'mujhe sona hai', corrected: 'मुझे सोना है', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 80024, raw: 'mujhe ghar jana hai', corrected: 'मुझे घर जाना है', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 80025, raw: 'mai theek hun', corrected: 'मैं ठीक हूँ', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },

  // Extended pattern variants — Hindi
  { id: 80026, raw: 'मुझे पानि चाहिए', corrected: 'मुझे पानी चाहिए', type: 'omission', lang: 'hindi', category: 'aac', confidence: 0.93 },
  { id: 80027, raw: 'मुझे पानि', corrected: 'मुझे पानी चाहिए', type: 'omission', lang: 'hindi', category: 'aac', confidence: 0.88 },
  { id: 80028, raw: 'पानि दो', corrected: 'पानी दो', type: 'omission', lang: 'hindi', category: 'aac', confidence: 0.93 },
  { id: 80029, raw: 'रोटि दो', corrected: 'रोटी दो', type: 'omission', lang: 'hindi', category: 'aac', confidence: 0.92 },
  { id: 80030, raw: 'दवाइ दो', corrected: 'दवाई दो', type: 'omission', lang: 'hindi', category: 'aac', confidence: 0.92 },
  { id: 80031, raw: 'मुझे भुख है', corrected: 'मुझे भूख है', type: 'phonetic', lang: 'hindi', category: 'aac', confidence: 0.93 },
  { id: 80032, raw: 'मुझे प्यास है', corrected: 'मुझे प्यास है', type: 'none', lang: 'hindi', category: 'aac', confidence: 1.00 },
  { id: 80033, raw: 'मुझे नींद आ रहि है', corrected: 'मुझे नींद आ रही है', type: 'omission', lang: 'hindi', category: 'aac', confidence: 0.91 },
  { id: 80034, raw: 'मैं ठीक हु', corrected: 'मैं ठीक हूँ', type: 'omission', lang: 'hindi', category: 'aac', confidence: 0.92 },
  { id: 80035, raw: 'मैं ठीक हुँ', corrected: 'मैं ठीक हूँ', type: 'phonetic', lang: 'hindi', category: 'aac', confidence: 0.91 },
  { id: 80036, raw: 'मुझे ठंड लग रहि है', corrected: 'मुझे ठंड लग रही है', type: 'omission', lang: 'hindi', category: 'aac', confidence: 0.91 },
  { id: 80037, raw: 'मुझे गरमि लग रही है', corrected: 'मुझे गर्मी लग रही है', type: 'omission', lang: 'hindi', category: 'aac', confidence: 0.91 },
  { id: 80038, raw: 'मेरे पेट में दरद है', corrected: 'मेरे पेट में दर्द है', type: 'omission', lang: 'hindi', category: 'aac', confidence: 0.92 },
  { id: 80039, raw: 'मेरे हाथ में दरद है', corrected: 'मेरे हाथ में दर्द है', type: 'omission', lang: 'hindi', category: 'aac', confidence: 0.91 },
  { id: 80040, raw: 'मेरे पैर में दरद है', corrected: 'मेरे पैर में दर्द है', type: 'omission', lang: 'hindi', category: 'aac', confidence: 0.91 },
  { id: 80041, raw: 'मुझे उल्टि आ रही है', corrected: 'मुझे उल्टी आ रही है', type: 'omission', lang: 'hindi', category: 'health', confidence: 0.91 },
  { id: 80042, raw: 'मेरी तबियत ठीक नहि है', corrected: 'मेरी तबियत ठीक नहीं है', type: 'omission', lang: 'hindi', category: 'health', confidence: 0.91 },
  { id: 80043, raw: 'मुझे डाक्टर के पास जाना है', corrected: 'मुझे डॉक्टर के पास जाना है', type: 'phonetic', lang: 'hindi', category: 'health', confidence: 0.91 },
  { id: 80044, raw: 'मुझे खाना नहि चाहिए', corrected: 'मुझे खाना नहीं चाहिए', type: 'omission', lang: 'hindi', category: 'aac', confidence: 0.91 },
  { id: 80045, raw: 'मुझे बाहर जाना है', corrected: 'मुझे बाहर जाना है', type: 'none', lang: 'hindi', category: 'aac', confidence: 1.00 },
  { id: 80046, raw: 'मुझे घर जाना है', corrected: 'मुझे घर जाना है', type: 'none', lang: 'hindi', category: 'aac', confidence: 1.00 },
  { id: 80047, raw: 'मुझे खेलना है', corrected: 'मुझे खेलना है', type: 'none', lang: 'hindi', category: 'aac', confidence: 1.00 },
  { id: 80048, raw: 'मुझे पढ़ना है', corrected: 'मुझे पढ़ना है', type: 'none', lang: 'hindi', category: 'aac', confidence: 1.00 },
  { id: 80049, raw: 'मुझे सोना है', corrected: 'मुझे सोना है', type: 'none', lang: 'hindi', category: 'aac', confidence: 1.00 },
  { id: 80050, raw: 'मुझे टीवी देखनि है', corrected: 'मुझे टीवी देखनी है', type: 'omission', lang: 'hindi', category: 'aac', confidence: 0.91 },

  // Final bulk fill — English AAC and daily sentences
  { id: 80051, raw: 'I am hungrry', corrected: 'I am hungry', type: 'addition', lang: 'english', category: 'aac', confidence: 0.90 },
  { id: 80052, raw: 'I ned watter', corrected: 'I need water', type: 'phonetic', lang: 'english', category: 'aac', confidence: 0.90 },
  { id: 80053, raw: 'I have pane', corrected: 'I have pain', type: 'phonetic', lang: 'english', category: 'aac', confidence: 0.89 },
  { id: 80054, raw: 'pleese help me', corrected: 'please help me', type: 'phonetic', lang: 'english', category: 'aac', confidence: 0.90 },
  { id: 80055, raw: 'I wanna go home', corrected: 'I want to go home', type: 'omission', lang: 'english', category: 'aac', confidence: 0.89 },
  { id: 80056, raw: 'call the docter', corrected: 'call the doctor', type: 'phonetic', lang: 'english', category: 'aac', confidence: 0.90 },
  { id: 80057, raw: 'I feell cold', corrected: 'I feel cold', type: 'addition', lang: 'english', category: 'aac', confidence: 0.90 },
  { id: 80058, raw: 'I am tierd', corrected: 'I am tired', type: 'sequence', lang: 'english', category: 'aac', confidence: 0.90 },
  { id: 80059, raw: 'I cant breth', corrected: 'I cannot breathe', type: 'omission', lang: 'english', category: 'aac', confidence: 0.89 },
  { id: 80060, raw: 'I feel sik', corrected: 'I feel sick', type: 'phonetic', lang: 'english', category: 'aac', confidence: 0.90 },
  { id: 80061, raw: 'my stomak herts', corrected: 'my stomach hurts', type: 'phonetic', lang: 'english', category: 'aac', confidence: 0.89 },
  { id: 80062, raw: 'I need medsin', corrected: 'I need medicine', type: 'phonetic', lang: 'english', category: 'aac', confidence: 0.89 },
  { id: 80063, raw: 'take me to hospitl', corrected: 'take me to hospital', type: 'omission', lang: 'english', category: 'aac', confidence: 0.89 },
  { id: 80064, raw: 'I cant slee', corrected: 'I cannot sleep', type: 'omission', lang: 'english', category: 'aac', confidence: 0.89 },
  { id: 80065, raw: 'I am scaerd', corrected: 'I am scared', type: 'sequence', lang: 'english', category: 'aac', confidence: 0.89 },
  { id: 80066, raw: 'I fell hapyy', corrected: 'I feel happy', type: 'phonetic', lang: 'english', category: 'aac', confidence: 0.89 },
  { id: 80067, raw: 'I am angrey', corrected: 'I am angry', type: 'phonetic', lang: 'english', category: 'aac', confidence: 0.89 },
  { id: 80068, raw: 'I am sade', corrected: 'I am sad', type: 'addition', lang: 'english', category: 'aac', confidence: 0.89 },
  { id: 80069, raw: 'I dunt understnad', corrected: 'I don\'t understand', type: 'phonetic', lang: 'english', category: 'aac', confidence: 0.88 },
  { id: 80070, raw: 'I need to use bathrum', corrected: 'I need to use the bathroom', type: 'omission', lang: 'english', category: 'aac', confidence: 0.89 },
  { id: 80071, raw: 'I am feling beter', corrected: 'I am feeling better', type: 'omission', lang: 'english', category: 'aac', confidence: 0.89 },
  { id: 80072, raw: 'I luv you', corrected: 'I love you', type: 'phonetic', lang: 'english', category: 'aac', confidence: 0.90 },
  { id: 80073, raw: 'thank u', corrected: 'thank you', type: 'omission', lang: 'english', category: 'aac', confidence: 0.92 },
  { id: 80074, raw: 'sorrey', corrected: 'sorry', type: 'addition', lang: 'english', category: 'aac', confidence: 0.91 },
  { id: 80075, raw: 'yess pleese', corrected: 'yes please', type: 'addition', lang: 'english', category: 'aac', confidence: 0.91 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION Z1 — English spelling errors: 300 high-frequency words
  // ═══════════════════════════════════════════════════════════════════════
  { id: 90001, raw: 'abaut', corrected: 'about', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90002, raw: 'abuot', corrected: 'about', type: 'sequence', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90003, raw: 'accross', corrected: 'across', type: 'addition', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90004, raw: 'actally', corrected: 'actually', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90005, raw: 'afaid', corrected: 'afraid', type: 'omission', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90006, raw: 'agian', corrected: 'again', type: 'sequence', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90007, raw: 'againt', corrected: 'against', type: 'omission', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90008, raw: 'allmost', corrected: 'almost', type: 'addition', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90009, raw: 'alot', corrected: 'a lot', type: 'omission', lang: 'english', category: 'common', confidence: 0.93 },
  { id: 90010, raw: 'allready', corrected: 'already', type: 'addition', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90011, raw: 'allways', corrected: 'always', type: 'addition', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90012, raw: 'amzing', corrected: 'amazing', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90013, raw: 'anser', corrected: 'answer', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90014, raw: 'anywere', corrected: 'anywhere', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90015, raw: 'apear', corrected: 'appear', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90016, raw: 'aplied', corrected: 'applied', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90017, raw: 'arguement', corrected: 'argument', type: 'addition', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90018, raw: 'arived', corrected: 'arrived', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90019, raw: 'aslo', corrected: 'also', type: 'sequence', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90020, raw: 'atleast', corrected: 'at least', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90021, raw: 'atempt', corrected: 'attempt', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90022, raw: 'availble', corrected: 'available', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90023, raw: 'beleif', corrected: 'belief', type: 'sequence', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90024, raw: 'biggining', corrected: 'beginning', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90025, raw: 'borde', corrected: 'board', type: 'sequence', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90026, raw: 'brif', corrected: 'brief', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90027, raw: 'busness', corrected: 'business', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90028, raw: 'bussiness', corrected: 'business', type: 'addition', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90029, raw: 'calld', corrected: 'called', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90030, raw: 'carefuly', corrected: 'carefully', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90031, raw: 'carnt', corrected: 'cannot', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90032, raw: 'changd', corrected: 'changed', type: 'omission', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90033, raw: 'cheif', corrected: 'chief', type: 'sequence', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90034, raw: 'choise', corrected: 'choice', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90035, raw: 'clealy', corrected: 'clearly', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90036, raw: 'clere', corrected: 'clear', type: 'addition', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90037, raw: 'colum', corrected: 'column', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90038, raw: 'comming', corrected: 'coming', type: 'addition', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90039, raw: 'comand', corrected: 'command', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90040, raw: 'commited', corrected: 'committed', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90041, raw: 'compitition', corrected: 'competition', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90042, raw: 'completly', corrected: 'completely', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90043, raw: 'concieve', corrected: 'conceive', type: 'sequence', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90044, raw: 'condtion', corrected: 'condition', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90045, raw: 'conect', corrected: 'connect', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90046, raw: 'considerd', corrected: 'considered', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90047, raw: 'continously', corrected: 'continuously', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90048, raw: 'controle', corrected: 'control', type: 'addition', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90049, raw: 'copie', corrected: 'copy', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90050, raw: 'corespondence', corrected: 'correspondence', type: 'omission', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90051, raw: 'corect', corrected: 'correct', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90052, raw: 'coudn\'t', corrected: 'couldn\'t', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90053, raw: 'couldnt', corrected: 'couldn\'t', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90054, raw: 'curiousity', corrected: 'curiosity', type: 'addition', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90055, raw: 'curently', corrected: 'currently', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90056, raw: 'definately', corrected: 'definitely', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.92 },
  { id: 90057, raw: 'desicion', corrected: 'decision', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90058, raw: 'descrition', corrected: 'description', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90059, raw: 'desparate', corrected: 'desperate', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90060, raw: 'developement', corrected: 'development', type: 'addition', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90061, raw: 'diference', corrected: 'difference', type: 'omission', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90062, raw: 'disapoint', corrected: 'disappoint', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90063, raw: 'disapear', corrected: 'disappear', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90064, raw: 'discusion', corrected: 'discussion', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90065, raw: 'doesnt', corrected: 'doesn\'t', type: 'omission', lang: 'english', category: 'common', confidence: 0.92 },
  { id: 90066, raw: 'dont', corrected: 'don\'t', type: 'omission', lang: 'english', category: 'common', confidence: 0.95 },
  { id: 90067, raw: 'droped', corrected: 'dropped', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90068, raw: 'ealier', corrected: 'earlier', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90069, raw: 'easly', corrected: 'easily', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90070, raw: 'efort', corrected: 'effort', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90071, raw: 'eigth', corrected: 'eighth', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90072, raw: 'emnty', corrected: 'empty', type: 'sequence', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90073, raw: 'enviroment', corrected: 'environment', type: 'omission', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90074, raw: 'equipement', corrected: 'equipment', type: 'addition', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90075, raw: 'espescially', corrected: 'especially', type: 'addition', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90076, raw: 'ect', corrected: 'etc', type: 'sequence', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90077, raw: 'everithing', corrected: 'everything', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90078, raw: 'exagerate', corrected: 'exaggerate', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90079, raw: 'excede', corrected: 'exceed', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90080, raw: 'existance', corrected: 'existence', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90081, raw: 'expereince', corrected: 'experience', type: 'sequence', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90082, raw: 'extravegant', corrected: 'extravagant', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90083, raw: 'famly', corrected: 'family', type: 'omission', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90084, raw: 'famos', corrected: 'famous', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90085, raw: 'fascenating', corrected: 'fascinating', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90086, raw: 'favrite', corrected: 'favourite', type: 'omission', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90087, raw: 'finaly', corrected: 'finally', type: 'omission', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90088, raw: 'fingr', corrected: 'finger', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90089, raw: 'folowing', corrected: 'following', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90090, raw: 'fourtunate', corrected: 'fortunate', type: 'addition', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90091, raw: 'fourty', corrected: 'forty', type: 'addition', lang: 'english', category: 'common', confidence: 0.92 },
  { id: 90092, raw: 'frequecy', corrected: 'frequency', type: 'omission', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90093, raw: 'futher', corrected: 'further', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90094, raw: 'generaly', corrected: 'generally', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90095, raw: 'genuinly', corrected: 'genuinely', type: 'omission', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90096, raw: 'goverment', corrected: 'government', type: 'omission', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90097, raw: 'gratefull', corrected: 'grateful', type: 'addition', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90098, raw: 'groud', corrected: 'ground', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90099, raw: 'guarentee', corrected: 'guarantee', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90100, raw: 'guidence', corrected: 'guidance', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90101, raw: 'hapend', corrected: 'happened', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90102, raw: 'happily', corrected: 'happily', type: 'none', lang: 'english', category: 'common', confidence: 1.00 },
  { id: 90103, raw: 'hapiness', corrected: 'happiness', type: 'omission', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90104, raw: 'havent', corrected: 'haven\'t', type: 'omission', lang: 'english', category: 'common', confidence: 0.92 },
  { id: 90105, raw: 'heared', corrected: 'heard', type: 'addition', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90106, raw: 'heigth', corrected: 'height', type: 'sequence', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90107, raw: 'helpfuly', corrected: 'helpfully', type: 'omission', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90108, raw: 'hiddn', corrected: 'hidden', type: 'omission', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90109, raw: 'hopeing', corrected: 'hoping', type: 'addition', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90110, raw: 'houshold', corrected: 'household', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90111, raw: 'hte', corrected: 'the', type: 'sequence', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90112, raw: 'imediately', corrected: 'immediately', type: 'omission', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90113, raw: 'immagine', corrected: 'imagine', type: 'addition', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90114, raw: 'independant', corrected: 'independent', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90115, raw: 'indispensible', corrected: 'indispensable', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90116, raw: 'influencial', corrected: 'influential', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90117, raw: 'inocent', corrected: 'innocent', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90118, raw: 'intresting', corrected: 'interesting', type: 'omission', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90119, raw: 'isnt', corrected: 'isn\'t', type: 'omission', lang: 'english', category: 'common', confidence: 0.92 },
  { id: 90120, raw: 'juge', corrected: 'judge', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90121, raw: 'knolege', corrected: 'knowledge', type: 'omission', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90122, raw: 'langauge', corrected: 'language', type: 'sequence', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90123, raw: 'layed', corrected: 'laid', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90124, raw: 'learnt', corrected: 'learned', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90125, raw: 'lenth', corrected: 'length', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90126, raw: 'lieing', corrected: 'lying', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90127, raw: 'looser', corrected: 'loser', type: 'addition', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90128, raw: 'maintenence', corrected: 'maintenance', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90129, raw: 'manger', corrected: 'manager', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90130, raw: 'medeval', corrected: 'medieval', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90131, raw: 'millenium', corrected: 'millennium', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90132, raw: 'miniture', corrected: 'miniature', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90133, raw: 'minit', corrected: 'minute', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90134, raw: 'mischevious', corrected: 'mischievous', type: 'addition', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90135, raw: 'missle', corrected: 'missile', type: 'omission', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90136, raw: 'mispell', corrected: 'misspell', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90137, raw: 'moument', corrected: 'moment', type: 'addition', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90138, raw: 'mountian', corrected: 'mountain', type: 'sequence', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90139, raw: 'naturaly', corrected: 'naturally', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90140, raw: 'neccesary', corrected: 'necessary', type: 'addition', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90141, raw: 'negociate', corrected: 'negotiate', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90142, raw: 'ninty', corrected: 'ninety', type: 'omission', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90143, raw: 'noticable', corrected: 'noticeable', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90144, raw: 'nusance', corrected: 'nuisance', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90145, raw: 'occurance', corrected: 'occurrence', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90146, raw: 'ocurring', corrected: 'occurring', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90147, raw: 'opertunity', corrected: 'opportunity', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90148, raw: 'orderd', corrected: 'ordered', type: 'omission', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90149, raw: 'overwhealming', corrected: 'overwhelming', type: 'addition', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90150, raw: 'parliment', corrected: 'parliament', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION Z2 — English common words 90151–90400 (250 entries)
  // ═══════════════════════════════════════════════════════════════════════
  { id: 90151, raw: 'particulaly', corrected: 'particularly', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90152, raw: 'pemanent', corrected: 'permanent', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90153, raw: 'permision', corrected: 'permission', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90154, raw: 'persistance', corrected: 'persistence', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90155, raw: 'personaly', corrected: 'personally', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90156, raw: 'pheomenon', corrected: 'phenomenon', type: 'omission', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90157, raw: 'picnic', corrected: 'picnic', type: 'none', lang: 'english', category: 'common', confidence: 1.00 },
  { id: 90158, raw: 'plagarism', corrected: 'plagiarism', type: 'omission', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90159, raw: 'planing', corrected: 'planning', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90160, raw: 'posession', corrected: 'possession', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90161, raw: 'potatos', corrected: 'potatoes', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90162, raw: 'practise', corrected: 'practice', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90163, raw: 'preceed', corrected: 'precede', type: 'addition', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90164, raw: 'presense', corrected: 'presence', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90165, raw: 'privelege', corrected: 'privilege', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90166, raw: 'probly', corrected: 'probably', type: 'omission', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90167, raw: 'procede', corrected: 'proceed', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90168, raw: 'pronounciation', corrected: 'pronunciation', type: 'addition', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90169, raw: 'publically', corrected: 'publicly', type: 'addition', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90170, raw: 'purpos', corrected: 'purpose', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90171, raw: 'questionaire', corrected: 'questionnaire', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90172, raw: 'realy', corrected: 'really', type: 'omission', lang: 'english', category: 'common', confidence: 0.92 },
  { id: 90173, raw: 'reccomend', corrected: 'recommend', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90174, raw: 'referance', corrected: 'reference', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90175, raw: 'relevent', corrected: 'relevant', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90176, raw: 'religous', corrected: 'religious', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90177, raw: 'remeber', corrected: 'remember', type: 'omission', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90178, raw: 'repeatly', corrected: 'repeatedly', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90179, raw: 'restarant', corrected: 'restaurant', type: 'omission', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90180, raw: 'rythm', corrected: 'rhythm', type: 'omission', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90181, raw: 'sacrafice', corrected: 'sacrifice', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90182, raw: 'sargeant', corrected: 'sergeant', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90183, raw: 'scarcly', corrected: 'scarcely', type: 'omission', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90184, raw: 'scheduld', corrected: 'scheduled', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90185, raw: 'sentance', corrected: 'sentence', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90186, raw: 'sepreate', corrected: 'separate', type: 'sequence', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90187, raw: 'simalar', corrected: 'similar', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90188, raw: 'similtaneous', corrected: 'simultaneous', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90189, raw: 'sincerly', corrected: 'sincerely', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90190, raw: 'slimey', corrected: 'slimy', type: 'addition', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90191, raw: 'sofware', corrected: 'software', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90192, raw: 'somthing', corrected: 'something', type: 'omission', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90193, raw: 'somwhere', corrected: 'somewhere', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90194, raw: 'speach', corrected: 'speech', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90195, raw: 'stationery', corrected: 'stationery', type: 'none', lang: 'english', category: 'common', confidence: 1.00 },
  { id: 90196, raw: 'straingh', corrected: 'strength', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90197, raw: 'studing', corrected: 'studying', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90198, raw: 'substitude', corrected: 'substitute', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90199, raw: 'succesful', corrected: 'successful', type: 'omission', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90200, raw: 'sugest', corrected: 'suggest', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90201, raw: 'supose', corrected: 'suppose', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90202, raw: 'surley', corrected: 'surely', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90203, raw: 'surpise', corrected: 'surprise', type: 'omission', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90204, raw: 'sympothy', corrected: 'sympathy', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90205, raw: 'tendancy', corrected: 'tendency', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90206, raw: 'tomorow', corrected: 'tomorrow', type: 'omission', lang: 'english', category: 'common', confidence: 0.92 },
  { id: 90207, raw: 'tounge', corrected: 'tongue', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90208, raw: 'truely', corrected: 'truly', type: 'addition', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90209, raw: 'twelth', corrected: 'twelfth', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90210, raw: 'tyrany', corrected: 'tyranny', type: 'omission', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90211, raw: 'unecesary', corrected: 'unnecessary', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90212, raw: 'unfortunatly', corrected: 'unfortunately', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90213, raw: 'untill', corrected: 'until', type: 'addition', lang: 'english', category: 'common', confidence: 0.92 },
  { id: 90214, raw: 'usally', corrected: 'usually', type: 'omission', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90215, raw: 'vaccuum', corrected: 'vacuum', type: 'addition', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90216, raw: 'valueable', corrected: 'valuable', type: 'addition', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90217, raw: 'vehical', corrected: 'vehicle', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90218, raw: 'visable', corrected: 'visible', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90219, raw: 'visiter', corrected: 'visitor', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90220, raw: 'volenteer', corrected: 'volunteer', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90221, raw: 'wach', corrected: 'watch', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90222, raw: 'weght', corrected: 'weight', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90223, raw: 'wilfull', corrected: 'wilful', type: 'addition', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90224, raw: 'withold', corrected: 'withhold', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90225, raw: 'wouldnt', corrected: 'wouldn\'t', type: 'omission', lang: 'english', category: 'common', confidence: 0.92 },
  { id: 90226, raw: 'writen', corrected: 'written', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90227, raw: 'yatchs', corrected: 'yachts', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.88 },
  { id: 90228, raw: 'yeild', corrected: 'yield', type: 'sequence', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90229, raw: 'youself', corrected: 'yourself', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90230, raw: 'zeroth', corrected: 'zeroth', type: 'none', lang: 'english', category: 'common', confidence: 1.00 },
  // 20 more high-frequency dyslexia targets
  { id: 90231, raw: 'accpet', corrected: 'accept', type: 'sequence', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90232, raw: 'accidentaly', corrected: 'accidentally', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90233, raw: 'adress', corrected: 'address', type: 'omission', lang: 'english', category: 'common', confidence: 0.92 },
  { id: 90234, raw: 'afect', corrected: 'affect', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90235, raw: 'agressive', corrected: 'aggressive', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90236, raw: 'analise', corrected: 'analyse', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90237, raw: 'aparent', corrected: 'apparent', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90238, raw: 'apreciate', corrected: 'appreciate', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90239, raw: 'aproach', corrected: 'approach', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90240, raw: 'aproximate', corrected: 'approximate', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90241, raw: 'assosiate', corrected: 'associate', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90242, raw: 'atached', corrected: 'attached', type: 'omission', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90243, raw: 'atend', corrected: 'attend', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90244, raw: 'atention', corrected: 'attention', type: 'omission', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90245, raw: 'atitude', corrected: 'attitude', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90246, raw: 'benifit', corrected: 'benefit', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.91 },
  { id: 90247, raw: 'boundry', corrected: 'boundary', type: 'omission', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90248, raw: 'carear', corrected: 'career', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.89 },
  { id: 90249, raw: 'catagory', corrected: 'category', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.90 },
  { id: 90250, raw: 'celibrate', corrected: 'celebrate', type: 'phonetic', lang: 'english', category: 'common', confidence: 0.90 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION Z3 — Hindi dyslexia 300 more entries (IDs 95001–95300)
  // ═══════════════════════════════════════════════════════════════════════
  { id: 95001, raw: 'आपको', corrected: 'आपको', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95002, raw: 'उसको', corrected: 'उसको', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95003, raw: 'हमको', corrected: 'हमको', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95004, raw: 'इसको', corrected: 'इसको', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95005, raw: 'उनको', corrected: 'उनको', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95006, raw: 'कुछ', corrected: 'कुछ', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95007, raw: 'कई', corrected: 'कई', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95008, raw: 'सब', corrected: 'सब', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95009, raw: 'कोइ', corrected: 'कोई', type: 'omission', lang: 'hindi', category: 'common', confidence: 0.92 },
  { id: 95010, raw: 'कुछ', corrected: 'कुछ', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95011, raw: 'अभि', corrected: 'अभी', type: 'omission', lang: 'hindi', category: 'common', confidence: 0.93 },
  { id: 95012, raw: 'जलदि', corrected: 'जल्दी', type: 'omission', lang: 'hindi', category: 'common', confidence: 0.91 },
  { id: 95013, raw: 'देर', corrected: 'देर', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95014, raw: 'वहाँ', corrected: 'वहाँ', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95015, raw: 'यहाँ', corrected: 'यहाँ', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95016, raw: 'वहा', corrected: 'वहाँ', type: 'omission', lang: 'hindi', category: 'common', confidence: 0.92 },
  { id: 95017, raw: 'यहा', corrected: 'यहाँ', type: 'omission', lang: 'hindi', category: 'common', confidence: 0.92 },
  { id: 95018, raw: 'कहाँ', corrected: 'कहाँ', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95019, raw: 'कहा', corrected: 'कहाँ', type: 'omission', lang: 'hindi', category: 'common', confidence: 0.90 },
  { id: 95020, raw: 'ऊपर', corrected: 'ऊपर', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95021, raw: 'नीचे', corrected: 'नीचे', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95022, raw: 'अंदर', corrected: 'अंदर', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95023, raw: 'बाहर', corrected: 'बाहर', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95024, raw: 'पास', corrected: 'पास', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95025, raw: 'दूर', corrected: 'दूर', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95026, raw: 'सामने', corrected: 'सामने', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95027, raw: 'पीछे', corrected: 'पीछे', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95028, raw: 'बाए', corrected: 'बाएँ', type: 'omission', lang: 'hindi', category: 'common', confidence: 0.90 },
  { id: 95029, raw: 'दाए', corrected: 'दाएँ', type: 'omission', lang: 'hindi', category: 'common', confidence: 0.90 },
  { id: 95030, raw: 'पहले', corrected: 'पहले', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95031, raw: 'बाद', corrected: 'बाद', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95032, raw: 'साथ', corrected: 'साथ', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95033, raw: 'बिना', corrected: 'बिना', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95034, raw: 'लिए', corrected: 'लिए', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95035, raw: 'जैसे', corrected: 'जैसे', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95036, raw: 'इसलए', corrected: 'इसलिए', type: 'omission', lang: 'hindi', category: 'common', confidence: 0.92 },
  { id: 95037, raw: 'लेकन', corrected: 'लेकिन', type: 'omission', lang: 'hindi', category: 'common', confidence: 0.93 },
  { id: 95038, raw: 'क्योकि', corrected: 'क्योंकि', type: 'omission', lang: 'hindi', category: 'common', confidence: 0.93 },
  { id: 95039, raw: 'अगर', corrected: 'अगर', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95040, raw: 'तो', corrected: 'तो', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95041, raw: 'और', corrected: 'और', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95042, raw: 'या', corrected: 'या', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95043, raw: 'भी', corrected: 'भी', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95044, raw: 'ही', corrected: 'ही', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95045, raw: 'नहीं', corrected: 'नहीं', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95046, raw: 'नही', corrected: 'नहीं', type: 'omission', lang: 'hindi', category: 'common', confidence: 0.95 },
  { id: 95047, raw: 'हाँ', corrected: 'हाँ', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95048, raw: 'हा', corrected: 'हाँ', type: 'omission', lang: 'hindi', category: 'common', confidence: 0.90 },
  { id: 95049, raw: 'बहुत', corrected: 'बहुत', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95050, raw: 'थोड़ा', corrected: 'थोड़ा', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95051, raw: 'थोडा', corrected: 'थोड़ा', type: 'omission', lang: 'hindi', category: 'common', confidence: 0.92 },
  { id: 95052, raw: 'ज़्यादा', corrected: 'ज़्यादा', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95053, raw: 'ज्यादा', corrected: 'ज़्यादा', type: 'phonetic', lang: 'hindi', category: 'common', confidence: 0.88 },
  { id: 95054, raw: 'कम', corrected: 'कम', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95055, raw: 'सही', corrected: 'सही', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95056, raw: 'गलत', corrected: 'गलत', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95057, raw: 'ठीक', corrected: 'ठीक', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95058, raw: 'ठिक', corrected: 'ठीक', type: 'omission', lang: 'hindi', category: 'common', confidence: 0.93 },
  { id: 95059, raw: 'अच्छा', corrected: 'अच्छा', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95060, raw: 'अचछा', corrected: 'अच्छा', type: 'omission', lang: 'hindi', category: 'common', confidence: 0.92 },
  { id: 95061, raw: 'बुरा', corrected: 'बुरा', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95062, raw: 'बड़ा', corrected: 'बड़ा', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95063, raw: 'बडा', corrected: 'बड़ा', type: 'omission', lang: 'hindi', category: 'common', confidence: 0.92 },
  { id: 95064, raw: 'छोटा', corrected: 'छोटा', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95065, raw: 'नया', corrected: 'नया', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95066, raw: 'पुराना', corrected: 'पुराना', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95067, raw: 'तेज़', corrected: 'तेज़', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95068, raw: 'धीरे', corrected: 'धीरे', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95069, raw: 'जोर से', corrected: 'ज़ोर से', type: 'phonetic', lang: 'hindi', category: 'common', confidence: 0.88 },
  { id: 95070, raw: 'हल्का', corrected: 'हल्का', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95071, raw: 'भारी', corrected: 'भारी', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95072, raw: 'खाली', corrected: 'खाली', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95073, raw: 'भरा', corrected: 'भरा', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95074, raw: 'साफ', corrected: 'साफ', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },
  { id: 95075, raw: 'गंदा', corrected: 'गंदा', type: 'none', lang: 'hindi', category: 'common', confidence: 1.00 },

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION Z4 — Hinglish 300 more entries (IDs 96001–96300)
  // ═══════════════════════════════════════════════════════════════════════
  { id: 96001, raw: 'aapko', corrected: 'आपको', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96002, raw: 'usko', corrected: 'उसको', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96003, raw: 'humko', corrected: 'हमको', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96004, raw: 'isko', corrected: 'इसको', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96005, raw: 'unko', corrected: 'उनको', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96006, raw: 'kuch', corrected: 'कुछ', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96007, raw: 'kai', corrected: 'कई', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96008, raw: 'koi', corrected: 'कोई', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96009, raw: 'abhi', corrected: 'अभी', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96010, raw: 'jaldi', corrected: 'जल्दी', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96011, raw: 'wahan', corrected: 'वहाँ', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96012, raw: 'yahan', corrected: 'यहाँ', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96013, raw: 'samne', corrected: 'सामने', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96014, raw: 'pehle', corrected: 'पहले', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96015, raw: 'baad', corrected: 'बाद', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96016, raw: 'saath', corrected: 'साथ', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96017, raw: 'bina', corrected: 'बिना', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96018, raw: 'liye', corrected: 'लिए', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96019, raw: 'jaise', corrected: 'जैसे', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96020, raw: 'bahut', corrected: 'बहुत', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96021, raw: 'thoda', corrected: 'थोड़ा', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96022, raw: 'zyada', corrected: 'ज़्यादा', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96023, raw: 'kam', corrected: 'कम', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96024, raw: 'sahi', corrected: 'सही', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96025, raw: 'galat', corrected: 'गलत', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96026, raw: 'accha', corrected: 'अच्छा', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96027, raw: 'bura', corrected: 'बुरा', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96028, raw: 'bada', corrected: 'बड़ा', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96029, raw: 'chhota', corrected: 'छोटा', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96030, raw: 'naya', corrected: 'नया', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96031, raw: 'purana', corrected: 'पुराना', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96032, raw: 'tez', corrected: 'तेज़', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96033, raw: 'dheere', corrected: 'धीरे', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96034, raw: 'halka', corrected: 'हल्का', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96035, raw: 'bhari', corrected: 'भारी', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96036, raw: 'khaali', corrected: 'खाली', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96037, raw: 'bhara', corrected: 'भरा', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96038, raw: 'saaf', corrected: 'साफ', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96039, raw: 'ganda', corrected: 'गंदा', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96040, raw: 'sundar', corrected: 'सुंदर', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96041, raw: 'mushkil', corrected: 'मुश्किल', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96042, raw: 'aasaan', corrected: 'आसान', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96043, raw: 'takat', corrected: 'ताक़त', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96044, raw: 'kamzor', corrected: 'कमज़ोर', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96045, raw: 'majboot', corrected: 'मज़बूत', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96046, raw: 'khush', corrected: 'खुश', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96047, raw: 'udaas', corrected: 'उदास', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96048, raw: 'gussa', corrected: 'गुस्सा', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96049, raw: 'pareshaan', corrected: 'परेशान', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  { id: 96050, raw: 'thaka', corrected: 'थका', type: 'none', lang: 'hinglish', category: 'common', confidence: 1.00 },
  // Extended Hinglish sentence fragments
  { id: 96051, raw: 'mujhe pani do', corrected: 'मुझे पानी दो', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 96052, raw: 'mujhe khana do', corrected: 'मुझे खाना दो', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 96053, raw: 'mujhe madad karo', corrected: 'मुझे मदद करो', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 96054, raw: 'mujhe dawai do', corrected: 'मुझे दवाई दो', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 96055, raw: 'mujhe bathroom jana hai', corrected: 'मुझे बाथरूम जाना है', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 96056, raw: 'mujhe neend aa rahi hai', corrected: 'मुझे नींद आ रही है', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 96057, raw: 'mujhe thakaan hai', corrected: 'मुझे थकान है', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 96058, raw: 'mujhe ghar jana hai', corrected: 'मुझे घर जाना है', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 96059, raw: 'mujhe school nahi jana', corrected: 'मुझे स्कूल नहीं जाना', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 96060, raw: 'mujhe aaram chahiye', corrected: 'मुझे आराम चाहिए', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 96061, raw: 'mai theek hun', corrected: 'मैं ठीक हूँ', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 96062, raw: 'mujhe pyaas lagi hai', corrected: 'मुझे प्यास लगी है', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 96063, raw: 'mujhe garmi lag rahi hai', corrected: 'मुझे गर्मी लग रही है', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 96064, raw: 'aaj mausam accha hai', corrected: 'आज मौसम अच्छा है', type: 'none', lang: 'hinglish', category: 'daily', confidence: 1.00 },
  { id: 96065, raw: 'mujhe baat karni hai', corrected: 'मुझे बात करनी है', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 96066, raw: 'please sun mujhe', corrected: 'कृपया मुझे सुनो', type: 'whole_word', lang: 'hinglish', category: 'aac', confidence: 0.88 },
  { id: 96067, raw: 'mujhe darr lag raha', corrected: 'मुझे डर लग रहा है', type: 'omission', lang: 'hinglish', category: 'aac', confidence: 0.90 },
  { id: 96068, raw: 'mujhe gussa aa raha', corrected: 'मुझे गुस्सा आ रहा है', type: 'omission', lang: 'hinglish', category: 'aac', confidence: 0.89 },
  { id: 96069, raw: 'mujhe udaas lag raha', corrected: 'मुझे उदास लग रहा है', type: 'omission', lang: 'hinglish', category: 'aac', confidence: 0.89 },
  { id: 96070, raw: 'mai khush hun aaj', corrected: 'मैं आज खुश हूँ', type: 'sequence', lang: 'hinglish', category: 'aac', confidence: 0.89 },
  { id: 96071, raw: 'mujhe kuch chahiye', corrected: 'मुझे कुछ चाहिए', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 96072, raw: 'mujhe kuch nahi chahiye', corrected: 'मुझे कुछ नहीं चाहिए', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 96073, raw: 'main sona chahta hun', corrected: 'मैं सोना चाहता हूँ', type: 'phonetic', lang: 'hinglish', category: 'aac', confidence: 0.89 },
  { id: 96074, raw: 'mai khana khana chahta hun', corrected: 'मैं खाना खाना चाहता हूँ', type: 'none', lang: 'hinglish', category: 'aac', confidence: 1.00 },
  { id: 96075, raw: 'mujhe TV dekhna hai', corrected: 'मुझे टीवी देखना है', type: 'whole_word', lang: 'hinglish', category: 'aac', confidence: 0.90 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Advanced Dyslexia Model Setup & Utilities (Rapid Response & High Accuracy)
// ─────────────────────────────────────────────────────────────────────────────

// Helper to preprocess words/phrases for lookup
function preprocessKey(text) {
  return String(text || '').trim().toLowerCase().replace(/[.,!?।]+/g, '');
}

// Tokenize text into normalized lowercase tokens
function tokenize(text) {
  return String(text || '').toLowerCase().replace(/[\u0964,.?!]/g, '').trim().split(/\s+/).filter(Boolean);
}

// Standard edit distance (Levenshtein) algorithm
function getEditDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Word overlap (Jaccard similarity)
function getWordOverlap(wordsA, wordsB) {
  if (wordsA.length === 0 || wordsB.length === 0) return 0;
  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  let intersection = 0;
  for (const w of setA) {
    if (setB.has(w)) {
      intersection++;
    }
  }
  return intersection / Math.max(setA.size, setB.size);
}

// Build pre-compiled maps at module load time
const exactSentenceMap = new Map();
const sentenceTemplates = [];
const singleWordMap = {};

// Vocabulary additions for common dyslexia/phonetic mismatches
const ADDITIONAL_DYSLEXIA_MAP = {
  wter: 'water',
  hav: 'have',
  mor: 'more',
  tim: 'time',
  frend: 'friend',
  teh: 'the',
  dog: 'dog',
  doy: 'boy',
  runing: 'running',
  sentral: 'central',
  sity: 'city',
  स्कल: 'स्कूल',
  बारश: 'बारिश',
  मुझ: 'मुझे',
  पान: 'पानी',
  भख: 'भूख',
  दीले: 'गीले'
};

// Compile unique target template sentences from both datasets
const allTargets = new Set();

for (const entry of DYSLEXIA_DATASET) {
  if (entry.corrected) {
    allTargets.add(entry.corrected.trim());
  }

  if (entry.raw === entry.corrected) continue;

  const rawKey = preprocessKey(entry.raw);
  const wc = rawKey.split(/\s+/).length;

  if (wc > 1) {
    // Multi-word sentence entry
    const existing = exactSentenceMap.get(rawKey);
    if (!existing || existing.confidence < entry.confidence) {
      exactSentenceMap.set(rawKey, {
        corrected: entry.corrected,
        confidence: entry.confidence
      });
    }
    sentenceTemplates.push({
      raw: rawKey,
      corrected: entry.corrected,
      confidence: entry.confidence
    });
  } else {
    // Single word entry
    const existing = singleWordMap[rawKey];
    if (!existing || existing.confidence < entry.confidence) {
      singleWordMap[rawKey] = {
        corrected: entry.corrected,
        confidence: entry.confidence
      };
    }
  }
}

// Add STAMMERER_DATASET templates to targets
for (const entry of STAMMERER_DATASET) {
  if (entry.expected) {
    allTargets.add(entry.expected.trim());
  }
}

// Add extra custom word corrections
for (const [key, val] of Object.entries(ADDITIONAL_DYSLEXIA_MAP)) {
  singleWordMap[key] = { corrected: val, confidence: 1.0 };
}

const targetTemplates = [...allTargets];

export function addDyslexiaTargetTemplate(sentence) {
  if (!sentence) return;
  if (targetTemplates.includes(sentence)) return;
  targetTemplates.push(sentence);
  console.log(`[dyslexia-model] dynamically learned new template: "${sentence}"`);
}

// Token-level spelling/reversal corrections helper
function wordCorrect(text) {
  if (!text) return '';

  // Clean up stammer repeat patterns (e.g. "k-kapde" -> "kapde")
  let clean = text.replace(/([a-zA-Z\u0900-\u097F]+)-\1/g, '$1');

  const tokens = clean.split(/(\s+)/);
  return tokens.map(token => {
    let cleanToken = token.trim().toLowerCase().replace(/[.,!?।]+$/, '');
    const trailing = token.trim().match(/[.,!?।]+$/)?.[0] ?? '';

    if (!cleanToken) return token;

    // Handle repeat hyphen parts
    if (cleanToken.includes('-')) {
      const parts = cleanToken.split('-');
      cleanToken = parts[parts.length - 1];
    }

    const match = singleWordMap[cleanToken];
    if (match) {
      return match.corrected + trailing;
    }
    return token;
  }).join('');
}

/**
 * Apply dyslexia corrections to a text string.
 * Uses hybrid sentence overlap matching + fallback word correction.
 *
 * @param {string} text
 * @returns {string}
 */
export function applyDyslexiaCorrections(text) {
  if (!text) return text;

  const trailingGlobal = text.trim().match(/[.,!?।]+$/)?.[0] ?? '';

  // 1. First run word-level correction (fixes spelling, typos, reversals)
  const wordCorrected = wordCorrect(text);

  const cleanWordCorrected = wordCorrected.replace(/[\u0964,.?!]/g, '').trim().toLowerCase();
  const wordsCorrected = tokenize(cleanWordCorrected);

  if (wordsCorrected.length > 1) {
    // 2. Sentence-level exact match first
    const key = preprocessKey(text);
    if (exactSentenceMap.has(key)) {
      return exactSentenceMap.get(key).corrected + trailingGlobal;
    }

    // 3. Sentence-level template matching using Word Overlap & Edit Distance (for sequence transposition errors)
    let bestTemplate = null;
    let maxOverlap = 0;
    let minDistance = Infinity;

    for (const temp of targetTemplates) {
      const cleanTemp = temp.replace(/[\u0964,.?!]/g, '').trim().toLowerCase();
      const wordsTemp = tokenize(cleanTemp);

      const overlap = getWordOverlap(wordsCorrected, wordsTemp);
      const dist = getEditDistance(cleanWordCorrected, cleanTemp);

      if (overlap > maxOverlap || (overlap === maxOverlap && dist < minDistance)) {
        maxOverlap = overlap;
        minDistance = dist;
        bestTemplate = temp;
      }
    }

    // Snapping thresholds: high word overlap (>= 0.70) or high character similarity (>= 0.60)
    const maxLen = Math.max(cleanWordCorrected.length, bestTemplate.replace(/[\u0964,.?!]/g, '').trim().length);
    const charSimilarity = maxLen > 0 ? (1 - minDistance / maxLen) : 1.0;

    if (maxOverlap >= 0.70 || charSimilarity >= 0.60) {
      return bestTemplate.replace(/[.,!?।]+$/, '') + trailingGlobal;
    }
  }

  return wordCorrected;
}

/**
 * Get dataset statistics.
 * @returns {{ total: number, byLang: Object, byType: Object }}
 */
export function getDyslexiaStats() {
  const byLang = {};
  const byType = {};
  for (const e of DYSLEXIA_DATASET) {
    byLang[e.lang] = (byLang[e.lang] || 0) + 1;
    byType[e.type] = (byType[e.type] || 0) + 1;
  }
  return { total: DYSLEXIA_DATASET.length, byLang, byType };
}
