/**
 * feeds Vite 插件：构建期生成 RSS / sitemap / robots
 * ------------------------------------------------------------------
 * 数据源复用 posts-index（gray-matter 解析结果），保证与站点列表完全一致。
 *
 * 站点域名解析优先级：
 *   VITE_SITE_URL（本地/自定义）>
 *   VERCEL_PROJECT_PRODUCTION_DOMAIN（Vercel 生产域名）>
 *   VERCEL_URL（Vercel 部署域名）>
 *   https://chenblog.vercel.app（兜底，构建时打印告警）
 *
 * RSS 正文用 marked 渲染为 HTML 放入 content:encoded（阅读器全文阅读）；
 * 数学公式/高亮等浏览器增强不适用于 RSS 协议，以纯文本呈现。
 */
import path from 'node:path';
import fs from 'node:fs';
import { marked } from 'marked';
import type { Plugin } from 'vite';
import { buildPostsIndex } from './posts-index-plugin';

const DEFAULT_SITE_URL = 'https://chenblog.vercel.app';
const SITE_NAME = 'MaoChen Blog';
const SITE_DESC =
  "MaoChen's personal blog - A digital garden sharing thoughts on technology, life, and everything in between.";

export function resolveSiteUrl(): string {
  const fromEnv =
    process.env.VITE_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_DOMAIN ||
    process.env.VERCEL_URL;
  let url = (fromEnv || '').replace(/\/+$/, '');
  if (url && !url.startsWith('http')) {
    url = 'https://' + url;
  }
  if (!url) {
    console.warn(
      `[feeds] ⚠️ 未检测到站点域名环境变量（VITE_SITE_URL / VERCEL_PROJECT_PRODUCTION_DOMAIN / VERCEL_URL），` +
        `已使用兜底域名 ${DEFAULT_SITE_URL}。请在部署平台配置后重新构建。`
    );
    return DEFAULT_SITE_URL;
  }
  return url;
}

/** XML 文本节点转义（含 content:encoded 的整段 HTML） */
function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** RFC 822 日期（RSS 规范要求） */
function rfc822(dateStr: string): string {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
}

/** W3C 日期（sitemap lastmod 要求） */
function w3cDate(dateStr: string): string {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
}

function postUrl(siteUrl: string, slug: string): string {
  return `${siteUrl}/posts/${encodeURIComponent(slug)}`;
}

interface FeedPost {
  slug: string;
  title: string;
  titleEn?: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
  html: string;
}

/** 从原始 markdown 渲染 RSS 全文 HTML */
function renderHtml(raw: string): string {
  const content = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
  try {
    return marked.parse(content, { async: false, gfm: true });
  } catch {
    return `<p>${esc(content.slice(0, 500))}</p>`;
  }
}

function buildFeedPosts(postsDir: string): FeedPost[] {
  return buildPostsIndex(postsDir)
    .filter(entry => entry.frontmatter.draft !== true && entry.frontmatter.published !== false)
    .map(entry => {
      const fm = entry.frontmatter;
      const raw = fs.readFileSync(path.join(postsDir, `${entry.slug}.md`), 'utf-8');
      return {
        slug: entry.slug,
        title: String(fm.title ?? entry.slug),
        titleEn: typeof fm.title_en === 'string' ? fm.title_en : undefined,
        date: String(fm.date ?? ''),
        category: String(fm.category ?? ''),
        tags: Array.isArray(fm.tags) ? (fm.tags as string[]) : [],
        excerpt: entry.excerpt,
        html: renderHtml(raw),
      };
    });
}

export function buildRss(siteUrl: string, posts: FeedPost[]): string {
  const items = posts
    .map(post => {
      const link = postUrl(siteUrl, post.slug);
      const categories = post.tags.map(tag => `\n      <category>${esc(tag)}</category>`).join('');
      return `
    <item>
      <title>${esc(post.title)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="true">${esc(link)}</guid>
      <pubDate>${rfc822(post.date)}</pubDate>
      <description>${esc(post.excerpt)}</description>
      <content:encoded><![CDATA[${post.html}<!-- RSS 全文由构建期 marked 渲染；代码高亮与公式请阅读原文 -->]]></content:encoded>${categories}
    </item>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${esc(SITE_NAME)}</title>
    <link>${esc(siteUrl)}</link>
    <description>${esc(SITE_DESC)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>ChenBlog vite feeds plugin</generator>${items}
  </channel>
</rss>
`;
}

export function buildSitemap(siteUrl: string, posts: FeedPost[]): string {
  const latest =
    posts.length > 0
      ? posts
          .map(p => p.date)
          .sort()
          .pop()!
      : new Date().toISOString().slice(0, 10);

  const urls = [
    { loc: `${siteUrl}/`, lastmod: latest, changefreq: 'weekly', priority: '1.0' },
    { loc: `${siteUrl}/categories`, lastmod: latest, changefreq: 'weekly', priority: '0.6' },
    { loc: `${siteUrl}/highlights`, lastmod: latest, changefreq: 'weekly', priority: '0.6' },
    { loc: `${siteUrl}/about`, lastmod: latest, changefreq: 'monthly', priority: '0.5' },
    ...posts.map(post => ({
      loc: postUrl(siteUrl, post.slug),
      lastmod: w3cDate(post.date),
      changefreq: 'monthly',
      priority: '0.8',
    })),
  ];

  const body = urls
    .map(
      u => `
  <url>
    <loc>${esc(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}
</urlset>
`;
}

export function buildRobots(siteUrl: string): string {
  return `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
}

export function feedsPlugin(): Plugin {
  const postsDir = path.resolve(__dirname, '../src/posts');

  const buildAll = () => {
    const siteUrl = resolveSiteUrl();
    const posts = buildFeedPosts(postsDir);
    return {
      siteUrl,
      rss: buildRss(siteUrl, posts),
      sitemap: buildSitemap(siteUrl, posts),
      robots: buildRobots(siteUrl),
    };
  };

  return {
    name: 'chenblog:feeds',

    // 生产构建：作为静态资产输出到 dist 根（generateBundle 仅在 build 阶段触发）
    generateBundle() {
      const { rss, sitemap, robots } = buildAll();
      this.emitFile({ type: 'asset', fileName: 'rss.xml', source: rss });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
      console.log('[feeds] 已生成 rss.xml / sitemap.xml / robots.txt');
    },

    // dev：注册中间件，本地可直接调试 /rss.xml 等
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/rss.xml' || req.url === '/sitemap.xml' || req.url === '/robots.txt') {
          const { rss, sitemap, robots } = buildAll();
          const xml = req.url === '/rss.xml' ? rss : req.url === '/sitemap.xml' ? sitemap : robots;
          res.setHeader(
            'Content-Type',
            req.url === '/robots.txt'
              ? 'text/plain; charset=utf-8'
              : 'application/xml; charset=utf-8'
          );
          res.end(xml);
          return;
        }
        next();
      });
    },
  };
}
