import { useEffect, useState } from 'react';

interface VoiceSelectorProps {
  onVoiceChange?: (voice: SpeechSynthesisVoice | null) => void;
}

/**
 * Lists all available voices and lets the user pick a Hindi one.
 * Shows a warning if no Hindi voice is installed.
 */
export function VoiceSelector({ onVoiceChange }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = () => {
      const all = window.speechSynthesis.getVoices();
      setVoices(all);

      // Auto-select best Hindi voice
      const hindi =
        all.find((v) => v.lang === 'hi-IN' && v.localService) ??
        all.find((v) => v.lang === 'hi-IN') ??
        all.find((v) => v.lang.startsWith('hi'));

      if (hindi) setSelected(hindi.name);
    };

    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);

  const hindiVoices = voices.filter(
    (v) => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'),
  );

  const handleChange = (name: string) => {
    setSelected(name);
    const voice = voices.find((v) => v.name === name) ?? null;
    onVoiceChange?.(voice);

    // Test the voice immediately
    if (voice) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance('नमस्ते');
      u.voice = voice;
      u.lang = 'hi-IN';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  if (!('speechSynthesis' in window)) return null;

  return (
    <div className="voice-selector">
      <button
        type="button"
        className="voice-selector__toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        🔊 आवाज़ चुनें {hindiVoices.length > 0 ? `(${hindiVoices.length} हिंदी)` : '⚠️ हिंदी नहीं'}
        <span aria-hidden="true">{open ? ' ▲' : ' ▼'}</span>
      </button>

      {open && (
        <div className="voice-selector__panel">
          {hindiVoices.length === 0 ? (
            <p className="voice-selector__warn">
              आपके ब्राउज़र में हिंदी आवाज़ नहीं मिली।<br />
              Windows Settings → Time &amp; Language → Speech → Add voices → हिंदी इंस्टॉल करें।<br />
              या <strong>Chrome</strong> browser में खोलें — वहाँ Google हिंदी आवाज़ होती है।
            </p>
          ) : (
            <select
              className="voice-selector__select"
              value={selected}
              onChange={(e) => handleChange(e.target.value)}
              aria-label="हिंदी आवाज़ चुनें"
            >
              {hindiVoices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang}){v.localService ? ' ★' : ''}
                </option>
              ))}
            </select>
          )}
          <p className="voice-selector__hint">
            ★ = डिवाइस पर इंस्टॉल · बाकी ऑनलाइन
          </p>
        </div>
      )}
    </div>
  );
}
