import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ReadingReminderProps {
  active: boolean;
  slug: string;
  message: (minutes: number) => string;
}

const INTERVAL_MINUTES = 15;

/**
 * 节奏提醒：默认关闭的独立开关（用户已拍板）。
 * 每 15 分钟温和地飘一条玻璃提示——对策"时间盲"与"超专注"，
 * 语气克制、8 秒自动消失，提醒本身不能变成新的打扰。
 * 仅统计前台可见时间（document.hidden 时暂停累计），换文章自动清零。
 */
export default function ReadingReminder({ active, slug, message }: ReadingReminderProps) {
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const toastTimerRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      setToast(null);
      return;
    }

    let readSeconds = 0;
    let nextThreshold = INTERVAL_MINUTES * 60;
    let toastId = 0;

    const tick = window.setInterval(() => {
      if (document.hidden) {
        return;
      }
      readSeconds += 1;
      if (readSeconds >= nextThreshold) {
        nextThreshold += INTERVAL_MINUTES * 60;
        const minutes = Math.round(readSeconds / 60);
        toastId += 1;
        setToast({ id: toastId, text: message(minutes) });
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = window.setTimeout(() => setToast(null), 8000);
      }
    }, 1000);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(toastTimerRef.current);
    };
  }, [active, slug, message]);

  return (
    <div className="reading-reminder" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className="reading-reminder-toast"
            role="status"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
