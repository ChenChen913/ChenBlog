// ✅ 修复：原正则 /^[A-Za-z0-9_-]+$/ 会拒绝含中文的 slug（如中文命名的 md 文件），
// 导致中文标题文章的阅读数永远无法记录。改为只禁止路径分隔符和潜在注入字符。
const SAFE_SLUG_RE = /^[^\s/\\<>"'`]+$/;

function sanitizeSlug(slug: string): string {
  const trimmed = slug.trim();
  if (!trimmed || !SAFE_SLUG_RE.test(trimmed)) {
    return '';
  }
  return trimmed.slice(0, 256);
}

export function safeGetStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

export function safeRemoveStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {}
}

export function incrementViews(slug: string): number {
  const safeSlug = sanitizeSlug(slug);
  if (!safeSlug) {
    return 0;
  }
  const key = `views:${safeSlug}`;
  const prev = parseInt(safeGetStorage(key) || '0', 10);
  const next = prev + 1;
  safeSetStorage(key, String(next));
  return next;
}

export function getViews(slug: string): number {
  const safeSlug = sanitizeSlug(slug);
  if (!safeSlug) {
    return 0;
  }
  const key = `views:${safeSlug}`;
  return parseInt(safeGetStorage(key) || '0', 10);
}

export function calcReadTime(content: string): number {
  const cnChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const enWords = content
    .replace(/[\u4e00-\u9fa5]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = cnChars / 300 + enWords / 200;
  return Math.max(1, Math.round(minutes));
}
