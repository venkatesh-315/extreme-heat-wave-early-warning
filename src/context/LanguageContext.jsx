import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { INDIAN_LANGUAGES, UI_TRANSLATIONS } from '../data/translations';

const LANGUAGE_STORAGE_KEY = 'thermoguard_language';
const PROMPT_STORAGE_KEY = 'thermoguard_language_prompted';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved && UI_TRANSLATIONS[saved]) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const [hasPrompted, setHasPromptedState] = useState(() => {
    try {
      return localStorage.getItem(PROMPT_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Set language with normalization ('hi-IN' -> 'hi', etc.)
  const setLanguage = useCallback((langCode) => {
    if (!langCode) return;
    const clean = langCode.toLowerCase().split('-')[0];
    const target = UI_TRANSLATIONS[clean] ? clean : 'en';
    setCurrentLangState(target);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, target);
      document.documentElement.lang = target;
    } catch {
      // ignore
    }
  }, []);

  const markLanguagePrompted = useCallback(() => {
    setHasPromptedState(true);
    try {
      localStorage.setItem(PROMPT_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  // Sync document language attribute on mount and change
  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  // Translation lookup function
  const t = useCallback(
    (key, fallback = '') => {
      if (!key) return '';
      const dict = UI_TRANSLATIONS[currentLang] || UI_TRANSLATIONS['en'] || {};
      if (dict[key] !== undefined) {
        return dict[key];
      }
      const enDict = UI_TRANSLATIONS['en'] || {};
      if (enDict[key] !== undefined) {
        return enDict[key];
      }
      return fallback !== undefined && fallback !== '' ? fallback : key;
    },
    [currentLang]
  );

  const currentLanguageObj = useMemo(() => {
    return (
      INDIAN_LANGUAGES.find((item) => item.lang === currentLang) ||
      INDIAN_LANGUAGES[0]
    );
  }, [currentLang]);

  const value = useMemo(
    () => ({
      currentLang,
      currentLanguageObj,
      setLanguage,
      hasPrompted,
      markLanguagePrompted,
      languages: INDIAN_LANGUAGES,
      t,
    }),
    [currentLang, currentLanguageObj, setLanguage, hasPrompted, markLanguagePrompted, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      currentLang: 'en',
      currentLanguageObj: INDIAN_LANGUAGES[0],
      setLanguage: () => {},
      hasPrompted: true,
      markLanguagePrompted: () => {},
      languages: INDIAN_LANGUAGES,
      t: (k, fb) => fb || k,
    };
  }
  return context;
}
