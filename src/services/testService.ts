import { getCorrectionPayload } from './corrections';

export interface TestQuestion {
  id: number;
  hindi: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface EvalResult {
  score: number;       // 0-100
  corrected: string;   // what the pipeline produced
  expected: string;    // the correct answer
  questionId?: number | null;
}

export async function fetchTestQuestions(count = 5): Promise<TestQuestion[]> {
  const r = await fetch(`/api/test/questions?count=${count}`);
  const d = await r.json();
  return d.questions as TestQuestion[];
}

export async function evaluateAnswer(question: TestQuestion, heard: string): Promise<EvalResult> {
  const r = await fetch('/api/test/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      questionId: question.id,
      expected: question.hindi,
      heard,
      corrections: getCorrectionPayload(),
    }),
  });

  const data = await r.json();
  if (!r.ok) {
    throw new Error(data.error ?? 'Test evaluation failed');
  }

  return data as EvalResult;
}
