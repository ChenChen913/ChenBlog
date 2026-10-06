/**
 * Utility functions for code extraction and language detection
 *
 * These utilities handle the extraction of code text from ReactMarkdown children
 * and language detection from className attributes with proper alias mapping.
 *
 * Requirements: 4.1, 4.3
 */

import React from 'react';

/**
 * Language alias mapping for common programming language abbreviations
 * Maps short aliases to their full language identifiers
 */
const LANGUAGE_ALIAS_MAP: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  jsx: 'jsx',
  tsx: 'tsx',
  py: 'python',
  rb: 'ruby',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  yaml: 'yaml',
  yml: 'yaml',
  json: 'json',
  xml: 'xml',
  html: 'html',
  css: 'css',
  scss: 'scss',
  sass: 'sass',
  less: 'less',
  sql: 'sql',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  'c++': 'cpp',
  go: 'go',
  rust: 'rust',
  rs: 'rust',
  php: 'php',
  swift: 'swift',
  kotlin: 'kotlin',
  kt: 'kotlin',
  dart: 'dart',
  r: 'r',
  scala: 'scala',
  perl: 'perl',
  lua: 'lua',
  vim: 'vim',
  diff: 'diff',
  markdown: 'markdown',
  md: 'markdown',
  text: 'text',
  txt: 'text',
  plaintext: 'text',
};

const LANGUAGE_DISPLAY_MAP: Record<string, string> = {
  bash: 'Shell',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  css: 'CSS',
  dart: 'Dart',
  go: 'Go',
  html: 'HTML',
  java: 'Java',
  javascript: 'JavaScript',
  json: 'JSON',
  jsx: 'JSX',
  kotlin: 'Kotlin',
  markdown: 'Markdown',
  php: 'PHP',
  python: 'Python',
  ruby: 'Ruby',
  rust: 'Rust',
  sql: 'SQL',
  swift: 'Swift',
  text: 'Plain Text',
  tsx: 'TSX',
  typescript: 'TypeScript',
  yaml: 'YAML',
};

/**
 * Extract plain text code from ReactMarkdown children
 *
 * Handles various ReactMarkdown output formats including:
 * - Plain strings
 * - Arrays of strings and ReactElements
 * - Nested ReactElements with children props
 * - Edge cases like null, undefined, numbers, booleans
 *
 * @param children - ReactMarkdown children (can be string, ReactNode, array, etc.)
 * @returns Extracted code text with trailing newlines removed
 *
 * @example
 * ```typescript
 * // String input
 * extractCodeText('const x = 1;') // => 'const x = 1;'
 *
 * // Array input
 * extractCodeText(['const x = 1;', '\n', 'const y = 2;']) // => 'const x = 1;\nconst y = 2;'
 *
 * // ReactElement input
 * extractCodeText(<code>const x = 1;</code>) // => 'const x = 1;'
 *
 * // Edge cases
 * extractCodeText(null) // => ''
 * extractCodeText(undefined) // => ''
 * extractCodeText(42) // => '42'
 * ```
 *
 * Requirements: 4.1, 4.3
 */
export function extractCodeText(children: React.ReactNode): string {
  // Handle null and undefined
  if (children === null || children === undefined) {
    return '';
  }

  // Handle string type - most common case
  if (typeof children === 'string') {
    // Remove trailing newlines to avoid extra blank lines
    return children.replace(/\n+$/, '');
  }

  // Handle number and boolean types
  if (typeof children === 'number' || typeof children === 'boolean') {
    return String(children);
  }

  // Handle array type - recursively process each element
  if (Array.isArray(children)) {
    const extracted = children
      .map(child => {
        // Recursively extract from each child
        if (child === null || child === undefined) {
          return '';
        }

        if (typeof child === 'string') {
          return child;
        }

        if (typeof child === 'number' || typeof child === 'boolean') {
          return String(child);
        }

        if (React.isValidElement(child)) {
          const props = child.props as { children?: React.ReactNode };
          return extractCodeText(props.children);
        }

        // Fallback for other types
        return String(child);
      })
      .join('');

    // Remove trailing newlines from the final result
    return extracted.replace(/\n+$/, '');
  }

  // Handle ReactElement type - extract from props.children
  if (React.isValidElement(children)) {
    const props = children.props as { children?: React.ReactNode };
    return extractCodeText(props.children);
  }

  // Fallback for any other type (objects, functions, symbols, etc.)
  // Convert to string but handle potential errors
  try {
    const stringified = String(children);
    return stringified.replace(/\n+$/, '');
  } catch (err) {
    console.warn('Failed to convert children to string:', err);
    return '';
  }
}

/**
 * Extract and normalize programming language from className
 *
 * Parses className strings in the format "language-{lang}" and maps
 * common aliases to their full language identifiers. Returns 'text'
 * for plain text when no language is specified.
 *
 * @param className - CSS className string, typically from ReactMarkdown
 * @returns Normalized language identifier
 *
 * @example
 * ```typescript
 * // Standard language classes
 * getLanguageFromClassName('language-javascript') // => 'javascript'
 * getLanguageFromClassName('language-python') // => 'python'
 *
 * // Alias mapping
 * getLanguageFromClassName('language-js') // => 'javascript'
 * getLanguageFromClassName('language-ts') // => 'typescript'
 * getLanguageFromClassName('language-py') // => 'python'
 *
 * // Edge cases
 * getLanguageFromClassName(undefined) // => 'text'
 * getLanguageFromClassName('') // => 'text'
 * getLanguageFromClassName('not-a-language-class') // => 'text'
 * getLanguageFromClassName('language-unknown') // => 'unknown'
 *
 * // Multiple classes
 * getLanguageFromClassName('foo language-rust bar') // => 'rust'
 * ```
 *
 * Requirements: 4.1, 4.3
 */
export function getLanguageFromClassName(className?: string): string {
  // Handle null, undefined, or empty string
  if (!className || typeof className !== 'string') {
    return 'text';
  }

  // Trim whitespace
  const trimmed = className.trim();

  if (trimmed === '') {
    return 'text';
  }

  // Split by whitespace to handle multiple classes
  const classes = trimmed.split(/\s+/);

  // Find the first class that starts with 'language-'
  const languageClass = classes.find(cls => cls.startsWith('language-'));

  if (!languageClass) {
    return 'text';
  }

  // Extract the language identifier after 'language-'
  const rawLang = languageClass.replace('language-', '').toLowerCase();

  // Handle empty language identifier
  if (rawLang === '') {
    return 'text';
  }

  // Map alias to full language name, or return as-is if not in map
  return LANGUAGE_ALIAS_MAP[rawLang] || rawLang;
}

/**
 * Walk ReactMarkdown children and return the first language-bearing className.
 */
export function extractCodeClassName(children: React.ReactNode): string | undefined {
  if (children === null || children === undefined) {
    return undefined;
  }

  if (Array.isArray(children)) {
    for (const child of children) {
      const className = extractCodeClassName(child);
      if (className) {
        return className;
      }
    }
    return undefined;
  }

  if (React.isValidElement(children)) {
    const props = children.props as { className?: string; children?: React.ReactNode };
    if (typeof props.className === 'string' && props.className.includes('language-')) {
      return props.className;
    }
    return extractCodeClassName(props.children);
  }

  return undefined;
}

/**
 * Resolve the effective code language from the wrapper or nested code element.
 */
export function resolveCodeLanguage(className?: string, children?: React.ReactNode): string {
  const directLanguage = getLanguageFromClassName(className);
  if (directLanguage !== 'text') {
    return directLanguage;
  }

  return getLanguageFromClassName(extractCodeClassName(children));
}

/**
 * Convert normalized language ids into nicer header labels.
 */
export function formatCodeLanguageLabel(language: string): string {
  const normalizedLanguage = getLanguageFromClassName(`language-${language}`);
  const label = LANGUAGE_DISPLAY_MAP[normalizedLanguage];

  if (label) {
    return label;
  }

  if (!normalizedLanguage) {
    return 'Plain Text';
  }

  return normalizedLanguage
    .split(/[-_]/)
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

/**
 * Get the language alias map for external use
 * Useful for testing and validation
 */
export function getLanguageAliasMap(): Readonly<Record<string, string>> {
  return LANGUAGE_ALIAS_MAP;
}
