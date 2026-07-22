import { useState, useEffect, useRef } from 'react';
import { HeadingNode, flattenHeadings } from '../utils/headingParser';

export interface UseIntersectionObserverOptions {
  offset?: number;
  throttleMs?: number;
}

/**
 * 监听所有标题元素的可见性，返回当前"最靠近视口顶部"的标题 ID。
 * 使用节流机制优化性能，减少滚动事件处理频率。
 */
export function useIntersectionObserver(
  headings: HeadingNode[],
  options: UseIntersectionObserverOptions = {}
): string {
  const { offset = 140, throttleMs = 100 } = options;
  const [activeId, setActiveId] = useState<string>('');
  const prevIdRef = useRef<string>('');
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRunRef = useRef<number>(0);

  useEffect(() => {
    if (headings.length === 0) return;

    const allHeadings = flattenHeadings(headings);

    const handleScroll = () => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;

      if (timeSinceLastRun >= throttleMs) {
        // 距离上次执行已超过节流时间，立即执行
        lastRunRef.current = now;
        executeScrollCheck();
      } else if (!throttleTimerRef.current) {
        // 设置定时器，确保至少执行一次
        throttleTimerRef.current = setTimeout(() => {
          lastRunRef.current = Date.now();
          executeScrollCheck();
          throttleTimerRef.current = null;
        }, throttleMs - timeSinceLastRun);
      }
    };

    const executeScrollCheck = () => {
      let currentActiveId = '';

      for (const heading of allHeadings) {
        const el = document.getElementById(heading.id);
        if (el) {
          const { top } = el.getBoundingClientRect();
          if (top <= offset) {
            currentActiveId = heading.id;
          }
        }
      }

      // 检查是否到达页面底部
      if (
        window.innerHeight + Math.round(window.scrollY) >=
        document.documentElement.scrollHeight - 10
      ) {
        currentActiveId = allHeadings[allHeadings.length - 1].id;
      }

      // 只在值变化时 setState，避免无限循环
      if (currentActiveId !== prevIdRef.current) {
        prevIdRef.current = currentActiveId;
        setActiveId(currentActiveId);
      }
    };

    // 初始执行一次
    executeScrollCheck();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [headings, offset, throttleMs]);

  return activeId;
}
