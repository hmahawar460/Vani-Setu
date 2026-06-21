import { SPEECH_LOCALE } from '../config';

export function isSpeechSynthesisSupported(): boolean {
  return 'speechSynthesis' in window;
}

let cachedVoices: SpeechSynthesisVoice[] = [];
let userSelectedVoice: SpeechSynthesisVoice | null = null;

export function setPreferredVoice(voice: SpeechSynthesisVoice | null): void {
  userSelectedVoice = voice;
}

function getBestHindiVoice(): SpeechSynthesisVoice | undefined {
  if (userSelectedVoice) return userSelectedVoice;
  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === 'hi-IN' && v.localService) ??
    voices.find((v) => v.lang === 'hi-IN') ??
    voices.find((v) => v.lang.startsWith('hi') && v.localService) ??
    voices.find((v) => v.lang.startsWith('hi')) ??
    voices.find((v) => v.name.toLowerCase().includes('hindi')) ??
    voices.find((v) => v.lang.includes('IN'))
  );
}

/** Small delay helper — needed for Chrome's cancel() → speak() race */
function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function speak(text: string, rate = 0.85): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isSpeechSynthesisSupported()) {
      reject(new Error('इस ब्राउज़र में आवाज़ सपोर्ट नहीं है। Chrome या Edge आज़माएँ।'));
      return;
    }

    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();

    const doSpeak = () => {
      // Ensure voices are loaded
      const hindiVoice = getBestHindiVoice();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = SPEECH_LOCALE; // always hi-IN
      utterance.rate = rate;          // 0.85 — clear for disability users
      utterance.pitch = 1;
      utterance.volume = 1;

      if (hindiVoice) {
        utterance.voice = hindiVoice;
        console.log(`[TTS] Using: ${hindiVoice.name} (${hindiVoice.lang})`);
      } else {
        console.warn('[TTS] No Hindi voice — using browser default with lang=hi-IN');
      }

      let keepAlive: ReturnType<typeof setInterval> | null = null;

      const cleanup = () => {
        if (keepAlive) { clearInterval(keepAlive); keepAlive = null; }
      };

      utterance.onend = () => { cleanup(); resolve(); };

      utterance.onerror = (e) => {
        cleanup();
        // 'interrupted'/'canceled' = stopSpeaking() was called intentionally — not an error
        if (e.error === 'interrupted' || e.error === 'canceled') {
          resolve();
        } else {
          console.error('[TTS] error:', e.error);
          reject(new Error(e.error ?? 'Speech failed'));
        }
      };

      window.speechSynthesis.speak(utterance);

      // Chrome bug: speechSynthesis silently pauses on long text after ~15s
      // Keep it alive by pause/resume every 10s
      keepAlive = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          cleanup();
        } else {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);
    };

    // Chrome requires a small gap after cancel() before the next speak() works
    // Without this delay, speak() is silently ignored
    if (cachedVoices.length > 0) {
      delay(120).then(doSpeak);
    } else {
      loadVoices().then(() => delay(120)).then(doSpeak).catch(() => delay(120).then(doSpeak));
    }
  });
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      cachedVoices = voices;
      resolve(voices);
      return;
    }
    const onChange = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onChange);
      cachedVoices = window.speechSynthesis.getVoices();
      resolve(cachedVoices);
    };
    window.speechSynthesis.addEventListener('voiceschanged', onChange);
    window.speechSynthesis.getVoices();
  });
}
