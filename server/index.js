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
import { getTestQuestionById, getTestQuestions } from './testDataset.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

const PORT         = process.env.PORT || 3001;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, groqConfigured: Boolean(GROQ_API_KEY) });
});

// ─────────────────────────────────────────────────────────────────────────────
// Transcribe audio → Hindi text
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
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
    // Whisper prompt: common Hindi sentences from daily life of a disability user.
    // This biases Whisper's decoder toward real Hindi vocabulary.
    fd.append('prompt',
      'मैं स्कूल जाना चाहता था। मुझे पानी चाहिए। मुझे भूख लगी है। ' +
      'मुझे दर्द हो रहा है। बारिश हो गई। मैं थका हुआ हूँ। ' +
      'मेरे कपड़े गीले हो गए। मुझे ठंड लग रही है। ' +
      'मैं बाथरूम जाना चाहता हूँ। मुझे दवाई चाहिए। ' +
      'कृपया मेरी मदद करें। मैं ठीक नहीं हूँ। ' +
      'मुझे रोटी और चावल चाहिए। मेरे पापा मुझे लेने आए।',
    );

    const r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
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
// LLM correction — context-aware, paragraph-level, with DB word lookup
// ─────────────────────────────────────────────────────────────────────────────
async function runLLMCorrection(rawText, preProcessed, corrections = []) {
  // Pull known corrections from DB to inject as authoritative lookup
  const userCorrections = normalizeCorrections(corrections);
  const wordLookup   = getWordCorrectionsForLLM(userCorrections);
  const paraExamples = getParaExamplesForLLM(userCorrections);

  // Build the few-shot examples block from saved paragraph corrections
  let exampleBlock = '';
  if (paraExamples.length > 0) {
    exampleBlock = '\n\nपिछले सुधारों के उदाहरण (इन्हें संदर्भ के रूप में उपयोग करो):\n';
    for (const ex of paraExamples) {
      exampleBlock += `गलत: "${ex.raw}"\nसही: "${ex.corrected}"\n\n`;
    }
  }

  // Build the word lookup block
  let lookupBlock = '';
  if (wordLookup) {
    lookupBlock = `\n\nज्ञात शब्द सुधार (इन्हें पहली प्राथमिकता दो): ${wordLookup}`;
  }

  const systemPrompt =
`तुम एक AAC (Augmentative and Alternative Communication) सहायक हो।
तुम उन लोगों की मदद करते हो जिन्हें बोलने में कठिनाई है — सेरेब्रल पाल्सी, डिसार्थ्रिया, मूकता।

इनपुट दो प्रकार का हो सकता है:
A) Whisper से निकला टूटा-फूटा हिंदी देवनागरी टेक्स्ट
B) Hinglish / Roman Hindi (जैसे "mai school jana chahta tha")

──────────────────────────────────────────
तुम्हारी सोचने की प्रक्रिया (क्रम से):

चरण 1 — पूरे पैराग्राफ का अर्थ समझो:
पहले पूरा वाक्य/पैराग्राफ पढ़ो और समझो कि व्यक्ति क्या कहना चाह रहा है।
एक विकलांग व्यक्ति की आम ज़रूरतें: खाना, पानी, दर्द, थकान, स्कूल, घर, मदद, दवाई, बाथरूम।

चरण 2 — प्रत्येक गलत शब्द को पड़ोसी शब्दों के संदर्भ में सुधारो:
हर शब्द को उसके आगे और पीछे के शब्दों के साथ मिलाकर देखो।
उदाहरण:
- "बालिच हो रही थी" → पड़ोस में मौसम के शब्द हैं → "बालिच" = "बारिश"
- "तपले पूरे दीले हो दए" → "तपले"=कपड़े, "दीले"=गीले, "दए"=गए
- "दोल दो चिलो" → ठंड/कंपकंपी के संदर्भ में → "ठंड से कांप"
- "थाई" → खाने के संदर्भ में → "थी" (भूखी थी)

चरण 3 — व्याकरण ठीक करो:
- "मैं खाया" → "मैंने खाया"
- "वो जारहा" → "वो जा रहा है"
- Hinglish को देवनागरी में बदलो

चरण 4 — अधूरे वाक्य पूरे करो:
- "पानी" → "मुझे पानी चाहिए"
- "भूख" → "मुझे भूख लगी है"
──────────────────────────────────────────

कड़े नियम:
- उत्तर केवल हिंदी देवनागरी में। कोई English नहीं, कोई Roman नहीं।
- मूल भावना बिल्कुल न बदलो।
- कोई व्याख्या या लेबल नहीं — सिर्फ सुधरा हुआ वाक्य/पैराग्राफ।${lookupBlock}${exampleBlock}`;

  // Send BOTH the raw Whisper output AND the pre-processed version.
  // The LLM uses raw for phonetic clues and pre-processed for DB corrections.
  const userMessage = rawText === preProcessed
    ? rawText
    : `मूल (Whisper आउटपुट): "${rawText}"\nआंशिक सुधार: "${preProcessed}"\n\nकृपया पूरा सुधार करो।`;

  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
      temperature: 0.1,   // low = deterministic, but not 0 so it can reason
      max_tokens: 512,
    }),
  });

  if (!r.ok) {
    const detail = await r.text();
    throw new Error(`Groq error: ${detail}`);
  }

  const d = await r.json();
  const result = d.choices?.[0]?.message?.content?.trim() ?? preProcessed;
  console.log(`[correct] LLM result: "${result}"`);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/correct — full pipeline
//
//  1. DB word/phrase substitution  (instant, local)
//  2. Safe phonetic rules          (instant, local)
//  3. LLM context-aware correction (Groq, paragraph-aware, DB-informed)
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/correct', async (req, res) => {
  if (!GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY सेट नहीं है।' });

  const { text, corrections } = req.body ?? {};
  if (!text?.trim()) return res.json({ text: text ?? '' });

  const userCorrections = normalizeCorrections(corrections);

  try {
    // Step 1: Apply known DB word/phrase corrections
    const afterDB = applyCorrections(text, userCorrections);

    // Step 2: Safe phonetic fixes (only unambiguous Devanagari-level fixes)
    const afterPhonetic = applyPhoneticRules(afterDB);

    // Step 3: LLM — paragraph-aware, context-informed correction
    // Pass both raw and pre-processed so LLM has phonetic clues from raw
    let final = afterPhonetic;
    try {
      final = await runLLMCorrection(text, afterPhonetic, userCorrections);
    } catch (llmErr) {
      console.error('[correct] LLM failed, using pre-LLM result:', llmErr.message);
    }

    res.json({ text: final });
  } catch (err) {
    console.error('[correct] pipeline error:', err);
    res.json({ text: text }); // last-resort: return original
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/corrections/save
// Saves both word-level diff AND full paragraph — all lengths accepted
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/corrections/save', (_req, res) => {
  res.json({ ok: true, localOnly: true });
});

app.get('/api/test/questions', (req, res) => {
  const count = Math.min(parseInt(req.query.count) || 5, 15);
  res.json({ questions: getTestQuestions(count) });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/test/evaluate — score a user's answer against expected
// Body: { expected: "मुझे पानी चाहिए।", heard: "mujhe pani chahiye" }
// Returns: { score, feedback, corrected }
// Also auto-saves any word corrections to the DB
// ─────────────────────────────────────────────────────────────────────────────
const SCORE_PUNCTUATION_RE = /[\u0964,.?!]/g;

function wordsForScore(value = '') {
  return String(value)
    .replace(SCORE_PUNCTUATION_RE, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
}

function scoreAnswer(expected, corrected) {
  const expWords = wordsForScore(expected);
  const corrWords = wordsForScore(corrected);
  const maxLen = Math.max(expWords.length, corrWords.length);
  if (maxLen === 0) return 0;

  let matched = 0;
  expWords.forEach((word, index) => {
    if (corrWords[index] === word) matched++;
  });

  return Math.round((matched / maxLen) * 100);
}

app.post('/api/test/evaluate', async (req, res) => {
  if (!GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY is not set.' });

  const { expected, heard, questionId, corrections } = req.body ?? {};
  const question = questionId == null ? null : getTestQuestionById(questionId);
  const target = question?.hindi ?? expected;

  if (!target?.trim()) {
    return res.status(400).json({ error: 'expected or questionId is required' });
  }

  if (!heard?.trim()) {
    return res.json({ score: 0, corrected: '', expected: target, questionId: question?.id ?? questionId ?? null });
  }

  const userCorrections = normalizeCorrections(corrections);

  try {
    const afterDB       = applyCorrections(heard, userCorrections);
    const afterPhonetic = applyPhoneticRules(afterDB);
    let corrected = afterPhonetic;
    try {
      corrected = await runLLMCorrection(heard, afterPhonetic, userCorrections);
    } catch { /* use pre-LLM result */ }

    const score = scoreAnswer(target, corrected);

    res.json({ score, corrected, expected: target, questionId: question?.id ?? questionId ?? null });
  } catch (err) {
    console.error('[test/evaluate]', err);
    res.status(500).json({ error: 'Evaluation failed.' });
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
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // IMPORTANT: only catch non-API routes so API endpoints are never shadowed
  app.get(/^(?!\/api).*$/, (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

if (!process.env.VERCEL) {
app.listen(PORT, () => {
  console.log(`✅  Server on http://localhost:${PORT}`);
  console.log(`    Model: llama-3.3-70b-versatile | Pipeline: DB → Phonetic → LLM`);
  if (!GROQ_API_KEY) console.warn('⚠️  GROQ_API_KEY not set');
});
}

export default app;
