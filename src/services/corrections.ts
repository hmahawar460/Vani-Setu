export type CorrectionType = 'word' | 'phrase' | 'para';

export interface CorrectionEntry {
  raw: string;
  corrected: string;
  type: CorrectionType;
  count: number;
  updatedAt: string;
}

const STORAGE_KEY = 'whisper-flow:corrections:v1';
const UPDATE_EVENT = 'whisper-flow:corrections-updated';

function canUseStorage() {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function wordCount(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function classifyType(raw: string): CorrectionType {
  const count = wordCount(raw);
  if (count === 1) return 'word';
  if (count <= 6) return 'phrase';
  return 'para';
}

function normalizeEntry(entry: Partial<CorrectionEntry>): CorrectionEntry | null {
  const raw = typeof entry.raw === 'string' ? entry.raw.trim() : '';
  const corrected = typeof entry.corrected === 'string' ? entry.corrected.trim() : '';
  if (!raw || !corrected) return null;
  if (raw.toLowerCase() === corrected.toLowerCase()) return null;

  return {
    raw,
    corrected,
    type: entry.type ?? classifyType(raw),
    count: Math.max(1, Number(entry.count) || 1),
    updatedAt: typeof entry.updatedAt === 'string' ? entry.updatedAt : new Date().toISOString(),
  };
}

function readCorrections(): CorrectionEntry[] {
  if (!canUseStorage()) return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]') as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => normalizeEntry(entry as Partial<CorrectionEntry>))
      .filter((entry): entry is CorrectionEntry => Boolean(entry));
  } catch {
    return [];
  }
}

function writeCorrections(entries: CorrectionEntry[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function getCorrectionPayload(): CorrectionEntry[] {
  return readCorrections();
}

export function subscribeCorrections(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined;

  const handleUpdate = () => listener();
  window.addEventListener(UPDATE_EVENT, handleUpdate);
  window.addEventListener('storage', handleUpdate);

  return () => {
    window.removeEventListener(UPDATE_EVENT, handleUpdate);
    window.removeEventListener('storage', handleUpdate);
  };
}

/** Save a manual correction pair to this browser's private dataset. */
export async function saveCorrection(raw: string, corrected: string): Promise<void> {
  const normalized = normalizeEntry({ raw, corrected });
  if (!normalized) return;

  const entries = readCorrections();
  const key = normalized.raw.toLowerCase();
  const existingIndex = entries.findIndex((entry) => entry.raw.toLowerCase() === key);

  if (existingIndex >= 0) {
    const existing = entries[existingIndex];
    entries[existingIndex] = {
      ...existing,
      corrected: normalized.corrected,
      type: classifyType(normalized.raw),
      count: existing.count + 1,
      updatedAt: new Date().toISOString(),
    };
  } else {
    entries.push({
      ...normalized,
      updatedAt: new Date().toISOString(),
    });
  }

  writeCorrections(entries);
}

/** Fetch all corrections stored in this browser. */
export async function fetchCorrections(): Promise<CorrectionEntry[]> {
  return readCorrections();
}

/** Delete a correction by its raw value from this browser. */
export async function deleteCorrection(raw: string): Promise<void> {
  const key = raw.trim().toLowerCase();
  if (!key) return;

  writeCorrections(readCorrections().filter((entry) => entry.raw.toLowerCase() !== key));
}
