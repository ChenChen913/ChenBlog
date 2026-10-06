/// <reference types="vite/client" />

/**
 * virtual:posts-index 由 scripts/posts-index-plugin.ts 在构建期生成：
 * 仅包含文章元数据（frontmatter / excerpt / readTime），不含正文。
 */
declare module 'virtual:posts-index' {
  export interface PostIndexEntry {
    slug: string;
    frontmatter: {
      title: string;
      title_en?: string;
      date: string;
      category: string;
      tags: string[];
      featured?: boolean;
      gem?: boolean;
      weekly?: boolean;
      coverImage?: string;
      draft?: boolean;
      published?: boolean;
      [key: string]: unknown;
    };
    excerpt: string;
    readTime: number;
  }
  export const postsIndex: PostIndexEntry[];
}
