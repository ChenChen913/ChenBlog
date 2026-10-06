import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CodeBlock from './CodeBlock';

vi.mock('../utils/theme-detection', () => ({
  subscribeThemeDetection: vi.fn((callback: (theme: 'light' | 'dark') => void) => {
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

const clipboardWriteText = vi.fn();

describe('CodeBlock copy contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clipboardWriteText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: clipboardWriteText },
      configurable: true,
    });
    document.execCommand = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('copies the original multiline source exactly', async () => {
    const source = 'function test() {\n  return 42;\n}';

    render(<CodeBlock className="language-javascript">{source}</CodeBlock>);

    fireEvent.click(screen.getByRole('button', { name: /copy code/i }));

    await waitFor(() => {
      expect(clipboardWriteText).toHaveBeenCalledWith(source);
    });
  });

  test('shows success feedback and announces it to assistive technology', async () => {
    render(<CodeBlock className="language-python">print("hello")</CodeBlock>);

    fireEvent.click(screen.getByRole('button', { name: /copy code/i }));

    expect(await screen.findByRole('button', { name: /code copied/i })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Code copied to clipboard');
    expect(screen.getByText('Copied')).toBeInTheDocument();
  });

  test('clears success feedback after two seconds', async () => {
    render(<CodeBlock className="language-typescript">const value = 1;</CodeBlock>);

    fireEvent.click(screen.getByRole('button', { name: /copy code/i }));
    await screen.findByRole('button', { name: /code copied/i });

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /copy code/i })).toBeInTheDocument();
      },
      { timeout: 2500 }
    );
  });

  test('uses execCommand fallback when Clipboard API fails', async () => {
    clipboardWriteText.mockRejectedValueOnce(new Error('Clipboard unavailable'));
    const execCommand = vi.fn().mockReturnValue(true);
    document.execCommand = execCommand;

    render(<CodeBlock className="language-rust">fn main() {}</CodeBlock>);

    fireEvent.click(screen.getByRole('button', { name: /copy code/i }));

    await waitFor(() => {
      expect(execCommand).toHaveBeenCalledWith('copy');
    });
    expect(await screen.findByRole('button', { name: /code copied/i })).toBeInTheDocument();
  });

  test('shows retry feedback when all copy methods fail', async () => {
    clipboardWriteText.mockRejectedValueOnce(new Error('Clipboard unavailable'));
    document.execCommand = vi.fn().mockReturnValue(false);

    render(<CodeBlock className="language-go">package main</CodeBlock>);

    fireEvent.click(screen.getByRole('button', { name: /copy code/i }));

    expect(await screen.findByRole('button', { name: /copy failed/i })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Copy failed');
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });
});
