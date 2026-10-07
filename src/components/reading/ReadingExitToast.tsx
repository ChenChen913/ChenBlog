import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Undo2 } from 'lucide-react';

export interface ReadingExitToastData {
  text: string;
  id: number;
}

interface ReadingExitToastProps {
  toast: ReadingExitToastData | null;
  onFinished: () => void;
}

/** toast 停留时长：用户要求约 1 秒且不大于 1 秒。800ms 停留 + 160ms 退场 ≈ 1s 总感知（实测 963ms） */
const TOAST_DURATION_MS = 800;

/**
 * 退出专注/引导模式时的轻提示（"已退出专注模式"）。
 * 液态玻璃胶囊与 reading-resume-toast 同语言；fixed 底部居中 portal 到 body
 * （退出瞬间工具胶囊卸载，它的老位置正好空出来，视觉衔接自然）。
 * 单行约束：white-space nowrap + 视口宽度兜底，手机上不折行。
 */
export default function ReadingExitToast({ toast, onFinished }: ReadingExitToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) {
      return;
    }
    setVisible(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      onFinished();
    }, TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
    // onFinished 由父组件 useCallback 固定，不参与重触发
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {toast && visible && (
        <motion.div
          key={toast.id}
          className="reading-exit-toast"
          role="status"
          aria-live="polite"
          /* x:'-50%' 由 motion 接管居中：CSS transform 会被动画的 y/scale 覆盖
             （同 reading-toc-panel 的 transform 劫持教训，left:50% 配对位移必须在 motion 里给） */
          initial={{ opacity: 0, y: 10, x: '-50%', scale: 0.96 }}
          animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
          exit={{ opacity: 0, y: 6, x: '-50%', scale: 0.97 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
        >
          <Undo2 size={14} strokeWidth={2.2} />
          <span className="reading-exit-toast__text">{toast.text}</span>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
