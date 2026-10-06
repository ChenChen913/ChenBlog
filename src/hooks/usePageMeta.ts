import { useEffect } from 'react';

/**
 * 页级 SEO 元数据接口
 */
export interface PageMeta {
  /** 文档标题（浏览器标签页 + og:title + twitter:title） */
  title?: string;
  /** 页面描述（meta description + og:description） */
  description?: string;
  /** Open Graph 类型，文章页用 'article'，其余页面默认 'website' */
  ogType?: 'website' | 'article';
  /** 分享卡片图（og:image / twitter:image 的绝对 URL） */
  imageUrl?: string;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * 为当前页面设置动态 SEO 元数据。
 *
 * 解决 SPA 的核心 SEO 缺陷：
 * - 每个路由有独立的 <title> / meta description
 * - og:title / og:description / og:type / og:image 随内容更新
 * - og:url 与 <link rel="canonical"> 始终指向真实地址（替换模板遗留的 your-domain.com 占位符）
 *
 * @example
 * // 文章页
 * usePageMeta({
 *   title: `${post.title} | MaoChen Blog`,
 *   description: post.excerpt,
 *   ogType: 'article',
 * });
 */
export function usePageMeta({ title, description, ogType, imageUrl }: PageMeta) {
  useEffect(() => {
    const url = window.location.origin + window.location.pathname;

    if (title) {
      document.title = title;
      setMeta('property', 'og:title', title);
      setMeta('name', 'twitter:title', title);
    }

    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
      setMeta('name', 'twitter:description', description);
    }

    if (ogType) {
      setMeta('property', 'og:type', ogType);
    }

    if (imageUrl) {
      setMeta('property', 'og:image', imageUrl);
      setMeta('name', 'twitter:image', imageUrl);
    }

    // 真实地址替换构建模板里的 your-domain.com 占位符
    setMeta('property', 'og:url', url);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }, [title, description, ogType, imageUrl]);
}
