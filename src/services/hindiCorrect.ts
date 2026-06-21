import { getCorrectionPayload } from './corrections';

export async function correctHindi(text: string): Promise<string> {
  if (!text.trim()) return text;

  const response = await fetch('/api/correct', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, corrections: getCorrectionPayload() }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? 'Hindi correction failed');
  }

  return data.text as string;
}
