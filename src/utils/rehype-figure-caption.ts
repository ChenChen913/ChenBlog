import type { Element, Root, RootContent } from 'hast';

/**
 * rehype 插件：图片说明（figure + figcaption）
 * ------------------------------------------------------------------
 * Markdown 写法约定（已记录在 src/posts/文章模板.md）：
 *
 *   ![图片描述](/images/xxx/01.png)
 *
 *   说明文字
 *
 * 「只含一张图片的段落」紧跟「一行短文本段落」时，短文本视为该图片的
 * 说明文字，合并渲染为 <figure><img><figcaption>，样式见 article.css
 * （紧贴图片正下方、小字、淡色、居中）。
 *
 * 判定条件（防止把普通短段落误伤为说明）：
 *  - 图片段落：忽略空白文本后恰好只剩一个 <img> 子节点；
 *  - 说明段落：恰好只有一个文本子节点，trim 后非空且长度 ≤ 40 字。
 *    超过 40 字的长文本按普通正文段落处理。
 */
const MAX_CAPTION_LENGTH = 40;

type ParentLike = { children: RootContent[] };

/** 节点是否为「只含一张图片的段落」，是则返回该 <img>，否则 null */
function imageOfParagraph(node: RootContent): Element | null {
  if (node.type !== 'element' || node.tagName !== 'p') return null;
  const meaningful = node.children.filter(
    child => !(child.type === 'text' && child.value.trim() === '')
  );
  if (
    meaningful.length !== 1 ||
    meaningful[0].type !== 'element' ||
    meaningful[0].tagName !== 'img'
  ) {
    return null;
  }
  return meaningful[0];
}

/** 节点是否为「单行短文本段落」，是则返回说明文字，否则 null */
function captionOfParagraph(node: RootContent): string | null {
  if (node.type !== 'element' || node.tagName !== 'p') return null;
  const meaningful = node.children.filter(
    child => !(child.type === 'text' && child.value.trim() === '')
  );
  if (meaningful.length !== 1 || meaningful[0].type !== 'text') return null;
  const text = meaningful[0].value.trim();
  if (!text || text.length > MAX_CAPTION_LENGTH) return null;
  return text;
}

/** 纯空白文本节点（块级元素之间由 remark-rehype 生成的换行符等） */
function isWhitespaceText(node: RootContent): boolean {
  return node.type === 'text' && node.value.trim() === '';
}

/** 就地改写 parent.children：命中的相邻（图片段, 短文本段）合并为 figure */
function transformChildren(parent: ParentLike): void {
  const source = parent.children;
  const result: RootContent[] = [];
  for (let i = 0; i < source.length; i++) {
    const node = source[i];
    // 递归处理容器节点（blockquote / li 等）内部的段落
    if (node.type === 'element') {
      transformChildren(node as unknown as ParentLike);
    }
    const img = imageOfParagraph(node);
    if (img) {
      // 跳过图片段之后的纯空白节点（块级节点间的换行符）再找说明段
      let j = i + 1;
      while (j < source.length && isWhitespaceText(source[j])) j++;
      const next = source[j];
      const caption = next ? captionOfParagraph(next) : null;
      if (next && caption !== null) {
        const figure: Element = {
          type: 'element',
          tagName: 'figure',
          properties: {},
          children: [
            img,
            {
              type: 'element',
              tagName: 'figcaption',
              properties: {},
              children: [{ type: 'text', value: caption }],
            },
          ],
        };
        result.push(figure);
        i = j; // 跳过中间空白与已合并为 figcaption 的说明段落（循环体再 i++）
        continue;
      }
    }
    result.push(node);
  }
  parent.children = result;
}

export function rehypeFigureCaption() {
  return (tree: Root) => {
    transformChildren(tree);
  };
}
