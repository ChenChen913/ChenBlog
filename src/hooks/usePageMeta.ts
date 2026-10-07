import { useEffect } from 'react';

/**
 * 页面级 SEO 元数据接口
 */
export interface PageMeta {
  /** 文档标题（浏览器标签页 + og:title + twitter:title） */
  title?: string;
  /** 页面描述（meta description + og:description） */
  description?: string;
  /** Open Graph 类型，文章页用 'article'，其余页面默认 'website' */
  ogType?: 'website' | 'article';
  /** 分享卡片图（og:image / twitter:image 的绝对 URL），缺省时回退站点默认卡片 */
  imageUrl?: string;
}

/** 站点默认分享卡片（public/og-image.png，1200×630 液态玻璃风格） */
const DEFAULT_OG_IMAGE = '/og-image.png';

/** 构建期由 vite.config.ts 归一化注入的站点正式域名（未设置时为空串，回退当前地址）。
 * 有了它，预渲染产物里的 og:url / canonical 才是正式域名而非预览服务器地址。 */
const SITE_URL = ((import.meta.env.VITE_SITE_URL as string | undefined) ?? '').replace(/\/+$/, '');

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
 * - og:url 与 <link rel="canonical"> 始终指向真实地址（构建期注入的正式域名优先，
 *   未配置时回退 window.location，预渲染产物不会烘入 localhost 预览地址）
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
    const origin = SITE_URL || window.location.origin;
    const url = origin + window.location.pathname;

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

    // 分享卡片图：优先文章封面，否则回退站点默认卡片（相对路径转绝对，社交平台要求绝对 URL）
    const resolvedImage = imageUrl ?? DEFAULT_OG_IMAGE;
    const absoluteImage = new URL(resolvedImage, origin).href;
    setMeta('property', 'og:image', absoluteImage);
    setMeta('name', 'twitter:image', absoluteImage);

    // 真实地址：正式域名优先，避免预渲染烘入预览服务器地址
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
