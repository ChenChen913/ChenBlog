import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts } from '../utils/markdown';
import PostCard from '../components/PostCard';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import Pagination from '../components/Pagination';
import { formatDate } from '../utils/dateFormat';
import { usePageMeta } from '../hooks/usePageMeta';

export default function Home() {
  const { t, lang } = useAppContext();
  const posts = getAllPosts();
  const [currentPage, setCurrentPage] = useState(1);

  const POSTS_PER_PAGE = 10;

  const featuredPosts = posts.filter(p => p.frontmatter.featured).slice(0, 2);

  // 🔧 SEO：首页动态元数据
  usePageMeta({
    title: lang === 'en' ? 'MaoChen - Personal Blog' : 'MaoChen - 个人博客',
    description: t('home_subtitle'),
    ogType: 'website',
  });

  // 🔧 修复重复内容：近期列表排除已在推荐位展示的文章
  const featuredSlugs = new Set(featuredPosts.map(p => p.slug));
  const recentPosts = posts.filter(p => !featuredSlugs.has(p.slug));

  // 计算当前页显示的文章
  const currentPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    return recentPosts.slice(startIndex, endIndex);
  }, [recentPosts, currentPage]);

  const totalPages = Math.ceil(recentPosts.length / POSTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <motion.div 
      id="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-16"
    >
      <header id="home-header" className="space-y-4">
        <h1 id="home-title" className="text-4xl md:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {lang === 'en' ? (
            <>
              Hello, <span className="rainbow-word">World</span>
            </>
          ) : (
            <>
              你好，<span className="rainbow-word">世界</span>
            </>
          )}
        </h1>
        <p id="home-subtitle" className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
          {t('home_subtitle')}
        </p>
      </header>

      {featuredPosts.length > 0 && (
        <section id="featured-posts-section">
          <h2 id="featured-posts-title" className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-3 py-1 rounded-lg text-sm tracking-widest uppercase">
              {t('tab_recommend')}
            </span>
          </h2>
          <div id="featured-posts-grid" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredPosts.map(post => (
              <div key={post.slug} id={`featured-post-${post.slug}`} className="group relative flex flex-col gap-2">
                <div id={`featured-post-content-${post.slug}`}>
                  <div id={`featured-post-meta-${post.slug}`} className="flex items-center gap-3 mb-2 text-xs font-medium text-stone-500 dark:text-stone-400">
                    <span className="text-blue-600 dark:text-blue-400 uppercase tracking-wider">{t(`category_${post.frontmatter.category}` as any) || post.frontmatter.category}</span>
                    <span>•</span>
                    <time dateTime={post.frontmatter.date}>{formatDate(post.frontmatter.date, lang === 'en' ? 'en' : 'zh')}</time>
                  </div>
                  <Link id={`featured-post-link-title-${post.slug}`} to={`/posts/${post.slug}`} className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <h3 id={`featured-post-title-${post.slug}`} className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2 leading-tight line-clamp-2">
                      {lang === 'en' && post.frontmatter.title_en ? post.frontmatter.title_en : post.frontmatter.title}
                    </h3>
                  </Link>
                  <p id={`featured-post-excerpt-${post.slug}`} className="text-stone-600 dark:text-stone-400 line-clamp-2 text-sm">
                    {post.excerpt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="recent-posts-section">
        <h2 id="recent-posts-title" className="text-2xl font-bold mb-8 flex items-center gap-3">
          <span className="bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 px-3 py-1 rounded-lg text-sm tracking-widest uppercase">
            {t('recent_posts')}
          </span>
        </h2>
        <div id="recent-posts-list" className="flex flex-col gap-4">
          {currentPosts.map(post => (
            <PostCard key={post.slug} post={post} showCover={false} />
          ))}
        </div>

        {/* 分页组件 */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </section>
    </motion.div>
  );
}
