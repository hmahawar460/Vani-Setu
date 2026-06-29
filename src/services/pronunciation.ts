export interface PronunciationEntry {
  heard: string;
  expected: string;
  script: 'english' | 'hindi';
  letter?: string;
}

const STORAGE_KEY = 'whisper-flow:pronunciation:v1';
const UPDATE_EVENT = 'whisper-flow:pronunciation-updated';

function canUseStorage() {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function normalizeKey(value: string) {
  return value.trim().toLowerCase();
}

function readProfile(): PronunciationEntry[] {
  if (!canUseStorage()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]') as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is PronunciationEntry =>
        typeof (e as PronunciationEntry).heard === 'string' &&
        typeof (e as PronunciationEntry).expected === 'string',
    );
  } catch {
    return [];
  }
}

function writeProfile(entries: PronunciationEntry[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function getPronunciationPayload(): PronunciationEntry[] {
  return readProfile();
}

export async function savePronunciation(
  heard: string,
  expected: string,
  script: 'english' | 'hindi',
): Promise<void> {
  const h = heard.trim();
  const e = expected.trim();
  if (!h || !e || normalizeKey(h) === normalizeKey(e)) return;

  const entries = readProfile();
  const key = normalizeKey(h);
  const idx = entries.findIndex((entry) => normalizeKey(entry.heard) === key);

  const next: PronunciationEntry = { heard: h, expected: e, script, letter: e };

  if (idx >= 0) entries[idx] = next;
  else entries.push(next);

  writeProfile(entries);
}

export function subscribePronunciation(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  const handle = () => listener();
  window.addEventListener(UPDATE_EVENT, handle);
  window.addEventListener('storage', handle);
  return () => {
    window.removeEventListener(UPDATE_EVENT, handle);
    window.removeEventListener('storage', handle);
  };
}
