import { useState, useCallback } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { transcribeAudio } from '../services/groq';

interface ScenarioInputProps {
  scenario: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function ScenarioInput({ scenario, onChange, disabled }: ScenarioInputProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { state: recorderState, startRecording, stopRecording } = useAudioRecorder();

  const handleMicPress = useCallback(async () => {
    if (recorderState === 'recording') {
      setIsTranscribing(true);
      setError(null);
      try {
        const blob = await stopRecording();
        if (blob.size < 500) {
          setError('रिकॉर्डिंग बहुत छोटी है।');
          setIsTranscribing(false);
          return;
        }
        const text = await transcribeAudio(blob);
        if (text.trim()) {
          // If there's already some scenario text, append it. Otherwise set it.
          const newText = scenario ? `${scenario} ${text}` : text;
          onChange(newText.trim());
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'माइक में समस्या हुई');
      } finally {
        setIsTranscribing(false);
      }
    } else {
      setError(null);
      await startRecording();
    }
  }, [recorderState, startRecording, stopRecording, onChange, scenario]);

  const PRESETS = [
    { label: 'खाना/पीना', value: 'उपयोगकर्ता खाने या पीने के बारे में बात कर रहा है।' },
    { label: 'दर्द/बीमारी', value: 'उपयोगकर्ता दर्द या स्वास्थ्य के बारे में बात कर रहा है।' },
    { label: 'स्कूल/पढ़ाई', value: 'उपयोगकर्ता स्कूल या पढ़ाई के बारे में बात कर रहा है।' },
  ];

  return (
    <div className="scenario-input">
      <div className="scenario-input__header">
        <label className="scenario-input__label">
          केयरगिवर का संदर्भ / सवाल (Context)
        </label>
        <span className="scenario-input__help">
          मॉडल को अनुमान लगाने में मदद करता है
        </span>
      </div>

      <div className="scenario-input__controls">
        <input
          type="text"
          className="scenario-input__text"
          value={scenario}
          onChange={(e) => onChange(e.target.value)}
          placeholder="उदाहरण: क्या तुम खाना खाओगे?"
          disabled={disabled || isTranscribing}
        />
        <button
          type="button"
          className={`scenario-input__mic ${recorderState === 'recording' ? 'scenario-input__mic--recording' : ''}`}
          onClick={handleMicPress}
          disabled={disabled || isTranscribing}
          aria-label={recorderState === 'recording' ? "रिकॉर्डिंग रोकें" : "संदर्भ बोलकर लिखें"}
          title={recorderState === 'recording' ? "रिकॉर्डिंग रोकें" : "संदर्भ बोलकर लिखें"}
        >
          {recorderState === 'recording' ? '⏹' : '🎤'}
        </button>
      </div>

      {isTranscribing && <div className="scenario-input__status">संदर्भ सुन रहा है...</div>}
      {error && <div className="scenario-input__error">{error}</div>}

      <div className="scenario-input__presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className="scenario-input__preset-btn"
            onClick={() => onChange(p.value)}
            disabled={disabled || isTranscribing}
          >
            {p.label}
          </button>
        ))}
        {scenario && (
           <button
             type="button"
             className="scenario-input__preset-btn scenario-input__preset-btn--clear"
             onClick={() => onChange('')}
             disabled={disabled || isTranscribing}
           >
             साफ़ करें
           </button>
        )}
      </div>
    </div>
  );
}
