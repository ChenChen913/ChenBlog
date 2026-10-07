import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 文章页阅读进度条
 * - 仅在 /posts/:slug 路由渲染；rAF 节流的 passive 滚动监听
 * - 2.5px 渐变细条 + 微光，与站内克制的视觉语言一致
 * - 纯装饰（aria-hidden），尊重 prefers-reduced-motion
 */
export default function ReadingProgress() {
  const { pathname } = useLocation();
  const isArticle = /^\/posts\/[^/]+$/.test(pathname);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!isArticle) {
      setProgress(0);
      return;
    }

    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isArticle, pathname]);

  if (!isArticle) {
    return null;
  }

  return (
    <div
      id="reading-progress-track"
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[var(--z-progress)] h-[2.5px] pointer-events-none"
    >
      <div
        id="reading-progress-bar"
        className="reading-progress-bar h-full"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
