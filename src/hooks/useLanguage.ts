import { useState, useEffect } from 'react';
import { safeGetStorage, safeSetStorage } from '../utils/storage';
import { Lang } from '../i18n';

export function useLanguage() {
  const stored = safeGetStorage('lang-preference') as Lang | null;
  const [lang, setLang] = useState<Lang>(stored ?? 'zh');

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function toggleLang() {
    const next = lang === 'zh' ? 'en' : 'zh';
    setLang(next);
    safeSetStorage('lang-preference', next);
  }

  return { lang, toggleLang };
}
