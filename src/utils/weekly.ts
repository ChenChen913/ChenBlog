/**
 * 周刊数据模型工具
 * ------------------------------------------------------------------
 * 周刊的定义（第三轮 UI 提案定稿）：「一周写的文章」，是文章的一个属性
 * （frontmatter weekly: true），不是独立实体。
 *
 * 本模块负责：
 *  - ISO 8601 周号计算（周一为一周之始，第 1 周含当年首个周四）
 *  - 周键（如 "2026-W41"）与日期区间的互转
 *  - 把带 weekly 属性的文章按周分组（倒序），驱动 /weekly 页渲染
 *
 * 页面渲染规则（三形态）：
 *  - 一周 0 篇 → 该周不渲染（空档只体现在周历条上）
 *  - 一周 1 篇 → 周头行 + 单个直达标题行
 *  - 一周多篇 → 周头行（标注篇数）+ 多个直达标题行
 */

/** ISO 周键：year 为 ISO 周历年（可能与自然年不同），week 为 1-53 */
export interface WeekKey {
  year: number;
  week: number;
}

/** 一个周组：同周发表的周刊文章（组内按日期倒序） */
export interface WeekGroup<T extends WeeklyPostLike = WeeklyPostLike> {
  key: WeekKey;
  /** 组内文章，按日期倒序 */
  posts: T[];
}

/** 分组所需的最小文章形状（避免与 Post 类型强耦合，便于单测） */
export interface WeeklyPostLike {
  slug: string;
  frontmatter: {
    date: string;
    weekly?: boolean;
  };
}

/** 把日期字符串（YYYY-MM-DD）按 UTC 解析为 Date（与全站日期口径一致，避免时区漂移） */
function parseUTC(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

/** 取 ISO 周历的「周四」：任意日期映射到本周四，是 ISO 周号的锚点 */
function thursdayOf(date: Date): Date {
  // 周一基准索引：Mon=0 … Sun=6；周四固定滞后 3 天，(3 - dow) 对七天全成立
  const dow = (date.getUTCDay() + 6) % 7;
  const shifted = new Date(date.getTime());
  shifted.setUTCDate(shifted.getUTCDate() + (3 - dow));
  return shifted;
}

/**
 * ISO 8601 周号。
 * 规则：周一为一周之始；含当年第一个周四的那周为第 1 周；
 * 12 月末 / 1 月初的日期可能归属相邻年（ISO 周历年）。
 */
export function getISOWeekKey(dateStr: string): WeekKey {
  const date = parseUTC(dateStr);
  const thursday = thursdayOf(date);
  // 1 月 1 日 ~ 1 月 4 日必然落在第 1 周（因为它必在某年的首个周四所在周内）
  const year = thursday.getUTCFullYear();
  const jan4 = Date.UTC(year, 0, 4);
  const firstThursday = thursdayOf(new Date(jan4));
  // 周号 = 与第 1 周周四相差的周数 + 1
  const week = Math.round((thursday.getTime() - firstThursday.getTime()) / (7 * 86400000)) + 1;
  return { year, week };
}

/** ISO 周的起始（周一）与结束（周日）日期 */
export function getWeekDateRange({ year, week }: WeekKey): { start: Date; end: Date } {
  // 该年第 1 周的周一：1 月 4 日所在周的周一
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const firstThursday = thursdayOf(jan4);
  const firstMonday = new Date(firstThursday.getTime() - 3 * 86400000);
  const start = new Date(firstMonday.getTime() + (week - 1) * 7 * 86400000);
  const end = new Date(start.getTime() + 6 * 86400000);
  return { start, end };
}

/** 当前日期所在的 ISO 周键（用于周历条的「当前周」描边） */
export function getCurrentWeekKey(now = new Date()): WeekKey {
  return getISOWeekKey(now.toISOString().slice(0, 10));
}

/**
 * 按周分组（倒序：最新周在前），并过滤出 weekly 文章。
 * 输入应为「按日期倒序」的文章列表（getAllPosts 的天然顺序），
 * 输出组内同样保持日期倒序。
 */
export function groupPostsByWeek<T extends WeeklyPostLike>(posts: T[]): WeekGroup<T>[] {
  const byWeek = new Map<string, WeekGroup<T>>();

  for (const post of posts) {
    if (!post.frontmatter.weekly) continue;
    const key = getISOWeekKey(post.frontmatter.date);
    const mapKey = `${key.year}-W${key.week}`;
    let group = byWeek.get(mapKey);
    if (!group) {
      group = { key, posts: [] };
      byWeek.set(mapKey, group);
    }
    group.posts.push(post);
  }

  const groups = Array.from(byWeek.values());
  // 周倒序；组内按日期倒序（输入顺序即倒序，稳妥起见再排一次）
  groups.sort((a, b) => weekValue(b.key) - weekValue(a.key));
  for (const group of groups) {
    group.posts.sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
  }
  return groups;
}

function weekValue({ year, week }: WeekKey): number {
  return year * 100 + week;
}

/* ------------------------------------------------------------------ *
 * 展示格式化：日期数字统一交给 CSS 的楷体字体（.num-kai），
 * 这里只负责产出文本内容。
 * ------------------------------------------------------------------ */

const MONTHS_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const pad2 = (n: number) => String(n).padStart(2, '0');

/** 周区间的主标注：zh「10.06 – 10.12」/ en「Oct 06 – Oct 12」 */
export function formatWeekRange(key: WeekKey, lang: 'zh' | 'en'): string {
  const { start, end } = getWeekDateRange(key);
  if (lang === 'en') {
    return `${MONTHS_EN[start.getUTCMonth()]} ${pad2(start.getUTCDate())} – ${MONTHS_EN[end.getUTCMonth()]} ${pad2(end.getUTCDate())}`;
  }
  return `${pad2(start.getUTCMonth() + 1)}.${pad2(start.getUTCDate())} – ${pad2(end.getUTCMonth() + 1)}.${pad2(end.getUTCDate())}`;
}

/** 周序的辅标注：zh「第 41 周」/ en「Week 41」 */
export function formatWeekLabel(key: WeekKey, lang: 'zh' | 'en'): string {
  return lang === 'en' ? `Week ${key.week}` : `第 ${key.week} 周`;
}

/** 列表行尾的日期：zh「10.06」/ en「Oct 06」 */
export function formatListDate(dateStr: string, lang: 'zh' | 'en'): string {
  const date = parseUTC(dateStr);
  if (lang === 'en') {
    return `${MONTHS_EN[date.getUTCMonth()]} ${pad2(date.getUTCDate())}`;
  }
  return `${date.getUTCMonth() + 1}.${pad2(date.getUTCDate())}`;
}

/**
 * 月份组头标签：zh「2026 · 10 月 — 9 月」/ en「2026 · Oct — Sep」。
 * from/to 为该组首尾文章的日期（YYYY-MM-DD），同月时退化为单月。
 */
export function formatMonthRange(from: string, to: string, lang: 'zh' | 'en'): string {
  const a = parseUTC(from);
  const b = parseUTC(to);
  const year = a.getUTCFullYear();
  if (lang === 'en') {
    const ma = MONTHS_EN[a.getUTCMonth()];
    const mb = MONTHS_EN[b.getUTCMonth()];
    return ma === mb ? `${year} · ${ma}` : `${year} · ${ma} — ${mb}`;
  }
  const ma = a.getUTCMonth() + 1;
  const mb = b.getUTCMonth() + 1;
  return ma === mb ? `${year} · ${ma} 月` : `${year} · ${ma} 月 — ${mb} 月`;
}

/**
 * 周历条数据：把当年 52/53 格的着色状态算好交给视图。
 * weeks: 已有文章的周 → 篇数；返回每格 { week, count, state }。
 * state: 'past' | 'current' | 'future'
 */
export interface YearStripCell {
  week: number;
  count: number;
  state: 'past' | 'current' | 'future';
}

/** 计算某自然年（ISO 周历年）的周总数：52 或 53 */
export function weeksInYear(year: number): number {
  // 12 月 28 日永远在本年最后一个 ISO 周内
  return getISOWeekKey(`${year}-12-28`).week;
}

export function buildYearStrip(
  year: number,
  groups: WeekGroup[],
  current: WeekKey = getCurrentWeekKey()
): YearStripCell[] {
  const countByWeek = new Map<number, number>();
  for (const group of groups) {
    if (group.key.year !== year) continue;
    countByWeek.set(group.key.week, group.posts.length);
  }

  const total = weeksInYear(year);
  const cells: YearStripCell[] = [];
  for (let week = 1; week <= total; week++) {
    const state: YearStripCell['state'] =
      current.year < year || (current.year === year && week < current.week)
        ? 'past'
        : current.year === year && week === current.week
          ? 'current'
          : 'future';
    cells.push({ week, count: countByWeek.get(week) ?? 0, state });
  }
  return cells;
}
