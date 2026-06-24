import React, { useEffect, useState, useRef } from 'react';

interface SeasonChapterAudioProps {
  audioUrl: string | null;
  status?: string;
  title: string;
  label: string;
  playNextUrls?: string[];
  autoPlayNextUrls?: string[];
  autoPlayOnMount?: boolean;
  autoPlayToken?: string;
  onPlay?: () => void;
  seasonId?: string;
  episodeId?: string;
}

const reportListening = async (
  seasonId: string | undefined,
  episodeId: string | undefined,
  eventType: 'audio_listen' | 'audio_complete',
  durationSec: number,
) => {
  if (!seasonId || durationSec <= 0) return;
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seasons/${seasonId}/learning-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episodeId,
        eventType,
        payload: { durationSec },
      }),
    });
  } catch {
    // non-blocking
  }
};

const getAudioStatusLabel = (status?: string) => {
  if (status === 'failed') return 'Audio unavailable';
  if (status === 'missing') return 'Audio not generated';
  if (status && status !== 'ready' && status !== 'ready_dry_run') return 'Preparing audio';
  return 'Preparing audio';
};

const SeasonChapterAudio: React.FC<SeasonChapterAudioProps> = ({
  audioUrl,
  status,
  title,
  label,
  playNextUrls = [],
  autoPlayNextUrls,
  autoPlayOnMount = false,
  autoPlayToken,
  onPlay,
  seasonId,
  episodeId,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const queueAudioRef = useRef<HTMLAudioElement>(null);
  const queueRef = useRef<string[]>([]);
  const lastAutoPlayTokenRef = useRef<string | null>(null);
  const playbackModeRef = useRef<'chapter' | 'queue' | null>(null);
  const reportedMilestoneRef = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    const updateProgress = () => {
      if (audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        setProgress(pct);
        setDuration(audio.duration);
        if (pct >= 80 && !reportedMilestoneRef.current && playbackModeRef.current === 'chapter') {
          reportedMilestoneRef.current = true;
          reportListening(seasonId, episodeId, 'audio_listen', Math.round(audio.currentTime));
        }
      }
    };
    const ended = () => {
      if (playbackModeRef.current === 'chapter' && audio.duration) {
        reportListening(seasonId, episodeId, 'audio_complete', Math.round(audio.duration));
      }
      const nextUrl = queueRef.current.shift();
      if (nextUrl) {
        const queueAudio = queueAudioRef.current;
        playbackModeRef.current = 'queue';
        setProgress(0);
        setDuration(0);
        if (!queueAudio) {
          setIsPlaying(false);
          return;
        }
        queueAudio.src = nextUrl;
        queueAudio.play().catch(console.error);
        return;
      }
      playbackModeRef.current = null;
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', ended);
    audio.addEventListener('loadedmetadata', updateProgress);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', ended);
      audio.removeEventListener('loadedmetadata', updateProgress);
    };
  }, [audioUrl, seasonId, episodeId]);

  useEffect(() => {
    const queueAudio = queueAudioRef.current;
    if (!queueAudio) return;

    const ended = () => {
      const nextUrl = queueRef.current.shift();
      if (nextUrl) {
        queueAudio.src = nextUrl;
        queueAudio.play().catch(console.error);
        return;
      }

      playbackModeRef.current = null;
      setIsPlaying(false);
    };

    queueAudio.addEventListener('ended', ended);
    return () => {
      queueAudio.removeEventListener('ended', ended);
    };
  }, []);

  const stopAllPlayback = () => {
    const audio = audioRef.current;
    const queueAudio = queueAudioRef.current;
    queueRef.current = [];
    audio?.pause();
    queueAudio?.pause();
    playbackModeRef.current = null;
    setIsPlaying(false);
  };

  const startPlayback = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    audio.src = audioUrl;
    queueRef.current = playNextUrls.filter(Boolean);
    playbackModeRef.current = 'chapter';
    setProgress(0);
    audio.play().catch(console.error);
    setIsPlaying(true);
    onPlay?.();
  };

  const toggle = () => {
    const audio = audioRef.current;
    const queueAudio = queueAudioRef.current;
    if (!audio) return;
    if (isPlaying) {
      stopAllPlayback();
      return;
    }

    if (playbackModeRef.current === 'queue' && queueAudio?.src) {
      queueAudio.play().catch(console.error);
      setIsPlaying(true);
      return;
    }

    if (playbackModeRef.current === 'chapter' && audio.src) {
      audio.play().catch(console.error);
      setIsPlaying(true);
      return;
    }

    startPlayback();
  };

  useEffect(() => {
    if (!autoPlayOnMount || !audioUrl) {
      return;
    }

    const token = autoPlayToken || `${audioUrl}:${playNextUrls.join('|')}`;
    if (lastAutoPlayTokenRef.current === token) {
      return;
    }

    lastAutoPlayTokenRef.current = token;
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.src = audioUrl;
    queueRef.current = (autoPlayNextUrls ?? playNextUrls).filter(Boolean);
    playbackModeRef.current = 'chapter';
    setProgress(0);
    setDuration(0);
    audio.play().catch(console.error);
    setIsPlaying(true);
    onPlay?.();
  }, [audioUrl, autoPlayNextUrls, autoPlayOnMount, autoPlayToken, onPlay, playNextUrls]);

  if (!audioUrl) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-100">
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm">...</div>
        <div className="flex-1">
          <div className="text-sm font-medium text-slate-500">{label}</div>
          <div className="text-xs text-slate-400">{title} · {getAudioStatusLabel(status)}</div>
        </div>
      </div>
    );
  }

  const durationSec = duration;

  return (
    <div className="w-full">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <audio ref={queueAudioRef} preload="none" />
      <button onClick={toggle} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-200 transition-colors">
        <div className={`w-14 h-10 rounded-full flex items-center justify-center text-xs font-semibold ${isPlaying ? 'bg-blue-100' : 'bg-blue-500 text-white'}`}>
          {isPlaying ? 'Pause' : 'Play'}
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-semibold text-slate-800">{label}</div>
          <div className="text-xs text-slate-500">{title}</div>
        {duration > 0 && (
          <div className="mt-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
        {duration > 0 && (
          <div className="text-xs text-slate-400 tabular-nums shrink-0 ml-2">
            {Math.floor(duration - (progress / 100) * duration)}s
          </div>
        )}
        </div>
          {durationSec > 0 && (
            <div className="text-xs text-slate-400 tabular-nums">
              {Math.floor((durationSec - (progress / 100) * durationSec))}:{Math.floor(((durationSec - (progress / 100) * durationSec)) * 60 % 60).toString().padStart(2, '0')}
            </div>
          )}
      </button>
    </div>
  );
};

export default SeasonChapterAudio;
