/**
 * rehype 插件：Bionic Reading 英文锚定
 *
 * 将拉丁词（≥3 字符）的前半段包裹为 <b class="bionic-word">，
 * 形成一串视觉锚点，帮助视线在长英文段落中定位、减少串行。
 *
 * 边界（与安全/渲染管线对齐）：
 * - 在 rehypeSanitizeMarkdown 之前运行：'b' 与 className 均在白名单内，可安全通过
 * - 跳过 code / pre / kbd / samp：不碰代码，也天然避开 remark-math 产出的
 *   language-math 节点（其 hast 形态正是 code/pre），公式源文本零污染
 * - 跳过 h1–h6：标题无需锚定，避免满屏加粗噪音
 * - 中文不处理：CJK 无"词前缀"结构，强行为之只会制造视觉噪音
 *   （中文的引导职责由"段落聚焦"承担，两者互不越界）
 *
 * 可逆性：插件从 rehypePlugins 列表移除后重新渲染即恢复原貌，
 * 无任何 DOM 手术，不存在 React 调和冲突。
 */

const SKIP_TAGS = new Set([
  'code',
  'pre',
  'kbd',
  'samp',
  'script',
  'style',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
]);

/** 拉丁词：字母开头，允许连字符/撇号（如 don't、state-of-the-art 视作多段各自处理） */
const LATIN_WORD_RE = /[A-Za-z][A-Za-z'’-]*/g;

function splitBionicWord(word: string): { bold: string; rest: string } | null {
  // 过短的词锚定无意义且观感破碎（of / to / a…）
  if (word.length < 3) {
    return null;
  }
  const boldLen = Math.ceil(word.length / 2);
  return { bold: word.slice(0, boldLen), rest: word.slice(boldLen) };
}

function bionicizeText(value: string): any[] | null {
  LATIN_WORD_RE.lastIndex = 0;
  const matches = value.match(LATIN_WORD_RE);
  if (!matches) {
    return null;
  }

  // 快速路径：所有匹配词都太短（纯中文段落、纯数字等），保持原样
  if (matches.every(word => word.length < 3)) {
    return null;
  }

  const parts: any[] = [];
  let lastIndex = 0;
  let matched: RegExpExecArray | null;

  LATIN_WORD_RE.lastIndex = 0;
  while ((matched = LATIN_WORD_RE.exec(value)) !== null) {
    const word = matched[0];
    const before = value.slice(lastIndex, matched.index);
    if (before) {
      parts.push({ type: 'text', value: before });
    }

    const split = splitBionicWord(word);
    if (split) {
      parts.push({
        type: 'element',
        tagName: 'b',
        properties: { className: ['bionic-word'] },
        children: [{ type: 'text', value: split.bold }],
      });
      if (split.rest) {
        parts.push({ type: 'text', value: split.rest });
      }
    } else {
      parts.push({ type: 'text', value: word });
    }
    lastIndex = matched.index + word.length;
  }

  const tail = value.slice(lastIndex);
  if (tail) {
    parts.push({ type: 'text', value: tail });
  }
  return parts.length ? parts : null;
}

export function rehypeBionic() {
  return (tree: any) => {
    const walk = (node: any) => {
      if (!node.children) {
        return;
      }
      if (node.type === 'element' && SKIP_TAGS.has(String(node.tagName || '').toLowerCase())) {
        return;
      }

      node.children = node.children.flatMap((child: any) => {
        if (child.type === 'text' && typeof child.value === 'string') {
          const parts = bionicizeText(child.value);
          return parts ?? [child];
        }
        walk(child);
        return [child];
      });
    };

    walk(tree);
  };
}
