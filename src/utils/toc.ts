import slugify from 'slugify';

/**
 * @deprecated 此文件已废弃，请使用 src/utils/headingParser.ts
 * headingParser.ts 提供了完整的树形结构解析、重复标题处理和唯一 ID 生成功能。
 * 此文件中的 generateSlug 不支持重复 ID 去重，保留仅供参考。
 */

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * 统一的 slugify 函数，用于生成标题 ID
 * 与 GitHub 的 slug 生成逻辑保持一致
 */
export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
}

/**
 * 从 Markdown 原文本中提取标题并建立索引
 * 返回值：
 * - headings: 目录列表
 * - headingIdMap: 标题文本到 ID 的映射（用于渲染时查找）
 */
export function extractHeadingsFromMarkdown(markdown: string): {
  headings: TocItem[];
  headingIdMap: Map<string, string>;
} {
  const items: TocItem[] = [];
  const idMap = new Map<string, string>();

  // 匹配 ## 和 ### 标题（排除 # 一级标题）
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;

  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length; // ## = 2, ### = 3
    const text = match[2].trim();
    const id = generateSlug(text);

    items.push({ id, text, level });

    // 建立映射：原始文本 → ID
    // 键：移除所有 markdown 标记的纯文本
    // 这样即使标题中有 <mark> 等标记也能正确匹配
    const plainText = text.replace(/<[^>]+>/g, '').trim();
    idMap.set(plainText, id);

    // 同时保存原始文本作为键（兼容性）
    idMap.set(text, id);
  }

  return { headings: items, headingIdMap: idMap };
}
