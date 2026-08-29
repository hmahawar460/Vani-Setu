/**
 * benchmark.js — Standalone ES module CLI for WisperFlow pipeline benchmarking.
 *
 * Usage:
 *   node server/benchmark.js --model=groq
 *   node server/benchmark.js --model=ollama
 *
 * Runs the full 4-step correction pipeline on every entry in STAMMERER_DATASET,
 * scores each result using scoreWordAlignment(), prints a summary table, and
 * saves a timestamped JSON file to benchmark_results/.
 */

import { mkdir, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// __dirname equivalent for ES modules
// ─────────────────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─────────────────────────────────────────────────────────────────────────────
// Argument parsing
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
const VALID_MODELS = ['auto', 'cerebras', 'groq', 'openrouter', 'ollama'];

function parseArgs() {
  const modelArg = process.argv.find(a => a.startsWith('--model='));
  if (!modelArg) {
    process.stderr.write('Usage: node server/benchmark.js --model=auto|cerebras|groq|openrouter|ollama\n');
    process.exit(1);
  }
  const model = modelArg.split('=')[1]?.trim().toLowerCase();
  if (!VALID_MODELS.includes(model)) {
    process.stderr.write(`Error: unrecognized model "${model}". Valid values: ${VALID_MODELS.join(', ')}\n`);
    process.stderr.write('Usage: node server/benchmark.js --model=auto|cerebras|groq|openrouter|ollama\n');
    process.exit(1);
  }
  return model;
}

// ─────────────────────────────────────────────────────────────────────────────
// Env-var setup BEFORE dynamic import
// ─────────────────────────────────────────────────────────────────────────────
const model = parseArgs();

process.env.USE_LOCAL_MODEL = model === 'ollama' ? 'true' : 'false';
process.env.LLM_PROVIDER    = model;

// Load .env if not yet loaded
try {
  const dotenv = await import('dotenv');
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
} catch {
  // dotenv not available — rely on shell env
}

// Dynamic imports happen AFTER env-vars are set so the per-call read in
// llmChat() sees the correct value on first invocation.
const { runCorrectionPipeline } = await import('./pipeline.js');
const { scoreWordAlignment }     = await import('./wordAlign.js');
const { STAMMERER_DATASET }      = await import('./testDataset.js');

// ─────────────────────────────────────────────────────────────────────────────
// Benchmark runner
// ─────────────────────────────────────────────────────────────────────────────

async function runBenchmark() {
  const total   = STAMMERER_DATASET.length;
  const entries = [];
  const scores  = [];

  /** @type {Map<string, number[]>} */
  const categoryScores = new Map();

  console.log(`[benchmark] Starting — model: ${model} | entries: ${total}`);

  for (let i = 0; i < total; i++) {
    const entry = STAMMERER_DATASET[i];
    let corrected = '';
    let score     = 0;

    try {
      corrected = await runCorrectionPipeline(entry.input, [], [], null, null);
      score     = scoreWordAlignment(entry.expected, corrected);
    } catch (err) {
      console.warn(`[benchmark] entry ${entry.id} failed: ${err.message}`);
      corrected = '';
      score     = 0;
    }

    scores.push(score);

    // Accumulate per-category
    const cat = entry.category ?? 'unknown';
    if (!categoryScores.has(cat)) categoryScores.set(cat, []);
    categoryScores.get(cat).push(score);

    entries.push({
      id:        entry.id,
      input:     entry.input,
      expected:  entry.expected,
      corrected,
      score,
    });

    // Progress every 50 entries
    if ((i + 1) % 50 === 0) {
      console.log(`[benchmark] ${i + 1}/${total} done...`);
    }
  }

  // ── Aggregates ──────────────────────────────────────────────────────────
  const mean = arr => arr.length
    ? Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 10) / 10
    : 0;

  const overallAccuracy  = mean(scores);

  /** @type {Record<string, number>} */
  const categoryAccuracy = {};
  for (const [cat, catScores] of categoryScores) {
    categoryAccuracy[cat] = mean(catScores);
  }

  // ── Console summary table ───────────────────────────────────────────────
  printTable(model, total, overallAccuracy, categoryAccuracy);

  // ── Save JSON ───────────────────────────────────────────────────────────
  const timestamp    = new Date().toISOString();
  const fileTimestamp = timestamp.replace(/:/g, '-').replace(/\..+$/, '');
  const filename     = `benchmark_${model}_${fileTimestamp}.json`;
  const outDir       = path.join(__dirname, '..', 'benchmark_results');

  await mkdir(outDir, { recursive: true });

  const result = {
    model,
    timestamp,
    totalEntries:    total,
    overallAccuracy,
    categoryAccuracy,
    entries,
  };

  const outPath = path.join(outDir, filename);
  await writeFile(outPath, JSON.stringify(result, null, 2), 'utf8');

  console.log(`Results saved to: benchmark_results/${filename}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Table rendering (pure ASCII box-drawing)
// ─────────────────────────────────────────────────────────────────────────────

function printTable(model, total, overallAccuracy, categoryAccuracy) {
  const COL1_W = 14;  // Category column
  const COL2_W = 37;  // Accuracy column

  const pad  = (s, w) => String(s).padEnd(w);
  const lpad = (s, w) => String(s).padStart(w);

  const topBar     = `┌${'─'.repeat(COL1_W + COL2_W + 3)}┐`;
  const divider    = `├${'─'.repeat(COL1_W)}┬${'─'.repeat(COL2_W + 1)}┤`;
  const midRow     = `├${'─'.repeat(COL1_W)}┼${'─'.repeat(COL2_W + 1)}┤`;
  const bottomBar  = `└${'─'.repeat(COL1_W)}┴${'─'.repeat(COL2_W + 1)}┘`;
  const innerWidth = COL1_W + COL2_W + 3;

  const headerLine1 = `│  WisperFlow Benchmark — model: ${pad(model, innerWidth - 34)}│`;
  const headerLine2 = `│  Entries: ${total} | Overall: ${overallAccuracy}${' '.repeat(innerWidth - 11 - String(total).length - 12 - String(overallAccuracy).length)}│`;

  console.log('');
  console.log(topBar);
  console.log(headerLine1);
  console.log(headerLine2);
  console.log(divider);
  console.log(`│ ${pad('Category', COL1_W - 1)}│ ${pad('Accuracy', COL2_W - 1)} │`);
  console.log(midRow);

  for (const [cat, acc] of Object.entries(categoryAccuracy)) {
    console.log(`│ ${pad(cat, COL1_W - 1)}│ ${pad(acc, COL2_W - 1)} │`);
  }

  console.log(bottomBar);
  console.log('');
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────────────────────────────────────

runBenchmark().catch(err => {
  console.error('[benchmark] Fatal error:', err);
  process.exit(1);
});
