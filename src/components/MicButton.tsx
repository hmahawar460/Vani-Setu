import type { PipelineStage } from './StatusBanner';

interface MicButtonProps {
  stage: PipelineStage;
  onPress: () => void;
  disabled?: boolean;
}

export function MicButton({ stage, onPress, disabled }: MicButtonProps) {
  const isRecording = stage === 'recording';
  const isBusy = stage === 'transcribing' || stage === 'correcting' || stage === 'speaking';

  return (
    <button
      type="button"
      className={`mic-button ${isRecording ? 'mic-button--recording' : ''} ${isBusy ? 'mic-button--busy' : ''}`}
      onClick={onPress}
      disabled={disabled || isBusy}
      aria-label={isRecording ? 'रिकॉर्डिंग रोकें' : 'रिकॉर्डिंग शुरू करें'}
      aria-pressed={isRecording}
    >
      <span className="mic-button__ring" aria-hidden="true" />
      <span className="mic-button__icon" aria-hidden="true">
        {isBusy ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12">
              <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
            </circle>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}
      </span>
      <span className="mic-button__label">
        {isRecording ? 'रुकें' : isBusy ? 'प्रोसेस…' : 'बोलें'}
      </span>
    </button>
  );
}
