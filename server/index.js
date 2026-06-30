import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  applyCorrections,
  getWordCorrectionsForLLM,
  getParaExamplesForLLM,
  normalizeCorrections,
} from './db.js';
import { applyPhoneticRules } from './hindiPhonetic.js';
import { transliterateHinglish, getHinglishHintsForLLM } from './hinglishTranslit.js';
import {
  getTestQuestionById,
  getTestQuestions,
  getLetterTestById,
  getLetterTests,
  getWordTestById,
  getWordTests,
  getEnglishLetterTests,
  getHindiVarnmalaTests,
  getSentenceTests,
  getSentenceTestById,
  getParagraphTests,
  getParagraphTestById,
} from './testDataset.js';
import { applyPronunciationProfile, getPronunciationHintsForLLM, normalizePronunciationProfile } from './pronunciationMatch.js';
import { alignWithContext, scoreWordAlignment } from './wordAlign.js';
import { cacheGet, cacheSet } from './cache.js';
import { rateLimit } from './rateLimit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

const PORT         = process.env.PORT || 3001;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// In-flight deduplication: if same text is being corrected concurrently,
// share one LLM call instead of making N identical calls
const inFlight = new Map();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Groq fetch with retry on 429 rate limit
async function groqFetch(url, options, maxRetries = 3) {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    }
    try {
      const r = await fetch(url, options);
      if (r.status === 429) {
        const retryAfter = parseInt(r.headers.get('retry-after') || '2', 10);
        await new Promise(res => setTimeout(res, retryAfter * 1000));
        lastError = new Error('Rate limited');
        continue;
      }
      return r;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

// ─────────────────────────────────────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, groqConfigured: Boolean(GROQ_API_KEY) });
});

// ─────────────────────────────────────────────────────────────────────────────
// Transcribe audio → Hindi text
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/transcribe', rateLimit(20), upload.single('audio'), async (req, res) => {
  if (!GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY सेट नहीं है।' });
  if (!req.file)    return res.status(400).json({ error: 'कोई ऑडियो फ़ाइल नहीं मिली।' });

  try {
    const fd = new FormData();
    fd.append(
      'file',
      new Blob([req.file.buffer], { type: req.file.mimetype || 'audio/webm' }),
      'audio.webm',
    );
    fd.append('model', 'whisper-large-v3');
    fd.append('response_format', 'json');
    fd.append('language', 'hi');
    // Whisper prompt: bias decoder toward real Hindi vocabulary.
    // Includes commonly mis-transcribed words to anchor Whisper's output.
    fd.append('prompt',
      'स्कूल बारिश क्योंकि कपड़े गीले बाथरूम दवाई भूख पानी दर्द थका ठंड गर्मी ' +
      'खुश डर सिर पेट रोटी चावल पापा। मैं स्कूल नहीं जा पाया। मुझे पानी चाहिए।'
    );
    fd.append('temperature', '0');

    const r = await groqFetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
      body: fd,
    });

    if (!r.ok) return res.status(r.status).json({ error: await r.text() });
    const d = await r.json();
    const transcribed = d.text ?? '';
    console.log(`[transcribe] "${transcribed}"`);
    res.json({ text: transcribed });
  } catch (err) {
    console.error('[transcribe]', err);
    res.status(500).json({ error: 'ऑडियो को टेक्स्ट में बदलने में समस्या हुई।' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Word-count constraint helper
// If model is confident (input ≤ 3 words) it may extend to 4 words max.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract topic from stranger's question so LLM knows the answer domain.
 * This is critical — prevents LLM from guessing food/water when asked about movies.
 */
function getTopicFromScenario(question) {
  if (!question) return 'general conversation';
  const q = question.toLowerCase();
  if (/मुवी|मूवी|movie|film|फिल्म|सिनेमा|cinema|web series|वेब सीरीज|देखी|देखा|देखे/.test(q))
    return 'movies/films — user is naming or describing a movie they watched. Garbled words like "जोई","जॉय","डोई","जोय" etc. are likely MOVIE NAMES — keep them as-is or transliterate to Hindi, do NOT replace with food/water words';
  if (/खाना|खाने|food|restaurant|कपड़|cloth|shirt|dress|दुकान/.test(q))
    return 'shopping/food';
  if (/स्कूल|school|college|पढ़|class/.test(q))
    return 'education/school';
  if (/दर्द|pain|बीमार|sick|doctor|hospital/.test(q))
    return 'health';
  if (/खेल|play|game|sport/.test(q))
    return 'sports/games';
  return `topic of: "${question}"`;
}
function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function enforceWordLimit(input, output) {
  const inputWords  = countWords(input);
  if (inputWords === 0) return output;

  const outputWords = countWords(output);

  // Rule: output ≤ max(inputWords × 1.2, inputWords + 4) words
  // For very short input (1-2 words): max 4 words output
  // For full para (100 words): max 120 words output
  const maxWords = Math.max(Math.ceil(inputWords * 1.2), inputWords + 4);

  if (outputWords <= maxWords) return output;

  // Trim to maxWords
  const words = output.trim().split(/\s+/);
  const trimmed = words.slice(0, maxWords).join(' ');
  console.log(`[word-limit] trimmed ${outputWords}→${maxWords} words`);
  return trimmed;
}
async function runLLMCorrection(rawText, preProcessed, corrections = [], pronunciation = [], expectedContext = null, scenarioContext = null) {
  const userCorrections = normalizeCorrections(corrections);
  const wordLookup   = getWordCorrectionsForLLM(userCorrections);
  const paraExamples = getParaExamplesForLLM(userCorrections);
  const pronHints    = getPronunciationHintsForLLM(pronunciation);
  const hinglishHints = getHinglishHintsForLLM(30);

  // Build the few-shot examples block from saved paragraph corrections
  let exampleBlock = '';
  if (paraExamples.length > 0) {
    exampleBlock = '\n\nपिछले सुधारों के उदाहरण (इन्हें संदर्भ के रूप में उपयोग करो):\n';
    for (const ex of paraExamples) {
      exampleBlock += `गलत: "${ex.raw}"\nसही: "${ex.corrected}"\n\n`;
    }
  }

  let lookupBlock = '';
  if (wordLookup) {
    lookupBlock = `\n\nज्ञात शब्द सुधार (इन्हें पहली प्राथमिकता दो): ${wordLookup}`;
  }

  let pronBlock = '';
  if (pronHints) {
    pronBlock = `\n\nइस व्यक्ति की उच्चारण प्रोफ़ाइल (अक्षर/वर्ण परीक्षा से): ${pronHints}`;
  }

  let contextBlock = '';
  if (expectedContext) {
    contextBlock = `\n\nसंदर्भ वाक्य (शब्द-दर-शब्द मिलान): "${expectedContext}"`;
  }

  let scenarioBlock = '';
  if (scenarioContext) {
    scenarioBlock = `🔴 MOST IMPORTANT — READ THIS FIRST:
The other person asked: "${scenarioContext}"
The user is answering THIS question. Use the question's topic to determine what the user is trying to say.

Topic analysis:
- If the question is about a MOVIE/FILM → user is talking about a movie. Words like "जोई", "जॉय", "जोय", "डोई" etc. are likely MOVIE NAMES, not random words.
- If the question is about FOOD → user is talking about food.
- If the question is about SCHOOL/PLACE → user is talking about going somewhere.
- DO NOT interpret words as food/water/pain if the question is clearly about something else.

For this specific question "${scenarioContext}":
- The answer MUST be related to: ${getTopicFromScenario(scenarioContext)}
- Any word that doesn't fit this topic — try to interpret it as a name/term related to the topic first.

`;
  }

  // Calculate allowed word count range for the output
  const inputWordCount = countWords(rawText);
  const maxOutputWords = Math.max(Math.ceil(inputWordCount * 1.2), inputWordCount + 4);

  const systemPrompt =
`${scenarioBlock}तुम एक AAC (Augmentative and Alternative Communication) सहायक हो।
तुम उन लोगों की मदद करते हो जिन्हें बोलने में कठिनाई है — सेरेब्रल पाल्सी, डिसार्थ्रिया, मूकता।

⚠️ शब्द सीमा (बहुत महत्वपूर्ण):
- इनपुट में लगभग ${inputWordCount} शब्द हैं।
- आउटपुट में अधिकतम ${maxOutputWords} शब्द होने चाहिए।
- अगर उपयोगकर्ता 2 शब्द बोले → 2-4 शब्दों में जवाब दो।
- अगर उपयोगकर्ता 10 शब्द बोले → 10-12 शब्दों में जवाब दो।
- अगर उपयोगकर्ता 100 शब्द बोले → 100-120 शब्दों में जवाब दो।
- कभी भी इस सीमा से बाहर मत जाओ — यह नियम सबसे कड़ा है।

इनपुट तीन प्रकार का हो सकता है:
A) Whisper से निकला टूटा-फूटा हिंदी देवनागरी टेक्स्ट
B) Hinglish / Roman Hindi
C) दोनों का मिश्रण

──────────────────────────────────────────
⚠️ ज्ञात Whisper गलतियाँ (इन्हें हमेशा सुधारो):
- "तूल" / "ततूल" = "स्कूल"
- "बालिच" / "बालिश" = "बारिश"
- "तूकी" / "इतली" / "इसली" = "इसलिए"
- "दई" = "गई", "दए" = "गए", "दा" = "जा"
- "तपले" = "कपड़े", "दीले" = "गीले"
- "थाना" / "थाने" = "खाने" (खाने के संदर्भ में)
- "था लिया" / "था ली" = "खा लिया" (खाने के बाद की बात हो तो)
- "बला" / "बला हुआ" = "भरा" / "भरा हुआ" (पेट के संदर्भ में — पेट भरा)
- "मेला" = "मेरा"
- "पिलात्ता" / "पिलात" = "इसलिए"
- "डालना"/"डाला" = "जाना"/"गया" (जगह के संदर्भ में)
- "दोल" = "रो", "देल" = "देर"
- "आद" / "आदि" = "आज"

──────────────────────────────────────────
विशेष उदाहरण (इसी प्रकार सोचो):
इनपुट: "नहीं आज मेला पेट बला हुआ है। मैंने था लिया है। पिलात्ता थाना इतली नहीं दा पाऊंगा।"
संदर्भ: "आज खाने चलोगे क्या?"
सही आउटपुट: "नहीं, आज मेरा पेट भरा हुआ है। मैंने खा लिया है। इसलिए मैं खाने नहीं जा पाऊंगा।"
व्याख्या: "बला"→"भरा" (खाने का सवाल था इसलिए पेट भरा होना सही), "था लिया"→"खा लिया" (खाना खा चुका है), "पिलात्ता थाना इतली नहीं दा"→"इसलिए खाने नहीं जा"

──────────────────────────────────────────
Hinglish शब्द पहचान:
${hinglishHints}

──────────────────────────────────────────
सोचने की प्रक्रिया:

चरण 1 — बातचीत का संदर्भ देखो (सबसे पहले):
अगर ऊपर संदर्भ दिया गया है तो उसके अनुसार शब्दों का अर्थ तय करो।

चरण 2 — ज्ञात Whisper गलतियाँ ठीक करो।

चरण 3 — Hinglish → देवनागरी।

चरण 4 — पड़ोसी शब्दों के संदर्भ में सुधारो:
हर शब्द को उसके आगे-पीछे के शब्दों से जोड़कर देखो।

चरण 5 — व्याकरण ठीक करो।

चरण 6 — अधूरे वाक्य पूरे करो।
──────────────────────────────────────────

कड़े नियम:
- उत्तर केवल हिंदी देवनागरी में।
- मूल भावना बिल्कुल न बदलो।
- कोई व्याख्या या लेबल नहीं।${lookupBlock}${pronBlock}${contextBlock}${exampleBlock}`;

  // Send BOTH the raw Whisper output AND the pre-processed version.
  // The LLM uses raw for phonetic clues and pre-processed for DB corrections.
  const userMessage = rawText === preProcessed
    ? rawText
    : `मूल (Whisper आउटपुट): "${rawText}"\nआंशिक सुधार: "${preProcessed}"\n\nकृपया पूरा सुधार करो।`;

  const r = await groqFetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage },
      ],
      temperature: 0,   // 0 = maximum determinism and accuracy for correction
      max_tokens: 512,
    }),
  });

  if (!r.ok) {
    const detail = await r.text();
    throw new Error(`Groq error: ${detail}`);
  }

  const d = await r.json();
  const raw = d.choices?.[0]?.message?.content?.trim() ?? preProcessed;
  // Apply word-count constraint to prevent hallucination
  const result = enforceWordLimit(rawText, raw);
  console.log(`[correct] LLM result: "${result}"`);
  return result;
}

/** Final pass: verify paragraph makes sense; fix words using prev/next context */
async function runParagraphSenseCheck(rawText, currentText, corrections = [], pronunciation = [], expectedContext = null, scenarioContext = null) {
  const userCorrections = normalizeCorrections(corrections);
  const pronHints = getPronunciationHintsForLLM(pronunciation);

  const systemPrompt =
`तुम AAC सहायक हो। दिया गया हिंदी वाक्य/पैराग्राफ पढ़ो और जाँचो कि क्या यह समझ में आता है।

काम:
1. हर शब्द को उसके पिछले और अगले शब्दों के साथ जोड़कर देखो — शब्द आपस में जुड़े होने चाहिए।
2. अगर कोई शब्द अर्थहीन है, उसे संदर्भ के अनुसार सही शब्द से बदलो।
3. अधूरा वाक्य हो तो उपयोगकर्ता के संदर्भ (खाना, पानी, दर्द, मदद, स्कूल) से पूरा करो।
4. Hinglish/Roman शब्द बचे हों तो उन्हें देवनागरी में बदलो।
5. मूल भावना न बदलो। केवल देवनागरी में उत्तर दो — कोई व्याख्या नहीं।

⚠️ ज्ञात Whisper गलतियाँ: "तूल"=स्कूल, "बालिच"=बारिश, "तूकी"=क्योंकि, "दई"=गई, "तपले"=कपड़े, "दीले"=गीले, "तोशू"=खुश${pronHints ? `\n\nउच्चारण प्रोफ़ाइल: ${pronHints}` : ''}${expectedContext ? `\n\nलक्ष्य संदर्भ: "${expectedContext}"` : ''}${scenarioContext ? `\n\nकेयरगिवर का संदर्भ: "${scenarioContext}"` : ''}`;

  const userMessage =
`मूल Whisper: "${rawText}"
वर्तमान सुधार: "${currentText}"

पूरे पैराग्राफ की समझ जाँचो। गलत/असंबद्ध शब्द सही करो। पिछले-अगले शब्दों से जोड़कर पूरा सार्थक वाक्य दो।`;

  const r = await groqFetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0,
      max_tokens: 512,
    }),
  });

  if (!r.ok) return currentText;

  const d = await r.json();
  const result = d.choices?.[0]?.message?.content?.trim() ?? currentText;
  console.log(`[sense-check] "${result}"`);
  return result;
}

/**
 * Final confirmation step — verifies the corrected answer is relevant
 * to the stranger's question. Uses fast/cheap model. Runs after sense-check.
 */
async function runContextConfirmation(rawText, currentText, scenarioContext, expectedContext) {
  const inputWordCount = countWords(rawText);
  const maxWords = Math.max(Math.ceil(inputWordCount * 1.2), inputWordCount + 4);

  let contextLine = '';
  if (scenarioContext) contextLine += `प्रश्न: "${scenarioContext}"\n`;
  if (expectedContext) contextLine += `अपेक्षित संदर्भ: "${expectedContext}"\n`;

  const systemPrompt =
`तुम AAC सहायक हो। नीचे एक वाक् विकलांग व्यक्ति का सुधरा हुआ उत्तर है।
${contextLine}
जाँचो: क्या यह उत्तर ऊपर के प्रश्न के जवाब में सही और प्रासंगिक है?

नियम:
- अगर उत्तर सही है → बिल्कुल वैसा ही लिखो, कोई बदलाव नहीं।
- अगर उत्तर सवाल से असंबंधित है → केवल ज़रूरी शब्द बदलो।
- अधिकतम ${maxWords} शब्द।
- केवल हिंदी देवनागरी। कोई व्याख्या नहीं। सिर्फ उत्तर लिखो।`;

  const r = await groqFetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: currentText },
      ],
      temperature: 0,
      max_tokens: 200,
    }),
  });

  if (!r.ok) return currentText;

  const d = await r.json();
  const result = (d.choices?.[0]?.message?.content ?? '').trim();

  // Safety: if result looks like meta-commentary (contains "उत्तर", "सवाल", "यह"),
  // it means the model explained instead of answering — discard and use current
  const isMetaResponse = /^(हाँ|नहीं)[,،]?\s*(यह|यह उत्तर|उत्तर)/i.test(result);
  if (!result || isMetaResponse) {
    console.log(`[confirm] discarded meta-response, keeping: "${currentText}"`);
    return currentText;
  }

  // Safety: if result is significantly shorter than current (>30% shorter),
  // the model over-simplified — discard and keep current
  const currentWordCount = countWords(currentText);
  const resultWordCount  = countWords(result);
  if (currentWordCount > 4 && resultWordCount < currentWordCount * 0.7) {
    console.log(`[confirm] result too short (${resultWordCount} vs ${currentWordCount}), keeping original`);
    return currentText;
  }

  console.log(`[confirm] "${result}"`);
  return result;
}

async function runCorrectionPipeline(rawText, corrections, pronunciation, expectedContext = null, scenarioContext = null) {
  const userCorrections = normalizeCorrections(corrections);
  const pronProfile = normalizePronunciationProfile(pronunciation);

  // Step 0: Hinglish transliteration (Roman Hindi → Devanagari)
  const afterHinglish = transliterateHinglish(rawText);
  if (afterHinglish !== rawText) {
    console.log(`[correct] Hinglish→Devanagari: "${rawText}" → "${afterHinglish}"`);
  }

  const afterDB       = applyCorrections(afterHinglish, userCorrections);
  const afterPron     = applyPronunciationProfile(afterDB, pronProfile);
  const afterPhonetic = applyPhoneticRules(afterPron);

  let aligned = afterPhonetic;
  if (expectedContext) {
    aligned = alignWithContext(afterPhonetic, expectedContext, userCorrections, pronProfile);
  }

  // Step 1: LLM correction (word-count constrained)
  let final = aligned;
  try {
    final = await runLLMCorrection(rawText, aligned, userCorrections, pronProfile, expectedContext, scenarioContext);
  } catch (llmErr) {
    console.error('[correct] LLM failed:', llmErr.message);
  }

  // Step 2: Para sense-check — Run TWICE for higher accuracy
  // First pass: fix any remaining broken words using prev/next context
  try {
    final = await runParagraphSenseCheck(rawText, final, userCorrections, pronProfile, expectedContext, scenarioContext);
    final = enforceWordLimit(rawText, final);
  } catch (e) {
    console.error('[correct] sense-check pass 1 failed:', e.message);
  }

  // Second pass: context confirmation — only run if input is >3 words
  // (short inputs like "पानी" don't need confirmation, it causes more harm)
  const inputWords = countWords(rawText);
  if (inputWords > 3 && (scenarioContext || expectedContext)) {
    try {
      final = await runContextConfirmation(rawText, final, scenarioContext, expectedContext);
      final = enforceWordLimit(rawText, final);
    } catch (e) {
      console.error('[correct] context confirmation failed:', e.message);
    }
  }

  if (expectedContext) {
    final = alignWithContext(final, expectedContext, userCorrections, pronProfile);
  }

  return final;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/correct — full pipeline
//
//  0. Hinglish transliteration    (instant, local)
//  1. DB word/phrase substitution  (instant, local)
//  2. Safe phonetic rules          (instant, local)
//  3. LLM context-aware correction (Groq, paragraph-aware, DB-informed)
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/correct', rateLimit(30), async (req, res) => {
  if (!GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY सेट नहीं है।' });

  const { text, corrections, pronunciation, scenarioContext } = req.body ?? {};
  if (!text?.trim()) return res.json({ text: text ?? '' });

  // Cache key: text only (corrections are user-specific so we skip caching those)
  const hasUserCorrections = Array.isArray(corrections) && corrections.length > 0;
  const hasPronunciation   = Array.isArray(pronunciation) && pronunciation.length > 0;
  const cacheKey = !hasUserCorrections && !hasPronunciation && !scenarioContext ? text.trim() : null;

  // 1. Cache hit — return instantly, no LLM call
  if (cacheKey) {
    const cached = cacheGet(cacheKey);
    if (cached) {
      console.log(`[correct] cache hit: "${text.trim().slice(0, 40)}"`);
      return res.json({ text: cached });
    }
  }

  // 2. Deduplication — if same text is already in-flight, wait for that result
  if (cacheKey && inFlight.has(cacheKey)) {
    try {
      const result = await inFlight.get(cacheKey);
      return res.json({ text: result });
    } catch {
      // fall through to fresh call
    }
  }

  // 3. Run pipeline — wrap in promise for deduplication
  const pipelinePromise = runCorrectionPipeline(text, corrections, pronunciation, null, scenarioContext)
    .finally(() => { if (cacheKey) inFlight.delete(cacheKey); });

  if (cacheKey) inFlight.set(cacheKey, pipelinePromise);

  try {
    const final = await pipelinePromise;
    if (cacheKey) cacheSet(cacheKey, final);
    res.json({ text: final });
  } catch (err) {
    console.error('[correct] pipeline error:', err);
    res.json({ text: text });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/corrections/save
// Saves both word-level diff AND full paragraph — all lengths accepted
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/corrections/save', (_req, res) => {
  res.json({ ok: true, localOnly: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test endpoints — Phase 1(a), 1(b), 2, 3
// ─────────────────────────────────────────────────────────────────────────────

// Phase 1(a) — English A–Z
app.get('/api/test/english-letters', (req, res) => {
  const count = Math.min(parseInt(req.query.count) || 26, 26);
  res.json({ letters: getEnglishLetterTests(count) });
});

// Phase 1(b) — Hindi Varnmala
app.get('/api/test/hindi-varnmala', (req, res) => {
  const count = Math.min(parseInt(req.query.count) || 48, 48);
  res.json({ letters: getHindiVarnmalaTests(count) });
});

// Phase 2 — Sentence tests
app.get('/api/test/sentences', (req, res) => {
  const count = Math.min(parseInt(req.query.count) || 6, 18);
  res.json({ sentences: getSentenceTests(count) });
});

// Phase 3 — Paragraph tests
app.get('/api/test/paragraphs', (req, res) => {
  const count = Math.min(parseInt(req.query.count) || 3, 6);
  res.json({ paragraphs: getParagraphTests(count) });
});

// Backward-compatible endpoints
app.get('/api/test/letters', (req, res) => {
  const count = Math.min(parseInt(req.query.count) || 10, 74);
  res.json({ letters: getLetterTests(count) });
});

app.get('/api/test/words', (req, res) => {
  const count = Math.min(parseInt(req.query.count) || 6, 10);
  res.json({ words: getWordTests(count) });
});

app.get('/api/test/questions', (req, res) => {
  const count = Math.min(parseInt(req.query.count) || 4, 18);
  res.json({ questions: getTestQuestions(count) });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/test/evaluate — score against expected (all modes)
// Body: { heard, expected, questionId, mode, englishAlt, corrections }
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/test/evaluate', async (req, res) => {
  if (!GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY is not set.' });

  const { expected, heard, questionId, mode = 'paragraph', englishAlt, corrections, pronunciation } = req.body ?? {};

  let target = expected;
  let altEnglish = englishAlt ?? null;

  if (mode === 'letter' && questionId != null) {
    const letterQ = getLetterTestById(questionId);
    if (letterQ) target = letterQ.letter;
  } else if (mode === 'word' && questionId != null) {
    const wordQ = getWordTestById(questionId);
    if (wordQ) {
      target = wordQ.hindi;
      altEnglish = wordQ.english;
    }
  } else if (mode === 'sentence' && questionId != null) {
    const sentenceQ = getSentenceTestById(questionId);
    if (sentenceQ) target = sentenceQ.hindi;
  } else if (mode === 'paragraph' && questionId != null) {
    const paraQ = getParagraphTestById(questionId);
    if (paraQ) {
      target = paraQ.hindi;
    } else {
      // Fallback to sentence dataset
      const sentenceQ = getSentenceTestById(questionId);
      if (sentenceQ) target = sentenceQ.hindi;
    }
  } else if (questionId != null) {
    const question = getTestQuestionById(questionId);
    target = question?.hindi ?? expected;
  }

  if (!target?.trim()) {
    return res.status(400).json({ error: 'expected or questionId is required' });
  }

  if (!heard?.trim()) {
    return res.json({
      score: 0,
      corrected: '',
      expected: target,
      questionId: questionId ?? null,
      mode,
    });
  }

  const userCorrections = normalizeCorrections(corrections);
  const pronProfile = normalizePronunciationProfile(pronunciation);

  try {
    const corrected = await runCorrectionPipeline(
      heard,
      userCorrections,
      pronProfile,
      (mode === 'paragraph' || mode === 'sentence') ? target : null,
    );

    let final = corrected;
    if (mode === 'word' || mode === 'letter') {
      final = alignWithContext(corrected, target, userCorrections, pronProfile, altEnglish);
    } else {
      final = alignWithContext(corrected, target, userCorrections, pronProfile);
    }

    const score = scoreWordAlignment(target, final);

    res.json({
      score,
      corrected: final,
      expected: target,
      questionId: questionId ?? null,
      mode,
      englishAlt: altEnglish,
    });
  } catch (err) {
    console.error('[test/evaluate]', err);
    res.status(500).json({ error: 'Evaluation failed.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/test/model — Model accuracy self-test
// Body: { text } — runs the correction pipeline and returns the result
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/test/model', async (req, res) => {
  if (!GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY is not set.' });

  const { text, expected, corrections, pronunciation } = req.body ?? {};
  if (!text?.trim()) return res.status(400).json({ error: 'text is required' });

  try {
    const corrected = await runCorrectionPipeline(
      text,
      corrections ?? [],
      pronunciation ?? [],
      expected ?? null,
    );

    const score = expected ? scoreWordAlignment(expected, corrected) : null;

    res.json({
      input: text,
      corrected,
      expected: expected ?? null,
      score,
    });
  } catch (err) {
    console.error('[test/model]', err);
    res.status(500).json({ error: 'Model test failed.' });
  }
});

app.get('/api/corrections', (_req, res) => {
  res.json({ corrections: [] });
});

app.delete('/api/corrections/:raw', (_req, res) => {
  res.json({ ok: true, localOnly: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// Serve built frontend (only in production — skip if API routes should handle)
// ─────────────────────────────────────────────────────────────────────────────
const distPath = path.join(__dirname, '..', 'dist');
if (!process.env.VERCEL && fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // IMPORTANT: only catch non-API routes so API endpoints are never shadowed
  app.get(/^(?!\/api).*$/, (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

if (!process.env.VERCEL) {
app.listen(PORT, () => {
  console.log(`✅  Server on http://localhost:${PORT}`);
  console.log(`    Model: llama-3.3-70b-versatile | Pipeline: Hinglish → DB → Phonetic → LLM`);
  if (!GROQ_API_KEY) console.warn('⚠️  GROQ_API_KEY not set');
});
}

export default app;
