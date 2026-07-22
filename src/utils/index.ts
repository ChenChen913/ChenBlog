/**
 * Utility exports for code block enhancement
 */

export {
  defaultThemeConfig,
  getThemeConfig,
  type ThemeConfig,
} from './shiki-config';

export {
  detectTheme,
  observeThemeChanges,
  useThemeDetection,
} from './theme-detection';

export {
  getHighlighter,
  getHighlightedTokens,
  getCacheKey,
  clearHighlightCache,
  type HighlightLine,
  type HighlightResult,
  type HighlightToken,
} from './shiki-highlighter';

export {
  extractCodeClassName,
  extractCodeText,
  formatCodeLanguageLabel,
  getLanguageFromClassName,
  getLanguageAliasMap,
  resolveCodeLanguage,
} from './code-extraction';

export {
  copyToClipboard,
} from './clipboard';
