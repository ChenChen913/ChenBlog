import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts, loadPostContent, type Post } from '../utils/markdown';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import { usePageMeta } from '../hooks/usePageMeta';
import {
  buildYearStrip,
  formatListDate,
  formatWeekLabel,
  formatWeekRange,
  getCurrentWeekKey,
  groupPostsByWeek,
  type WeekGroup,
} from '../utils/weekly';

/**
 * 周刊页（/weekly）—— 第三轮 UI 提案定稿
 * ------------------------------------------------------------------
 * 定位：周刊是「按周归档的文章视图」，不是独立刊物。
 *
 * 结构（自上而下）：
 *  1. 页头：周 刊 + WEEKLY 徽章 + 副标题
 *  2. 周历条：28px 玻璃刻度尺，零动效（当前周只有静态描边）；
 *     一篇浅蓝、多篇深蓝、未来周 30% 透明
 *  3. 周分组时间线：每周 = 周头行（日期区间为主标注 + 行尾周序/篇数）
 *     + 若干直达标题行——标题永远在对应日期的下方（定稿），
 *     周节点/条目点与轴线像素级对齐（--wk-axis 参数化定位）
 *
 * 三形态（一周的真实形态）：
 *  - 0 篇 → 整周不渲染，空档只体现在周历条上（诚实记录，不渲染噪声）
 *  - 1 篇 → 周头 + 单个直达标题行（点击即正文，无中间层）
 *  - 多篇 → 周头标注篇数 + 多个直达标题行（信息量 = 单篇 × N，不多一个字）
 */
export default function Weekly() {
  const { t, lang } = useAppContext();

  // 🔧 SEO：周刊页动态元数据
  usePageMeta({
    title: `${t('nav_weekly')} | MaoChen Blog`,
    description: t('weekly_subtitle'),
  });

  const { groups, current, stripYear, stripCells, yearBuckets, totals } = useMemo(() => {
    const posts = getAllPosts();
    const grouped = groupPostsByWeek(posts);
    const now = getCurrentWeekKey();

    // 周历条展示「最新一个有周刊的年份」（无文章时退化为当前年）
    const year = grouped[0]?.key.year ?? now.year;
    const cells = buildYearStrip(year, grouped, now);

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
      stripYear: year,
      stripCells: cells,
      yearBuckets: buckets,
      totals: { issues: grouped.length, posts: totalPosts, latestDate },
    };
  }, []);

  const displayTitle = (post: Post) =>
    lang === 'en' && post.frontmatter.title_en ? post.frontmatter.title_en : post.frontmatter.title;

  // 预取正文 chunk（与 PostTimeline 同款省流策略）
  const makePrefetch = (slug: string) => () => {
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

      {/* 周历条：一年的刻度尺（格子是刻度不是动画） */}
      <div id="weekly-strip" className="wk-strip" aria-hidden="true">
        <div className="wk-strip-cells">
          {stripCells.map(cell => (
            <div
              key={cell.week}
              className={[
                'wk-cell',
                cell.count === 1 ? 'wk-cell--p1' : '',
                cell.count === 2 ? 'wk-cell--p2' : '',
                cell.count >= 3 ? 'wk-cell--p3' : '',
                cell.state === 'current' ? 'wk-cell--now' : '',
                cell.state === 'future' ? 'wk-cell--future' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              title={`${stripYear} ${formatWeekLabel({ year: stripYear, week: cell.week }, lang)}${
                cell.count > 0
                  ? ` · ${cell.count} ${lang === 'en' ? 'post' + (cell.count > 1 ? 's' : '') : '篇'}`
                  : ''
              }`}
            />
          ))}
        </div>
        <div className="wk-months">
          {monthsScale.map(m => (
            <span key={m}>{m}</span>
          ))}
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
          <section key={bucket.year} aria-label={String(bucket.year)}>
            <div className="wk-year" id={`wk-year-${bucket.year}`}>
              <b>{bucket.year}</b>
            </div>
            {bucket.groups.map(group => {
              const isCurrent = group.key.year === current.year && group.key.week === current.week;
              const countText =
                group.posts.length > 1
                  ? ` · ${group.posts.length} ${lang === 'en' ? 'posts' : '篇'}`
                  : '';
              return (
                <div
                  key={`${group.key.year}-W${group.key.week}`}
                  id={`wk-week-${group.key.year}-W${group.key.week}`}
                  className="mb-4"
                >
                  <div className={isCurrent ? 'wk-week wk-week--current' : 'wk-week'}>
                    <span className="wk-range">{formatWeekRange(group.key, lang)}</span>
                    <span className="wk-weekno">
                      {formatWeekLabel(group.key, lang)}
                      {countText}
                    </span>
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
