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
const USE_LOCAL    = process.env.USE_LOCAL_MODEL === 'true';
const OLLAMA_URL   = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';

// In-flight deduplication: if same text is being corrected concurrently,
// share one LLM call instead of making N identical calls
const inFlight = new Map();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Groq fetch with retry on 429 rate limit and 15s per-call timeout
async function groqFetch(url, options, maxRetries = 3) {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    }
    try {
      // 25s timeout per individual Groq call — prevents hanging on slow responses
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 25000);
      const r = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      if (r.status === 429) {
        const retryAfter = parseInt(r.headers.get('retry-after') || '2', 10);
        await new Promise(res => setTimeout(res, retryAfter * 1000));
        lastError = new Error('Rate limited');
        continue;
      }
      return r;
    } catch (err) {
      lastError = err;
      if (err.name === 'AbortError') {
        console.warn(`[groq] call timed out (attempt ${attempt + 1})`);
      }
    }
  }
  throw lastError;
}

// ─────────────────────────────────────────────────────────────────────────────
// Ollama local model support
// ─────────────────────────────────────────────────────────────────────────────
async function ollamaChat(systemPrompt, userMessage, maxTokens = 512) {
  const r = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      stream: false,
      options: { temperature: 0, num_predict: maxTokens },
    }),
  });
  if (!r.ok) throw new Error(`Ollama error: ${await r.text()}`);
  const d = await r.json();
  return d.message?.content?.trim() ?? '';
}

/** Unified LLM call — routes to Ollama if USE_LOCAL_MODEL=true, else Groq */
async function llmChat(systemPrompt, userMessage, maxTokens = 512) {
  if (USE_LOCAL) {
    console.log(`[llm] using local Ollama (${OLLAMA_MODEL})`);
    return ollamaChat(systemPrompt, userMessage, maxTokens);
  }

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
      max_tokens: maxTokens,
    }),
  });

  if (!r.ok) {
    const detail = await r.text();
    throw new Error(`Groq error: ${detail}`);
  }

  const d = await r.json();
  return d.choices?.[0]?.message?.content?.trim() ?? '';
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

  // Calculate allowed word count range for the output
  const inputWordCount = countWords(rawText);
  const maxOutputWords = Math.max(Math.ceil(inputWordCount * 1.2), inputWordCount + 4);

  // ── Build prompt with EQUAL-PRIORITY sections ─────────────────────────
  // Each section is wrapped in XML-style tags so the LLM gives equal
  // attention to ALL workflow steps, not just the first/last.

  // SECTION 1 (TOP PRIORITY): Role + strict constraints
  let prompt = `तुम एक AAC (Augmentative and Alternative Communication) सहायक हो।
तुम उन लोगों की मदद करते हो जिन्हें बोलने में कठिनाई है — सेरेब्रल पाल्सी, डिसार्थ्रिया, हकलाना, मूकता।

🔒 सभी नियम समान प्राथमिकता के हैं। कोई भी नियम दूसरे से ऊपर नहीं है।
हर अनुभाग को ध्यान से पढ़ो और सभी चरणों को बराबर महत्व दो।

<WORD_LIMIT>
⚠️ शब्द सीमा:
- इनपुट: ~${inputWordCount} शब्द → आउटपुट: अधिकतम ${maxOutputWords} शब्द।
- 2 शब्द इनपुट → 2-4 शब्द आउटपुट। 10 शब्द → 10-12। 100 शब्द → 100-120।
- इस सीमा का उल्लंघन कभी न करो।
</WORD_LIMIT>
`;

  // SECTION 2 (HIGH PRIORITY): User-specific corrections — placed early for strong attention
  if (wordLookup) {
    prompt += `
<USER_CORRECTIONS>
🔴 इस व्यक्ति के ज्ञात शब्द सुधार (हमेशा लागू करो):
${wordLookup}
</USER_CORRECTIONS>
`;
  }

  if (pronHints) {
    prompt += `
<PRONUNCIATION_PROFILE>
🔴 इस व्यक्ति की उच्चारण प्रोफ़ाइल (अक्षर/वर्ण परीक्षा से पता चला):
${pronHints}
</PRONUNCIATION_PROFILE>
`;
  }

  // SECTION 3: Few-shot examples from user's history
  if (paraExamples.length > 0) {
    prompt += `
<PAST_CORRECTIONS>
पिछले सुधारों के उदाहरण:
`;
    for (const ex of paraExamples) {
      prompt += `गलत: "${ex.raw}" → सही: "${ex.corrected}"\n`;
    }
    prompt += `</PAST_CORRECTIONS>
`;
  }

  // SECTION 4 (EQUAL PRIORITY): Known Whisper errors & stammerer patterns
  prompt += `
<WHISPER_ERRORS>
ज्ञात Whisper गलतियाँ (इन्हें हमेशा सुधारो):
- "तूल"/"ततूल" = "स्कूल", "बालिच"/"बालिश" = "बारिश"
- "तूकी"/"इतली"/"इसली" = "इसलिए", "दई" = "गई", "दए" = "गए", "दा" = "जा"
- "तपले" = "कपड़े", "दीले" = "गीले", "मेला" = "मेरा"
- "थाना"/"थाने" = "खाने", "था लिया" = "खा लिया"
- "बला"/"बला हुआ" = "भरा"/"भरा हुआ", "पिलात्ता" = "इसलिए"
- "डालना"/"डाला" = "जाना"/"गया", "दोल" = "रो", "देल" = "देर"
- "आद"/"आदि" = "आज", "तोशू" = "खुश", "तज़ी" = "सिर"

हकलाने वालों की विशेष गलतियाँ:
- दोहराव: "मु-मुझे" = "मुझे", "पा-पानी" = "पानी"
- लंबा स्वर: "पाआनी" = "पानी", "मुउउझे" = "मुझे"
- टूटे शब्द: "स् कू ल" = "स्कूल"
</WHISPER_ERRORS>
`;

  // SECTION 5 (EQUAL PRIORITY): Scenario context — placed in MIDDLE, not at top
  if (scenarioContext) {
    prompt += `
<SCENARIO_CONTEXT>
बातचीत का संदर्भ — दूसरे व्यक्ति ने पूछा: "${scenarioContext}"
विषय: ${getTopicFromScenario(scenarioContext)}

इस संदर्भ का उपयोग अस्पष्ट शब्दों का अर्थ तय करने में करो।
लेकिन ज्ञात शब्द सुधार और उच्चारण प्रोफ़ाइल को संदर्भ से ऊपर रखो।
अगर प्रश्न फिल्म के बारे में है → अज्ञात शब्द फिल्म का नाम हो सकते हैं।
अगर प्रश्न खाने के बारे में है → अज्ञात शब्द खाने से संबंधित हो सकते हैं।
</SCENARIO_CONTEXT>
`;
  }

  if (expectedContext) {
    prompt += `
<EXPECTED_CONTEXT>
संदर्भ वाक्य (शब्द-दर-शब्द मिलान): "${expectedContext}"
</EXPECTED_CONTEXT>
`;
  }

  // SECTION 6: Hinglish hints
  prompt += `
<HINGLISH>
Hinglish शब्द पहचान:
${hinglishHints}
</HINGLISH>
`;

  // SECTION 7: Worked example
  prompt += `
<EXAMPLE>
उदाहरण:
इनपुट: "नहीं आज मेला पेट बला हुआ है। मैंने था लिया है। पिलात्ता थाना इतली नहीं दा पाऊंगा।"
संदर्भ: "आज खाने चलोगे क्या?"
सही: "नहीं, आज मेरा पेट भरा हुआ है। मैंने खा लिया है। इसलिए मैं खाने नहीं जा पाऊंगा।"
</EXAMPLE>
`;

  // SECTION 8: Equal-weight workflow steps
  prompt += `
<WORKFLOW>
⚠️ सभी चरण समान महत्व के हैं — कोई चरण छोड़ो नहीं:

चरण 1 — USER_CORRECTIONS और PRONUNCIATION_PROFILE लागू करो (सबसे भरोसेमंद)।
चरण 2 — WHISPER_ERRORS सुधारो। हकलाने के दोहराव हटाओ।
चरण 3 — Hinglish → देवनागरी।
चरण 4 — SCENARIO_CONTEXT से अस्पष्ट शब्दों का अर्थ तय करो।
चरण 5 — पड़ोसी शब्दों के संदर्भ में सुधारो।
चरण 6 — व्याकरण ठीक करो। अधूरे वाक्य पूरे करो।
</WORKFLOW>

कड़े नियम:
- उत्तर केवल हिंदी देवनागरी में।
- मूल भावना बिल्कुल न बदलो।
- कोई व्याख्या या लेबल नहीं। सिर्फ सुधरा हुआ टेक्स्ट लिखो।
`;

  // Send BOTH the raw Whisper output AND the pre-processed version.
  const userMessage = rawText === preProcessed
    ? rawText
    : `मूल (Whisper आउटपुट): "${rawText}"\nआंशिक सुधार: "${preProcessed}"\n\nकृपया पूरा सुधार करो।`;

  const result = await llmChat(prompt, userMessage, 512);
  const limited = enforceWordLimit(rawText, result || preProcessed);
  console.log(`[correct] LLM result: "${limited}"`);
  return limited;
}

/** Final pass: verify paragraph makes sense; fix words using prev/next context */
async function runParagraphSenseCheck(rawText, currentText, corrections = [], pronunciation = [], expectedContext = null, scenarioContext = null) {
  const pronHints = getPronunciationHintsForLLM(pronunciation);

  const systemPrompt =
`तुम AAC सहायक हो। दिया गया हिंदी वाक्य/पैराग्राफ पढ़ो और जाँचो कि क्या यह समझ में आता है।

⚠️ सभी नियम समान प्राथमिकता के हैं:

<RULES>
1. हर शब्द को उसके पिछले और अगले शब्दों के साथ जोड़कर देखो — शब्द आपस में जुड़े होने चाहिए।
2. अगर कोई शब्द अर्थहीन है, उसे संदर्भ के अनुसार सही शब्द से बदलो।
3. हकलाने/दोहराव को हटाओ: "मु-मुझे" → "मुझे"
4. Hinglish/Roman शब्द बचे हों तो उन्हें देवनागरी में बदलो।
5. अधूरा वाक्य हो तो संदर्भ से पूरा करो।
6. मूल भावना न बदलो। केवल देवनागरी में उत्तर दो — कोई व्याख्या नहीं।
</RULES>

<WHISPER_ERRORS>
ज्ञात गलतियाँ: "तूल"=स्कूल, "बालिच"=बारिश, "तूकी"=क्योंकि, "दई"=गई, "तपले"=कपड़े, "दीले"=गीले, "तोशू"=खुश
</WHISPER_ERRORS>${pronHints ? `\n\n<PRONUNCIATION>\nउच्चारण प्रोफ़ाइल: ${pronHints}\n</PRONUNCIATION>` : ''}${expectedContext ? `\n\n<EXPECTED>\nलक्ष्य संदर्भ: "${expectedContext}"\n</EXPECTED>` : ''}${scenarioContext ? `\n\n<SCENARIO>\nकेयरगिवर का संदर्भ: "${scenarioContext}"\n</SCENARIO>` : ''}`;

  const userMessage =
`मूल Whisper: "${rawText}"
वर्तमान सुधार: "${currentText}"

पूरे पैराग्राफ की समझ जाँचो। गलत/असंबद्ध शब्द सही करो। पिछले-अगले शब्दों से जोड़कर पूरा सार्थक वाक्य दो।`;

  try {
    const result = await llmChat(systemPrompt, userMessage, 512);
    if (!result) return currentText;
    console.log(`[sense-check] "${result}"`);
    return result;
  } catch {
    return currentText;
  }
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
<RULES>
सभी नियम समान प्राथमिकता:
1. अगर उत्तर सही है → बिल्कुल वैसा ही लिखो, कोई बदलाव नहीं।
2. अगर उत्तर सवाल से असंबंधित है → केवल ज़रूरी शब्द बदलो।
3. अधिकतम ${maxWords} शब्द।
4. केवल हिंदी देवनागरी। कोई व्याख्या नहीं। सिर्फ उत्तर लिखो।
</RULES>`;

  try {
    const result = await llmChat(systemPrompt, currentText, 200);

    // Safety: meta-commentary detection
    const isMetaResponse = /^(हाँ|नहीं)[,،]?\s*(यह|यह उत्तर|उत्तर)/i.test(result);
    if (!result || isMetaResponse) {
      console.log(`[confirm] discarded meta-response, keeping: "${currentText}"`);
      return currentText;
    }

    // Safety: over-simplification detection
    const currentWordCount = countWords(currentText);
    const resultWordCount  = countWords(result);
    if (currentWordCount > 4 && resultWordCount < currentWordCount * 0.7) {
      console.log(`[confirm] result too short (${resultWordCount} vs ${currentWordCount}), keeping original`);
      return currentText;
    }

    console.log(`[confirm] "${result}"`);
    return result;
  } catch {
    return currentText;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Macro Pre/Post Processing
// ─────────────────────────────────────────────────────────────────────────────

/** Pre-LLM macro: apply ALL local corrections in deterministic order */
function macroPreProcess(rawText, userCorrections, pronProfile) {
  // 1. Hinglish transliteration
  let text = transliterateHinglish(rawText);
  if (text !== rawText) {
    console.log(`[macro-pre] Hinglish→Devanagari: "${rawText}" → "${text}"`);
  }

  // 2. Remove stammerer repetitions: "मु-मुझे" → "मुझे", "पा-पानी" → "पानी"
  text = text.replace(/([\u0900-\u097F]{1,3})-\1/g, '$1');
  // Remove prolonged vowels: "पाआनी" → "पानी" (repeated vowel marks)
  text = text.replace(/([\u093E-\u094C])\1+/g, '$1');

  // 3. DB word/phrase corrections
  text = applyCorrections(text, userCorrections);

  // 4. Pronunciation profile
  text = applyPronunciationProfile(text, pronProfile);

  // 5. Phonetic rules
  text = applyPhoneticRules(text);

  return text;
}

/** Post-LLM macro: re-apply critical corrections to catch LLM regression */
function macroPostProcess(llmOutput, userCorrections, pronProfile) {
  let text = llmOutput;

  // Re-apply phonetic rules (LLM sometimes re-introduces errors)
  text = applyPhoneticRules(text);

  // Re-apply stammerer pattern cleanup
  text = text.replace(/([\u0900-\u097F]{1,3})-\1/g, '$1');
  text = text.replace(/([\u093E-\u094C])\1+/g, '$1');

  return text;
}

/** Calculate word-level overlap between two texts (0-100) */
function wordOverlap(a, b) {
  const wordsA = a.trim().split(/\s+/).filter(Boolean);
  const wordsB = b.trim().split(/\s+/).filter(Boolean);
  if (!wordsA.length || !wordsB.length) return 0;
  const setB = new Set(wordsB.map(w => w.toLowerCase()));
  let matched = 0;
  for (const w of wordsA) {
    if (setB.has(w.toLowerCase())) matched++;
  }
  return Math.round((matched / Math.max(wordsA.length, wordsB.length)) * 100);
}

async function runCorrectionPipeline(rawText, corrections, pronunciation, expectedContext = null, scenarioContext = null) {
  const userCorrections = normalizeCorrections(corrections);
  const pronProfile = normalizePronunciationProfile(pronunciation);

  // ── Pre-LLM Macro Pass ─────────────────────────────────────────────────
  const preProcessed = macroPreProcess(rawText, userCorrections, pronProfile);

  let aligned = preProcessed;
  if (expectedContext) {
    aligned = alignWithContext(preProcessed, expectedContext, userCorrections, pronProfile);
  }

  // ── Step 1: LLM correction (word-count constrained) ────────────────────
  let final = aligned;
  try {
    final = await runLLMCorrection(rawText, aligned, userCorrections, pronProfile, expectedContext, scenarioContext);
  } catch (llmErr) {
    console.error('[correct] LLM failed:', llmErr.message);
  }

  // ── Post-LLM Macro Pass ────────────────────────────────────────────────
  final = macroPostProcess(final, userCorrections, pronProfile);

  // ── Confidence check: skip expensive passes if pre/post are very similar
  const overlap = wordOverlap(preProcessed, final);
  console.log(`[correct] pre→post overlap: ${overlap}%`);

  // ── Step 2: Para sense-check (skip if overlap > 90%) ──────────────────
  if (overlap <= 90) {
    try {
      final = await runParagraphSenseCheck(rawText, final, userCorrections, pronProfile, expectedContext, scenarioContext);
      final = enforceWordLimit(rawText, final);
      final = macroPostProcess(final, userCorrections, pronProfile);
    } catch (e) {
      console.error('[correct] sense-check failed:', e.message);
    }
  }

  // ── Step 3: Context confirmation (only for multi-word with context) ───
  const inputWords = countWords(rawText);
  if (inputWords > 3 && (scenarioContext || expectedContext) && overlap <= 90) {
    try {
      final = await runContextConfirmation(rawText, final, scenarioContext, expectedContext);
      final = enforceWordLimit(rawText, final);
      final = macroPostProcess(final, userCorrections, pronProfile);
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
  if (!GROQ_API_KEY && !USE_LOCAL) return res.status(500).json({ error: 'GROQ_API_KEY सेट नहीं है।' });

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
  if (!GROQ_API_KEY && !USE_LOCAL) return res.status(500).json({ error: 'GROQ_API_KEY is not set.' });

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

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/test/accuracy — Batch accuracy test across all datasets
// Runs stammerer + standard datasets, reports per-language accuracy
// ─────────────────────────────────────────────────────────────────────────────
import {
  STAMMERER_DATASET,
  SENTENCE_DATASET,
} from './testDataset.js';

app.post('/api/test/accuracy', async (req, res) => {
  if (!GROQ_API_KEY && !USE_LOCAL) return res.status(500).json({ error: 'No model configured.' });

  const datasets = {
    stammerer_hindi: STAMMERER_DATASET.filter(d => d.lang === 'hindi'),
    stammerer_hinglish: STAMMERER_DATASET.filter(d => d.lang === 'hinglish'),
    sentences_hindi: SENTENCE_DATASET.map(s => ({ input: s.hinglish, expected: s.hindi, lang: 'hinglish', category: s.category })),
  };

  const results = {};
  let totalCorrect = 0;
  let totalTests = 0;

  for (const [name, dataset] of Object.entries(datasets)) {
    const details = [];
    let passed = 0;

    for (const item of dataset) {
      try {
        const corrected = await runCorrectionPipeline(
          item.input,
          [],
          [],
          item.expected,
        );
        const score = scoreWordAlignment(item.expected, corrected);
        const pass = score >= 60;
        if (pass) { passed++; totalCorrect++; }
        totalTests++;

        details.push({
          input: item.input,
          expected: item.expected,
          corrected,
          score,
          pass,
          category: item.category,
        });
      } catch (err) {
        totalTests++;
        details.push({
          input: item.input,
          expected: item.expected,
          corrected: null,
          score: 0,
          pass: false,
          error: err.message,
        });
      }
    }

    results[name] = {
      total: dataset.length,
      passed,
      accuracy: dataset.length ? Math.round((passed / dataset.length) * 100) : 0,
      details,
    };
  }

  res.json({
    overall: {
      total: totalTests,
      passed: totalCorrect,
      accuracy: totalTests ? Math.round((totalCorrect / totalTests) * 100) : 0,
    },
    byDataset: results,
    model: USE_LOCAL ? `ollama:${OLLAMA_MODEL}` : 'groq:llama-3.3-70b-versatile',
  });
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
  const modelName = USE_LOCAL ? `Ollama (${OLLAMA_MODEL})` : 'Groq llama-3.3-70b-versatile';
  console.log(`    Model: ${modelName} | Pipeline: Macro→Hinglish→DB→Phonetic→LLM→PostMacro`);
  if (!GROQ_API_KEY && !USE_LOCAL) console.warn('⚠️  No model configured — set GROQ_API_KEY or USE_LOCAL_MODEL=true');
  if (USE_LOCAL) console.log(`    Ollama URL: ${OLLAMA_URL}`);
});
}

export default app;
