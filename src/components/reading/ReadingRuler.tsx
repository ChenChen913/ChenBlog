import { useEffect, useRef } from 'react';

interface ReadingRulerProps {
  active: boolean;
}

/**
 * 引导模式的"行标尺"：一条柔和的高亮带，帮助视线锁定当前行。
 * - 桌面（pointer: fine）：跟随鼠标纵坐标，rAF 线性插值平滑追踪
 * - 触屏/无鼠标：固定在视口 30% 高度处，内容滚动经过标尺
 * - prefers-reduced-motion：关闭插值动画，瞬时定位
 * - 宽度与正文列对齐（含少量出血），通过 ResizeObserver 跟随布局变化
 * - 纯装饰层（pointer-events: none + aria-hidden），不参与交互
 */
export default function ReadingRuler({ active }: ReadingRulerProps) {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) {
      return;
    }
    const el = elRef.current;
    const article = document.getElementById('post-content');
    if (!el || !article) {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    let targetY = window.innerHeight * 0.3;
    let currentY = targetY;
    let raf = 0;

    // 几何：与正文列对齐（左右各出血 10px），高度取正文行高
    // （#post-content 自身即 .article-body，行高变量在它上面生效）
    const syncGeometry = () => {
      const rect = article.getBoundingClientRect();
      el.style.left = `${Math.max(8, rect.left - 10)}px`;
      el.style.width = `${Math.min(window.innerWidth - 16, rect.width + 20)}px`;
      const lineHeight = parseFloat(getComputedStyle(article).lineHeight);
      el.style.height = `${Number.isFinite(lineHeight) && lineHeight > 0 ? lineHeight : 36}px`;
    };

    const loop = () => {
      if (!reducedMotion && finePointer) {
        currentY += (targetY - currentY) * 0.22;
        if (Math.abs(targetY - currentY) < 0.5) {
          currentY = targetY;
        }
      } else {
        currentY = targetY;
      }
      el.style.top = `${currentY}px`;
      raf = requestAnimationFrame(loop);
    };

    const onMouseMove = (e: MouseEvent) => {
      targetY = e.clientY;
    };
    const onTouchMove = () => {
      // 触屏设备误派发 mousemove 的场景：回到锚定高度
      targetY = window.innerHeight * 0.3;
    };

    syncGeometry();
    const resizeObserver = new ResizeObserver(syncGeometry);
    resizeObserver.observe(article);
    resizeObserver.observe(document.documentElement);

    if (finePointer) {
      window.addEventListener('mousemove', onMouseMove, { passive: true });
      window.addEventListener('touchstart', onTouchMove, { passive: true });
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchstart', onTouchMove);
    };
  }, [active]);

  if (!active) {
    return null;
  }

  return <div ref={elRef} className="reading-ruler" aria-hidden />;
}
