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
├── server/index.js       # Groq proxy + static file server
├── src/
│   ├── components/       # UI (mic, transcript, status)
│   ├── hooks/            # Audio recorder
│   └── services/         # Groq, LanguageTool, TTS
└── .env.example
```
