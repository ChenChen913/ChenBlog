import React, { useState, useMemo } from 'react';
import { getAllPosts } from '../utils/markdown';
import PostTimeline from '../components/PostTimeline';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import Pagination from '../components/Pagination';
import { usePageMeta } from '../hooks/usePageMeta';
import JsonLd from '../components/JsonLd';

/**
 * 首页 = 纯文章列表（第三轮 UI 提案定稿）
 * ------------------------------------------------------------------
 * 「个人博客里全都是文章，没必要把类别分得那么清楚」：
 *  - 「精选」「最新周刊」等一切栏目模块全部撤下
 *  - gem / weekly / 普通文章按日期统一倒序混排（此前 featured 被
 *    排除出近期列表的逻辑一并反转——列表即首页，首页即列表）
 *  - gem 的全部存在形式 = 时间轴上的一个金色菱形（PostTimeline 内处理）
 *  - 周刊文章在首页无任何标识，想看周刊的人走左侧导航
 */
export default function Home() {
  const { t, lang } = useAppContext();
  const posts = getAllPosts();
  const [currentPage, setCurrentPage] = useState(1);

  const POSTS_PER_PAGE = 10;

  // 🔧 SEO：首页动态元数据
  usePageMeta({
    title: lang === 'en' ? 'MaoChen - Personal Blog' : 'MaoChen - 个人博客',
    description: t('home_subtitle'),
    ogType: 'website',
  });

  // 🔧 SEO：站点级 JSON-LD（WebSite + 作者信息）
  const websiteJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'MaoChen Blog',
      description: t('home_subtitle'),
      inLanguage: lang === 'en' ? 'en' : 'zh-CN',
      author: {
        '@type': 'Person',
        name: 'MaoChen',
        url: 'https://github.com/ChenChen913',
      },
    }),
    [t, lang]
  );

  // 全量混排：全部文章按日期倒序（无任何排除逻辑）
  const currentPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    return posts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [posts, currentPage]);

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

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
      className="space-y-14"
    >
      <JsonLd data={websiteJsonLd} />
      <header id="home-header" className="space-y-4">
        <h1
          id="home-title"
          className="text-4xl md:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-kai"
        >
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
        <p
          id="home-subtitle"
          className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed"
        >
          {t('home_subtitle')}
        </p>
      </header>

      <section id="home-posts-section" aria-label={t('nav_posts')}>
        <div id="home-posts-list">
          <PostTimeline posts={currentPosts} ariaLabel={t('nav_posts')} />
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
