import { useEffect, useRef, useState } from 'react';
import { saveCorrection } from '../services/corrections';

interface TranscriptPanelProps {
  rawText: string;
  correctedText: string;
  /** Called when user saves a manual edit, so App can update state + re-speak */
  onCorrectedChange?: (newText: string) => void;
  stage: string;
}

export function TranscriptPanel({
  rawText,
  correctedText,
  onCorrectedChange,
  stage,
}: TranscriptPanelProps) {
  const showRaw = rawText.length > 0;
  const showCorrected = correctedText.length > 0;

  // Copy state
  const [copied, setCopied] = useState(false);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keep editValue in sync when correctedText changes from outside
  useEffect(() => {
    if (!editing) setEditValue(correctedText);
  }, [correctedText, editing]);

  // Focus textarea when edit mode opens
  useEffect(() => {
    if (editing) textareaRef.current?.focus();
  }, [editing]);

  const handleCopy = async () => {
    const text = editing ? editValue : correctedText;
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditStart = () => {
    setEditValue(correctedText);
    setEditing(true);
    setSaveMsg('');
  };

  const handleEditCancel = () => {
    setEditing(false);
    setEditValue(correctedText);
    setSaveMsg('');
  };

  const handleSave = async () => {
    const trimmed = editValue.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      // Save mapping: original corrected → user's version
      // Also save raw → user's version for future transcripts
      if (correctedText.trim() !== trimmed) {
        await saveCorrection(correctedText, trimmed);
      }
      if (rawText.trim() && rawText.trim() !== trimmed) {
        await saveCorrection(rawText, trimmed);
      }
      setSaveMsg('✓ सहेजा गया — अगली बार यही शब्द दिखेंगे');
      onCorrectedChange?.(trimmed);
      setEditing(false);
    } catch {
      setSaveMsg('सहेजने में समस्या हुई');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') handleEditCancel();
  };

  return (
    <section className="transcript-panel" aria-label="प्रतिलेख">
      {!showRaw && !showCorrected && (
        <p className="transcript-panel__placeholder">
          माइक दबाकर बोलें, या नीचे टाइप करें — आपकी बात यहाँ दिखेगी।
        </p>
      )}

      {showRaw && (
        <div className="transcript-block">
          <h2 className="transcript-block__label">जो आपने कहा</h2>
          <p
            className="transcript-block__text transcript-block__text--raw"
            aria-busy={stage === 'transcribing'}
            lang="hi"
          >
            {rawText}
          </p>
        </div>
      )}

      {showCorrected && (
        <div className="transcript-block transcript-block--corrected">
          {/* Header row */}
          <div className="transcript-block__header">
            <h2 className="transcript-block__label">सही किया हुआ</h2>
            <div className="transcript-block__actions">
              {!editing && (
                <button
                  type="button"
                  className="tb-action-btn"
                  onClick={handleEditStart}
                  aria-label="मैन्युअल सुधार करें"
                  title="सुधारें"
                  disabled={stage === 'correcting'}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                  <span>सुधारें</span>
                </button>
              )}
              <button
                type="button"
                className={`tb-action-btn ${copied ? 'tb-action-btn--done' : ''}`}
                onClick={handleCopy}
                aria-label={copied ? 'कॉपी हो गया' : 'कॉपी करें'}
                title="कॉपी"
              >
                {copied ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                  </svg>
                )}
                <span>{copied ? 'हो गया!' : 'कॉपी'}</span>
              </button>
            </div>
          </div>

          {/* Text / Edit area */}
          {editing ? (
            <div className="transcript-edit">
              <textarea
                ref={textareaRef}
                className="transcript-edit__area"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                lang="hi"
                dir="auto"
                rows={3}
                aria-label="सही हिंदी टेक्स्ट संपादित करें"
                placeholder="सही हिंदी यहाँ लिखें…"
              />
              <p className="transcript-edit__hint">
                Ctrl+Enter — सहेजें &nbsp;·&nbsp; Esc — रद्द करें
              </p>
              <div className="transcript-edit__btns">
                <button
                  type="button"
                  className="transcript-edit__save"
                  onClick={handleSave}
                  disabled={saving || !editValue.trim()}
                >
                  {saving ? 'सहेजा जा रहा है…' : '✓ सहेजें और याद रखें'}
                </button>
                <button
                  type="button"
                  className="transcript-edit__cancel"
                  onClick={handleEditCancel}
                >
                  रद्द करें
                </button>
              </div>
            </div>
          ) : (
            <p
              className="transcript-block__text transcript-block__text--corrected"
              aria-busy={stage === 'correcting'}
              lang="hi"
            >
              {correctedText}
            </p>
          )}

          {/* Save confirmation */}
          {saveMsg && (
            <p className="transcript-block__save-msg" role="status" aria-live="polite">
              {saveMsg}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
