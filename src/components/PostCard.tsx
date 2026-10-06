import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, Star } from 'lucide-react';
import { Post, loadPostContent } from '../utils/markdown';
import { useAppContext } from '../context/AppContext';
import { getViews } from '../utils/storage';
import { getCategoryLabel } from '../config/categories';
import { formatDate } from '../utils/dateFormat';

interface PostCardProps {
  post: Post;
  showCover?: boolean;
}

export default function PostCard({ post, showCover = false }: PostCardProps) {
  const { lang, t } = useAppContext();
  const { title, title_en, date, category, tags, coverImage, gem } = post.frontmatter;
  const views = getViews(post.slug);

  // 预取正文 chunk：hover / 键盘聚焦时提前拉取，点开即达
  // （loadPostContent 自带缓存；省流模式或低速网络下跳过，避免浪费流量）
  const prefetchContent = useCallback(() => {
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection;
    if (connection?.saveData || connection?.effectiveType === 'slow-2g') {
      return;
    }
    loadPostContent(post.slug).catch(() => {
      /* 预取失败静默：正式进入文章页时还有重试机制 */
    });
  }, [post.slug]);

  const displayTitle = lang === 'en' && title_en ? title_en : title;
  const categoryLabel = getCategoryLabel(category, lang === 'en' ? 'en' : 'zh');
  const formattedDate = formatDate(date, lang === 'en' ? 'en' : 'zh');

  return (
    <article
      id={`post-card-${post.slug}`}
      onPointerEnter={prefetchContent}
      onFocus={prefetchContent}
      className="group flex flex-col md:flex-row gap-6 py-6 border-b border-stone-100 dark:border-stone-800/50 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors rounded-2xl -mx-4 px-4"
    >
      {showCover && coverImage && (
        <Link
          id={`post-card-img-link-${post.slug}`}
          to={`/posts/${post.slug}`}
          className="md:w-1/3 aspect-video md:aspect-[4/3] overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800 shrink-0 relative"
        >
          <img
            id={`post-card-img-${post.slug}`}
            src={coverImage}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          {gem && (
            <div
              id={`post-card-gem-${post.slug}`}
              className="absolute top-2 right-2 bg-yellow-400/90 text-yellow-900 p-1.5 rounded-lg backdrop-blur-sm shadow-sm"
              title="Gem"
            >
              <Star size={16} className="fill-current" />
            </div>
          )}
        </Link>
      )}

      <div
        id={`post-card-content-${post.slug}`}
        className="flex-1 flex flex-col justify-center min-w-0"
      >
        <div
          id={`post-card-meta-${post.slug}`}
          className="flex items-center gap-3 mb-3 text-xs font-medium text-stone-500 dark:text-stone-400"
        >
          <span className="text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            {categoryLabel}
          </span>
          <span>•</span>
          <time dateTime={date}>{formattedDate}</time>
        </div>

        <Link
          id={`post-card-title-link-${post.slug}`}
          to={`/posts/${post.slug}`}
          className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
        >
          <h2
            id={`post-card-title-${post.slug}`}
            className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3 leading-tight line-clamp-2"
          >
            {displayTitle}
          </h2>
        </Link>

        <div
          id={`post-card-footer-${post.slug}`}
          className="flex items-center justify-between mt-auto pt-2"
        >
          <div id={`post-card-tags-${post.slug}`} className="flex items-center gap-2 flex-wrap">
            {tags?.slice(0, 3).map(tag => (
              <span
                key={tag}
                id={`post-card-tag-${post.slug}-${tag}`}
                className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-md text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div
            id={`post-card-stats-${post.slug}`}
            className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400 shrink-0"
          >
            <span id={`post-card-readtime-${post.slug}`} className="flex items-center gap-1.5">
              <Clock size={14} />
              {post.readTime} {t('read_min')}
            </span>
            <span id={`post-card-views-${post.slug}`} className="flex items-center gap-1.5">
              <Eye size={14} />
              {views}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
