import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  READING_RULER_LINES_COUNT,
  READING_RULER_POSITION_PCT,
  type ReadingRulerLines,
  type ReadingRulerPosition,
  type ReadingRulerStyle,
} from '../../utils/reading-mode';

interface ReadingRulerProps {
  active: boolean;
  rulerStyle: ReadingRulerStyle;
  lines: ReadingRulerLines;
  position: ReadingRulerPosition;
  /** DOM 重建信号：正文加载/字号变化都会改变几何 */
  contentKey: string;
}

/**
 * 引导模式的"行标尺"（参照 Microsoft Immersive Reader 的 Line Focus 与实体阅读尺）：
 *
 * 双模式（用户可切换）：
 * - follow：随光标移动（实体阅读尺隐喻），触屏设备锚定视口 30%
 * - fixed：固定在视口某个位置，滚动时内容流过标尺（Immersive Reader 同款）
 *
 * 视觉设计（用户拍板：尺内亮、尺外黑）：
 * - 标尺带外的上下区域用强暗化遮罩（亮主题 0.86 / 暗主题 0.8），
 *   边缘带约 2 行高的柔和渐变，避免硬切晃眼
 * - 标尺带本身微微提亮 + 上下细边界线，靠对比形成"亮窗"感
 *
 * 首尾适配（关键）：
 * - fixed 模式给正文加 padding-top，让第一行初始就落在标尺带内（开卷即焦点）
 * - fixed 与触屏 follow 给正文加 padding-bottom，保证最后一行能滚进标尺带
 *   （否则文末永远停在视口底部、埋在遮罩里读不到）
 *
 * 工程要点：
 * - portal 到 body：#reading-toolbar 有 transform，会让内部 fixed 元素的
 *   包含块被劫持（背板/遮罩实际尺寸塌缩）——这是上一版"点空白关不掉"的教训
 * - 纯装饰层 pointer-events:none，不挡代码块横向滚动等交互
 * - prefers-reduced-motion：关闭 follow 模式的插值动画
 */

/** 触屏 follow 模式的标尺锚点（视口百分比） */
const TOUCH_FOLLOW_ANCHOR = 0.3;

export default function ReadingRuler({
  active,
  rulerStyle,
  lines,
  position,
  contentKey,
}: ReadingRulerProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const maskTopRef = useRef<HTMLDivElement>(null);
  const maskBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) {
      return;
    }
    const el = elRef.current;
    const maskTop = maskTopRef.current;
    const maskBottom = maskBottomRef.current;
    const article = document.getElementById('post-content');
    if (!el || !maskTop || !maskBottom || !article) {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const fixedMode = rulerStyle === 'fixed';
    // 触屏 follow 锚定 30%：同样需要底部留白让末行能进入标尺
    const needsBottomPad = fixedMode || !finePointer;

    let targetY = 0;
    let currentY = 0;
    let raf = 0;
    let rulerHeight = 0;

    /** 标尺带几何：高度 = 正文行高 × 行数档；宽度与正文列对齐（含少量出血）。
     *  遮罩保持全宽（CSS left:0/right:0）：尺外皆黑，只有标尺带是唯一的亮窗 */
    const syncGeometry = () => {
      const rect = article.getBoundingClientRect();
      const lineHeightRaw = parseFloat(getComputedStyle(article).lineHeight);
      const lineHeight = Number.isFinite(lineHeightRaw) && lineHeightRaw > 0 ? lineHeightRaw : 36;
      rulerHeight = lineHeight * READING_RULER_LINES_COUNT[lines];

      el.style.left = `${Math.max(8, rect.left - 10)}px`;
      el.style.width = `${Math.min(window.innerWidth - 16, rect.width + 20)}px`;
      el.style.height = `${rulerHeight}px`;
    };

    /** 标尺带 + 遮罩的纵向布局（每次 Y 更新时同步）。
     *  上遮罩从正文可视顶部开始（而非视口顶）：标题区永远保持正常亮度，
     *  只有正文进入视口后遮罩才亮场，开卷看标题时不会被莫名压暗 */
    let maskTopStart = 0;
    const layoutY = (y: number) => {
      el.style.top = `${y}px`;
      maskTop.style.top = `${maskTopStart}px`;
      maskTop.style.height = `${Math.max(0, y - maskTopStart)}px`;
      maskBottom.style.top = `${y + rulerHeight}px`;
    };
    const syncMaskTopStart = () => {
      maskTopStart = Math.max(0, article.getBoundingClientRect().top);
    };

    /** fixed 模式的初始 Y：位置档位（带中心点百分比） */
    const fixedCenterY = () =>
      Math.max(0, window.innerHeight * READING_RULER_POSITION_PCT[position] - rulerHeight / 2);

    /** 首尾留白：fixed 模式 padding-top 让第一行初始即在标尺带内；
     *  末尾留白让最后一行滚到底时正好停在标尺带内（带中心附近） */
    const applyEdgePadding = () => {
      const vh = window.innerHeight;
      const rulerTop = fixedMode ? fixedCenterY() : vh * TOUCH_FOLLOW_ANCHOR;
      if (fixedMode) {
        // 期望 scrollY=0 时正文第一行落在标尺带上沿（留 0.1 带高呼吸）
        // border-box top 不含 padding，测量不受旧值污染
        const postDocTop = article.getBoundingClientRect().top + window.scrollY;
        const desired = rulerTop + rulerHeight * 0.1;
        const padTop = Math.max(0, desired - postDocTop);
        article.style.setProperty('--reading-pad-top', `${padTop.toFixed(0)}px`);
      } else {
        article.style.removeProperty('--reading-pad-top');
      }
      if (needsBottomPad) {
        // 先清旧值再测量：带着旧 padding 算会迭代漂移
        article.style.removeProperty('--reading-pad-bottom');
        // trailing 必须量到"文档底"而非 article 底：末段 margin 会塌陷出容器，
        // 容器之后还有 body padding 等文档空间，这些都会垫在最后一行下面
        const lastEl = article.lastElementChild;
        const lastRect = lastEl?.getBoundingClientRect();
        const lastDocBottom = lastRect
          ? lastRect.bottom + window.scrollY
          : document.documentElement.scrollHeight;
        const docBottom = document.documentElement.scrollHeight;
        const trailing = Math.max(0, docBottom - lastDocBottom);
        // 让最后一个块的中心对齐标尺带中心：无论末段几行，滚到底都恰好居中在亮带里
        const rulerCenter = rulerTop + rulerHeight / 2;
        const lastHalf = lastRect ? lastRect.height / 2 : 0;
        const padBottom = Math.max(0, vh - rulerCenter - lastHalf - trailing);
        article.style.setProperty('--reading-pad-bottom', `${padBottom.toFixed(0)}px`);
      } else {
        article.style.removeProperty('--reading-pad-bottom');
      }
    };

    const clearEdgePadding = () => {
      article.style.removeProperty('--reading-pad-top');
      article.style.removeProperty('--reading-pad-bottom');
    };

    const loop = () => {
      syncMaskTopStart();
      if (!reducedMotion && finePointer && !fixedMode) {
        currentY += (targetY - currentY) * 0.22;
        if (Math.abs(targetY - currentY) < 0.5) {
          currentY = targetY;
        }
      } else {
        currentY = targetY;
      }
      layoutY(currentY);
      raf = requestAnimationFrame(loop);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (fixedMode) {
        return;
      }
      // 跟随模式下标尺中心对齐光标行（限制在视口内）
      targetY = Math.max(
        0,
        Math.min(window.innerHeight - rulerHeight, e.clientY - rulerHeight / 2)
      );
    };
    const onTouchMove = () => {
      if (fixedMode) {
        return;
      }
      // 触屏设备误派发 mousemove 的场景：回到锚定高度
      targetY = window.innerHeight * TOUCH_FOLLOW_ANCHOR;
    };
    const onResize = () => {
      syncGeometry();
      applyEdgePadding();
      if (fixedMode) {
        targetY = fixedCenterY();
        layoutY(targetY);
      }
    };
    // fixed 模式无插值循环：滚动时同步遮罩起点（正文顶部随滚动上移）
    const onScroll = () => {
      if (!fixedMode) {
        return;
      }
      syncMaskTopStart();
      layoutY(currentY);
    };

    syncGeometry();
    syncMaskTopStart();
    targetY = fixedMode ? fixedCenterY() : window.innerHeight * TOUCH_FOLLOW_ANCHOR;
    currentY = targetY;
    layoutY(currentY);
    applyEdgePadding();

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(article);
    resizeObserver.observe(document.documentElement);

    window.addEventListener('scroll', onScroll, { passive: true });
    if (finePointer) {
      window.addEventListener('mousemove', onMouseMove, { passive: true });
      window.addEventListener('touchstart', onTouchMove, { passive: true });
    }
    // fixed 模式 Y 恒定，无需常驻 rAF；仅 follow 需要插值循环
    if (!fixedMode) {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchstart', onTouchMove);
      clearEdgePadding();
    };
  }, [active, rulerStyle, lines, position, contentKey]);

  if (!active) {
    return null;
  }

  return createPortal(
    <>
      <div ref={maskTopRef} className="reading-ruler-mask reading-ruler-mask--top" aria-hidden />
      <div ref={elRef} className="reading-ruler" aria-hidden />
      <div
        ref={maskBottomRef}
        className="reading-ruler-mask reading-ruler-mask--bottom"
        aria-hidden
      />
    </>,
    document.body
  );
}
