import React, { useRef, useState } from 'react';

interface SeasonOptionAudioProps {
  audioUrl: string | null;
  audioStatus?: string;
  text: string;
  choiceId: string;
  isSelected?: boolean;
  isConfirming?: boolean;
  onRequestConfirm: (choiceId: string) => void;
  onSelect: (choiceId: string) => void;
  disabled?: boolean;
  confirmLabel?: string;
}

const getAudioLabel = (audioUrl: string | null, audioStatus?: string, playing?: boolean) => {
  if (audioUrl) return playing ? 'Pause' : 'Play';
  if (audioStatus === 'failed') return 'No audio';
  return 'Audio pending';
};

const SeasonOptionAudio: React.FC<SeasonOptionAudioProps> = ({
  audioUrl,
  audioStatus,
  text,
  choiceId,
  isSelected,
  isConfirming,
  onRequestConfirm,
  onSelect,
  disabled,
  confirmLabel = 'Confirm',
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const playAudio = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    audio.play().catch(console.error);
    setPlaying(true);
  };

  return (
    <div
      className={`w-full rounded-sh border-2 p-4 transition-all ${
        isSelected
          ? 'border-sh-forest bg-sh-forest-soft ring-1 ring-sh-forest'
          : choiceId === 'A'
            ? 'border-sh-sky bg-white'
            : choiceId === 'B'
              ? 'border-sh-coral bg-white'
              : 'border-sh-border bg-white'
      } ${disabled ? 'opacity-60' : ''}`}
    >
      <audio ref={audioRef} src={audioUrl || undefined} preload="none" onEnded={() => setPlaying(false)} />
      <div className="flex items-start gap-3">
        <div className="text-xl font-bold text-sh-forest">{choiceId}</div>
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => onRequestConfirm(choiceId)}
            disabled={disabled}
            className="w-full text-left text-sm font-medium text-slate-800 disabled:opacity-70"
          >
            {text}
          </button>
          {isConfirming && !disabled && (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => onSelect(choiceId)}
                className="rounded-full bg-sh-forest px-4 py-2 text-xs font-semibold text-white"
              >
                {confirmLabel}
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={playAudio}
          disabled={!audioUrl}
          className={`min-w-20 rounded-full px-3 py-2 text-xs font-semibold shrink-0 ${
            audioUrl
              ? playing ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
              : 'bg-slate-100 text-slate-400'
          }`}
        >
          {getAudioLabel(audioUrl, audioStatus, playing)}
        </button>
      </div>
    </div>
  );
};

export default SeasonOptionAudio;
