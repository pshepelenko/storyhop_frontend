import { useEffect, useMemo, useRef, useState } from 'react';
import { captureAnalyticsEvent } from '@/lib/analytics';

type EpisodeAudioPlayerProps = {
  audioUrl?: string | null;
  label?: string;
  onEnded?: () => void;
  variant?: 'card' | 'inline';
  status?: string;
  playNextUrls?: string[];
  autoPlayNextUrls?: string[];
  autoPlayOnMount?: boolean;
  autoPlayBlocked?: boolean;
  autoPlayToken?: string;
  seasonId?: string;
  episodeId?: string;
  onPlay?: () => void;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const reportListening = async (
  seasonId: string | undefined,
  episodeId: string | undefined,
  eventType: 'audio_listen' | 'audio_complete',
  durationSec: number,
) => {
  if (!seasonId || durationSec <= 0) return;
  captureAnalyticsEvent(eventType === 'audio_complete' ? 'episode_audio_completed' : 'episode_audio_listened', {
    duration_seconds: durationSec,
  });
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

function episodeIdentity(token?: string, episodeId?: string, label?: string) {
  if (episodeId) return `ep:${episodeId}`;
  if (!token) return label || 'default';
  const parts = token.split(':');
  if (parts[0] === 'chapter' || parts[0] === 'story-intro' || parts[0] === 'waiting') {
    return parts.slice(0, 2).join(':');
  }
  return parts[0] || token;
}

function probeDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    let settled = false;
    const finish = (value: number) => {
      if (settled) return;
      settled = true;
      audio.removeAttribute('src');
      audio.load();
      resolve(value);
    };
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      finish(Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0);
    };
    audio.onerror = () => finish(0);
    window.setTimeout(() => finish(0), 15000);
    audio.src = url;
  });
}

export default function EpisodeAudioPlayer({
  audioUrl,
  label = 'Listen',
  onEnded,
  variant = 'card',
  status,
  playNextUrls = [],
  autoPlayNextUrls,
  autoPlayOnMount = false,
  autoPlayBlocked = false,
  autoPlayToken,
  seasonId,
  episodeId,
  onPlay,
}: EpisodeAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const segmentIndexRef = useRef(0);
  const playlistRef = useRef<string[]>([]);
  const segmentDurationsRef = useRef<number[]>([]);
  const lastAutoPlayTokenRef = useRef<string | null>(null);
  const lastEpisodeIdentityRef = useRef<string | null>(null);
  const userInteractedRef = useRef(false);
  const isPlayingRef = useRef(false);
  const switchingSegmentRef = useRef(false);
  const reportedMilestoneRef = useRef(false);
  const onEndedRef = useRef(onEnded);
  const onPlayRef = useRef(onPlay);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [segmentDurations, setSegmentDurations] = useState<number[]>([]);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const readRate = () => {
      const value = Number(localStorage.getItem('storyhop_playbackRate') || '1');
      setPlaybackRate([0.9, 1, 1.15].includes(value) ? value : 1);
    };
    readRate();
    window.addEventListener('storyhop:audio-preference-change', readRate);
    return () => window.removeEventListener('storyhop:audio-preference-change', readRate);
  }, []);

  const playlist = useMemo(() => {
    const urls = [audioUrl, ...playNextUrls].filter((url): url is string => Boolean(url));
    return Array.from(new Set(urls));
  }, [audioUrl, playNextUrls]);

  const autoPlaylist = useMemo(() => {
    const follow = autoPlayNextUrls ?? playNextUrls;
    const urls = [audioUrl, ...follow].filter((url): url is string => Boolean(url));
    return Array.from(new Set(urls));
  }, [audioUrl, autoPlayNextUrls, playNextUrls]);
  const playlistKey = useMemo(() => playlist.join('|'), [playlist]);
  const autoPlaylistKey = useMemo(() => autoPlaylist.join('|'), [autoPlaylist]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate, playlistKey]);

  useEffect(() => {
    onEndedRef.current = onEnded;
    onPlayRef.current = onPlay;
  }, [onEnded, onPlay]);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    segmentDurationsRef.current = segmentDurations;
    const total = segmentDurations.reduce((sum, value) => sum + value, 0);
    if (total > 0) {
      setDuration(total);
    }
  }, [segmentDurations]);

  const elapsedBefore = (index: number, durations: number[]) =>
    durations.slice(0, Math.max(0, index)).reduce((sum, value) => sum + value, 0);

  const syncProgressFromElement = (audio: HTMLAudioElement) => {
    const durations = segmentDurationsRef.current;
    const index = segmentIndexRef.current;
    const total = durations.reduce((sum, value) => sum + value, 0);
    const knownSegmentDuration =
      durations[index] || (Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0);
    const localCurrent = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const absolute = elapsedBefore(index, durations) + localCurrent;
    const displayTotal = total > 0 ? total : knownSegmentDuration;

    if (displayTotal > 0) {
      setDuration(displayTotal);
      setCurrent(Math.min(absolute, displayTotal));
      setProgress(Math.min(100, (absolute / displayTotal) * 100));
    }

    if (
      displayTotal > 0 &&
      absolute / displayTotal >= 0.8 &&
      !reportedMilestoneRef.current
    ) {
      reportedMilestoneRef.current = true;
      reportListening(seasonId, episodeId, 'audio_listen', Math.round(absolute));
    }
  };

  const setPlayingState = (next: boolean) => {
    isPlayingRef.current = next;
    setPlaying(next);
  };

  const loadSegment = async (index: number, shouldPlay: boolean) => {
    const audio = audioRef.current;
    const urls = playlistRef.current;
    if (!audio || index < 0 || index >= urls.length) return;

    segmentIndexRef.current = index;
    const url = urls[index];
    switchingSegmentRef.current = true;
    // Always assign — browser resolves relative URLs and src comparison is unreliable.
    audio.src = url;
    audio.playbackRate = playbackRate;

    if (shouldPlay) {
      try {
        await audio.play();
        setPlayingState(true);
        onPlayRef.current?.();
      } catch (error) {
        console.error(error);
        setPlayingState(false);
      }
    }
    switchingSegmentRef.current = false;
  };

  const resetPlayback = () => {
    const audio = audioRef.current;
    audio?.pause();
    if (audio) {
      audio.currentTime = 0;
    }
    segmentIndexRef.current = 0;
    setProgress(0);
    setCurrent(0);
    setPlayingState(false);
  };

  const pausePlayback = () => {
    audioRef.current?.pause();
    setPlayingState(false);
  };

  const startPlayback = async (urls: string[] = playlist) => {
    if (!urls.length) return;
    playlistRef.current = urls;
    segmentIndexRef.current = 0;
    reportedMilestoneRef.current = false;
    setProgress(0);
    setCurrent(0);
    await loadSegment(0, true);
  };

  useEffect(() => {
    const identity = episodeIdentity(autoPlayToken, episodeId, label);
    if (lastEpisodeIdentityRef.current !== identity) {
      lastEpisodeIdentityRef.current = identity;
      userInteractedRef.current = false;
      lastAutoPlayTokenRef.current = null;
      segmentIndexRef.current = 0;
      reportedMilestoneRef.current = false;
      setProgress(0);
      setCurrent(0);
      setDuration(0);
      setSegmentDurations([]);
      setPlayingState(false);
    }
  }, [autoPlayToken, episodeId, label]);

  useEffect(() => {
    let cancelled = false;
    if (!playlist.length) {
      setSegmentDurations([]);
      setDuration(0);
      return;
    }

    Promise.all(playlist.map((url) => probeDuration(url))).then((durations) => {
      if (cancelled) return;
      setSegmentDurations(durations);
      const total = durations.reduce((sum, value) => sum + value, 0);
      if (total > 0) {
        setDuration(total);
      }
    });

    return () => {
      cancelled = true;
    };
  // `playlistKey` is the stable media identity; probing must not restart when callbacks update.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistKey]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !playlist.length) return;

    const onTimeUpdate = () => syncProgressFromElement(audio);
    const onLoadedMetadata = () => {
      const durations = [...segmentDurationsRef.current];
      const index = segmentIndexRef.current;
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        durations[index] = audio.duration;
        segmentDurationsRef.current = durations;
        setSegmentDurations(durations);
      }
      syncProgressFromElement(audio);
    };
    const onEndedSegment = () => {
      const nextIndex = segmentIndexRef.current + 1;
      if (nextIndex < playlistRef.current.length) {
        void loadSegment(nextIndex, true);
        return;
      }
      const total = segmentDurationsRef.current.reduce((sum, value) => sum + value, 0);
      if (total > 0) {
        reportListening(seasonId, episodeId, 'audio_complete', Math.round(total));
      }
      setPlayingState(false);
      setProgress(100);
      setCurrent(total);
      onEndedRef.current?.();
    };
    const onPlayEvent = () => setPlayingState(true);
    const onPauseEvent = () => {
      if (switchingSegmentRef.current || audio.ended) return;
      setPlayingState(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('durationchange', onLoadedMetadata);
    audio.addEventListener('ended', onEndedSegment);
    audio.addEventListener('play', onPlayEvent);
    audio.addEventListener('pause', onPauseEvent);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('durationchange', onLoadedMetadata);
      audio.removeEventListener('ended', onEndedSegment);
      audio.removeEventListener('play', onPlayEvent);
      audio.removeEventListener('pause', onPauseEvent);
    };
  // Audio handlers deliberately read current refs so pause/resume survives parent rerenders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistKey, seasonId, episodeId]);

  // The autoplay token is the dependency contract; callbacks read current audio refs.
  useEffect(() => {
    if (!autoPlayOnMount || autoPlayBlocked || !autoPlaylist.length) return;
    if (userInteractedRef.current) return;

    const token = autoPlayToken || autoPlaylistKey;
    if (lastAutoPlayTokenRef.current === token) return;

    if (isPlayingRef.current && lastAutoPlayTokenRef.current) {
      lastAutoPlayTokenRef.current = token;
      return;
    }

    lastAutoPlayTokenRef.current = token;
    void startPlayback(autoPlaylist);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    autoPlayBlocked,
    autoPlayOnMount,
    autoPlayToken,
    autoPlaylistKey,
  ]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !playlist.length) return;
    userInteractedRef.current = true;

    if (isPlayingRef.current) {
      pausePlayback();
      return;
    }

    if (audio.src && !audio.ended && segmentIndexRef.current < playlist.length) {
      audio.play().catch(console.error);
      setPlayingState(true);
      onPlayRef.current?.();
      return;
    }

    void startPlayback(playlist);
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const durations = segmentDurationsRef.current;
    const total = durations.reduce((sum, value) => sum + value, 0);
    if (!audio || total <= 0) return;

    userInteractedRef.current = true;
    const target = (Number(e.target.value) / 100) * total;
    let remaining = target;
    let index = 0;
    while (index < durations.length - 1 && remaining > durations[index]) {
      remaining -= durations[index];
      index += 1;
    }

    const applySeek = async () => {
      if (index !== segmentIndexRef.current) {
        await loadSegment(index, isPlayingRef.current);
      }
      const active = audioRef.current;
      if (!active) return;
      active.currentTime = Math.max(0, Math.min(remaining, durations[index] || remaining));
      setCurrent(target);
      setProgress(Number(e.target.value));
    };

    void applySeek();
  };

  useEffect(() => {
    return () => {
      resetPlayback();
    };
  // Reset function uses refs and is intentionally invoked only at unmount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!audioUrl) {
    const placeholder = (
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-sh-forest-soft flex items-center justify-center shrink-0 text-sh-muted text-sm">
          ▶
        </div>
        <div className="flex-1 min-w-0">
          {variant === 'card' && <p className="text-sm font-semibold text-sh-muted">{label}</p>}
          <p className="text-xs text-sh-muted">{getAudioStatusLabel(status)}</p>
        </div>
      </div>
    );
    if (variant === 'inline') return <div className="mb-5">{placeholder}</div>;
    return (
      <div className="rounded-[var(--sh-radius)] border border-sh-border bg-white p-3.5 shadow-[var(--sh-shadow)]">
        {placeholder}
      </div>
    );
  }

  const playerControls = (
    <>
      <audio ref={audioRef} preload="metadata" />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className="w-11 h-11 rounded-full bg-sh-forest text-white flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(45,106,79,0.35)] text-sm"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? '❚❚' : '▶'}
        </button>
        <div className="flex-1 min-w-0">
          {variant === 'card' && (
            <p className="text-sm font-semibold text-sh-foreground truncate">{label}</p>
          )}
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={progress}
            onChange={seek}
            className="w-full h-1 rounded-full accent-sh-forest mt-1 bg-[#e8e4dc]"
          />
          <div className="flex justify-between text-[11px] text-sh-muted mt-1">
            <span>{formatTime(current)}</span>
            <span>{duration > 0 ? formatTime(duration) : '—:—'}</span>
          </div>
        </div>
      </div>
    </>
  );

  if (variant === 'inline') {
    return <div className="mb-5">{playerControls}</div>;
  }

  return (
    <div className="rounded-[var(--sh-radius)] border border-sh-border bg-white p-3.5 shadow-[var(--sh-shadow)]">
      {playerControls}
    </div>
  );
}
