import { parseJsonResponse, getApiUrl } from './apiUtils';
import { getCorrectionPayload } from './corrections';
import { getPronunciationPayload } from './pronunciation';

export async function correctHindi(text: string, scenarioContext: string = '', patientType: 'stammerer' | 'dyslexia' = 'stammerer'): Promise<string> {
  if (!text.trim()) return text;

  const response = await fetch(getApiUrl('/api/correct'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      corrections: getCorrectionPayload(),
      pronunciation: getPronunciationPayload(),
      scenarioContext,
      patientType,
    }),
  });

  const data = await parseJsonResponse<{ text: string; error?: string }>(response);

  if (!response.ok) {
    throw new Error(data.error ?? 'Hindi correction failed');
  }

  return data.text;
}