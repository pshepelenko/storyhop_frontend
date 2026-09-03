export const PAUSE_MEDIA_EVENT = 'storyhop:pause-media';

export function pauseActiveMedia() {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new Event(PAUSE_MEDIA_EVENT));
  document.querySelectorAll<HTMLMediaElement>('audio, video').forEach((media) => {
    if (!media.paused) media.pause();
  });
  window.speechSynthesis?.cancel();
}
