import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { type Post, getAllPosts, loadPostContent } from '../utils/markdown';
import { useAppContext } from '../context/AppContext';
import { formatListDate } from '../utils/weekly';
import { prefetchRoute } from '../utils/route-prefetch';

interface RelatedPostsProps {
  currentSlug: string;
  tags?: string[];
  /** 展示的推荐数量上限，默认 4 */
  limit?: number;
}

/**
 * 相关文章推荐（只认共同标签）：
 * - 相关性标准：与当前文章存在重复标签（同分类但无共同标签不算相关，
 *   避免「随笔」和「产品」这类内容毫不相干的文章被硬凑到一起）
 * - 数量规则：有几篇列几篇，最多 limit（默认 4）篇；
 *   无任何相关文章时整个栏目不渲染（标题也不出现）
 * - 排序：共同标签数降序，同分按日期新者优先
 * - 样式：Markdown 式无序圆点列表（弱化排版，无时间轴），字重常规不加粗
 */
export default function RelatedPosts({ currentSlug, tags, limit = 4 }: RelatedPostsProps) {
  const { lang, t } = useAppContext();

  const related = useMemo(() => {
    const candidates = getAllPosts().filter(post => post.slug !== currentSlug);
    const tagSet = new Set(tags ?? []);

    return candidates
      .map(post => {
        const overlap = (post.frontmatter.tags ?? []).reduce(
          (count, tag) => count + (tagSet.has(tag) ? 1 : 0),
          0
        );
        return { post, overlap };
      })
      .filter(({ overlap }) => overlap > 0)
      .sort(
        (a, b) =>
          b.overlap - a.overlap ||
          new Date(b.post.frontmatter.date).getTime() - new Date(a.post.frontmatter.date).getTime()
      )
      .slice(0, limit)
      .map(({ post }) => post);
  }, [currentSlug, tags, limit]);

  // 预取正文 chunk：hover / 键盘聚焦时提前拉取，点开即达
  // （省流模式或低速网络下跳过，避免浪费流量；同时预热文章页组件 chunk）
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

  if (related.length === 0) {
    return null;
  }

  const titleOf = (post: Post) =>
    lang === 'en' && post.frontmatter.title_en ? post.frontmatter.title_en : post.frontmatter.title;

  return (
    <section id="related-posts" aria-labelledby="related-posts-title" className="mt-14">
      <div className="flex items-center gap-3 mb-2">
        <h2
          id="related-posts-title"
          className="text-[15px] font-normal text-stone-500 dark:text-stone-400 tracking-wide font-kai"
        >
          {t('related')}
        </h2>
        <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" aria-hidden="true" />
      </div>
      <ul className="list-disc pl-6 space-y-0.5 marker:text-stone-400 dark:marker:text-stone-500">
        {related.map(post => (
          <li key={post.slug}>
            <Link
              id={`related-row-${post.slug}`}
              to={`/posts/${post.slug}`}
              onPointerEnter={makePrefetch(post.slug)}
              onFocus={makePrefetch(post.slug)}
              className="group flex items-baseline gap-3 py-1.5"
            >
              <span className="font-kai text-[17px] font-normal text-stone-900 dark:text-stone-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors min-w-0">
                {titleOf(post)}
              </span>
              <time
                className="ml-auto shrink-0 font-kai text-sm text-stone-500 dark:text-stone-400"
                dateTime={post.frontmatter.date}
              >
                {formatListDate(post.frontmatter.date, lang)}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
