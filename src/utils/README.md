# Code Block Enhancement Utilities

This directory contains utilities for the enhanced code block component with Shiki syntax highlighting.

## Files

### `shiki-config.ts`
Theme configuration for Shiki syntax highlighting with dual-theme support (light/dark).

**Exports:**
- `ThemeConfig` - TypeScript interface for theme configuration
- `defaultThemeConfig` - Default theme settings using GitHub light/dark themes
- `getThemeConfig(isDark: boolean)` - Get theme config for current mode

**Usage:**
```typescript
import { getThemeConfig } from './shiki-config';

const themeConfig = getThemeConfig(isDark);
console.log(themeConfig.backgroundColor); // '#ffffff' or '#09090b'
```

### `theme-detection.ts`
Utilities for detecting and monitoring the current theme (light/dark) with multiple fallback strategies.

**Exports:**
- `detectTheme()` - Detect current theme with fallbacks
- `observeThemeChanges(callback)` - Set up theme change observers
- `useThemeDetection(setTheme)` - Hook-friendly theme detection

**Detection Strategy:**
1. Check `document.documentElement.classList` for 'dark' class
2. Fall back to `prefers-color-scheme` media query
3. Default to 'light' if all methods fail

**Usage:**
```typescript
import { detectTheme, observeThemeChanges } from './theme-detection';

// Get current theme
const theme = detectTheme(); // 'light' | 'dark'

// Watch for theme changes
const cleanup = observeThemeChanges((newTheme) => {
  console.log('Theme changed to:', newTheme);
});

// Clean up when done
cleanup();
```

### `shiki-highlighter.ts`
Core Shiki syntax highlighting utilities with caching and dual-theme support.

**Exports:**
- `getHighlighter()` - Get or create singleton Shiki highlighter instance
- `highlightCode(code, language)` - Highlight code with dual-theme support
- `getHighlightedCode(code, language)` - Get highlighted code with caching
- `getCacheKey(code, language)` - Generate cache key
- `clearHighlightCache()` - Clear the highlight cache

**Features:**
- Singleton highlighter instance for performance
- LRU cache with automatic eviction (max 100 entries)
- Language alias normalization (js → javascript, py → python, etc.)
- Graceful fallback to plain text for unsupported languages
- HTML escaping for security

**Usage:**
```typescript
import { getHighlightedCode } from './shiki-highlighter';

// Highlight code (with caching)
const html = await getHighlightedCode(
  'const x = 42;',
  'javascript'
);

// The HTML includes both light and dark themes
// Theme switching happens via CSS without re-rendering
```

### `index.ts`
Central export file for all utilities.

**Usage:**
```typescript
import {
  detectTheme,
  getThemeConfig,
  getHighlightedCode,
} from '@/utils';
```

## Implementation Details

### Dual-Theme Support

The Shiki highlighter generates HTML with both light and dark themes embedded:

```html
<code class="shiki shiki-themes github-light github-dark">
  <span style="color:#24292e;--shiki-dark:#e1e4e8">const</span>
  <span style="color:#005cc5;--shiki-dark:#79b8ff">x</span>
  ...
</code>
```

Theme switching is handled by CSS:
- Light mode: Uses inline `color` values
- Dark mode: Uses CSS custom properties (`--shiki-dark`)

This allows instant theme switching without re-rendering or re-highlighting.

### Performance Optimizations

1. **Singleton Highlighter**: Only one Shiki instance is created and reused
2. **LRU Cache**: Highlighted HTML is cached to avoid re-computation
3. **Lazy Loading**: Highlighter is created on first use
4. **Language Bundling**: Only common languages are pre-loaded

### Error Handling

All utilities include comprehensive error handling:
- Theme detection falls back to 'light' on error
- Highlighting falls back to plain text on error
- Cache operations are wrapped in try-catch
- All errors are logged to console for debugging

## Testing

The utilities have been verified to work correctly:
- ✓ Theme detection with fallbacks
- ✓ Code highlighting with dual-theme support
- ✓ Cache functionality (same instance returned)
- ✓ Language alias normalization
- ✓ Unsupported language fallback

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **4.1**: Language-specific syntax highlighting
- **4.4**: Theme-synchronized syntax colors
- **6.1**: Automatic dark theme application
- **6.2**: Automatic light theme application
- **7.2**: Efficient syntax highlighting library (Shiki)

## Next Steps

These utilities will be integrated into the CodeBlock component in subsequent tasks:
- Task 2: Core component structure
- Task 8: Syntax highlighting integration
- Task 10: Visual styling and theming
