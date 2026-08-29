/**
 * pipeline.js — Stateless correction pipeline for WisperFlow.
 *
 * Contains all LLM routing logic and the four-step stammer correction
 * pipeline. No HTTP, no Express, no app.listen().
 *
 * Exported public surface:
 *   - runCorrectionPipeline(rawText, corrections, pronunciation, expectedContext, scenarioContext)
 *   - llmChat(systemPrompt, userMessage, maxTokens)
 *
 * Environment variables consumed (read per-call from process.env):
 *   USE_LOCAL_MODEL  — 'true' to route through Ollama, otherwise Groq
 *   OLLAMA_URL       — default 'http://localhost:11434'
 *   OLLAMA_MODEL     — default 'phi4-mini'
 *   GROQ_API_KEY     — required for Groq path
 */

import 'dotenv/config';
import { autocorrect, addTargetTemplate } from './autocorrectModel.js';
import {
  applyCorrections,
  getWordCorrectionsForLLM,
  getParaExamplesForLLM,
  normalizeCorrections,
} from './db.js';
import { applyPhoneticRules } from './hindiPhonetic.js';
import { transliterateHinglish, getHinglishHintsForLLM } from './hinglishTranslit.js';
import {
  applyPronunciationProfile,
  getPronunciationHintsForLLM,
  normalizePronunciationProfile,
} from './pronunciationMatch.js';
import { alignWithContext } from './wordAlign.js';
import {
  spellCorrect,
  grammarCorrectHindi,
  grammarCorrectEnglish,
  hinglishPipeline,
} from './nlpClient.js';
import { applyDyslexiaCorrections, addDyslexiaTargetTemplate } from './dyslexiaDataset.js';
import {
  applyLearnedCorrections,
  getLearnedHintsForLLM,
  recordPipelineResult,
} from './adaptiveLearner.js';

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Environment variables
// ─────────────────────────────────────────────────────────────────────────────
const GROQ_API_KEY       = process.env.GROQ_API_KEY;
const CEREBRAS_API_KEY   = process.env.CEREBRAS_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OLLAMA_URL         = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL       = process.env.OLLAMA_MODEL || 'phi4-mini';

// Safe per-call timeout (keep under 8000ms for edge/serverless compatibility)
const VERCEL_SAFE_TIMEOUT_MS = 8000;

// ─────────────────────────────────────────────────────────────────────────────
// Language detection helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detect whether `text` is primarily Hindi (Devanagari) or English.
 *
 * Counts Devanagari codepoints (U+0900–U+097F) vs total alphabetic characters
 * (Latin a-zA-Z + Devanagari). Returns 'hindi' when the Devanagari ratio
 * exceeds 0.40, otherwise 'english'.
 *
 * @param {string} text
 * @returns {'hindi' | 'english'}
 */
export function detectLanguage(text) {
  if (!text) return 'hindi';

  let alphaCount = 0;
  let devanagariCount = 0;

  for (const ch of text) {
    const cp = ch.codePointAt(0);
    const isDevanagari = cp >= 0x0900 && cp <= 0x097F;
    const isLatin = (cp >= 0x0041 && cp <= 0x005A) || (cp >= 0x0061 && cp <= 0x007A);

    if (isDevanagari || isLatin) {
      alphaCount++;
      if (isDevanagari) devanagariCount++;
    }
  }

  if (alphaCount === 0) return 'hindi';
  return devanagariCount / alphaCount > 0.40 ? 'hindi' : 'english';
}

/**
 * Returns true when the text looks like Romanized Hindi (Hinglish):
 * - Contains more than 2 Latin-script words
 * - Contains NO Devanagari characters (U+0900–U+097F)
 *
 * @param {string} text
 * @returns {boolean}
 */
export function isRomanizedHindi(text) {
  if (!text) return false;

  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp >= 0x0900 && cp <= 0x097F) return false;
  }

  const latinWords = text.match(/[a-zA-Z]+/g) ?? [];
  return latinWords.length > 2;
}

// ─────────────────────────────────────────────────────────────────────────────
// Word-count helpers
// ─────────────────────────────────────────────────────────────────────────────

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function enforceWordLimit(input, output) {
  const inputWords = countWords(input);
  if (inputWords === 0) return output;

  const outputWords = countWords(output);
  const maxWords = Math.max(Math.ceil(inputWords * 1.2), inputWords + 4);

  if (outputWords <= maxWords) return output;

  const words = output.trim().split(/\s+/);
  const trimmed = words.slice(0, maxWords).join(' ');
  console.log(`[word-limit] trimmed ${outputWords}→${maxWords} words`);
  return trimmed;
}

/** Calculate word-level overlap between two texts (0–100) */
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

// ─────────────────────────────────────────────────────────────────────────────
// Scenario topic extraction
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Generic Fetch with retry on 429
// ─────────────────────────────────────────────────────────────────────────────

async function safeFetch(url, options, providerName = 'api', maxRetries = 2) {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      await new Promise(r => setTimeout(r, 500));
    }
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), VERCEL_SAFE_TIMEOUT_MS);
      const r = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      if (r.status === 429) {
        await new Promise(res => setTimeout(res, 1000));
        lastError = new Error(`[${providerName}] Rate limited (429)`);
        continue;
      }
      return r;
    } catch (err) {
      lastError = err;
      if (err.name === 'AbortError') {
        console.warn(`[${providerName}] call timed out after ${VERCEL_SAFE_TIMEOUT_MS}ms (attempt ${attempt + 1})`);
      }
    }
  }
  throw lastError;
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider-Specific Chat Callers
// ─────────────────────────────────────────────────────────────────────────────

/** Cerebras Cloud inference (ultra-fast GPT-OSS-120B / Gemma-4-31B) */
async function cerebrasChat(systemPrompt, userMessage, maxTokens = 256) {
  const apiKey = process.env.CEREBRAS_API_KEY || CEREBRAS_API_KEY;
  if (!apiKey) throw new Error('CEREBRAS_API_KEY not configured');

  const model = process.env.CEREBRAS_MODEL || 'gpt-oss-120b';
  const r = await safeFetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0,
      max_tokens: maxTokens,
    }),
  }, 'cerebras');

  if (!r.ok) {
    const detail = await r.text();
    throw new Error(`Cerebras error (${r.status}): ${detail}`);
  }

  const d = await r.json();
  return d.choices?.[0]?.message?.content?.trim() ?? '';
}

/** Groq inference (GPT-OSS-120B / Qwen-3.8-27B) */
async function groqChat(systemPrompt, userMessage, maxTokens = 256) {
  const apiKey = process.env.GROQ_API_KEY || GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
  const r = await safeFetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0,
      max_tokens: maxTokens,
    }),
  }, 'groq');

  if (!r.ok) {
    const detail = await r.text();
    throw new Error(`Groq error (${r.status}): ${detail}`);
  }

  const d = await r.json();
  return d.choices?.[0]?.message?.content?.trim() ?? '';
}

/** OpenRouter inference (meta-llama/llama-3.3-70b-instruct) */
async function openRouterChat(systemPrompt, userMessage, maxTokens = 256) {
  const apiKey = process.env.OPENROUTER_API_KEY || OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

  const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct';
  const r = await safeFetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:3001',
      'X-Title': 'WisperFlow AAC',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0,
      max_tokens: maxTokens,
    }),
  }, 'openrouter');

  if (!r.ok) {
    const detail = await r.text();
    throw new Error(`OpenRouter error (${r.status}): ${detail}`);
  }

  const d = await r.json();
  return d.choices?.[0]?.message?.content?.trim() ?? '';
}

/** Ollama local model inference */
async function ollamaChat(systemPrompt, userMessage, maxTokens = 512) {
  const model = process.env.OLLAMA_MODEL || OLLAMA_MODEL;
  const url = process.env.OLLAMA_URL || OLLAMA_URL;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VERCEL_SAFE_TIMEOUT_MS);

  try {
    const r = await fetch(`${url}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        stream: false,
        options: { temperature: 0, num_predict: maxTokens },
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!r.ok) throw new Error(`Ollama error: ${await r.text()}`);
    const d = await r.json();
    return d.message?.content?.trim() ?? '';
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Multi-Provider Intelligent Orchestrator & Fallback Chain
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Executes chat inference across configured LLM providers with automatic fallback.
 *
 * Routing logic:
 * 1. Checks `LLM_PROVIDER` environment variable ('auto' | 'cerebras' | 'groq' | 'openrouter' | 'ollama').
 * 2. If 'auto' or unset: tries Cerebras (blazing fast) -> Groq -> OpenRouter -> Ollama.
 * 3. If primary model fails or rate-limits, cascades seamlessly to the next available engine.
 *
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @param {number} [maxTokens=256]
 * @returns {Promise<string>}
 */
export async function llmChat(systemPrompt, userMessage, maxTokens = 256) {
  const useLocal = process.env.USE_LOCAL_MODEL === 'true';
  const configuredProvider = (process.env.LLM_PROVIDER || (useLocal ? 'ollama' : 'auto')).toLowerCase();

  // Define candidate provider executors
  const providers = {
    cerebras: { name: 'Cerebras (Llama-3.3-70B)', hasKey: () => Boolean(process.env.CEREBRAS_API_KEY || CEREBRAS_API_KEY), fn: cerebrasChat },
    groq: { name: 'Groq (Llama-3.3-70B)', hasKey: () => Boolean(process.env.GROQ_API_KEY || GROQ_API_KEY), fn: groqChat },
    openrouter: { name: 'OpenRouter (Llama-3.3-70B)', hasKey: () => Boolean(process.env.OPENROUTER_API_KEY || OPENROUTER_API_KEY), fn: openRouterChat },
    ollama: { name: 'Ollama Local', hasKey: () => true, fn: ollamaChat },
  };

  // Build the prioritized trial order
  let order = [];
  if (configuredProvider === 'cerebras') {
    order = ['cerebras', 'groq', 'openrouter', 'ollama'];
  } else if (configuredProvider === 'groq') {
    order = ['groq', 'cerebras', 'openrouter', 'ollama'];
  } else if (configuredProvider === 'openrouter') {
    order = ['openrouter', 'cerebras', 'groq', 'ollama'];
  } else if (configuredProvider === 'ollama') {
    order = ['ollama', 'cerebras', 'groq', 'openrouter'];
  } else {
    // 'auto' mode: Speed-first orchestration
    order = ['cerebras', 'groq', 'openrouter', 'ollama'];
  }

  // Filter down to available candidates
  const candidates = order.filter(k => providers[k]?.hasKey());
  if (candidates.length === 0) {
    throw new Error('No LLM providers configured. Please set CEREBRAS_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, or start Ollama.');
  }

  let lastError = null;
  for (const key of candidates) {
    const provider = providers[key];
    try {
      const result = await provider.fn(systemPrompt, userMessage, maxTokens);
      if (result) {
        return result;
      }
    } catch (err) {
      lastError = err;
      console.warn(`[llm-orchestrator] ${provider.name} failed: ${err.message}. Trying next provider in chain...`);
    }
  }

  throw lastError || new Error('All LLM providers failed to generate a response');
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

  // 6. Dyslexia dataset corrections (static, 2000+ patterns)
  const afterDyslexia = applyDyslexiaCorrections(text);
  if (afterDyslexia !== text) {
    console.log(`[macro-pre] dyslexia fix: "${text}" → "${afterDyslexia}"`);
    text = afterDyslexia;
  }

  // 7. Adaptive learned corrections (dynamic, grows from pipeline mistakes)
  const afterAdaptive = applyLearnedCorrections(text);
  if (afterAdaptive !== text) {
    console.log(`[macro-pre] adaptive fix: "${text}" → "${afterAdaptive}"`);
    text = afterAdaptive;
  }

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

// ─────────────────────────────────────────────────────────────────────────────
// Pipeline steps
// ─────────────────────────────────────────────────────────────────────────────

function cleanLLMResponse(text) {
  if (!text) return '';
  let cleaned = text.trim();

  // 1. Look for known transition phrases indicating the final corrected output
  const outputKeywords = [
    'सुधारित पैराग्राफ',
    'सुधारित वाक्य',
    'सुधरा हुआ वाक्य',
    'बदला हुआ वाक्य',
    'संशोधित वाक्य',
    'बदलित वाक्य',
    'सुधारित',
    'संशोधित',
    'उत्तर',
    'वाक्य'
  ];

  for (const kw of outputKeywords) {
    const idx = cleaned.toLowerCase().lastIndexOf(kw.toLowerCase());
    if (idx !== -1) {
      const afterKw = cleaned.substring(idx + kw.length);
      const colonIdx = afterKw.indexOf(':');
      if (colonIdx !== -1) {
        cleaned = afterKw.substring(colonIdx + 1).trim();
        break;
      }
    }
  }

  // 2. Extract the LAST quoted string if multiple exist (avoids matching input sentence quotes)
  const allQuotes = [];
  const quoteRegex = /["'“”«»]([^"'“”«»]{2,})["'“”«»]/g;
  let match;
  while ((match = quoteRegex.exec(cleaned)) !== null) {
    allQuotes.push(match[1].trim());
  }

  if (allQuotes.length > 0) {
    return allQuotes[allQuotes.length - 1];
  }

  // 3. Fallback: Cleanup prefixes and quotes
  cleaned = cleaned.replace(/^(आइए नियमों का पालन करते हुए|तुलने के लिए|नियमों के अनुसार|बदला हुआ वाक्य|सुधरा हुआ वाक्य|बदलित वाक्य|संशोधित वाक्य|उत्तर|वाक्य)\s*[^:]*:\s*/i, '');
  cleaned = cleaned.replace(/^["'“”\s]+|["'“”\s]+$/g, '').trim();

  return cleaned;
}

async function runLLMCorrection(rawText, preProcessed, corrections = [], pronunciation = [], expectedContext = null, scenarioContext = null, patientType = 'stammerer') {
  const userCorrections = normalizeCorrections(corrections);
  const wordLookup    = getWordCorrectionsForLLM(userCorrections);
  const paraExamples  = getParaExamplesForLLM(userCorrections);
  const pronHints     = getPronunciationHintsForLLM(pronunciation);
  const hinglishHints = getHinglishHintsForLLM(30);

  const inputWordCount = countWords(rawText);
  const maxOutputWords = Math.max(Math.ceil(inputWordCount * 1.2), inputWordCount + 4);

  const learnedHints = getLearnedHintsForLLM(15);

  const isDyslexia = patientType === 'dyslexia';
  const roleDesc = isDyslexia
    ? 'AAC डिस्लेक्सिया (Dyslexia) सहायक। डिस्लेक्सिया पीड़ित व्यक्ति के अक्षरों के उलटफेर (म/न, ब/व, b/d, p/q, u/n), मात्राओं की गलतियों और ध्वन्यात्मक वर्तनी को सही व प्राकृतिक हिंदी में बदलो।'
    : 'AAC सहायक। वाक् विकलांग (हकलाने/Stammering) व्यक्ति की अस्पष्ट बोली को सुधारो।';

  const knownErrors = isDyslexia
    ? 'डिस्लेक्सिया पैटर्न: मदी=नदी, वदल=बदल, कमन=कमल, मकल=मकान, स्कल=स्कूल, पनी=पानी, कपर=कपड़े, खन=खाना, doy=boy, qan=pan'
    : 'Whisper गलतियाँ: तूल=स्कूल, बालिच=बारिश, इतली/तूकी=इसलिए, दई=गई, तपले=कपड़े, दीले=गीले, मेला=मेरा, था-लिया=खा-लिया, बला=भरा, पिलात्ता=इसलिए, डाला=गया';

  const scenarioLine = scenarioContext
    ? `\n🔴 केयरगिवर का संदर्भ/सवाल: "${scenarioContext}" → विषय: ${getTopicFromScenario(scenarioContext)}\nइस संदर्भ व विषय के आधार पर अर्थ समझो।`
    : '';
  const userCorrLine = wordLookup ? `\nज्ञात सुधार: ${wordLookup}` : '';
  const pronLine = pronHints ? `\nउच्चारण: ${pronHints}` : '';
  const learnedLine = learnedHints ? `\nसीखे सुधार: ${learnedHints}` : '';
  const exampleLine = paraExamples.length > 0
    ? '\n' + paraExamples.slice(0, 2).map(e => `"${e.raw}"→"${e.corrected}"`).join(', ')
    : '';

  const prompt = `${roleDesc}${scenarioLine}${userCorrLine}${pronLine}${learnedLine}

${knownErrors}

Hinglish: ${hinglishHints.slice(0, 200)}

शब्द सीमा: इनपुट ${inputWordCount} शब्द → आउटपुट अधिकतम ${maxOutputWords} शब्द।${exampleLine}

नियम: केवल शुद्ध हिंदी देवनागरी। कोई व्याख्या नहीं। मूल अर्थ और भावना को संदर्भ अनुसार सही करो।
चरण: 1)ज्ञात सुधार लागू करो 2)अक्षर उलटफेर व मात्रा गलतियाँ ठीक करो 3)Hinglish→देवनागरी 4)संदर्भ से सही अर्थ निकालो 5)व्याकरण व वाक्य रचना ठीक करो`;

  const userMessage = rawText === preProcessed
    ? rawText
    : `मूल: "${rawText}"\nआंशिक: "${preProcessed}"\n\nसुधारो।`;

  const result = await llmChat(prompt, userMessage, 512);
  const cleaned = cleanLLMResponse(result || preProcessed);
  const limited = enforceWordLimit(rawText, cleaned);
  console.log(`[correct] LLM result (${patientType}): "${limited}"`);
  return limited;
}

/** Final pass: verify paragraph makes sense; fix words using prev/next context */
async function runParagraphSenseCheck(rawText, currentText, corrections = [], pronunciation = [], expectedContext = null, scenarioContext = null, patientType = 'stammerer') {
  const pronHints = getPronunciationHintsForLLM(pronunciation);
  const isDyslexia = patientType === 'dyslexia';

  const systemPrompt =
`तुम AAC सहायक हो। दिया गया हिंदी वाक्य/पैराग्राफ पढ़ो और जाँचो कि क्या यह समझ में आता है।

⚠️ सभी नियम समान प्राथमिकता के हैं:

<RULES>
1. हर शब्द को उसके पिछले और अगले शब्दों के साथ जोड़कर देखो — शब्द आपस में जुड़े होने चाहिए।
2. अगर कोई शब्द अर्थहीन या उल्टे अक्षरों वाला है, उसे संदर्भ के अनुसार सही शब्द से बदलो।
3. ${isDyslexia ? 'अक्षरों व शब्दों के क्रम को सुसंगत और सही व्याकरण में लाओ।' : 'हकलाने/दोहराव को हटाओ: "मु-मुझे" → "मुझे"'}
4. Hinglish/Roman शब्द बचे हों तो उन्हें देवनागरी में बदलो।
5. अधूरा वाक्य हो तो संदर्भ से पूरा करो।
6. मूल भावना न बदलो। केवल देवनागरी में उत्तर दो — कोई व्याख्या नहीं।
</RULES>

<COMMON_ERRORS>
${isDyslexia ? 'डिस्लेक्सिया: मदी=नदी, वदल=बदल, कमन=कमल, स्कल=स्कूल, पनी=पानी' : 'ज्ञात गलतियाँ: "तूल"=स्कूल, "बालिच"=बारिश, "तूकी"=क्योंकि, "दई"=गई, "तपले"=कपड़े, "दीले"=गीले, "तोशू"=खुश'}
</COMMON_ERRORS>${pronHints ? `\n\n<PRONUNCIATION>\nउच्चारण प्रोफ़ाइल: ${pronHints}\n</PRONUNCIATION>` : ''}${expectedContext ? `\n\n<EXPECTED>\nलक्ष्य संदर्भ: "${expectedContext}"\n</EXPECTED>` : ''}${scenarioContext ? `\n\n<SCENARIO>\nकेयरगिवर का संदर्भ: "${scenarioContext}"\n</SCENARIO>` : ''}`;

  const userMessage =
`मूल Whisper: "${rawText}"
वर्तमान सुधार: "${currentText}"

पूरे वाक्य/पैराग्राफ की समझ जाँचो। गलत/असंबद्ध शब्द सही करो। पिछले-अगले शब्दों से जोड़कर पूरा सार्थक वाक्य दो।`;

  try {
    const result = await llmChat(systemPrompt, userMessage, 512);
    if (!result) return currentText;
    const cleaned = cleanLLMResponse(result);
    console.log(`[sense-check] "${cleaned}"`);
    return cleaned;
  } catch {
    return currentText;
  }
}

/**
 * Final confirmation step — verifies the corrected answer is relevant
 * to the stranger's question. Runs after sense-check.
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
    if (!result) return currentText;
    const cleaned = cleanLLMResponse(result);

    const isMetaResponse = /^(हाँ|नहीं)[,،]?\s*(यह|यह उत्तर|उत्तर)/i.test(cleaned);
    if (isMetaResponse) {
      console.log(`[confirm] discarded meta-response, keeping: "${currentText}"`);
      return currentText;
    }

    const currentWordCount = countWords(currentText);
    const resultWordCount  = countWords(cleaned);
    if (currentWordCount > 4 && resultWordCount < currentWordCount * 0.7) {
      console.log(`[confirm] result too short (${resultWordCount} vs ${currentWordCount}), keeping original`);
      return currentText;
    }

    console.log(`[confirm] "${cleaned}"`);
    return cleaned;
  } catch {
    return currentText;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Full four-step correction pipeline for Stammerer and Dyslexia patients.
 *
 * @param {string}      rawText          - Original (stammered or dyslexic) input text
 * @param {Array}       corrections      - User DB corrections [{raw, corrected}]
 * @param {Array}       pronunciation    - Pronunciation profile entries
 * @param {string|null} expectedContext  - Expected answer for test mode alignment
 * @param {string|null} scenarioContext  - Caregiver scenario question
 * @param {string}      patientType      - 'stammerer' | 'dyslexia'
 * @returns {Promise<string>} Corrected Devanagari text
 */
export async function runCorrectionPipeline(rawText, corrections, pronunciation, expectedContext = null, scenarioContext = null, patientType = 'stammerer') {
  // 1. Try matching against offline templates if stammerer
  if (patientType === 'stammerer') {
    const matchResult = autocorrect(rawText);
    if (matchResult.isTemplate) {
      console.log(`[autocorrect] matched offline template: "${matchResult.text}"`);
      return matchResult.text;
    }
  }

  // 2. Run the full multi-model LLM 4-step correction pipeline
  console.log(`[autocorrect] running 4-step pipeline (${patientType}) for: "${rawText}"`);

  const userCorrections = normalizeCorrections(corrections);
  const pronProfile = normalizePronunciationProfile(pronunciation);

  // ── Macro Pre-Processing ──────────────────────────────────────────────
  const preProcessed = macroPreProcess(rawText, userCorrections, pronProfile);

  // ── STEP 1: Analyzer (Context-Aware) ─────────────────────────────────
  let step1Output = preProcessed;
  try {
    console.log(`[step1-analyzer] input: "${preProcessed}"`);

    step1Output = await spellCorrect(preProcessed);

    if (isRomanizedHindi(step1Output)) {
      const hinglishResult = await hinglishPipeline(step1Output);
      if (hinglishResult.devanagari) {
        step1Output = hinglishResult.devanagari;
      }
    }

    if (expectedContext) {
      step1Output = alignWithContext(step1Output, expectedContext, userCorrections, pronProfile);
    }

    console.log(`[step1-analyzer] output: "${step1Output}"`);
  } catch (err) {
    console.error('[step1-analyzer] failed, using pre-processed:', err.message);
    step1Output = preProcessed;
  }

  // ── STEP 2: Grammar & Context Corrector (Multi-Model LLM) ─────────────
  let step2Output = step1Output;
  try {
    console.log(`[step2-grammar] input: "${step1Output}"`);

    const lang = detectLanguage(step1Output);
    let grammarFixed = step1Output;

    if (lang === 'hindi') {
      grammarFixed = await grammarCorrectHindi(step1Output);
    } else {
      grammarFixed = await grammarCorrectEnglish(step1Output);
    }

    step2Output = await runLLMCorrection(rawText, grammarFixed, userCorrections, pronProfile, expectedContext, scenarioContext, patientType);

    console.log(`[step2-grammar] output: "${step2Output}"`);
  } catch (err) {
    console.error('[step2-grammar] failed, using step1 output:', err.message);
    step2Output = step1Output;
  }

  // ── STEP 3: Coherence Check ───────────────────────────────────────────
  let step3Output = step2Output;
  try {
    console.log(`[step3-coherence] input: "${step2Output}"`);
    step3Output = await runParagraphSenseCheck(rawText, step2Output, userCorrections, pronProfile, expectedContext, scenarioContext, patientType);
    console.log(`[step3-coherence] output: "${step3Output}"`);
  } catch (err) {
    console.error('[step3-coherence] failed, using step2 output:', err.message);
    step3Output = step2Output;
  }

  // ── STEP 4: Final Context Confirmation ────────────────────────────────
  let step4Output = step3Output;
  if (scenarioContext?.trim()) {
    try {
      console.log(`[step4-confirm] input: "${step3Output}"`);
      step4Output = await runContextConfirmation(rawText, step3Output, scenarioContext, expectedContext);
      console.log(`[step4-confirm] output: "${step4Output}"`);
    } catch (err) {
      console.error('[step4-confirm] failed, using step3 output:', err.message);
      step4Output = step3Output;
    }
  }

  // ── Macro Post-Processing ─────────────────────────────────────────────
  const finalText = macroPostProcess(step4Output, userCorrections, pronProfile);

  // ── Feed the newly corrected sentence back to our dataset ─────────────
  if (finalText) {
    if (patientType === 'dyslexia') {
      addDyslexiaTargetTemplate(finalText);
    } else {
      addTargetTemplate(finalText);
    }
  }

  // ── Adaptive Learning: record result for future improvement ──────────
  if (expectedContext) {
    setImmediate(() => {
      try {
        recordPipelineResult(rawText, finalText, expectedContext);
      } catch { /* never block main pipeline */ }
    });
  }

  return finalText;
}
