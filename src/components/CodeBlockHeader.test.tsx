import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CodeBlock from './CodeBlock';

vi.mock('../utils/theme-detection', () => ({
  useThemeDetection: vi.fn((callback: (theme: 'light' | 'dark') => void) => {
    callback('light');
    return () => {};
  }),
}));

vi.mock('../utils/shiki-highlighter', () => ({
  getHighlightedTokens: vi.fn(async (code: string) => ({
    bg: '#f8fafc',
    fg: '#0f172a',
    lines: (code === '' ? [''] : code.split('\n')).map(line => ({
      tokens: line === '' ? [] : [{ content: line, color: '#0f172a', fontStyle: 0 }],
    })),
    themeName: 'github-light',
  })),
}));

describe('CodeBlock header contract', () => {
  test('renders three macOS-style window dots with stable classes', () => {
    const { container } = render(
      <CodeBlock className="language-javascript">
        const x = 1;
      </CodeBlock>
    );

    expect(container.querySelectorAll('.code-block__window-dot')).toHaveLength(3);
    expect(container.querySelector('.code-block__window-dot--red')).toBeInTheDocument();
    expect(container.querySelector('.code-block__window-dot--yellow')).toBeInTheDocument();
    expect(container.querySelector('.code-block__window-dot--green')).toBeInTheDocument();
  });

  test('renders a human-friendly language label', () => {
    render(
      <CodeBlock className="language-ts">
        const value: string = "hello";
      </CodeBlock>
    );

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  test('renders a compact copy button with icon and accessible name', () => {
    const { container } = render(
      <CodeBlock className="language-go">
        package main
      </CodeBlock>
    );

    const button = screen.getByRole('button', { name: /copy code/i });
    expect(button).toHaveClass('code-block__copy-button');
    expect(button.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('.code-block__header-left')).toBeInTheDocument();
  });

  test('uses BEM classes as the stable styling contract', () => {
    const { container } = render(
      <CodeBlock className="language-html">
        {'<main>Hello</main>'}
      </CodeBlock>
    );

    expect(container.querySelector('.code-block')).toBeInTheDocument();
    expect(container.querySelector('.code-block__header')).toBeInTheDocument();
    expect(container.querySelector('.code-block__language')).toHaveTextContent('HTML');
  });
});
