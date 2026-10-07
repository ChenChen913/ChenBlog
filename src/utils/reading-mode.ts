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
/** 段落聚焦范围：窄/标准/宽（量化为目标行数，段落仅作对齐边界） */
export type ReadingFocusSpan = 0 | 1 | 2;
/** 行标尺驱动方式：跟随光标（实体阅读尺隐喻）/ 固定位置（Immersive Reader 的 Line Focus） */
export type ReadingRulerStyle = 'follow' | 'fixed';
/** 固定标尺的行数：1 / 3 / 5 行 */
export type ReadingRulerLines = 0 | 1 | 2;
/** 固定标尺的位置：偏上 / 居中 / 偏下（以视口百分比定位） */
export type ReadingRulerPosition = 0 | 1 | 2;

export interface ReadingPrefs {
  fontSize: ReadingFontSize;
  lineHeight: ReadingLineHeight;
  pageWidth: ReadingPageWidth;
  theme: ReadingTheme;
  focusStyle: ReadingFocusStyle;
  /** 段落聚焦范围档位（窄/标准/宽 → 目标行数 6/12/20） */
  focusSpan: ReadingFocusSpan;
  rulerStyle: ReadingRulerStyle;
  rulerLines: ReadingRulerLines;
  rulerPosition: ReadingRulerPosition;
  /** 行标尺遮罩边缘的柔和渐变（关掉后尺内外硬边强对比） */
  rulerFade: boolean;
  /** 阅读模式下的一键返回顶部按钮 */
  backTop: boolean;
  bionic: boolean;
  reminder: boolean;
}

export const DEFAULT_READING_PREFS: ReadingPrefs = {
  fontSize: 1,
  lineHeight: 1,
  pageWidth: 1,
  theme: 'auto',
  focusStyle: 'paragraph',
  focusSpan: 1,
  rulerStyle: 'fixed',
  rulerLines: 1,
  rulerPosition: 1,
  rulerFade: true,
  backTop: true,
  bionic: false,
  reminder: false,
};

/** 段落聚焦范围档位 → 目标保持全亮的正文行数（按段落边界对齐取整） */
export const READING_FOCUS_SPAN_LINES: readonly number[] = [6, 12, 20];
/** 固定标尺位置档位 → 视口高度百分比（标尺带中心点） */
export const READING_RULER_POSITION_PCT: readonly number[] = [0.34, 0.48, 0.62];
/** 固定标尺行数档位 → 标尺带覆盖的正文行数 */
export const READING_RULER_LINES_COUNT: readonly number[] = [1, 3, 5];

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
const RULER_STYLES: readonly ReadingRulerStyle[] = ['follow', 'fixed'];

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
    focusSpan: clampGear(stored.focusSpan, 2) as ReadingFocusSpan,
    rulerStyle: isOneOf(stored.rulerStyle, RULER_STYLES)
      ? stored.rulerStyle
      : DEFAULT_READING_PREFS.rulerStyle,
    rulerLines: clampGear(stored.rulerLines, 2) as ReadingRulerLines,
    rulerPosition: clampGear(stored.rulerPosition, 2) as ReadingRulerPosition,
    // 布尔偏好缺省视为开启（老数据无此字段时保持旧行为不突变）
    rulerFade: stored.rulerFade !== false,
    backTop: stored.backTop !== false,
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
