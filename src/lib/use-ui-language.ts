import { useEffect, useState } from 'react';
import { getUiLanguage, setUiLanguage, UI_LANGUAGE_CHANGE_EVENT, type UiLanguage } from './ui-language';
import { apiFetchAsGuest } from './api-client';

let storedLanguagePromise: Promise<UiLanguage | null> | null = null;

async function getStoredLanguage(): Promise<UiLanguage | null> {
  if (!storedLanguagePromise) {
    storedLanguagePromise = apiFetchAsGuest('/users/me/settings')
      .then(async (response) => {
        if (!response.ok) return null;
        const data = await response.json();
        const language = data?.preferences?.interfaceLanguage;
        return language === 'russian' || language === 'english' ? language : null;
      })
      .catch(() => null);
  }
  return storedLanguagePromise;
}

export function useUiLanguage(): UiLanguage {
  const [lang, setLang] = useState<UiLanguage>('english');

  useEffect(() => {
    setLang(getUiLanguage());

    const onChange = (event: Event) => {
      setLang((event as CustomEvent<UiLanguage>).detail);
    };

    window.addEventListener(UI_LANGUAGE_CHANGE_EVENT, onChange);
    const hasLocalPreference = localStorage.getItem('uiLanguage') === 'russian'
      || localStorage.getItem('uiLanguage') === 'english';
    if (!hasLocalPreference) {
      void getStoredLanguage().then((storedLanguage) => {
        if (storedLanguage) {
          setUiLanguage(storedLanguage);
        }
      });
    }
    return () => window.removeEventListener(UI_LANGUAGE_CHANGE_EVENT, onChange);
  }, []);

  return lang;
}
