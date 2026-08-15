export type UiLanguage = 'english' | 'russian';

export const UI_LANGUAGE_CHANGE_EVENT = 'storyhop:ui-language-change';

export function getUiLanguage(): UiLanguage {
  if (typeof window === 'undefined') return 'english';
  return (localStorage.getItem('uiLanguage') as UiLanguage) || 'english';
}

export function setUiLanguage(lang: UiLanguage) {
  localStorage.setItem('uiLanguage', lang);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(UI_LANGUAGE_CHANGE_EVENT, { detail: lang }));
  }
}

export function getChannelUserId(): string {
  if (typeof window === 'undefined') return 'default';
  return localStorage.getItem('userId') || 'default';
}
