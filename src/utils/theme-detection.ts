/**
 * Theme Detection Utility
 *
 * Provides utilities for detecting and monitoring the current theme (light/dark)
 * with multiple fallback strategies for robustness.
 *
 * ⚠️ 决策链必须与 src/hooks/useTheme.ts 完全一致：
 *   1. documentElement.classList 中的 'dark' —— useTheme 是博客主题的唯一真实
 *      来源，它总是把当前主题同步到 <html> 的 class 上，因此这是最权威信号；
 *   2. localStorage 'theme-preference' —— 用户手动偏好。页面加载的极早期
 *      （React effect 尚未执行）class 还未就位，用它推断初始主题，避免首帧
 *      用错主题渲染代码高亮；
 *   3. 北京时间自动规则（20:00–06:00 为 dark）—— 与 useTheme.getAutoTheme
 *      一致，是"用户从未手动设置"时的默认值。
 *
 * 刻意不参考 prefers-color-scheme：博客主题从不由系统偏好决定。此前策略 2
 * 参考了它，导致"系统深色 + 博客白天"时代码块被渲染成黑夜主题 —— 白天/黑夜
 * 看到的都是黑夜效果（2026-10 代码块白天模式错乱 bug 的根因）。
 */

const THEME_STORAGE_KEY = 'theme-preference';

type ThemeMode = 'light' | 'dark';

function readStoredTheme(): ThemeMode | null {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    return null;
  }
}

function getBeijingHour(): number {
  const now = new Date();
  const beijingOffset = 8 * 60 * 60 * 1000;
  const beijingTime = new Date(now.getTime() + beijingOffset);
  return beijingTime.getUTCHours();
}

/**
 * 北京时间自动主题规则（单一实现，useTheme 也从这里导入）。
 * 20:00–次日 06:00 为 dark，其余为 light。
 *
 * ⚠️ index.html 的首帧防白闪内联脚本含同一规则的第二份实现（防白闪要求
 * 内联、无法 import 本模块）。修改时段或优先级时必须同步两边。
 */
export function getAutoTheme(): ThemeMode {
  const hour = getBeijingHour();
  return hour >= 20 || hour < 6 ? 'dark' : 'light';
}

/**
 * Detect the current theme with multiple fallback strategies
 *
 * Priority order
 * 1. Check document.documentElement.classList for 'dark' class (useTheme 的权威信号)
 * 2. Fall back to the stored manual preference in localStorage
 * 3. Fall back to the Beijing-time auto rule (same as useTheme)
 * 4. Default to 'light' if all detection methods fail
 *
 * Note: prefers-color-scheme is intentionally NOT consulted — the blog theme
 * is never derived from the system preference.
 *
 * @returns 'light' | 'dark'
 */
export function detectTheme(): ThemeMode {
  try {
    // Strategy 1: Check for 'dark' class on document element
    if (document.documentElement.classList.contains('dark')) {
      return 'dark';
    }

    // class 未含 'dark' 有两种可能：主题确为 light，或 React effect 尚未把
    // 初始主题写到 class 上。继续用与 useTheme 相同的推断规则，保证首帧
    // 与最终主题一致（若推断为 dark，useTheme 随后会补上 class 并由
    // MutationObserver 通知订阅者）。
    const stored = readStoredTheme();

    // Strategy 2: Stored manual preference
    if (stored) {
      return stored;
    }

    // Strategy 3: Beijing-time auto rule (matches useTheme default)
    return getAutoTheme();
  } catch (err) {
    console.warn('Theme detection failed, defaulting to light theme:', err);
    return 'light';
  }
}

/**
 * Set up a theme change observer
 *
 * Monitors:
 * - class attribute changes on the document element (useTheme 切换主题的方式)
 * - the 'storage' event, so theme edits in another tab propagate to this one
 *
 * @param callback Function to call when the theme changes
 * @returns Cleanup function to disconnect observers
 */
export function observeThemeChanges(callback: (theme: ThemeMode) => void): () => void {
  const cleanupFunctions: Array<() => void> = [];

  try {
    // Observer 1: Watch for class changes on document element
    const mutationObserver = new MutationObserver(() => {
      callback(detectTheme());
    });

    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    cleanupFunctions.push(() => mutationObserver.disconnect());

    // Observer 2: Watch for theme changes made in other tabs/windows.
    // useTheme persists manual preferences to localStorage; the storage
    // event lets every open tab re-run detection and stay in sync.
    const storageHandler = (event: StorageEvent) => {
      if (event.key === null || event.key === THEME_STORAGE_KEY) {
        callback(detectTheme());
      }
    };

    window.addEventListener('storage', storageHandler);
    cleanupFunctions.push(() => window.removeEventListener('storage', storageHandler));
  } catch (err) {
    console.error('Failed to set up theme observers:', err);
  }

  // Return cleanup function that calls all cleanup functions
  return () => {
    cleanupFunctions.forEach(cleanup => {
      try {
        cleanup();
      } catch (err) {
        console.error('Error during theme observer cleanup:', err);
      }
    });
  };
}

/**
 * Subscribe-style theme detection with automatic updates
 *
 * Sets the initial theme immediately and observes theme changes until the
 * returned cleanup function is called. Typically invoked inside useEffect.
 * (Renamed from useThemeDetection: it is a plain subscription helper, not a
 * React hook - the old name falsely tripped react-hooks/rules-of-hooks.)
 *
 * @param setTheme State setter function from useState
 * @returns Cleanup function
 */
export function subscribeThemeDetection(setTheme: (theme: ThemeMode) => void): () => void {
  // Set initial theme
  setTheme(detectTheme());

  // Set up observers
  return observeThemeChanges(setTheme);
}
