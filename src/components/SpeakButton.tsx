interface SpeakButtonProps {
  text: string;
  onSpeak: () => void;
  onStop: () => void;
  isSpeaking: boolean;
  disabled?: boolean;
}

export function SpeakButton({ text, onSpeak, onStop, isSpeaking, disabled }: SpeakButtonProps) {
  const hasText = text.trim().length > 0;

  return (
    <button
      type="button"
      className={`speak-button ${isSpeaking ? 'speak-button--active' : ''}`}
      onClick={isSpeaking ? onStop : onSpeak}
      disabled={disabled || !hasText}
      aria-label={isSpeaking ? 'बोलना बंद करें' : 'सही वाक्य दोबारा सुनें'}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="22" height="22">
        {isSpeaking ? (
          <path d="M6 6h12v12H6z" />
        ) : (
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        )}
      </svg>
      {isSpeaking ? 'रुकें' : 'दोबारा सुनें'}
    </button>
  );
}
