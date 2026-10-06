import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { type Post, loadPostContent } from '../utils/markdown';
import { useAppContext } from '../context/AppContext';

interface PostNavigationProps {
  /** 时间线上更早的一篇（“下一篇”） */
  olderPost?: Post;
  /** 时间线上更新的一篇（“上一篇”） */
  newerPost?: Post;
}

/**
 * 文章底部的上一篇 / 下一篇导航。
 * 卡片沿用站点现有的 stone 色系与圆角语言，hover 时轻微抬升，
 * 与液态玻璃体系（backdrop-blur 系列按钮）保持同一视觉家族。
 */
export default function PostNavigation({ olderPost, newerPost }: PostNavigationProps) {
  const { lang, t } = useAppContext();

  if (!olderPost && !newerPost) {
    return null;
  }

  const titleOf = (post: Post) =>
    lang === 'en' && post.frontmatter.title_en ? post.frontmatter.title_en : post.frontmatter.title;

  // 与 PostCard 同款预取：hover / 聚焦时拉取目标文章正文 chunk，点开即达
  const makePrefetch = (slug: string) => () => {
    loadPostContent(slug).catch(() => {});
  };

  return (
    <nav
      id="post-navigation"
      aria-label={lang === 'en' ? 'Post navigation' : '文章导航'}
      className="grid gap-3 sm:grid-cols-2"
    >
      {newerPost ? (
        <Link
          id={`post-nav-prev-${newerPost.slug}`}
          to={`/posts/${newerPost.slug}`}
          onPointerEnter={makePrefetch(newerPost.slug)}
          onFocus={makePrefetch(newerPost.slug)}
          className="group flex items-center gap-3 rounded-xl border border-stone-200 dark:border-stone-700/60 bg-white/60 dark:bg-stone-800/40 hover:bg-white/90 dark:hover:bg-stone-800/70 hover:border-stone-300 dark:hover:border-stone-600 transition-all duration-300 px-4 py-3.5 text-left"
        >
          <span className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-700/60 text-stone-500 dark:text-stone-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:-translate-x-0.5 transition-all">
            <ArrowLeft size={16} />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              {t('prev_post')}
            </span>
            <span className="block truncate text-sm font-medium text-stone-700 dark:text-stone-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-kai">
              {titleOf(newerPost)}
            </span>
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" className="hidden sm:block" />
      )}

      {olderPost ? (
        <Link
          id={`post-nav-next-${olderPost.slug}`}
          to={`/posts/${olderPost.slug}`}
          onPointerEnter={makePrefetch(olderPost.slug)}
          onFocus={makePrefetch(olderPost.slug)}
          className="group flex items-center justify-end gap-3 rounded-xl border border-stone-200 dark:border-stone-700/60 bg-white/60 dark:bg-stone-800/40 hover:bg-white/90 dark:hover:bg-stone-800/70 hover:border-stone-300 dark:hover:border-stone-600 transition-all duration-300 px-4 py-3.5 text-right"
        >
          <span className="min-w-0">
            <span className="block text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              {t('next_post')}
            </span>
            <span className="block truncate text-sm font-medium text-stone-700 dark:text-stone-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-kai">
              {titleOf(olderPost)}
            </span>
          </span>
          <span className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-700/60 text-stone-500 dark:text-stone-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all">
            <ArrowRight size={16} />
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" className="hidden sm:block" />
      )}
    </nav>
  );
}
