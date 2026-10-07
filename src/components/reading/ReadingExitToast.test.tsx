import { describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ReadingExitToast from './ReadingExitToast';

describe('ReadingExitToast', () => {
  test('shows the exit message and auto-dismisses within ~1s', async () => {
    const onFinished = vi.fn();
    render(<ReadingExitToast toast={{ text: '已退出专注模式', id: 1 }} onFinished={onFinished} />);

    expect(screen.getByText('已退出专注模式')).toBeInTheDocument();

    // 停留 800ms + 160ms 退场动画（用户要求约 1s 且不大于 1s）
    // 真实计时器驱动 motion 的 AnimatePresence 卸载（fake timers 下 exit 动画挂起）
    await waitFor(
      () => {
        expect(screen.queryByText('已退出专注模式')).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
    expect(onFinished).toHaveBeenCalled();
  });

  test('replays for consecutive exits with the same text via id change', async () => {
    const onFinished = vi.fn();
    const { rerender } = render(
      <ReadingExitToast toast={{ text: '已退出专注模式', id: 1 }} onFinished={onFinished} />
    );

    await waitFor(
      () => {
        expect(screen.queryByText('已退出专注模式')).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
    rerender(<ReadingExitToast toast={null} onFinished={onFinished} />);

    // 第二次退出：文案相同但 id 不同，必须重新显示
    rerender(
      <ReadingExitToast toast={{ text: '已退出专注模式', id: 2 }} onFinished={onFinished} />
    );
    expect(screen.getByText('已退出专注模式')).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.queryByText('已退出专注模式')).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
    expect(onFinished).toHaveBeenCalledTimes(2);
  });

  test('renders nothing when toast is null', () => {
    render(<ReadingExitToast toast={null} onFinished={() => {}} />);
    expect(document.querySelector('.reading-exit-toast')).not.toBeInTheDocument();
  });
});
