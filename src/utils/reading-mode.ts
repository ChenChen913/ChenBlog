/**
 * 专注阅读模式（Focus Reading）—— 偏好与工具函数
 *
 * 设计约束（与产品决策一致）：
 * - 三个预设档位：standard（正常站点）/ focus（专注：藏）/ guide（引导：导）
 * - 偏好持久化到 localStorage；字号 4 档、行高 3 档、页宽 3 档
 * - 阅读背景 4 选：跟随主题 / 纸白 / 暖米 / 暖黑（不用纯黑，避免光晕）
 * - 引导方式二选一：段落聚焦（默认）/ 行标尺
 * - Bionic 英文锚定与节奏提醒均为独立开关，默认关闭
 */

export const READING_PREFS_STORAGE_KEY = 'reading-prefs';
export const READING_MODE_STORAGE_KEY = 'reading-mode';
export const READING_FOCUS_URL_PARAM = 'focus';

export type ReadingMode = 'standard' | 'focus' | 'guide';
export type NonStandardReadingMode = Exclude<ReadingMode, 'standard'>;
export type ReadingTheme = 'auto' | 'paper' | 'sepia' | 'night';
export type ReadingFontSize = 0 | 1 | 2 | 3;
export type ReadingLineHeight = 0 | 1 | 2;
export type ReadingPageWidth = 0 | 1 | 2;
export type ReadingFocusStyle = 'paragraph' | 'line';

export interface ReadingPrefs {
  fontSize: ReadingFontSize;
  lineHeight: ReadingLineHeight;
  pageWidth: ReadingPageWidth;
  theme: ReadingTheme;
  focusStyle: ReadingFocusStyle;
  bionic: boolean;
  reminder: boolean;
}

export const DEFAULT_READING_PREFS: ReadingPrefs = {
  fontSize: 1,
  lineHeight: 1,
  pageWidth: 1,
  theme: 'auto',
  focusStyle: 'paragraph',
  bionic: false,
  reminder: false,
};

/**
 * CSS 变量映射表。字号/行高/页宽的每一档都对应一个具体值，
 * 由 useReadingMode 写到 <html> 上，供 .article-body 等消费。
 * 页宽以 rem 计：38rem≈34 字 / 44rem≈39 字 / 50rem≈44 字（18px 字号）。
 */
export const READING_FONT_SIZE_VARS: readonly Record<string, string>[] = [
  {
    '--reading-body-size': '1.0625rem',
    '--reading-h2-size': '1.3rem',
    '--reading-h3-size': '1.15rem',
    '--reading-code-size': '0.84rem',
  },
  {
    '--reading-body-size': '1.25rem',
    '--reading-h2-size': '1.5rem',
    '--reading-h3-size': '1.3rem',
    '--reading-code-size': '0.92rem',
  },
  {
    '--reading-body-size': '1.4rem',
    '--reading-h2-size': '1.68rem',
    '--reading-h3-size': '1.44rem',
    '--reading-code-size': '1rem',
  },
  {
    '--reading-body-size': '1.55rem',
    '--reading-h2-size': '1.85rem',
    '--reading-h3-size': '1.6rem',
    '--reading-code-size': '1.08rem',
  },
];

export const READING_LINE_HEIGHT_VARS: readonly Record<string, string>[] = [
  {
    '--reading-body-lh': '1.85',
    '--reading-list-lh': '1.8',
    '--reading-quote-lh': '1.85',
  },
  {
    '--reading-body-lh': '2.05',
    '--reading-list-lh': '1.95',
    '--reading-quote-lh': '2',
  },
  {
    '--reading-body-lh': '2.3',
    '--reading-list-lh': '2.15',
    '--reading-quote-lh': '2.2',
  },
];

export const READING_PAGE_WIDTH_VARS: readonly Record<string, string>[] = [
  { '--reading-page-width': '38rem' },
  { '--reading-page-width': '44rem' },
  { '--reading-page-width': '50rem' },
];

/** 全部阅读 CSS 变量名（退出模式时逐一清除） */
export const READING_CSS_VAR_NAMES = [
  ...Object.keys(READING_FONT_SIZE_VARS[0]),
  ...Object.keys(READING_LINE_HEIGHT_VARS[0]),
  ...Object.keys(READING_PAGE_WIDTH_VARS[0]),
] as const;

const THEMES: readonly ReadingTheme[] = ['auto', 'paper', 'sepia', 'night'];
const FOCUS_STYLES: readonly ReadingFocusStyle[] = ['paragraph', 'line'];

function isOneOf<T extends string | number>(value: unknown, allowed: readonly T[]): value is T {
  return allowed.includes(value as T);
}

function clampGear(value: unknown, max: number): number {
  const n = typeof value === 'number' ? Math.floor(value) : NaN;
  if (Number.isNaN(n) || n < 0) {
    return 0;
  }
  return Math.min(n, max);
}

function readJson(key: string): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function readReadingPrefs(): ReadingPrefs {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_READING_PREFS };
  }
  const stored = readJson(READING_PREFS_STORAGE_KEY);
  if (!stored) {
    return { ...DEFAULT_READING_PREFS };
  }
  return {
    fontSize: clampGear(stored.fontSize, 3) as ReadingFontSize,
    lineHeight: clampGear(stored.lineHeight, 2) as ReadingLineHeight,
    pageWidth: clampGear(stored.pageWidth, 2) as ReadingPageWidth,
    theme: isOneOf(stored.theme, THEMES) ? stored.theme : DEFAULT_READING_PREFS.theme,
    focusStyle: isOneOf(stored.focusStyle, FOCUS_STYLES)
      ? stored.focusStyle
      : DEFAULT_READING_PREFS.focusStyle,
    bionic: stored.bionic === true,
    reminder: stored.reminder === true,
  };
}

export function saveReadingPrefs(prefs: ReadingPrefs): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(READING_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // 存储受限（隐私模式等）时静默降级：本次会话内仍可正常调节
  }
}

/** 读取上次使用的模式（含 standard），用于下次进入文章页时自动恢复 */
export function readSavedReadingMode(): ReadingMode {
  if (typeof window === 'undefined') {
    return 'standard';
  }
  try {
    const stored = localStorage.getItem(READING_MODE_STORAGE_KEY);
    return stored === 'focus' || stored === 'guide' ? stored : 'standard';
  } catch {
    return 'standard';
  }
}

export function saveReadingMode(mode: ReadingMode): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(READING_MODE_STORAGE_KEY, mode);
  } catch {}
}

/** URL 是否带 ?focus=1（分享出去的"纯净版"链接） */
export function hasFocusUrlParam(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return new URL(window.location.href).searchParams.get(READING_FOCUS_URL_PARAM) === '1';
  } catch {
    return false;
  }
}

/** 进入/退出专注模式时同步 URL（replaceState，不污染历史栈） */
export function setFocusUrlParam(active: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const url = new URL(window.location.href);
    if (active) {
      url.searchParams.set(READING_FOCUS_URL_PARAM, '1');
    } else {
      url.searchParams.delete(READING_FOCUS_URL_PARAM);
    }
    window.history.replaceState(null, '', url.toString());
  } catch {
    // 历史栈不可用时静默跳过，模式本身不受影响
  }
}
