# Implementation Plan: LLM Migration to Phi-4-mini

## Overview

Extract the correction pipeline into a shared `server/pipeline.js` module, expand the `STAMMERER_DATASET` to 2,000+ entries, add benchmark and comparison CLI scripts, and update environment/documentation files. Each task builds directly on the previous one — nothing is left disconnected.

## Tasks

- [x] 1. Create `server/pipeline.js` — extract and refactor correction pipeline
  - [x] 1.1 Create `server/pipeline.js` with all extracted pipeline functions
    - Copy `runCorrectionPipeline`, `runLLMCorrection`, `runParagraphSenseCheck`, `runContextConfirmation`, `macroPreProcess`, `macroPostProcess`, `llmChat`, `ollamaChat`, `groqFetch`, `enforceWordLimit`, `countWords`, `wordOverlap`, `getTopicFromScenario`, `detectLanguage`, `isRomanizedHindi` from `server/index.js` into the new module
    - Add all necessary imports (`dotenv/config`, `db.js`, `hindiPhonetic.js`, `hinglishTranslit.js`, `pronunciationMatch.js`, `wordAlign.js`, `nlpClient.js`)
    - Change `OLLAMA_MODEL` default from `'llama3.1:8b'` to `'phi4-mini'`
    - Export `runCorrectionPipeline` and `llmChat` as the public surface
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 1.2 Refactor `llmChat()` to read `USE_LOCAL_MODEL` per-call
    - Replace the module-level `const USE_LOCAL = process.env.USE_LOCAL_MODEL === 'true'` constant inside `llmChat()` with a per-call read of `process.env.USE_LOCAL_MODEL === 'true'`
    - Also read `OLLAMA_URL`, `OLLAMA_MODEL`, and `GROQ_API_KEY` from `process.env` inside `ollamaChat()` and `groqFetch()` rather than relying on module-level constants, so that `benchmark.js` can set env vars before a dynamic `import()`
    - _Requirements: 1.1_
  - [x] 1.3 Add Ollama → Groq fallback in `llmChat()`
    - Wrap the Ollama call in a try/catch; if it throws AND `process.env.GROQ_API_KEY` exists, retry the same prompt via Groq and emit `console.warn('[llm] Ollama unavailable (...), falling back to Groq')`
    - If Ollama throws and no `GROQ_API_KEY` is present, re-throw the error
    - _Requirements: 1.4_
  - [x] 1.4 Update `server/index.js` to import pipeline from `./pipeline.js`
    - Remove all extracted functions and their local imports from `server/index.js`
    - Add `import { runCorrectionPipeline } from './pipeline.js'`
    - Retain all Express routes, middleware, dataset imports, and the `STAMMERER_DATASET` import unchanged
    - Verify the server still starts and `POST /api/correct` works end-to-end
    - _Requirements: 1.1, 1.5, 1.6_

- [x] 2. Checkpoint — pipeline extraction
  - Ensure `server/index.js` starts without errors and `runCorrectionPipeline` is importable from `server/pipeline.js` in isolation. Ask the user if anything is unclear before proceeding.

- [x] 3. Create `server/generateDataset.js` — synthetic dataset generator
  - [x] 3.1 Implement `generateEntry()` and base sentence tables
    - Define the 25 short Hindi base sentences (with Hinglish equivalents) covering categories: needs, health, school, family, weather, feelings, daily, complex
    - Define the 50 long-form base sentences (≥ 8 words) in the same categories
    - Implement `generateEntry(baseHindi, baseHinglish, category, patternType, lang, id)` that applies the chosen stammer pattern to produce `{ id, input, expected, lang, category }`
    - Implement all five pattern transformers: `syllable-repetition`, `word-onset-repetition`, `vowel-prolongation`, `whisper-distortion`, `combined`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  - [x] 3.2 Implement ID assignment and duplicate guard
    - Assign IDs sequentially starting at 6000, incrementing by 1
    - Before writing any output, verify no generated ID collides with existing IDs in `STAMMERER_DATASET` (5001–5410); throw a descriptive error if a collision is detected
    - _Requirements: 2.7, 2.8_
  - [x] 3.3 Implement `--dry-run` flag and file-append logic
    - Parse `process.argv` for `--dry-run`; if present, `console.log` the generated entries as a JSON array and exit without writing
    - When not dry-run, read `server/testDataset.js`, locate the closing `];` of the `STAMMERER_DATASET` array, and insert the new entries (as a formatted JS array literal block) before it, then write the file back
    - _Requirements: 2.1, 2.9_
  - [x] 3.4 Run the script to populate `server/testDataset.js` with 2,000+ entries
    - Execute `node server/generateDataset.js` (without `--dry-run`) to append the generated entries
    - Verify `STAMMERER_DATASET` now contains at least 2,000 entries total (existing ~95 + generated ~1,935+)
    - _Requirements: 2.9_

- [x] 4. Checkpoint — dataset expansion
  - Confirm `STAMMERER_DATASET.length >= 2000` by importing `testDataset.js` in a one-liner. Ask the user if anything is unclear.

- [x] 5. Create `server/benchmark.js` — accuracy benchmark CLI
  - [x] 5.1 Implement CLI argument parsing and env-var setup
    - Parse `--model=groq` or `--model=ollama` from `process.argv`; exit with code 1 and a descriptive message for any other value or if `--model` is missing
    - Set `process.env.USE_LOCAL_MODEL` to `'true'` when `--model=ollama`, or `'false'` when `--model=groq`, **before** dynamically importing `./pipeline.js` via `await import('./pipeline.js')`
    - _Requirements: 3.1, 3.2, 3.3, 3.10_
  - [x] 5.2 Implement per-entry pipeline execution and scoring
    - Import `STAMMERER_DATASET` from `./testDataset.js`
    - Loop over every entry sequentially; for each entry call `runCorrectionPipeline(entry.input, [], [], null, null)` and score with `scoreWordAlignment(entry.expected, corrected)` from `./wordAlign.js`
    - On pipeline error for a single entry, catch it, record `{ score: 0, corrected: '' }`, log a warning, and continue
    - _Requirements: 3.4, 3.6_
  - [x] 5.3 Compute aggregates and print summary table
    - Compute `overallAccuracy` as the arithmetic mean of all entry scores
    - Compute `categoryAccuracy` as the mean score per `category` value
    - Print `totalEntries`, `overallAccuracy`, and the per-category breakdown as a formatted table to stdout
    - _Requirements: 3.5, 3.6_
  - [x] 5.4 Save JSON result file to `benchmark_results/`
    - Create `benchmark_results/` with `fs/promises mkdir({ recursive: true })` if it does not exist
    - Build the result object: `{ model, timestamp (ISO 8601), totalEntries, overallAccuracy, categoryAccuracy, entries }`
    - Write to `benchmark_results/benchmark_{model}_{YYYY-MM-DDTHH-MM-SS}.json` (colons replaced with hyphens in the timestamp)
    - _Requirements: 3.7, 3.8, 3.9_

- [x] 6. Create `server/compareAccuracy.js` — benchmark comparison CLI
  - [x] 6.1 Implement file argument parsing and error handling
    - Read two positional arguments from `process.argv` (baseline path and new-model path)
    - If either argument is missing, print a descriptive message to `stderr` and exit with code 1
    - Use `fs/promises readFile` with try/catch; on any file read or JSON parse error, print a descriptive message to `stderr` and exit with code 1
    - _Requirements: 4.1, 4.6_
  - [x] 6.2 Implement per-category comparison table output
    - For each category present in either result file, compare `newModel.categoryAccuracy[cat]` vs `baseline.categoryAccuracy[cat]`
    - Print a table with columns: Category, Baseline, New Model, Pass? (✓ if new ≥ baseline, ✗ otherwise)
    - _Requirements: 4.2_
  - [x] 6.3 Implement overall diff and recommendation output
    - Compute `overallDiff = newModel.overallAccuracy - baseline.overallAccuracy`
    - Print the OVERALL row with the diff value
    - Print `SWAP APPROVED` if `overallDiff >= 0`, otherwise print `KEEP GROQ`
    - _Requirements: 4.3, 4.4, 4.5_

- [x] 7. Checkpoint — scripts wired and passing
  - Confirm `node server/compareAccuracy.js` exits with code 1 when called with no arguments. Ask the user if anything is unclear before proceeding.

- [x] 8. Update `.env.example` and `README.md`
  - [x] 8.1 Update `.env.example`
    - Change the example value of `OLLAMA_MODEL` from `llama3.1:8b` to `phi4-mini`
    - Add or update the `USE_LOCAL_MODEL` entry with a comment: "Set to true to route correction passes to Phi-4-mini via Ollama (free, MIT license). GROQ_API_KEY is still required for Whisper transcription."
    - Add or update the `OLLAMA_URL` entry with its default `http://localhost:11434`
    - Retain all existing documented variables; do not remove any entries
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [x] 8.2 Add "Local LLM Setup" section to `README.md`
    - Append a new section without altering existing content
    - Include: Ollama install link and `ollama pull phi4-mini` command
    - Include: baseline benchmark command (`node server/benchmark.js --model=groq`) and Ollama benchmark command (`node server/benchmark.js --model=ollama`)
    - Include: comparison command (`node server/compareAccuracy.js <baseline.json> <new.json>`) and explanation of `SWAP APPROVED` / `KEEP GROQ`
    - State that Microsoft Phi-4-mini is released under the MIT license
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [x] 8.3 Add `benchmark_results/` to `.gitignore`
    - Append `benchmark_results/` on its own line to `.gitignore`
    - _Requirements: (supporting all benchmark requirements)_

- [x] 9. Final checkpoint — all tasks complete
  - Ensure `server/index.js` starts cleanly, `server/pipeline.js` exports `runCorrectionPipeline` and `llmChat`, `STAMMERER_DATASET.length >= 2000`, and both CLI scripts exit correctly on bad input. Ask the user if anything is unclear.

## Notes

- Tasks marked with `*` are optional and can be skipped for an MVP (none in this plan — all tasks are required for the swap decision to be possible).
- Each task references specific requirements for traceability.
- The design has no "Correctness Properties" section, so no property-based test sub-tasks are included; this is intentional per the design document note.
- Checkpoints ensure incremental validation after each major milestone.
- The order is strictly sequential: `pipeline.js` must exist before `benchmark.js` can import it; the dataset must be expanded before a meaningful benchmark run; both benchmark JSONs must exist before `compareAccuracy.js` is useful.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3"] },
    { "id": 3, "tasks": ["1.4"] },
    { "id": 4, "tasks": ["3.1"] },
    { "id": 5, "tasks": ["3.2"] },
    { "id": 6, "tasks": ["3.3"] },
    { "id": 7, "tasks": ["3.4"] },
    { "id": 8, "tasks": ["5.1"] },
    { "id": 9, "tasks": ["5.2"] },
    { "id": 10, "tasks": ["5.3", "6.1"] },
    { "id": 11, "tasks": ["5.4", "6.2"] },
    { "id": 12, "tasks": ["6.3"] },
    { "id": 13, "tasks": ["8.1", "8.2", "8.3"] }
  ]
}
```
