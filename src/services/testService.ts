import { parseJsonResponse } from './apiUtils';
import { getCorrectionPayload } from './corrections';
import { getPronunciationPayload } from './pronunciation';

export interface LetterTestQuestion {
  id: number;
  script: 'english' | 'hindi';
  letter: string;
  spoken: string;
  example: string;
  category?: string;
}

export interface WordTestQuestion {
  id: number;
  english: string;
  hindi: string;
  category: string;
}

export interface SentenceTestQuestion {
  id: number;
  hindi: string;
  hinglish: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ParagraphTestQuestion {
  id: number;
  hindi: string;
  hinglish: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Backward compat
export interface TestQuestion {
  id: number;
  hindi: string;
  hinglish?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface EvalResult {
  score: number;
  corrected: string;
  expected: string;
  questionId?: number | null;
  mode?: 'letter' | 'word' | 'sentence' | 'paragraph';
  englishAlt?: string | null;
}

function evalPayload(extra: Record<string, unknown>) {
  return {
    corrections: getCorrectionPayload(),
    pronunciation: getPronunciationPayload(),
    ...extra,
  };
}

// ─── Phase 1(a) — English A–Z ──────────────────────────────────────────────

export async function fetchEnglishLetterTests(count = 26): Promise<LetterTestQuestion[]> {
  const r = await fetch(`/api/test/english-letters?count=${count}`);
  const d = await parseJsonResponse<{ letters: LetterTestQuestion[] }>(r);
  return d.letters;
}

// ─── Phase 1(b) — Hindi Varnmala ───────────────────────────────────────────

export async function fetchHindiVarnmalaTests(count = 48): Promise<LetterTestQuestion[]> {
  const r = await fetch(`/api/test/hindi-varnmala?count=${count}`);
  const d = await parseJsonResponse<{ letters: LetterTestQuestion[] }>(r);
  return d.letters;
}

// ─── Phase 2 — Sentences ───────────────────────────────────────────────────

export async function fetchSentenceTests(count = 6): Promise<SentenceTestQuestion[]> {
  const r = await fetch(`/api/test/sentences?count=${count}`);
  const d = await parseJsonResponse<{ sentences: SentenceTestQuestion[] }>(r);
  return d.sentences;
}

// ─── Phase 3 — Paragraphs ──────────────────────────────────────────────────

export async function fetchParagraphTests(count = 3): Promise<ParagraphTestQuestion[]> {
  const r = await fetch(`/api/test/paragraphs?count=${count}`);
  const d = await parseJsonResponse<{ paragraphs: ParagraphTestQuestion[] }>(r);
  return d.paragraphs;
}

// ─── Backward-compat fetchers ──────────────────────────────────────────────

export async function fetchLetterTests(count = 10): Promise<LetterTestQuestion[]> {
  const r = await fetch(`/api/test/letters?count=${count}`);
  const d = await parseJsonResponse<{ letters: LetterTestQuestion[] }>(r);
  return d.letters;
}

export async function fetchWordTests(count = 6): Promise<WordTestQuestion[]> {
  const r = await fetch(`/api/test/words?count=${count}`);
  const d = await parseJsonResponse<{ words: WordTestQuestion[] }>(r);
  return d.words;
}

export async function fetchTestQuestions(count = 4): Promise<TestQuestion[]> {
  const r = await fetch(`/api/test/questions?count=${count}`);
  const d = await parseJsonResponse<{ questions: TestQuestion[] }>(r);
  return d.questions;
}

// ─── Evaluation functions ──────────────────────────────────────────────────

export async function evaluateLetterAnswer(
  question: LetterTestQuestion,
  heard: string,
): Promise<EvalResult> {
  const r = await fetch('/api/test/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evalPayload({
      mode: 'letter',
      questionId: question.id,
      expected: question.letter,
      heard,
    })),
  });

  const data = await parseJsonResponse<EvalResult & { error?: string }>(r);
  if (!r.ok) throw new Error(data.error ?? 'Letter test evaluation failed');
  return data;
}

export async function evaluateWordAnswer(
  question: WordTestQuestion,
  heard: string,
): Promise<EvalResult> {
  const r = await fetch('/api/test/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evalPayload({
      mode: 'word',
      questionId: question.id,
      expected: question.hindi,
      englishAlt: question.english,
      heard,
    })),
  });

  const data = await parseJsonResponse<EvalResult & { error?: string }>(r);
  if (!r.ok) throw new Error(data.error ?? 'Word test evaluation failed');
  return data;
}

export async function evaluateSentenceAnswer(
  question: SentenceTestQuestion,
  heard: string,
): Promise<EvalResult> {
  const r = await fetch('/api/test/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evalPayload({
      mode: 'sentence',
      questionId: question.id,
      expected: question.hindi,
      heard,
    })),
  });

  const data = await parseJsonResponse<EvalResult & { error?: string }>(r);
  if (!r.ok) throw new Error(data.error ?? 'Sentence test evaluation failed');
  return data;
}

export async function evaluateParagraphAnswer(
  question: ParagraphTestQuestion | TestQuestion,
  heard: string,
): Promise<EvalResult> {
  const r = await fetch('/api/test/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evalPayload({
      mode: 'paragraph',
      questionId: question.id,
      expected: question.hindi,
      heard,
    })),
  });

  const data = await parseJsonResponse<EvalResult & { error?: string }>(r);
  if (!r.ok) throw new Error(data.error ?? 'Paragraph test evaluation failed');
  return data;
}
