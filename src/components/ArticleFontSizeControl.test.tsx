import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ArticleFontSizeControl from './ArticleFontSizeControl';

describe('ArticleFontSizeControl', () => {
  test('renders exactly three Chinese font size options', () => {
    render(<ArticleFontSizeControl mode="standard" language="zh" onChange={() => {}} />);

    expect(screen.getByText('字体大小')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '小' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '标准' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '大' })).toBeInTheDocument();
  });

  test('marks the current option as pressed', () => {
    render(<ArticleFontSizeControl mode="large" language="zh" onChange={() => {}} />);

    expect(screen.getByRole('button', { name: '大' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '标准' })).toHaveAttribute('aria-pressed', 'false');
  });

  test('calls onChange with the selected mode', () => {
    const onChange = vi.fn();

    // 英文按钮带手机端紧凑标签（Large + A+ 双 span），用正则匹配可访问名
    render(<ArticleFontSizeControl mode="standard" language="en" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /Large/ }));

    expect(onChange).toHaveBeenCalledWith('large');
  });
});
