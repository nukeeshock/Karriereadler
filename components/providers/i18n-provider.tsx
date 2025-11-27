'use client';

import { createContext, useContext, useMemo } from 'react';
import de from '@/locales/de.json';
import en from '@/locales/en.json';
import { usePersistentState } from '@/lib/usePersistentState';

type Language = 'de' | 'en';

type Messages = typeof de;

type I18nContextValue = {
  lang: Language;
  t: (key: string) => string;
  setLanguage: (lang: Language) => void;
};

const STORAGE_KEY = 'ka-lang';

const dictionaries: Record<Language, Messages> = {
  de,
  en
};

const I18nContext = createContext<I18nContextValue | null>(null);

function lookup(messages: Messages, key: string) {
  return key.split('.').reduce((acc: any, part) => acc?.[part], messages);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = usePersistentState<Language>(STORAGE_KEY, 'de');

  const value = useMemo<I18nContextValue>(() => {
    return {
      lang,
      t: (key: string) => {
        const messages = dictionaries[lang] || dictionaries.de;
        return lookup(messages, key) ?? key;
      },
      setLanguage: (language: Language) => {
        setLang(language);
      }
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
