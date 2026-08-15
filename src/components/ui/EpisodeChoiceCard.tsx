import { useRef, useState } from 'react';
import Button from './Button';
import SpeakerIcon from './SpeakerIcon';
import { getPlaybackRate } from '@/lib/playback-preference';

type ChoiceLetter = 'A' | 'B' | 'C' | string;

const choiceStyles: Record<string, { border: string; bg: string; badge: string }> = {
  A: { border: 'border-sh-forest', bg: 'bg-sh-forest-soft/40', badge: 'bg-sh-forest' },
  B: { border: 'border-sh-coral', bg: 'bg-orange-50', badge: 'bg-sh-coral' },
  C: { border: 'border-sh-sky', bg: 'bg-sky-50', badge: 'bg-sh-sky' },
};

function getChoiceStyle(choiceId: ChoiceLetter) {
  return choiceStyles[choiceId] ?? { border: 'border-sh-border', bg: 'bg-white', badge: 'bg-sh-muted' };
}

type EpisodeChoiceCardProps = {
  choiceId: ChoiceLetter;
  text: string;
  audioUrl?: string | null;
  isSelected?: boolean;
  isConfirming?: boolean;
  disabled?: boolean;
  confirmLabel?: string;
  onRequestConfirm: (choiceId: string) => void;
  onSelect: (choiceId: string) => void;
};

export default function EpisodeChoiceCard({
  choiceId,
  text,
  audioUrl,
  isSelected,
  isConfirming,
  disabled,
  confirmLabel = 'Confirm',
  onRequestConfirm,
  onSelect,
}: EpisodeChoiceCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const style = getChoiceStyle(choiceId);

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    audio.playbackRate = getPlaybackRate();
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
      className={`w-full rounded-[var(--sh-radius-lg)] border-2 p-4 transition-all ${style.border} ${style.bg} ${
        isSelected ? 'ring-2 ring-sh-forest ring-offset-1' : ''
      } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
    >
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} preload="none" onEnded={() => setPlaying(false)} />
      )}
      <div className="flex items-start gap-3">
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${style.badge}`}
        >
          {choiceId}
        </span>
        <button
          type="button"
          onClick={() => onRequestConfirm(choiceId)}
          disabled={disabled}
          className="flex-1 min-w-0 text-left text-sm font-medium text-sh-foreground leading-relaxed"
        >
          {text}
        </button>
        <button
          type="button"
          onClick={playAudio}
          disabled={!audioUrl}
          className={`shrink-0 p-1.5 rounded-full transition-colors ${
            audioUrl ? 'text-sh-muted hover:text-sh-forest hover:bg-white/80' : 'text-sh-border'
          } ${playing ? 'text-sh-forest' : ''}`}
          aria-label={playing ? 'Pause choice audio' : 'Play choice audio'}
        >
          <SpeakerIcon className="w-5 h-5" />
        </button>
      </div>
      {isConfirming && !disabled && (
        <div className="mt-3 pl-11">
          <Button
            variant="primary"
            className="!min-h-[36px] h-9 py-0 px-4 text-xs"
            onClick={() => onSelect(choiceId)}
          >
            {confirmLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
