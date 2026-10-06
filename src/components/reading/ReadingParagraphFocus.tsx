import { useEffect } from 'react';

interface ReadingParagraphFocusProps {
  active: boolean;
  /** DOM 重建信号：正文加载/公式插件就绪/Bionic 开关切换都会改变它 */
  contentKey: string;
}

/**
 * 引导模式的"段落聚焦"：阅读带（视口中段 40%）内的段落保持全不透明，
 * 上下段落降至 38%，滚动时平滑过渡。
 *
 * 实现要点（踩坑后定稿）：
 * - 不用 IntersectionObserver 一次性 observe——react-markdown 的异步渲染管线
 *   会在 effect 之后整体重建段落 DOM，挂到旧节点上的观察器永远等不到回调
 *   （实测 data-rpf-seen 标记节点全部脱离文档）。改为滚动时实时查询 +
 *   getBoundingClientRect 几何判定，与站内 useIntersectionObserver 同款思路
 * - MutationObserver 监听正文 childList 重建，DOM 换血后下一帧自动重算
 * - 候选集只取正文顶层块与顶层列表项：嵌套列表随父级 li 整体变暗，
 *   避免 opacity 叠乘（0.38 × 0.38）把嵌套内容压成幽灵
 * - 代码块/公式/表格/图片不在候选集内，永不参与变暗（与设计承诺一致）
 */
export default function ReadingParagraphFocus({ active, contentKey }: ReadingParagraphFocusProps) {
  useEffect(() => {
    if (!active) {
      return;
    }

    let raf = 0;

    const update = () => {
      const article = document.getElementById('post-content');
      if (!article) {
        return;
      }
      const candidates = article.querySelectorAll<HTMLElement>(
        ':scope > p, :scope > blockquote, :scope > ul > li, :scope > ol > li'
      );
      if (candidates.length === 0) {
        return;
      }
      const bandTop = window.innerHeight * 0.3;
      const bandBottom = window.innerHeight * 0.7;
      candidates.forEach(el => {
        const rect = el.getBoundingClientRect();
        const hit = rect.top < bandBottom && rect.bottom > bandTop;
        el.classList.toggle('reading-active', hit);
      });
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    // react-markdown 异步管线重建正文 DOM 后自动重算
    const article = document.getElementById('post-content');
    const rebuildWatcher = new MutationObserver(schedule);
    if (article) {
      rebuildWatcher.observe(article, { childList: true, subtree: true });
    }

    return () => {
      cancelAnimationFrame(raf);
      rebuildWatcher.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.querySelectorAll('.reading-active').forEach(el => {
        el.classList.remove('reading-active');
      });
    };
  }, [active, contentKey]);

  return null;
}
