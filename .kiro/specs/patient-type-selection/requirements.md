# Requirements Document

## Introduction

WisperFlow currently uses a single correction pipeline optimised for stammering. This feature
adds a **patient-type selection** capability that lets the user or caregiver choose between
**Stammerer** and **Dyslalia** modes before the main UI is shown. The choice drives word-limit
policy, pipeline pre/post-processing, and LLM prompt strategy. The feature also removes Groq
from the correction path, extends the ML sidecar with a dyslalia phoneme-substitution dataset,
and cleans up leftover development artefacts.

## Glossary

- **App**: The WisperFlow React/TypeScript frontend application.
- **Backend**: The WisperFlow Express.js server (`server/index.js` + `server/pipeline.js`).
- **Correction Pipeline**: The `runCorrectionPipeline` function in `server/pipeline.js` that
  preprocesses, spell-checks, grammar-checks, and LLM-corrects transcribed speech.
- **Dyslalia**: A speech disorder characterised by phoneme substitution errors (e.g. "र→ल").
- **Dyslalia_Corrector**: The ML sidecar endpoint `POST /dyslalia-correct` that reverses
  phoneme substitution patterns.
- **localStorage**: The browser's `localStorage` API, keyed with `wisperflow_patient_type`.
- **LLM**: The local Ollama model (`phi4-mini`) used for text correction.
- **ML_Sidecar**: The FastAPI Python service (`ml_sidecar/main.py`) that provides
  spell-correction, grammar-correction, and (new) dyslalia phoneme correction.
- **Ollama**: The local LLM inference server used exclusively for the correction path.
- **PatientType**: The enumerated value `'stammerer' | 'dyslalia'` that controls pipeline behaviour.
- **PatientTypeContext**: The React context that propagates `patientType` to all child components.
- **PatientTypeScreen**: The full-screen modal rendered on first launch when no patient type is
  stored in localStorage.
- **Pipeline**: See Correction Pipeline.
- **SettingsFAB**: The floating action button that lets the user change patient type mid-session.
- **Stammerer**: A speech disorder characterised by syllable repetitions and disfluencies.
- **Word_Limit_Enforcer**: The `enforceWordLimit` function in `server/pipeline.js`.

---

## Requirements

### Requirement 1: Patient Type Selection Screen

**User Story:** As a user or caregiver, I want to choose a patient type on first launch, so that
the app correction pipeline is configured appropriately before I begin a session.

#### Acceptance Criteria

1. WHEN the App loads and `localStorage.getItem('wisperflow_patient_type')` does not return
   `'stammerer'` or `'dyslalia'` (including `null`, empty string, or any other value),
   THE App SHALL render only the PatientTypeScreen and SHALL NOT render the main application UI.

2. WHEN the PatientTypeScreen is displayed, THE PatientTypeScreen SHALL present exactly two
   selectable cards — one for Stammerer mode and one for Dyslalia mode — each showing a condition
   name, an icon, and a brief description.

3. WHEN a user selects a patient type on the PatientTypeScreen, THE PatientTypeScreen SHALL
   attempt to write the selected value (`'stammerer'` or `'dyslalia'`) to `localStorage` under
   the key `wisperflow_patient_type`, then call `onSelect(patientType)` so that the App
   transitions to the main UI — regardless of whether the `localStorage` write succeeded.

4. IF `localStorage.setItem` throws during the selection in criterion 3, THEN THE App SHALL
   catch the exception and call `onSelect(patientType)` using the in-memory value so the session
   continues without interruption.

5. WHEN the App loads and `localStorage.getItem('wisperflow_patient_type')` returns exactly
   `'stammerer'` or `'dyslalia'`, THE App SHALL skip the PatientTypeScreen and render the main
   application UI directly.

6. THE PatientTypeScreen SHALL ensure all interactive elements (the two selectable cards) are
   reachable via the Tab key, activatable via Enter or Space, and each has an `aria-label`
   attribute that identifies the patient type it represents.

---

### Requirement 2: Patient Type Context Propagation

**User Story:** As a developer, I want patient type to be available throughout the component tree,
so that all components can access it without prop-drilling.

#### Acceptance Criteria

1. THE App SHALL wrap the main application UI in a `PatientTypeContext.Provider` supplying the
   current `patientType` value (typed as `'stammerer' | 'dyslalia'`) and a `setPatientType`
   callback — and the Provider SHALL only be rendered when `patientType` is a valid non-null value.

2. WHEN `setPatientType` is called with a `PatientType` value of `'stammerer'` or `'dyslalia'`,
   THE PatientTypeContext SHALL update its internal state to the new value so that all consumers
   receive the updated type on their next render.

3. WHEN `setPatientType` is called with a valid `PatientType` value, THE App SHALL attempt to
   persist the new value to `localStorage` under `wisperflow_patient_type`.

4. WHEN `setPatientType` is called with a value that is not `'stammerer'` or `'dyslalia'`,
   THE PatientTypeContext SHALL ignore the call and leave the current value unchanged.

---

### Requirement 3: SettingsFAB — Mid-Session Patient Type Change

**User Story:** As a user or caregiver, I want to change the patient type at any time during a
session, so that I can switch modes without reloading the app.

#### Acceptance Criteria

1. THE App SHALL render a SettingsFAB that is always visible while the main application UI is
   displayed.

2. WHEN the SettingsFAB is clicked, THE SettingsFAB SHALL display an inline picker (modal or
   popover) listing the available patient types.

3. WHEN a user selects a new patient type via the SettingsFAB picker, THE SettingsFAB SHALL call
   `onTypeChange(newType)` and update `localStorage` with the new value.

4. THE SettingsFAB SHALL display an icon or label reflecting the currently active patient type.

5. WHEN a patient type change is requested while a correction request is in-flight, THE Backend
   SHALL complete the in-flight request using the `patientType` value that was set at request
   submission time.

---

### Requirement 4: Stammerer Word-Limit Policy

**User Story:** As a developer, I want the correction output for stammerer patients to stay within
70–100% of the input word count, so that the pipeline respects typical disfluency-removal behaviour.

#### Acceptance Criteria

1. WHEN the Correction Pipeline runs with `patientType = 'stammerer'`, THE Word_Limit_Enforcer
   SHALL produce output whose word count (whitespace-delimited tokens after trimming) is greater
   than or equal to `floor(countWords(input) × 0.70)`.

2. WHEN the Correction Pipeline runs with `patientType = 'stammerer'`, THE Word_Limit_Enforcer
   SHALL produce output whose word count is less than or equal to `countWords(input)`.

3. IF the corrected output word count is already within the stammerer bounds `[floor(N×0.70), N]`,
   THEN THE Word_Limit_Enforcer SHALL return the output unchanged.

4. IF the corrected output word count exceeds `countWords(input)` (N), THEN THE Word_Limit_Enforcer
   SHALL reduce the output by removing trailing words until exactly N whitespace-delimited tokens
   remain.

5. IF the corrected output word count falls below `floor(countWords(input) × 0.70)`,
   THEN THE Word_Limit_Enforcer SHALL log a warning and return the output as-is, since adding
   words would fabricate content not present in the original input.

---

### Requirement 5: Dyslalia Word-Limit Policy

**User Story:** As a developer, I want the correction output for dyslalia patients to stay within
95–105% of the input word count, so that phoneme substitutions do not add or remove whole words.

#### Acceptance Criteria

1. WHEN the Correction Pipeline runs with `patientType = 'dyslalia'`, THE Word_Limit_Enforcer
   SHALL produce output whose word count (defined as the number of whitespace-split tokens after
   trimming) is greater than or equal to `floor(countWords(input) × 0.95)`.

2. WHEN the Correction Pipeline runs with `patientType = 'dyslalia'`, THE Word_Limit_Enforcer
   SHALL produce output whose word count is less than or equal to `ceil(countWords(input) × 1.05)`.

3. IF the corrected output word count is already within the dyslalia bounds
   `[floor(N×0.95), ceil(N×1.05)]`, THEN THE Word_Limit_Enforcer SHALL return the output unchanged.

4. IF the corrected output word count exceeds `ceil(countWords(input) × 1.05)`,
   THEN THE Word_Limit_Enforcer SHALL remove trailing words until the word count equals
   `ceil(countWords(input) × 1.05)`.

5. IF the corrected output word count falls below `floor(countWords(input) × 0.95)`,
   THEN THE Word_Limit_Enforcer SHALL log a warning and return the output as-is, since adding
   words would fabricate content not present in the original input.

---

### Requirement 6: Stammerer Pre-Processing (Repetition Cleanup)

**User Story:** As a stammerer patient, I want syllable repetitions and disfluencies in my
transcribed speech to be cleaned up, so that the final corrected text reads fluently.

#### Acceptance Criteria

1. IF the Correction Pipeline runs with `patientType = 'stammerer'`, THEN THE Pipeline SHALL
   apply a regex that removes hyphen-delimited syllable repetitions where 1–3 consecutive
   Devanagari characters (U+0900–U+097F) appear before a hyphen and are immediately repeated
   (e.g. `"मु-मुझे" → "मुझे"`) during the pre-processing step.

2. IF the Correction Pipeline runs with `patientType = 'stammerer'`, THEN THE Pipeline SHALL
   apply a regex that collapses 2 or more consecutive identical Devanagari vowel-mark characters
   (U+093E–U+094C) into a single occurrence (e.g. `"पाआनी" → "पानी"`) during the pre-processing
   step.

3. IF the Correction Pipeline runs with `patientType = 'dyslalia'`, THEN THE Pipeline SHALL NOT
   apply the syllable-repetition regex (criterion 1) or the vowel-mark collapse regex (criterion 2)
   during pre-processing; those two patterns SHALL be skipped entirely.

4. IF the Correction Pipeline runs with a null, undefined, or unrecognised `patientType`,
   THEN THE Pipeline SHALL default to dyslalia behaviour (skip repetition removal) for the
   pre-processing step.

5. THE Pipeline SHALL always apply Hinglish transliteration, DB word corrections, pronunciation
   profile rules, and phonetic rules during pre-processing, regardless of patient type.

---

### Requirement 7: LLM Prompt Strategy

**User Story:** As a developer, I want the LLM system prompt to contain patient-type-specific
instructions, so that the model applies the correct correction strategy.

#### Acceptance Criteria

1. WHEN the Correction Pipeline runs with `patientType = 'stammerer'`, THE Pipeline SHALL
   construct an LLM system prompt that contains the phrase "दोहराव हटाओ" (remove repetitions)
   or equivalent instruction directing the model to remove disfluencies.

2. WHEN the Correction Pipeline runs with `patientType = 'dyslalia'`, THE Pipeline SHALL
   construct an LLM system prompt that contains the phrase "ध्वनि-प्रतिस्थापन ठीक करो" (fix
   phoneme substitutions) and an explicit instruction not to add or remove words.

3. WHEN the Correction Pipeline runs with any valid `patientType`, THE Pipeline SHALL include
   the computed integer word-count bounds (minWords and maxWords as integers derived from the
   input word count) in the LLM system prompt.

4. IF the Correction Pipeline runs with a null, undefined, or unrecognised `patientType`,
   THEN THE Pipeline SHALL log a warning and apply the stammerer prompt as the default, to ensure
   the model always receives a valid mode instruction.

---

### Requirement 8: Groq Removal from Correction Path

**User Story:** As a developer, I want Groq to be used only for Whisper STT and never for text
correction, so that the correction path is entirely local and reduces external API dependencies.

#### Acceptance Criteria

1. THE Pipeline SHALL send all LLM correction requests to the Ollama endpoint
   (`OLLAMA_URL/api/chat`) and SHALL NOT send any HTTP request to `api.groq.com` during any
   call to `runCorrectionPipeline`.

2. WHEN Ollama is unavailable (network error, connection refused, or timeout) during a correction
   request, THE Pipeline SHALL catch the error and return the text produced by the most recent
   successfully completed pipeline step (spell/grammar-corrected text), rather than retrying with
   the Groq API.

3. THE Backend SHALL continue to use Groq Whisper v3 for the `POST /api/transcribe` endpoint
   without modification; the `groqFetch` helper in `server/index.js` SHALL remain in place for
   this endpoint only.

---

### Requirement 9: Backend patientType Validation

**User Story:** As a security-conscious developer, I want the backend to validate the `patientType`
field against an allowlist, so that crafted values cannot inject content into the LLM system prompt.

#### Acceptance Criteria

1. WHEN the Backend receives a `POST /api/correct` request where `patientType` is a string value
   not equal to `'stammerer'` or `'dyslalia'`, OR where `patientType` is not a string (number,
   array, object, boolean, null), THE Backend SHALL replace it with `'stammerer'` before
   forwarding to the Correction Pipeline.

2. WHEN the Backend receives a `POST /api/correct` request with no `patientType` field,
   THE Backend SHALL default the value to `'stammerer'` (backwards-compatible behaviour).

3. WHEN the Backend has determined the validated `patientType` value (either from the allowlist
   or defaulted to `'stammerer'`), THE Backend SHALL forward that validated value to
   `runCorrectionPipeline` as the `patientType` argument.

---

### Requirement 10: Dyslalia Phoneme Substitution Dataset (ML Sidecar)

**User Story:** As a developer, I want the ML sidecar to expose a dyslalia phoneme-correction
endpoint, so that the pipeline can reverse common phoneme substitutions for dyslalia patients.

#### Acceptance Criteria

1. THE ML_Sidecar SHALL expose a `POST /dyslalia-correct` endpoint accepting a JSON body with
   `text` (string) and optional `lang` (`'hi'` or `'en'`, defaulting to `'hi'`).

2. WHEN `POST /dyslalia-correct` is called with a non-empty `text` string of 1–2000 characters,
   THE Dyslalia_Corrector SHALL return an HTTP 200 JSON object containing `corrected` (string
   with substitutions applied), `patterns_applied` (list of substitution-key strings that were
   matched), and `changed` (boolean, `true` if and only if at least one substitution was applied).

3. WHEN `POST /dyslalia-correct` is called, THE Dyslalia_Corrector SHALL return a `corrected`
   text where a "word" is defined as a maximal sequence of non-whitespace characters, and the
   number of words in `corrected` equals the number of words in the input `text`.

4. WHEN the input `text` length exceeds 2000 characters, THE Dyslalia_Corrector SHALL truncate
   the input to 2000 characters before processing.

5. IF the phoneme substitution logic raises an exception OR the input `text` is empty,
   THEN THE Dyslalia_Corrector SHALL return `corrected = input`, `patterns_applied = []`,
   `changed = false` with HTTP 200, so that the calling pipeline step is not disrupted.

6. THE ML_Sidecar SHALL include a `DYSLALIA_SUBSTITUTIONS` dataset covering at minimum the Hindi
   phoneme pairs: `र→ल`, `श→स`, `क→त`, `ड→ल`, `व→ब`, `ग→ड`, `च→त`, `झ→ज`, `फ→प`, `ध→द`,
   and the English phoneme pairs: `r→w`, `s→th`, `l→y`, `f→p`, `v→b`.

7. WHEN `POST /dyslalia-correct` is called with a `lang` value that is not `'hi'` or `'en'`,
   THE Dyslalia_Corrector SHALL default to `lang = 'hi'` and return HTTP 200.

8. WHEN multiple phoneme substitution patterns could match overlapping substrings in the input,
   THE Dyslalia_Corrector SHALL apply patterns in the order they are defined in
   `DYSLALIA_SUBSTITUTIONS` (first-listed pattern wins), producing deterministic output.

---

### Requirement 11: localStorage Fallback (Private Browsing)

**User Story:** As a user browsing in private/incognito mode, I want the app to work for my
session even if localStorage is unavailable, so that I am not blocked from using the app.

#### Acceptance Criteria

1. IF `localStorage.setItem` throws an exception when persisting the patient type (from either
   PatientTypeScreen or SettingsFAB), THEN THE App SHALL catch the exception and still update
   the in-memory React state to the selected `PatientType` value so the session continues.

2. IF `localStorage.setItem` throws an exception, THEN THE App SHALL display a non-blocking
   toast notification that auto-dismisses within 5 seconds, informing the user that the selection
   will not persist after reload.

---

### Requirement 12: Health Endpoint Patient Type Indication

**User Story:** As an operator, I want the health endpoint to confirm patient type support is
active, so that I can verify the feature is deployed correctly.

#### Acceptance Criteria

1. WHEN a client sends `GET /api/health`, THE Backend SHALL return a JSON response that includes
   a `patientTypeSupported: true` field alongside the existing `ok`, `groqConfigured`, and
   `sidecarAvailable` fields.

---

### Requirement 13: Dev Artefact Cleanup

**User Story:** As a developer, I want leftover benchmark utilities and temporary root files
removed from the repository, so that the codebase is clean and these files are not accidentally
executed in production.

#### Acceptance Criteria

1. THE repository SHALL NOT contain the files `server/benchmark.js`, `server/benchmarkSample.js`,
   `server/compareAccuracy.js`, or `server/generateDataset.js`.

2. THE repository SHALL NOT contain the temporary root-level files `body.json`, `response.txt`,
   `response2.txt`, `result.json`, or `corrections.json`.

3. THE repository SHALL NOT contain the `benchmark_results/` directory or any files within it.

4. THE repository SHALL NOT contain any `import`, `require`, or dynamic reference to
   `server/benchmark.js`, `server/benchmarkSample.js`, `server/compareAccuracy.js`, or
   `server/generateDataset.js` in any remaining source file.

5. THE repository's `.gitignore` SHALL include entries for `benchmark_results/`, `body.json`,
   `response.txt`, `response2.txt`, `result.json`, and `corrections.json` so that these artefacts
   cannot be re-committed if regenerated locally.

---

### Requirement 14: Accuracy Improvement Target

**User Story:** As a product owner, I want the combined correction pipeline to achieve at least
80% accuracy on the combined stammerer and dyslalia test dataset, so that the app provides
clinically meaningful speech correction.

#### Acceptance Criteria

1. WHEN the automated accuracy test suite is run against all entries in the combined
   `STAMMERER_DATASET` and `DYSLALIA_DATASET`, THE Pipeline SHALL achieve a mean
   `scoreWordAlignment` score (positional word-match percentage, 0–100) of at least 80 across
   all entries.

2. THE `DYSLALIA_DATASET` SHALL be exported from `server/testDataset.js` and SHALL contain at
   least 8 entries covering at minimum 5 distinct Hindi phoneme substitution patterns from the
   design document (`र→ल`, `श→स`, `क→त`, `व→ब`, `ग→ड`).

3. WHEN the accuracy test runs, THE test runner SHALL import and iterate both `STAMMERER_DATASET`
   and `DYSLALIA_DATASET` from `server/testDataset.js`, computing scores for every entry in both
   datasets before reporting the combined mean.
