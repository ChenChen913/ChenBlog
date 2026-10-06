import { describe, expect, test } from 'vitest';
import { rehypeBionic } from './bionic';

/** 构造最小 hast：p > text */
function makeTree(html: string): any {
  // 仅测试用：不追求完整 HTML 解析，手动拼常见结构
  const [tag, ...rest] = html.split('|');
  return {
    type: 'root',
    children: [
      {
        type: 'element',
        tagName: tag,
        properties: {},
        children: [{ type: 'text', value: rest.join('|') }],
      },
    ],
  };
}

function collectTexts(node: any, acc: string[] = []): string[] {
  if (node.type === 'text') {
    acc.push(node.value);
  }
  (node.children ?? []).forEach((child: any) => collectTexts(child, acc));
  return acc;
}

function findBolds(
  node: any,
  acc: { bold: string; parent: string }[] = []
): { bold: string; parent: string }[] {
  if (node.type === 'element' && node.tagName === 'b') {
    acc.push({ bold: collectTexts(node).join(''), parent: node.__parentTag ?? '' });
  }
  (node.children ?? []).forEach((child: any) => findBolds(child, acc));
  return acc;
}

/** 给 b 节点标注父链，便于断言"哪些元素里的词被加粗" */
function tagParents(node: any, parentTag = ''): void {
  const currentTag = node.type === 'element' ? node.tagName : parentTag;
  if (node.type === 'element') {
    node.__parentTag = parentTag;
  }
  (node.children ?? []).forEach((child: any) => tagParents(child, currentTag));
}

describe('rehypeBionic', () => {
  test('bolds the first half of English words (ceil)', () => {
    const tree = makeTree('p|The quick brown fox');
    rehypeBionic()(tree);
    const texts = collectTexts(tree);
    // The→Th+e, quick→qui+ck, brown→bro+wn, fox→fo+x
    expect(texts.join('')).toBe('The quick brown fox');
    const bolds = (function collect(node: any, acc: string[] = []): string[] {
      if (node.type === 'element' && node.tagName === 'b') {
        acc.push(collectTexts(node).join(''));
      }
      (node.children ?? []).forEach((c: any) => collect(c, acc));
      return acc;
    })(tree);
    expect(bolds).toEqual(['Th', 'qui', 'bro', 'fo']);
  });

  test('keeps short words untouched', () => {
    const tree = makeTree('p|to be or not to be');
    rehypeBionic()(tree);
    const bolds = (function collect(node: any, acc: string[] = []): string[] {
      if (node.type === 'element' && node.tagName === 'b') {
        acc.push(collectTexts(node).join(''));
      }
      (node.children ?? []).forEach((c: any) => collect(c, acc));
      return acc;
    })(tree);
    expect(bolds).toEqual(['no']);
    expect(collectTexts(tree).join('')).toBe('to be or not to be');
  });

  test('pure Chinese text is untouched', () => {
    const tree = makeTree('p|我们今天讨论阅读功能');
    rehypeBionic()(tree);
    expect(collectTexts(tree)).toEqual(['我们今天讨论阅读功能']);
  });

  test('mixed content: only Latin words get anchors', () => {
    const tree = makeTree('p|使用 React 19 与 TypeScript 编写');
    rehypeBionic()(tree);
    expect(collectTexts(tree).join('')).toBe('使用 React 19 与 TypeScript 编写');
    const bolds = (function collect(node: any, acc: string[] = []): string[] {
      if (node.type === 'element' && node.tagName === 'b') {
        acc.push(collectTexts(node).join(''));
      }
      (node.children ?? []).forEach((c: any) => collect(c, acc));
      return acc;
    })(tree);
    // React(5)→Rea, TypeScript(10)→TypeS（前 5 字符，含大写 S）
    expect(bolds).toEqual(['Rea', 'TypeS']);
  });

  test('skips code, pre and headings entirely', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          properties: {},
          children: [{ type: 'text', value: 'normal reading text here' }],
        },
        {
          type: 'element',
          tagName: 'pre',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'code',
              properties: {},
              children: [{ type: 'text', value: 'const value = compute();' }],
            },
          ],
        },
        {
          type: 'element',
          tagName: 'h2',
          properties: {},
          children: [{ type: 'text', value: 'Section Heading Words' }],
        },
      ],
    };
    rehypeBionic()(tree);
    tagParents(tree);
    const bolds = findBolds(tree);
    expect(bolds.length).toBeGreaterThan(0);
    bolds.forEach(b => {
      expect(['p']).toContain(b.parent);
    });
    // code 内容原样
    const codeText = collectTexts(tree.children[1]).join('');
    expect(codeText).toBe('const value = compute();');
    // 标题内容原样
    expect(collectTexts(tree.children[2])).toEqual(['Section Heading Words']);
  });

  test('hyphenated and apostrophe words stay whole runs', () => {
    const tree = makeTree('p|state-of-the-art craftsman’s tool');
    rehypeBionic()(tree);
    expect(collectTexts(tree).join('')).toBe('state-of-the-art craftsman’s tool');
    const bolds = (function collect(node: any, acc: string[] = []): string[] {
      if (node.type === 'element' && node.tagName === 'b') {
        acc.push(collectTexts(node).join(''));
      }
      (node.children ?? []).forEach((c: any) => collect(c, acc));
      return acc;
    })(tree);
    // 连字符/撇号属于词的一部分：state-of-the-art(16)→前 8 字符 state-of；
    // craftsman’s(11)→前 6 字符 crafts；tool(4)→前 2 字符 to
    expect(bolds).toEqual(['state-of', 'crafts', 'to']);
  });
});
