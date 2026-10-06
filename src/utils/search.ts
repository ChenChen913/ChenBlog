/**
 * 站内搜索：纯函数逻辑层
 * ------------------------------------------------------------------
 * - 轻量索引：标题 / 英文标题 / 标签 / 分类 / 摘要 同步可搜（来自
 *   posts-index 虚拟模块，零额外请求）；
 * - 全文增强：打开搜索框时按需并行拉取全部正文 chunk（~200KB，
 *   复用 loadPostContent 的模块级缓存，文章页访问过的直接命中）；
 * - 中文友好：分词按空白切分 + 子串匹配，对无空格的 CJK 查询天然可用；
 *   英文查询统一小写化后匹配；
 * - 模糊匹配（fuzzy）：英文/数字关键词在子串未命中时退化为子序列
 *   匹配（如 "rn hoks" 命中 "return hooks"），得分按 60% 折算排在精确
 *   命中之后；CJK 查询不参与模糊（子序列噪声过大）；
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

/** 模糊匹配仅对 ASCII 字母/数字关键词开放（长度 ≥ 2），
 *  CJK 子序列匹配噪声过大，维持子串匹配 */
function isFuzzyEligible(token: string): boolean {
  return token.length >= 2 && /^[a-z0-9][a-z0-9._-]*$/.test(token);
}

/**
 * 模糊子序列匹配：query 的每个字符按顺序出现在 target 中即命中。
 * 返回命中字符的下标数组（供高亮），未命中返回 null。
 * 贪心扫描保证找到的是最靠前的一段。
 */
export function fuzzyIndices(query: string, target: string): number[] | null {
  if (!isFuzzyEligible(query) || query.length > target.length) {
    return null;
  }

  const lowerTarget = target.toLowerCase();
  const positions: number[] = [];
  let from = 0;

  for (const char of query) {
    const idx = lowerTarget.indexOf(char, from);
    if (idx < 0) {
      return null;
    }
    positions.push(idx);
    from = idx + 1;
  }

  return positions;
}

/** 单字段命中结果：exact 为子串命中，fuzzy 为子序列命中 */
interface FieldMatch {
  exact: boolean;
  fuzzyPositions: number[] | null;
}

function matchField(token: string, lowerText: string): FieldMatch {
  if (lowerText.includes(token)) {
    return { exact: true, fuzzyPositions: null };
  }
  if (isFuzzyEligible(token)) {
    return { exact: false, fuzzyPositions: fuzzyIndices(token, lowerText) };
  }
  return { exact: false, fuzzyPositions: null };
}

/** 模糊命中得分折算系数（排在精确命中之后） */
const FUZZY_SCORE_FACTOR = 0.6;

function applyFuzzyFactor(points: number): number {
  return Math.max(1, Math.round(points * FUZZY_SCORE_FACTOR));
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

/** 从 content 中截取命中词上下文片段（支持子串与模糊命中中心点） */
function buildSnippet(content: string, tokens: string[], fuzzyCenter = -1): string | undefined {
  const lower = content.toLowerCase();
  const idx = firstIndexOfAny(lower, tokens);
  const center = idx >= 0 ? idx : fuzzyCenter;
  if (center < 0) return undefined;
  const start = Math.max(0, center - 24);
  const end = Math.min(content.length, center + 60);
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

    const titleMatch = matchField(token, titleLower);
    if (titleMatch.exact) {
      tokenScore += titleLower.startsWith(token) ? 12 : 10;
      matchedIn = 'title';
    } else if (titleMatch.fuzzyPositions) {
      tokenScore += applyFuzzyFactor(titleLower.startsWith(token) ? 12 : 10);
      matchedIn = 'title';
    }

    const titleEnMatch = matchField(token, titleEnLower);
    if (titleEnMatch.exact) {
      tokenScore += 8;
      if (matchedIn !== 'title') matchedIn = 'title';
    } else if (titleEnMatch.fuzzyPositions) {
      tokenScore += applyFuzzyFactor(8);
      if (matchedIn !== 'title') matchedIn = 'title';
    }

    const tagMatched = tagsLower.some(tag => {
      const match = matchField(token, tag);
      return match.exact || match.fuzzyPositions;
    });
    if (tagMatched) {
      tokenScore += 6;
      if (matchedIn === 'excerpt') matchedIn = 'tags';
    }

    const categoryMatch = matchField(token, categoryLower);
    if (categoryMatch.exact) {
      tokenScore += 4;
    } else if (categoryMatch.fuzzyPositions) {
      tokenScore += applyFuzzyFactor(4);
    }

    const excerptMatch = matchField(token, excerptLower);
    if (excerptMatch.exact) {
      tokenScore += 3;
    } else if (excerptMatch.fuzzyPositions) {
      tokenScore += applyFuzzyFactor(3);
    }

    if (contentLower) {
      const contentMatch = matchField(token, contentLower);
      if (contentMatch.exact) {
        tokenScore += 2;
        if (matchedIn === 'excerpt') matchedIn = 'content';
        if (!snippet) {
          snippet = buildSnippet(content!, [token]);
        }
      } else if (contentMatch.fuzzyPositions) {
        tokenScore += applyFuzzyFactor(2);
        if (matchedIn === 'excerpt') matchedIn = 'content';
        if (!snippet) {
          snippet = buildSnippet(content!, [], contentMatch.fuzzyPositions[0]);
        }
      }
    }

    // AND 语义：任一关键词完全无命中（子串与模糊均未命中）则淘汰
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
export function searchPosts(query: string, contents: Record<string, string> = {}): SearchResult[] {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) {
    return [];
  }

  return getAllPosts()
    .map(post => scorePost(post, tokens, contents[post.slug]))
    .filter((result): result is SearchResult => result !== null)
    .sort((a, b) => b.score - a.score || new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);
}

/** 高亮分段：把 text 按 tokens 切成命中/未命中片段（UI 渲染 <mark> 用）。
 *  子串命中高亮整段；仅模糊命中的 token 高亮命中的单个字符（相邻自动
 *  合并成连续段），与 VS Code 命令面板的模糊高亮行为一致 */
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
    if (lower.includes(token)) {
      let idx = lower.indexOf(token);
      while (idx >= 0) {
        ranges.push([idx, idx + token.length]);
        idx = lower.indexOf(token, idx + token.length);
      }
    } else if (isFuzzyEligible(token)) {
      const positions = fuzzyIndices(token, lower);
      if (positions) {
        for (const position of positions) {
          ranges.push([position, position + 1]);
        }
      }
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
