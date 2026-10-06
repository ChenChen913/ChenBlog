import React from 'react';
import { getAllPosts } from '../utils/markdown';
import PostCard from '../components/PostCard';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import { usePageMeta } from '../hooks/usePageMeta';

export default function Highlights() {
  const { t } = useAppContext();
  const posts = getAllPosts();
  const highlights = posts.filter(p => p.frontmatter.gem);

  // 🔧 SEO：精选页动态元数据
  usePageMeta({
    title: `${t('nav_highlights')} | MaoChen Blog`,
    description: t('highlights_subtitle'),
  });

  return (
    <motion.div 
      id="highlights-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-12"
    >
      <header id="highlights-header" className="space-y-4">
        <h1 id="highlights-title" className="text-4xl md:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {t('nav_highlights')}
        </h1>
        <p id="highlights-subtitle" className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
          {t('highlights_subtitle')}
        </p>
      </header>

      {highlights.length === 0 ? (
        <div id="no-highlights-message" className="py-20 text-center text-stone-500 dark:text-stone-400">
          {t('no_highlights')}
        </div>
      ) : (
        <div id="highlights-post-list" className="flex flex-col gap-4">
          {highlights.map(post => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
