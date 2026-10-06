/**
 * posts-index Vite 插件
 * ------------------------------------------------------------------
 * 目标：把「文章元数据」与「文章正文」拆成两条加载路径。
 *
 *  1. virtual:posts-index —— 构建期读取 src/posts/*.md，用 gray-matter
 *     解析 frontmatter，并预计算 excerpt / readTime，生成一个仅含元数据的
 *     轻量虚拟模块（几 KB）。列表页（首页/分类/精选）同步导入它，
 *     不再需要把全部 Markdown 正文打进主包。
 *
 *  2. 正文由 src/utils/markdown.ts 里的非 eager import.meta.glob 按需
 *     加载（每篇文章一个独立 chunk），文章页进入时才请求。
 *
 * 解析职责全部收敛到构建期 gray-matter（js-yaml），替换了原先运行时
 * 手写的逐行解析器：正确支持引号、多行数组、YAML 标量类型与注释。
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { Plugin } from 'vite';

const VIRTUAL_MODULE_ID = 'virtual:posts-index';
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

/** 与线上展示逻辑保持一致的阅读时长估算（中文 300 字/分钟，英文 200 词/分钟） */
function calcReadTime(text: string): number {
  const cnChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const enWords = text
    .replace(/[\u4e00-\u9fa5]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = cnChars / 300 + enWords / 200;
  return Math.max(1, Math.round(minutes));
}

/** 与旧版运行时完全一致的摘要生成，保证列表页观感不变 */
function buildExcerpt(content: string): string {
  const plainText = content
    .replace(/[#*`_[\]()!>-]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  return plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
}

interface PostIndexEntry {
  slug: string;
  frontmatter: Record<string, unknown>;
  excerpt: string;
  readTime: number;
}

/** 规范化 frontmatter，避免 YAML 标量类型带来的隐性差异 */
function normalizeFrontmatter(
  data: Record<string, unknown>,
  slug: string
): Record<string, unknown> {
  const fm: Record<string, unknown> = { ...data };

  // YAML 会把未加引号的日期解析成 Date 对象，统一回 YYYY-MM-DD 字符串
  if (fm.date instanceof Date) {
    fm.date = fm.date.toISOString().slice(0, 10);
  }
  if (typeof fm.date !== 'string' || fm.date.length === 0) {
    fm.date = new Date().toISOString().slice(0, 10);
  }

  // 标题兜底：没有 title 的文章用文件名展示，而不是渲染成空白
  if (typeof fm.title !== 'string' || fm.title.length === 0) {
    fm.title = slug;
  }

  // tags 兜底：非法写法（标量/对象）不再让 PostCard 崩溃，统一成数组
  if (!Array.isArray(fm.tags)) {
    fm.tags = typeof fm.tags === 'string' && fm.tags.length > 0 ? [fm.tags] : [];
  } else {
    fm.tags = fm.tags.filter((t): t is string => typeof t === 'string');
  }

  return fm;
}

/** 读取 posts 目录，构建元数据索引（按日期倒序，与线上列表顺序一致） */
export function buildPostsIndex(postsDir: string): PostIndexEntry[] {
  const entries: PostIndexEntry[] = [];

  for (const file of fs.readdirSync(postsDir)) {
    if (!file.endsWith('.md')) continue;

    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf-8');

    try {
      const parsed = matter(raw);
      const frontmatter = normalizeFrontmatter(parsed.data, slug);
      entries.push({
        slug,
        frontmatter,
        excerpt: buildExcerpt(parsed.content),
        readTime: calcReadTime(parsed.content),
      });
    } catch (err) {
      // 单篇文章解析失败不应拖垮整站构建：降级为最小元数据并给出显著告警
      console.warn(
        `[posts-index] ⚠️ 解析失败: ${file}（已按无 frontmatter 文章降级处理）\n` +
          `  常见原因：title 中含未加引号的半角冒号、tags 写法不符合 YAML 等\n` +
          `  错误详情：${err instanceof Error ? err.message : err}`
      );
      const content = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
      entries.push({
        slug,
        frontmatter: normalizeFrontmatter({}, slug),
        excerpt: buildExcerpt(content),
        readTime: calcReadTime(content),
      });
    }
  }

  entries.sort(
    (a, b) =>
      new Date(String(b.frontmatter.date)).getTime() -
      new Date(String(a.frontmatter.date)).getTime()
  );

  return entries;
}

export function postsIndexPlugin(): Plugin {
  const postsDir = path.resolve(__dirname, '../src/posts');

  return {
    name: 'chenblog:posts-index',
    enforce: 'pre',

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_MODULE_ID) {
        return;
      }

      const entries = buildPostsIndex(postsDir);
      // 注意：虚拟模块在浏览器按纯 JS 解析，不能包含 TypeScript 语法；
      // 类型声明由 src/vite-env.d.ts 提供
      const code = `export const postsIndex = ${JSON.stringify(entries)};`;

      return { code, map: null };
    },

    configureServer(server) {
      // dev 下监听文章变化：失效虚拟模块并整页刷新（索引 + 正文一并更新）
      const onChange = (file: string) => {
        if (!file.endsWith('.md') || !path.resolve(file).startsWith(postsDir)) {
          return;
        }
        const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
        }
        server.ws.send({ type: 'full-reload' });
      };

      server.watcher.on('change', onChange);
      server.watcher.on('add', onChange);
      server.watcher.on('unlink', onChange);
    },
  };
}
