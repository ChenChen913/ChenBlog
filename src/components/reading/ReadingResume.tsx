import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History } from 'lucide-react';

interface ReadingResumeProps {
  slug: string;
  ready: boolean;
  label: string;
  buttonLabel: string;
}

const POS_KEY_PREFIX = 'reading-pos:';
const SHOW_THRESHOLD = 0.08;
const HIDE_THRESHOLD = 0.92;

function readPos(slug: string): number | null {
  try {
    const raw = localStorage.getItem(POS_KEY_PREFIX + slug);
    const value = raw === null ? NaN : Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

function writePos(slug: string, value: number | null) {
  try {
    if (value === null) {
      localStorage.removeItem(POS_KEY_PREFIX + slug);
    } else {
      localStorage.setItem(POS_KEY_PREFIX + slug, String(value));
    }
  } catch {
    // 存储受限时静默跳过
  }
}

/** 文章域滚动进度（0-1），与工具胶囊的剩余时长同一几何口径 */
function articleProgress(): number {
  const el = document.getElementById('post-content');
  if (!el) {
    return 0;
  }
  const rect = el.getBoundingClientRect();
  const top = rect.top + window.scrollY;
  const start = top - 100;
  const end = top + rect.height - window.innerHeight;
  const denom = Math.max(1, end - start);
  return Math.min(1, Math.max(0, (window.scrollY - start) / denom));
}

function scrollToProgress(p: number) {
  const el = document.getElementById('post-content');
  if (!el) {
    return;
  }
  const rect = el.getBoundingClientRect();
  const top = rect.top + window.scrollY;
  const start = top - 100;
  const end = top + rect.height - window.innerHeight;
  window.scrollTo({ top: start + (end - start) * p, behavior: 'smooth' });
}

/**
 * 阅读位置记忆：降低"重新启动"的心理成本。
 * 离开时把文章域进度存进 localStorage；回来时若进度在 8%–92% 区间，
 * 温和地飘一条"继续上次阅读 · N%"——不自动跳转（避免惊吓），点了才走。
 * 浏览器自行恢复滚动位置（±5% 内）时不再打扰。
 */
export default function ReadingResume({ slug, ready, label, buttonLabel }: ReadingResumeProps) {
  const [pending, setPending] = useState<number | null>(null);
  const hideTimerRef = useRef<number>(0);
  const saveTimerRef = useRef<number>(0);
  const skipSaveRef = useRef(false);

  // 到达文章时：检查是否有值得恢复的位置
  useEffect(() => {
    if (!ready) {
      return;
    }
    setPending(null);
    const stored = readPos(slug);
    if (stored === null || stored < SHOW_THRESHOLD || stored > HIDE_THRESHOLD) {
      return;
    }

    // 等浏览器滚动恢复稳定后再判断，避免"已恢复却还提示"的打扰
    const timer = window.setTimeout(() => {
      const current = articleProgress();
      if (Math.abs(current - stored) > 0.05) {
        setPending(stored);
        hideTimerRef.current = window.setTimeout(() => setPending(null), 8000);
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [slug, ready]);

  // 滚动时节流保存进度（点击"继续"跳转过程中短暂跳过，避免存入中途值）
  useEffect(() => {
    if (!ready) {
      return;
    }
    const onScroll = () => {
      // 用户开始手动滚动 = 放弃"继续上次阅读"，立即收起 toast
      // （也避免与右下角的返回顶部按钮同屏挤在一起）
      if (pending !== null) {
        setPending(null);
        window.clearTimeout(hideTimerRef.current);
      }
      if (skipSaveRef.current) {
        return;
      }
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = window.setTimeout(() => {
        const p = articleProgress();
        if (p >= SHOW_THRESHOLD && p <= HIDE_THRESHOLD) {
          writePos(slug, p);
        } else if (p > HIDE_THRESHOLD) {
          // 读完了：清掉记录，下次从头开始
          writePos(slug, null);
        }
      }, 1500);
    };
    const onPageHide = () => {
      window.clearTimeout(saveTimerRef.current);
      const p = articleProgress();
      if (p >= SHOW_THRESHOLD && p <= HIDE_THRESHOLD) {
        writePos(slug, p);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.clearTimeout(saveTimerRef.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', onPageHide);
    };
    // pending 入依赖：toast 收起依赖最新状态而非过期闭包
  }, [slug, ready, pending]);

  useEffect(() => () => window.clearTimeout(hideTimerRef.current), []);

  const resume = () => {
    if (pending === null) {
      return;
    }
    skipSaveRef.current = true;
    scrollToProgress(pending);
    setPending(null);
    window.setTimeout(() => {
      skipSaveRef.current = false;
    }, 1200);
  };

  return (
    <div className="reading-resume">
      <AnimatePresence>
        {pending !== null && (
          <motion.button
            type="button"
            className="reading-resume-toast"
            onClick={resume}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <History size={15} />
            <span>
              {label} · {Math.round(pending * 100)}%
            </span>
            <span className="reading-resume-go">{buttonLabel}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
