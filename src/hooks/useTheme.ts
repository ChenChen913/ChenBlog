import { useState, useEffect } from 'react';
import { safeGetStorage, safeSetStorage, safeRemoveStorage } from '../utils/storage';
import { getAutoTheme } from '../utils/theme-detection';

export function useTheme() {
  const stored = safeGetStorage('theme-preference') as 'dark' | 'light' | null;

  // 初始态必须与 index.html 主题引导脚本同一决策链（stored > 北京时间自动），
  // 此前硬编码 'light'，导致自动暗色时段（北京 20:00–06:00）首访时：
  // 引导脚本先设 dark → useTheme 首帧 effect 用 'light' 把 dark 移除（闪白）→
  // 再由 effect 补算 getAutoTheme 加回 dark。既造成 FOUC，又让 CodeBlock
  // 以错误主题先渲染一遍（明暗双重高亮计算）。
  const [theme, setTheme] = useState<'dark' | 'light'>(stored ?? getAutoTheme());
  const [isManual, setIsManual] = useState<boolean>(stored !== null);

  useEffect(() => {
    if (!stored) {
      setTheme(getAutoTheme());
    }
  }, [stored]);

  useEffect(() => {
    // 'light' 与 'dark' 互斥管理：index.html 初始 class="light"，若只 toggle
    // 'dark' 会出现 "light dark" 并存（detectTheme 只看 'dark' 不受影响，
    // 但保持 html class 语义干净，避免未来误用 .light 选择器时踩坑）。
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
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
