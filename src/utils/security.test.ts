import { describe, expect, it } from 'vitest';
import {
  getSafeLinkAttributes,
  isSafeHref,
  isSafeResourceUrl,
  isTrustedEmbedUrl,
  toTrustedEmbedUrl,
} from './security';

describe('security URL helpers', () => {
  it('rejects dangerous link protocols', () => {
    expect(isSafeHref('javascript:alert(1)')).toBe(false);
    expect(isSafeHref('java\nscript:alert(1)')).toBe(false);
    expect(isSafeHref('data:text/html,<script>alert(1)</script>')).toBe(false);
  });

  it('allows safe links and adds external link isolation attributes', () => {
    expect(getSafeLinkAttributes('/posts/typescript-advanced')).toEqual({
      href: '/posts/typescript-advanced',
    });
    expect(getSafeLinkAttributes('https://github.com/example')).toEqual({
      href: 'https://github.com/example',
      target: '_blank',
      rel: 'noopener noreferrer',
    });
  });

  it('rejects unsafe media resources', () => {
    expect(isSafeResourceUrl('/article-demo-placeholder.svg')).toBe(true);
    expect(isSafeResourceUrl('https://example.com/image.png')).toBe(true);
    expect(isSafeResourceUrl('data:image/svg+xml,<svg></svg>')).toBe(false);
    expect(isSafeResourceUrl('file:///C:/secret.txt')).toBe(false);
  });

  it('normalizes trusted YouTube and Bilibili embeds', () => {
    expect(toTrustedEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    );
    expect(toTrustedEmbedUrl('https://www.bilibili.com/video/BV1xx411c7mD')).toBe(
      'https://player.bilibili.com/player.html?bvid=BV1xx411c7mD&high_quality=1'
    );
  });

  it('rejects untrusted or spoofed embeds', () => {
    expect(isTrustedEmbedUrl('https://evil.example/embed/youtube.com/watch?v=dQw4w9WgXcQ')).toBe(false);
    expect(isTrustedEmbedUrl('https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ')).toBe(false);
    expect(isTrustedEmbedUrl('javascript:alert(1)')).toBe(false);
  });
});
