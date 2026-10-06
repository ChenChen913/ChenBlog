import { useState, useEffect } from 'react';
import { safeGetStorage, safeSetStorage, safeRemoveStorage } from '../utils/storage';
import { getAutoTheme } from '../utils/theme-detection';

export function useTheme() {
  const stored = safeGetStorage('theme-preference') as 'dark' | 'light' | null;

  const [theme, setTheme] = useState<'dark' | 'light'>(stored ?? 'light');
  const [isManual, setIsManual] = useState<boolean>(stored !== null);

  useEffect(() => {
    if (!stored) {
      setTheme(getAutoTheme());
    }
  }, [stored]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // 每分钟检查一次，仅在用户没有手动设置时自动切换
  useEffect(() => {
    const timer = setInterval(() => {
      if (!safeGetStorage('theme-preference')) {
        const newTheme = getAutoTheme();
        // 只在主题真正需要切换时更新状态
        if (newTheme !== theme) {
          setTheme(newTheme);
        }
      }
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, [theme]);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setIsManual(true);
    safeSetStorage('theme-preference', next);
  }

  function resetToAuto() {
    safeRemoveStorage('theme-preference');
    setTheme(getAutoTheme());
    setIsManual(false);
  }

  return { theme, isManual, toggleTheme, resetToAuto };
}
