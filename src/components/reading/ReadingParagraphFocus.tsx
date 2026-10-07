import { useEffect } from 'react';
import { READING_FOCUS_SPAN_LINES, type ReadingFocusSpan } from '../../utils/reading-mode';

interface ReadingParagraphFocusProps {
  active: boolean;
  /** 聚焦范围档位：窄(6行)/标准(12行)/宽松(20行)，按段落边界取整 */
  span: ReadingFocusSpan;
  /** DOM 重建信号：正文加载/公式插件就绪/Bionic 开关切换都会改变它 */
  contentKey: string;
}

/**
 * 引导模式的"段落聚焦"v2 —— 锚点包含 + 行数量化窗口。
 *
 * v1（nearest-N 段落）的三个用户实测问题：
 * 1. 聚焦的行数不固定：段落长短差几十倍，1 段可能是 2 行也可能是 20 行，
 *    滚动时亮块大小剧烈跳变
 * 2. 中间漏行：nearest 按段落中心距离排序，快速滚动时段落中心从不"最近"，
 *    其文字全程没亮过
 * 3. 首尾聚焦不到：视口 40% 锚点在开卷时落在标题区、读末时落在文末空白，
 *    第一段/最后一段从未被选中
 *
 * v2 算法（顺序游标模型）：
 * - 找"包含阅读锚点（视口 40% 线）的段落"作为游标段：
 *   锚点落在段落间隙时取下一段（正要读的），落在所有段之前取第一段（开卷），
 *   落在所有段之后取最后一段（读末）——首尾天然可达，无需特殊分支
 * - 从游标段向前累加到目标行数（6/12/20 行，按段落边界取整）形成连续亮窗；
 *   文末不够时向前回填。连续区间保证每一行都会被点亮（游标按文档顺序单调移动，
 *   从 A 到 C 必须经过 B）
 * - 亮块行数近似恒定：多个短段凑满目标行数，而不是"档位=段落数"
 *
 * 工程要点（沿用 v1 踩坑结论）：
 * - 不用 IntersectionObserver——react-markdown 异步渲染管线会在 effect 之后
 *   整体重建段落 DOM，挂到旧节点的观察器永远等不到回调；改为滚动时实时几何判定
 * - MutationObserver 监听正文 childList 重建，DOM 换血后下一帧自动重算
 * - 候选集只取正文顶层块与顶层列表项：嵌套列表随父级 li 整体变暗，
 *   避免 opacity 叠乘把嵌套内容压成幽灵；代码块/公式/表格/图片不参与变暗
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

      // 阅读锚点：视口 40% 高度（自然视线落点）
      const anchorY = window.innerHeight * 0.4;

      // 1) 游标段 = 包含锚点的段落；间隙取下一段；范围外取首/末段
      let cursor = candidates.findIndex(el => {
        const rect = el.getBoundingClientRect();
        return rect.top <= anchorY && rect.bottom > anchorY;
      });
      if (cursor === -1) {
        cursor = candidates.findIndex(el => el.getBoundingClientRect().top > anchorY);
        if (cursor === -1) {
          cursor = candidates.length - 1;
        }
      }

      // 2) 行数量化窗口：从游标段起向后累加至目标行数，不足回填前段
      const lineHeightRaw = parseFloat(getComputedStyle(article).lineHeight);
      const lineHeight = Number.isFinite(lineHeightRaw) && lineHeightRaw > 0 ? lineHeightRaw : 36;
      const targetPx = READING_FOCUS_SPAN_LINES[span] * lineHeight;

      let start = cursor;
      let end = cursor;
      let accumulated = 0;
      while (end < candidates.length && accumulated < targetPx) {
        accumulated += candidates[end].getBoundingClientRect().height;
        end++;
      }
      while (start > 0 && accumulated < targetPx) {
        start--;
        accumulated += candidates[start].getBoundingClientRect().height;
      }

      // 3) 连续区间统一标记（区间外全部熄灭）
      candidates.forEach((el, i) => {
        el.classList.toggle('reading-active', i >= start && i < end);
      });
    };

    /**
     * 首尾留白（与行标尺同款手法）：
     * - 开卷时首段整体悬在锚点线上方（阅读模式头部极简），锚点永远进不了首段——
     *   padding-top 把首段顶边推到锚点线上，开卷即聚焦
     * - 文末尾随空间不足时末段永远够不到锚点线——padding-bottom 让滚到底时
     *   末段中心恰好停在锚点上（读末即聚焦）
     * 测量都在文档坐标系（rect + scrollY），与当前滚动位置无关；
     * 先清旧值再测量防止迭代漂移；数值稳定时零写入，不会造成布局抖动
     */
    const applyEdgePadding = () => {
      const article2 = document.getElementById('post-content');
      if (!article2) {
        return;
      }
      const paras = Array.from(
        article2.querySelectorAll<HTMLElement>(
          ':scope > p, :scope > blockquote, :scope > ul > li, :scope > ol > li'
        )
      );
      if (paras.length === 0) {
        return;
      }
      const vh = window.innerHeight;
      const anchorY = vh * 0.4;

      article2.style.removeProperty('--reading-pad-top');
      article2.style.removeProperty('--reading-pad-bottom');

      const firstDocTop = paras[0].getBoundingClientRect().top + window.scrollY;
      const padTop = Math.max(0, Math.round(anchorY - firstDocTop));
      article2.style.setProperty('--reading-pad-top', `${padTop}px`);

      const lastRect = paras[paras.length - 1].getBoundingClientRect();
      const lastDocBottom = lastRect.bottom + window.scrollY;
      const trailing = Math.max(0, document.documentElement.scrollHeight - lastDocBottom);
      const padBottom = Math.max(0, Math.round(vh - trailing - anchorY - lastRect.height / 2));
      article2.style.setProperty('--reading-pad-bottom', `${padBottom}px`);
    };

    const clearEdgePadding = () => {
      const article2 = document.getElementById('post-content');
      article2?.style.removeProperty('--reading-pad-top');
      article2?.style.removeProperty('--reading-pad-bottom');
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    applyEdgePadding();
    update();

    const onResize = () => {
      applyEdgePadding();
      schedule();
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    // react-markdown 异步管线重建正文 DOM 后自动重算（几何+选择都要重来）
    const article = document.getElementById('post-content');
    const rebuildWatcher = new MutationObserver(() => {
      applyEdgePadding();
      schedule();
    });
    if (article) {
      rebuildWatcher.observe(article, { childList: true, subtree: true });
    }

    return () => {
      cancelAnimationFrame(raf);
      rebuildWatcher.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      clearEdgePadding();
      document.querySelectorAll('.reading-active').forEach(el => {
        el.classList.remove('reading-active');
      });
    };
  }, [active, span, contentKey]);

  return null;
}
