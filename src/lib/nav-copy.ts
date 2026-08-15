import type { UiLanguage } from './ui-language';

export type NavCopy = {
  home: string;
  library: string;
  parent: string;
  settings: string;
  signUp: string;
  logIn: string;
};

const COPY: Record<UiLanguage, NavCopy> = {
  russian: {
    home: 'Главная',
    library: 'Библиотека',
    parent: 'Для родителей',
    settings: 'Настройки',
    signUp: 'Регистрация',
    logIn: 'Войти',
  },
  english: {
    home: 'Home',
    library: 'Library',
    parent: 'Parent',
    settings: 'Settings',
    signUp: 'Sign Up',
    logIn: 'Log In',
  },
};

export function getNavCopy(lang: UiLanguage): NavCopy {
  return COPY[lang];
}
