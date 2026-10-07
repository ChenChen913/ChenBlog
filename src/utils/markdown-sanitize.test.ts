import { describe, expect, it } from 'vitest';
import { rehypeSanitizeMarkdown } from './markdown-sanitize';

/** 构造最小 hast 树并跑一遍清洗插件 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitize(node: any): any {
  const tree = { type: 'root', children: [node] };
  rehypeSanitizeMarkdown()(tree);
  return tree.children[0];
}

/** 深度查找第一个匹配标签的节点 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findTag(node: any, tagName: string): any | undefined {
  if (!node || typeof node !== 'object') return undefined;
  if (node.tagName === tagName) return node;
  for (const child of node.children ?? []) {
    const found = findTag(child, tagName);
    if (found) return found;
  }
  return undefined;
}

describe('rehypeSanitizeMarkdown', () => {
  it('丢弃强危险标签（script/style/form 等整节点删除）', () => {
    const result = sanitize({
      type: 'element',
      tagName: 'script',
      properties: { src: 'https://evil.example/x.js' },
      children: [{ type: 'text', value: 'alert(1)' }],
    });
    expect(result).toBeUndefined();
  });

  it('剥离 on* 事件属性与 style 内联样式', () => {
    const result = sanitize({
      type: 'element',
      tagName: 'div',
      properties: {
        className: 'wrapper',
        onclick: 'alert(1)',
        onMouseOver: 'alert(2)',
        style: 'position:fixed',
        title: 'ok',
      },
      children: [],
    });
    expect(result.properties).toEqual({ className: 'wrapper', title: 'ok' });
  });

  it('白名单外标签 unwrap：剥壳但保留子树', () => {
    const result = sanitize({
      type: 'element',
      tagName: 'section',
      properties: { className: 'x' },
      children: [{ type: 'element', tagName: 'p', properties: {}, children: [] }],
    });
    // section 不在白名单：其子节点被提升，自身消失
    expect(findTag(result, 'section')).toBeUndefined();
    expect(findTag(result, 'p')).toBeDefined();
  });

  it('a[javascript:] 剔除 href，不产生不安全链接', () => {
    const result = sanitize({
      type: 'element',
      tagName: 'a',
      properties: { href: 'javascript:alert(1)', title: 'x' },
      children: [],
    });
    expect(result.properties.href).toBeUndefined();
    expect(result.properties.title).toBe('x');
  });

  it('a[外链 http] 重组为受信外链（补 target/rel）', () => {
    const result = sanitize({
      type: 'element',
      tagName: 'a',
      properties: { href: 'https://github.com/ChenChen913' },
      children: [],
    });
    expect(result.properties.href).toBe('https://github.com/ChenChen913');
    expect(result.properties.target).toBe('_blank');
    expect(result.properties.rel).toBe('noopener noreferrer');
  });

  it('img[javascript: src] 整节点丢弃', () => {
    const result = sanitize({
      type: 'element',
      tagName: 'img',
      properties: { src: 'javascript:alert(1)', alt: 'evil' },
      children: [],
    });
    expect(result).toBeUndefined();
  });

  it('img[正常相对路径] 保留 src', () => {
    const result = sanitize({
      type: 'element',
      tagName: 'img',
      properties: { src: '/article-demo-placeholder.svg', alt: 'demo' },
      children: [],
    });
    expect(result.properties.src).toBe('/article-demo-placeholder.svg');
  });

  it('iframe 不透传原 URL：非白名单域直接丢弃', () => {
    const result = sanitize({
      type: 'element',
      tagName: 'iframe',
      properties: { src: 'https://evil.example/embed' },
      children: [],
    });
    expect(result).toBeUndefined();
  });

  it('iframe[YouTube] 重组为受信 embed 地址并强制 allow 属性', () => {
    const result = sanitize({
      type: 'element',
      tagName: 'iframe',
      properties: { src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      children: [],
    });
    expect(result.properties.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    expect(result.properties.allow).toContain('accelerometer');
    expect(result.properties.allowFullScreen).toBe(true);
  });

  it('input 仅允许 checkbox 且强制 disabled，其他类型丢弃', () => {
    const dropped = sanitize({
      type: 'element',
      tagName: 'input',
      properties: { type: 'text' },
      children: [],
    });
    expect(dropped).toBeUndefined();

    const checkbox = sanitize({
      type: 'element',
      tagName: 'input',
      properties: { type: 'checkbox', checked: true },
      children: [],
    });
    expect(checkbox.properties.type).toBe('checkbox');
    expect(checkbox.properties.disabled).toBe(true);
    expect(checkbox.properties.checked).toBe(true);
  });

  it('嵌套结构：危险子节点剔除后兄弟节点保留', () => {
    const result = sanitize({
      type: 'element',
      tagName: 'div',
      properties: {},
      children: [
        { type: 'element', tagName: 'script', properties: {}, children: [] },
        {
          type: 'element',
          tagName: 'p',
          properties: {},
          children: [{ type: 'text', value: 'keep' }],
        },
        { type: 'element', tagName: 'style', properties: {}, children: [] },
      ],
    });
    expect(result.children).toHaveLength(1);
    expect(result.children[0].tagName).toBe('p');
  });

  it('非元素节点（text/root）原样透传', () => {
    const text = { type: 'text', value: 'hello' };
    expect(sanitize(text)).toBe(text);
  });
});
