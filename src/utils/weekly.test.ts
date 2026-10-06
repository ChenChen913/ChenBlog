import { describe, expect, it } from 'vitest';
import {
  buildYearStrip,
  formatListDate,
  formatMonthRange,
  formatWeekLabel,
  formatWeekRange,
  getCurrentWeekKey,
  getISOWeekKey,
  getWeekDateRange,
  groupPostsByWeek,
  weeksInYear,
  type WeeklyPostLike,
} from './weekly';

const iso = (d: Date) => d.toISOString().slice(0, 10);

describe('getISOWeekKey', () => {
  it('常规日期：2026-10-06（周二）→ 2026 年第 41 周', () => {
    expect(getISOWeekKey('2026-10-06')).toEqual({ year: 2026, week: 41 });
  });

  it('年初：1 月 1 日为周四时即第 1 周（2026-01-01 → W1）', () => {
    expect(getISOWeekKey('2026-01-01')).toEqual({ year: 2026, week: 1 });
  });

  it('跨年归属：2024-12-30（周一）属于 2025 年第 1 周', () => {
    expect(getISOWeekKey('2024-12-30')).toEqual({ year: 2025, week: 1 });
  });

  it('53 周年：2021-01-01（周五）属于 2020 年第 53 周', () => {
    expect(getISOWeekKey('2021-01-01')).toEqual({ year: 2020, week: 53 });
  });

  it('2027-01-01（周五）滚入 2026 年第 53 周（2026 为 53 周年）', () => {
    expect(getISOWeekKey('2027-01-01')).toEqual({ year: 2026, week: 53 });
  });
});

describe('getWeekDateRange', () => {
  it('2026-W41 → 周一 10.05 至周日 10.11', () => {
    const { start, end } = getWeekDateRange({ year: 2026, week: 41 });
    expect(iso(start)).toBe('2026-10-05');
    expect(iso(end)).toBe('2026-10-11');
  });

  it('2026-W1 起始于上个自然年的周一（2025-12-29）', () => {
    const { start, end } = getWeekDateRange({ year: 2026, week: 1 });
    expect(iso(start)).toBe('2025-12-29');
    expect(iso(end)).toBe('2026-01-04');
  });
});

describe('weeksInYear', () => {
  it('2026（元旦为周四）有 53 周', () => {
    expect(weeksInYear(2026)).toBe(53);
  });

  it('2025 有 52 周', () => {
    expect(weeksInYear(2025)).toBe(52);
  });
});

describe('groupPostsByWeek', () => {
  const posts: WeeklyPostLike[] = [
    { slug: 'w41-a', frontmatter: { date: '2026-10-06', weekly: true } },
    { slug: 'normal', frontmatter: { date: '2026-10-05' } }, // 非 weekly：不参与
    { slug: 'w40-a', frontmatter: { date: '2026-10-01', weekly: true } },
    { slug: 'w39-b', frontmatter: { date: '2026-09-25', weekly: true } },
    { slug: 'w39-a', frontmatter: { date: '2026-09-23', weekly: true } },
  ];

  it('按周分组、周倒序、组内日期倒序，且只收 weekly 文章', () => {
    const groups = groupPostsByWeek(posts);
    expect(groups.map(g => `${g.key.year}-W${g.key.week}`)).toEqual([
      '2026-W41',
      '2026-W40',
      '2026-W39',
    ]);
    expect(groups[0].posts.map(p => p.slug)).toEqual(['w41-a']);
    expect(groups[2].posts.map(p => p.slug)).toEqual(['w39-b', 'w39-a']);
  });

  it('空列表 / 无 weekly 文章 → 空分组（冷启动空态）', () => {
    expect(groupPostsByWeek([])).toEqual([]);
    expect(groupPostsByWeek([{ slug: 'x', frontmatter: { date: '2026-10-06' } }])).toEqual([]);
  });

  it('一周 0 篇自然缺席：W38 无文章则不出现', () => {
    const groups = groupPostsByWeek(posts);
    expect(groups.some(g => g.key.week === 38)).toBe(false);
  });
});

describe('buildYearStrip', () => {
  const posts: WeeklyPostLike[] = [
    { slug: 'a', frontmatter: { date: '2026-10-06', weekly: true } },
    { slug: 'b', frontmatter: { date: '2026-10-01', weekly: true } },
    { slug: 'c', frontmatter: { date: '2026-09-23', weekly: true } },
    { slug: 'd', frontmatter: { date: '2026-09-25', weekly: true } },
  ];
  const groups = groupPostsByWeek(posts);

  it('2026 年共 53 格；W39=2 篇、W40=1 篇、W41=1 篇', () => {
    const cells = buildYearStrip(2026, groups, { year: 2026, week: 41 });
    expect(cells).toHaveLength(53);
    expect(cells.find(c => c.week === 39)?.count).toBe(2);
    expect(cells.find(c => c.week === 40)?.count).toBe(1);
    expect(cells.find(c => c.week === 41)?.count).toBe(1);
  });

  it('状态划分：当前周恰有一格 current，其后 future，此前 past', () => {
    const cells = buildYearStrip(2026, groups, { year: 2026, week: 41 });
    expect(cells.filter(c => c.state === 'current')).toHaveLength(1);
    expect(cells.find(c => c.state === 'current')?.week).toBe(41);
    expect(cells.find(c => c.week === 42)?.state).toBe('future');
    expect(cells.find(c => c.week === 40)?.state).toBe('past');
  });
});

describe('格式化（zh / en）', () => {
  it('周区间：zh「09.28 – 10.04」/ en「Sep 28 – Oct 04」', () => {
    const key = { year: 2026, week: 40 };
    expect(formatWeekRange(key, 'zh')).toBe('09.28 – 10.04');
    expect(formatWeekRange(key, 'en')).toBe('Sep 28 – Oct 04');
  });

  it('周序：zh「第 41 周」/ en「Week 41」', () => {
    expect(formatWeekLabel({ year: 2026, week: 41 }, 'zh')).toBe('第 41 周');
    expect(formatWeekLabel({ year: 2026, week: 41 }, 'en')).toBe('Week 41');
  });

  it('列表行尾日期：zh「10.06」/ en「Oct 06」', () => {
    expect(formatListDate('2026-10-06', 'zh')).toBe('10.06');
    expect(formatListDate('2026-10-06', 'en')).toBe('Oct 06');
  });

  it('月份组头：跨月给区间，同月退化为单月', () => {
    expect(formatMonthRange('2026-10-06', '2026-09-18', 'zh')).toBe('2026 · 10 月 — 9 月');
    expect(formatMonthRange('2026-10-06', '2026-09-18', 'en')).toBe('2026 · Oct — Sep');
    expect(formatMonthRange('2026-08-30', '2026-08-15', 'zh')).toBe('2026 · 8 月');
  });
});

describe('getCurrentWeekKey', () => {
  it('与 getISOWeekKey 同口径（UTC 当日）', () => {
    expect(getCurrentWeekKey(new Date('2026-10-06T12:00:00Z'))).toEqual(
      getISOWeekKey('2026-10-06')
    );
  });
});
