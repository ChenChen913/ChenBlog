import React, { useMemo } from 'react';
import { getAllPosts, type Post } from '../utils/markdown';
import PostCard from './PostCard';
import { useAppContext } from '../context/AppContext';

interface RelatedPostsProps {
  currentSlug: string;
  tags?: string[];
  category?: string;
  /** 展示的推荐数量，默认 2 */
  limit?: number;
}

/**
 * 相关文章推荐：按标签交集数量排序，交集为零时回退到同分类最新文章。
 * 复用 PostCard 保持与首页/精选页完全一致的卡片视觉。
 */
export default function RelatedPosts({ currentSlug, tags, category, limit = 2 }: RelatedPostsProps) {
  const { t } = useAppContext();

  const related = useMemo(() => {
    const candidates = getAllPosts().filter(post => post.slug !== currentSlug);
    const tagSet = new Set(tags ?? []);

    const scored = candidates.map(post => {
      const overlap = (post.frontmatter.tags ?? []).reduce(
        (count, tag) => count + (tagSet.has(tag) ? 1 : 0),
        0
      );
      return { post, overlap };
    });

    // 第一梯队：有标签交集（按交集数降序，再按日期即列表顺序）
    const byTags = scored.filter(({ overlap }) => overlap > 0)
      .sort((a, b) => b.overlap - a.overlap)
      .map(({ post }) => post);

    // 第二梯队：同分类的最新文章补位
    const byCategory = candidates.filter(
      post => category && post.frontmatter.category === category && !byTags.includes(post)
    );

    const merged = [...byTags, ...byCategory];
    // 兜底：仍不足时用全局最新文章补齐，保证区域不会只在部分文章出现
    if (merged.length < limit) {
      for (const post of candidates) {
        if (!merged.includes(post)) {
          merged.push(post);
        }
        if (merged.length >= limit) {
          break;
        }
      }
    }

    return merged.slice(0, limit);
  }, [currentSlug, tags, category, limit]);

  if (related.length === 0) {
    return null;
  }

  return (
    <section id="related-posts" aria-labelledby="related-posts-title" className="mt-14">
      <div className="flex items-center gap-3 mb-2">
        <h2
          id="related-posts-title"
          className="text-lg font-bold text-stone-800 dark:text-stone-200 tracking-tight font-kai"
        >
          {t('related')}
        </h2>
        <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" aria-hidden="true" />
      </div>
      <div className="-mt-2">
        {related.map(post => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
