export type UiLanguage = 'english' | 'russian';

export function getUiLanguage(): UiLanguage {
  if (typeof window === 'undefined') return 'english';
  return (localStorage.getItem('uiLanguage') as UiLanguage) || 'english';
}

export function setUiLanguage(lang: UiLanguage) {
  localStorage.setItem('uiLanguage', lang);
}

export function getChannelUserId(): string {
  if (typeof window === 'undefined') return 'default';
  return localStorage.getItem('userId') || 'default';
}
