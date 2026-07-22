/**
 * TypeScript interfaces for CodeBlock component
 * 
 * This file defines the type interfaces for the enhanced CodeBlock component
 * using Shiki for syntax highlighting.
 */

/**
 * Props for the main CodeBlock container component
 */
export interface CodeBlockProps {
  /** Child content from ReactMarkdown (typically code string or ReactNode) */
  children?: React.ReactNode;
  
  /** CSS class name, typically "language-{lang}" from markdown */
  className?: string;
  
  /** ReactMarkdown node metadata (optional) */
  node?: any;
  
  /** Whether to display line numbers (default: true) */
  showLineNumbers?: boolean;
  
  /** Whether to enable word wrap for long lines (default: true) */
  enableWordWrap?: boolean;
  
  /** Optional maximum height with scroll behavior */
  maxHeight?: string;
  
  /** Additional props passed through from ReactMarkdown */
  [key: string]: any;
}

/**
 * Internal state management for CodeBlock component
 */
export interface CodeBlockState {
  /** Whether code has been copied to clipboard */
  copied: boolean;
  
  /** Current theme mode (light or dark) */
  isDark: boolean;
  
  /** Shiki-generated HTML output for syntax highlighting */
  highlightedCode: string;
  
  /** Loading state for async highlighting operations */
  isLoading: boolean;
}

/**
 * Props for the CodeBlockHeader component
 */
export interface CodeBlockHeaderProps {
  /** Programming language identifier for display */
  language: string;
  
  /** Callback function when copy button is clicked */
  onCopy: () => void;
  
  /** Whether code has been copied (for visual feedback) */
  copied: boolean;
  
  /** Current theme mode for styling */
  isDark: boolean;
}

/**
 * Props for the CodeBlockContent component
 */
export interface CodeBlockContentProps {
  /** Raw code string to be displayed */
  code: string;
  
  /** Programming language identifier */
  language: string;
  
  /** Current theme mode */
  isDark: boolean;
  
  /** Whether to show line numbers */
  showLineNumbers: boolean;
  
  /** Whether to enable word wrap */
  enableWordWrap: boolean;
  
  /** Pre-rendered Shiki HTML output */
  highlightedHTML: string;
}

/**
 * Theme configuration for light and dark modes
 */
export interface ThemeConfig {
  light: {
    /** Shiki theme name for light mode */
    shikiTheme: string;
    
    /** Background color for code block */
    backgroundColor: string;
    
    /** Text color for code content */
    textColor: string;
    
    /** Color for line numbers */
    lineNumberColor: string;
    
    /** Border color for code block */
    borderColor: string;
  };
  dark: {
    /** Shiki theme name for dark mode */
    shikiTheme: string;
    
    /** Background color for code block */
    backgroundColor: string;
    
    /** Text color for code content */
    textColor: string;
    
    /** Color for line numbers */
    lineNumberColor: string;
    
    /** Border color for code block */
    borderColor: string;
  };
}

/**
 * Accessibility metadata for screen readers and ARIA labels
 */
export interface A11yMetadata {
  /** ARIA label for copy button */
  copyButtonLabel: string;
  
  /** ARIA label when code is copied */
  copiedLabel: string;
  
  /** ARIA label for code block container */
  codeBlockLabel: string;
  
  /** Function to generate line number labels */
  lineNumberLabel: (line: number) => string;
}

/**
 * Default theme configuration
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
 * Default accessibility metadata
 */
export const defaultA11yMetadata: A11yMetadata = {
  copyButtonLabel: 'Copy code to clipboard',
  copiedLabel: 'Code copied to clipboard',
  codeBlockLabel: 'Code block',
  lineNumberLabel: (line) => `Line ${line}`,
};
