import { useRef, useState } from 'react';

interface TypeInputProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

/**
 * Fallback for users who cannot speak at all —
 * they type Hindi (or Hinglish) and hit Enter / the send button.
 */
export function TypeInput({ onSubmit, disabled }: TypeInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue('');
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Enter (without Shift) submits
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="type-input">
      <label className="type-input__label" htmlFor="type-input-field">
        ✍️ टाइप करके बोलें
      </label>
      <div className="type-input__row">
        <textarea
          id="type-input-field"
          ref={inputRef}
          className="type-input__field"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="यहाँ हिंदी में टाइप करें… (Enter दबाएँ)"
          rows={2}
          disabled={disabled}
          lang="hi"
          dir="auto"
          aria-label="हिंदी टेक्स्ट टाइप करें"
        />
        <button
          type="button"
          className="type-input__send"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          aria-label="भेजें और बोलें"
          title="भेजें"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
