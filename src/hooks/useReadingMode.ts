import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_READING_PREFS,
  READING_CSS_VAR_NAMES,
  READING_FOCUS_URL_PARAM,
  READING_FONT_SIZE_VARS,
  READING_LINE_HEIGHT_VARS,
  READING_PAGE_WIDTH_VARS,
  hasFocusUrlParam,
  readReadingPrefs,
  readSavedReadingMode,
  saveReadingMode,
  saveReadingPrefs,
  setFocusUrlParam,
  type NonStandardReadingMode,
  type ReadingMode,
  type ReadingPrefs,
} from '../utils/reading-mode';

interface UseReadingModeOptions {
  /** 文章页且正文可渲染时才允许进入专注模式（404/草稿/未加载均禁用） */
  enabled: boolean;
}

export interface ReadingModeApi {
  mode: ReadingMode;
  prefs: ReadingPrefs;
  /** 进入专注/引导（缺省用上次使用的非标准模式） */
  enter: (mode?: NonStandardReadingMode) => void;
  /** 退回标准模式 */
  exit: () => void;
  /** 在专注/引导之间切换 */
  toggleGuide: () => void;
  setPrefs: (patch: Partial<ReadingPrefs>) => void;
  /** 分节导航浮层 */
  tocOpen: boolean;
  setTocOpen: (open: boolean) => void;
  /** 设置面板（桌面 popover / 移动抽屉） */
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
}

/**
 * 专注阅读模式的编排中枢：
 * - 模式与偏好的状态、持久化、URL 参数（?focus=1 可分享）
 * - <html> 上的 reading-focus / reading-guide 类、data-reading-theme、CSS 变量同步
 * - Esc 键分级退出（面板 → 分节浮层 → 退出专注）
 * - 浮层打开时的移动端滚动锁（含滚动条宽度补偿，避免页面横跳）
 *
 * 卸载安全：组件卸载（路由离开文章页）时彻底清理 html 类与 URL 参数，
 * 否则残留的 reading-focus 会把其他页面的站点 chrome 一并藏掉。
 */
export function useReadingMode({ enabled }: UseReadingModeOptions): ReadingModeApi {
  const [mode, setMode] = useState<ReadingMode>('standard');
  const [prefs, setPrefsState] = useState<ReadingPrefs>(() =>
    typeof window === 'undefined' ? { ...DEFAULT_READING_PREFS } : readReadingPrefs()
  );
  const [tocOpen, setTocOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  // ---- 初始化：URL 参数 > 上次保存的模式 ----
  useEffect(() => {
    if (!enabled) {
      return;
    }
    if (hasFocusUrlParam()) {
      const saved = readSavedReadingMode();
      setMode(saved === 'focus' || saved === 'guide' ? saved : 'focus');
      return;
    }
    const saved = readSavedReadingMode();
    if (saved !== 'standard') {
      setMode(saved);
    }
    // 仅在文章就绪时初始化一次，后续切换全部由用户驱动
  }, [enabled]);

  // ---- 文章不可读（404/草稿）时强制回标准模式 ----
  useEffect(() => {
    if (!enabled && mode !== 'standard') {
      setMode('standard');
      setTocOpen(false);
      setPanelOpen(false);
    }
  }, [enabled, mode]);

  // ---- <html> 类 / 属性 / CSS 变量同步（含卸载清理） ----
  useEffect(() => {
    const root = document.documentElement;
    const active = enabled && mode !== 'standard';
    const guide = enabled && mode === 'guide';

    root.classList.toggle('reading-focus', active);
    root.classList.toggle('reading-guide', guide);
    if (active) {
      root.setAttribute('data-reading-theme', prefs.theme);
    } else {
      root.removeAttribute('data-reading-theme');
    }

    const varMaps = active
      ? [
          READING_FONT_SIZE_VARS[prefs.fontSize],
          READING_LINE_HEIGHT_VARS[prefs.lineHeight],
          READING_PAGE_WIDTH_VARS[prefs.pageWidth],
        ]
      : [];
    varMaps.forEach(map => {
      Object.entries(map).forEach(([name, value]) => root.style.setProperty(name, value));
    });
    if (!active) {
      READING_CSS_VAR_NAMES.forEach(name => root.style.removeProperty(name));
    }

    return () => {
      root.classList.remove('reading-focus', 'reading-guide');
      root.removeAttribute('data-reading-theme');
      READING_CSS_VAR_NAMES.forEach(name => root.style.removeProperty(name));
    };
  }, [enabled, mode, prefs.fontSize, prefs.lineHeight, prefs.pageWidth, prefs.theme]);

  // ---- URL 参数同步（replaceState，不污染历史栈） ----
  useEffect(() => {
    if (!enabled) {
      return;
    }
    setFocusUrlParam(mode !== 'standard');
  }, [enabled, mode]);

  // ---- 模式持久化：退出也记录，下次进来恢复到同样的状态 ----
  useEffect(() => {
    if (enabled) {
      saveReadingMode(mode);
    }
  }, [enabled, mode]);

  const enter = useCallback((target?: NonStandardReadingMode) => {
    setMode(target ?? (readSavedReadingMode() === 'guide' ? 'guide' : 'focus'));
  }, []);

  const exit = useCallback(() => {
    setMode('standard');
    setTocOpen(false);
    setPanelOpen(false);
  }, []);

  const toggleGuide = useCallback(() => {
    setMode(prev => (prev === 'guide' ? 'focus' : 'guide'));
  }, []);

  const setPrefs = useCallback((patch: Partial<ReadingPrefs>) => {
    setPrefsState(prev => {
      const next = { ...prev, ...patch };
      saveReadingPrefs(next);
      return next;
    });
  }, []);

  // ---- Esc 分级退出：面板 → 分节浮层 → 退出专注 ----
  useEffect(() => {
    if (mode === 'standard') {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') {
        return;
      }
      // 输入场景不抢键（专注模式内理论上无输入框，防御性保留）
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }
      if (panelOpen) {
        setPanelOpen(false);
        return;
      }
      if (tocOpen) {
        setTocOpen(false);
        return;
      }
      setMode('standard');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode, panelOpen, tocOpen]);

  // ---- 浮层滚动锁：TOC 浮层全端锁定；设置面板仅移动端（桌面是 popover） ----
  useEffect(() => {
    if (!tocOpen && !panelOpen) {
      return;
    }
    const mobileQuery = window.matchMedia('(max-width: 639px)');
    const applyLock = () => {
      const shouldLock = tocOpen || (panelOpen && mobileQuery.matches);
      const body = document.body;
      if (shouldLock && body.style.overflow !== 'hidden') {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        body.dataset.readingPrevPad = body.style.paddingRight || '';
        body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
          body.style.paddingRight = `${scrollbarWidth}px`;
        }
      } else if (!shouldLock && body.style.overflow === 'hidden') {
        body.style.overflow = '';
        body.style.paddingRight = body.dataset.readingPrevPad ?? '';
        delete body.dataset.readingPrevPad;
      }
    };
    applyLock();
    mobileQuery.addEventListener('change', applyLock);
    return () => {
      mobileQuery.removeEventListener('change', applyLock);
      const body = document.body;
      if (body.style.overflow === 'hidden') {
        body.style.overflow = '';
        body.style.paddingRight = body.dataset.readingPrevPad ?? '';
        delete body.dataset.readingPrevPad;
      }
    };
  }, [tocOpen, panelOpen]);

  return useMemo(
    () => ({
      mode,
      prefs,
      enter,
      exit,
      toggleGuide,
      setPrefs,
      tocOpen,
      setTocOpen,
      panelOpen,
      setPanelOpen,
    }),
    [mode, prefs, enter, exit, toggleGuide, setPrefs, tocOpen, panelOpen]
  );
}

/** 导出 URL 参数名供测试与 e2e 使用 */
export { READING_FOCUS_URL_PARAM };
