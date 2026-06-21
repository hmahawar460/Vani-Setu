export type PipelineStage = 'idle' | 'recording' | 'transcribing' | 'correcting' | 'speaking' | 'done' | 'error';

interface StatusBannerProps {
  stage: PipelineStage;
  error: string | null;
}

const STAGE_LABELS: Record<PipelineStage, string> = {
  idle: 'माइक्रोफ़ोन दबाएँ और हिंदी में बोलें',
  recording: 'सुन रहा है… रुकने के लिए दोबारा दबाएँ',
  transcribing: 'बोली को लिख में बदला जा रहा है…',
  correcting: 'गलत शब्द और वाक्य सुधारे जा रहे हैं…',
  speaking: 'सही हिंदी बोली जा रही है…',
  done: 'हो गया — फिर बोलने के लिए माइक दबाएँ',
  error: 'कुछ गलत हो गया',
};

export function StatusBanner({ stage, error }: StatusBannerProps) {
  const isActive = stage === 'recording' || stage === 'transcribing' || stage === 'correcting' || stage === 'speaking';

  return (
    <div
      className={`status-banner ${isActive ? 'status-banner--active' : ''} ${stage === 'error' ? 'status-banner--error' : ''}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="status-banner__dot" aria-hidden="true" />
      <span>{error ?? STAGE_LABELS[stage]}</span>
    </div>
  );
}
