/**
 * frontend/src/hooks/useTranslation.js
 * Simple i18n hook for DRISHTI-AI language switching.
 * Supported languages: en (English), hi (Hindi), kha (Khasi)
 */
import { useState, useCallback } from 'react';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
import kha from '../i18n/kha.json';

const TRANSLATIONS = { en, hi, kha };
const LANG_KEY = 'drishti_ui_lang';

export function useTranslation() {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem(LANG_KEY) || 'en';
  });

  const setLang = useCallback((newLang) => {
    localStorage.setItem(LANG_KEY, newLang);
    setLangState(newLang);
  }, []);

  const t = useCallback((key) => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    return dict[key] || TRANSLATIONS['en'][key] || key;
  }, [lang]);

  return { t, lang, setLang };
}
