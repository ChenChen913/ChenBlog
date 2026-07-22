import React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CodeBlock from './CodeBlock';

vi.mock('../utils/theme-detection', () => ({
  useThemeDetection: vi.fn((callback: (theme: 'light' | 'dark') => void) => {
    callback('light');
    return () => {};
  }),
}));

vi.mock('../utils/shiki-highlighter', () => ({
  getHighlightedTokens: vi.fn(async (code: string, _language: string, themeMode: 'light' | 'dark') => ({
    bg: themeMode === 'dark' ? '#09090b' : '#f8fafc',
    fg: themeMode === 'dark' ? '#e5e7eb' : '#0f172a',
    lines: (code === '' ? [''] : code.split('\n')).map(line => ({
      tokens: line === '' ? [] : [{ content: line, color: '#0f172a', fontStyle: 0 }],
    })),
    themeName: themeMode === 'dark' ? 'github-dark' : 'github-light',
  })),
}));

describe('CodeBlock rendering contract', () => {
  test('renders the code block shell, header, language label, and copy action', () => {
    const { container } = render(
      <CodeBlock className="language-typescript">
        const value: number = 1;
      </CodeBlock>
    );

    expect(container.querySelector('.code-block')).toBeInTheDocument();
    expect(container.querySelector('.code-block__header')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy code/i })).toBeInTheDocument();
  });

  test('detects language from nested ReactMarkdown code children', () => {
    render(
      <CodeBlock>
        {React.createElement('code', { className: 'language-js' }, 'const x = 1;')}
      </CodeBlock>
    );

    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });

  test('renders highlighted rows with stable line numbers', async () => {
    const { container } = render(
      <CodeBlock className="language-python">
        {'def hello():\n    print("hi")'}
      </CodeBlock>
    );

    await waitFor(() => {
      expect(container.querySelectorAll('.code-block__line-number')).toHaveLength(2);
    });

    expect(container.querySelectorAll('.code-block__line-number')[0]).toHaveTextContent('1');
    expect(container.querySelectorAll('.code-block__line-number')[1]).toHaveTextContent('2');
    expect(container).toHaveTextContent('def hello():');
    expect(container).toHaveTextContent('print("hi")');
  });

  test('keeps line numbers outside selectable and copyable code content', async () => {
    const { container } = render(
      <CodeBlock className="language-rust">
        {'fn main() {\n    println!("hi");\n}'}
      </CodeBlock>
    );

    await waitFor(() => {
      expect(container.querySelector('.code-block__line-number')).toBeInTheDocument();
    });

    const lineNumbers = container.querySelectorAll('.code-block__line-number');
    lineNumbers.forEach(lineNumber => {
      expect(lineNumber).toHaveAttribute('aria-hidden', 'true');
    });
  });

  test('renders a semantic pre/code pair for assistive technology and browser defaults', async () => {
    const { container } = render(
      <CodeBlock className="language-css">
        {'body {\n  color: red;\n}'}
      </CodeBlock>
    );

    await waitFor(() => {
      expect(container.querySelector('pre code')).toBeInTheDocument();
    });
  });

  test('handles empty children without crashing', async () => {
    const { container } = render(<CodeBlock className="language-text" />);

    await waitFor(() => {
      expect(container.querySelector('.code-block')).toBeInTheDocument();
    });
    expect(screen.getByText('Plain Text')).toBeInTheDocument();
  });

  test('falls back to plain text for unknown languages while preserving the label', async () => {
    const { container } = render(
      <CodeBlock className="language-madeup">
        value
      </CodeBlock>
    );

    expect(screen.getByText('Madeup')).toBeInTheDocument();
    await waitFor(() => {
      expect(container).toHaveTextContent('value');
    });
  });
});
