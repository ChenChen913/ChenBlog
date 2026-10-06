import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getAllPosts, loadPostContent, type Post } from '../utils/markdown';
import { useAppContext } from '../context/AppContext';
import { formatWeekLabel, groupPostsByWeek } from '../utils/weekly';

interface WeeklyNavigationProps {
  /** 当前周刊文章的 slug */
  currentSlug: string;
}

/**
 * 周刊文章底部的「上一周 / 下一周」互链（第三轮提案 §3.3 触点 3）。
 *
 *  - 目标周 = 相邻的「有文章的周」（空周自然跳过，不预告、不占位）
 *  - 跳转落点 = 目标周内最新的一篇
 *  - 没有更新的周时渲染禁用态「待发布」，发布后自然点亮
 *  - 玻璃胶囊样式与全站按钮同一家族
 */
export default function WeeklyNavigation({ currentSlug }: WeeklyNavigationProps) {
  const { lang, t } = useAppContext();

  const { currentKey, prevPost, nextPost } = React.useMemo(() => {
    const weeklyPosts = getAllPosts().filter(p => p.frontmatter.weekly === true);
    const groups = groupPostsByWeek(weeklyPosts);
    const index = groups.findIndex(group => group.posts.some(p => p.slug === currentSlug));
    if (index === -1) {
      return { currentKey: undefined, prevPost: undefined, nextPost: undefined };
    }
    // groups 周倒序：index+1 是更早的周（上一周），index-1 是更新的周（下一周）
    const prevGroup = groups[index + 1];
    const nextGroup = groups[index - 1];
    return {
      currentKey: groups[index].key,
      prevPost: prevGroup?.posts[0],
      nextPost: nextGroup?.posts[0],
    };
  }, [currentSlug]);

  if (!currentKey) {
    return null;
  }

  const titleOf = (post: Post) =>
    lang === 'en' && post.frontmatter.title_en ? post.frontmatter.title_en : post.frontmatter.title;

  const makePrefetch = (slug: string) => () => {
    loadPostContent(slug).catch(() => {});
  };

  return (
    <div id="weekly-context" className="wk-context" aria-label={t('nav_weekly')}>
      <span className="wk-context-chip">
        {lang === 'en'
          ? `Weekly · ${formatWeekLabel(currentKey, 'en')}`
          : `周刊 · ${formatWeekLabel(currentKey, 'zh')}`}
      </span>

      <nav className="flex items-center gap-2.5 flex-wrap" aria-label={t('nav_weekly')}>
        {prevPost ? (
          <Link
            id={`wk-nav-prev-${prevPost.slug}`}
            to={`/posts/${prevPost.slug}`}
            onPointerEnter={makePrefetch(prevPost.slug)}
            onFocus={makePrefetch(prevPost.slug)}
            className="wk-navbtn"
          >
            <ArrowLeft size={13} className="shrink-0" aria-hidden />
            <span>
              {t('weekly_prev')} · {titleOf(prevPost)}
            </span>
          </Link>
        ) : (
          <button type="button" className="wk-navbtn" disabled aria-disabled="true">
            <ArrowLeft size={13} className="shrink-0" aria-hidden />
            <span>{t('weekly_prev')}</span>
          </button>
        )}

        {nextPost ? (
          <Link
            id={`wk-nav-next-${nextPost.slug}`}
            to={`/posts/${nextPost.slug}`}
            onPointerEnter={makePrefetch(nextPost.slug)}
            onFocus={makePrefetch(nextPost.slug)}
            className="wk-navbtn"
          >
            <span>
              {t('weekly_next')} · {titleOf(nextPost)}
            </span>
            <ArrowRight size={13} className="shrink-0" aria-hidden />
          </Link>
        ) : (
          <button type="button" className="wk-navbtn" disabled aria-disabled="true">
            <span>
              {t('weekly_next')} · {t('weekly_upcoming')}
            </span>
            <ArrowRight size={13} className="shrink-0" aria-hidden />
          </button>
        )}
      </nav>

      {!nextPost && (
        <span className="wk-context-hint">
          {lang === 'en'
            ? 'Lights up when the next week is out.'
            : '不预告、不占位，发布后自然点亮'}
        </span>
      )}
    </div>
  );
}
