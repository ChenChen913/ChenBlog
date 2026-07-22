# Design Document: CodeBlock Enhancement

## Overview

This design document outlines the technical approach for enhancing the blog's code block component. The current implementation uses `react-syntax-highlighter` with Prism, which has limitations in theme integration and performance. The enhanced version will provide better visual design, improved functionality (line numbers, word wrap, copy), and superior accessibility.

### Current State Analysis

The existing `CodeBlock.tsx` component:
- Uses `react-syntax-highlighter` with Prism engine
- Implements basic copy functionality
- Has macOS-style window decoration
- Supports theme switching via MutationObserver
- Shows line numbers but lacks word wrap support

### Key Design Goals

1. **Migrate to Shiki**: Replace react-syntax-highlighter with Shiki for better theme integration and performance
2. **Word Wrap with Line Numbers**: Implement proper word wrap that maintains line number alignment
3. **Enhanced Accessibility**: Full keyboard navigation and screen reader support
4. **Performance**: Optimize rendering for pages with multiple code blocks
5. **Visual Polish**: Maintain macOS-style design with improved responsiveness

### Technology Stack

- **React 19** with TypeScript
- **Shiki 4.0.2**: Already in dependencies, provides VS Code-quality syntax highlighting
- **Tailwind CSS 4.1**: For styling
- **Lucide React**: For icons (Copy, Check)
- **Motion**: For smooth animations

## Architecture

### Component Structure

```
CodeBlock (Container)
├── CodeBlockHeader
│   ├── WindowControls (macOS dots)
│   ├── LanguageLabel
│   └── CopyButton
└── CodeBlockContent
    ├── LineNumbers (conditional)
    └── HighlightedCode (Shiki output)
```

### Shiki Integration Strategy

**Why Shiki over react-syntax-highlighter:**
- Shiki uses VS Code's TextMate grammars and themes
- Better theme consistency (can match VS Code themes exactly)
- Smaller bundle size when tree-shaken properly
- Already in project dependencies
- Superior TypeScript/JSX support

**Implementation Approach:**


1. **Server-side highlighting**: Use Shiki during build time via `rehype-pretty-code` (already in dependencies)
2. **Client-side fallback**: For dynamic content, use Shiki's `createHighlighter` with lazy loading
3. **Theme synchronization**: Use Shiki's dual-theme feature to embed both light/dark in HTML

**Research: Shiki Best Practices**

Based on Shiki documentation and the project's existing setup:
- `rehype-pretty-code` is already installed (v0.14.3), which is a rehype plugin that uses Shiki
- This plugin can be integrated into the ReactMarkdown rendering pipeline
- It supports inline theme switching without re-rendering
- Provides better performance than client-side highlighting

### Theme Management

**Current Implementation:**
- Uses MutationObserver to watch `document.documentElement.classList` for 'dark' class
- Switches between `vscDarkPlus` and `vs` themes

**Enhanced Implementation:**
- Use Shiki's dual-theme feature: `theme: { light: 'github-light', dark: 'github-dark' }`
- CSS variables for theme-aware colors
- Smooth transitions using Tailwind's transition utilities

### Word Wrap Architecture

**Challenge:** Line numbers must stay aligned with logical lines when physical lines wrap.

**Solution:**
```
<div class="code-line-wrapper">
  <span class="line-number">1</span>
  <span class="code-content">
    <!-- Long code that wraps -->
  </span>
</div>
```

**CSS Strategy:**
- Use CSS Grid: `grid-template-columns: auto 1fr`
- Line number: `align-self: start` to stick to top
- Code content: `white-space: pre-wrap` for wrapping
- Preserve indentation with `text-indent: hanging` or padding

## Components and Interfaces

### CodeBlock Component

**Props Interface:**
```typescript
interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;        // e.g., "language-typescript"
  node?: any;               // ReactMarkdown node
  showLineNumbers?: boolean; // Default: true
  enableWordWrap?: boolean;  // Default: true
  maxHeight?: string;        // Optional max height with scroll
  [key: string]: any;       // Additional props
}
```

**State Management:**
```typescript
interface CodeBlockState {
  copied: boolean;           // Copy button state
  isDark: boolean;          // Current theme
  highlightedCode: string;  // Shiki HTML output
  isLoading: boolean;       // For async highlighting
}
```

### CodeBlockHeader Component

**Props Interface:**
```typescript
interface CodeBlockHeaderProps {
  language: string;
  onCopy: () => void;
  copied: boolean;
  isDark: boolean;
}
```

**Responsibilities:**
- Render macOS window controls (three colored dots)
- Display language label
- Render copy button with state feedback
- Handle copy button interactions

### CodeBlockContent Component

**Props Interface:**
```typescript
interface CodeBlockContentProps {
  code: string;
  language: string;
  isDark: boolean;
  showLineNumbers: boolean;
  enableWordWrap: boolean;
  highlightedHTML: string;  // Pre-rendered Shiki HTML
}
```

**Responsibilities:**
- Render line numbers (if enabled)
- Render syntax-highlighted code
- Handle word wrap layout
- Manage scroll behavior

### Utility Functions

**extractCodeText(children: React.ReactNode): string**
- Extracts plain text from ReactMarkdown children
- Handles strings, arrays, and ReactElements
- Removes trailing newlines

**getLanguageFromClassName(className?: string): string**
- Parses "language-*" className
- Maps aliases (js → javascript, py → python)
- Returns normalized language identifier

**highlightCode(code: string, language: string, theme: 'light' | 'dark'): Promise<string>**
- Uses Shiki to generate highlighted HTML
- Caches results for performance
- Handles unsupported languages gracefully

## Data Models

### Code Highlighting Cache

**Purpose:** Avoid re-highlighting the same code blocks

**Structure:**
```typescript
interface HighlightCache {
  [key: string]: {
    light: string;  // HTML for light theme
    dark: string;   // HTML for dark theme
    timestamp: number;
  };
}

// Cache key generation
function getCacheKey(code: string, language: string): string {
  return `${language}:${hashCode(code)}`;
}
```

**Implementation:**
- Use Map for O(1) lookups
- Implement LRU eviction if cache grows too large
- Store in memory (not localStorage due to size)

### Theme Configuration

**Structure:**
```typescript
interface ThemeConfig {
  light: {
    shikiTheme: string;      // e.g., 'github-light'
    backgroundColor: string;
    textColor: string;
    lineNumberColor: string;
    borderColor: string;
  };
  dark: {
    shikiTheme: string;      // e.g., 'github-dark'
    backgroundColor: string;
    textColor: string;
    lineNumberColor: string;
    borderColor: string;
  };
}

const defaultThemeConfig: ThemeConfig = {
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
```

### Accessibility Metadata

**Structure:**
```typescript
interface A11yMetadata {
  copyButtonLabel: string;
  copiedLabel: string;
  codeBlockLabel: string;
  lineNumberLabel: (line: number) => string;
}

const defaultA11yMetadata: A11yMetadata = {
  copyButtonLabel: 'Copy code to clipboard',
  copiedLabel: 'Code copied to clipboard',
  codeBlockLabel: 'Code block',
  lineNumberLabel: (line) => `Line ${line}`,
};
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated:
- Line number styling properties (1.4, 1.5) can be combined into a single comprehensive property
- Theme switching properties (6.1, 6.2) are inverse operations and can be combined
- Contrast properties (1.5, 4.5, 6.3, 8.5) all test WCAG compliance and can be unified
- Copy feedback properties (3.3, 3.4) test different outcomes of the same operation

### Property 1: Line Number Display Completeness

*For any* code block with N lines, the rendered output SHALL display exactly N line numbers in sequential order from 1 to N.

**Validates: Requirements 1.1**

### Property 2: Line Number Alignment on Wrap

*For any* code line that wraps to multiple physical lines, the line number SHALL be positioned at the top of the first physical line and SHALL NOT appear on subsequent wrapped lines.

**Validates: Requirements 1.2, 2.3**

### Property 3: Line Number Selection Exclusion

*For any* text selection within a code block, the copied text SHALL contain only the code content and SHALL NOT include line numbers.

**Validates: Requirements 1.3**

### Property 4: Line Number Styling Consistency

*For any* rendered code block, line numbers SHALL be right-aligned with appropriate spacing from code content, and SHALL use colors with lower contrast than code text to minimize visual interference.

**Validates: Requirements 1.4, 1.5**

### Property 5: Word Wrap Activation

*For any* code line with width exceeding the container width, the code block SHALL wrap the line without horizontal overflow.

**Validates: Requirements 2.1**

### Property 6: Indentation Preservation on Wrap

*For any* code with leading whitespace indentation, wrapped lines SHALL maintain visual indentation structure.

**Validates: Requirements 2.2**

### Property 7: Continuation Line Alignment

*For any* wrapped code line, subsequent physical lines SHALL maintain consistent left alignment relative to the first physical line.

**Validates: Requirements 2.4**

### Property 8: Copy Preserves Original Format

*For any* code block with word-wrapped display, copying the code SHALL produce text identical to the original source without artificial line breaks from wrapping.

**Validates: Requirements 2.5**

### Property 9: Copy Button Presence

*For any* rendered code block, a copy button SHALL be present in the header section.

**Validates: Requirements 3.1**

### Property 10: Copy Functionality Correctness

*For any* code block, clicking the copy button SHALL place the complete, unmodified code content into the system clipboard.

**Validates: Requirements 3.2**

### Property 11: Copy Feedback Timing

*For any* successful copy operation, visual feedback SHALL appear immediately and SHALL disappear after exactly 2 seconds.

**Validates: Requirements 3.3**

### Property 12: Copy Error Handling

*For any* copy operation that fails (e.g., clipboard API unavailable), an error message SHALL be displayed to the user.

**Validates: Requirements 3.4**

### Property 13: Copy Button Hover Feedback

*For any* copy button, hovering with a pointer device SHALL trigger visible style changes indicating interactivity.

**Validates: Requirements 3.5**

### Property 14: Language-Specific Syntax Highlighting

*For any* code block with a specified programming language, syntax highlighting SHALL be applied according to that language's grammar rules.

**Validates: Requirements 4.1**

### Property 15: Plain Text Fallback

*For any* code block without a specified language, the code SHALL be rendered as plain text without syntax highlighting.

**Validates: Requirements 4.3**

### Property 16: Theme-Synchronized Syntax Colors

*For any* theme change (light ↔ dark), syntax highlighting colors SHALL update to match the new theme's color scheme.

**Validates: Requirements 4.4, 6.1, 6.2**

### Property 17: Visual Styling Presence

*For any* rendered code block, the element SHALL have border-radius and box-shadow CSS properties applied.

**Validates: Requirements 5.1**

### Property 18: Header Structure Completeness

*For any* rendered code block, the header SHALL contain three colored circular elements (macOS window controls) and a language label.

**Validates: Requirements 5.2**

### Property 19: Monospace Font Application

*For any* code content, the computed font-family SHALL include monospace fonts.

**Validates: Requirements 5.3**

### Property 20: Background Color Differentiation

*For any* code block, the background color SHALL differ from the page background color to provide visual distinction.

**Validates: Requirements 5.5**

### Property 21: Responsive Layout Integrity

*For any* viewport width (from 320px to 2560px), the code block layout SHALL remain functional without horizontal overflow or broken layout.

**Validates: Requirements 5.6**

### Property 22: Theme Transition Smoothness

*For any* theme switch operation, the color transition SHALL be animated smoothly without visual flashing or abrupt changes.

**Validates: Requirements 6.4**

### Property 23: WCAG Contrast Compliance

*For any* theme (light or dark), all text elements (code text, line numbers, button text) SHALL have contrast ratios meeting WCAG AA standards (≥4.5:1 for normal text, ≥3:1 for large text) against their backgrounds.

**Validates: Requirements 1.5, 4.5, 6.3, 6.5, 8.5**

### Property 24: Lazy Rendering for Off-Screen Blocks

*For any* code block positioned below the initial viewport, syntax highlighting SHALL be deferred until the block is scrolled into view.

**Validates: Requirements 7.3**

### Property 25: Highlight Caching Efficiency

*For any* identical code block rendered multiple times, the syntax highlighting computation SHALL occur only once, with subsequent renders using cached results.

**Validates: Requirements 7.4**

### Property 26: ARIA Label Presence

*For any* copy button, an aria-label attribute SHALL be present with descriptive text indicating the button's function.

**Validates: Requirements 8.1**

### Property 27: Semantic HTML Structure

*For any* code block, the HTML structure SHALL use semantic elements including `<pre>` and `<code>` tags.

**Validates: Requirements 8.2**

### Property 28: Keyboard Accessibility

*For any* code block, the copy button SHALL be focusable via keyboard Tab navigation and activatable via Enter or Space keys.

**Validates: Requirements 8.3**

### Property 29: Screen Reader Announcement

*For any* completed copy operation, an ARIA live region SHALL be updated to announce the success to screen readers.

**Validates: Requirements 8.4**



## Error Handling

### Clipboard API Failures

**Scenario:** `navigator.clipboard.writeText()` fails or is unavailable

**Handling Strategy:**
1. Wrap clipboard operations in try-catch blocks
2. Fallback to legacy `document.execCommand('copy')` method
3. If both fail, display user-friendly error message
4. Log error details to console for debugging

**Implementation:**
```typescript
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.warn('Clipboard API failed, trying fallback', err);
    try {
      // Fallback method
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (fallbackErr) {
      console.error('All copy methods failed', fallbackErr);
      return false;
    }
  }
}
```

### Shiki Highlighting Failures

**Scenario:** Shiki fails to load or highlight code (unsupported language, network error)

**Handling Strategy:**
1. Catch highlighting errors and log them
2. Fallback to plain text rendering with monospace font
3. Display language label even if highlighting fails
4. Maintain all other functionality (copy, line numbers)

**Implementation:**
```typescript
async function highlightCode(code: string, lang: string): Promise<string> {
  try {
    const highlighter = await getHighlighter();
    return highlighter.codeToHtml(code, { lang, theme: 'github-dark' });
  } catch (err) {
    console.error(`Failed to highlight ${lang} code:`, err);
    // Fallback: return escaped plain text
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
  }
}
```

### Theme Detection Failures

**Scenario:** MutationObserver fails or theme class is not found

**Handling Strategy:**
1. Default to light theme if detection fails
2. Provide manual theme override prop
3. Use `prefers-color-scheme` media query as fallback
4. Log warning but don't break rendering

**Implementation:**
```typescript
function detectTheme(): 'light' | 'dark' {
  try {
    if (document.documentElement.classList.contains('dark')) {
      return 'dark';
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch (err) {
    console.warn('Theme detection failed, defaulting to light', err);
    return 'light';
  }
}
```

### Invalid Code Content

**Scenario:** Children prop contains unexpected data types or null

**Handling Strategy:**
1. Use defensive type checking in `extractCodeText()`
2. Return empty string for null/undefined
3. Convert non-string types to strings safely
4. Display empty code block rather than crashing

### Performance Degradation

**Scenario:** Page contains 50+ large code blocks causing slow rendering

**Handling Strategy:**
1. Implement intersection observer for lazy loading
2. Set maximum cache size with LRU eviction
3. Use `requestIdleCallback` for non-critical highlighting
4. Provide loading skeleton for delayed blocks

**Implementation:**
```typescript
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !highlighted) {
          highlightCode(code, language).then(setHighlightedHTML);
        }
      });
    },
    { rootMargin: '100px' } // Start loading 100px before visible
  );
  
  if (codeRef.current) {
    observer.observe(codeRef.current);
  }
  
  return () => observer.disconnect();
}, [code, language]);
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and integration points
- **Property tests**: Verify universal properties across all inputs

### Property-Based Testing

**Library:** `fast-check` (JavaScript/TypeScript property-based testing library)

**Configuration:**
- Minimum 100 iterations per property test
- Each test references its design document property
- Tag format: `Feature: codeblock-enhancement, Property {number}: {property_text}`

**Property Test Examples:**

**Property 1: Line Number Display Completeness**
```typescript
import fc from 'fast-check';

test('Property 1: Line Number Display Completeness', () => {
  fc.assert(
    fc.property(
      fc.array(fc.string(), { minLength: 1, maxLength: 100 }), // Generate 1-100 lines
      (lines) => {
        const code = lines.join('\n');
        const { container } = render(<CodeBlock>{code}</CodeBlock>);
        const lineNumbers = container.querySelectorAll('.line-number');
        expect(lineNumbers.length).toBe(lines.length);
        lineNumbers.forEach((el, idx) => {
          expect(el.textContent).toBe(String(idx + 1));
        });
      }
    ),
    { numRuns: 100 }
  );
});
// Feature: codeblock-enhancement, Property 1: For any code block with N lines, the rendered output SHALL display exactly N line numbers in sequential order from 1 to N
```

**Property 8: Copy Preserves Original Format**
```typescript
test('Property 8: Copy Preserves Original Format', async () => {
  fc.assert(
    fc.property(
      fc.array(fc.string({ minLength: 50, maxLength: 200 }), { minLength: 5 }), // Long lines
      async (lines) => {
        const originalCode = lines.join('\n');
        const { container } = render(
          <CodeBlock enableWordWrap={true}>{originalCode}</CodeBlock>
        );
        
        const copyButton = container.querySelector('[aria-label*="Copy"]');
        fireEvent.click(copyButton);
        
        const copiedText = await navigator.clipboard.readText();
        expect(copiedText).toBe(originalCode);
      }
    ),
    { numRuns: 100 }
  );
});
// Feature: codeblock-enhancement, Property 8: For any code block with word-wrapped display, copying the code SHALL produce text identical to the original source
```

**Property 23: WCAG Contrast Compliance**
```typescript
test('Property 23: WCAG Contrast Compliance', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('light', 'dark'),
      fc.constantFrom('javascript', 'python', 'rust', 'html'),
      (theme, language) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        const code = 'const x = 42;';
        const { container } = render(
          <CodeBlock className={`language-${language}`}>{code}</CodeBlock>
        );
        
        // Measure contrast ratios
        const codeElement = container.querySelector('code');
        const lineNumber = container.querySelector('.line-number');
        const button = container.querySelector('button');
        
        const codeContrast = getContrastRatio(codeElement);
        const lineNumContrast = getContrastRatio(lineNumber);
        const buttonContrast = getContrastRatio(button);
        
        expect(codeContrast).toBeGreaterThanOrEqual(4.5); // WCAG AA
        expect(lineNumContrast).toBeGreaterThanOrEqual(4.5);
        expect(buttonContrast).toBeGreaterThanOrEqual(4.5);
      }
    ),
    { numRuns: 100 }
  );
});
// Feature: codeblock-enhancement, Property 23: For any theme, all text elements SHALL have contrast ratios meeting WCAG AA standards
```

### Unit Testing

**Framework:** Vitest + React Testing Library

**Coverage Areas:**

1. **Component Rendering**
   - CodeBlock renders with default props
   - CodeBlock renders with custom props
   - Header displays correct language label
   - macOS window controls are present

2. **Copy Functionality**
   - Copy button copies code to clipboard
   - Copy button shows success feedback
   - Copy button shows error on failure
   - Fallback copy method works when clipboard API unavailable

3. **Theme Integration**
   - Component detects initial theme correctly
   - Component updates when theme changes
   - Theme transitions are smooth (no flashing)

4. **Accessibility**
   - Copy button has aria-label
   - Copy button is keyboard accessible
   - ARIA live region announces copy success
   - Semantic HTML structure is used

5. **Edge Cases**
   - Empty code block renders without errors
   - Very long single line wraps correctly
   - Code with special characters renders correctly
   - Unsupported language falls back to plain text

**Example Unit Tests:**

```typescript
describe('CodeBlock Component', () => {
  test('renders with macOS window controls', () => {
    const { container } = render(<CodeBlock>const x = 1;</CodeBlock>);
    const dots = container.querySelectorAll('.w-2\\.5.h-2\\.5.rounded-full');
    expect(dots).toHaveLength(3);
  });

  test('copy button has proper ARIA label', () => {
    const { getByLabelText } = render(<CodeBlock>code</CodeBlock>);
    expect(getByLabelText(/copy/i)).toBeInTheDocument();
  });

  test('handles empty code gracefully', () => {
    const { container } = render(<CodeBlock></CodeBlock>);
    expect(container.querySelector('code')).toBeInTheDocument();
  });

  test('displays error when copy fails', async () => {
    // Mock clipboard to fail
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.reject(new Error('Failed'))),
      },
    });

    const { getByRole, findByText } = render(<CodeBlock>code</CodeBlock>);
    const copyButton = getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);

    expect(await findByText(/error/i)).toBeInTheDocument();
  });
});
```

### Integration Testing

**Framework:** Playwright

**Test Scenarios:**

1. **Multi-Block Performance**
   - Load article with 20+ code blocks
   - Measure total render time
   - Verify lazy loading works (blocks below fold not highlighted initially)
   - Verify smooth scrolling performance

2. **Theme Switching**
   - Toggle theme multiple times
   - Verify all code blocks update
   - Verify no visual flashing
   - Verify transitions are smooth

3. **Mobile Responsiveness**
   - Test on mobile viewport (375px width)
   - Verify word wrap works correctly
   - Verify copy button is accessible
   - Verify no horizontal overflow

4. **Cross-Browser Compatibility**
   - Test in Chrome, Firefox, Safari
   - Verify clipboard API works
   - Verify syntax highlighting renders correctly
   - Verify theme detection works

**Example Integration Test:**

```typescript
test('code blocks lazy load below viewport', async ({ page }) => {
  await page.goto('/article-with-many-code-blocks');
  
  // Check first block is highlighted
  const firstBlock = page.locator('pre').first();
  await expect(firstBlock).toHaveClass(/highlighted/);
  
  // Check last block is not highlighted yet
  const lastBlock = page.locator('pre').last();
  await expect(lastBlock).not.toHaveClass(/highlighted/);
  
  // Scroll to last block
  await lastBlock.scrollIntoViewIfNeeded();
  await page.waitForTimeout(100); // Wait for intersection observer
  
  // Now it should be highlighted
  await expect(lastBlock).toHaveClass(/highlighted/);
});
```

### Visual Regression Testing

**Tool:** Playwright with screenshot comparison

**Test Cases:**
- Code block in light theme
- Code block in dark theme
- Code block with line numbers
- Code block with word wrap
- Code block with long lines
- Copy button hover state
- Copy button success state

### Accessibility Testing

**Tools:**
- axe-core (automated accessibility testing)
- Manual keyboard navigation testing
- Screen reader testing (NVDA, VoiceOver)

**Test Checklist:**
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] ARIA labels present and descriptive
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader announces copy success
- [ ] Semantic HTML structure

### Performance Testing

**Metrics to Track:**
- Time to first render (single code block)
- Time to render page with 20 code blocks
- Memory usage with 50+ code blocks
- Cache hit rate for repeated code blocks
- Lazy loading effectiveness (blocks not in viewport)

**Performance Budgets:**
- Single block render: < 50ms
- 20 blocks page load: < 500ms
- Memory per block: < 100KB
- Cache hit rate: > 80% for repeated blocks

### Test Coverage Goals

- **Line coverage**: > 90%
- **Branch coverage**: > 85%
- **Property tests**: All 29 properties implemented
- **Unit tests**: > 50 test cases
- **Integration tests**: > 10 scenarios
- **Accessibility**: 100% axe-core compliance

