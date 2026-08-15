import { useEffect, useState } from 'react';
import { getUiLanguage, UI_LANGUAGE_CHANGE_EVENT, type UiLanguage } from './ui-language';

export function useUiLanguage(): UiLanguage {
  const [lang, setLang] = useState<UiLanguage>('english');

  useEffect(() => {
    setLang(getUiLanguage());

    const onChange = (event: Event) => {
      setLang((event as CustomEvent<UiLanguage>).detail);
    };

    window.addEventListener(UI_LANGUAGE_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(UI_LANGUAGE_CHANGE_EVENT, onChange);
  }, []);

  return lang;
}
