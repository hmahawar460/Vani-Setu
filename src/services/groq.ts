export async function transcribeAudio(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('audio', blob, 'recording.webm');

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? 'Transcription failed');
  }

  return data.text as string;
}

export async function checkHealth(): Promise<{ ok: boolean; groqConfigured: boolean }> {
  const response = await fetch('/api/health');
  return response.json();
}
