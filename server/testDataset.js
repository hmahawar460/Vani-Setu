/**
 * Test dataset for the lesson test feature.
 * Sentences are real-life phrases a person with speech impairment would use.
 * Difficulty levels: easy (short), medium, hard (long/complex).
 *
 * Each entry:
 *   id        — unique identifier
 *   hindi     — the correct Hindi sentence (shown + read to user)
 *   category  — topic category (for future filtering)
 *   difficulty — easy | medium | hard
 */
export const TEST_DATASET = [
  // ── Daily needs ────────────────────────────────────────────────────────────
  { id: 1,  hindi: 'मुझे पानी चाहिए।',                        category: 'needs',    difficulty: 'easy' },
  { id: 2,  hindi: 'मुझे भूख लगी है।',                         category: 'needs',    difficulty: 'easy' },
  { id: 3,  hindi: 'मुझे बाथरूम जाना है।',                     category: 'needs',    difficulty: 'easy' },
  { id: 4,  hindi: 'मुझे दवाई चाहिए।',                         category: 'health',   difficulty: 'easy' },
  { id: 5,  hindi: 'मुझे बहुत दर्द हो रहा है।',               category: 'health',   difficulty: 'medium' },
  { id: 6,  hindi: 'मैं थका हुआ हूँ, मुझे आराम चाहिए।',       category: 'needs',    difficulty: 'medium' },
  { id: 7,  hindi: 'कृपया मेरी मदद करें।',                    category: 'help',     difficulty: 'easy' },
  { id: 8,  hindi: 'मेरे कपड़े गीले हो गए क्योंकि बारिश हो गई।', category: 'weather',  difficulty: 'hard' },
  { id: 9,  hindi: 'मैं स्कूल जाना चाहता था लेकिन नहीं जा पाया।', category: 'school',   difficulty: 'hard' },
  { id: 10, hindi: 'मुझे आज बहुत भूख लगी थी इसलिए मैंने खाना खाया।', category: 'daily',    difficulty: 'hard' },
  // ── Feelings ───────────────────────────────────────────────────────────────
  { id: 11, hindi: 'मुझे ठंड लग रही है।',                      category: 'weather',  difficulty: 'easy' },
  { id: 12, hindi: 'मैं खुश हूँ।',                              category: 'feelings', difficulty: 'easy' },
  { id: 13, hindi: 'मुझे डर लग रहा है।',                        category: 'feelings', difficulty: 'easy' },
  { id: 14, hindi: 'मेरे सिर में दर्द है।',                     category: 'health',   difficulty: 'medium' },
  { id: 15, hindi: 'मुझे अपने पापा को बुलाना है।',              category: 'help',     difficulty: 'medium' },
];

export function getTestQuestionById(id) {
  const numericId = Number(id);
  return TEST_DATASET.find((question) => question.id === numericId) ?? null;
}

export function getTestQuestions(count = 5) {
  // Shuffle and return `count` questions, mixed difficulty
  const shuffled = [...TEST_DATASET].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, TEST_DATASET.length));
}
