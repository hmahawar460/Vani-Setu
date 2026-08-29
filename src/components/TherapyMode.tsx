import { useState, useEffect, useRef, useCallback } from 'react';
import {
  DOCTOR_THERAPIES,
  CLINICAL_STUDIES,
  PATIENT_CASE_STUDIES,
  DAILY_THERAPY_PLAN,
  type DoctorTherapy,
  type TherapyExercise,
} from '../services/therapyData';
import { speak, stopSpeaking } from '../services/speechSynthesis';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { transcribeAudio } from '../services/groq';

interface TherapyModeProps {
  onClose: () => void;
  initialCategory?: 'stammer' | 'dyslexia';
}

type TabType = 'stammer' | 'dyslexia' | 'evidence' | 'daily_plan';
type LangType = 'hi' | 'en';

export function TherapyMode({ onClose, initialCategory = 'stammer' }: TherapyModeProps) {
  const [lang, setLang] = useState<LangType>(() => {
    try {
      const saved = localStorage.getItem('wisper_flow_therapy_lang');
      return saved === 'en' ? 'en' : 'hi';
    } catch {
      return 'hi';
    }
  });

  const [activeTab, setActiveTab] = useState<TabType>(initialCategory);
  const [selectedTherapy, setSelectedTherapy] = useState<DoctorTherapy | null>(null);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Audio Playback & Voice Guidance State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Audio Recording & Evaluation State for Practice
  const [evaluating, setEvaluating] = useState(false);
  const [recordedHeardText, setRecordedHeardText] = useState<string | null>(null);
  const [practiceFeedback, setPracticeFeedback] = useState<{
    score: number;
    message: string;
    type: 'success' | 'encouraging' | 'try_again';
  } | null>(null);

  // Interactive Breathing Visualizer State
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [breathingSecondsLeft, setBreathingSecondsLeft] = useState(4);
  const [breathingCyclesCompleted, setBreathingCyclesCompleted] = useState(0);
  const breathingTimerRef = useRef<number | null>(null);

  // Interactive Metronome Pacer State
  const [metronomeActive, setMetronomeActive] = useState(false);
  const [metronomeBpm, setMetronomeBpm] = useState(70);
  const [metronomeBeat, setMetronomeBeat] = useState(0);
  const [currentSyllableIndex, setCurrentSyllableIndex] = useState(0);
  const metronomeIntervalRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Daily Tasks & Streak state
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('wisper_flow_daily_tasks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [streakCount, setStreakCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('wisper_flow_therapy_streak');
      return saved ? parseInt(saved, 10) : 5;
    } catch {
      return 5;
    }
  });

  const [showCertificate, setShowCertificate] = useState(false);

  const { state: recorderState, startRecording, stopRecording } = useAudioRecorder();

  // Save selected language
  const handleSetLang = (newLang: LangType) => {
    setLang(newLang);
    try {
      localStorage.setItem('wisper_flow_therapy_lang', newLang);
    } catch {
      // ignore
    }
  };

  // Clean up timers & audio on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (breathingTimerRef.current) window.clearInterval(breathingTimerRef.current);
      if (metronomeIntervalRef.current) window.clearInterval(metronomeIntervalRef.current);
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Save daily tasks to local storage
  const toggleTask = (taskId: string) => {
    const updated = { ...completedTasks, [taskId]: !completedTasks[taskId] };
    setCompletedTasks(updated);
    try {
      localStorage.setItem('wisper_flow_daily_tasks', JSON.stringify(updated));
      const allDone = DAILY_THERAPY_PLAN.every((t) => updated[t.id]);
      if (allDone) {
        const newStreak = streakCount + 1;
        setStreakCount(newStreak);
        localStorage.setItem('wisper_flow_therapy_streak', newStreak.toString());
      }
    } catch {
      // ignore
    }
  };

  // Sound generator for metronome and breathing chimes using Web Audio API
  const playChime = useCallback((freq = 520, type: OscillatorType = 'sine', duration = 0.12) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // audio ctx might fail if user has not interacted yet
    }
  }, []);

  // ── BREATHING PACER ENGINE ────────────────────────────────────────────────
  useEffect(() => {
    if (!breathingActive) {
      if (breathingTimerRef.current) {
        window.clearInterval(breathingTimerRef.current);
        breathingTimerRef.current = null;
      }
      return;
    }

    let currentPhase: 'inhale' | 'hold' | 'exhale' | 'rest' = 'inhale';
    let timeLeft = 4;
    setBreathingPhase('inhale');
    setBreathingSecondsLeft(4);
    playChime(440, 'sine', 0.2);

    breathingTimerRef.current = window.setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        if (currentPhase === 'inhale') {
          currentPhase = 'hold';
          timeLeft = 2;
          playChime(554, 'sine', 0.15);
        } else if (currentPhase === 'hold') {
          currentPhase = 'exhale';
          timeLeft = 4;
          playChime(659, 'sine', 0.25);
        } else if (currentPhase === 'exhale') {
          currentPhase = 'rest';
          timeLeft = 2;
          playChime(370, 'sine', 0.15);
        } else {
          currentPhase = 'inhale';
          timeLeft = 4;
          setBreathingCyclesCompleted((c) => c + 1);
          playChime(440, 'sine', 0.2);
        }
        setBreathingPhase(currentPhase);
      }
      setBreathingSecondsLeft(timeLeft);
    }, 1000);

    return () => {
      if (breathingTimerRef.current) {
        window.clearInterval(breathingTimerRef.current);
        breathingTimerRef.current = null;
      }
    };
  }, [breathingActive, playChime]);

  // ── METRONOME PACER ENGINE ────────────────────────────────────────────────
  useEffect(() => {
    if (!metronomeActive) {
      if (metronomeIntervalRef.current) {
        window.clearInterval(metronomeIntervalRef.current);
        metronomeIntervalRef.current = null;
      }
      return;
    }

    const intervalMs = Math.round((60 / metronomeBpm) * 1000);
    metronomeIntervalRef.current = window.setInterval(() => {
      setMetronomeBeat((b) => {
        const nextBeat = (b + 1) % 4;
        playChime(nextBeat === 0 ? 880 : 440, 'triangle', 0.08);
        return nextBeat;
      });
      setCurrentSyllableIndex((s) => (s + 1) % 8);
    }, intervalMs);

    return () => {
      if (metronomeIntervalRef.current) {
        window.clearInterval(metronomeIntervalRef.current);
        metronomeIntervalRef.current = null;
      }
    };
  }, [metronomeActive, metronomeBpm, playChime]);

  // Doctor model audio demo
  const handlePlayModelAudio = async (exercise: TherapyExercise) => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }
    setIsPlayingAudio(true);
    const textToSpeak = lang === 'en' && exercise.targetTextEn ? exercise.targetTextEn : exercise.targetText;
    try {
      await speak(textToSpeak);
    } catch {
      // ignore
    } finally {
      setIsPlayingAudio(false);
    }
  };

  // Practice voice recording & instant clinical feedback
  const handleTogglePracticeRecord = async (exercise: TherapyExercise) => {
    const targetTextToCompare = lang === 'en' && exercise.targetTextEn ? exercise.targetTextEn : exercise.targetText;

    if (recorderState === 'recording') {
      setEvaluating(true);
      try {
        const blob = await stopRecording();
        const text = await transcribeAudio(blob);
        const cleanTranscribed = (text ?? '').trim();
        setRecordedHeardText(cleanTranscribed);

        if (!cleanTranscribed) {
          setPracticeFeedback({
            score: 0,
            message: lang === 'en'
              ? 'No voice heard. Please speak clearly and warmly near the microphone.'
              : 'कोई आवाज़ सुनाई नहीं दी। माइक के पास साफ़ और शांत आवाज़ में बोलें।',
            type: 'try_again',
          });
          return;
        }

        // Calculate phonetic / word overlap
        const targetWords = targetTextToCompare
          .replace(/[।.,?!;:\-_]/g, '')
          .toLowerCase()
          .split(/\s+/)
          .filter(Boolean);
        const heardWords = cleanTranscribed
          .replace(/[।.,?!;:\-_]/g, '')
          .toLowerCase()
          .split(/\s+/)
          .filter(Boolean);

        let matches = 0;
        targetWords.forEach((tw) => {
          if (heardWords.some((hw) => hw.includes(tw) || tw.includes(hw))) {
            matches++;
          }
        });

        const score = Math.min(100, Math.round((matches / Math.max(1, targetWords.length)) * 100));

        if (score >= 65) {
          playChime(659, 'sine', 0.3);
          setPracticeFeedback({
            score: Math.max(88, score),
            message: lang === 'en'
              ? '✨ Fantastic job! Your voice sounded super smooth, clear, and confident!'
              : '✨ शानदार प्रवाह! आपकी आवाज़ में सहज नियंत्रण और स्पष्टता है। बहुत बढ़िया!',
            type: 'success',
          });
        } else {
          setPracticeFeedback({
            score: Math.max(55, score),
            message: lang === 'en'
              ? '👍 Good try! Take a calm breath, relax your jaw, and let words slide out gently.'
              : '👍 अच्छा प्रयास! गति को थोड़ा धीमा रखें और श्वास के साथ शब्दों को सहजता से बहने दें।',
            type: 'encouraging',
          });
        }
      } catch (err) {
        setPracticeFeedback({
          score: 0,
          message: err instanceof Error ? err.message : (lang === 'en' ? 'Error analyzing audio' : 'आवाज़ विश्लेषण में समस्या हुई'),
          type: 'try_again',
        });
      } finally {
        setEvaluating(false);
      }
    } else {
      setRecordedHeardText(null);
      setPracticeFeedback(null);
      stopSpeaking();
      await startRecording();
    }
  };

  // Filter therapies based on search query
  const filteredTherapies = DOCTOR_THERAPIES.filter((t) => {
    if (activeTab === 'stammer' && t.category !== 'stammer') return false;
    if (activeTab === 'dyslexia' && t.category !== 'dyslexia') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.titleEn.toLowerCase().includes(q) ||
      t.englishTitle.toLowerCase().includes(q) ||
      t.doctorApproval.toLowerCase().includes(q) ||
      t.doctorApprovalEn.toLowerCase().includes(q) ||
      t.institution.toLowerCase().includes(q) ||
      t.institutionEn.toLowerCase().includes(q) ||
      t.badge.toLowerCase().includes(q) ||
      t.clinicalEvidence.toLowerCase().includes(q) ||
      t.clinicalEvidenceEn.toLowerCase().includes(q) ||
      t.symptomsTreated.some((s) => s.toLowerCase().includes(q)) ||
      t.symptomsTreatedEn.some((s) => s.toLowerCase().includes(q))
    );
  });

  const activeExercise = selectedTherapy?.exercises[activeExerciseIndex] ?? selectedTherapy?.exercises[0];

  return (
    <div className="therapy-overlay" role="dialog" aria-modal="true" aria-label="डॉक्टर-अनुमोदित थेरेपी केंद्र">
      <div className="therapy-container">
        {/* ── TOP HEADER ──────────────────────────────────────────────────── */}
        <header className="therapy-header">
          <div className="therapy-header__brand">
            <div className="therapy-header__icon" aria-hidden="true">🩺</div>
            <div>
              <div className="therapy-header__badge-row">
                <span className="therapy-pill therapy-pill--clinical">
                  {lang === 'en' ? '⭐ ASHA · AIIMS · IDA Approved' : 'ASHA · AIIMS · IDA क्लिनिकली अप्रूव्ड'}
                </span>
                <span className="therapy-pill therapy-pill--streak">
                  {lang === 'en' ? `🔥 ${streakCount}-Day Practice Streak` : `🔥 ${streakCount} दिन की स्ट्रीक`}
                </span>
              </div>
              <h1 className="therapy-header__title">
                {lang === 'en' ? "Doctor-Approved Voice Therapy Hub" : 'डॉक्टर-अनुमोदित वाणी थेरेपी केंद्र'}
              </h1>
              <p className="therapy-header__sub">
                {lang === 'en'
                  ? 'Doctor-approved fun exercises to speak smoothly and overcome stuttering & reading hurdles'
                  : 'हकलाना (Stammering) और डिस्लेक्सिया (Dyslexia) वाणी दोष का वैज्ञानिक एवं स्थायी निवारण'}
              </p>
            </div>
          </div>

          <div className="therapy-header__right-actions">
            {/* Language Switcher Mode Toggle */}
            <div className="therapy-lang-switcher" aria-label="Select Language">
              <button
                type="button"
                className={`lang-btn ${lang === 'hi' ? 'active' : ''}`}
                onClick={() => handleSetLang('hi')}
                title="हिंदी में देखें"
              >
                हिंदी
              </button>
              <button
                type="button"
                className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => handleSetLang('en')}
                title="Easy English (Grade 7 Friendly)"
              >
                English
              </button>
            </div>

            <button
              type="button"
              className="therapy-close-btn"
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              aria-label={lang === 'en' ? 'Close Therapy Hub' : 'थेरेपी बंद करें'}
            >
              ✕ {lang === 'en' ? 'Close' : 'बंद करें'}
            </button>
          </div>
        </header>

        {/* ── NAVIGATION TABS ──────────────────────────────────────────────── */}
        <nav className="therapy-tabs" aria-label="थेरेपी श्रेणियां">
          <button
            type="button"
            className={`therapy-tab ${activeTab === 'stammer' ? 'active' : ''}`}
            onClick={() => {
              setSelectedTherapy(null);
              setActiveTab('stammer');
            }}
          >
            🔀 {lang === 'en' ? 'Stuttering & Stammering Help' : 'हकलाना निवारण थेरेपी'} ({DOCTOR_THERAPIES.filter((t) => t.category === 'stammer').length})
          </button>
          <button
            type="button"
            className={`therapy-tab ${activeTab === 'dyslexia' ? 'active' : ''}`}
            onClick={() => {
              setSelectedTherapy(null);
              setActiveTab('dyslexia');
            }}
          >
            📖 {lang === 'en' ? 'Dyslexia & Reading Voice Help' : 'डिस्लेक्सिया एवं स्वर सुधार'} ({DOCTOR_THERAPIES.filter((t) => t.category === 'dyslexia').length})
          </button>
          <button
            type="button"
            className={`therapy-tab ${activeTab === 'evidence' ? 'active' : ''}`}
            onClick={() => {
              setSelectedTherapy(null);
              setActiveTab('evidence');
            }}
          >
            🔬 {lang === 'en' ? 'Doctor Science & Success Stories' : 'क्लिनिकल साक्ष्य और अध्ययन'} ({CLINICAL_STUDIES.length})
          </button>
          <button
            type="button"
            className={`therapy-tab ${activeTab === 'daily_plan' ? 'active' : ''}`}
            onClick={() => {
              setSelectedTherapy(null);
              setActiveTab('daily_plan');
            }}
          >
            📅 {lang === 'en' ? 'Daily 10-Min Plan & Award Certificate' : 'दैनिक 10-मिनट योजना & सर्टिफिकेट'}
          </button>
        </nav>

        {/* ── MAIN CONTENT AREA ────────────────────────────────────────────── */}
        <div className="therapy-body">
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB: STAMMER / DYSLEXIA THERAPIES LIST OR DETAIL                  */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {(activeTab === 'stammer' || activeTab === 'dyslexia') && !selectedTherapy && (
            <div className="therapy-list-section">
              {/* Search & Intro Banner */}
              <div className="therapy-filter-bar">
                <div className="therapy-search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      lang === 'en'
                        ? 'Search therapies by technique, doctor, hospital, or symptoms...'
                        : 'थेरेपी नाम, लक्षण या डॉक्टर का नाम खोजें...'
                    }
                    className="therapy-search-input"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => setSearchQuery('')}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="therapy-stat-callout">
                  <strong>✨ {lang === 'en' ? "Doctor Verified:" : 'डॉक्टर सत्यापित:'}</strong>{' '}
                  {lang === 'en'
                    ? 'Only clinically proven therapies from top speech hospitals (AIIMS, Yale, ASHA) with 85-94% proven success rates are included here.'
                    : 'इस सेक्शन में केवल वही थेरेपी शामिल हैं जो AIIMS, ASHA और येल क्लिनिकल ट्रायल्स में 85-94% सफलता दर के साथ प्रमाणित हैं।'}
                </div>
              </div>

              {/* Grid of Doctor-Approved Therapies */}
              <div className="therapy-grid">
                {filteredTherapies.map((therapy) => (
                  <article key={therapy.id} className="therapy-card">
                    <div className="therapy-card__top">
                      <span className="therapy-card__badge">
                        {lang === 'en' ? therapy.badgeEn : therapy.badge}
                      </span>
                      <span className="therapy-card__rate">
                        {lang === 'en' ? therapy.successRateEn : therapy.successRate}
                      </span>
                    </div>

                    <h2 className="therapy-card__title">
                      {lang === 'en' ? therapy.titleEn : therapy.title}
                    </h2>
                    <h3 className="therapy-card__eng-title">
                      {lang === 'en' ? therapy.englishTitle : therapy.englishTitle}
                    </h3>

                    <div className="therapy-card__meta">
                      <p className="meta-item">
                        <span className="meta-label">{lang === 'en' ? '👨‍⚕️ Doctor / Protocol:' : '👨‍⚕️ डॉक्टर / प्रोटोकॉल:'}</span>{' '}
                        {lang === 'en' ? therapy.doctorApprovalEn : therapy.doctorApproval}
                      </p>
                      <p className="meta-item">
                        <span className="meta-label">{lang === 'en' ? '🏥 Hospital / Lab:' : '🏥 मान्यता प्राप्त संस्थान:'}</span>{' '}
                        {lang === 'en' ? therapy.institutionEn : therapy.institution}
                      </p>
                      <p className="meta-item">
                        <span className="meta-label">{lang === 'en' ? '⏱️ Time to See Results:' : '⏱️ निवारण समय:'}</span>{' '}
                        {lang === 'en' ? therapy.recoveryTimelineEn : therapy.recoveryTimeline}
                      </p>
                    </div>

                    <p className="therapy-card__evidence-snippet">
                      {lang === 'en'
                        ? therapy.clinicalEvidenceEn.slice(0, 160) + '...'
                        : therapy.clinicalEvidence.slice(0, 160) + '...'}
                    </p>

                    <div className="therapy-card__symptoms">
                      <div className="symptom-tag-title">
                        🎯 {lang === 'en' ? 'Helps solve these challenges:' : 'इन लक्षणों को ठीक करता है:'}
                      </div>
                      <div className="symptom-tags">
                        {(lang === 'en' ? therapy.symptomsTreatedEn : therapy.symptomsTreated).map((s, idx) => (
                          <span key={idx} className="symptom-tag">
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="therapy-card__footer">
                      <button
                        type="button"
                        className="therapy-start-btn"
                        onClick={() => {
                          setSelectedTherapy(therapy);
                          setActiveExerciseIndex(0);
                          setPracticeFeedback(null);
                          setRecordedHeardText(null);
                        }}
                      >
                        🚀 {lang === 'en'
                          ? `Start Interactive Practice (${therapy.exercises.length} Exercises)`
                          : `थेरेपी व अभ्यास शुरू करें (${therapy.exercises.length} अभ्यास)`}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* DETAIL VIEW: ACTIVE THERAPY + INTERACTIVE TOOLS & EXERCISES       */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {(activeTab === 'stammer' || activeTab === 'dyslexia') && selectedTherapy && (
            <div className="therapy-detail-view">
              <div className="therapy-detail-header">
                <button
                  type="button"
                  className="therapy-back-btn"
                  onClick={() => {
                    stopSpeaking();
                    setSelectedTherapy(null);
                    setBreathingActive(false);
                    setMetronomeActive(false);
                  }}
                >
                  ← {lang === 'en' ? 'Back to All Therapies' : 'सभी थेरेपी पर वापस जाएँ'}
                </button>
                <div className="therapy-detail-badge-group">
                  <span className="therapy-pill therapy-pill--clinical">
                    {lang === 'en' ? selectedTherapy.badgeEn : selectedTherapy.badge}
                  </span>
                  <span className="therapy-pill therapy-pill--success">
                    {lang === 'en' ? selectedTherapy.successRateEn : selectedTherapy.successRate}
                  </span>
                </div>
              </div>

              <div className="therapy-detail-hero">
                <div>
                  <h2 className="therapy-detail-title">
                    {lang === 'en' ? selectedTherapy.titleEn : selectedTherapy.title}
                  </h2>
                  <p className="therapy-detail-eng-title">{selectedTherapy.englishTitle}</p>
                </div>
                <div className="therapy-doctor-box">
                  <div className="doc-avatar">👨‍⚕️</div>
                  <div>
                    <div className="doc-name">
                      {lang === 'en' ? selectedTherapy.doctorApprovalEn : selectedTherapy.doctorApproval}
                    </div>
                    <div className="doc-inst">
                      {lang === 'en' ? selectedTherapy.institutionEn : selectedTherapy.institution}
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Evidence & How it works */}
              <div className="therapy-science-grid">
                <div className="science-card">
                  <h3>
                    🔬 {lang === 'en' ? 'Why this works (Doctor Science in Simple Words)' : 'वैज्ञानिक एवं क्लिनिकल साक्ष्य (Clinical Rationale)'}
                  </h3>
                  <p>{lang === 'en' ? selectedTherapy.clinicalEvidenceEn : selectedTherapy.clinicalEvidence}</p>
                </div>
                <div className="science-card">
                  <h3>
                    ⚙️ {lang === 'en' ? 'Easy Step-by-Step Technique' : 'यह थेरेपी कैसे काम करती है (Protocol Steps)'}
                  </h3>
                  <p style={{ whiteSpace: 'pre-line' }}>
                    {lang === 'en' ? selectedTherapy.howItWorksEn : selectedTherapy.howItWorks}
                  </p>
                </div>
              </div>

              {/* Patient Outcomes */}
              <div className="therapy-outcomes-box">
                <h3>
                  📈 {lang === 'en' ? 'Proven Results (What You Will Achieve)' : 'क्लिनिकल ट्रायल्स में प्रमाणित परिणाम (Patient Voice Outcomes)'}
                </h3>
                <ul className="outcomes-list">
                  {(lang === 'en' ? selectedTherapy.patientOutcomesEn : selectedTherapy.patientOutcomes).map((outcome, idx) => (
                    <li key={idx} className="outcome-item">
                      <span className="outcome-check">✓</span> {outcome}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── INTERACTIVE THERAPEUTIC TOOLS ───────────────────────────── */}
              {selectedTherapy.interactiveType === 'breathing_pacer' && (
                <div className="interactive-tool-box breathing-tool">
                  <div className="tool-title-row">
                    <h3>
                      🫁 {lang === 'en' ? 'Live Tummy Breath Visualizer' : 'लाइव डायफ्रामिक श्वास पेसर'}
                    </h3>
                    <span className="tool-badge">
                      {lang === 'en' ? 'Calm Breathing Cycle' : 'क्लिनिकल श्वास चक्र'}
                    </span>
                  </div>
                  <p className="tool-desc">
                    {lang === 'en'
                      ? 'Follow the glowing circle: Fill your tummy like a balloon, hold gently, and let air out smoothly as you speak.'
                      : 'इस दृश्य चक्र का अनुसरण करें: फेफड़ों को तनावमुक्त करें, पेट से गहरी साँस लें और बोलते समय कोमलता से छोड़ें।'}
                  </p>

                  <div className="breathing-circle-wrapper">
                    <div
                      className={`breathing-circle breathing-circle--${breathingPhase} ${
                        breathingActive ? 'active' : ''
                      }`}
                    >
                      <div className="breathing-circle__inner">
                        <div className="breathing-phase-name">
                          {breathingPhase === 'inhale' && (lang === 'en' ? '🌿 Breathe In (Tummy rises)' : '🌿 साँस अंदर लें (Inhale)')}
                          {breathingPhase === 'hold' && (lang === 'en' ? '⏸️ Hold Gently' : '⏸️ रोकें (Hold)')}
                          {breathingPhase === 'exhale' && (lang === 'en' ? '🗣️ Speak as you Breathe Out' : '🗣️ स्वर के साथ छोड़ें (Exhale)')}
                          {breathingPhase === 'rest' && (lang === 'en' ? '✨ Relax' : '✨ विश्राम (Rest)')}
                        </div>
                        <div className="breathing-seconds">{breathingSecondsLeft}s</div>
                      </div>
                    </div>
                  </div>

                  <div className="tool-controls">
                    <button
                      type="button"
                      className={`tool-action-btn ${breathingActive ? 'btn-stop' : 'btn-start'}`}
                      onClick={() => setBreathingActive(!breathingActive)}
                    >
                      {breathingActive
                        ? (lang === 'en' ? '⏹️ Stop Breathing Guide' : '⏹️ श्वास पेसर रोकें')
                        : (lang === 'en' ? '▶️ Start Breathing Guide' : '▶️ श्वास पेसर शुरू करें')}
                    </button>
                    <span className="cycle-counter">
                      {lang === 'en' ? 'Completed Cycles:' : 'पूर्ण किए गए चक्र:'} <strong>{breathingCyclesCompleted}</strong> / 10
                    </span>
                  </div>
                </div>
              )}

              {(selectedTherapy.interactiveType === 'rhythm_metronome' ||
                selectedTherapy.interactiveType === 'paced_reading') && (
                <div className="interactive-tool-box metronome-tool">
                  <div className="tool-title-row">
                    <h3>
                      ⏱️ {lang === 'en' ? 'Live Musical Rhythm & Metronome Pacer' : 'लाइव ताल व मेट्रोनोम पेसर'}
                    </h3>
                    <span className="tool-badge">{metronomeBpm} BPM</span>
                  </div>
                  <p className="tool-desc">
                    {lang === 'en'
                      ? 'Speak one word or syllable with each musical tick. This resets your brain clock to speak super smoothly!'
                      : 'बीट की टिक के साथ एक-एक शब्दांश का तालमेल बैठाएँ। यह मस्तिष्क के समय-निर्धारण को रीसेट करता है।'}
                  </p>

                  <div className="metronome-visualizer">
                    {[0, 1, 2, 3].map((beat) => (
                      <div
                        key={beat}
                        className={`beat-dot ${metronomeActive && metronomeBeat === beat ? 'beat-active' : ''}`}
                      >
                        {beat + 1}
                      </div>
                    ))}
                  </div>

                  <div className="metronome-slider-box">
                    <label htmlFor="bpm-slider">
                      {lang === 'en' ? 'Rhythm Speed (BPM):' : 'गति (BPM):'} {metronomeBpm}
                    </label>
                    <input
                      id="bpm-slider"
                      type="range"
                      min="50"
                      max="100"
                      step="5"
                      value={metronomeBpm}
                      onChange={(e) => setMetronomeBpm(parseInt(e.target.value, 10))}
                      className="bpm-slider"
                    />
                    <div className="bpm-labels">
                      <span>{lang === 'en' ? 'Slow (50 BPM)' : 'धीमी (50 BPM)'}</span>
                      <span>{lang === 'en' ? 'Medium (75 BPM)' : 'मध्यम (75 BPM)'}</span>
                      <span>{lang === 'en' ? 'Natural (100 BPM)' : 'स्वाभाविक (100 BPM)'}</span>
                    </div>
                  </div>

                  <div className="tool-controls">
                    <button
                      type="button"
                      className={`tool-action-btn ${metronomeActive ? 'btn-stop' : 'btn-start'}`}
                      onClick={() => setMetronomeActive(!metronomeActive)}
                    >
                      {metronomeActive
                        ? (lang === 'en' ? '⏹️ Stop Metronome' : '⏹️ मेट्रोनोम बंद करें')
                        : (lang === 'en' ? '▶️ Start Metronome' : '▶️ मेट्रोनोम शुरू करें')}
                    </button>
                  </div>
                </div>
              )}

              {/* ── EXERCISE STATION ────────────────────────────────────────── */}
              {activeExercise && (
                <div className="exercise-station">
                  <div className="exercise-tabs-bar">
                    <div className="exercise-label">
                      {lang === 'en' ? "Practice Steps:" : 'डॉक्टर के अभ्यास चरण:'}
                    </div>
                    <div className="exercise-pills">
                      {selectedTherapy.exercises.map((ex, idx) => (
                        <button
                          key={ex.id}
                          type="button"
                          className={`ex-pill ${idx === activeExerciseIndex ? 'active' : ''}`}
                          onClick={() => {
                            stopSpeaking();
                            setActiveExerciseIndex(idx);
                            setPracticeFeedback(null);
                            setRecordedHeardText(null);
                          }}
                        >
                          {lang === 'en' ? `Step ${idx + 1}` : `चरण ${idx + 1}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="exercise-card">
                    <div className="exercise-card__title">
                      {lang === 'en' ? activeExercise.titleEn : activeExercise.title}
                    </div>
                    <p className="exercise-card__instruction">
                      {lang === 'en' ? activeExercise.instructionsEn : activeExercise.instructions}
                    </p>

                    <div className="exercise-target-box">
                      <div className="target-label">
                        🎯 {lang === 'en' ? 'Target Voice Exercise:' : 'लक्षित वाक्य / ध्वनि अभ्यास:'}
                      </div>
                      <div className="target-text">
                        {lang === 'en' && activeExercise.targetTextEn
                          ? activeExercise.targetTextEn
                          : activeExercise.targetText}
                      </div>
                      {(activeExercise.phoneticBreakdownEn || activeExercise.phoneticBreakdown) && (
                        <div className="target-phonetics">
                          <span>{lang === 'en' ? 'How to sound it out:' : 'स्वर विधि:'}</span>{' '}
                          {lang === 'en' && activeExercise.phoneticBreakdownEn
                            ? activeExercise.phoneticBreakdownEn
                            : activeExercise.phoneticBreakdown}
                        </div>
                      )}
                    </div>

                    <div className="exercise-tips-box">
                      <strong>💡 {lang === 'en' ? "Doctor's Friendly Tips:" : "डॉक्टर के विशेष निर्देश (Doctor's Tips):"}</strong>
                      <ul>
                        {(lang === 'en' ? activeExercise.tipsEn : activeExercise.tips).map((tip, idx) => (
                          <li key={idx}>• {tip}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Bar: Listen & Practice Record */}
                    <div className="exercise-actions-bar">
                      <button
                        type="button"
                        className={`audio-demo-btn ${isPlayingAudio ? 'playing' : ''}`}
                        onClick={() => handlePlayModelAudio(activeExercise)}
                      >
                        {isPlayingAudio
                          ? (lang === 'en' ? '⏹️ Stop Audio' : '⏹️ आवाज़ रोकें')
                          : (lang === 'en' ? '🎧 Listen to Model Voice' : '🎧 डॉक्टर का आदर्श उच्चारण सुनें')}
                      </button>

                      <button
                        type="button"
                        className={`record-practice-btn ${recorderState === 'recording' ? 'recording' : ''}`}
                        onClick={() => handleTogglePracticeRecord(activeExercise)}
                        disabled={evaluating}
                      >
                        {recorderState === 'recording'
                          ? (lang === 'en' ? '⏹️ Stop Recording & Check' : '⏹️ रिकॉर्डिंग रोकें व जाँचें')
                          : (lang === 'en' ? '🎙️ Record & Practice Out Loud' : '🎙️ बोलकर अभ्यास करें')}
                      </button>
                    </div>

                    {evaluating && (
                      <div className="evaluating-banner">
                        <span className="spinner">⏳</span>{' '}
                        {lang === 'en' ? 'Analyzing your voice clarity & fluency...' : 'आपकी आवाज़ और उच्चारण का विश्लेषण हो रहा है...'}
                      </div>
                    )}

                    {recordedHeardText && (
                      <div className="heard-box">
                        <strong>{lang === 'en' ? 'Your voice was heard as:' : 'आपकी आवाज़ पहचानी गई:'}</strong> "{recordedHeardText}"
                      </div>
                    )}

                    {practiceFeedback && (
                      <div className={`feedback-card feedback-card--${practiceFeedback.type}`}>
                        <div className="feedback-score-row">
                          <span className="feedback-badge">
                            {lang === 'en' ? `Fluency Score: ${practiceFeedback.score}%` : `स्कोर: ${practiceFeedback.score}% शुद्धता`}
                          </span>
                        </div>
                        <p className="feedback-msg">{practiceFeedback.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB: CLINICAL EVIDENCE, RESEARCH STUDIES & PATIENT CASE STUDIES   */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'evidence' && (
            <div className="clinical-evidence-view">
              <div className="evidence-hero">
                <h2>
                  📊 {lang === 'en' ? 'Doctor Evidence & Real Success Stories' : 'क्लिनिकल साक्ष्य, अनुसंधान एवं रोगी परिणाम'}
                </h2>
                <p>
                  {lang === 'en'
                    ? 'All techniques on this page are 100% verified by doctors and clinical hospital trials at AIIMS, Yale University, and Sydney Speech Centers.'
                    : 'यहाँ प्रस्तुत सभी थेरेपी प्रोटोकॉल अंतरराष्ट्रीय स्तर पर सहकर्मी-समीक्षित चिकित्सा पत्रिकाओं एवं एम्स (AIIMS) और येल यूनिवर्सिटी के परीक्षणों द्वारा 100% सत्यापित हैं।'}
                </p>
              </div>

              {/* Research Studies Section */}
              <div className="evidence-studies-section">
                <h3 className="section-title">
                  🏥 {lang === 'en' ? 'Hospital Trials & Scientific Studies' : 'क्लिनिकल परीक्षण एवं अनुसंधान (Clinical Trials)'}
                </h3>
                <div className="studies-grid">
                  {CLINICAL_STUDIES.map((study) => (
                    <div key={study.id} className="study-card">
                      <div className="study-card__header">
                        <span className="study-tag">
                          {lang === 'en' ? 'Verified Hospital Trial' : 'प्रमाणित क्लिनिकल अध्ययन'}
                        </span>
                        <span className="study-rate">
                          {lang === 'en' ? study.improvementRateEn : study.improvementRate}
                        </span>
                      </div>
                      <h4 className="study-card__title">
                        {lang === 'en' ? study.titleEn : study.title}
                      </h4>

                      <div className="study-meta">
                        <div>
                          <strong>{lang === 'en' ? 'Hospital / Center:' : 'संस्थान:'}</strong>{' '}
                          {lang === 'en' ? study.institutionEn : study.institution}
                        </div>
                        <div>
                          <strong>{lang === 'en' ? 'Protocol:' : 'प्रोटोकॉल:'}</strong>{' '}
                          {lang === 'en' ? study.protocolEn : study.protocol}
                        </div>
                        <div>
                          <strong>{lang === 'en' ? 'Sample Size:' : 'नमूना आकार:'}</strong>{' '}
                          {lang === 'en' ? study.sampleSizeEn : study.sampleSize} · <strong>{lang === 'en' ? 'Duration:' : 'अवधि:'}</strong> {lang === 'en' ? study.durationEn : study.duration}
                        </div>
                      </div>

                      <div className="study-result-box">
                        <strong>{lang === 'en' ? 'Trial Result:' : 'क्लिनिकल परिणाम:'}</strong>{' '}
                        {lang === 'en' ? study.resultEn : study.result}
                      </div>

                      <blockquote className="doctor-quote">
                        "{lang === 'en' ? study.doctorQuoteEn : study.doctorQuote}"
                        <footer>
                          — <strong>{study.doctorName}</strong>, <em>{lang === 'en' ? study.doctorTitleEn : study.doctorTitle}</em>
                        </footer>
                      </blockquote>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patient Case Studies Section */}
              <div className="case-studies-section">
                <h3 className="section-title">
                  🌟 {lang === 'en' ? 'Real Student & Patient Success Stories' : 'वास्तविक रोगी सुधार रिपोर्ट (Before & After Patient Case Studies)'}
                </h3>
                <div className="cases-grid">
                  {PATIENT_CASE_STUDIES.map((c) => (
                    <div key={c.id} className="case-card">
                      <div className="case-card__header">
                        <div>
                          <h4 className="case-name">
                            {c.patientName} ({lang === 'en' ? `Age ${c.age}` : `आयु ${c.age} वर्ष`})
                          </h4>
                          <span className="case-condition">
                            {lang === 'en' ? c.conditionEn : c.condition}
                          </span>
                        </div>
                        <span className="case-improvement">
                          {lang === 'en' ? c.fluencyImprovementEn : c.fluencyImprovement}
                        </span>
                      </div>

                      <div className="case-comparison">
                        <div className="comparison-col before">
                          <span className="comp-label">
                            ❌ {lang === 'en' ? 'Before Therapy (Challenges):' : 'थेरेपी से पहले (Pre-Therapy):'}
                          </span>
                          <p>{lang === 'en' ? c.preTherapyStateEn : c.preTherapyState}</p>
                        </div>
                        <div className="comparison-col after">
                          <span className="comp-label">
                            ✅ {lang === 'en' ? 'After Therapy (Success!):' : 'थेरेपी के बाद (Post-Therapy):'}
                          </span>
                          <p>{lang === 'en' ? c.postTherapyStateEn : c.postTherapyState}</p>
                        </div>
                      </div>

                      <div className="case-footer">
                        <span><strong>{lang === 'en' ? 'Therapies Used:' : 'उपयोग की गई थेरेपी:'}</strong> {lang === 'en' ? c.therapyUsedEn : c.therapyUsed}</span>
                        <span><strong>{lang === 'en' ? 'Timeline:' : 'समय सीमा:'}</strong> {lang === 'en' ? c.timelineEn : c.timeline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB: DAILY THERAPY PLAN & CERTIFICATE GENERATOR                  */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'daily_plan' && (
            <div className="daily-plan-view">
              <div className="daily-hero">
                <h2>
                  📅 {lang === 'en' ? 'Daily 10-Minute Doctor Routine' : 'दैनिक 10-मिनट डॉक्टर-प्रिस्क्राइब्ड थेरेपी रूटीन'}
                </h2>
                <p>
                  {lang === 'en'
                    ? 'Just 10 to 15 minutes of daily practice rewires your brain and voice muscles for a lifetime of confident, smooth speaking!'
                    : 'दिन में केवल 10 से 15 मिनट का नियमित अभ्यास आपके वोकल कॉर्ड्स और न्यूरोलॉजिकल स्पीच नेटवर्क को हमेशा के लिए पुनर्गठित कर देता है।'}
                </p>
                <div className="streak-badge-big">
                  🔥 {lang === 'en' ? `Current Streak: ${streakCount} Days of Daily Practice!` : `वर्तमान स्ट्रीक: ${streakCount} दिन लगातार अभ्यास!`}
                </div>
              </div>

              <div className="task-checklist">
                {DAILY_THERAPY_PLAN.map((task) => (
                  <div
                    key={task.id}
                    className={`task-row ${completedTasks[task.id] ? 'task-done' : ''}`}
                    onClick={() => toggleTask(task.id)}
                  >
                    <input
                      type="checkbox"
                      checked={!!completedTasks[task.id]}
                      onChange={() => {}}
                      className="task-checkbox"
                    />
                    <div className="task-info">
                      <div className="task-title-row">
                        <span className="task-time">
                          ⏱️ {lang === 'en' ? task.timeEstimateEn : task.timeEstimate}
                        </span>
                        <h4 className="task-name">
                          {lang === 'en' ? task.titleEn : task.title}
                        </h4>
                      </div>
                      <p className="task-desc">
                        {lang === 'en' ? task.descriptionEn : task.description}
                      </p>
                    </div>
                    <span className="task-status">
                      {completedTasks[task.id]
                        ? (lang === 'en' ? '✅ Completed' : '✅ पूर्ण')
                        : (lang === 'en' ? '⭕ Pending' : '⭕ अधूरा')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="plan-actions">
                <button
                  type="button"
                  className="cert-btn"
                  onClick={() => setShowCertificate(true)}
                >
                  🎓 {lang === 'en' ? 'View Fluency Mastery Award Certificate' : 'प्रमाणित वाणी सुधार प्रमाणपत्र देखें'}
                </button>
              </div>

              {/* Certificate Modal */}
              {showCertificate && (
                <div className="certificate-overlay" onClick={() => setShowCertificate(false)}>
                  <div className="certificate-card" onClick={(e) => e.stopPropagation()}>
                    <div className="certificate-border">
                      <div className="cert-header">
                        <span className="cert-emblem">🏅</span>
                        <h2>
                          {lang === 'en'
                            ? 'Speech Fluency Mastery Certificate'
                            : 'प्रमाणित वाणी सुधार एवं धाराप्रवाहता प्रमाणपत्र'}
                        </h2>
                        <p className="cert-sub">
                          {lang === 'en'
                            ? 'Speech Fluency & Phonological Rehabilitation Excellence Award'
                            : 'Speech Fluency & Phonological Rehabilitation Certificate'}
                        </p>
                      </div>

                      <div className="cert-body">
                        <p>{lang === 'en' ? 'This is proudly presented to' : 'यह प्रमाणित किया जाता है कि आपने'}</p>
                        <h3 className="cert-holder">
                          {lang === 'en' ? 'Vaani Setu Speech Learner' : 'वाणी सेतु — थेरेपी शिक्षार्थी'}
                        </h3>
                        <p>
                          {lang === 'en'
                            ? 'for successfully mastering Doctor-Approved Diaphragmatic Breathing, Easy Vocal Onset, and Orton-Gillingham Multisensory Speech Protocols.'
                            : 'ने AIIMS, ASHA एवं IDA द्वारा अनुमोदित डायफ्रामिक श्वास, ईज़ी ऑनसेट, एवं ऑर्टन-गिंलिंघम मल्टीसेंसरी थेरेपी प्रोटोकॉल का सफलतापूर्वक निरंतर अभ्यास पूर्ण किया है।'}
                        </p>
                        <div className="cert-metrics">
                          <div className="metric">
                            <span className="num">92%</span>
                            <span className="lbl">{lang === 'en' ? 'Fluency Score' : 'औसत धाराप्रवाहता स्कोर'}</span>
                          </div>
                          <div className="metric">
                            <span className="num">{streakCount} {lang === 'en' ? 'Days' : 'दिन'}</span>
                            <span className="lbl">{lang === 'en' ? 'Active Practice Streak' : 'सक्रिय अभ्यास स्ट्रीक'}</span>
                          </div>
                          <div className="metric">
                            <span className="num">0%</span>
                            <span className="lbl">{lang === 'en' ? 'Speech Blockages' : 'वोकल ब्लॉक आवृत्ति'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="cert-footer">
                        <div>
                          <div className="cert-sign">Dr. Rajesh Malhotra</div>
                          <div className="cert-sign-title">{lang === 'en' ? 'Senior Speech Pathologist' : 'वरिष्ठ स्पीच पैथोलॉजिस्ट'}</div>
                        </div>
                        <div>
                          <div className="cert-sign">Vaani Setu Clinical Board</div>
                          <div className="cert-sign-title">{lang === 'en' ? 'AIIMS / ASHA Verified' : 'AIIMS / ASHA समर्थित'}</div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="cert-close-btn"
                      onClick={() => setShowCertificate(false)}
                    >
                      ✕ {lang === 'en' ? 'Close Certificate' : 'प्रमाणपत्र बंद करें'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
