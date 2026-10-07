/**
 * Markdown 渲染安全清洗（rehype 插件）
 * ------------------------------------------------------------------
 * 全站最关键的安全基础设施：对 react-markdown 产出的 hast 树做
 * 标签白名单 / 属性白名单 / 危险协议过滤，与 utils/security.ts 的
 * URL 白名单配合构成渲染层防线。
 *
 * 规则概要：
 * - DROP 名单（script/style/iframe 之外的强危险标签）整节点丢弃；
 * - 白名单外标签 unwrap（保留子树，仅剥壳）；
 * - `on*` 事件属性与 `style` 内联样式整体剥离；
 * - a[href] 经 getSafeLinkAttributes 重组（javascript: 等协议剔除）；
 * - img/audio/video/source 的 src 必须过 isSafeResourceUrl；
 * - iframe 不透传原 URL，按白名单域 + 视频 ID 正则重组受信 embed 地址；
 * - input 仅允许 checkbox，且强制 disabled（任务列表交互态由 CSS 呈现）。
 *
 * 从 src/pages/Post.tsx 原样迁移（纯移动重构，行为零变化），
 * 迁移后可直接在 utils 层单测（见 markdown-sanitize.test.ts）。
 */
import { getSafeLinkAttributes, isSafeResourceUrl, toTrustedEmbedUrl } from './security';

const SAFE_MARKDOWN_TAGS = new Set([
  'a',
  'audio',
  'b',
  'blockquote',
  'br',
  'code',
  'del',
  'details',
  'div',
  'em',
  'figcaption',
  'figure',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'input',
  'ins',
  'li',
  'mark',
  'ol',
  'p',
  'pre',
  'source',
  'span',
  'strong',
  'summary',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul',
  'video',
  'iframe',
]);

const DROP_MARKDOWN_TAGS = new Set([
  'base',
  'embed',
  'form',
  'frame',
  'frameset',
  'link',
  'meta',
  'object',
  'script',
  'style',
  'svg',
  'math',
  'textarea',
]);

const GLOBAL_MARKDOWN_ATTRS = new Set([
  'aria-hidden',
  'aria-label',
  'className',
  'id',
  'role',
  'title',
]);

const TAG_MARKDOWN_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'rel', 'target', 'title']),
  audio: new Set(['controls', 'preload', 'src', 'title']),
  iframe: new Set(['allow', 'allowFullScreen', 'src', 'title']),
  img: new Set(['alt', 'height', 'loading', 'referrerPolicy', 'src', 'title', 'width']),
  input: new Set(['checked', 'disabled', 'type']),
  source: new Set(['src', 'type']),
  td: new Set(['align']),
  th: new Set(['align']),
  video: new Set(['controls', 'height', 'preload', 'src', 'title', 'width']),
};

export function rehypeSanitizeMarkdown() {
  return (tree: any) => {
    const sanitizeChildren = (node: any) => {
      if (!Array.isArray(node.children)) {
        return;
      }

      node.children = node.children.flatMap((child: any) => {
        const sanitized = sanitizeNode(child);
        return Array.isArray(sanitized) ? sanitized : sanitized ? [sanitized] : [];
      });
    };

    const sanitizeNode = (node: any): any | any[] | null => {
      if (!node || node.type !== 'element') {
        return node;
      }

      const tagName = String(node.tagName || '').toLowerCase();

      if (DROP_MARKDOWN_TAGS.has(tagName)) {
        return null;
      }

      sanitizeChildren(node);

      if (!SAFE_MARKDOWN_TAGS.has(tagName)) {
        return Array.isArray(node.children) ? node.children : null;
      }

      const sourceProps = node.properties ?? {};
      const safeProps: Record<string, unknown> = {};
      const tagAttrs = TAG_MARKDOWN_ATTRS[tagName] ?? new Set<string>();

      Object.entries(sourceProps).forEach(([key, value]) => {
        if (/^on/i.test(key) || key === 'style') {
          return;
        }

        if (GLOBAL_MARKDOWN_ATTRS.has(key) || tagAttrs.has(key)) {
          safeProps[key] = value;
        }
      });

      if (tagName === 'a') {
        const attrs = getSafeLinkAttributes(String(sourceProps.href ?? ''));
        if (!attrs.href) {
          delete safeProps.href;
          delete safeProps.target;
          delete safeProps.rel;
        } else {
          Object.assign(safeProps, attrs);
        }
      }

      if (['img', 'audio', 'video', 'source'].includes(tagName)) {
        const src = String(sourceProps.src ?? '');
        if (!isSafeResourceUrl(src)) {
          return null;
        }
        safeProps.src = src.trim();
      }

      if (tagName === 'iframe') {
        const embedSrc = toTrustedEmbedUrl(String(sourceProps.src ?? ''));
        if (!embedSrc) {
          return null;
        }
        safeProps.src = embedSrc;
        safeProps.allow =
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        safeProps.allowFullScreen = true;
      }

      if (tagName === 'input') {
        if (sourceProps.type !== 'checkbox') {
          return null;
        }
        safeProps.type = 'checkbox';
        safeProps.disabled = true;
        if (sourceProps.checked) {
          safeProps.checked = true;
        }
      }

      node.properties = safeProps;
      return node;
    };

    sanitizeChildren(tree);
  };
}
