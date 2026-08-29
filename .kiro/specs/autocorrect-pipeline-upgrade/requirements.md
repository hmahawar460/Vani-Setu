# Requirements Document

## Autocorrect Pipeline Upgrade

## Introduction

WisperFlow assists people with speech impairments by converting garbled speech (stammer patterns, Whisper mis-transcriptions, Hinglish) into clean Hindi/Devanagari text. This upgrade adds ML-powered spell and grammar correction layers, restructures the correction pipeline into a formal 4-step flow, adds a dedicated Hinglish pipeline, expands the test dataset, and migrates deployment to a platform that can run Python ML models.

---

## Requirements

### 1. Spello Spell Correction Layer

**User Story**: As a WisperFlow user, I want my typos and spelling mistakes fixed before grammar correction, so that the grammar model receives clean input and produces more accurate results.

#### Acceptance Criteria

1.1 When text is submitted for correction, the system SHALL call the Spello spell corrector (via the Python sidecar's `/spell-correct` endpoint) as the first correction step, before any grammar model is invoked.

1.2 The spell correction step SHALL run on the pre-processed text (after `macroPreProcess()` — Hinglish transliteration, stammer cleanup, phonetic rules, DB corrections).

1.3 When the Spello sidecar is unavailable or times out (> 5 seconds), the system SHALL continue the pipeline using the pre-processed text unchanged, without returning an error to the user.

1.4 The Spello endpoint SHALL accept an optional `lang` parameter (`'hindi'`, `'hinglish'`, `'english'`) to guide correction.

---

### 2. Grammar Correction Layer (Language-Routing)

**User Story**: As a WisperFlow user communicating in Hindi or English, I want the system to apply the correct grammar model for my language, so that corrections are linguistically accurate.

#### Acceptance Criteria

2.1 After spell correction, the system SHALL detect whether the text is primarily Hindi (Devanagari) or English using a language detection function that checks the ratio of Devanagari characters (Unicode U+0900–U+097F) to total alphabetic characters.

2.2 The language detection function SHALL classify text as `'hindi'` when more than 40% of alphabetic characters are Devanagari, and `'english'` otherwise.

2.3 When the detected language is `'hindi'`, the system SHALL call the `GEC-mT5-Small-Hindi` model (HuggingFace: `iAmRohitRaj/gec-mt5-small-hindi`) via the Python sidecar's `/grammar-hindi` endpoint.

2.4 When the detected language is `'english'`, the system SHALL call the `GrammarCorrectionTransformer` model via the Python sidecar's `/grammar-english` endpoint.

2.5 When a grammar correction sidecar endpoint is unavailable or times out (> 5 seconds), the system SHALL continue with the spell-corrected text unchanged, without returning an error to the user.

2.6 The grammar-corrected text SHALL be passed to the existing `runLLMCorrection()` function as the `preProcessed` argument, so the LLM receives grammar-fixed input.

---

### 3. Dedicated Hinglish Pipeline (hindiwsd)

**User Story**: As a WisperFlow user who communicates in Romanized Hindi (Hinglish), I want the system to understand my Romanized words by spelling-correcting, transliterating, and disambiguating them, so that my Hinglish text is accurately converted to Devanagari.

#### Acceptance Criteria

3.1 When the spell-corrected text still contains Romanized Hindi tokens (Latin script), the system SHALL call the Python sidecar's `/hinglish-pipeline` endpoint.

3.2 The `/hinglish-pipeline` endpoint SHALL execute these four stages in order:
  a. Spell correction of Romanized Hindi using Spello
  b. Transliteration from Romanized Hindi to Devanagari script using the `hindiwsd` package
  c. POS (Part-of-Speech) tagging of the Devanagari output
  d. Word Sense Disambiguation (WSD) of the Devanagari output using context

3.3 The pipeline SHALL return the transliterated Devanagari text, POS tags, WSD tags, and a confidence score.

3.4 When `hindiwsd` raises an exception during transliteration, the sidecar SHALL catch the error and return the original input text with `confidence: 0.0`, so the Node.js pipeline can continue.

3.5 The Devanagari output from the Hinglish pipeline SHALL replace the Romanized text for all subsequent pipeline steps (grammar correction, LLM, coherence check).

---

### 4. Upgraded 4-Step Macro Correction Pipeline

**User Story**: As a WisperFlow user, I want my spoken text corrected in a structured, context-aware sequence — first fixing typos, then grammar, then ensuring all words cohere, then verifying the answer fits the question — so that the final output is both grammatically correct and contextually appropriate.

#### Acceptance Criteria

4.1 The `runCorrectionPipeline()` function SHALL execute exactly these four steps in order, after `macroPreProcess()` and before `macroPostProcess()`:
  1. **Analyzer (Context-Aware)**: Spell correction (Spello) → Hinglish pipeline (if Romanized) → `alignWithContext()` (if test mode or scenario present)
  2. **Grammar Corrector**: Language detection → GEC model (Hindi or English) → `runLLMCorrection()`
  3. **Coherence Check**: `runParagraphSenseCheck()` — verify all words together make sense; re-think output using prev/next word context if not
  4. **Final Context Confirmation**: `runContextConfirmation()` — re-check output aligns with the stranger's question/scenario

4.2 Step 1 (Analyzer) SHALL consider context from BOTH: previously entered words in test mode AND the main text box scenario context (`scenarioContext` parameter), providing this combined context to `alignWithContext()`.

4.3 Step 4 (Context Confirmation) SHALL only be executed when `scenarioContext` is non-null and non-empty; it SHALL be skipped (passing Step 3 output directly to `macroPostProcess()`) when no scenario context exists.

4.4 If any individual step fails (exception or sidecar timeout), the pipeline SHALL continue with the previous step's output rather than aborting, so the user always receives a result.

4.5 The word-count constraint SHALL remain enforced: output word count ≤ `max(ceil(inputWords × 1.2), inputWords + 4)`.

4.6 `macroPreProcess()` and `macroPostProcess()` functions SHALL remain unchanged in their internal logic.

---

### 5. Stammerer Dataset Expansion

**User Story**: As a WisperFlow developer, I want the test dataset to include more realistic stammerer speech patterns, so that accuracy measurements reflect real-world usage and pipeline improvements are validated correctly.

#### Acceptance Criteria

5.1 The `STAMMERER_DATASET` in `server/testDataset.js` SHALL be expanded with at least 20 new entries.

5.2 New entries SHALL cover at least these categories:
  - Multi-sentence Hindi stammer patterns (sentences with 8+ words)
  - Hinglish stammer patterns where Whisper produces distortions alongside stammer repetitions
  - Edge cases involving multiple simultaneous error types (stammer + Whisper distortion + phonetic confusion)

5.3 Each new entry SHALL conform to the existing schema: `{ id: number, input: string, expected: string, lang: 'hindi' | 'hinglish', category: string }`.

5.4 New entry IDs SHALL start at `5300` to avoid collision with existing IDs (`5001`–`5205`).

5.5 The `lang` field of each new entry SHALL accurately reflect the script of the `input` field (`'hindi'` for Devanagari input, `'hinglish'` for Romanized input).

---

### 6. Model Accuracy Validation via Existing Endpoint

**User Story**: As a WisperFlow developer, I want to verify the pipeline upgrade improves accuracy on real stammerer data, so that I can confirm the changes are beneficial before releasing.

#### Acceptance Criteria

6.1 The existing `POST /api/test/accuracy` endpoint SHALL continue to work without modification to its request/response interface after the pipeline upgrade.

6.2 After the upgrade, calling `POST /api/test/accuracy` SHALL run all entries in `STAMMERER_DATASET` (including new entries from Requirement 5) through the full upgraded pipeline.

6.3 The accuracy response SHALL include per-dataset results for `stammerer_hindi`, `stammerer_hinglish`, and `sentences_hindi` as it does currently.

6.4 The system SHALL log pipeline step outputs at each of the 4 macro steps (with `console.log` prefixed by step name, e.g., `[step1-analyzer]`, `[step2-grammar]`, `[step3-coherence]`, `[step4-confirm]`) to facilitate debugging of accuracy issues.

---

### 7. Python FastAPI Sidecar Service

**User Story**: As a WisperFlow developer, I want the Python ML models hosted in a dedicated FastAPI service that the Node.js server calls over HTTP, so that Python dependencies are isolated from the Node.js application and models are loaded once at startup.

#### Acceptance Criteria

7.1 A Python FastAPI sidecar SHALL be created at `ml_sidecar/main.py` that exposes these endpoints:
  - `GET /health` — returns `{ok: true, models: [list of loaded model names]}`
  - `POST /spell-correct` — Spello spell correction
  - `POST /grammar-hindi` — GEC-mT5-Small-Hindi grammar correction
  - `POST /grammar-english` — GrammarCorrectionTransformer grammar correction
  - `POST /hinglish-pipeline` — full hindiwsd pipeline (spell → transliterate → POS → WSD)

7.2 All ML models (Spello, GEC-mT5-Small-Hindi, GrammarCorrectionTransformer, hindiwsd) SHALL be loaded into memory once during sidecar startup (using FastAPI lifespan events), not per request.

7.3 The sidecar SHALL return HTTP 200 with a graceful fallback response (input text unchanged) when a model raises an exception during inference, rather than returning HTTP 5xx.

7.4 A `ml_sidecar/requirements.txt` file SHALL be provided listing all Python dependencies with pinned major versions.

7.5 A `server/nlpClient.js` module SHALL be created that encapsulates all HTTP calls to the sidecar, with configurable timeout (default 5 s) and graceful degradation (returns input text on failure).

7.6 The sidecar base URL SHALL be configurable via the `ML_SIDECAR_URL` environment variable (default: `http://localhost:8000`).

---

### 8. Deployment Platform Migration

**User Story**: As a WisperFlow operator, I want the application deployed on a platform that supports Python ML models, has a free/trial tier, can handle ~100 concurrent users, and provides a stable public URL under the "wisper-flow" project name.

#### Acceptance Criteria

8.1 The application SHALL be deployable on Railway.app or Render.com (either platform is acceptable).

8.2 The deployment SHALL consist of two services:
  - A Node.js service serving the Express backend and built React frontend (project name: `wisper-flow`)
  - A Python service running the FastAPI ML sidecar

8.3 The Python sidecar service SHALL NOT be exposed to the public internet; it SHALL only be reachable from the Node.js service via an internal network address.

8.4 The public URL for the deployed application SHALL include "wisper-flow" in the subdomain (e.g., `https://vani-setu.railway.app` or `https://vani-setu.onrender.com`).

8.5 A `README.md` section SHALL document the deployment steps for both Railway.app and Render.com, including environment variable setup (`GROQ_API_KEY`, `ML_SIDECAR_URL`).

8.6 The existing `api/index.js` Vercel wrapper and `vercel.json` SHALL be kept in the repository but marked as legacy in comments, for reference only.

8.7 The deployment platform SHALL support at least 512 MB RAM per service to accommodate the ML models (mT5-small fits in ~256 MB; Spello + hindiwsd add ~100 MB).

8.8 Input to ML model endpoints SHALL be limited to 2000 characters maximum to prevent memory/DoS issues; inputs exceeding this limit SHALL be truncated before passing to the model.


---

## Glossary

| Term | Definition |
|------|------------|
| **Spello** | A Python spell-correction library available on PyPI that supports Hindi and Hinglish text |
| **GEC-mT5-Small-Hindi** | HuggingFace model (`iAmRohitRaj/gec-mt5-small-hindi`) for Hindi grammatical error correction, based on mT5-small |
| **GrammarCorrectionTransformer** | HuggingFace transformer model for English grammatical error correction |
| **hindiwsd** | A PyPI package providing Hinglish spell correction, Romanized→Devanagari transliteration, POS tagging, and Word Sense Disambiguation |
| **Hinglish** | Romanized Hindi — Hindi written using Latin/ASCII characters (e.g., "mujhe paani chahiye") |
| **Devanagari** | The script used for standard Hindi writing (Unicode range U+0900–U+097F) |
| **Python Sidecar** | A separate FastAPI/Python microservice co-deployed alongside the Node.js server to host ML models |
| **NLP Client** | A Node.js HTTP wrapper (`server/nlpClient.js`) that calls the Python sidecar with timeout and graceful degradation |
| **Macro Pipeline** | The high-level orchestration function `runCorrectionPipeline()` in `server/index.js` that chains all correction steps |
| **WSD** | Word Sense Disambiguation — determining the correct meaning of a word given its context |
| **POS Tagging** | Part-of-Speech tagging — labelling words as noun, verb, adjective, etc. |
| **STAMMERER_DATASET** | The test dataset in `server/testDataset.js` containing realistic stammer speech patterns with expected cleaned outputs |
| **Graceful Degradation** | The property that if the sidecar is unavailable, the pipeline returns a usable result using existing (non-ML) corrections rather than an error |
