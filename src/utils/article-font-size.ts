export const ARTICLE_FONT_SIZE_STORAGE_KEY = 'article-font-size-mode';

export const ARTICLE_FONT_SIZE_MODES = ['small', 'standard', 'large'] as const;

export type ArticleFontSizeMode = (typeof ARTICLE_FONT_SIZE_MODES)[number];

export function isArticleFontSizeMode(value: unknown): value is ArticleFontSizeMode {
  return (
    typeof value === 'string' && (ARTICLE_FONT_SIZE_MODES as readonly string[]).includes(value)
  );
}

export function readArticleFontSizeMode(): ArticleFontSizeMode {
  if (typeof window === 'undefined') {
    return 'standard';
  }

  try {
    const storedValue = window.localStorage.getItem(ARTICLE_FONT_SIZE_STORAGE_KEY);
    return isArticleFontSizeMode(storedValue) ? storedValue : 'standard';
  } catch {
    return 'standard';
  }
}

export function saveArticleFontSizeMode(mode: ArticleFontSizeMode): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(ARTICLE_FONT_SIZE_STORAGE_KEY, mode);
  } catch {
    // Ignore storage failures so reading remains usable in restricted browsers.
  }
}
