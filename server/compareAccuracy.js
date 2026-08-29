/**
 * compareAccuracy.js — standalone CLI to compare two benchmark result JSON files.
 *
 * Usage:
 *   node server/compareAccuracy.js <baseline.json> <new-model.json>
 */

import { readFile } from 'fs/promises';

// ─── Argument parsing ────────────────────────────────────────────────────────

const [, , baselinePath, newModelPath] = process.argv;

if (!baselinePath || !newModelPath) {
  process.stderr.write(
    'Usage: node server/compareAccuracy.js <baseline.json> <new-model.json>\n'
  );
  process.exit(1);
}

// ─── File loading ─────────────────────────────────────────────────────────────

async function loadJSON(filePath) {
  let raw;
  try {
    raw = await readFile(filePath, 'utf8');
  } catch (err) {
    process.stderr.write(`Error reading file "${filePath}": ${err.message}\n`);
    process.exit(1);
  }

  try {
    return JSON.parse(raw);
  } catch (err) {
    process.stderr.write(`Error parsing JSON from "${filePath}": ${err.message}\n`);
    process.exit(1);
  }
}

// ─── Table rendering helpers ──────────────────────────────────────────────────

const COL_CAT   = 17;
const COL_BASE  = 10;
const COL_NEW   = 11;
const COL_PASS  =  8;

function pad(str, width, align = 'left') {
  const s = String(str);
  if (align === 'right')  return s.padStart(width);
  if (align === 'center') {
    const total = width - s.length;
    const left  = Math.floor(total / 2);
    const right = total - left;
    return ' '.repeat(left) + s + ' '.repeat(right);
  }
  return s.padEnd(width);
}

function fmtAcc(val) {
  if (val === null || val === undefined) return '   N/A   ';
  // produce a fixed-width cell: space + right-aligned number + space
  const num = Number(val).toFixed(1);
  return ' ' + num.padStart(6) + '  ';
}

function border(left, mid, right, fill, widths) {
  return left + widths.map(w => fill.repeat(w + 2)).join(mid) + right;
}

const WIDTHS = [COL_CAT, COL_BASE, COL_NEW, COL_PASS];

function headerRow() {
  return (
    '│ ' + pad('Category', COL_CAT) +
    ' │ ' + pad('Baseline', COL_BASE, 'center') +
    ' │ ' + pad('New Model', COL_NEW, 'center') +
    ' │ ' + pad('Pass?', COL_PASS, 'center') +
    ' │'
  );
}

function dataRow(category, baseVal, newVal) {
  const passSymbol = (baseVal === null || newVal === null)
    ? pad('✗', COL_PASS, 'center')
    : newVal >= baseVal
      ? pad('✓', COL_PASS, 'center')
      : pad('✗', COL_PASS, 'center');

  return (
    '│ ' + pad(category, COL_CAT) +
    ' │' + fmtAcc(baseVal) +
    ' │' + fmtAcc(newVal) +
    ' │ ' + passSymbol + ' │'
  );
}

function overallRow(baseval, newVal, diff) {
  const sign   = diff >= 0 ? '+' : '';
  const diffStr = pad(`${sign}${diff.toFixed(1)}`, COL_PASS, 'center');
  return (
    '│ ' + pad('OVERALL', COL_CAT) +
    ' │' + fmtAcc(baseval) +
    ' │' + fmtAcc(newVal) +
    ' │ ' + diffStr + ' │'
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const baseline = await loadJSON(baselinePath);
  const newModel = await loadJSON(newModelPath);

  // Header info
  const bEntries   = baseline.totalEntries ?? baseline.entries ?? '?';
  const nEntries   = newModel.totalEntries  ?? newModel.entries  ?? '?';
  const bTimestamp = baseline.timestamp ?? baseline.date ?? 'unknown';
  const nTimestamp = newModel.timestamp  ?? newModel.date  ?? 'unknown';
  const bName      = baseline.model  ?? baseline.modelName  ?? 'baseline';
  const nName      = newModel.model   ?? newModel.modelName   ?? 'new-model';

  console.log('\nWisperFlow Accuracy Comparison');
  console.log(`Baseline : ${bName}  (${bEntries} entries, ${bTimestamp})`);
  console.log(`New Model: ${nName}  (${nEntries} entries, ${nTimestamp})`);
  console.log();

  // Collect categories from both files
  const bCats = baseline.categories  ?? baseline.categoryAccuracy  ?? {};
  const nCats = newModel.categories   ?? newModel.categoryAccuracy   ?? {};
  const allCats = new Set([...Object.keys(bCats), ...Object.keys(nCats)]);

  // Table
  const TOP    = border('┌', '┬', '┐', '─', WIDTHS);
  const HEADER = border('├', '┼', '┤', '─', WIDTHS);
  const SEP    = border('├', '┼', '┤', '─', WIDTHS);
  const BOTTOM = border('└', '┴', '┘', '─', WIDTHS);

  console.log(TOP);
  console.log(headerRow());
  console.log(HEADER);

  for (const cat of allCats) {
    const bVal = bCats[cat] !== undefined ? bCats[cat] : null;
    const nVal = nCats[cat] !== undefined ? nCats[cat] : null;
    console.log(dataRow(cat, bVal, nVal));
  }

  // Overall row
  const bOverall = baseline.overallAccuracy ?? baseline.overall ?? null;
  const nOverall = newModel.overallAccuracy  ?? newModel.overall  ?? null;
  const diff     = (nOverall ?? 0) - (bOverall ?? 0);

  console.log(SEP);
  console.log(overallRow(bOverall, nOverall, diff));
  console.log(BOTTOM);
  console.log();

  // Recommendation
  if (diff >= 0) {
    console.log('✅  SWAP APPROVED — new model meets or exceeds baseline accuracy');
  } else {
    console.log('❌  KEEP GROQ — new model is below baseline accuracy');
  }
  console.log();
}

main();
