# वाणी सेतु (Vani Setu)

**Live Demo:** [वाणी सेतु (Vani Setu)](https://wisperflow-blue.vercel.app/)

Turn unclear speech into clean, grammatically corrected text — then speak it aloud.

**Pipeline:** Mic → Groq Whisper (STT) → LanguageTool (grammar) → Web Speech API (TTS)

## Quick start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Add your Groq API key** (free at [console.groq.com](https://console.groq.com))

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set `GROQ_API_KEY=your_key_here`.

3. **Run the app**

   ```bash
   npm run dev
   ```

   - Frontend: [http://localhost:5173](http://localhost:5173)
   - API server: [http://localhost:3001](http://localhost:3001)

4. **Use it**
   - Tap **Speak**, say your message, tap again to stop.
   - Raw transcript and corrected text appear on screen.
   - Corrected text is spoken automatically (toggle off if you prefer).

## Stack

| Step | Service | Cost |
|------|---------|------|
| Speech-to-text | Groq Whisper Large v3 | Free tier (~14,400 sec/day) |
| Grammar fix | LanguageTool public API | Free, no key |
| Text-to-speech | Web Speech API (browser) | Free |

## Production build

```bash
npm run build
npm start
```

The Express server serves the built frontend and proxies Groq requests so your API key stays server-side.

## Browser notes

- **Microphone:** Requires HTTPS or `localhost`.
- **TTS:** Web Speech API works best in **Chrome** and **Edge**.

## Project structure

```
wisper_flow/
├── server/index.js       # Express server — 4-step autocorrect pipeline
├── server/nlpClient.js   # HTTP client for the Python ML sidecar
├── ml_sidecar/
│   ├── main.py           # FastAPI sidecar — Spello, GEC-mT5, hindiwsd
│   └── requirements.txt  # Python dependencies (pinned versions)
├── src/
│   ├── components/       # UI (mic, transcript, status)
│   ├── hooks/            # Audio recorder
│   └── services/         # Groq, TTS
├── railway.toml          # Railway.app multi-service config
├── render.yaml           # Render.com multi-service config
└── .env.example
```

---

## Deployment

WisperFlow requires two services running together:
- **wisper-flow** — Node.js/Express + React frontend
- **wisper-flow-ml** — Python FastAPI ML sidecar (Spello, GEC-mT5-Small-Hindi, hindiwsd)

> The sidecar is internal-only (not publicly exposed). The Node.js service calls it via `ML_SIDECAR_URL`.

---

### Railway.app (Recommended — always-on free credit)

Railway gives $5/month free credit, supports always-on services, and handles internal networking between services automatically.

**Steps:**

1. Push your repo to GitHub.
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
3. Railway reads `railway.toml` and creates both services automatically.
4. In the **wisper-flow** service → **Variables**, add:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```
5. Railway automatically sets `ML_SIDECAR_URL` to the sidecar's internal address.
6. Your public URL: `https://wisper-flow.up.railway.app`

**Environment variables (wisper-flow service):**

| Variable | Value |
|----------|-------|
| `PORT` | `3001` (set by railway.toml) |
| `GROQ_API_KEY` | Set manually as a secret |
| `ML_SIDECAR_URL` | Set automatically by Railway internal networking |

---

### Render.com (Free tier available)

Render's free tier sleeps after 15 minutes of inactivity (30s cold start on next request). Upgrade to Starter ($7/mo) for always-on.

**Steps:**

1. Push your repo to GitHub.
2. Go to [render.com](https://render.com) → **New** → **Blueprint**.
3. Connect your repo — Render reads `render.yaml` and creates both services.
4. In the **wisper-flow** service settings → **Environment**, add:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```
5. Render automatically wires `ML_SIDECAR_URL` from the private sidecar service.
6. Your public URL: `https://wisper-flow.onrender.com`

**Cold start note (free tier):** The Python sidecar loads ~700 MB of ML models on startup. The first request after a cold start may take 30–60 seconds. Subsequent requests are fast (models stay in memory).

---

### Running the ML sidecar locally

```bash
cd ml_sidecar
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

Then in your `.env`:
```
ML_SIDECAR_URL=http://localhost:8000
```

Verify it's running:
```bash
curl http://localhost:8000/health
# {"ok":true,"models":["spello","gec-mt5-small-hindi (manavdhamecha77)","coedit-large-english","hindiwsd"]}
```

---

## Local LLM Setup (Free, MIT License)

WisperFlow can replace the Groq correction LLM with **Microsoft Phi-4-mini** — a free, MIT-licensed model that runs locally via [Ollama](https://ollama.com). Groq Whisper is still used for audio transcription.

### 1. Install Ollama and pull the model

```bash
# Install Ollama: https://ollama.com/download
ollama pull phi4-mini
```

### 2. Enable local mode

In your `.env` file:
```
USE_LOCAL_MODEL=true
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=phi4-mini
```

> **Note:** `GROQ_API_KEY` is still required for Whisper audio transcription.

### 3. Run the accuracy benchmark

Before committing to the swap, compare the two models on the full stammerer dataset:

```bash
# Step 1 — Baseline: measure Groq accuracy (USE_LOCAL_MODEL must be false)
node server/benchmark.js --model=groq

# Step 2 — New model: measure Phi-4-mini accuracy (Ollama must be running)
node server/benchmark.js --model=ollama
```

Both commands save timestamped JSON files to `benchmark_results/`.

### 4. Compare results

```bash
node server/compareAccuracy.js benchmark_results/benchmark_groq_<timestamp>.json benchmark_results/benchmark_ollama_<timestamp>.json
```

**Output interpretation:**
- `✅  SWAP APPROVED` — Phi-4-mini meets or exceeds Groq accuracy. Safe to commit `USE_LOCAL_MODEL=true`.
- `❌  KEEP GROQ` — Phi-4-mini is below baseline. Keep `USE_LOCAL_MODEL=false`.

### License

Microsoft Phi-4-mini is released under the [MIT License](https://huggingface.co/microsoft/phi-4-mini-instruct/blob/main/LICENSE).
