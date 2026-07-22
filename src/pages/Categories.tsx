import React, { useState } from 'react';
import { getAllPosts, getCategories } from '../utils/markdown';
import PostCard from '../components/PostCard';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';

export default function Categories() {
  const { t } = useAppContext();
  const posts = getAllPosts();
  const categories = getCategories();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredPosts = activeCategory 
    ? posts.filter(p => p.frontmatter.category === activeCategory)
    : posts;

  return (
    <motion.div 
      id="categories-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-12"
    >
      <header id="categories-header" className="space-y-4">
        <h1 id="categories-title" className="text-4xl md:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {t('nav_categories')}
        </h1>
        <p id="categories-subtitle" className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
          {t('categories_subtitle')}
        </p>
      </header>

      <div id="categories-filter" className="flex flex-wrap gap-3">
        <button
          id="category-btn-all"
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 text-sm transition-all duration-200 ${
            activeCategory === null ? 'cat-glass-active' : 'cat-glass-normal'
          }`}
        >
          {t('view_all')}
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            id={`category-btn-${cat}`}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-sm transition-all duration-200 ${
              activeCategory === cat ? 'cat-glass-active' : 'cat-glass-normal'
            }`}
          >
            {t(`category_${cat}` as any) || cat}
            <span className="ml-2 opacity-60 text-xs">
              {posts.filter(p => p.frontmatter.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      <div id="categories-post-list" className="flex flex-col gap-4">
        {filteredPosts.map(post => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </motion.div>
  );
}
