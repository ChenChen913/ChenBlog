import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllPosts, getCategories } from '../utils/markdown';
import PostTimeline from '../components/PostTimeline';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import { usePageMeta } from '../hooks/usePageMeta';

/**
 * 分类页（第三轮 UI 提案定稿）
 * ------------------------------------------------------------------
 * 「分类信息去左侧导航看」的另一半：分类页才是分类信息的主场。
 *  - 列表与首页完全同款（PostTimeline），样式零分叉
 *  - 过滤 chips：全部 / 各分类 / ◆ 精选
 *  - 「◆ 精选」chip 是删掉 Highlights 页之后「只看精选」能力的
 *    唯一承接地——过滤不是栏目（/highlights 301 重定向至此 ?filter=gem）
 *  - 过滤状态写进 URL（?cat=xxx / ?filter=gem），可分享、可回退
 */
export default function Categories() {
  const { t } = useAppContext();
  const posts = getAllPosts();
  const categories = getCategories();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('cat');
  const gemOnly = searchParams.get('filter') === 'gem';

  // 🔧 SEO：分类页动态元数据
  usePageMeta({
    title: `${t('nav_categories')} | MaoChen Blog`,
    description: t('categories_subtitle'),
  });

  const selectAll = () => setSearchParams({}, { replace: true });
  const selectCategory = (cat: string) => setSearchParams({ cat }, { replace: true });
  const selectGem = () => setSearchParams({ filter: 'gem' }, { replace: true });

  const filteredPosts = useMemo(() => {
    if (gemOnly) {
      return posts.filter(p => p.frontmatter.gem === true);
    }
    if (activeCategory) {
      return posts.filter(p => p.frontmatter.category === activeCategory);
    }
    return posts;
  }, [posts, activeCategory, gemOnly]);

  return (
    <motion.div
      id="categories-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-10"
    >
      <header id="categories-header" className="space-y-4">
        <h1
          id="categories-title"
          className="text-4xl md:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100"
        >
          {t('nav_categories')}
        </h1>
        <p
          id="categories-subtitle"
          className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed"
        >
          {t('categories_subtitle')}
        </p>
      </header>

      <div
        id="categories-filter"
        className="flex flex-wrap gap-3"
        role="group"
        aria-label={t('nav_categories')}
      >
        <button
          id="category-btn-all"
          onClick={selectAll}
          aria-pressed={!activeCategory && !gemOnly}
          className={`px-4 py-2 text-sm transition-all duration-200 ${
            !activeCategory && !gemOnly ? 'cat-glass-active' : 'cat-glass-normal'
          }`}
        >
          {t('view_all')}
          <span className="ml-2 opacity-60 text-xs">{posts.length}</span>
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            id={`category-btn-${cat}`}
            onClick={() => selectCategory(cat)}
            aria-pressed={activeCategory === cat}
            className={`px-4 py-2 text-sm transition-all duration-200 ${
              activeCategory === cat && !gemOnly ? 'cat-glass-active' : 'cat-glass-normal'
            }`}
          >
            {t(`category_${cat}` as any) || cat}
            <span className="ml-2 opacity-60 text-xs">
              {posts.filter(p => p.frontmatter.category === cat).length}
            </span>
          </button>
        ))}
        {/* ◆ 精选：唯一保留下来的「只看精选」入口（过滤不是栏目） */}
        <button
          id="category-btn-gem"
          onClick={selectGem}
          aria-pressed={gemOnly}
          title={t('gem_filter')}
          className={`px-4 py-2 text-sm transition-all duration-200 ${
            gemOnly ? 'cat-glass-gem-active' : 'cat-glass-normal text-amber-700 dark:text-amber-400'
          }`}
        >
          <span aria-hidden="true" className="mr-1">
            ◆
          </span>
          {t('gem_filter')}
          <span className="ml-2 opacity-60 text-xs">
            {posts.filter(p => p.frontmatter.gem === true).length}
          </span>
        </button>
      </div>

      <div id="categories-post-list">
        <PostTimeline posts={filteredPosts} ariaLabel={t('nav_categories')} />
      </div>
    </motion.div>
  );
}
