/**
 * Hinglish (Roman Hindi) → Devanagari transliteration.
 *
 * This module maps common Romanised Hindi words to Devanagari so the LLM
 * correction pipeline can process them correctly. It is deliberately a
 * finite dictionary of high-frequency words rather than a general-purpose
 * transliterator, to avoid false positives on English words.
 *
 * Applied as a pre-processing step in the correction pipeline.
 */

/** Word-level Hinglish → Devanagari map (case-insensitive) */
const HINGLISH_MAP = {
  // ── Pronouns & particles ──────────────────────────────────────────────
  mai: 'मैं', main: 'मैं', mein: 'में', me: 'मैं',
  hum: 'हम', tum: 'तुम', tu: 'तू', aap: 'आप',
  wo: 'वो', woh: 'वो', ye: 'यह', yeh: 'यह',
  uska: 'उसका', uski: 'उसकी', uske: 'उसके',
  mera: 'मेरा', meri: 'मेरी', mere: 'मेरे',
  tera: 'तेरा', teri: 'तेरी', tere: 'तेरे',
  humara: 'हमारा', humari: 'हमारी', humare: 'हमारे',
  ka: 'का', ki: 'की', ke: 'के',
  ko: 'को', se: 'से', pe: 'पे', par: 'पर', pr: 'पर',
  ne: 'ने', mujhe: 'मुझे', mujhse: 'मुझसे',
  kya: 'क्या', kab: 'कब', kaha: 'कहा', kahan: 'कहाँ',
  kaun: 'कौन', kaise: 'कैसे', kyun: 'क्यों', kyu: 'क्यों',
  aur: 'और', ya: 'या', lekin: 'लेकिन', par: 'पर',
  toh: 'तो', to: 'तो', bhi: 'भी', hi: 'ही',
  nahi: 'नहीं', nahin: 'नहीं', na: 'ना', mat: 'मत',
  sirf: 'सिर्फ', bas: 'बस', bahut: 'बहुत',
  abhi: 'अभी', ab: 'अब', phir: 'फिर', tab: 'तब',
  jab: 'जब', agar: 'अगर', isliye: 'इसलिए', islye: 'इसलिए',
  kiyuki: 'क्योंकि', kyunki: 'क्योंकि', kyuki: 'क्योंकि', kynki: 'क्योंकि',
  warna: 'वरना',

  // ── Verbs & actions ───────────────────────────────────────────────────
  hai: 'है', hain: 'हैं', tha: 'था', thi: 'थी', the: 'थे',
  ho: 'हो', hua: 'हुआ', hui: 'हुई', hue: 'हुए',
  hoga: 'होगा', hogi: 'होगी', honge: 'होंगे',
  hun: 'हूँ', hoon: 'हूँ',
  kar: 'कर', karo: 'करो', karna: 'करना', karta: 'करता', karti: 'करती',
  kiya: 'किया', kiye: 'किए', karenge: 'करेंगे', kare: 'करें', karen: 'करें',
  ja: 'जा', jao: 'जाओ', jana: 'जाना', jata: 'जाता', jati: 'जाती',
  gaya: 'गया', gayi: 'गई', gae: 'गई', gaye: 'गए', gaey: 'गई',
  aa: 'आ', aao: 'आओ', aana: 'आना', aata: 'आता', aati: 'आती',
  aaya: 'आया', aayi: 'आई', aaye: 'आए',
  de: 'दे', do: 'दो', dena: 'देना', deta: 'देता', deti: 'देती',
  diya: 'दिया', diye: 'दिए', di: 'दी',
  le: 'ले', lo: 'लो', lena: 'लेना', leta: 'लेता', leti: 'लेती',
  liya: 'लिया', liye: 'लिए', li: 'ली',
  bol: 'बोल', bolo: 'बोलो', bolna: 'बोलना', bola: 'बोला', boli: 'बोली',
  kha: 'खा', khao: 'खाओ', khana: 'खाना', khata: 'खाता', khati: 'खाती',
  khaya: 'खाया', khayi: 'खाई', khaye: 'खाए',
  pi: 'पी', piyo: 'पियो', pina: 'पीना', piya: 'पिया',
  dekh: 'देख', dekho: 'देखो', dekhna: 'देखना', dekha: 'देखा',
  sun: 'सुन', suno: 'सुनो', sunna: 'सुनना', suna: 'सुना',
  ruk: 'रुक', ruko: 'रुको', rukna: 'रुकना', ruka: 'रुका',
  chal: 'चल', chalo: 'चलो', chalna: 'चलना', chala: 'चला',
  soch: 'सोच', socho: 'सोचो', sochna: 'सोचना', socha: 'सोचा',
  samajh: 'समझ', samjho: 'समझो', samjhna: 'समझना', samjha: 'समझा',
  baith: 'बैठ', baitho: 'बैठो', baithna: 'बैठना', baitha: 'बैठा',
  uth: 'उठ', utho: 'उठो', uthna: 'उठना', utha: 'उठा',
  so: 'सो', sona: 'सोना', soya: 'सोया', soyi: 'सोई',
  rota: 'रोता', roti: 'रोती', rona: 'रोना', roya: 'रोया', royi: 'रोई',
  ro: 'रो',
  lag: 'लग', laga: 'लगा', lagi: 'लगी', lage: 'लगे',
  rahe: 'रहे', raha: 'रहा', rahi: 'रही',
  paya: 'पाया', payi: 'पाई', paye: 'पाए',
  chahta: 'चाहता', chahti: 'चाहती', chahiye: 'चाहिए',
  sakta: 'सकता', sakti: 'सकती', sake: 'सके',
  pada: 'पड़ा', padi: 'पड़ी', pade: 'पड़े',

  // ── Daily life / needs (AAC priority words) ───────────────────────────
  paani: 'पानी', pani: 'पानी',
  school: 'स्कूल', skool: 'स्कूल', iskool: 'स्कूल',
  barish: 'बारिश', baarish: 'बारिश', varsha: 'बारिश',
  thand: 'ठंड', thanda: 'ठंडा', thandi: 'ठंडी',
  garmi: 'गर्मी', garam: 'गरम',
  bhookh: 'भूख', bhuk: 'भूख', bhukh: 'भूख',
  dard: 'दर्द',
  dawai: 'दवाई', davai: 'दवाई', dawa: 'दवा',
  madad: 'मदद', help: 'मदद',
  bathroom: 'बाथरूम',
  papa: 'पापा', mummy: 'मम्मी', maa: 'माँ', ma: 'माँ',
  ghar: 'घर', kamra: 'कमरा', room: 'कमरा',
  kapde: 'कपड़े', kapre: 'कपड़े', kapdey: 'कपड़े',
  geele: 'गीले', ghele: 'गीले', gile: 'गीले',
  roti: 'रोटी', chawal: 'चावल', sabzi: 'सब्ज़ी',
  doodh: 'दूध', dudh: 'दूध', chai: 'चाय',
  neend: 'नींद', nind: 'नींद',
  thak: 'थक', thaka: 'थका', thaki: 'थकी',
  aaraam: 'आराम', aaram: 'आराम',
  khush: 'खुश', khushi: 'खुशी',
  darr: 'डर', dar: 'डर',
  sir: 'सिर', sar: 'सिर', pet: 'पेट',
  aankh: 'आँख', kaan: 'कान', hath: 'हाथ', pair: 'पैर', paer: 'पैर',
  bukhar: 'बुखार', sujan: 'सूजन',
  doctor: 'डॉक्टर',

  // ── Time / day ────────────────────────────────────────────────────────
  aaj: 'आज', kal: 'कल', parso: 'परसों',
  subah: 'सुबह', dopahar: 'दोपहर', shaam: 'शाम', raat: 'रात',
  din: 'दिन', mahina: 'महीना', saal: 'साल',

  // ── Misc common words ─────────────────────────────────────────────────
  accha: 'अच्छा', achha: 'अच्छा', acha: 'अच्छा',
  bura: 'बुरा', buri: 'बुरी',
  sab: 'सब', sabko: 'सबको',
  kuch: 'कुछ', koi: 'कोई',
  jhat: 'झट', jaldi: 'जल्दी',
  dhear: 'देर', der: 'देर',
  bahar: 'बाहर',
  andar: 'अंदर',
  upar: 'ऊपर', niche: 'नीचे', neeche: 'नीचे',
  saamne: 'सामने', piche: 'पीछे', peche: 'पीछे',
  gold: 'सोना', fd: 'एफडी',
  karva: 'करवा', karwa: 'करवा',
  leke: 'लेके', lekar: 'लेकर',
  wapas: 'वापस',
  theek: 'ठीक', thik: 'ठीक',
  kripya: 'कृपया', please: 'कृपया',
  dhanyawad: 'धन्यवाद', shukriya: 'शुक्रिया', thanks: 'शुक्रिया',
  haan: 'हाँ', ha: 'हाँ',

  // ── Stammerer Specific Common Variations ────────────────────────────────
  mujhe: 'मुझे', mje: 'मुझे', mjhe: 'मुझे',
  pani: 'पानी', paani: 'पानी', panee: 'पानी',
  khaana: 'खाना', khana: 'खाना', khane: 'खाने',
  khao: 'खाओ', khaunga: 'खाऊंगा',
  bhukh: 'भूख', bhookh: 'भूख',
  pyaas: 'प्यास', pyas: 'प्यास',
  dard: 'दर्द', pain: 'दर्द',
  dawae: 'दवाई', dawai: 'दवाई', dawa: 'दवा',
  sardi: 'सर्दी', khasi: 'खांसी',
  chahiye: 'चाहिए', chaiye: 'चाहिए', cheye: 'चाहिए',
  madad: 'मदद',
  bulao: 'बुलाओ', bula: 'बुला',
  baat: 'बात', batao: 'बताओ',
  suno: 'सुनो', sunna: 'सुनना',
  kya: 'क्या', ka: 'क्या',
  kaise: 'कैसे', kese: 'कैसे',
  kyu: 'क्यों', kyun: 'क्यों',
  aaj: 'आज', aj: 'आज',
  kal: 'कल',
  abhi: 'अभी', abi: 'अभी',
  baad: 'बाद', bad: 'बाद',
  me: 'में', mein: 'में',
  par: 'पर', pr: 'पर', pe: 'पे',
  hai: 'है', he: 'है',
  tha: 'था', thi: 'थी', the: 'थे',
  karna: 'करना', krna: 'करना',
  karo: 'करो', kro: 'करो',
  kiya: 'किया',
  gaya: 'गया',
  hui: 'हुई',
  ho: 'हो',
  raha: 'रहा', rahi: 'रही', rahe: 'रहे',
  sakta: 'सकता',
  // Repetition prefixes in romanized input
  'mu-mujhe': 'मुझे', 'pa-paani': 'पानी', 'cha-chahiye': 'चाहिए',
  'kha-khana': 'खाना', 'ja-jana': 'जाना', 'ba-bahar': 'बाहर',
};

/**
 * Build a regex that matches any Hinglish token at word boundaries.
 * Sorted longest-first so "kiyuki" matches before "ki".
 */
const sortedKeys = Object.keys(HINGLISH_MAP).sort((a, b) => b.length - a.length);
const HINGLISH_RE = new RegExp(
  `(?<![a-zA-Z])(${sortedKeys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![a-zA-Z])`,
  'gi',
);

/**
 * Check if text contains any Roman Hindi tokens.
 * @param {string} text
 * @returns {boolean}
 */
export function hasHinglish(text) {
  if (!text) return false;
  return HINGLISH_RE.test(text);
}

/**
 * Transliterate Hinglish words to Devanagari.
 * Only replaces known dictionary words — English words not in the map are left as-is.
 * @param {string} text
 * @returns {string}
 */
export function transliterateHinglish(text) {
  if (!text) return text;

  // Reset lastIndex since we reuse the global regex
  HINGLISH_RE.lastIndex = 0;

  return text.replace(HINGLISH_RE, (match) => {
    const lower = match.toLowerCase();
    return HINGLISH_MAP[lower] ?? match;
  });
}

/**
 * Get Hinglish mappings as a hint string for the LLM.
 * Returns only the most common entries to avoid prompt bloat.
 * @param {number} limit
 * @returns {string}
 */
export function getHinglishHintsForLLM(limit = 40) {
  const priority = [
    'mai', 'mein', 'aaj', 'kal', 'school', 'nahi', 'kiyuki', 'barish',
    'gaya', 'gayi', 'gae', 'ho', 'hai', 'tha', 'thi', 'chahta', 'chahiye',
    'paya', 'ja', 'jana', 'karna', 'kiya', 'diya', 'liya', 'khana', 'khaya',
    'paani', 'dard', 'madad', 'dawai', 'bhookh', 'thaka', 'aaraam', 'khush',
    'roti', 'kapde', 'geele', 'bahar', 'kha',
  ];

  return priority
    .slice(0, limit)
    .filter((k) => HINGLISH_MAP[k])
    .map((k) => `"${k}"→"${HINGLISH_MAP[k]}"`)
    .join(', ');
}
