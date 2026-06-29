import { parseJsonResponse } from './apiUtils';

export async function transcribeAudio(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('audio', blob, 'recording.webm');

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  });

  const data = await parseJsonResponse<{ text: string; error?: string }>(response);

  if (!response.ok) {
    throw new Error(data.error ?? 'Transcription failed');
  }

  return data.text;
}

export async function checkHealth(): Promise<{ ok: boolean; groqConfigured: boolean }> {
  const response = await fetch('/api/health');
  return parseJsonResponse(response);
}
