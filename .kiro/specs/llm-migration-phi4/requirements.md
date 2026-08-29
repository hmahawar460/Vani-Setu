# Requirements Document

## Introduction

WisperFlow currently uses Groq's `llama-3.3-70b-versatile` (paid API) as the LLM for three correction passes per request: grammar correction, coherence check, and context confirmation. This feature replaces that LLM with Microsoft Phi-4-mini — a free, MIT-licensed model served locally via Ollama — so that the only remaining Groq dependency is the Whisper audio transcription endpoint. The swap is conditional: the new model must achieve accuracy at least equal to the current Groq LLM on the full `STAMMERER_DATASET` before it becomes the default. The feature also expands that dataset to 2,000+ synthetic rows and introduces tooling to measure and compare model accuracy objectively.

## Glossary

- **System**: The WisperFlow Node.js backend (`server/index.js`) and its associated modules.
- **Phi4Mini_LLM**: The Microsoft Phi-4-mini model served locally via Ollama, accessed through the existing `llmChat()` function when `USE_LOCAL_MODEL=true`.
- **Groq_LLM**: The `llama-3.3-70b-versatile` model accessed via the Groq API, used as the current default and retained as a fallback.
- **Groq_Whisper**: The Whisper transcription service (`whisper-large-v3`) on Groq — not replaced by this feature.
- **Ollama**: The local model runtime server (default URL `http://localhost:11434`) used to serve Phi-4-mini.
- **STAMMERER_DATASET**: The array of synthetic stammer-correction test entries exported from `server/testDataset.js`, each with fields `{ id, input, expected, lang, category }`.
- **Benchmark_Script**: The standalone Node.js script `server/benchmark.js` that runs the correction pipeline on the full `STAMMERER_DATASET` and records accuracy results.
- **Comparison_Script**: The standalone Node.js script `server/compareAccuracy.js` that reads two benchmark result JSON files and reports whether the new model meets the accuracy threshold.
- **Accuracy_Score**: The numeric value (0–100) returned by `scoreWordAlignment(expected, corrected)` from `server/wordAlign.js` for a single entry; averaged across entries for aggregate accuracy.
- **Benchmark_Results_Dir**: The `benchmark_results/` directory at the workspace root where benchmark output JSON files are saved.
- **Accuracy_Threshold**: The condition that the new model's overall accuracy must be greater than or equal to the baseline (Groq LLM) overall accuracy for a swap to be approved.

---

## Requirements

### Requirement 1: Phi-4-mini as Primary LLM

**User Story:** As a WisperFlow developer, I want Phi-4-mini served via Ollama to be the default LLM for all correction passes, so that the application no longer incurs costs from the Groq LLM API for text correction.

#### Acceptance Criteria

1. WHEN `USE_LOCAL_MODEL` is set to `true`, THE System SHALL establish the Ollama routing configuration at server startup so that all subsequent `llmChat()` calls are routed to the Ollama endpoint using the model specified by `OLLAMA_MODEL`.
2. THE System SHALL default `OLLAMA_MODEL` to `phi4-mini` when the environment variable is not explicitly set.
3. WHEN `USE_LOCAL_MODEL` is set to `false` or not set, THE System SHALL route `llmChat()` calls to the Groq LLM API using `llama-3.3-70b-versatile` as the fallback.
4. WHEN an `llmChat()` call is attempted and Ollama is unavailable (connection refused or HTTP error response), THE System SHALL fall back to the Groq LLM for that request and log a warning to the console.
5. THE System SHALL NOT replace the Groq Whisper transcription endpoint (`/api/transcribe`) with any other service; the `GROQ_API_KEY` remains required for transcription.
6. THE System SHALL NOT alter the four-step correction pipeline structure (pre-processing, grammar correction, coherence check, context confirmation).

---

### Requirement 2: Synthetic Dataset Expansion

**User Story:** As a WisperFlow developer, I want the `STAMMERER_DATASET` expanded to at least 2,000 entries, so that the accuracy benchmark covers a broad and statistically meaningful range of Hindi/Hinglish stammer and distortion patterns.

#### Acceptance Criteria

1. THE System SHALL include a dataset generator script that produces synthetic `STAMMERER_DATASET` entries programmatically using MIT-compatible generation logic with no external data dependencies.
2. WHEN the dataset generator is run, THE System SHALL produce entries that cover all of the following language variants: Hindi (Devanagari script) and Hinglish (Romanized Hindi).
3. WHEN the dataset generator is run, THE System SHALL produce entries that cover all of the following stammer pattern types: syllable repetitions (e.g., `मु-मु-मुझे`), word-onset repetitions, and vowel prolongations.
4. WHEN the dataset generator is run, THE System SHALL produce entries that cover all of the following categories: needs, health, school, family, weather, feelings, daily, and complex.
5. WHEN the dataset generator is run, THE System SHALL produce entries that include multi-word sentences of eight or more words.
6. WHEN the dataset generator is run, THE System SHALL produce entries that combine stammer patterns with Whisper-specific distortion errors (e.g., `बालिच` for बारिश, `तपले` for कपड़े).
7. THE Generator SHALL assign IDs starting at 6000 to all new entries so that no ID collides with existing IDs in the range 5001–5410.
8. EACH generated entry SHALL conform to the schema `{ id: number, input: string, expected: string, lang: 'hindi' | 'hinglish', category: string }`.
9. WHEN the expanded dataset is merged into `server/testDataset.js`, THE STAMMERER_DATASET SHALL contain at least 2,000 entries total; compliance with this threshold requires the merge to have completed successfully.

---

### Requirement 3: Accuracy Benchmark Script

**User Story:** As a WisperFlow developer, I want a standalone benchmark script that measures correction accuracy across the full `STAMMERER_DATASET`, so that I can compare model performance objectively before committing to a swap.

#### Acceptance Criteria

1. THE Benchmark_Script SHALL accept a `--model` command-line argument with valid values `groq` and `ollama`; IF an unrecognized value is provided, THE Benchmark_Script SHALL exit without processing any entries.
2. WHEN `--model=groq` is provided, THE Benchmark_Script SHALL run the correction pipeline using the Groq LLM for all entries.
3. WHEN `--model=ollama` is provided, THE Benchmark_Script SHALL run the correction pipeline using Ollama (Phi-4-mini) for all entries.
4. THE Benchmark_Script SHALL run the full correction pipeline (all four steps) on every entry in `STAMMERER_DATASET` and score each result using `scoreWordAlignment()` from `server/wordAlign.js`.
5. THE Benchmark_Script SHALL compute and output per-category accuracy (average score per `category` value) and overall accuracy (average score across all entries).
6. THE Benchmark_Script SHALL output the total number of entries tested.
7. THE Benchmark_Script SHALL save results to a JSON file in `Benchmark_Results_Dir` with a filename that includes a timestamp (e.g., `benchmark_groq_2024-01-15T10-30-00.json`).
8. THE saved JSON file SHALL include: `model` (string), `timestamp` (ISO 8601 string), `totalEntries` (number), `overallAccuracy` (number 0–100), `categoryAccuracy` (object mapping category name to accuracy number), and `entries` (array of per-entry results with `id`, `input`, `expected`, `corrected`, and `score`).
9. IF `Benchmark_Results_Dir` does not exist when the script runs, THE Benchmark_Script SHALL create it before writing the output file.
10. THE Benchmark_Script SHALL be executable as a standalone Node.js script without starting the Express server.

---

### Requirement 4: Accuracy Comparison Script

**User Story:** As a WisperFlow developer, I want a comparison script that reads two benchmark result files and reports whether the new model meets the accuracy threshold, so that I can make an informed decision before committing the swap.

#### Acceptance Criteria

1. THE Comparison_Script SHALL accept two positional command-line arguments: the file path to the baseline benchmark result JSON and the file path to the new model benchmark result JSON.
2. WHEN both files are provided and valid, THE Comparison_Script SHALL report per-category pass/fail (new model accuracy ≥ baseline accuracy for each category) to standard output.
3. THE Comparison_Script SHALL report the overall accuracy difference (new model overall accuracy minus baseline overall accuracy) to standard output.
4. WHEN the new model's overall accuracy is greater than or equal to the baseline overall accuracy, THE Comparison_Script SHALL print the recommendation `SWAP APPROVED` to standard output.
5. WHEN the new model's overall accuracy is less than the baseline overall accuracy, THE Comparison_Script SHALL print the recommendation `KEEP GROQ` to standard output.
6. IF either file path argument is missing or the file cannot be read, THE Comparison_Script SHALL print a descriptive error message to standard error and exit with a non-zero exit code; IF writing the error message itself fails, THE Comparison_Script SHALL still ensure a non-zero exit code is set.
7. THE Comparison_Script SHALL NOT perform any git operations; the decision to commit is left to the developer.
8. THE Comparison_Script SHALL be executable as a standalone Node.js script without starting the Express server.

---

### Requirement 5: Environment Variable Defaults Update

**User Story:** As a WisperFlow developer, I want `.env.example` to document the updated environment variables for Phi-4-mini, so that new contributors can configure the local LLM correctly without reading source code.

#### Acceptance Criteria

1. THE System SHALL update `.env.example` to document `USE_LOCAL_MODEL=true` with a comment explaining that setting it to `true` routes correction passes to Phi-4-mini via Ollama.
2. THE System SHALL update `.env.example` to document `OLLAMA_URL=http://localhost:11434` as the default Ollama server URL.
3. THE System SHALL update `.env.example` to set the example value of `OLLAMA_MODEL` to `phi4-mini`, replacing the previous example value of `llama3.1:8b`.
4. THE System SHALL retain the `GROQ_API_KEY` entry in `.env.example` with a comment clarifying that it remains required for Whisper transcription even when `USE_LOCAL_MODEL=true`.
5. THE System SHALL NOT remove any existing documented environment variables from `.env.example`.

---

### Requirement 6: README Documentation

**User Story:** As a WisperFlow contributor, I want the README to include a section explaining how to set up and use Phi-4-mini locally, so that I can run the application and benchmark without needing to trace through source files.

#### Acceptance Criteria

1. THE System SHALL add a dedicated section to `README.md` that documents the command to install Ollama and pull Phi-4-mini: `ollama pull phi4-mini`.
2. THE System SHALL document in `README.md` the command to run the Groq baseline benchmark and the command to run the Ollama benchmark, using the `--model` flag of `Benchmark_Script`.
3. THE System SHALL document in `README.md` the command to run the Comparison_Script with two result files and how to interpret the `SWAP APPROVED` / `KEEP GROQ` output.
4. THE System SHALL state in `README.md` that Microsoft Phi-4-mini is released under the MIT license.
5. THE System SHALL NOT remove or overwrite any existing sections of `README.md`; the new section SHALL be appended or inserted without altering existing content.
