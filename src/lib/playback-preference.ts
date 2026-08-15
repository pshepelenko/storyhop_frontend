export function getPlaybackRate(): number {
  if (typeof window === 'undefined') return 1;
  const value = Number(window.localStorage.getItem('storyhop_playbackRate') || '1');
  return value === 0.9 || value === 1 || value === 1.15 ? value : 1;
}
