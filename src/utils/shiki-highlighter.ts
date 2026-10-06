/**
 * Shiki syntax highlighting helpers for the blog code block component.
 *
 * This version returns tokenized lines instead of raw HTML so the UI can
 * render each source line in a shared row with its line number. That keeps
 * wrapped lines visually attached to the correct number.
 *
 * ⚡ Performance: uses fine-grained imports (shiki/core + dynamic per-language
 * chunks) instead of the full `shiki` bundle. Each language grammar becomes
 * a separate lazy chunk that is only fetched when an article actually uses
 * that language - instead of shipping 200+ grammars (~800KB gzip) up front.
 */

import { createHighlighterCore, type HighlighterCore, type LanguageInput } from 'shiki/core';
import { createOnigurumaEngine } from '@shikijs/engine-oniguruma';
import { defaultThemeConfig } from './shiki-config';

export interface HighlightToken {
  content: string;
  color?: string;
  fontStyle?: number;
}

export interface HighlightLine {
  tokens: HighlightToken[];
}

export interface HighlightResult {
  bg: string;
  fg: string;
  lines: HighlightLine[];
  themeName: string;
}

type ThemeMode = 'light' | 'dark';

let highlighterInstance: HighlighterCore | null = null;
let highlighterPromise: Promise<HighlighterCore> | null = null;

/**
 * Dynamic per-language loaders. Rollup turns each import() into its own
 * small chunk, fetched only when an article actually contains that language.
 */
const LANG_LOADERS: Record<string, () => Promise<{ default: unknown }>> = {
  javascript: () => import('shiki/langs/javascript.mjs'),
  typescript: () => import('shiki/langs/typescript.mjs'),
  jsx: () => import('shiki/langs/jsx.mjs'),
  tsx: () => import('shiki/langs/tsx.mjs'),
  python: () => import('shiki/langs/python.mjs'),
  java: () => import('shiki/langs/java.mjs'),
  go: () => import('shiki/langs/go.mjs'),
  rust: () => import('shiki/langs/rust.mjs'),
  html: () => import('shiki/langs/html.mjs'),
  css: () => import('shiki/langs/css.mjs'),
  json: () => import('shiki/langs/json.mjs'),
  yaml: () => import('shiki/langs/yaml.mjs'),
  markdown: () => import('shiki/langs/markdown.mjs'),
  bash: () => import('shiki/langs/bash.mjs'),
  sql: () => import('shiki/langs/sql.mjs'),
  php: () => import('shiki/langs/php.mjs'),
  ruby: () => import('shiki/langs/ruby.mjs'),
  swift: () => import('shiki/langs/swift.mjs'),
  kotlin: () => import('shiki/langs/kotlin.mjs'),
  dart: () => import('shiki/langs/dart.mjs'),
  c: () => import('shiki/langs/c.mjs'),
  cpp: () => import('shiki/langs/cpp.mjs'),
  csharp: () => import('shiki/langs/csharp.mjs'),
};

const SUPPORTED_LANGUAGES = Object.keys(LANG_LOADERS);

/** Languages that most articles use - preloaded with the highlighter. */
const PRELOAD_LANGUAGES = ['javascript', 'typescript', 'tsx', 'jsx', 'css', 'html', 'json', 'bash'];

export async function getHighlighter(): Promise<HighlighterCore> {
  if (highlighterInstance) {
    return highlighterInstance;
  }

  if (highlighterPromise) {
    return highlighterPromise;
  }

  highlighterPromise = createHighlighterCore({
    themes: [
      import('shiki/themes/github-light.mjs'),
      import('shiki/themes/github-dark.mjs'),
    ],
    langs: PRELOAD_LANGUAGES.map(lang => LANG_LOADERS[lang]() as LanguageInput),
    engine: createOnigurumaEngine(import('shiki/wasm')),
  })
    .then(highlighter => {
      highlighterInstance = highlighter;
      return highlighter;
    })
    .catch(error => {
      console.error('Failed to create Shiki highlighter:', error);
      highlighterPromise = null;
      throw error;
    });

  return highlighterPromise;
}

/** Lazily load a language grammar the first time an article needs it. */
async function ensureLanguageLoaded(
  highlighter: HighlighterCore,
  language: string
): Promise<boolean> {
  if (highlighter.getLoadedLanguages().includes(language)) {
    return true;
  }

  const loader = LANG_LOADERS[language];
  if (!loader) {
    return false;
  }

  try {
    const mod = await loader();
    const registration = (mod as { default?: unknown }).default ?? mod;
    await highlighter.loadLanguage(registration as Parameters<HighlighterCore['loadLanguage']>[0]);
    return true;
  } catch (error) {
    console.error(`Failed to load language ${language}:`, error);
    return false;
  }
}

function normalizeLanguage(language: string): string {
  const langMap: Record<string, string> = {
    js: 'javascript',
    md: 'markdown',
    py: 'python',
    rb: 'ruby',
    sh: 'bash',
    text: 'text',
    ts: 'typescript',
    yml: 'yaml',
    zsh: 'bash',
  };

  return langMap[language.toLowerCase()] || language.toLowerCase();
}

function toPlainTextHighlight(code: string, themeMode: ThemeMode): HighlightResult {
  const theme = defaultThemeConfig[themeMode];
  const lines = (code === '' ? [''] : code.split('\n')).map(line => ({
    tokens: [
      {
        content: line,
        color: theme.textColor,
        fontStyle: 0,
      },
    ],
  }));

  return {
    bg: theme.backgroundColor,
    fg: theme.textColor,
    lines,
    themeName: theme.shikiTheme,
  };
}

function parseHexColor(color?: string): [number, number, number] | null {
  if (!color) {
    return null;
  }

  const normalized = color.trim();
  const match = normalized.match(/^#([0-9a-f]{6})$/i);
  if (!match) {
    return null;
  }

  const value = match[1];
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function toRelativeLuminance([red, green, blue]: [number, number, number]): number {
  const channel = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return (0.2126 * channel(red)) + (0.7152 * channel(green)) + (0.0722 * channel(blue));
}

function contrastRatio(foreground: [number, number, number], background: [number, number, number]): number {
  const foregroundLuminance = toRelativeLuminance(foreground);
  const backgroundLuminance = toRelativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function toHexColor([red, green, blue]: [number, number, number]): string {
  return `#${[red, green, blue].map(value => value.toString(16).padStart(2, '0')).join('')}`;
}

export function ensureReadableLightColor(color?: string, backgroundColor = '#fbfaf8'): string | undefined {
  const parsedColor = parseHexColor(color);
  const parsedBackground = parseHexColor(backgroundColor);

  if (!parsedColor || !parsedBackground) {
    return color;
  }

  if (contrastRatio(parsedColor, parsedBackground) >= 4.5) {
    return color;
  }

  const ink: [number, number, number] = [15, 23, 42];
  let adjusted = parsedColor;

  for (let step = 1; step <= 10; step += 1) {
    const weight = step / 10;
    adjusted = [
      Math.round(parsedColor[0] * (1 - weight) + ink[0] * weight),
      Math.round(parsedColor[1] * (1 - weight) + ink[1] * weight),
      Math.round(parsedColor[2] * (1 - weight) + ink[2] * weight),
    ];

    if (contrastRatio(adjusted, parsedBackground) >= 4.5) {
      return toHexColor(adjusted);
    }
  }

  return '#0f172a';
}

function hashCode(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    const char = value.charCodeAt(index);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }

  return hash;
}

export function getCacheKey(code: string, language: string, themeMode: ThemeMode): string {
  return `${themeMode}:${language}:${hashCode(code)}`;
}

interface CacheEntry {
  result: HighlightResult;
  timestamp: number;
}

const highlightCache = new Map<string, CacheEntry>();
const MAX_CACHE_SIZE = 100;

function evictOldestCacheEntries(): void {
  const entries = Array.from(highlightCache.entries()).sort(
    (entryA, entryB) => entryA[1].timestamp - entryB[1].timestamp
  );
  const removeCount = Math.floor(MAX_CACHE_SIZE * 0.2);

  for (let index = 0; index < removeCount; index += 1) {
    const entry = entries[index];
    if (entry) {
      highlightCache.delete(entry[0]);
    }
  }
}

export async function getHighlightedTokens(
  code: string,
  language: string,
  themeMode: ThemeMode
): Promise<HighlightResult> {
  const normalizedLanguage = normalizeLanguage(language);
  const cacheKey = getCacheKey(code, normalizedLanguage, themeMode);
  const cached = highlightCache.get(cacheKey);

  if (cached) {
    cached.timestamp = Date.now();
    return cached.result;
  }

  try {
    const highlighter = await getHighlighter();

    if (!(await ensureLanguageLoaded(highlighter, normalizedLanguage))) {
      const fallback = toPlainTextHighlight(code, themeMode);
      highlightCache.set(cacheKey, { result: fallback, timestamp: Date.now() });
      return fallback;
    }

    const themeName = themeMode === 'light' ? 'github-light' : 'github-dark';
    const tokens = highlighter.codeToTokens(code, {
      lang: normalizedLanguage,
      theme: themeName,
    });

    const result: HighlightResult = {
      bg: tokens.bg ?? defaultThemeConfig[themeMode].backgroundColor,
      fg: tokens.fg ?? defaultThemeConfig[themeMode].textColor,
      lines: tokens.tokens.map(line => ({
        tokens: line.map(token => ({
          color: themeMode === 'light' ? ensureReadableLightColor(token.color) : token.color,
          content: token.content,
          fontStyle: token.fontStyle ?? 0,
        })),
      })),
      themeName: tokens.themeName ?? themeName,
    };

    highlightCache.set(cacheKey, { result, timestamp: Date.now() });
    if (highlightCache.size > MAX_CACHE_SIZE) {
      evictOldestCacheEntries();
    }

    return result;
  } catch (error) {
    console.error(`Failed to highlight ${language} code:`, error);
    return toPlainTextHighlight(code, themeMode);
  }
}

export function clearHighlightCache(): void {
  highlightCache.clear();
}
