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
  content: string;
  excerpt: string;
  readTime: number;
}

function parseFrontmatter(rawContent: string) {
  const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { data: {} as any, content: rawContent };
  }
  
  const frontmatterStr = match[1];
  const content = match[2];
  const data: Record<string, any> = {};
  
  frontmatterStr.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    const colonIdx = trimmedLine.indexOf(':');
    if (colonIdx > -1) {
      const key = trimmedLine.slice(0, colonIdx).trim();
      let value = trimmedLine.slice(colonIdx + 1).trim();
      
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      
      if (value === 'true') data[key] = true;
      else if (value === 'false') data[key] = false;
      else if (value.startsWith('[') && value.endsWith(']')) {
        try {
          data[key] = JSON.parse(value.replace(/'/g, '"'));
        } catch {
          data[key] = [];
        }
      }
      else {
        data[key] = value;
      }
    }
  });
  
  return { data, content };
}

// Vite's import.meta.glob
// 由于是在客户端渲染，直接使用 import: 'default' 提取内容字符串
const postFiles = import.meta.glob('../posts/*.md', { query: '?raw', import: 'default', eager: true });

export function getAllPosts(includeDraft = false, includeUnpublished = false): Post[] {
  const posts: Post[] = [];

  for (const path in postFiles) {
    const slug = path.replace('../posts/', '').replace('.md', '');
    // import: 'default' 会直接返回字符串
    const rawContent = postFiles[path] as string;

    try {
      const { data, content } = parseFrontmatter(rawContent);

      if (!includeDraft && data.draft === true) {
        continue;
      }

      // 过滤私密文章：未显式声明 published 或 published: true 的才展示
      if (!includeUnpublished && data.published === false) {
        continue;
      }

      const plainText = content.replace(/[#*`_\[\]\(\)!>-]/g, '').replace(/\n+/g, ' ').trim();
      const excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');

      posts.push({
        slug,
        frontmatter: data as PostFrontmatter,
        content,
        excerpt,
        readTime: calcReadTime(plainText)
      });
    } catch (e) {
      console.error(`Error parsing markdown file: ${path}`, e);
    }
  }

  return posts.sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
}

export function getPostBySlug(slug: string, includeUnpublished = false): Post | undefined {
  return getAllPosts(true, includeUnpublished).find(post => post.slug === slug);
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

// 清除缓存函数(用于开发时热更新或添加新文章后)
export function clearPostCache() {
}

// 强制清除缓存以应对热更新
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    clearPostCache();
  });
}
