import { postsIndex } from 'virtual:posts-index';
import { calcReadTime } from './storage';

export interface PostFrontmatter {
  title: string;
  title_en?: string;
  date: string;
  category: string;
  tags: string[];
  featured?: boolean;
  gem?: boolean;
  coverImage?: string;
  draft?: boolean;
  published?: boolean;
}

export interface Post {
  slug: string;
  frontmatter: PostFrontmatter;
  /** 正文仅在文章页按需加载，列表页该字段为 undefined */
  content?: string;
  excerpt: string;
  readTime: number;
}

/** 列表页使用的轻量元数据视图（无正文） */
export type PostMeta = Omit<Post, 'content'>;

/**
 * 文章正文按需加载：非 eager 的 import.meta.glob 让每篇文章成为独立 chunk，
 * 只有进入对应文章页时才发起请求。
 */
const postLoaders = import.meta.glob('../posts/*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

const loaderBySlug: Record<string, () => Promise<string>> = {};
for (const filePath in postLoaders) {
  loaderBySlug[filePath.replace('../posts/', '').replace('.md', '')] = postLoaders[filePath];
}

/** 剥离 frontmatter 块，仅保留正文（元数据已由构建期 gray-matter 解析完毕） */
function stripFrontmatter(raw: string): string {
  const match = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? raw.slice(match[0].length) : raw;
}

const contentCache = new Map<string, Promise<string | null>>();

/** 按需加载单篇文章正文（带缓存，重复进入秒开；失败不缓存，允许重试） */
export function loadPostContent(slug: string): Promise<string | null> {
  let pending = contentCache.get(slug);
  if (!pending) {
    const loader = loaderBySlug[slug];
    pending = loader ? loader().then(raw => stripFrontmatter(raw)) : Promise.resolve(null);
    contentCache.set(slug, pending);
    pending.catch(() => contentCache.delete(slug));
  }
  return pending;
}

function toMeta(entry: (typeof postsIndex)[number]): PostMeta {
  return {
    slug: entry.slug,
    frontmatter: entry.frontmatter as unknown as PostFrontmatter,
    excerpt: entry.excerpt,
    readTime: entry.readTime,
  };
}

/** 全部文章元数据（已按日期倒序）。draft / published 默认过滤，Post 页显式放开 */
export function getAllPosts(includeDraft = false, includeUnpublished = false): Post[] {
  return postsIndex
    .filter(
      entry =>
        (includeDraft || entry.frontmatter.draft !== true) &&
        (includeUnpublished || entry.frontmatter.published !== false)
    )
    .map(toMeta);
}

/** 同步获取单篇文章元数据（不含正文）——文章页头部信息可即刻渲染 */
export function getPostMetaBySlug(slug: string, includeUnpublished = false): PostMeta | undefined {
  const entry = postsIndex.find(
    entry => entry.slug === slug && (includeUnpublished || entry.frontmatter.published !== false)
  );
  return entry ? toMeta(entry) : undefined;
}

export function getCategories(): string[] {
  const posts = getAllPosts();
  const categories = new Set(posts.map(post => post.frontmatter.category));
  return Array.from(categories);
}

export function getTags(): string[] {
  const posts = getAllPosts();
  const tags = new Set(posts.flatMap(post => post.frontmatter.tags || []));
  return Array.from(tags);
}

export { calcReadTime };
