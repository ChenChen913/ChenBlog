const SAFE_URL_BASE = 'https://blog.local';

const BLOCKED_PROTOCOLS = new Set(['javascript:', 'vbscript:', 'data:', 'file:']);
const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const SAFE_RESOURCE_PROTOCOLS = new Set(['http:', 'https:']);
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']);
const BILIBILI_HOSTS = new Set(['bilibili.com', 'www.bilibili.com', 'm.bilibili.com', 'player.bilibili.com']);

function hasUnsafeProtocol(value: string): boolean {
  const compact = value.trim().replace(/[\u0000-\u001f\u007f\s]+/g, '').toLowerCase();
  return Array.from(BLOCKED_PROTOCOLS).some(protocol => compact.startsWith(protocol));
}

function parseUrl(value?: string): URL | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || hasUnsafeProtocol(trimmed)) {
    return null;
  }

  try {
    return new URL(trimmed, SAFE_URL_BASE);
  } catch {
    return null;
  }
}

export function isSafeHref(value?: string): boolean {
  if (!value) {
    return false;
  }

  if (value.trim().startsWith('#')) {
    return true;
  }

  const parsed = parseUrl(value);
  return parsed !== null && SAFE_LINK_PROTOCOLS.has(parsed.protocol);
}

export function isSafeResourceUrl(value?: string): boolean {
  const parsed = parseUrl(value);
  return parsed !== null && SAFE_RESOURCE_PROTOCOLS.has(parsed.protocol);
}

export function isExternalHref(value?: string): boolean {
  const parsed = parseUrl(value);
  return parsed !== null && SAFE_RESOURCE_PROTOCOLS.has(parsed.protocol) && parsed.origin !== SAFE_URL_BASE;
}

export function getSafeLinkAttributes(value?: string): {
  href?: string;
  target?: '_blank';
  rel?: string;
} {
  if (!isSafeHref(value)) {
    return {};
  }

  const href = value?.trim();
  if (!href) {
    return {};
  }

  if (isExternalHref(href)) {
    return {
      href,
      target: '_blank',
      rel: 'noopener noreferrer',
    };
  }

  return { href };
}

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/\.$/, '');
}

function getYouTubeVideoId(url: URL): string | null {
  const hostname = normalizeHostname(url.hostname);

  if (hostname === 'youtu.be') {
    return url.pathname.split('/').filter(Boolean)[0] ?? null;
  }

  if (url.pathname.startsWith('/embed/')) {
    return url.pathname.split('/').filter(Boolean)[1] ?? null;
  }

  return url.searchParams.get('v');
}

function getBilibiliVideoId(url: URL): string | null {
  if (normalizeHostname(url.hostname) === 'player.bilibili.com') {
    return url.searchParams.get('bvid');
  }

  const match = url.pathname.match(/\/video\/(BV[0-9A-Za-z]+)/);
  return match?.[1] ?? null;
}

function isSafeYouTubeId(value: string | null): value is string {
  return typeof value === 'string' && /^[0-9A-Za-z_-]{6,64}$/.test(value);
}

function isSafeBilibiliId(value: string | null): value is string {
  return typeof value === 'string' && /^BV[0-9A-Za-z]{8,32}$/.test(value);
}

export function toTrustedEmbedUrl(value?: string): string | undefined {
  const parsed = parseUrl(value);
  if (!parsed || !SAFE_RESOURCE_PROTOCOLS.has(parsed.protocol)) {
    return undefined;
  }

  const hostname = normalizeHostname(parsed.hostname);

  if (YOUTUBE_HOSTS.has(hostname)) {
    const videoId = getYouTubeVideoId(parsed);
    return isSafeYouTubeId(videoId)
      ? `https://www.youtube.com/embed/${videoId}`
      : undefined;
  }

  if (BILIBILI_HOSTS.has(hostname)) {
    const bvid = getBilibiliVideoId(parsed);
    return isSafeBilibiliId(bvid)
      ? `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(bvid)}&high_quality=1`
      : undefined;
  }

  return undefined;
}

export function isTrustedEmbedUrl(value?: string): boolean {
  return toTrustedEmbedUrl(value) !== undefined;
}
