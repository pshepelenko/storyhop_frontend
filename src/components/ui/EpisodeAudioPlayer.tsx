import { useEffect, useRef, useState } from 'react';

type EpisodeAudioPlayerProps = {
  audioUrl?: string | null;
  label?: string;
  onEnded?: () => void;
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function EpisodeAudioPlayer({ audioUrl, label = 'Listen', onEnded }: EpisodeAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setCurrent(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onMeta = () => setDuration(audio.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd = () => {
      setPlaying(false);
      onEnded?.();
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnd);
    };
  }, [audioUrl, onEnded]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    if (playing) audio.pause();
    else void audio.play();
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const next = (Number(e.target.value) / 100) * audio.duration;
    audio.currentTime = next;
    setProgress(Number(e.target.value));
  };

  return (
    <div className="rounded-[var(--sh-radius)] border border-sh-border/60 bg-white p-3.5 shadow-[var(--sh-shadow)]">
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          disabled={!audioUrl}
          className="w-11 h-11 rounded-full bg-sh-forest text-white flex items-center justify-center shrink-0 disabled:opacity-40 shadow-[0_2px_6px_rgba(45,106,79,0.35)] text-sm"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? '❚❚' : '▶'}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-sh-foreground truncate">{label}</p>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={seek}
            disabled={!audioUrl}
            className="w-full h-1 rounded-full accent-sh-forest mt-2 bg-[#e8e4dc]"
          />
          <div className="flex justify-between text-[11px] text-sh-muted mt-1">
            <span>{formatTime(current)}</span>
            <span>{duration ? formatTime(duration) : '1:37'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
