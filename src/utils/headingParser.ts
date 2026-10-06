/**
 * 标题节点接口（树形结构）
 */
export interface HeadingNode {
  id: string;
  text: string;
  level: number;
  children?: HeadingNode[];
}

/**
 * 解析结果接口
 */
export interface ParsedHeadings {
  headings: HeadingNode[]; // 树形结构（h2 包含 h3），用于 TOC 渲染
  totalCount: number; // 标题总数，用于渲染器计数器同步校验
}

/**
 * 去除常见的内联 Markdown 语法，得到纯文本（用于 TOC 显示）
 * 例如：**加粗** → 加粗，`代码` → 代码
 */
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1') // **粗体**
    .replace(/\*(.+?)\*/g, '$1') // *斜体*
    .replace(/`(.+?)`/g, '$1') // `行内代码`
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // [链接文字](url)
    .replace(/<[^>]+>/g, '') // <html标签>
    .trim();
}

/**
 * 从 Markdown 原文本中提取 h1/h2/h3 标题，构建树形结构
 *
 * ID 生成策略：使用按文档顺序的位置编号（toc-h-0, toc-h-1...）
 * 而非 slugify，因为 slugify + strict:true 会删除所有中文字符，
 * 生成空字符串 ID，导致 getElementById("") 永远返回 null。
 * 位置编号与 Post.tsx 渲染器中的计数器严格对应，永远不会错位。
 */
export function parseMarkdownHeadings(markdown: string): ParsedHeadings {
  const headings: HeadingNode[] = [];

  // 先剥离围栏代码块（``` ... ```），避免代码中的 # 被误识别为标题
  const stripped = markdown.replace(/```[\s\S]*?```/g, '');
  // 也剥离行内代码中的 #（虽然概率低，但以防万一）
  const cleaned = stripped.replace(/`[^`]*`/g, '');

  const headingRegex = /^(#{1,3})\s+(.+)$/gm;

  let headingIndex = 0;
  let match;
  // 栈追踪当前祖先链，用于构建正确嵌套
  const stack: HeadingNode[] = [];

  while ((match = headingRegex.exec(cleaned)) !== null) {
    const level = match[1].length; // # = 1, ## = 2, ### = 3
    const rawText = match[2].trim();
    const text = stripInlineMarkdown(rawText);
    const id = `toc-h-${headingIndex}`;
    headingIndex++;

    const node: HeadingNode = { id, text, level };

    // 弹出 level >= 当前级别的元素，找到正确的父节点
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    // 栈顶就是当前标题的父节点
    const parent = stack.length > 0 ? stack[stack.length - 1] : null;

    if (parent) {
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    } else {
      headings.push(node); // 无父节点 → 顶级
    }

    stack.push(node);
  }

  return { headings, totalCount: headingIndex };
}

/**
 * 将树形标题数组展平为顺序列表
 * 供 IntersectionObserver 遍历所有节点（包括 h3）
 */
export function flattenHeadings(headings: HeadingNode[]): HeadingNode[] {
  const result: HeadingNode[] = [];

  function traverse(nodes: HeadingNode[]) {
    for (const node of nodes) {
      result.push(node);
      if (node.children) traverse(node.children);
    }
  }

  traverse(headings);
  return result;
}
