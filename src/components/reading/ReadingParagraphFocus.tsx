import { useEffect } from 'react';
import { READING_FOCUS_SPAN_PARAS, type ReadingFocusSpan } from '../../utils/reading-mode';

interface ReadingParagraphFocusProps {
  active: boolean;
  /** 聚焦范围档位：窄(1段)/标准(3段)/宽松(5段) */
  span: ReadingFocusSpan;
  /** DOM 重建信号：正文加载/公式插件就绪/Bionic 开关切换都会改变它 */
  contentKey: string;
}

/**
 * 引导模式的"段落聚焦"：以视口阅读锚点（40% 高度，符合自然视线落点）为中心，
 * 找出距离锚点最近的 N 个段落保持全亮，其余降至 38%。
 *
 * 为什么用 nearest-N 而不是固定几何带（上一版踩坑）：
 * - 用户反馈"聚焦的段落特别多"：几何带（视口 30%-70%）在大段/短屏下同时命中过多段落，
 *   且段落数量不可控；nearest-N 让"同时保持全亮的段数"精确等于档位值（1/3/5）
 * - 首尾自动适配：开卷时最近的段落就是第一段、读末时就是最后一段，
 *   不需要任何特殊分支——文章开头和结尾永远不会"无段可亮"
 *
 * 实现要点（踩坑后定稿）：
 * - 不用 IntersectionObserver 一次性 observe——react-markdown 的异步渲染管线
 *   会在 effect 之后整体重建段落 DOM，挂到旧节点上的观察器永远等不到回调。
 *   改为滚动时实时查询 + getBoundingClientRect 几何判定
 * - MutationObserver 监听正文 childList 重建，DOM 换血后下一帧自动重算
 * - 候选集只取正文顶层块与顶层列表项：嵌套列表随父级 li 整体变暗，
 *   避免 opacity 叠乘（0.38 × 0.38）把嵌套内容压成幽灵
 * - 代码块/公式/表格/图片不在候选集内，永不参与变暗（与设计承诺一致）
 */
export default function ReadingParagraphFocus({
  active,
  span,
  contentKey,
}: ReadingParagraphFocusProps) {
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
      const candidates = Array.from(
        article.querySelectorAll<HTMLElement>(
          ':scope > p, :scope > blockquote, :scope > ul > li, :scope > ol > li'
        )
      );
      if (candidates.length === 0) {
        return;
      }

      // 阅读锚点：视口 40% 高度（段落中心的比较基准）
      const anchor = window.innerHeight * 0.4;
      const keep = READING_FOCUS_SPAN_PARAS[span];

      // 按段落中心到锚点的距离排序，取最近 N 段
      const ranked = candidates
        .map(el => {
          const rect = el.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          return { el, dist: Math.abs(center - anchor) };
        })
        .sort((a, b) => a.dist - b.dist);

      const activeSet = new Set(ranked.slice(0, keep).map(item => item.el));
      candidates.forEach(el => {
        el.classList.toggle('reading-active', activeSet.has(el));
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
  }, [active, span, contentKey]);

  return null;
}
