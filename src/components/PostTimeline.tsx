import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { type Post, loadPostContent } from '../utils/markdown';
import { useAppContext } from '../context/AppContext';
import { formatListDate, formatMonthRange } from '../utils/weekly';

interface PostTimelineProps {
  posts: Post[];
  /** 无障碍：列表用途描述 */
  ariaLabel?: string;
}

/** 月份分组：同月相邻的文章归为一组，组头承载年月信息（行尾只留日子） */
interface MonthGroup {
  key: string; // YYYY-MM
  year: number;
  /** 组内最新一篇的日期（YYYY-MM-DD） */
  from: string;
  /** 组内最旧一篇的日期（YYYY-MM-DD） */
  to: string;
  posts: Post[];
}

function groupByMonth(posts: Post[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const post of posts) {
    const date = post.frontmatter.date;
    const yearMonth = date.slice(0, 7);
    const last = groups[groups.length - 1];
    if (last && last.key === yearMonth) {
      last.posts.push(post);
      last.to = date;
    } else {
      groups.push({
        key: yearMonth,
        year: Number(date.slice(0, 4)),
        from: date,
        to: date,
        posts: [post],
      });
    }
  }
  return groups;
}

/**
 * 时间轴文章列表（第三轮 UI 提案定稿）
 * ------------------------------------------------------------------
 * 一行只有三样东西：轴点标识 · 标题 · 时间。
 *  - gem 文章：轴点升级为金菱形（符号活在轴上，标题文字流零参与，
 *    所有标题起点严格左对齐——菱形破坏对齐的问题从几何上根治）
 *  - weekly 文章：无任何标识，与普通文章完全同形（「都是文章」）
 *  - 分类 / 摘要 / 阅读量 / 时长：全部让位给「分类页 + 搜索」
 *  - 行尾时间：14px 次级墨色楷体（日期数字用秀气字体的定稿）
 *  - hover 玻璃浮起 + 正文预取（沿用 PostCard 的省流策略）
 */
export default function PostTimeline({ posts, ariaLabel }: PostTimelineProps) {
  const { lang, t } = useAppContext();
  const groups = useMemo(() => groupByMonth(posts), [posts]);

  // 预取正文 chunk：hover / 键盘聚焦时提前拉取，点开即达
  // （省流模式或低速网络下跳过，避免浪费流量）
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

  if (posts.length === 0) {
    return (
      <p className="py-10 text-center text-stone-500 dark:text-stone-400" role="status">
        {t('no_search_results')}
      </p>
    );
  }

  return (
    <div className="pt-timeline" role="list" aria-label={ariaLabel}>
      {groups.map(group => {
        // 「2026 · 10 月 — 9 月」→ 年份单独加粗，月份区间跟随
        const monthsPart = formatMonthRange(group.from, group.to, lang).replace(/^\d{4}\s·\s/, '');
        return (
          <section key={group.key} className="pt-group" aria-label={`${group.year} ${monthsPart}`}>
            <div className="pt-group-label" id={`pt-group-${group.key}`}>
              <b>{group.year}</b>
              {monthsPart}
            </div>
            {group.posts.map(post => {
              const displayTitle =
                lang === 'en' && post.frontmatter.title_en
                  ? post.frontmatter.title_en
                  : post.frontmatter.title;
              const isGem = post.frontmatter.gem === true;
              return (
                <Link
                  key={post.slug}
                  id={`pt-row-${post.slug}`}
                  to={`/posts/${post.slug}`}
                  role="listitem"
                  className={isGem ? 'pt-row pt-row--gem' : 'pt-row'}
                  onPointerEnter={makePrefetch(post.slug)}
                  onFocus={makePrefetch(post.slug)}
                  title={isGem ? t('gem_badge') : undefined}
                >
                  <span className="pt-title">{displayTitle}</span>
                  <time className="pt-date" dateTime={post.frontmatter.date}>
                    {formatListDate(post.frontmatter.date, lang)}
                  </time>
                </Link>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
