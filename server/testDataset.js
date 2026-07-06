/**
 * Test datasets for the structured 3-phase test.
 *
 * Phase 1(a) — ENGLISH_LETTER_DATASET: Full A–Z English alphabet
 * Phase 1(b) — HINDI_VARNMALA_DATASET: Full अ–ज्ञ Hindi Varnmala
 * Phase 2    — SENTENCE_DATASET: Hindi & Hinglish sentences
 * Phase 3    — PARAGRAPH_DATASET: Multi-sentence paragraphs
 */

// ─────────────────────────────────────────────────────────────────────────────
// Phase 1(a) — Full English Alphabet A–Z
// ─────────────────────────────────────────────────────────────────────────────

export const ENGLISH_LETTER_DATASET = [
  { id: 1001, script: 'english', letter: 'A', spoken: 'ए',      example: 'Apple / सेब' },
  { id: 1002, script: 'english', letter: 'B', spoken: 'बी',     example: 'Ball / गेंद' },
  { id: 1003, script: 'english', letter: 'C', spoken: 'सी',     example: 'Cat / बिल्ली' },
  { id: 1004, script: 'english', letter: 'D', spoken: 'डी',     example: 'Dog / कुत्ता' },
  { id: 1005, script: 'english', letter: 'E', spoken: 'ई',      example: 'Egg / अंडा' },
  { id: 1006, script: 'english', letter: 'F', spoken: 'एफ',     example: 'Fish / मछली' },
  { id: 1007, script: 'english', letter: 'G', spoken: 'जी',     example: 'Girl / लड़की' },
  { id: 1008, script: 'english', letter: 'H', spoken: 'एच',     example: 'Help / मदद' },
  { id: 1009, script: 'english', letter: 'I', spoken: 'आई',     example: 'Ice / बर्फ' },
  { id: 1010, script: 'english', letter: 'J', spoken: 'जे',     example: 'Jug / जग' },
  { id: 1011, script: 'english', letter: 'K', spoken: 'के',     example: 'Kite / पतंग' },
  { id: 1012, script: 'english', letter: 'L', spoken: 'एल',     example: 'Lion / शेर' },
  { id: 1013, script: 'english', letter: 'M', spoken: 'एम',     example: 'Maa / माँ' },
  { id: 1014, script: 'english', letter: 'N', spoken: 'एन',     example: 'Nose / नाक' },
  { id: 1015, script: 'english', letter: 'O', spoken: 'ओ',      example: 'Orange / संतरा' },
  { id: 1016, script: 'english', letter: 'P', spoken: 'पी',     example: 'Pani / पानी' },
  { id: 1017, script: 'english', letter: 'Q', spoken: 'क्यू',   example: 'Queen / रानी' },
  { id: 1018, script: 'english', letter: 'R', spoken: 'आर',     example: 'Rain / बारिश' },
  { id: 1019, script: 'english', letter: 'S', spoken: 'एस',     example: 'School / स्कूल' },
  { id: 1020, script: 'english', letter: 'T', spoken: 'टी',     example: 'Tree / पेड़' },
  { id: 1021, script: 'english', letter: 'U', spoken: 'यू',     example: 'Umbrella / छाता' },
  { id: 1022, script: 'english', letter: 'V', spoken: 'वी',     example: 'Van / गाड़ी' },
  { id: 1023, script: 'english', letter: 'W', spoken: 'डब्ल्यू', example: 'Water / पानी' },
  { id: 1024, script: 'english', letter: 'X', spoken: 'एक्स',   example: 'X-ray / एक्स-रे' },
  { id: 1025, script: 'english', letter: 'Y', spoken: 'वाई',    example: 'Yellow / पीला' },
  { id: 1026, script: 'english', letter: 'Z', spoken: 'ज़ेड',   example: 'Zoo / चिड़ियाघर' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Phase 1(b) — Full Hindi Varnmala अ–ज्ञ
// ─────────────────────────────────────────────────────────────────────────────

export const HINDI_VARNMALA_DATASET = [
  // स्वर (Vowels)
  { id: 2001, script: 'hindi', letter: 'अ',  spoken: 'अ',  example: 'अनार',   category: 'स्वर' },
  { id: 2002, script: 'hindi', letter: 'आ',  spoken: 'आ',  example: 'आम',     category: 'स्वर' },
  { id: 2003, script: 'hindi', letter: 'इ',  spoken: 'इ',  example: 'इमली',   category: 'स्वर' },
  { id: 2004, script: 'hindi', letter: 'ई',  spoken: 'ई',  example: 'ईख',     category: 'स्वर' },
  { id: 2005, script: 'hindi', letter: 'उ',  spoken: 'उ',  example: 'उल्लू',  category: 'स्वर' },
  { id: 2006, script: 'hindi', letter: 'ऊ',  spoken: 'ऊ',  example: 'ऊन',     category: 'स्वर' },
  { id: 2007, script: 'hindi', letter: 'ए',  spoken: 'ए',  example: 'एक',     category: 'स्वर' },
  { id: 2008, script: 'hindi', letter: 'ऐ',  spoken: 'ऐ',  example: 'ऐनक',    category: 'स्वर' },
  { id: 2009, script: 'hindi', letter: 'ओ',  spoken: 'ओ',  example: 'ओखली',   category: 'स्वर' },
  { id: 2010, script: 'hindi', letter: 'औ',  spoken: 'औ',  example: 'औरत',    category: 'स्वर' },
  { id: 2011, script: 'hindi', letter: 'अं', spoken: 'अं', example: 'अंगूर',  category: 'स्वर' },
  { id: 2012, script: 'hindi', letter: 'अः', spoken: 'अः', example: 'अतः',    category: 'स्वर' },

  // व्यंजन — क वर्ग
  { id: 2013, script: 'hindi', letter: 'क',  spoken: 'क',  example: 'कमल',    category: 'क वर्ग' },
  { id: 2014, script: 'hindi', letter: 'ख',  spoken: 'ख',  example: 'खरगोश',  category: 'क वर्ग' },
  { id: 2015, script: 'hindi', letter: 'ग',  spoken: 'ग',  example: 'गमला',   category: 'क वर्ग' },
  { id: 2016, script: 'hindi', letter: 'घ',  spoken: 'घ',  example: 'घर',     category: 'क वर्ग' },
  { id: 2017, script: 'hindi', letter: 'ङ',  spoken: 'ङ',  example: 'अंग',    category: 'क वर्ग' },

  // च वर्ग
  { id: 2018, script: 'hindi', letter: 'च',  spoken: 'च',  example: 'चम्मच',  category: 'च वर्ग' },
  { id: 2019, script: 'hindi', letter: 'छ',  spoken: 'छ',  example: 'छाता',   category: 'च वर्ग' },
  { id: 2020, script: 'hindi', letter: 'ज',  spoken: 'ज',  example: 'जहाज',   category: 'च वर्ग' },
  { id: 2021, script: 'hindi', letter: 'झ',  spoken: 'झ',  example: 'झंडा',   category: 'च वर्ग' },
  { id: 2022, script: 'hindi', letter: 'ञ',  spoken: 'ञ',  example: 'ज्ञान',   category: 'च वर्ग' },

  // ट वर्ग
  { id: 2023, script: 'hindi', letter: 'ट',  spoken: 'ट',  example: 'टमाटर',  category: 'ट वर्ग' },
  { id: 2024, script: 'hindi', letter: 'ठ',  spoken: 'ठ',  example: 'ठंड',    category: 'ट वर्ग' },
  { id: 2025, script: 'hindi', letter: 'ड',  spoken: 'ड',  example: 'डमरू',   category: 'ट वर्ग' },
  { id: 2026, script: 'hindi', letter: 'ढ',  spoken: 'ढ',  example: 'ढक्कन',  category: 'ट वर्ग' },
  { id: 2027, script: 'hindi', letter: 'ण',  spoken: 'ण',  example: 'गुण',    category: 'ट वर्ग' },

  // त वर्ग
  { id: 2028, script: 'hindi', letter: 'त',  spoken: 'त',  example: 'तरबूज',  category: 'त वर्ग' },
  { id: 2029, script: 'hindi', letter: 'थ',  spoken: 'थ',  example: 'थाली',   category: 'त वर्ग' },
  { id: 2030, script: 'hindi', letter: 'द',  spoken: 'द',  example: 'दवाई',   category: 'त वर्ग' },
  { id: 2031, script: 'hindi', letter: 'ध',  spoken: 'ध',  example: 'धनुष',   category: 'त वर्ग' },
  { id: 2032, script: 'hindi', letter: 'न',  spoken: 'न',  example: 'नल',     category: 'त वर्ग' },

  // प वर्ग
  { id: 2033, script: 'hindi', letter: 'प',  spoken: 'प',  example: 'पतंग',   category: 'प वर्ग' },
  { id: 2034, script: 'hindi', letter: 'फ',  spoken: 'फ',  example: 'फल',     category: 'प वर्ग' },
  { id: 2035, script: 'hindi', letter: 'ब',  spoken: 'ब',  example: 'बकरी',   category: 'प वर्ग' },
  { id: 2036, script: 'hindi', letter: 'भ',  spoken: 'भ',  example: 'भालू',   category: 'प वर्ग' },
  { id: 2037, script: 'hindi', letter: 'म',  spoken: 'म',  example: 'मछली',   category: 'प वर्ग' },

  // अन्तःस्थ
  { id: 2038, script: 'hindi', letter: 'य',  spoken: 'य',  example: 'यज्ञ',   category: 'अन्तःस्थ' },
  { id: 2039, script: 'hindi', letter: 'र',  spoken: 'र',  example: 'रोटी',   category: 'अन्तःस्थ' },
  { id: 2040, script: 'hindi', letter: 'ल',  spoken: 'ल',  example: 'लड्डू',  category: 'अन्तःस्थ' },
  { id: 2041, script: 'hindi', letter: 'व',  spoken: 'व',  example: 'वन',     category: 'अन्तःस्थ' },

  // ऊष्म
  { id: 2042, script: 'hindi', letter: 'श',  spoken: 'श',  example: 'शेर',    category: 'ऊष्म' },
  { id: 2043, script: 'hindi', letter: 'ष',  spoken: 'ष',  example: 'षटकोण',  category: 'ऊष्म' },
  { id: 2044, script: 'hindi', letter: 'स',  spoken: 'स',  example: 'सेब',    category: 'ऊष्म' },
  { id: 2045, script: 'hindi', letter: 'ह',  spoken: 'ह',  example: 'हाथी',   category: 'ऊष्म' },

  // संयुक्त
  { id: 2046, script: 'hindi', letter: 'क्ष', spoken: 'क्ष', example: 'क्षत्रिय', category: 'संयुक्त' },
  { id: 2047, script: 'hindi', letter: 'त्र', spoken: 'त्र', example: 'त्रिशूल',  category: 'संयुक्त' },
  { id: 2048, script: 'hindi', letter: 'ज्ञ', spoken: 'ज्ञ', example: 'ज्ञान',    category: 'संयुक्त' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Phase 2 — Sentence Test (Hindi + Hinglish)
// ─────────────────────────────────────────────────────────────────────────────

export const SENTENCE_DATASET = [
  // Easy
  { id: 3001, hindi: 'मुझे पानी चाहिए।',                         hinglish: 'mujhe paani chahiye',           category: 'needs',    difficulty: 'easy' },
  { id: 3002, hindi: 'मुझे भूख लगी है।',                          hinglish: 'mujhe bhookh lagi hai',          category: 'needs',    difficulty: 'easy' },
  { id: 3003, hindi: 'मुझे बाथरूम जाना है।',                      hinglish: 'mujhe bathroom jana hai',        category: 'needs',    difficulty: 'easy' },
  { id: 3004, hindi: 'मुझे दवाई चाहिए।',                          hinglish: 'mujhe dawai chahiye',            category: 'health',   difficulty: 'easy' },
  { id: 3005, hindi: 'मुझे ठंड लग रही है।',                       hinglish: 'mujhe thand lag rahi hai',       category: 'weather',  difficulty: 'easy' },
  { id: 3006, hindi: 'कृपया मेरी मदद करें।',                      hinglish: 'kripya meri madad karen',        category: 'help',     difficulty: 'easy' },
  { id: 3007, hindi: 'मैं खुश हूँ।',                               hinglish: 'mai khush hun',                  category: 'feelings', difficulty: 'easy' },
  { id: 3008, hindi: 'मुझे डर लग रहा है।',                        hinglish: 'mujhe darr lag raha hai',        category: 'feelings', difficulty: 'easy' },

  // Medium
  { id: 3009, hindi: 'मुझे बहुत दर्द हो रहा है।',                hinglish: 'mujhe bahut dard ho raha hai',   category: 'health',   difficulty: 'medium' },
  { id: 3010, hindi: 'मैं थका हुआ हूँ, मुझे आराम चाहिए।',        hinglish: 'mai thaka hua hun, mujhe aaram chahiye', category: 'needs', difficulty: 'medium' },
  { id: 3011, hindi: 'मेरे सिर में दर्द है।',                     hinglish: 'mere sir mein dard hai',         category: 'health',   difficulty: 'medium' },
  { id: 3012, hindi: 'मुझे अपने पापा को बुलाना है।',              hinglish: 'mujhe apne papa ko bulana hai',  category: 'help',     difficulty: 'medium' },
  { id: 3013, hindi: 'मैं आज स्कूल नहीं जा पाया।',               hinglish: 'mai aaj school nahi ja paya',    category: 'school',   difficulty: 'medium' },
  { id: 3014, hindi: 'बारिश हो रही है, मैं भीग गया।',            hinglish: 'barish ho rahi hai, mai bheeg gaya', category: 'weather', difficulty: 'medium' },

  // Hard
  { id: 3015, hindi: 'मैं स्कूल जाना चाहता था लेकिन नहीं जा पाया।', hinglish: 'mai school jana chahta tha lekin nahi ja paya', category: 'school', difficulty: 'hard' },
  { id: 3016, hindi: 'मेरे कपड़े गीले हो गए क्योंकि बारिश हो गई।', hinglish: 'mere kapde geele ho gae kyunki barish ho gai', category: 'weather', difficulty: 'hard' },
  { id: 3017, hindi: 'मुझे आज बहुत भूख लगी थी इसलिए मैंने खाना खाया।', hinglish: 'mujhe aaj bahut bhookh lagi thi isliye maine khana khaya', category: 'daily', difficulty: 'hard' },
  { id: 3018, hindi: 'मैं आज स्कूल नहीं जा पाया क्योंकि बारिश हो गई।', hinglish: 'mai aaj school nahi ja paya kiyuki barish ho gae', category: 'school', difficulty: 'hard' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Phase 3 — Paragraph / Essay Test
// ─────────────────────────────────────────────────────────────────────────────

export const PARAGRAPH_DATASET = [
  {
    id: 4001,
    hindi: 'मैं आज सुबह उठा। मुझे बहुत भूख लगी थी। मैंने रोटी और सब्ज़ी खाई। फिर मैं स्कूल गया।',
    hinglish: 'mai aaj subah utha. mujhe bahut bhookh lagi thi. maine roti aur sabzi khai. phir mai school gaya.',
    category: 'daily',
    difficulty: 'medium',
  },
  {
    id: 4002,
    hindi: 'आज बारिश हो गई। मेरे कपड़े गीले हो गए। मुझे ठंड लग रही थी। मम्मी ने मुझे गरम दूध दिया।',
    hinglish: 'aaj barish ho gai. mere kapde geele ho gae. mujhe thand lag rahi thi. mummy ne mujhe garam doodh diya.',
    category: 'weather',
    difficulty: 'medium',
  },
  {
    id: 4003,
    hindi: 'मैं आज स्कूल नहीं जा पाया क्योंकि बारिश हो गई। मेरे कपड़े गीले हो गए। माँ ने कहा घर पर रहो।',
    hinglish: 'mai aaj school nahi ja paya kiyuki barish ho gae. mere kapde geele ho gae. maa ne kaha ghar par raho.',
    category: 'school',
    difficulty: 'hard',
  },
  {
    id: 4004,
    hindi: 'मुझे दर्द हो रहा है। मेरे सिर में बहुत दर्द है। मुझे दवाई चाहिए। कृपया डॉक्टर को बुलाइए।',
    hinglish: 'mujhe dard ho raha hai. mere sir mein bahut dard hai. mujhe dawai chahiye. kripya doctor ko bulaiye.',
    category: 'health',
    difficulty: 'medium',
  },
  {
    id: 4005,
    hindi: 'मैं बहुत थका हुआ हूँ। आज पूरा दिन खेला। अब मुझे नींद आ रही है। मैं सोना चाहता हूँ।',
    hinglish: 'mai bahut thaka hua hun. aaj poora din khela. ab mujhe neend aa rahi hai. mai sona chahta hun.',
    category: 'daily',
    difficulty: 'medium',
  },
  {
    id: 4006,
    hindi: 'आज मेरा जन्मदिन है। मम्मी ने केक बनाया। पापा ने मुझे खिलौना दिया। मैं बहुत खुश हूँ।',
    hinglish: 'aaj mera janamdin hai. mummy ne cake banaya. papa ne mujhe khilona diya. mai bahut khush hun.',
    category: 'feelings',
    difficulty: 'medium',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Stammerer Specific Dataset (for Accuracy Testing)
// ─────────────────────────────────────────────────────────────────────────────

export const STAMMERER_DATASET = [
  // Hindi repetition & prolongation patterns
  { id: 5001, input: 'मु-मु-मुझे पा-पानी चा-चाहिए', expected: 'मुझे पानी चाहिए।', lang: 'hindi', category: 'needs' },
  { id: 5002, input: 'मुउउझे पाआनी चाहीये', expected: 'मुझे पानी चाहिए।', lang: 'hindi', category: 'needs' },
  { id: 5003, input: 'मै-मैं स् कू ल जा-जा रहा हूँ', expected: 'मैं स्कूल जा रहा हूँ।', lang: 'hindi', category: 'school' },
  { id: 5004, input: 'मुझे भ् भ् भूख लगी है', expected: 'मुझे भूख लगी है।', lang: 'hindi', category: 'needs' },
  { id: 5005, input: 'मे-मेरे सीर मे-में द-दर्द है', expected: 'मेरे सिर में दर्द है।', lang: 'hindi', category: 'health' },
  { id: 5006, input: 'पा-पा-पापा आ गए', expected: 'पापा आ गए।', lang: 'hindi', category: 'family' },
  { id: 5007, input: 'मु-मुझे द-दवाई खा-खानी है', expected: 'मुझे दवाई खानी है।', lang: 'hindi', category: 'health' },
  { id: 5008, input: 'बा-बा-बाहर बा-बारिश हो रही है', expected: 'बाहर बारिश हो रही है।', lang: 'hindi', category: 'weather' },
  { id: 5009, input: 'क-क-कपड़े गी-गीले हो गए', expected: 'कपड़े गीले हो गए।', lang: 'hindi', category: 'daily' },
  { id: 5010, input: 'मैं थ-थ-थक गया हूँ', expected: 'मैं थक गया हूँ।', lang: 'hindi', category: 'feelings' },
  { id: 5011, input: 'आ-आ-आज में-मैंने खा-खाना नहीं खा-खाया', expected: 'आज मैंने खाना नहीं खाया।', lang: 'hindi', category: 'daily' },
  { id: 5012, input: 'मुझे बा-बाथरूम जा-जाना है', expected: 'मुझे बाथरूम जाना है।', lang: 'hindi', category: 'needs' },
  { id: 5013, input: 'डॉ-डॉ-डॉक्टर को बु-बुलाओ', expected: 'डॉक्टर को बुलाओ।', lang: 'hindi', category: 'health' },
  { id: 5014, input: 'मैं खु-खु-खुश हूँ', expected: 'मैं खुश हूँ।', lang: 'hindi', category: 'feelings' },
  { id: 5015, input: 'मु-मुझे ड-डर लग र-रहा है', expected: 'मुझे डर लग रहा है।', lang: 'hindi', category: 'feelings' },

  // Hinglish repetition & prolongation patterns
  { id: 5101, input: 'mu-mu-mujhe pa-paani cha-chahiye', expected: 'मुझे पानी चाहिए।', lang: 'hinglish', category: 'needs' },
  { id: 5102, input: 'muuujhe paaani chahiyee', expected: 'मुझे पानी चाहिए।', lang: 'hinglish', category: 'needs' },
  { id: 5103, input: 'ma-mai s koo l ja-ja raha hun', expected: 'मैं स्कूल जा रहा हूँ।', lang: 'hinglish', category: 'school' },
  { id: 5104, input: 'mujhe bh bh bhookh lagi hai', expected: 'मुझे भूख लगी है।', lang: 'hinglish', category: 'needs' },
  { id: 5105, input: 'me-mere sir me-mein da-dard hai', expected: 'मेरे सिर में दर्द है।', lang: 'hinglish', category: 'health' },
  { id: 5106, input: 'pa-pa-papa aa gae', expected: 'पापा आ गए।', lang: 'hinglish', category: 'family' },
  { id: 5107, input: 'mu-mujhe da-dawai kha-khani hai', expected: 'मुझे दवाई खानी है।', lang: 'hinglish', category: 'health' },
  { id: 5108, input: 'ba-ba-bahar ba-barish ho rahi hai', expected: 'बाहर बारिश हो रही है।', lang: 'hinglish', category: 'weather' },
  { id: 5109, input: 'ka-ka-kapde gi-gile ho gae', expected: 'कपड़े गीले हो गए।', lang: 'hinglish', category: 'daily' },
  { id: 5110, input: 'mai tha-tha-thak gaya hun', expected: 'मैं थक गया हूँ।', lang: 'hinglish', category: 'feelings' },
  { id: 5111, input: 'aa-aa-aaj mai-maine kha-khana nahi kha-khaya', expected: 'आज मैंने खाना नहीं खाया।', lang: 'hinglish', category: 'daily' },
  { id: 5112, input: 'mujhe ba-bathroom ja-jana hai', expected: 'मुझे बाथरूम जाना है।', lang: 'hinglish', category: 'needs' },
  { id: 5113, input: 'do-do-doctor ko bu-bulao', expected: 'डॉक्टर को बुलाओ।', lang: 'hinglish', category: 'health' },
  { id: 5114, input: 'mai khu-khu-khush hun', expected: 'मैं खुश हूँ।', lang: 'hinglish', category: 'feelings' },
  { id: 5115, input: 'mu-mujhe da-darr lag ra-raha hai', expected: 'मुझे डर लग रहा है।', lang: 'hinglish', category: 'feelings' },

  // Whisper specific distortion combinations
  { id: 5201, input: 'मु-मु-मुझे पा-पाआनी चा-चाहिए बा-बाहर बालिच हो-हो रही है', expected: 'मुझे पानी चाहिए। बाहर बारिश हो रही है।', lang: 'hindi', category: 'complex' },
  { id: 5202, input: 'त-त-तपले दीले हो-हो गए', expected: 'कपड़े गीले हो गए।', lang: 'hindi', category: 'complex' },
  { id: 5203, input: 'तू-ततूल दा-दाना था ले-लेकिन बा-बालिच हो गई', expected: 'स्कूल जाना था लेकिन बारिश हो गई।', lang: 'hindi', category: 'complex' },
  { id: 5204, input: 'पे-पेट ब-बला हुआ है मु-मुझे था-थाना नहीं था-थाना', expected: 'पेट भरा हुआ है, मुझे खाना नहीं खाना।', lang: 'hindi', category: 'complex' },
  { id: 5205, input: 'मै-मैंने ए-एक मु-मूवी दे-देखी', expected: 'मैंने एक मूवी देखी।', lang: 'hindi', category: 'complex' }
];

// ─────────────────────────────────────────────────────────────────────────────
// Keep backward-compatible exports (old code references these)
// ─────────────────────────────────────────────────────────────────────────────

export const LETTER_DATASET = [...ENGLISH_LETTER_DATASET, ...HINDI_VARNMALA_DATASET];
export const WORD_DATASET = [
  { id: 101, english: 'Water',    hindi: 'पानी',   category: 'needs' },
  { id: 102, english: 'Food',     hindi: 'खाना',   category: 'needs' },
  { id: 103, english: 'Help',     hindi: 'मदद',    category: 'help' },
  { id: 104, english: 'Pain',     hindi: 'दर्द',   category: 'health' },
  { id: 105, english: 'School',   hindi: 'स्कूल', category: 'school' },
  { id: 106, english: 'Rain',     hindi: 'बारिश', category: 'weather' },
  { id: 107, english: 'Cold',     hindi: 'ठंड',    category: 'weather' },
  { id: 108, english: 'Tired',    hindi: 'थका',    category: 'feelings' },
  { id: 109, english: 'Hungry',   hindi: 'भूख',    category: 'needs' },
  { id: 110, english: 'Medicine', hindi: 'दवाई',  category: 'health' },
];
export const TEST_DATASET = SENTENCE_DATASET;

export const ENGLISH_LETTER_SPOKEN = Object.fromEntries(
  ENGLISH_LETTER_DATASET.map((l) => [l.letter, l.spoken]),
);

// ─────────────────────────────────────────────────────────────────────────────
// Utility functions
// ─────────────────────────────────────────────────────────────────────────────

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

// Phase 1(a) — English letters
export function getEnglishLetterTests(count = 26) {
  const all = [...ENGLISH_LETTER_DATASET];
  return count >= all.length ? shuffle(all) : shuffle(all).slice(0, count);
}

// Phase 1(b) — Hindi varnmala
export function getHindiVarnmalaTests(count = 48) {
  const all = [...HINDI_VARNMALA_DATASET];
  return count >= all.length ? shuffle(all) : shuffle(all).slice(0, count);
}

// Combined letter tests (backward-compat)
export function getLetterTests(count = 10) {
  const english = ENGLISH_LETTER_DATASET;
  const hindi = HINDI_VARNMALA_DATASET;
  const half = Math.ceil(count / 2);
  const pickEn = shuffle(english).slice(0, Math.min(half, english.length));
  const pickHi = shuffle(hindi).slice(0, Math.min(count - pickEn.length, hindi.length));
  return shuffle([...pickEn, ...pickHi]);
}

export function getLetterTestById(id) {
  const numericId = Number(id);
  return LETTER_DATASET.find((l) => l.id === numericId) ?? null;
}

// Word tests
export function getWordTests(count = 6) {
  return shuffle(WORD_DATASET).slice(0, Math.min(count, WORD_DATASET.length));
}

export function getWordTestById(id) {
  const numericId = Number(id);
  return WORD_DATASET.find((w) => w.id === numericId) ?? null;
}

// Phase 2 — Sentence tests
export function getSentenceTests(count = 6) {
  return shuffle(SENTENCE_DATASET).slice(0, Math.min(count, SENTENCE_DATASET.length));
}

export function getSentenceTestById(id) {
  const numericId = Number(id);
  return SENTENCE_DATASET.find((q) => q.id === numericId) ?? null;
}

// Phase 3 — Paragraph tests
export function getParagraphTests(count = 3) {
  return shuffle(PARAGRAPH_DATASET).slice(0, Math.min(count, PARAGRAPH_DATASET.length));
}

export function getParagraphTestById(id) {
  const numericId = Number(id);
  return PARAGRAPH_DATASET.find((q) => q.id === numericId) ?? null;
}

// Backward-compat: getTestQuestions / getTestQuestionById
export function getTestQuestions(count = 4) {
  return getSentenceTests(count);
}

export function getTestQuestionById(id) {
  return getSentenceTestById(id) ?? getParagraphTestById(id);
}
