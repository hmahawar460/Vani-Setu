import { SPEECH_LOCALE } from '../config';

export function isSpeechSynthesisSupported(): boolean {
  return 'speechSynthesis' in window;
}

let cachedVoices: SpeechSynthesisVoice[] = [];
let userSelectedVoice: SpeechSynthesisVoice | null = null;

export function setPreferredVoice(voice: SpeechSynthesisVoice | null): void {
  userSelectedVoice = voice;
}

// ── Client-side Hinglish → Devanagari cleanup (before TTS) ──────────────────
// Ensures Roman Hindi words are never passed to hi-IN voice (mispronounced).
// Only maps words confirmed to slip through from autocorrect output.
const SPEAK_MAP: Record<string, string> = {
  // Common words that sometimes leak through
  school: 'स्कूल', barish: 'बारिश', baarish: 'बारिश',
  pani: 'पानी', paani: 'पानी', khana: 'खाना', khaana: 'खाना',
  nahi: 'नहीं', nahin: 'नहीं', haan: 'हाँ',
  mai: 'मैं', mujhe: 'मुझे', mera: 'मेरा', meri: 'मेरी',
  hai: 'है', hain: 'हैं', tha: 'था', thi: 'थी',
  aaj: 'आज', kal: 'कल', abhi: 'अभी',
  bahut: 'बहुत', sirf: 'सिर्फ', bas: 'बस',
  kiyuki: 'क्योंकि', kyunki: 'क्योंकि', isliye: 'इसलिए',
  lekin: 'लेकिन', aur: 'और', ya: 'या',
  gaya: 'गया', gayi: 'गई', gae: 'गए',
  dard: 'दर्द', dawai: 'दवाई', madad: 'मदद',
  thanda: 'ठंडा', garam: 'गरम', thand: 'ठंड',
  bhookh: 'भूख', neend: 'नींद', thaka: 'थका',
  doctor: 'डॉक्टर', bathroom: 'बाथरूम',
  kha: 'खा', pi: 'पी', so: 'सो', ja: 'जा',
  roti: 'रोटी', chawal: 'चावल', doodh: 'दूध',
  please: 'कृपया', help: 'मदद', water: 'पानी', food: 'खाना',
};

const SPEAK_KEYS = Object.keys(SPEAK_MAP).sort((a, b) => b.length - a.length);
const SPEAK_RE = new RegExp(
  `(?<![a-zA-Z\u0900-\u097F])(${SPEAK_KEYS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![a-zA-Z\u0900-\u097F])`,
  'gi'
);

/**
 * Convert any remaining Hinglish/Roman words to Devanagari before TTS.
 * Ensures hi-IN voice always receives pure Hindi text.
 */
function prepareForSpeech(text: string): string {
  if (!text) return text;
  // Only process if Roman chars exist (fast check)
  if (!/[a-zA-Z]/.test(text)) return text;
  SPEAK_RE.lastIndex = 0;
  return text.replace(SPEAK_RE, (match) => SPEAK_MAP[match.toLowerCase()] ?? match);
}

function getBestHindiVoice(): SpeechSynthesisVoice | undefined {
  if (userSelectedVoice) return userSelectedVoice;
  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  
  // Prioritize known high-quality female voices first
  const femaleNames = ['swara', 'kalpana', 'aditi', 'google हिन्दी', 'google hindi'];
  
  const hindiVoices = voices.filter(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'));
  
  return (
    hindiVoices.find((v) => femaleNames.some(name => v.name.toLowerCase().includes(name))) ??
    hindiVoices.find((v) => v.lang === 'hi-IN' && v.localService) ??
    hindiVoices.find((v) => v.lang === 'hi-IN') ??
    hindiVoices[0]
  );
}

/** Small delay helper — needed for Chrome's cancel() → speak() race */
function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

let currentAudio: HTMLAudioElement | null = null;

export function speak(text: string, rate = 0.85): Promise<void> {
  const cleaned = prepareForSpeech(text);
  return speakRaw(cleaned, rate);
}

function speakRaw(text: string, rate = 0.85): Promise<void> {
  return new Promise((resolve, reject) => {
    // 1. Stop any currently playing audio/speech
    stopSpeaking();

    // 2. Play using the server-side multilingual TTS model
    const url = `/api/tts?text=${encodeURIComponent(text)}`;
    const audio = new Audio(url);
    currentAudio = audio;
    audio.playbackRate = rate;

    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null;
      resolve();
    };

    audio.onerror = (e) => {
      if (currentAudio === audio) currentAudio = null;
      console.warn('[TTS] Server-side TTS failed, falling back to local Web Speech API:', e);
      speakNative(text, rate).then(resolve).catch(reject);
    };

    audio.play().catch((err) => {
      if (currentAudio === audio) currentAudio = null;
      console.warn('[TTS] Audio playback failed, falling back to local Web Speech API:', err);
      speakNative(text, rate).then(resolve).catch(reject);
    });
  });
}

function speakNative(text: string, rate = 0.85): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isSpeechSynthesisSupported()) {
      reject(new Error('इस ब्राउज़र में आवाज़ सपोर्ट नहीं है। Chrome या Edge आज़माएँ।'));
      return;
    }

    window.speechSynthesis.cancel();

    const doSpeak = () => {
      const hindiVoice = getBestHindiVoice();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = SPEECH_LOCALE;
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.volume = 1;

      if (hindiVoice) {
        utterance.voice = hindiVoice;
        console.log(`[TTS Fallback] Using native: ${hindiVoice.name}`);
      }

      let keepAlive: ReturnType<typeof setInterval> | null = null;

      const cleanup = () => {
        if (keepAlive) { clearInterval(keepAlive); keepAlive = null; }
      };

      utterance.onend = () => { cleanup(); resolve(); };
      utterance.onerror = (e) => {
        cleanup();
        if (e.error === 'interrupted' || e.error === 'canceled') {
          resolve();
        } else {
          reject(new Error(e.error ?? 'Speech failed'));
        }
      };

      window.speechSynthesis.speak(utterance);

      keepAlive = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          cleanup();
        } else {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);
    };

    if (cachedVoices.length > 0) {
      delay(120).then(doSpeak);
    } else {
      loadVoices().then(() => delay(120)).then(doSpeak).catch(() => delay(120).then(doSpeak));
    }
  });
}

export function stopSpeaking(): void {
  if (currentAudio) {
    try {
      currentAudio.pause();
    } catch {
      // ignore
    }
    currentAudio = null;
  }
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

