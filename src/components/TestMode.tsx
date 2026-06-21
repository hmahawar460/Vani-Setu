import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { transcribeAudio } from '../services/groq';
import { saveCorrection } from '../services/corrections';
import { speak, stopSpeaking } from '../services/speechSynthesis';
import { evaluateAnswer, fetchTestQuestions, type EvalResult, type TestQuestion } from '../services/testService';

interface TestModeProps {
  onClose: () => void;
}

type TestStage = 'intro' | 'listening' | 'recording' | 'evaluating' | 'result' | 'done';

interface QuestionResult {
  question: TestQuestion;
  heard: string;
  eval: EvalResult;
  saved?: boolean;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy:   '🟢 आसान',
  medium: '🟡 मध्यम',
  hard:   '🔴 कठिन',
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
  const [stage,      setStage]      = useState<TestStage>('intro');
  const [questions,  setQuestions]  = useState<TestQuestion[]>([]);
  const [current,    setCurrent]    = useState(0);
  const [results,    setResults]    = useState<QuestionResult[]>([]);
  const [statusMsg,  setStatusMsg]  = useState('');
  const [countdown,  setCountdown]  = useState(0);
  const [editingResult, setEditingResult] = useState(false);
  const [resultEditValue, setResultEditValue] = useState('');
  const [savingResult, setSavingResult] = useState(false);
  const [resultSaveMsg, setResultSaveMsg] = useState('');

  const { startRecording, stopRecording } = useAudioRecorder();
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const questionsRef = useRef<TestQuestion[]>([]);
  const currentRef = useRef(0);
  const resultsRef = useRef<QuestionResult[]>([]);
  const recordingQuestionRef = useRef<TestQuestion | null>(null);
  const stoppingRef = useRef(false);
  const resultEditRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { questionsRef.current = questions; }, [questions]);
  useEffect(() => { currentRef.current = current; }, [current]);
  useEffect(() => { resultsRef.current = results; }, [results]);

  useEffect(() => {
    if (editingResult) resultEditRef.current?.focus();
  }, [editingResult]);

  useEffect(() => {
    return () => {
      clearCountdown();
      clearAutoStop();
      stopSpeaking();
    };
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

  async function stopCapture() {
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    clearAutoStop();
    setStage('evaluating');
    setStatusMsg('जाँच हो रही है…');

    try {
      const question = recordingQuestionRef.current ?? questionsRef.current[currentRef.current];
      if (!question) throw new Error('No active question');

      const blob = await stopRecording();
      const heard = await transcribeAudio(blob);
      const evalResult = await evaluateAnswer(question, heard);

      const nextResult: QuestionResult = { question, heard, eval: evalResult };
      setResults((prev) => {
        const withoutDuplicate = prev.filter((item) => item.question.id !== question.id);
        return [...withoutDuplicate, nextResult];
      });
      setResultEditValue(evalResult.corrected);
      setEditingResult(false);
      setResultSaveMsg('');
      setStage('result');
    } catch {
      const question = recordingQuestionRef.current ?? questionsRef.current[currentRef.current];
      if (question) {
        const fallbackResult: QuestionResult = {
          question,
          heard: '',
          eval: { score: 0, corrected: '', expected: question.hindi, questionId: question.id },
        };
        setResults((prev) => [
          ...prev.filter((item) => item.question.id !== question.id),
          fallbackResult,
        ]);
        setResultEditValue('');
        setEditingResult(false);
      }
      setStatusMsg('मूल्यांकन में समस्या। अगले सवाल पर जाएँ।');
      setStage('result');
    } finally {
      stoppingRef.current = false;
      recordingQuestionRef.current = null;
    }
  }

  async function startCapture(question: TestQuestion) {
    clearAutoStop();
    recordingQuestionRef.current = question;
    setStage('recording');
    setStatusMsg('बोलें…');

    try {
      await startRecording();
      autoStopRef.current = setTimeout(() => { void stopCapture(); }, 6000);
    } catch {
      setStatusMsg('माइक एक्सेस नहीं मिला।');
      setStage('listening');
    }
  }

  async function readQuestion(question: TestQuestion) {
    clearCountdown();
    clearAutoStop();
    recordingQuestionRef.current = question;
    setStage('listening');
    setCountdown(0);
    setStatusMsg('सुनें और फिर बोलें…');
    stopSpeaking();

    try {
      await speak(`अब यह वाक्य बोलें: ${question.hindi}`, 0.82);
    } catch { /* ignore TTS errors */ }

    setCountdown(3);
    let count = 3;
    countdownRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearCountdown();
        void startCapture(question);
      }
    }, 1000);
  }

  async function startTest() {
    setStatusMsg('सवाल लोड हो रहे हैं…');
    setEditingResult(false);
    setResultSaveMsg('');

    try {
      const nextQuestions = await fetchTestQuestions(5);
      questionsRef.current = nextQuestions;
      currentRef.current = 0;
      resultsRef.current = [];
      setQuestions(nextQuestions);
      setCurrent(0);
      setResults([]);
      setStage('listening');
      if (nextQuestions[0]) {
        setTimeout(() => { void readQuestion(nextQuestions[0]); }, 400);
      }
    } catch {
      setStatusMsg('सवाल लोड नहीं हो सके। दोबारा कोशिश करें।');
    }
  }

  function nextQuestion() {
    const next = currentRef.current + 1;
    setEditingResult(false);
    setResultSaveMsg('');

    if (next >= questionsRef.current.length) {
      setStage('done');
      return;
    }

    currentRef.current = next;
    setCurrent(next);
    void readQuestion(questionsRef.current[next]);
  }

  function startResultEdit(result: QuestionResult) {
    setResultEditValue(result.eval.corrected);
    setEditingResult(true);
    setResultSaveMsg('');
  }

  function cancelResultEdit(result: QuestionResult) {
    setResultEditValue(result.eval.corrected);
    setEditingResult(false);
    setResultSaveMsg('');
  }

  async function saveResultEdit(result: QuestionResult) {
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

      setResults((prev) => prev.map((item) => (
        item.question.id === result.question.id
          ? { ...item, eval: updatedEval, saved: true }
          : item
      )));
      setResultSaveMsg('सहेज लिया गया — अगली बार यही सुधार इस्तेमाल होगा।');
      setEditingResult(false);
    } catch {
      setResultSaveMsg('सहेजने में समस्या हुई।');
    } finally {
      setSavingResult(false);
    }
  }

  function handleEditKeyDown(result: QuestionResult, event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void saveResultEdit(result);
    }
    if (event.key === 'Escape') cancelResultEdit(result);
  }

  const totalScore = results.length > 0
    ? Math.round(results.reduce((sum, result) => sum + result.eval.score, 0) / results.length)
    : 0;

  const currentQ = questions[current];

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

      {stage === 'intro' && (
        <div className="test-mode__section">
          <p className="test-mode__desc">
            इस परीक्षा में <strong>5 हिंदी वाक्य</strong> दिए जाएँगे।<br />
            हर वाक्य पहले <strong>बोलकर सुनाया जाएगा</strong>।<br />
            फिर आपको उसे <strong>माइक में बोलना</strong> है।<br />
            आपकी आवाज़ को autocorrect किया जाएगा और score दिया जाएगा।
          </p>
          <p className="test-mode__desc test-mode__desc--small">
            गलत पहचाने गए शब्द आपके सुधार सहेजने पर आपकी निजी DB में रहेंगे, ताकि अगली बार सुधार बेहतर हो।
          </p>
          <button type="button" className="test-mode__btn test-mode__btn--primary" onClick={() => { void startTest(); }}>
            परीक्षा शुरू करें →
          </button>
          {statusMsg && <p className="test-mode__status">{statusMsg}</p>}
        </div>
      )}

      {(stage === 'listening' || stage === 'recording' || stage === 'evaluating') && currentQ && (
        <div className="test-mode__section">
          <div className="test-mode__progress">
            सवाल {current + 1} / {questions.length}
            <span className="test-mode__diff">{DIFFICULTY_LABEL[currentQ.difficulty]}</span>
          </div>

          <div className="test-mode__question" lang="hi">
            {currentQ.hindi}
          </div>

          <div className={`test-mode__mic-state ${stage === 'recording' ? 'test-mode__mic-state--active' : ''}`}>
            {stage === 'listening' && countdown > 0 && (
              <span className="test-mode__countdown">{countdown} में शुरू…</span>
            )}
            {stage === 'listening' && countdown === 0 && <span>{statusMsg}</span>}
            {stage === 'recording' && (
              <>
                <span className="test-mode__rec-dot" aria-hidden="true" />
                <span>बोल रहे हैं…</span>
                <button
                  type="button"
                  className="test-mode__btn test-mode__btn--stop"
                  onClick={() => { void stopCapture(); }}
                >रोकें ⏹</button>
              </>
            )}
            {stage === 'evaluating' && <span>⏳ {statusMsg}</span>}
          </div>

          <button
            type="button"
            className="test-mode__btn test-mode__btn--secondary"
            onClick={() => { void readQuestion(currentQ); }}
            disabled={stage === 'recording' || stage === 'evaluating'}
          >
            🔊 दोबारा सुनें
          </button>
        </div>
      )}

      {stage === 'result' && results.length > 0 && (() => {
        const result = results[results.length - 1];
        const pct = result.eval.score;
        const color = pct >= 80 ? '#4caf8a' : pct >= 50 ? '#f0a050' : '#c45050';

        return (
          <div className="test-mode__section">
            <div className="test-mode__progress">
              सवाल {current + 1} / {questions.length}
            </div>

            <div className="test-mode__score" style={{ color }}>
              {pct}%
              <span className="test-mode__score-label">
                {pct >= 80 ? '🌟 शाबाश!' : pct >= 50 ? '👍 ठीक है' : '💪 कोशिश करें'}
              </span>
            </div>

            <div className="test-mode__compare">
              <div className="test-mode__compare-row">
                <span className="test-mode__compare-label">सही वाक्य:</span>
                <span lang="hi" className="test-mode__compare-expected">{result.eval.expected}</span>
              </div>
              <div className="test-mode__compare-row">
                <span className="test-mode__compare-label">आपने कहा:</span>
                <span lang="hi" className="test-mode__compare-heard">{result.heard || NO_AUDIO_TEXT}</span>
              </div>
              <div className="test-mode__compare-row">
                <div className="test-mode__compare-heading">
                  <span className="test-mode__compare-label">सुधरा हुआ:</span>
                  {!editingResult && (
                    <button
                      type="button"
                      className="tb-action-btn"
                      onClick={() => startResultEdit(result)}
                      aria-label="सुधरा हुआ वाक्य संपादित करें"
                      title="सुधारें"
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
                      onChange={(event) => setResultEditValue(event.target.value)}
                      onKeyDown={(event) => handleEditKeyDown(result, event)}
                      lang="hi"
                      dir="auto"
                      rows={3}
                      aria-label="सुधरा हुआ वाक्य संपादित करें"
                    />
                    <p className="transcript-edit__hint">
                      Ctrl+Enter — सहेजें &nbsp;·&nbsp; Esc — रद्द करें
                    </p>
                    <div className="transcript-edit__btns">
                      <button
                        type="button"
                        className="transcript-edit__save"
                        onClick={() => { void saveResultEdit(result); }}
                        disabled={savingResult || !resultEditValue.trim()}
                      >
                        {savingResult ? 'सहेजा जा रहा है…' : '✓ सहेजें और याद रखें'}
                      </button>
                      <button
                        type="button"
                        className="transcript-edit__cancel"
                        onClick={() => cancelResultEdit(result)}
                      >
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
                ? 'सुधार आपकी निजी DB में सहेज लिया गया है।'
                : 'ज़रूरत हो तो सुधरा हुआ वाक्य सुधारकर सहेजें, ताकि अगली बार आपकी DB बेहतर काम करे।'}
            </p>
            {resultSaveMsg && <p className="test-mode__learn-note">{resultSaveMsg}</p>}

            <button
              type="button"
              className="test-mode__btn test-mode__btn--primary"
              onClick={nextQuestion}
            >
              {current + 1 < questions.length ? 'अगला सवाल →' : 'परिणाम देखें →'}
            </button>
          </div>
        );
      })()}

      {stage === 'done' && (
        <div className="test-mode__section">
          <div className="test-mode__final-score">
            <span className="test-mode__final-pct">{totalScore}%</span>
            <span className="test-mode__final-label">
              {totalScore >= 80 ? '🌟 बहुत अच्छे!' : totalScore >= 50 ? '👍 अच्छी कोशिश' : '💪 अभ्यास जारी रखें'}
            </span>
          </div>

          <div className="test-mode__results-list">
            {results.map((result, index) => {
              const pct = result.eval.score;
              const col = pct >= 80 ? '#4caf8a' : pct >= 50 ? '#f0a050' : '#c45050';
              return (
                <div key={result.question.id} className="test-mode__result-row">
                  <span className="test-mode__result-num">{index + 1}.</span>
                  <span lang="hi" className="test-mode__result-text">{result.question.hindi}</span>
                  <span className="test-mode__result-score" style={{ color: col }}>{pct}%</span>
                </div>
              );
            })}
          </div>

          <p className="test-mode__learn-note">
            जो सुधार आपने सहेजे हैं, वे आपकी निजी DB में रहेंगे और अगली बार autocorrect बेहतर करेंगे।
          </p>

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
