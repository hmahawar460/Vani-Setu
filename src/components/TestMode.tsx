import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { saveCorrection } from '../services/corrections';
import { savePronunciation } from '../services/pronunciation';
import { speak, stopSpeaking } from '../services/speechSynthesis';
import {
  evaluateLetterAnswer,
  evaluateSentenceAnswer,
  evaluateParagraphAnswer,
  fetchEnglishLetterTests,
  fetchHindiVarnmalaTests,
  fetchSentenceTests,
  fetchParagraphTests,
  type EvalResult,
  type LetterTestQuestion,
  type SentenceTestQuestion,
  type ParagraphTestQuestion,
} from '../services/testService';

interface TestModeProps {
  onClose: () => void;
}

/**
 * Phase structure:
 *   intro → phase1a (A–Z) → phase1b (अ–ज्ञ) → phase2 (sentences) → phase3 (paragraphs) → done
 */
type TestPhase = 'intro' | 'phase1a' | 'phase1b' | 'phase2' | 'phase3' | 'done';
type ItemStage = 'listening' | 'recording' | 'evaluating' | 'result';

interface LetterResult {
  question: LetterTestQuestion;
  heard: string;
  eval: EvalResult;
  saved?: boolean;
}

interface SentenceResult {
  question: SentenceTestQuestion;
  heard: string;
  eval: EvalResult;
  saved?: boolean;
}

interface ParagraphResult {
  question: ParagraphTestQuestion;
  heard: string;
  eval: EvalResult;
  saved?: boolean;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: '🟢 आसान',
  medium: '🟡 मध्यम',
  hard: '🔴 कठिन',
};

const NO_AUDIO_TEXT = '(कोई आवाज़ नहीं)';
const SCORE_PUNCTUATION_RE = /[\u0964,.?!]/g;

function wordsForScore(value: string) {
  return value
    .replace(SCORE_PUNCTUATION_RE, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
}

function scoreAnswer(expected: string, corrected: string) {
  const expWords = wordsForScore(expected);
  const corrWords = wordsForScore(corrected);
  const maxLen = Math.max(expWords.length, corrWords.length);
  if (maxLen === 0) return 0;

  let matched = 0;
  expWords.forEach((word, index) => {
    if (corrWords[index] === word) matched++;
  });

  return Math.round((matched / maxLen) * 100);
}

export function TestMode({ onClose }: TestModeProps) {
  const [phase, setPhase] = useState<TestPhase>('intro');
  const [itemStage, setItemStage] = useState<ItemStage>('listening');

  // Phase 1a — English letters
  const [engLetters, setEngLetters] = useState<LetterTestQuestion[]>([]);
  const [engIndex, setEngIndex] = useState(0);
  const [engResults, setEngResults] = useState<LetterResult[]>([]);

  // Phase 1b — Hindi varnmala
  const [hiLetters, setHiLetters] = useState<LetterTestQuestion[]>([]);
  const [hiIndex, setHiIndex] = useState(0);
  const [hiResults, setHiResults] = useState<LetterResult[]>([]);

  // Phase 2 — Sentences
  const [sentences, setSentences] = useState<SentenceTestQuestion[]>([]);
  const [sentIndex, setSentIndex] = useState(0);
  const [sentResults, setSentResults] = useState<SentenceResult[]>([]);

  // Phase 3 — Paragraphs
  const [paragraphs, setParagraphs] = useState<ParagraphTestQuestion[]>([]);
  const [paraIndex, setParaIndex] = useState(0);
  const [paraResults, setParaResults] = useState<ParagraphResult[]>([]);

  const [statusMsg, setStatusMsg] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [editingResult, setEditingResult] = useState(false);
  const [resultEditValue, setResultEditValue] = useState('');
  const [savingResult, setSavingResult] = useState(false);
  const [resultSaveMsg, setResultSaveMsg] = useState('');

  const { startRecording, stopRecording } = useAudioRecorder();
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppingRef = useRef(false);
  const resultEditRef = useRef<HTMLTextAreaElement>(null);

  // Refs for stable access in closures
  const phaseRef = useRef<TestPhase>('intro');
  const engLettersRef = useRef<LetterTestQuestion[]>([]);
  const hiLettersRef = useRef<LetterTestQuestion[]>([]);
  const sentencesRef = useRef<SentenceTestQuestion[]>([]);
  const paragraphsRef = useRef<ParagraphTestQuestion[]>([]);
  const engIndexRef = useRef(0);
  const hiIndexRef = useRef(0);
  const sentIndexRef = useRef(0);
  const paraIndexRef = useRef(0);
  const recordingQuestionRef = useRef<LetterTestQuestion | SentenceTestQuestion | ParagraphTestQuestion | null>(null);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { engLettersRef.current = engLetters; }, [engLetters]);
  useEffect(() => { hiLettersRef.current = hiLetters; }, [hiLetters]);
  useEffect(() => { sentencesRef.current = sentences; }, [sentences]);
  useEffect(() => { paragraphsRef.current = paragraphs; }, [paragraphs]);
  useEffect(() => { engIndexRef.current = engIndex; }, [engIndex]);
  useEffect(() => { hiIndexRef.current = hiIndex; }, [hiIndex]);
  useEffect(() => { sentIndexRef.current = sentIndex; }, [sentIndex]);
  useEffect(() => { paraIndexRef.current = paraIndex; }, [paraIndex]);

  useEffect(() => {
    if (editingResult) resultEditRef.current?.focus();
  }, [editingResult]);

  useEffect(() => () => {
    clearCountdown();
    clearAutoStop();
    stopSpeaking();
  }, []);

  function clearCountdown() {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }

  function clearAutoStop() {
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
  }

  // ─── Recording duration: letters=5s, sentences=8s, paragraphs=15s ───
  function getRecordDuration(): number {
    const p = phaseRef.current;
    if (p === 'phase1a' || p === 'phase1b') return 5000;
    if (p === 'phase2') return 8000;
    return 15000; // phase3 paragraphs
  }

  async function stopCapture() {
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    clearAutoStop();
    setItemStage('evaluating');
    setStatusMsg('जाँच हो रही है…');

    const currentPhase = phaseRef.current;
    const question = recordingQuestionRef.current;

    try {
      const blob = await stopRecording();
      const { transcribeAudio } = await import('../services/groq');
      const heard = await transcribeAudio(blob);

      if (currentPhase === 'phase1a' || currentPhase === 'phase1b') {
        const q = question as LetterTestQuestion;
        if (!q) throw new Error('No letter question');

        const evalResult = await evaluateLetterAnswer(q, heard);
        if (heard.trim() && evalResult.score < 100) {
          await savePronunciation(heard, q.letter, q.script);
          await saveCorrection(heard, q.letter);
        }

        const setter = currentPhase === 'phase1a' ? setEngResults : setHiResults;
        setter((prev) => [
          ...prev.filter((item) => item.question.id !== q.id),
          { question: q, heard, eval: evalResult, saved: evalResult.score < 100 },
        ]);
        setResultEditValue(evalResult.corrected);

      } else if (currentPhase === 'phase2') {
        const q = question as SentenceTestQuestion;
        if (!q) throw new Error('No sentence question');

        const evalResult = await evaluateSentenceAnswer(q, heard);
        setSentResults((prev) => [
          ...prev.filter((item) => item.question.id !== q.id),
          { question: q, heard, eval: evalResult },
        ]);
        setResultEditValue(evalResult.corrected);

      } else if (currentPhase === 'phase3') {
        const q = question as ParagraphTestQuestion;
        if (!q) throw new Error('No paragraph question');

        const evalResult = await evaluateParagraphAnswer(q, heard);
        setParaResults((prev) => [
          ...prev.filter((item) => item.question.id !== q.id),
          { question: q, heard, eval: evalResult },
        ]);
        setResultEditValue(evalResult.corrected);
      }

      setEditingResult(false);
      setResultSaveMsg('');
      setItemStage('result');
    } catch {
      // On error, record a zero-score result
      if (question) {
        if (currentPhase === 'phase1a' || currentPhase === 'phase1b') {
          const q = question as LetterTestQuestion;
          const setter = currentPhase === 'phase1a' ? setEngResults : setHiResults;
          setter((prev) => [
            ...prev.filter((item) => item.question.id !== q.id),
            { question: q, heard: '', eval: { score: 0, corrected: '', expected: q.letter, questionId: q.id, mode: 'letter' } },
          ]);
        } else if (currentPhase === 'phase2') {
          const q = question as SentenceTestQuestion;
          setSentResults((prev) => [
            ...prev.filter((item) => item.question.id !== q.id),
            { question: q, heard: '', eval: { score: 0, corrected: '', expected: q.hindi, questionId: q.id, mode: 'sentence' } },
          ]);
        } else if (currentPhase === 'phase3') {
          const q = question as ParagraphTestQuestion;
          setParaResults((prev) => [
            ...prev.filter((item) => item.question.id !== q.id),
            { question: q, heard: '', eval: { score: 0, corrected: '', expected: q.hindi, questionId: q.id, mode: 'paragraph' } },
          ]);
        }
      }
      setResultEditValue('');
      setEditingResult(false);
      setStatusMsg('मूल्यांकन में समस्या। अगले सवाल पर जाएँ।');
      setItemStage('result');
    } finally {
      stoppingRef.current = false;
      recordingQuestionRef.current = null;
    }
  }

  async function startCapture() {
    clearAutoStop();
    setItemStage('recording');
    setStatusMsg('कृपया अपना शब्द यहाँ बोलें…');

    try {
      await startRecording();
      autoStopRef.current = setTimeout(() => { void stopCapture(); }, getRecordDuration());
    } catch {
      setStatusMsg('माइक एक्सेस नहीं मिला।');
      setItemStage('listening');
    }
  }

  // ─── TTS + Countdown + Auto-record ───────────────────────────────────

  async function readLetterQuestion(question: LetterTestQuestion) {
    clearCountdown();
    clearAutoStop();
    recordingQuestionRef.current = question;
    setItemStage('listening');
    setCountdown(0);
    setStatusMsg('सुनें और फिर अक्षर बोलें…');
    stopSpeaking();

    const ttsPrompt = question.script === 'english'
      ? `अंग्रेज़ी अक्षर ${question.spoken}। उदाहरण ${question.example.split('/')[1]?.trim() ?? question.example}। कृपया अपना शब्द यहाँ बोलें।`
      : `हिंदी वर्ण ${question.letter}। उदाहरण ${question.example}। कृपया अपना शब्द यहाँ बोलें।`;

    try {
      await speak(ttsPrompt, 0.82);
    } catch { /* ignore */ }

    setCountdown(3);
    let count = 3;
    countdownRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearCountdown();
        void startCapture();
      }
    }, 1000);
  }

  async function readSentenceQuestion(question: SentenceTestQuestion) {
    clearCountdown();
    clearAutoStop();
    recordingQuestionRef.current = question;
    setItemStage('listening');
    setCountdown(0);
    setStatusMsg('सुनें और फिर पूरा वाक्य बोलें…');
    stopSpeaking();

    try {
      await speak(`कृपया यह वाक्य बोलें। ${question.hindi}`, 0.82);
    } catch { /* ignore */ }

    setCountdown(3);
    let count = 3;
    countdownRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearCountdown();
        void startCapture();
      }
    }, 1000);
  }

  async function readParagraphQuestion(question: ParagraphTestQuestion) {
    clearCountdown();
    clearAutoStop();
    recordingQuestionRef.current = question;
    setItemStage('listening');
    setCountdown(0);
    setStatusMsg('सुनें और फिर पूरा पैराग्राफ बोलें…');
    stopSpeaking();

    try {
      await speak(`कृपया यह पैराग्राफ बोलें। ${question.hindi}`, 0.75);
    } catch { /* ignore */ }

    setCountdown(5);
    let count = 5;
    countdownRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearCountdown();
        void startCapture();
      }
    }, 1000);
  }

  // ─── Phase transitions ──────────────────────────────────────────────

  async function startTest() {
    setStatusMsg('सवाल लोड हो रहे हैं…');
    setEditingResult(false);
    setResultSaveMsg('');
    setEngResults([]);
    setHiResults([]);
    setSentResults([]);
    setParaResults([]);
    setEngIndex(0);
    setHiIndex(0);
    setSentIndex(0);
    setParaIndex(0);

    try {
      const letters = await fetchEnglishLetterTests(26);
      engLettersRef.current = letters;
      setEngLetters(letters);
      setPhase('phase1a');
      setItemStage('listening');
      if (letters[0]) setTimeout(() => { void readLetterQuestion(letters[0]); }, 400);
    } catch {
      setStatusMsg('सवाल लोड नहीं हो सके। दोबारा कोशिश करें।');
    }
  }

  async function startPhase1b() {
    setStatusMsg('हिंदी वर्णमाला लोड हो रही है…');
    setEditingResult(false);
    setResultSaveMsg('');
    setHiIndex(0);

    try {
      const letters = await fetchHindiVarnmalaTests(48);
      hiLettersRef.current = letters;
      setHiLetters(letters);
      setPhase('phase1b');
      setItemStage('listening');
      if (letters[0]) setTimeout(() => { void readLetterQuestion(letters[0]); }, 400);
    } catch {
      setStatusMsg('वर्णमाला सवाल लोड नहीं हो सके।');
    }
  }

  async function startPhase2() {
    setStatusMsg('वाक्य परीक्षा लोड हो रही है…');
    setEditingResult(false);
    setResultSaveMsg('');
    setSentIndex(0);

    try {
      const sents = await fetchSentenceTests(6);
      sentencesRef.current = sents;
      setSentences(sents);
      setPhase('phase2');
      setItemStage('listening');
      if (sents[0]) setTimeout(() => { void readSentenceQuestion(sents[0]); }, 400);
    } catch {
      setStatusMsg('वाक्य सवाल लोड नहीं हो सके।');
    }
  }

  async function startPhase3() {
    setStatusMsg('पैराग्राफ परीक्षा लोड हो रही है…');
    setEditingResult(false);
    setResultSaveMsg('');
    setParaIndex(0);

    try {
      const paras = await fetchParagraphTests(3);
      paragraphsRef.current = paras;
      setParagraphs(paras);
      setPhase('phase3');
      setItemStage('listening');
      if (paras[0]) setTimeout(() => { void readParagraphQuestion(paras[0]); }, 400);
    } catch {
      setStatusMsg('पैराग्राफ सवाल लोड नहीं हो सके।');
    }
  }

  // ─── Next question handlers ─────────────────────────────────────────

  function nextEngLetter() {
    setEditingResult(false);
    setResultSaveMsg('');
    const next = engIndexRef.current + 1;

    if (next >= engLettersRef.current.length) {
      void startPhase1b();
      return;
    }

    engIndexRef.current = next;
    setEngIndex(next);
    void readLetterQuestion(engLettersRef.current[next]);
  }

  function nextHiLetter() {
    setEditingResult(false);
    setResultSaveMsg('');
    const next = hiIndexRef.current + 1;

    if (next >= hiLettersRef.current.length) {
      void startPhase2();
      return;
    }

    hiIndexRef.current = next;
    setHiIndex(next);
    void readLetterQuestion(hiLettersRef.current[next]);
  }

  function nextSentence() {
    setEditingResult(false);
    setResultSaveMsg('');
    const next = sentIndexRef.current + 1;

    if (next >= sentencesRef.current.length) {
      void startPhase3();
      return;
    }

    sentIndexRef.current = next;
    setSentIndex(next);
    void readSentenceQuestion(sentencesRef.current[next]);
  }

  function nextParagraph() {
    setEditingResult(false);
    setResultSaveMsg('');
    const next = paraIndexRef.current + 1;

    if (next >= paragraphsRef.current.length) {
      setPhase('done');
      return;
    }

    paraIndexRef.current = next;
    setParaIndex(next);
    void readParagraphQuestion(paragraphsRef.current[next]);
  }

  // ─── Active result for current phase ────────────────────────────────

  function getActiveResult(): LetterResult | SentenceResult | ParagraphResult | null {
    if (phase === 'phase1a' && engResults.length > 0) {
      const q = engLetters[engIndex];
      return engResults.find((r) => r.question.id === q?.id) ?? engResults[engResults.length - 1];
    }
    if (phase === 'phase1b' && hiResults.length > 0) {
      const q = hiLetters[hiIndex];
      return hiResults.find((r) => r.question.id === q?.id) ?? hiResults[hiResults.length - 1];
    }
    if (phase === 'phase2' && sentResults.length > 0) {
      const q = sentences[sentIndex];
      return sentResults.find((r) => r.question.id === q?.id) ?? sentResults[sentResults.length - 1];
    }
    if (phase === 'phase3' && paraResults.length > 0) {
      const q = paragraphs[paraIndex];
      return paraResults.find((r) => r.question.id === q?.id) ?? paraResults[paraResults.length - 1];
    }
    return null;
  }

  async function saveResultEdit(result: LetterResult | SentenceResult | ParagraphResult) {
    const trimmed = resultEditValue.trim();
    if (!trimmed) return;

    setSavingResult(true);
    try {
      if (result.heard.trim()) await saveCorrection(result.heard, trimmed);
      if (result.eval.corrected.trim()) await saveCorrection(result.eval.corrected, trimmed);

      const updatedEval = {
        ...result.eval,
        corrected: trimmed,
        score: scoreAnswer(result.eval.expected, trimmed),
      };

      if ('script' in result.question) {
        // Letter result
        const setter = phase === 'phase1a' ? setEngResults : setHiResults;
        setter((prev) => prev.map((item) => (
          item.question.id === result.question.id
            ? { ...item, eval: updatedEval, saved: true }
            : item
        )));
      } else if ('hinglish' in result.question && 'difficulty' in result.question) {
        // Check if it's a paragraph result based on phase
        if (phase === 'phase3') {
          setParaResults((prev) => prev.map((item) => (
            item.question.id === result.question.id
              ? { ...item, eval: updatedEval, saved: true }
              : item
          )));
        } else {
          setSentResults((prev) => prev.map((item) => (
            item.question.id === result.question.id
              ? { ...item, eval: updatedEval, saved: true }
              : item
          )));
        }
      }

      setResultSaveMsg('सहेज लिया गया — अगली बार यही सुधार इस्तेमाल होगा।');
      setEditingResult(false);
    } catch {
      setResultSaveMsg('सहेजने में समस्या हुई।');
    } finally {
      setSavingResult(false);
    }
  }

  function handleEditKeyDown(result: LetterResult | SentenceResult | ParagraphResult, event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void saveResultEdit(result);
    }
    if (event.key === 'Escape') {
      setResultEditValue(result.eval.corrected);
      setEditingResult(false);
      setResultSaveMsg('');
    }
  }

  // ─── Computed values ────────────────────────────────────────────────

  const allResults = [...engResults, ...hiResults, ...sentResults, ...paraResults];
  const totalScore = allResults.length > 0
    ? Math.round(allResults.reduce((sum, r) => sum + r.eval.score, 0) / allResults.length)
    : 0;

  const currentEngLetter = engLetters[engIndex];
  const currentHiLetter = hiLetters[hiIndex];
  const currentSentence = sentences[sentIndex];
  const currentParagraph = paragraphs[paraIndex];
  const activeResult = getActiveResult();

  const phaseLabel =
    phase === 'phase1a' ? 'चरण 1(a) — English A–Z अक्षर'
    : phase === 'phase1b' ? 'चरण 1(b) — हिंदी वर्णमाला अ–ज्ञ'
    : phase === 'phase2' ? 'चरण 2 — वाक्य परीक्षा'
    : phase === 'phase3' ? 'चरण 3 — पैराग्राफ / निबंध'
    : '';

  const currentQuestion =
    phase === 'phase1a' ? currentEngLetter
    : phase === 'phase1b' ? currentHiLetter
    : phase === 'phase2' ? currentSentence
    : phase === 'phase3' ? currentParagraph
    : null;

  const currentIndex =
    phase === 'phase1a' ? engIndex
    : phase === 'phase1b' ? hiIndex
    : phase === 'phase2' ? sentIndex
    : phase === 'phase3' ? paraIndex
    : 0;

  const totalQuestions =
    phase === 'phase1a' ? engLetters.length
    : phase === 'phase1b' ? hiLetters.length
    : phase === 'phase2' ? sentences.length
    : phase === 'phase3' ? paragraphs.length
    : 0;

  const isLetterPhase = phase === 'phase1a' || phase === 'phase1b';

  function handleReplay() {
    if (phase === 'phase1a' && currentEngLetter) void readLetterQuestion(currentEngLetter);
    if (phase === 'phase1b' && currentHiLetter) void readLetterQuestion(currentHiLetter);
    if (phase === 'phase2' && currentSentence) void readSentenceQuestion(currentSentence);
    if (phase === 'phase3' && currentParagraph) void readParagraphQuestion(currentParagraph);
  }

  function handleNext() {
    if (phase === 'phase1a') nextEngLetter();
    else if (phase === 'phase1b') nextHiLetter();
    else if (phase === 'phase2') nextSentence();
    else if (phase === 'phase3') nextParagraph();
  }

  function getNextLabel(): string {
    if (phase === 'phase1a') {
      return engIndex + 1 < engLetters.length ? 'अगला अक्षर →' : 'चरण 1(b) — हिंदी वर्णमाला →';
    }
    if (phase === 'phase1b') {
      return hiIndex + 1 < hiLetters.length ? 'अगला वर्ण →' : 'चरण 2 — वाक्य →';
    }
    if (phase === 'phase2') {
      return sentIndex + 1 < sentences.length ? 'अगला वाक्य →' : 'चरण 3 — पैराग्राफ →';
    }
    if (phase === 'phase3') {
      return paraIndex + 1 < paragraphs.length ? 'अगला पैराग्राफ →' : 'परिणाम देखें →';
    }
    return 'अगला →';
  }

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <div className="test-mode" role="dialog" aria-modal="true" aria-label="परीक्षा मोड">
      <div className="test-mode__header">
        <h2 className="test-mode__title">📝 हिंदी परीक्षा</h2>
        <button
          type="button"
          className="test-mode__close"
          onClick={() => { stopSpeaking(); onClose(); }}
          aria-label="परीक्षा बंद करें"
        >×</button>
      </div>

      {/* ─── INTRO ─────────────────────────────────────────────────── */}
      {phase === 'intro' && (
        <div className="test-mode__section">
          <p className="test-mode__desc">
            परीक्षा <strong>3 चरणों</strong> में होगी:<br /><br />
            <strong>चरण 1(a) — English A–Z:</strong> सभी 26 अंग्रेज़ी अक्षरों का उच्चारण<br />
            <strong>चरण 1(b) — हिंदी वर्णमाला:</strong> अ से ज्ञ तक सभी वर्णों का उच्चारण<br />
            <strong>चरण 2 — वाक्य:</strong> हिंदी / Hinglish वाक्य बोलें (6 वाक्य)<br />
            <strong>चरण 3 — पैराग्राफ:</strong> पूरा पैराग्राफ पढ़कर बोलें (3 पैराग्राफ)<br /><br />
            आपकी उच्चारण प्रोफ़ाइल बनती है — autocorrect हर शब्द को आपके उच्चारण और पड़ोसी शब्दों से मिलाता है।
          </p>
          <p className="test-mode__desc test-mode__desc--small">
            Hinglish (Roman Hindi) भी support है — जैसे &quot;mai school nahi ja paya&quot;<br />
            गलत पहचाने गए शब्द आपकी निजी DB में सहेजे जाएँगे।
          </p>
          <button type="button" className="test-mode__btn test-mode__btn--primary" onClick={() => { void startTest(); }}>
            परीक्षा शुरू करें →
          </button>
          {statusMsg && <p className="test-mode__status">{statusMsg}</p>}
        </div>
      )}

      {/* ─── ACTIVE TEST (all phases) ──────────────────────────────── */}
      {(phase === 'phase1a' || phase === 'phase1b' || phase === 'phase2' || phase === 'phase3') &&
        (itemStage === 'listening' || itemStage === 'recording' || itemStage === 'evaluating') && (
        <div className="test-mode__section">
          <div className="test-mode__phase-badge">{phaseLabel}</div>

          <div className="test-mode__progress">
            {isLetterPhase
              ? `अक्षर ${currentIndex + 1} / ${totalQuestions}`
              : phase === 'phase2'
                ? `वाक्य ${currentIndex + 1} / ${totalQuestions}`
                : `पैराग्राफ ${currentIndex + 1} / ${totalQuestions}`}
            {(phase === 'phase2' || phase === 'phase3') && currentQuestion && 'difficulty' in currentQuestion && (
              <span className="test-mode__diff">{DIFFICULTY_LABEL[(currentQuestion as SentenceTestQuestion).difficulty]}</span>
            )}
          </div>

          {/* Phase 1a — English letter display */}
          {phase === 'phase1a' && currentEngLetter && (
            <div className="test-mode__word-pair">
              <div className="test-mode__word-en">
                <span className="test-mode__word-label">English</span>
                <span lang="en" style={{ fontSize: '2.5rem', fontWeight: 700 }}>{currentEngLetter.letter}</span>
              </div>
              <div className="test-mode__word-divider" aria-hidden="true">|</div>
              <div className="test-mode__word-hi">
                <span className="test-mode__word-label">उदाहरण</span>
                <span lang="hi">{currentEngLetter.example}</span>
              </div>
            </div>
          )}

          {/* Phase 1b — Hindi varnmala display */}
          {phase === 'phase1b' && currentHiLetter && (
            <div className="test-mode__word-pair">
              <div className="test-mode__word-en">
                <span className="test-mode__word-label">वर्ण</span>
                <span lang="hi" style={{ fontSize: '2.5rem', fontWeight: 700 }}>{currentHiLetter.letter}</span>
              </div>
              <div className="test-mode__word-divider" aria-hidden="true">|</div>
              <div className="test-mode__word-hi">
                <span className="test-mode__word-label">उदाहरण</span>
                <span lang="hi">{currentHiLetter.example}</span>
              </div>
            </div>
          )}

          {/* Phase 2 — Sentence display */}
          {phase === 'phase2' && currentSentence && (
            <div className="test-mode__question-block">
              <div className="test-mode__question" lang="hi">{currentSentence.hindi}</div>
              {currentSentence.hinglish && (
                <div className="test-mode__hinglish" lang="en">
                  <span className="test-mode__hinglish-label">Hinglish:</span> {currentSentence.hinglish}
                </div>
              )}
            </div>
          )}

          {/* Phase 3 — Paragraph display */}
          {phase === 'phase3' && currentParagraph && (
            <div className="test-mode__question-block">
              <div className="test-mode__question test-mode__question--para" lang="hi">{currentParagraph.hindi}</div>
              {currentParagraph.hinglish && (
                <div className="test-mode__hinglish" lang="en">
                  <span className="test-mode__hinglish-label">Hinglish:</span> {currentParagraph.hinglish}
                </div>
              )}
            </div>
          )}

          <div className={`test-mode__mic-state ${itemStage === 'recording' ? 'test-mode__mic-state--active' : ''}`}>
            {itemStage === 'listening' && countdown > 0 && (
              <span className="test-mode__countdown">{countdown} में शुरू…</span>
            )}
            {itemStage === 'listening' && countdown === 0 && <span>{statusMsg}</span>}
            {itemStage === 'recording' && (
              <>
                <span className="test-mode__rec-dot" aria-hidden="true" />
                <span>बोल रहे हैं…</span>
                <button type="button" className="test-mode__btn test-mode__btn--stop" onClick={() => { void stopCapture(); }}>
                  रोकें ⏹
                </button>
              </>
            )}
            {itemStage === 'evaluating' && <span>⏳ {statusMsg}</span>}
          </div>

          <button
            type="button"
            className="test-mode__btn test-mode__btn--secondary"
            onClick={handleReplay}
            disabled={itemStage === 'recording' || itemStage === 'evaluating'}
          >
            🔊 दोबारा सुनें
          </button>
        </div>
      )}

      {/* ─── RESULT VIEW ───────────────────────────────────────────── */}
      {(phase === 'phase1a' || phase === 'phase1b' || phase === 'phase2' || phase === 'phase3') && itemStage === 'result' && activeResult && (() => {
        const result = activeResult;
        const pct = result.eval.score;
        const color = pct >= 80 ? '#4caf8a' : pct >= 50 ? '#f0a050' : '#c45050';

        return (
          <div className="test-mode__section">
            <div className="test-mode__phase-badge">{phaseLabel}</div>
            <div className="test-mode__progress">
              {isLetterPhase
                ? `अक्षर ${currentIndex + 1} / ${totalQuestions}`
                : phase === 'phase2'
                  ? `वाक्य ${currentIndex + 1} / ${totalQuestions}`
                  : `पैराग्राफ ${currentIndex + 1} / ${totalQuestions}`}
            </div>

            <div className="test-mode__score" style={{ color }}>
              {pct}%
              <span className="test-mode__score-label">
                {pct >= 80 ? '🌟 शाबाश!' : pct >= 50 ? '👍 ठीक है' : '💪 कोशिश करें'}
              </span>
            </div>

            <div className="test-mode__compare">
              <div className="test-mode__compare-row">
                <span className="test-mode__compare-label">सही उत्तर:</span>
                <span lang="hi" className="test-mode__compare-expected">{result.eval.expected}</span>
              </div>
              <div className="test-mode__compare-row">
                <span className="test-mode__compare-label">आपने कहा:</span>
                <span lang="hi" className="test-mode__compare-heard">{result.heard || NO_AUDIO_TEXT}</span>
              </div>
              <div className="test-mode__compare-row">
                <div className="test-mode__compare-heading">
                  <span className="test-mode__compare-label">शब्द-दर-शब्द सुधार:</span>
                  {!editingResult && (
                    <button
                      type="button"
                      className="tb-action-btn"
                      onClick={() => { setResultEditValue(result.eval.corrected); setEditingResult(true); setResultSaveMsg(''); }}
                      aria-label="सुधार संपादित करें"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                      </svg>
                      <span>सुधारें</span>
                    </button>
                  )}
                </div>

                {editingResult ? (
                  <div className="transcript-edit test-mode__edit">
                    <textarea
                      ref={resultEditRef}
                      className="transcript-edit__area test-mode__edit-area"
                      value={resultEditValue}
                      onChange={(e) => setResultEditValue(e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(result, e)}
                      lang="hi"
                      dir="auto"
                      rows={isLetterPhase ? 1 : 3}
                      aria-label="सुधार संपादित करें"
                    />
                    <p className="transcript-edit__hint">Ctrl+Enter — सहेजें · Esc — रद्द</p>
                    <div className="transcript-edit__btns">
                      <button
                        type="button"
                        className="transcript-edit__save"
                        onClick={() => { void saveResultEdit(result); }}
                        disabled={savingResult || !resultEditValue.trim()}
                      >
                        {savingResult ? 'सहेजा जा रहा है…' : '✓ सहेजें और याद रखें'}
                      </button>
                      <button type="button" className="transcript-edit__cancel" onClick={() => { setResultEditValue(result.eval.corrected); setEditingResult(false); }}>
                        रद्द करें
                      </button>
                    </div>
                  </div>
                ) : (
                  <span lang="hi" className="test-mode__compare-corrected">{result.eval.corrected || NO_AUDIO_TEXT}</span>
                )}
              </div>
            </div>

            <p className="test-mode__learn-note">
              {result.saved
                ? 'उच्चारण/शब्द सुधार सहेज लिया गया — autocorrect इसे याद रखेगा।'
                : isLetterPhase
                  ? 'आपकी उच्चारण प्रोफ़ाइल अपडेट हुई।'
                  : phase === 'phase2'
                    ? 'Autocorrect ने शब्दों को जोड़कर सार्थक वाक्य बनाया।'
                    : 'Autocorrect ने पड़ोसी शब्दों से जोड़कर पूरा सार्थक पैराग्राफ बनाया।'}
            </p>
            {resultSaveMsg && <p className="test-mode__learn-note">{resultSaveMsg}</p>}

            <button
              type="button"
              className="test-mode__btn test-mode__btn--primary"
              onClick={handleNext}
            >
              {getNextLabel()}
            </button>
          </div>
        );
      })()}

      {/* ─── DONE — Final score ────────────────────────────────────── */}
      {phase === 'done' && (
        <div className="test-mode__section">
          <div className="test-mode__final-score">
            <span className="test-mode__final-pct">{totalScore}%</span>
            <span className="test-mode__final-label">
              {totalScore >= 80 ? '🌟 बहुत अच्छे!' : totalScore >= 50 ? '👍 अच्छी कोशिश' : '💪 अभ्यास जारी रखें'}
            </span>
          </div>

          {engResults.length > 0 && (
            <>
              <h3 className="test-mode__results-heading">चरण 1(a) — English A–Z</h3>
              <div className="test-mode__results-list">
                {engResults.map((result, index) => {
                  const pct = result.eval.score;
                  const col = pct >= 80 ? '#4caf8a' : pct >= 50 ? '#f0a050' : '#c45050';
                  return (
                    <div key={`e-${result.question.id}`} className="test-mode__result-row">
                      <span className="test-mode__result-num">{index + 1}.</span>
                      <span className="test-mode__result-text">{result.question.letter}</span>
                      <span lang="hi" className="test-mode__result-text">{result.question.example}</span>
                      <span className="test-mode__result-score" style={{ color: col }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {hiResults.length > 0 && (
            <>
              <h3 className="test-mode__results-heading">चरण 1(b) — हिंदी वर्णमाला</h3>
              <div className="test-mode__results-list">
                {hiResults.map((result, index) => {
                  const pct = result.eval.score;
                  const col = pct >= 80 ? '#4caf8a' : pct >= 50 ? '#f0a050' : '#c45050';
                  return (
                    <div key={`h-${result.question.id}`} className="test-mode__result-row">
                      <span className="test-mode__result-num">{index + 1}.</span>
                      <span className="test-mode__result-text" lang="hi">{result.question.letter}</span>
                      <span lang="hi" className="test-mode__result-text">{result.question.example}</span>
                      <span className="test-mode__result-score" style={{ color: col }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {sentResults.length > 0 && (
            <>
              <h3 className="test-mode__results-heading">चरण 2 — वाक्य</h3>
              <div className="test-mode__results-list">
                {sentResults.map((result, index) => {
                  const pct = result.eval.score;
                  const col = pct >= 80 ? '#4caf8a' : pct >= 50 ? '#f0a050' : '#c45050';
                  return (
                    <div key={`s-${result.question.id}`} className="test-mode__result-row">
                      <span className="test-mode__result-num">{index + 1}.</span>
                      <span lang="hi" className="test-mode__result-text">{result.question.hindi}</span>
                      <span className="test-mode__result-score" style={{ color: col }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {paraResults.length > 0 && (
            <>
              <h3 className="test-mode__results-heading">चरण 3 — पैराग्राफ</h3>
              <div className="test-mode__results-list">
                {paraResults.map((result, index) => {
                  const pct = result.eval.score;
                  const col = pct >= 80 ? '#4caf8a' : pct >= 50 ? '#f0a050' : '#c45050';
                  return (
                    <div key={`p-${result.question.id}`} className="test-mode__result-row">
                      <span className="test-mode__result-num">{index + 1}.</span>
                      <span lang="hi" className="test-mode__result-text">{result.question.hindi}</span>
                      <span className="test-mode__result-score" style={{ color: col }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="test-mode__done-btns">
            <button type="button" className="test-mode__btn test-mode__btn--primary" onClick={() => { void startTest(); }}>
              फिर से परीक्षा दें
            </button>
            <button type="button" className="test-mode__btn test-mode__btn--secondary" onClick={onClose}>
              वापस जाएँ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
