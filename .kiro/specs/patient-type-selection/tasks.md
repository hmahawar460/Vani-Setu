# Implementation Plan: Patient Type Selection

## Overview

Add patient-type selection (Stammerer / Dyslalia) to WisperFlow. The feature gates the main UI behind a full-screen selection screen on first launch, propagates the choice via React context, threads `patientType` through the correction pipeline, enforces mode-specific word-limit policies, conditionally applies disfluency pre-processing, uses patient-type-aware LLM prompts, removes Groq from the correction path, extends the ML sidecar with a dyslalia phoneme-correction endpoint, adds a DYSLALIA_DATASET to the test suite, cleans up dev artefacts, and adds property-based tests for the two core invariants.

## Tasks

- [ ] 1. Create shared type definitions and config constants
  - Create `src/types/patientType.ts` with `PatientType = 'stammerer' | 'dyslalia'`, `PATIENT_TYPE_STORAGE_KEY`, `PatientTypeConfig` interface, and `PATIENT_TYPE_CONFIGS` record
  - Export all symbols so they can be imported by components, context, and services
  - _Requirements: 1.1, 1.3, 1.5, 2.1, 4.1, 5.1_

- [ ] 2. Build the PatientTypeScreen component
  - [ ] 2.1 Implement `src/components/PatientTypeScreen.tsx`
    - Accept `onSelect: (type: PatientType) => void` prop
    - Render two selectable cards (Stammerer / Dyslalia) with condition name, icon, and brief description
    - On card activation: try `localStorage.setItem(PATIENT_TYPE_STORAGE_KEY, type)`, catch errors silently, always call `onSelect(type)` — satisfying Requirements 1.3 and 1.4
    - All cards reachable via Tab, activatable via Enter/Space, each with `aria-label` — satisfying Requirement 1.6
    - _Requirements: 1.2, 1.3, 1.4, 1.6_

  - [ ] 2.2 Create `src/components/PatientTypeScreen.css`
    - Full-screen modal overlay styles
    - Card layout with hover/focus states
    - _Requirements: 1.2_

- [ ] 3. Create PatientTypeContext
  - Create `src/context/PatientTypeContext.tsx` with `PatientTypeContextValue` interface (`patientType: PatientType`, `setPatientType: (type: PatientType) => void`)
  - Export `PatientTypeContext` and a `usePatientType` convenience hook
  - `setPatientType` must ignore calls with values that are not `'stammerer'` or `'dyslalia'` (Requirement 2.4)
  - _Requirements: 2.1, 2.2, 2.4_

- [ ] 4. Update App.tsx — patient type state, gate main UI, localStorage fallback with toast
  - Read `wisperflow_patient_type` from `localStorage` on mount; skip PatientTypeScreen when value is `'stammerer'` or `'dyslalia'` (Requirement 1.5); render PatientTypeScreen and block main UI otherwise (Requirement 1.1)
  - Implement `handlePatientTypeSelect` that tries `localStorage.setItem`, catches exceptions, shows a non-blocking toast auto-dismissing in 5 seconds on error (Requirements 1.4, 11.1, 11.2), and always calls `setPatientType`
  - Wrap the main application UI in `<PatientTypeContext.Provider value={{ patientType, setPatientType: handleSetPatientType }}>` (Requirement 2.1)
  - Persist on `setPatientType` calls from context consumers (Requirement 2.3)
  - Render `<SettingsFAB>` inside the main UI wrapper (Requirement 3.1)
  - _Requirements: 1.1, 1.4, 1.5, 2.1, 2.3, 11.1, 11.2_

- [ ] 5. Create SettingsFAB component
  - Create `src/components/SettingsFAB.tsx` accepting `currentType: PatientType` and `onTypeChange: (type: PatientType) => void`
  - Display an icon/label reflecting the current patient type (Requirement 3.4)
  - On click, show an inline picker listing the two patient types (Requirement 3.2)
  - On picker selection: call `onTypeChange(newType)` and update `localStorage` (Requirement 3.3)
  - Include `aria-label` and keyboard accessibility
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 6. Forward patientType from frontend service to backend
  - In `src/services/hindiCorrect.ts`, add `patientType: PatientType` parameter to `correctHindi` signature
  - Include `patientType` in the JSON body sent to `POST /api/correct`
  - Update all call sites in `App.tsx` to pass the current `patientType` from context
  - _Requirements: 3.5 (in-flight uses submission-time value via closure)_

- [ ] 7. Update `server/index.js` — accept patientType, validate allowlist, update /api/health
  - In `POST /api/correct` handler: destructure `patientType` from `req.body`; if not `'stammerer'` or `'dyslalia'` (or missing), default to `'stammerer'` (Requirements 9.1, 9.2); forward validated value to `runCorrectionPipeline` as the new sixth argument (Requirement 9.3)
  - In `GET /api/health` handler: add `patientTypeSupported: true` to the JSON response (Requirement 12.1)
  - _Requirements: 9.1, 9.2, 9.3, 12.1_

- [ ] 8. Update `server/pipeline.js` — thread patientType, update enforceWordLimit, macroPreProcess, LLM prompts, remove Groq fallback
  - [ ] 8.1 Add `patientType = 'stammerer'` parameter to `runCorrectionPipeline` signature and thread it to `macroPreProcess`, `enforceWordLimit`, and `runLLMCorrection`
    - _Requirements: 4.1, 5.1, 6.1, 7.1_

  - [ ] 8.2 Rewrite `enforceWordLimit(input, output, patientType)` with patient-type-aware bounds
    - Stammerer: `minWords = floor(N×0.70)`, `maxWords = N` — trim to `maxWords` if over, log warning if under (Requirements 4.1–4.5)
    - Dyslalia: `minWords = floor(N×0.95)`, `maxWords = ceil(N×1.05)` — trim to `maxWords` if over, log warning if under (Requirements 5.1–5.5)
    - Return output unchanged when word count is already within bounds (Requirements 4.3, 5.3)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 8.3 Write property test for enforceWordLimit (stammerer bounds)
    - **Property 1: Stammerer Word-Limit Bounds** — for any non-empty input/output strings, `enforceWordLimit(input, output, 'stammerer')` result word count ≤ `countWords(input)`
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

  - [ ]* 8.4 Write property test for enforceWordLimit (dyslalia bounds)
    - **Property 2: Dyslalia Word-Limit Bounds** — for any non-empty input/output strings, result word count ∈ `[floor(N×0.95), ceil(N×1.05)]`
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

  - [ ] 8.5 Rewrite `macroPreProcess` to accept `patientType` and gate repetition-cleanup on `patientType === 'stammerer'`
    - Apply syllable-repetition regex and vowel-mark collapse only when `patientType = 'stammerer'` (Requirements 6.1, 6.2)
    - Skip both patterns entirely when `patientType = 'dyslalia'` (Requirement 6.3)
    - Default to dyslalia behaviour (skip) for null/undefined/unrecognised values (Requirement 6.4)
    - Always apply transliteration, DB corrections, pronunciation profile, phonetic rules (Requirement 6.5)
    - Update `macroPostProcess` analogously — apply repetition cleanup only when `patientType = 'stammerer'`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 8.6 Build `buildLLMSystemPrompt(patientType, inputWordCount, minWords, maxOutputWords, hints)` and update `runLLMCorrection` to use it
    - Stammerer prompt: include "दोहराव हटाओ" instruction and numeric word-count bounds (Requirements 7.1, 7.3)
    - Dyslalia prompt: include "ध्वनि-प्रतिस्थापन ठीक करो" and explicit no-add/no-remove instruction and bounds (Requirements 7.2, 7.3)
    - Default to stammerer prompt for null/unrecognised `patientType` with a `console.warn` (Requirement 7.4)
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 8.7 Remove Groq fallback from `llmChat` in the correction path
    - Rewrite `llmChat` to call only `ollamaChat`; if Ollama throws, rethrow without retrying via Groq (Requirement 8.1)
    - In `runCorrectionPipeline` step 2, catch the Ollama error and return step 1 output instead of propagating (Requirement 8.2)
    - Keep `groqFetch` and `groqChat` functions in `pipeline.js` only if needed elsewhere; they must not be called from `llmChat` (Requirement 8.1)
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 9. Checkpoint — pipeline is wired end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Create `ml_sidecar/dyslalia_patterns.py`
  - Define `DYSLALIA_SUBSTITUTIONS` dict covering all required Hindi pairs (`र→ल`, `श→स`, `क→त`, `ड→ल`, `व→ब`, `ग→ड`, `च→त`, `झ→ज`, `फ→प`, `ध→द`) and English pairs (`r→w`, `s→th`, `l→y`, `f→p`, `v→b`) as specified in Requirement 10.6
  - Define `DYSLALIA_TRAINING_DATASET` list of training pairs (at least 8 entries, 5+ distinct Hindi patterns) for sidecar use
  - _Requirements: 10.6_

- [ ] 11. Update `ml_sidecar/main.py` — add POST /dyslalia-correct endpoint
  - Add `DyslalyaCorrectIn` and `DyslalyaCorrectOut` Pydantic models
  - Implement `POST /dyslalia-correct`: truncate input to 2000 chars (Requirement 10.4); default invalid `lang` to `'hi'` (Requirement 10.7); apply patterns in definition order (Requirement 10.8); return `{corrected, patterns_applied, changed}` (Requirement 10.2); on empty input or exception, return input unchanged with `changed=false` (Requirement 10.5)
  - Ensure word count of `corrected` equals word count of input (Property 9 / Requirement 10.3)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

  - [ ]* 11.1 Write property test for dyslalia word-count invariant
    - **Property 9: Dyslalia Endpoint Preserves Word Count** — for any list of 1–20 non-empty word strings, joining them as input and calling `dyslalyaCorrect(text, 'hi')` must return `corrected` with the same word count
    - **Validates: Requirements 10.3**

- [ ] 12. Add DYSLALIA_DATASET to `server/testDataset.js` and update accuracy endpoint
  - [ ] 12.1 Add `DYSLALIA_DATASET` export to `server/testDataset.js`
    - At least 8 entries with `{ input, expected, lang, category, patientType: 'dyslalia' }` structure
    - Cover at minimum 5 distinct Hindi phoneme patterns: `र→ल`, `श→स`, `क→त`, `व→ब`, `ग→ड` (Requirement 14.2)
    - _Requirements: 14.2_

  - [ ] 12.2 Update `POST /api/test/accuracy` in `server/index.js`
    - Import `DYSLALIA_DATASET` alongside `STAMMERER_DATASET`
    - Iterate both datasets, passing `patientType` from each entry to `runCorrectionPipeline`
    - Report combined mean `scoreWordAlignment` (Requirement 14.1, 14.3)
    - _Requirements: 14.1, 14.2, 14.3_

- [ ] 13. Delete dev artefacts
  - Delete `server/benchmark.js`, `server/benchmarkSample.js`, `server/compareAccuracy.js`, `server/generateDataset.js` (Requirement 13.1)
  - Delete root-level files: `body.json`, `response.txt`, `response2.txt`, `result.json`, `corrections.json` (Requirement 13.2)
  - Delete `benchmark_results/` directory and its contents (Requirement 13.3)
  - Verify no remaining `import`/`require` of deleted files exists in any source file (Requirement 13.4)
  - Update `.gitignore` with entries: `benchmark_results/`, `body.json`, `response.txt`, `response2.txt`, `result.json`, `corrections.json` (Requirement 13.5)
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 14. Install fast-check and write property-based tests
  - Install `fast-check` as a dev dependency (`npm install --save-dev fast-check`)
  - Create a test file (e.g. `server/pipeline.test.js` or equivalent) that imports `enforceWordLimit` and `countWords` from `pipeline.js`
  - Implement the three property tests from the design:
    - Stammerer upper bound: `countWords(result) <= countWords(input)` for all non-empty inputs (Property 1)
    - Dyslalia bounds: `countWords(result) >= floor(N×0.95) && countWords(result) <= ceil(N×1.05)` (Property 2)
    - Dyslalia word-count preservation for `dyslalyaCorrect` (Property 9 — import the Python logic via a JS port or test the sidecar helper directly)
  - _Requirements: 4.1, 4.2, 5.1, 5.2, 10.3_

- [ ] 15. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP build
- Each task references specific requirements for full traceability
- Tasks 8.3 / 8.4 depend on task 8.2 (enforceWordLimit must exist before properties can be tested)
- Task 11.1 depends on task 11 (dyslalia endpoint must exist before property test can be written)
- The Groq fallback removal (8.7) is a breaking change in developer workflow — Ollama must be running locally for the correction path to function
- Property tests in task 14 use `fast-check` which requires task 14's installation step first
- Task 13 (deleting artefacts) is safe to do at any point and has no ordering dependency on other tasks

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "10"] },
    { "id": 1, "tasks": ["2.1", "2.2", "3", "8.1", "12.1"] },
    { "id": 2, "tasks": ["4", "5", "6", "7", "8.2", "8.5"] },
    { "id": 3, "tasks": ["8.3", "8.4", "8.6", "11"] },
    { "id": 4, "tasks": ["8.7", "11.1", "12.2"] },
    { "id": 5, "tasks": ["13", "14"] }
  ]
}
```
