# Implementation Plan: Autocorrect Pipeline Upgrade

## Overview

This plan implements the autocorrect pipeline upgrade for WisperFlow. The work is structured in 7 groups: building the Python ML sidecar, creating the Node.js NLP client, adding language detection helpers, upgrading the 4-step macro pipeline, expanding the stammerer dataset, updating the health endpoint, and adding deployment configuration. Tasks 1 and 2 can be worked in parallel. Task 3 must be done before Task 4. Task 5 is independent. Tasks 6 and 7 come last.

## Tasks

- [x] 1. Create `ml_sidecar/` directory and `ml_sidecar/main.py` with FastAPI app skeleton, lifespan startup (model loading hooks), and `GET /health` endpoint returning `{ok: true, models: [...]}`.
- [x] 1.1 Implement `POST /spell-correct` endpoint: accept `{text, lang?}`, run Spello correction, return `{corrected, changed}`. On exception return input unchanged with HTTP 200.
- [x] 1.2 Implement `POST /grammar-hindi` endpoint: load `iAmRohitRaj/gec-mt5-small-hindi` via HuggingFace `transformers` at startup, run inference, return `{corrected}`. On exception return input unchanged.
- [x] 1.3 Implement `POST /grammar-english` endpoint: load `GrammarCorrectionTransformer` at startup, run inference, return `{corrected}`. On exception return input unchanged.
- [x] 1.4 Implement `POST /hinglish-pipeline` endpoint: chain Spello spell correction → `hindiwsd` transliteration → POS tagging → WSD. Return `{spell_corrected, devanagari, pos, wsd, confidence}`. On any exception return input text with `confidence: 0.0`.
- [x] 1.5 Add 2000-character input truncation guard to all four model endpoints before passing text to the model.
- [x] 1.6 Create `ml_sidecar/requirements.txt` with pinned versions: `fastapi==0.111.0`, `uvicorn[standard]==0.29.0`, `spello==0.1.0`, `transformers==4.41.0`, `torch==2.3.0`, `sentencepiece==0.2.0`, `hindiwsd==0.1.0`, `pydantic==2.7.0`.
- [x] 2. Create `server/nlpClient.js` module with configurable `baseUrl` (from `ML_SIDECAR_URL` env var, default `http://localhost:8000`) and `timeoutMs` (default 5000 ms).
- [x] 2.1 Implement `spellCorrect(text, lang?)`: POST to `/spell-correct`, return `corrected` string, or `text` unchanged on timeout / network error.
- [x] 2.2 Implement `grammarCorrectHindi(text)`: POST to `/grammar-hindi`, return `corrected` or `text` on failure.
- [x] 2.3 Implement `grammarCorrectEnglish(text)`: POST to `/grammar-english`, return `corrected` or `text` on failure.
- [x] 2.4 Implement `hinglishPipeline(text)`: POST to `/hinglish-pipeline`, return full response object or graceful fallback `{devanagari: text, pos: [], wsd: [], confidence: 0}` on failure.
- [x] 2.5 Implement `isSidecarAvailable()`: GET `/health`, cache boolean result for 30 s to avoid per-request health checks. Return `false` on any error.
- [x] 2.6 Add `console.warn('[nlp-client] ...')` logging on every timeout or network error in nlpClient.js.
- [x] 3. Add `detectLanguage(text)` function in `server/index.js`: count Devanagari codepoints (U+0900–U+097F) vs total alphabetic characters; return `'hindi'` if ratio > 0.40, else `'english'`.
- [x] 3.1 Add `isRomanizedHindi(text)` helper in `server/index.js`: return `true` when text contains more than 2 Latin-script words and no Devanagari characters.
- [x] 4. Import `nlpClient.js` functions into `server/index.js` and replace the current `runCorrectionPipeline()` body with the 4-step sequence (keeping `macroPreProcess()` before Step 1 and `macroPostProcess()` after Step 4 unchanged).
- [x] 4.1 Implement Step 1 (Analyzer): call `spellCorrect()` on pre-processed text → if `isRomanizedHindi()` call `hinglishPipeline()` and use `.devanagari` output → call `alignWithContext()` if `expectedContext` is non-null.
- [x] 4.2 Implement Step 2 (Grammar Corrector): call `detectLanguage()` on Step 1 output → call `grammarCorrectHindi()` or `grammarCorrectEnglish()` accordingly → call `runLLMCorrection()` with the grammar-corrected text as `preProcessed`.
- [x] 4.3 Implement Step 3 (Coherence Check): call `runParagraphSenseCheck()` on Step 2 LLM output.
- [x] 4.4 Implement Step 4 (Context Confirmation): call `runContextConfirmation()` only when `scenarioContext` is non-null and non-empty; otherwise pass Step 3 output directly to `macroPostProcess()`.
- [x] 4.5 Add `console.log` at the start of each step with prefixes `[step1-analyzer]`, `[step2-grammar]`, `[step3-coherence]`, `[step4-confirm]` showing input and output text.
- [x] 4.6 Wrap each step in its own try/catch block so a step failure logs the error and continues with the previous step's output rather than crashing the pipeline.
- [x] 5. Add 10 new Hindi `STAMMERER_DATASET` entries (IDs 5300–5309) in `server/testDataset.js` covering multi-sentence Hindi stammer patterns, complex phonetic distortions, and combined stammer + Whisper errors.
- [x] 5.1 Add 10 new Hinglish `STAMMERER_DATASET` entries (IDs 5401–5410) covering Romanized multi-word stammer with Whisper distortions and mixed Hindi-English stammer patterns.
- [x] 6. Update `GET /api/health` in `server/index.js` to call `isSidecarAvailable()` and include `sidecarAvailable: boolean` in the JSON response alongside existing `ok` and `groqConfigured` fields.
- [x] 7. Create `railway.toml` (or `render.yaml`) at the project root defining two services: the Node.js `wisper-flow` service and the Python `wisper-flow-ml` sidecar service, with the sidecar not exposed publicly.
- [x] 7.1 Add `ML_SIDECAR_URL=http://localhost:8000` to `.env.example`.
- [x] 7.2 Update `README.md` with a "Deployment" section documenting Railway.app and Render.com setup: service creation, environment variables (`GROQ_API_KEY`, `ML_SIDECAR_URL`), internal networking, and cold-start behaviour on free tiers.
- [x] 7.3 Add legacy comments to `api/index.js` and `vercel.json` indicating they are kept for reference but the active deployment is Railway/Render.

## Task Dependency Graph

```json
{
  "waves": [
    {"wave": 1, "tasks": ["1", "1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "2", "2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "3", "3.1", "5", "5.1"]},
    {"wave": 2, "tasks": ["4", "4.1", "4.2", "4.3", "4.4", "4.5", "4.6"]},
    {"wave": 3, "tasks": ["6", "7", "7.1", "7.2", "7.3"]}
  ]
}
```

## Notes

- The Python sidecar models are CPU-only. `torch==2.3.0` without CUDA is ~700 MB installed — verify the deployment platform memory limit (512 MB+ per service required per Requirement 8.7).
- GEC-mT5-Small-Hindi downloads from HuggingFace on first startup. In deployment, either pre-download the model to the Docker image or set `HF_HUB_OFFLINE=0` and allow internet access from the build step.
- `hindiwsd` (PyPI) may have limited documentation. Test it independently before integrating into Task 1.4. If the package API differs from what is described in the design, adjust the sidecar implementation accordingly.
- The existing Node.js test at `POST /api/test/accuracy` will automatically exercise the upgraded pipeline for all `STAMMERER_DATASET` entries, including the new ones from Task 5, once Task 4 is complete.
- Do not modify `macroPreProcess()`, `macroPostProcess()`, `runParagraphSenseCheck()`, or `runContextConfirmation()` internal logic — only the orchestration in `runCorrectionPipeline()` changes.
