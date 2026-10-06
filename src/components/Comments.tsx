import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

/**
 * giscus 评论（GitHub Discussions 驱动）
 * ------------------------------------------------------------------
 * 完全可选：仅当以下环境变量全部配置时渲染，否则返回 null（零开销）：
 *   VITE_GISCUS_REPO        如 'ChenChen913/ChenBlog'
 *   VITE_GISCUS_REPO_ID     giscus.app 配置工具获取
 *   VITE_GISCUS_CATEGORY    如 'Announcements'（需为 Discussions 分类）
 *   VITE_GISCUS_CATEGORY_ID giscus.app 配置工具获取
 * 主题与语言随站点设置联动；每篇文章独立评论线程（pathname 定位）。
 */
const GISCUS_REPO = import.meta.env.VITE_GISCUS_REPO as string | undefined;
const GISCUS_REPO_ID = import.meta.env.VITE_GISCUS_REPO_ID as string | undefined;
const GISCUS_CATEGORY = import.meta.env.VITE_GISCUS_CATEGORY as string | undefined;
const GISCUS_CATEGORY_ID = import.meta.env.VITE_GISCUS_CATEGORY_ID as string | undefined;

const giscusEnabled = Boolean(
  GISCUS_REPO && GISCUS_REPO_ID && GISCUS_CATEGORY && GISCUS_CATEGORY_ID
);

export default function Comments() {
  const { lang, theme } = useAppContext();
  const { pathname } = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!giscusEnabled || !container) return;

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', GISCUS_REPO!);
    script.setAttribute('data-repo-id', GISCUS_REPO_ID!);
    script.setAttribute('data-category', GISCUS_CATEGORY!);
    script.setAttribute('data-category-id', GISCUS_CATEGORY_ID!);
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '1');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', theme === 'dark' ? 'dark_dimmed' : 'light');
    script.setAttribute('data-lang', lang === 'en' ? 'en' : 'zh-CN');
    script.setAttribute('data-loading', 'lazy');
    container.appendChild(script);

    return () => {
      script.remove();
      container.innerHTML = '';
    };
  }, [pathname, lang, theme]);

  if (!giscusEnabled) {
    return null;
  }

  return (
    <section
      id="post-comments"
      className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800"
    >
      <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-6">
        {lang === 'en' ? 'Comments' : '评论'}
      </h2>
      <div ref={containerRef} className="giscus-container" />
    </section>
  );
}
