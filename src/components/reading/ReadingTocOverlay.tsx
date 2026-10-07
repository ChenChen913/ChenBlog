import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import type { HeadingNode } from '../../utils/headingParser';
import { flattenHeadings } from '../../utils/headingParser';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface ReadingTocOverlayProps {
  headings: HeadingNode[];
  open: boolean;
  onClose: () => void;
  title: string;
}

/**
 * 专注模式下的分节导航（标准模式的右侧 TOC 已随 chrome 隐藏）。
 *
 * v2：直接移植普通模式的目录（用户提议）——条目结构与样式完全复用
 * .toc-title / .toc-scroll / .toc-item / .toc-pill 同一套类名，
 * 亮块高亮（motion layout 共享布局动画）与 5px 细滚动条都是站点原生语言。
 *
 * 定位教训（v1 的"错位"根因）：面板居中曾依赖 left:50% + transform:translateX(-50%)，
 * 但 motion 的入场动画（scale/y）会整体接管 transform，把 translateX(-50%) 抹掉，
 * 面板左缘停在屏幕中线、整体右偏半个面板宽。v2 改用 left:0;right:0;margin-inline:auto
 * 居中（不依赖 transform），动画只影响 opacity/y。
 *
 * 交互：scroll-spy 高亮跟随 + 高亮条目自动滚入可视区；点击跳转后自动关闭，
 * 让读者立刻回到正文——浮层是"路标"，不是"驻地"。移动端为底部抽屉。
 */
export default function ReadingTocOverlay({
  headings,
  open,
  onClose,
  title,
}: ReadingTocOverlayProps) {
  const activeId = useIntersectionObserver(headings);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 开卷尚未滚过任何标题时，锚定第一节：让"我在哪"从第一眼就有答案
  // （useIntersectionObserver 在首标题进入 offset 线前返回空串）
  const firstId = headings.length > 0 ? flattenHeadings(headings)[0].id : '';
  const currentId = activeId || firstId;

  // 高亮变化时让对应条目滚进可视区（与普通模式目录同款行为）
  useEffect(() => {
    if (!currentId || !open || !scrollRef.current) {
      return;
    }
    const target = scrollRef.current.querySelector(`[data-hid="${currentId}"]`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentId, open]);

  const scrollToHeading = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) {
        return;
      }
      // 专注模式下无固定页头，仅留少量呼吸空间
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 20,
        behavior: 'smooth',
      });
      onClose();
    },
    [onClose]
  );

  if (!open || headings.length === 0) {
    return null;
  }

  // 与 TableOfContents 完全同款的条目结构（pill + item + sub）
  const renderItems = (items: HeadingNode[], isSub = false) =>
    items.map(node => {
      const isActive = currentId === node.id;
      return (
        <li key={node.id} data-hid={node.id}>
          <div className="relative">
            {isActive && (
              <motion.span
                layoutId="reading-toc-pill"
                className="toc-pill"
                transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 1 }}
                aria-hidden
              />
            )}
            <button
              type="button"
              onClick={() => scrollToHeading(node.id)}
              className={
                'toc-item' + (isSub ? ' toc-item--h3' : '') + (isActive ? ' toc-item--active' : '')
              }
              title={node.text}
            >
              <span className="truncate">{node.text}</span>
            </button>
          </div>
          {node.children?.length ? (
            <ul className="toc-sub mt-0.5 space-y-0.5">{renderItems(node.children, true)}</ul>
          ) : null}
        </li>
      );
    });

  return createPortal(
    <>
      <div className="reading-toc-backdrop" onClick={onClose} aria-hidden />
      <motion.div
        className="reading-toc-panel"
        role="dialog"
        aria-label={title}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <div className="reading-toc-head">
          <span className="toc-title">{title}</span>
          <span className="reading-toc-count">{headings.length}</span>
          <button type="button" className="reading-toc-close" onClick={onClose} aria-label={title}>
            <X size={15} />
          </button>
        </div>
        <div className="toc-scroll reading-toc-scroll" ref={scrollRef}>
          <ul className="space-y-0.5">{renderItems(headings)}</ul>
        </div>
      </motion.div>
    </>,
    document.body
  );
}
