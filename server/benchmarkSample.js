/**
 * benchmarkSample.js — Quick 50-entry smoke test.
 * Verifies the pipeline + scoring works before committing to the full 2495-entry run.
 *
 * Usage: node server/benchmarkSample.js --model=groq
 */

import { mkdir, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Arg parsing ───────────────────────────────────────────────────────────────
const VALID_MODELS = ['auto', 'cerebras', 'groq', 'openrouter', 'ollama'];
const modelArg = process.argv.find(a => a.startsWith('--model='));
if (!modelArg) {
  process.stderr.write('Usage: node server/benchmarkSample.js --model=auto|cerebras|groq|openrouter|ollama\n');
  process.exit(1);
}
const model = modelArg.split('=')[1]?.trim().toLowerCase();
if (!VALID_MODELS.includes(model)) {
  process.stderr.write(`Unknown model "${model}". Use auto, cerebras, groq, openrouter, or ollama.\n`);
  process.exit(1);
}

// ── Env setup BEFORE import ───────────────────────────────────────────────────
process.env.USE_LOCAL_MODEL = model === 'ollama' ? 'true' : 'false';
process.env.LLM_PROVIDER    = model;

try {
  const dotenv = await import('dotenv');
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
} catch { /* rely on shell env */ }

// ── Dynamic imports ───────────────────────────────────────────────────────────
const { runCorrectionPipeline } = await import('./pipeline.js');
const { scoreWordAlignment }     = await import('./wordAlign.js');
const { STAMMERER_DATASET }      = await import('./testDataset.js');

// ── Sample: first 25 Hindi + first 25 Hinglish entries ───────────────────────
const hindi    = STAMMERER_DATASET.filter(e => e.lang === 'hindi').slice(0, 25);
const hinglish = STAMMERER_DATASET.filter(e => e.lang === 'hinglish').slice(0, 25);
const sample   = [...hindi, ...hinglish];

console.log(`\n[sample-benchmark] model=${model} | sample size=${sample.length}`);
console.log('[sample-benchmark] Running...\n');

const results = [];
const catScores = {};

for (let i = 0; i < sample.length; i++) {
  const entry = sample[i];
  let corrected = '';
  let score     = 0;

  try {
    corrected = await runCorrectionPipeline(entry.input, [], [], null, null);
    score     = scoreWordAlignment(entry.expected, corrected);
  } catch (err) {
    console.warn(`  [!] entry ${entry.id} failed: ${err.message}`);
  }

  if (!catScores[entry.category]) catScores[entry.category] = [];
  catScores[entry.category].push(score);

  results.push({ id: entry.id, lang: entry.lang, category: entry.category,
    input: entry.input, expected: entry.expected, corrected, score });

  process.stdout.write(`  [${i+1}/${sample.length}] id=${entry.id} lang=${entry.lang} score=${score} | ${entry.input.slice(0,30)}...\n`);
}

// ── Summary ───────────────────────────────────────────────────────────────────
const overall = (results.reduce((s, r) => s + r.score, 0) / results.length).toFixed(1);

console.log(`\n${'─'.repeat(60)}`);
console.log(`  SAMPLE RESULTS — model: ${model}`);
console.log(`  Entries: ${results.length} | Overall accuracy: ${overall}`);
console.log(`${'─'.repeat(60)}`);
for (const [cat, scores] of Object.entries(catScores)) {
  const avg = (scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(1);
  console.log(`  ${cat.padEnd(12)} ${avg}`);
}
console.log(`${'─'.repeat(60)}\n`);

// ── Save ──────────────────────────────────────────────────────────────────────
const ts       = new Date().toISOString();
const filename = `sample_${model}_${ts.replace(/:/g, '-').replace(/\..+$/, '')}.json`;
const outDir   = path.join(__dirname, '..', 'benchmark_results');
await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, filename), JSON.stringify({
  model, timestamp: ts, sampleSize: results.length,
  overallAccuracy: parseFloat(overall),
  categoryAccuracy: Object.fromEntries(
    Object.entries(catScores).map(([c, s]) => [c, parseFloat((s.reduce((a,b)=>a+b,0)/s.length).toFixed(1))])
  ),
  entries: results,
}, null, 2), 'utf8');

console.log(`Saved to: benchmark_results/${filename}`);
console.log('\nIf this looks good, run the full benchmark:');
console.log('  node server/benchmark.js --model=groq\n');
