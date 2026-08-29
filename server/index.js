import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeCorrections } from './db.js';
import {
  getStats as getAdaptiveStats,
  importState as importAdaptiveState,
  exportState as exportAdaptiveState,
  recordPipelineResult,
} from './adaptiveLearner.js';
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
import { alignWithContext, scoreWordAlignment } from './wordAlign.js';
import { cacheGet, cacheSet } from './cache.js';
import { rateLimit } from './rateLimit.js';
import { isSidecarAvailable } from './nlpClient.js';
import { normalizePronunciationProfile } from './pronunciationMatch.js';
import { runCorrectionPipeline, detectLanguage } from './pipeline.js';
import { transliterateHinglish } from './hinglishTranslit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

const PORT               = process.env.PORT || 3001;
const GROQ_API_KEY       = process.env.GROQ_API_KEY;
const CEREBRAS_API_KEY   = process.env.CEREBRAS_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// In-flight deduplication: if same text is being corrected concurrently,
// share one LLM call instead of making N identical calls
const inFlight = new Map();

app.use(cors());
// Accept body whether it arrives as a raw stream or a pre-buffered object (Vercel serverless)
app.use((req, res, next) => {
  if (req.body !== undefined) return next(); // already parsed
  express.json({ limit: '1mb' })(req, res, next);
});

// ─────────────────────────────────────────────────────────────────────────────
// Groq fetch helper — used by /api/transcribe (audio upload to Whisper API)
// ─────────────────────────────────────────────────────────────────────────────
const VERCEL_SAFE_TIMEOUT_MS = 8000;

async function groqFetch(url, options, maxRetries = 2) {
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
        lastError = new Error('Rate limited');
        continue;
      }
      return r;
    } catch (err) {
      lastError = err;
      if (err.name === 'AbortError') {
        console.warn(`[groq] call timed out after ${VERCEL_SAFE_TIMEOUT_MS}ms (attempt ${attempt + 1})`);
      }
    }
  }
  throw lastError;
}

// ─────────────────────────────────────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  const sidecarAvailable = await isSidecarAvailable();
  const groqConfigured = Boolean(process.env.GROQ_API_KEY || GROQ_API_KEY);
  const cerebrasConfigured = Boolean(process.env.CEREBRAS_API_KEY || CEREBRAS_API_KEY);
  const openrouterConfigured = Boolean(process.env.OPENROUTER_API_KEY || OPENROUTER_API_KEY);
  const localConfigured = process.env.USE_LOCAL_MODEL === 'true';

  res.json({
    ok: true,
    groqConfigured,
    cerebrasConfigured,
    openrouterConfigured,
    localConfigured,
    activeProvider: process.env.LLM_PROVIDER || 'auto',
    sidecarAvailable,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Transcribe audio → Hindi text
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/transcribe', rateLimit(20), upload.single('audio'), async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY || GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY सेट नहीं है (Whisper ट्रांसक्रिप्शन के लिए आवश्यक)।' });
  if (!req.file) return res.status(400).json({ error: 'कोई ऑडियो फ़ाइल नहीं मिली।' });

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

    const isContext = req.body?.isContext === 'true';
    // For patient input (Bole button), bias decoder toward real Hindi vocabulary.
    // For caregiver context mic, use conversational Hindi prompt to prevent silence/dot hallucination.
    if (isContext) {
      fd.append('prompt', 'नमस्ते, क्या बात है? क्या आप खाना खाएंगे या पानी पिएंगे? आप कहाँ जा रहे हैं?');
    } else {
      fd.append('prompt',
        'स्कूल बारिश क्योंकि कपड़े गीले बाथरूम दवाई भूख पानी दर्द थका ठंड गर्मी ' +
        'खुश डर सिर पेट रोटी चावल पापा। मैं स्कूल नहीं जा पाया। मुझे पानी चाहिए।'
      );
    }
    fd.append('temperature', '0');

    const r = await groqFetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: fd,
    });

    if (!r.ok) return res.status(r.status).json({ error: await r.text() });
    const d = await r.json();
    let transcribed = (d.text ?? '').trim();

    // If Whisper returns only a dot, comma, or punctuation symbol, clean it to empty
    if (/^[.,!?;:।\s\-_]+$/.test(transcribed)) {
      transcribed = '';
    }

    console.log(`[transcribe] (isContext=${isContext}) "${transcribed}"`);
    res.json({ text: transcribed });
  } catch (err) {
    console.error('[transcribe]', err);
    res.status(500).json({ error: 'ऑडियो को टेक्स्ट में बदलने में समस्या हुई।' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/correct — full pipeline
//
//  0. Hinglish transliteration    (instant, local)
//  1. DB word/phrase substitution  (instant, local)
//  2. Safe phonetic rules          (instant, local)
//  3. Multi-Model LLM context-aware correction (Cerebras / Groq / OpenRouter / Ollama)
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/correct', rateLimit(30), async (req, res) => {
  const hasLlm = Boolean(
    process.env.CEREBRAS_API_KEY ||
    process.env.GROQ_API_KEY ||
    process.env.OPENROUTER_API_KEY ||
    process.env.USE_LOCAL_MODEL === 'true'
  );
  if (!hasLlm) return res.status(500).json({ error: 'कोई भी LLM Provider (Cerebras, Groq, OpenRouter, या Ollama) कॉन्फ़िगर नहीं है।' });

  const { text, corrections, pronunciation, scenarioContext, patientType = 'stammerer' } = req.body ?? {};
  if (!text?.trim() || /^[.,!?;:।\s\-_]+$/.test(text.trim())) return res.json({ text: '' });

  // Cache key: text + patientType (corrections are user-specific so we skip caching those)
  const hasUserCorrections = Array.isArray(corrections) && corrections.length > 0;
  const hasPronunciation   = Array.isArray(pronunciation) && pronunciation.length > 0;
  const cacheKey = !hasUserCorrections && !hasPronunciation && !scenarioContext ? `${patientType}:${text.trim()}` : null;

  // 1. Cache hit — return instantly, no LLM call
  if (cacheKey) {
    const cached = cacheGet(cacheKey);
    if (cached) {
      console.log(`[correct] cache hit (${patientType}): "${text.trim().slice(0, 40)}"`);
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
  const pipelinePromise = runCorrectionPipeline(text, corrections, pronunciation, null, scenarioContext, patientType)
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
  if (!GROQ_API_KEY && process.env.USE_LOCAL_MODEL !== 'true') return res.status(500).json({ error: 'GROQ_API_KEY is not set.' });

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
  if (!GROQ_API_KEY && process.env.USE_LOCAL_MODEL !== 'true') return res.status(500).json({ error: 'GROQ_API_KEY is not set.' });

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
  if (!GROQ_API_KEY && process.env.USE_LOCAL_MODEL !== 'true') return res.status(500).json({ error: 'No model configured.' });

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
    model: process.env.USE_LOCAL_MODEL === 'true'
      ? `ollama:${process.env.OLLAMA_MODEL || 'phi4-mini'}`
      : 'groq:llama-3.3-70b-versatile',
  });
});

app.get('/api/corrections', (_req, res) => {
  res.json({ corrections: [] });
});

app.delete('/api/corrections/:raw', (_req, res) => {
  res.json({ ok: true, localOnly: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/adaptive/stats — adaptive learner runtime stats
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/adaptive/stats', (_req, res) => {
  res.json(getAdaptiveStats());
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/adaptive/feedback — explicit user feedback to train the model
// Body: { raw, pipelineOutput, expected }
// Called when the user corrects the app's output (teaches from real usage).
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/adaptive/feedback', (req, res) => {
  const { raw, pipelineOutput, expected } = req.body ?? {};
  if (!raw?.trim() || !expected?.trim()) {
    return res.status(400).json({ error: 'raw and expected are required' });
  }
  try {
    recordPipelineResult(raw, pipelineOutput ?? '', expected);
    res.json({ ok: true, stats: getAdaptiveStats() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tts — Text-to-Speech API (Hugging Face MMS with Google fallback)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/tts', async (req, res) => {
  const text = req.query.text;
  if (!text?.trim()) {
    return res.status(400).json({ error: 'Text parameter is required' });
  }

  // Preprocess: detect language and transliterate Hinglish to Devanagari Hindi
  const detectedLang = detectLanguage(text);
  const lang = detectedLang === 'hindi' ? 'hi' : 'en';

  let cleanedText = text;
  if (lang === 'hi') {
    cleanedText = transliterateHinglish(text);
    // Remove stammering hyphens for cleaner speech synthesis
    cleanedText = cleanedText.replace(/([a-zA-Z\u0900-\u097F]+)-\1/g, '$1');
  }

  const hfToken = process.env.HF_TOKEN;

  if (hfToken) {
    const model = lang === 'hi' ? 'facebook/mms-tts-hin' : 'facebook/mms-tts-eng';
    console.log(`[TTS] Requesting HuggingFace model: ${model} for text: "${cleanedText}"`);
    try {
      const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: cleanedText }),
      });

      if (response.ok) {
        res.setHeader('Content-Type', 'audio/wav');
        const buffer = await response.arrayBuffer();
        return res.send(Buffer.from(buffer));
      }
      console.warn(`[TTS] HuggingFace returned HTTP ${response.status}: ${await response.text()}. Falling back to Google TTS...`);
    } catch (err) {
      console.warn('[TTS] HuggingFace failed:', err.message, '. Falling back to Google TTS...');
    }
  }

  // Fallback: Free Google Translate TTS public stream (MIT licensed client equivalent)
  try {
    const googleLang = lang === 'hi' ? 'hi' : 'en';
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanedText)}&tl=${googleLang}&client=tw-ob`;
    
    console.log(`[TTS] Fetching from Google TTS: "${cleanedText}" (${googleLang})`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });

    if (!response.ok) {
      throw new Error(`Google TTS returned HTTP ${response.status}`);
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('[TTS] Error generating speech:', err.message);
    res.status(500).json({ error: 'Failed to generate voice speech output' });
  }
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
  const useLocal = process.env.USE_LOCAL_MODEL === 'true';
  const ollamaModel = process.env.OLLAMA_MODEL || 'phi4-mini';
  const modelName = useLocal ? `Ollama (${ollamaModel})` : 'Groq llama-3.3-70b-versatile';
  console.log(`    Model: ${modelName} | Pipeline: Macro→Hinglish→DB→Phonetic→LLM→PostMacro`);
  if (!GROQ_API_KEY && !useLocal) console.warn('⚠️  No model configured — set GROQ_API_KEY or USE_LOCAL_MODEL=true');
  if (useLocal) console.log(`    Ollama URL: ${process.env.OLLAMA_URL || 'http://localhost:11434'}`);
});
}

export default app;
