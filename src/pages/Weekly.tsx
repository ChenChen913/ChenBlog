import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts, loadPostContent, type Post } from '../utils/markdown';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import { usePageMeta } from '../hooks/usePageMeta';
import { prefetchRoute } from '../utils/route-prefetch';
import {
  buildYearStrip,
  formatListDate,
  formatWeekLabel,
  formatWeekRange,
  getCurrentWeekKey,
  groupPostsByWeek,
  type WeekGroup,
  type WeekKey,
} from '../utils/weekly';

/**
 * 周刊页（/weekly）—— 第三轮 UI 提案定稿 + 本轮交互升级
 * ------------------------------------------------------------------
 * 定位：周刊是「按周归档的文章视图」，不是独立刊物。
 *
 * 结构（自上而下）：
 *  1. 页头：周 刊 + WEEKLY 徽章 + 副标题
 *  2. 周历条（交互升级）：
 *     - 吸顶：向下滚动时玻璃刻度尺固定在视口顶部（图与列表「分离」），
 *       吸顶后统计行自动收起、玻璃加实，保持轻量不遮挡
 *     - 点击：有文章的周（着色格）可点击，平滑跳到下方对应的周分组
 *     - 联动：滚动到哪一周，周历条上对应格子高亮（光环 + 提亮），
 *       移动端同时自动居中该格子
 *     - 年份：发满两年后自动出现年份切换（滚动跨年时也会自动跟随）
 *     - 移动端：格子固定 12px 宽、整条横向滑动（「在图上滑动」），
 *       月份刻度与格子同轨滚动
 *  3. 周分组时间线：每周 = 周头行（日期区间为主标注 + 行尾周序）
 *     + 若干直达标题行——标题永远在对应日期的下方（定稿），
 *     周节点/条目点与轴线像素级对齐（--wk-axis 参数化定位）
 *
 * 三形态（一周的真实形态）：
 *  - 0 篇 → 整周不渲染，空档只体现在周历条上（诚实记录，不渲染噪声）
 *  - 1 篇 → 周头 + 单个直达标题行（点击即正文，无中间层）
 *  - 多篇 → 周头 + 多个直达标题行（信息量 = 单篇 × N，不多一个字）
 */
export default function Weekly() {
  const { t, lang } = useAppContext();

  // 🔧 SEO：周刊页动态元数据
  usePageMeta({
    title: `${t('nav_weekly')} | MaoChen Blog`,
    description: t('weekly_subtitle'),
  });

  const { groups, current, yearBuckets, totals } = useMemo(() => {
    const posts = getAllPosts();
    const grouped = groupPostsByWeek(posts);
    const now = getCurrentWeekKey();

    // 年份分桶（年倒序），组内周倒序
    const buckets: { year: number; groups: WeekGroup<Post>[] }[] = [];
    for (const group of grouped) {
      const last = buckets[buckets.length - 1];
      if (last && last.year === group.key.year) {
        last.groups.push(group);
      } else {
        buckets.push({ year: group.key.year, groups: [group] });
      }
    }

    const totalPosts = grouped.reduce((sum, group) => sum + group.posts.length, 0);
    const latestDate = grouped[0]?.posts[0]?.frontmatter.date;

    return {
      groups: grouped,
      current: now,
      yearBuckets: buckets,
      totals: { issues: grouped.length, posts: totalPosts, latestDate },
    };
  }, []);

  // 周历条当前展示的年份（默认最新有周刊的年份；滚动跨年时自动跟随）
  const [stripYear, setStripYear] = useState(() => yearBuckets[0]?.year ?? current.year);
  // 滚动联动：当前读到的那一周（驱动周历格高亮 + 移动端自动居中）
  const [activeWeek, setActiveWeek] = useState<WeekKey | null>(null);

  const stripCells = useMemo(
    () => buildYearStrip(stripYear, groups, current),
    [stripYear, groups, current]
  );

  const wrapRef = useRef<HTMLDivElement>(null);
  const stripScrollRef = useRef<HTMLDivElement>(null);
  // 滚动侦测的稳定参照（setState 只在变化时触发，避免闭包过期）
  const activeRef = useRef<string | null>(null);

  /* ------------------------------------------------------------------
   * 滚动联动（rAF 节流）：
   *  1. 吸顶状态 → .is-stuck（统计行收起、玻璃加实）
   *  2. 探测线（吸顶条底部 + 呼吸空间）扫过的最后一个周块 = 当前周
   * ------------------------------------------------------------------ */
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const wrap = wrapRef.current;
      if (!wrap) return;

      // 吸顶判定：sticky 生效后 wrap 顶边会钳制在 top 值上
      const rect = wrap.getBoundingClientRect();
      const stickyTop = parseFloat(getComputedStyle(wrap).top) || 0;
      wrap.classList.toggle('is-stuck', rect.top <= stickyTop + 0.5);

      // 周侦测：按文档序找「已滚过探测线」的最后一个周块
      const blocks = document.querySelectorAll<HTMLElement>('.wk-week-block');
      const probe = rect.bottom + 28;
      let hit: HTMLElement | null = null;
      for (const block of blocks) {
        if (block.getBoundingClientRect().top <= probe) {
          hit = block;
        } else {
          break;
        }
      }
      const key = hit ? `${hit.dataset.year}-W${hit.dataset.week}` : null;
      if (key !== activeRef.current) {
        activeRef.current = key;
        const next = hit
          ? { year: Number(hit.dataset.year), week: Number(hit.dataset.week) }
          : null;
        setActiveWeek(next);
        // 跨年跟随只绑定「激活周变化」时刻：滚动跨年时周历条跟着换年，
        // 但不会顶掉用户刚点击选择的年份（选年后滚动未越过新年份前不抢切）
        if (next) {
          setStripYear(prev => (next.year !== prev ? next.year : prev));
        }
      }
    };
    const onScroll = () => {
      if (!raf) {
        raf = requestAnimationFrame(measure);
      }
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, []);

  // 移动端横向滑动：当前周格子自动居中（仅位置变化明显时触发，不打架手滑）
  useEffect(() => {
    const scroller = stripScrollRef.current;
    if (!scroller || !activeWeek || activeWeek.year !== stripYear) {
      return;
    }
    const cell = scroller.querySelector<HTMLElement>(`[data-week="${activeWeek.week}"]`);
    if (!cell) {
      return;
    }
    const target = cell.offsetLeft - scroller.clientWidth / 2 + cell.offsetWidth / 2;
    if (Math.abs(target - scroller.scrollLeft) > 10) {
      scroller.scrollTo({ left: target, behavior: 'smooth' });
    }
  }, [activeWeek, stripYear]);

  /** 点击着色周格 → 平滑滚到下方对应的周分组（scroll-margin 预留吸顶条高度） */
  const jumpToWeek = useCallback((key: WeekKey) => {
    setActiveWeek(key);
    activeRef.current = `${key.year}-W${key.week}`;
    const target = document.getElementById(`wk-week-${key.year}-W${key.week}`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  /** 年份切换：周历条换年 + 滚到该年份的第一个周分组 */
  const selectYear = useCallback((year: number) => {
    setStripYear(year);
    const first = document.querySelector<HTMLElement>(
      `#weekly-groups section[data-year="${year}"] .wk-week-block`
    );
    first?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const displayTitle = (post: Post) =>
    lang === 'en' && post.frontmatter.title_en ? post.frontmatter.title_en : post.frontmatter.title;

  // 预取正文 chunk（与 PostTimeline 同款省流策略；同时预热文章页组件）
  const makePrefetch = (slug: string) => () => {
    prefetchRoute('post');
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection;
    if (connection?.saveData || connection?.effectiveType === 'slow-2g') {
      return;
    }
    loadPostContent(slug).catch(() => {
      /* 预取失败静默：正式进入文章页时还有重试机制 */
    });
  };

  const monthsScale =
    lang === 'en'
      ? ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov']
      : ['1月', '3月', '5月', '7月', '9月', '11月'];

  const years = yearBuckets.map(bucket => bucket.year);
  const cellCountText = (count: number) =>
    count > 0 ? ` · ${count} ${lang === 'en' ? (count > 1 ? 'posts' : 'post') : '篇'}` : '';

  return (
    <motion.div
      id="weekly-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="wk-page space-y-6"
    >
      <header id="weekly-header">
        <div className="wk-headline">
          <h1 id="weekly-title" className="wk-title">
            {t('nav_weekly')}
          </h1>
          <span className="wk-badge" aria-hidden="true">
            WEEKLY
          </span>
        </div>
        <p id="weekly-subtitle" className="wk-subtitle">
          {t('weekly_subtitle')}
        </p>
      </header>

      {/* 周历条（交互版）：吸顶玻璃刻度尺 + 点击跳周 + 滚动联动高亮 */}
      <div ref={wrapRef} id="weekly-strip-wrap" className="wk-sticky-wrap">
        <div
          id="weekly-strip"
          className="wk-strip"
          role="group"
          aria-label={lang === 'en' ? 'Weekly calendar navigation' : '周历导航'}
        >
          {/* 年份切换：发满两年后自动出现（单年不渲染，界面零噪声） */}
          {years.length > 1 && (
            <div className="wk-years">
              {years.map(year => (
                <button
                  key={year}
                  type="button"
                  className={year === stripYear ? 'wk-year-tab is-active' : 'wk-year-tab'}
                  aria-pressed={year === stripYear}
                  onClick={() => selectYear(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

          <div ref={stripScrollRef} className="wk-strip-scroll">
            <div className="wk-strip-ruler">
              <div className="wk-strip-cells">
                {stripCells.map(cell => {
                  const clickable = cell.count > 0;
                  const active =
                    activeWeek !== null &&
                    activeWeek.year === stripYear &&
                    activeWeek.week === cell.week;
                  const cls = [
                    'wk-cell',
                    clickable ? 'wk-cell--btn' : '',
                    cell.count === 1 ? 'wk-cell--p1' : '',
                    cell.count === 2 ? 'wk-cell--p2' : '',
                    cell.count >= 3 ? 'wk-cell--p3' : '',
                    cell.state === 'current' ? 'wk-cell--now' : '',
                    cell.state === 'future' ? 'wk-cell--future' : '',
                    active ? 'wk-cell--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  const label = `${stripYear} ${formatWeekLabel(
                    { year: stripYear, week: cell.week },
                    lang
                  )}${cellCountText(cell.count)}`;
                  return clickable ? (
                    <button
                      key={cell.week}
                      type="button"
                      data-week={cell.week}
                      className={cls}
                      title={label}
                      aria-label={label}
                      onClick={() => jumpToWeek({ year: stripYear, week: cell.week })}
                    />
                  ) : (
                    <div key={cell.week} className={cls} title={label} aria-hidden="true" />
                  );
                })}
              </div>
              <div className="wk-months" aria-hidden="true">
                {monthsScale.map(m => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="wk-stats">
            <span>
              {lang === 'en'
                ? `Published ${totals.issues} issue${totals.issues === 1 ? '' : 's'}`
                : `已发 ${totals.issues} 期`}
            </span>
            <span>
              {lang === 'en'
                ? `${totals.posts} post${totals.posts === 1 ? '' : 's'} in total`
                : `累计 ${totals.posts} 篇`}
            </span>
            {totals.latestDate && (
              <span>
                {lang === 'en' ? 'Latest ' : '最近 '}
                {formatListDate(totals.latestDate, lang)}
              </span>
            )}
            <span className="wk-legend">
              <i className="f1" />1
              <i className="f2" />
              2+
              <i className="now" />
              {lang === 'en' ? 'now' : '当前'}
            </span>
          </div>
        </div>
      </div>

      {/* 冷启动空态：还没有任何周刊文章 */}
      {groups.length === 0 && (
        <div id="weekly-empty" className="wk-empty" role="status">
          <div className="wk-empty-title">{t('weekly_empty_title')}</div>
          <p className="wk-empty-hint">
            {t('weekly_empty_hint')}{' '}
            <Link
              to="/"
              className="underline underline-offset-4 hover:text-stone-900 dark:hover:text-stone-100"
            >
              {lang === 'en' ? 'Back to posts' : '回文章列表逛逛'}
            </Link>
          </p>
        </div>
      )}

      {/* 周分组时间线：标题永远在对应日期的下方 */}
      <div id="weekly-groups" className="wk-groups">
        {yearBuckets.map(bucket => (
          <section key={bucket.year} data-year={bucket.year} aria-label={String(bucket.year)}>
            <div className="wk-year" id={`wk-year-${bucket.year}`}>
              <b>{bucket.year}</b>
            </div>
            {bucket.groups.map(group => {
              const isCurrent = group.key.year === current.year && group.key.week === current.week;
              return (
                <div
                  key={`${group.key.year}-W${group.key.week}`}
                  id={`wk-week-${group.key.year}-W${group.key.week}`}
                  data-year={group.key.year}
                  data-week={group.key.week}
                  className="wk-week-block mb-4"
                >
                  <div className={isCurrent ? 'wk-week wk-week--current' : 'wk-week'}>
                    <span className="wk-range">{formatWeekRange(group.key, lang)}</span>
                    <span className="wk-weekno">{formatWeekLabel(group.key, lang)}</span>
                  </div>
                  {group.posts.map(post => (
                    <Link
                      key={post.slug}
                      id={`wk-entry-${post.slug}`}
                      to={`/posts/${post.slug}`}
                      className="wk-entry"
                      onPointerEnter={makePrefetch(post.slug)}
                      onFocus={makePrefetch(post.slug)}
                    >
                      <span className="wk-entry-title">{displayTitle(post)}</span>
                    </Link>
                  ))}
                </div>
              );
            })}
          </section>
        ))}
      </div>
    </motion.div>
  );
}
