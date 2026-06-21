import { useCallback, useEffect, useState } from 'react';
import { CorrectionsDB } from './components/CorrectionsDB';
import { MicButton } from './components/MicButton';
import { SpeakButton } from './components/SpeakButton';
import { StatusBanner, type PipelineStage } from './components/StatusBanner';
import { TestMode } from './components/TestMode';
import { TranscriptPanel } from './components/TranscriptPanel';
import { TypeInput } from './components/TypeInput';
import { VoiceSelector } from './components/VoiceSelector';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { checkHealth, transcribeAudio } from './services/groq';
import { correctHindi } from './services/hindiCorrect';
import {
  isSpeechSynthesisSupported,
  loadVoices,
  setPreferredVoice,
  speak,
  stopSpeaking,
} from './services/speechSynthesis';
import './App.css';

export default function App() {
  const [stage, setStage] = useState<PipelineStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [groqReady, setGroqReady] = useState<boolean | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [testOpen,  setTestOpen]  = useState(false);

  const { state: recorderState, startRecording, stopRecording } = useAudioRecorder();

  useEffect(() => {
    checkHealth().then((h) => setGroqReady(h.groqConfigured)).catch(() => setGroqReady(false));
    loadVoices();
  }, []);

  /** Speak a given text in Hindi — always waits for correction to finish first */
  const speakHindi = useCallback(async (text: string) => {
    if (!text.trim()) return;
    if (!isSpeechSynthesisSupported()) return;
    stopSpeaking();          // cancel anything playing
    setStage('speaking');
    try {
      await speak(text);
    } catch {
      // TTS errors are non-fatal — don't show error state
    } finally {
      setStage('done');
    }
  }, []);

  /** Core pipeline: run LLM correction then speak result */
  const runPipeline = useCallback(
    async (transcribed: string) => {
      setError(null);
      if (!transcribed.trim()) {
        setStage('done');
        setError('कोई टेक्स्ट नहीं मिला।');
        return;
      }
      try {
        setStage('correcting');
        const corrected = await correctHindi(transcribed);
        setCorrectedText(corrected);
        setStage('done'); // set done before speaking so UI shows corrected text

        // Auto-speak after correction — uses 120ms delay internally to avoid Chrome race
        if (autoSpeak) {
          await speakHindi(corrected);
        }
      } catch (err) {
        setStage('error');
        setError(err instanceof Error ? err.message : 'कुछ गलत हो गया');
      }
    },
    [autoSpeak, speakHindi],
  );

  /** After mic recording: transcribe → pipeline */
  const runAudioPipeline = useCallback(
    async (blob: Blob) => {
      setError(null);
      try {
        setStage('transcribing');
        const text = await transcribeAudio(blob);
        setRawText(text);
        if (!text.trim()) {
          setStage('done');
          setError('कोई आवाज़ नहीं पहचानी गई। माइक के पास ज़ोर से या धीरे-धीरे बोलें।');
          return;
        }
        await runPipeline(text);
      } catch (err) {
        setStage('error');
        setError(err instanceof Error ? err.message : 'कुछ गलत हो गया');
      }
    },
    [runPipeline],
  );

  /** User manually edited the corrected text — update state, speak new version */
  const handleCorrectedChange = useCallback(
    async (newText: string) => {
      setCorrectedText(newText);
      setStage('done');
      if (autoSpeak) {
        await speakHindi(newText);
      }
    },
    [autoSpeak, speakHindi],
  );

  /** Type-to-speak path */
  const handleTypeSubmit = useCallback(
    async (text: string) => {
      stopSpeaking();
      setRawText(text);
      setCorrectedText('');
      setError(null);
      await runPipeline(text);
    },
    [runPipeline],
  );

  const handleMicPress = useCallback(async () => {
    if (recorderState === 'recording') {
      setStage('transcribing');
      try {
        const blob = await stopRecording();
        if (blob.size < 500) {
          setStage('error');
          setError('रिकॉर्डिंग बहुत छोटी है। थोड़ा लंबा बोलकर रुकें।');
          return;
        }
        await runAudioPipeline(blob);
      } catch (err) {
        setStage('error');
        setError(err instanceof Error ? err.message : 'रिकॉर्डिंग में समस्या हुई');
      }
    } else {
      stopSpeaking();
      setRawText('');
      setCorrectedText('');
      setError(null);
      setStage('recording');
      await startRecording();
    }
  }, [recorderState, startRecording, stopRecording, runAudioPipeline]);

  const handleRepeatSpeak = useCallback(async () => {
    if (stage === 'speaking') {
      stopSpeaking();
      setStage('done');
      return;
    }
    if (!correctedText.trim()) return;
    try {
      await speakHindi(correctedText);
    } catch (err) {
      setStage('error');
      setError(err instanceof Error ? err.message : 'बोलने में समस्या हुई');
    }
  }, [correctedText, stage, speakHindi]);

  const displayStage = stage === 'idle' && recorderState === 'recording' ? 'recording' : stage;
  const isBusy =
    displayStage === 'transcribing' ||
    displayStage === 'correcting' ||
    displayStage === 'speaking';

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <span className="app__logo" aria-hidden="true">🎙️</span>
          <div>
            <h1 className="app__title">Whisper Flow</h1>
            <p className="app__subtitle">अस्पष्ट बोली → सही हिंदी → आवाज़</p>
          </div>
        </div>
        <button
          type="button"
          className="test-open-btn"
          onClick={() => { stopSpeaking(); setTestOpen(true); }}
          aria-label="परीक्षा मोड खोलें"
          title="परीक्षा लें"
        >
          📝 परीक्षा
        </button>
      </header>

      {/* Test mode overlay — rendered on top, all existing features untouched */}
      {testOpen && (
        <div className="test-overlay">
          <TestMode onClose={() => setTestOpen(false)} />
        </div>
      )}

      <main className="app__main">
        {groqReady === false && (
          <div className="setup-notice" role="alert">
            <strong>Setup needed:</strong> Add your Groq API key to <code>.env</code> and restart.{' '}
            <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer">
              console.groq.com
            </a>
          </div>
        )}

        <StatusBanner stage={displayStage} error={error} />

        <TranscriptPanel
          rawText={rawText}
          correctedText={correctedText}
          onCorrectedChange={handleCorrectedChange}
          stage={displayStage}
        />

        {/* Mic */}
        <div className="app__controls">
          <MicButton stage={displayStage} onPress={handleMicPress} disabled={groqReady === false} />
        </div>

        <div className="app__actions">
          <SpeakButton
            text={correctedText}
            onSpeak={handleRepeatSpeak}
            onStop={() => { stopSpeaking(); setStage('done'); }}
            isSpeaking={stage === 'speaking'}
            disabled={!correctedText.trim()}
          />
          <label className="toggle">
            <input
              type="checkbox"
              checked={autoSpeak}
              onChange={(e) => setAutoSpeak(e.target.checked)}
            />
            <span>सही वाक्य अपने आप बोलें</span>
          </label>
        </div>

        {/* Type input for non-verbal users */}
        <TypeInput onSubmit={handleTypeSubmit} disabled={isBusy || groqReady === false} />

        {/* Personal corrections database */}
        <CorrectionsDB />

        {/* Voice picker */}
        <VoiceSelector onVoiceChange={setPreferredVoice} />
      </main>

      <footer className="app__footer">
        <p>STT: Groq Whisper v3 · सुधार: Llama 3.3 70B + व्यक्तिगत DB · TTS: hi-IN</p>
        {!isSpeechSynthesisSupported() && (
          <p className="app__footer-warn">आवाज़ के लिए Chrome या Edge सबसे अच्छा काम करता है।</p>
        )}
      </footer>
    </div>
  );
}
