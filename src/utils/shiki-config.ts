/**
 * Shiki Theme Configuration
 *
 * This module provides theme configuration for Shiki syntax highlighting
 * with support for light/dark mode dual-theme switching.
 */

export interface ThemeConfig {
  light: {
    shikiTheme: string;
    backgroundColor: string;
    textColor: string;
    lineNumberColor: string;
    borderColor: string;
  };
  dark: {
    shikiTheme: string;
    backgroundColor: string;
    textColor: string;
    lineNumberColor: string;
    borderColor: string;
  };
}

/**
 * Default theme configuration for code blocks
 * Uses GitHub's light and dark themes for consistency with VS Code
 */
export const defaultThemeConfig: ThemeConfig = {
  light: {
    shikiTheme: 'github-light',
    backgroundColor: '#ffffff',
    textColor: '#24292e',
    lineNumberColor: '#9ca3af',
    borderColor: '#e5e7eb',
  },
  dark: {
    shikiTheme: 'github-dark',
    backgroundColor: '#09090b',
    textColor: '#e1e4e8',
    lineNumberColor: '#6b7280',
    borderColor: '#3f3f46',
  },
};

/**
 * Get theme configuration for the current mode
 */
export function getThemeConfig(isDark: boolean): ThemeConfig['light'] | ThemeConfig['dark'] {
  return isDark ? defaultThemeConfig.dark : defaultThemeConfig.light;
}
