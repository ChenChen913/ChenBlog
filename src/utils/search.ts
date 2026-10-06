/**
 * 站内搜索：纯函数逻辑层
 * ------------------------------------------------------------------
 * - 轻量索引：标题 / 英文标题 / 标签 / 分类 / 摘要 同步可搜（来自
 *   posts-index 虚拟模块，零额外请求）；
 * - 全文增强：打开搜索框时按需并行拉取全部正文 chunk（~200KB，
 *   复用 loadPostContent 的模块级缓存，文章页访问过的直接命中）；
 * - 中文友好：分词按空白切分 + 子串匹配，对无空格的 CJK 查询天然可用；
 *   英文查询统一小写化后匹配；
 * - 权重：标题(10，前缀 12) > 英文标题(8) > 标签(6) > 分类(4) >
 *   摘要(3) > 正文(2)，多关键词取 AND 语义，按总分排序。
 */
import { getAllPosts, loadPostContent, type Post } from './markdown';

export interface SearchResult {
  slug: string;
  title: string;
  titleEn?: string;
  category: string;
  tags: string[];
  date: string;
  excerpt: string;
  score: number;
  /** 命中位置类型（UI 徽标用） */
  matchedIn: 'title' | 'tags' | 'excerpt' | 'content';
  /** 正文命中时的上下文片段 */
  snippet?: string;
}

/** 查询分词：按空白切分并小写化 */
export function tokenizeQuery(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(token => token.length > 0);
}

/** 在 text 中查找 tokens 的首个命中索引（无命中返回 -1） */
function firstIndexOfAny(text: string, tokens: string[]): number {
  let best = -1;
  for (const token of tokens) {
    const idx = text.indexOf(token);
    if (idx >= 0 && (best === -1 || idx < best)) {
      best = idx;
    }
  }
  return best;
}

/** 从 content 中截取命中词上下文片段 */
function buildSnippet(content: string, tokens: string[]): string | undefined {
  const lower = content.toLowerCase();
  const idx = firstIndexOfAny(lower, tokens);
  if (idx < 0) return undefined;
  const start = Math.max(0, idx - 24);
  const end = Math.min(content.length, idx + 60);
  return (
    (start > 0 ? '…' : '') +
    content.slice(start, end).replace(/\s+/g, ' ').trim() +
    (end < content.length ? '…' : '')
  );
}

function scorePost(post: Post, tokens: string[], content?: string): SearchResult | null {
  const fm = post.frontmatter;
  const title = fm.title ?? '';
  const titleEn = fm.title_en ?? '';
  const category = fm.category ?? '';
  const tags = fm.tags ?? [];
  const excerpt = post.excerpt ?? '';

  const titleLower = title.toLowerCase();
  const titleEnLower = titleEn.toLowerCase();
  const categoryLower = category.toLowerCase();
  const tagsLower = tags.map(tag => tag.toLowerCase());
  const excerptLower = excerpt.toLowerCase();
  const contentLower = content ? content.toLowerCase() : '';

  let score = 0;
  let matchedIn: SearchResult['matchedIn'] = 'excerpt';
  let snippet: string | undefined;

  for (const token of tokens) {
    let tokenScore = 0;

    if (titleLower.startsWith(token)) {
      tokenScore += 12;
      matchedIn = 'title';
    } else if (titleLower.includes(token)) {
      tokenScore += 10;
      matchedIn = 'title';
    }

    if (titleEnLower.includes(token)) {
      tokenScore += 8;
      if (matchedIn !== 'title') matchedIn = 'title';
    }

    if (tagsLower.some(tag => tag.includes(token))) {
      tokenScore += 6;
      if (matchedIn === 'excerpt') matchedIn = 'tags';
    }

    if (categoryLower.includes(token)) {
      tokenScore += 4;
    }

    if (excerptLower.includes(token)) {
      tokenScore += 3;
    }

    if (contentLower && contentLower.includes(token)) {
      tokenScore += 2;
      if (matchedIn === 'excerpt') matchedIn = 'content';
      if (!snippet) {
        snippet = buildSnippet(content!, [token]);
      }
    }

    // AND 语义：任一关键词完全无命中则淘汰
    if (tokenScore === 0) {
      return null;
    }
    score += tokenScore;
  }

  return {
    slug: post.slug,
    title,
    titleEn: fm.title_en,
    category,
    tags,
    date: fm.date,
    excerpt,
    score,
    matchedIn,
    snippet,
  };
}

/** 全文缓存：所有公开文章正文（打开搜索框时按需加载一次） */
let allContentsPromise: Promise<Record<string, string>> | null = null;

export function loadAllPostContents(): Promise<Record<string, string>> {
  if (!allContentsPromise) {
    const posts = getAllPosts();
    allContentsPromise = Promise.all(
      posts.map(post =>
        loadPostContent(post.slug).then(content => [post.slug, content ?? ''] as const)
      )
    ).then(entries => Object.fromEntries(entries));
    // 失败不驻留缓存，允许下次重试
    allContentsPromise.catch(() => {
      allContentsPromise = null;
    });
  }
  return allContentsPromise;
}

/** 全文索引是否已就绪（就绪前仅用轻量元数据搜索） */
export function isFullTextReady(): boolean {
  return allContentsPromise !== null;
}

/**
 * 执行搜索。contents 为空时退化为元数据搜索（标题/标签/摘要）。
 */
export function searchPosts(
  query: string,
  contents: Record<string, string> = {}
): SearchResult[] {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) {
    return [];
  }

  return getAllPosts()
    .map(post => scorePost(post, tokens, contents[post.slug]))
    .filter((result): result is SearchResult => result !== null)
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 20);
}

/** 高亮分段：把 text 按 tokens 切成命中/未命中片段（UI 渲染 <mark> 用） */
export function highlightParts(
  text: string,
  tokens: string[]
): Array<{ text: string; hit: boolean }> {
  if (tokens.length === 0 || !text) {
    return [{ text, hit: false }];
  }
  const lower = text.toLowerCase();
  const ranges: Array<[number, number]> = [];

  for (const token of tokens) {
    let idx = lower.indexOf(token);
    while (idx >= 0) {
      ranges.push([idx, idx + token.length]);
      idx = lower.indexOf(token, idx + token.length);
    }
  }
  if (ranges.length === 0) {
    return [{ text, hit: false }];
  }

  ranges.sort((a, b) => a[0] - b[0]);
  // 合并重叠区间
  const merged: Array<[number, number]> = [ranges[0]];
  for (const [start, end] of ranges.slice(1)) {
    const last = merged[merged.length - 1];
    if (start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }

  const parts: Array<{ text: string; hit: boolean }> = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) {
      parts.push({ text: text.slice(cursor, start), hit: false });
    }
    parts.push({ text: text.slice(start, end), hit: true });
    cursor = end;
  }
  if (cursor < text.length) {
    parts.push({ text: text.slice(cursor), hit: false });
  }
  return parts;
}
