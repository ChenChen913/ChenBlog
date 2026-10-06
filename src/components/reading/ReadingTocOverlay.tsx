import { useCallback } from 'react';
import { motion } from 'motion/react';
import type { HeadingNode } from '../../utils/headingParser';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface ReadingTocOverlayProps {
  headings: HeadingNode[];
  open: boolean;
  onClose: () => void;
  title: string;
}

/**
 * 专注模式下的分节导航浮层（标准模式的右侧 TOC 已随 chrome 隐藏）。
 * 复用 useIntersectionObserver 的 scroll-spy 高亮；点击跳转后自动关闭，
 * 让读者立刻回到正文——浮层是"路标"，不是"驻地"。
 */
export default function ReadingTocOverlay({
  headings,
  open,
  onClose,
  title,
}: ReadingTocOverlayProps) {
  const activeId = useIntersectionObserver(headings);

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

  const renderItems = (items: HeadingNode[], isSubList = false) =>
    items.map(node => (
      <li key={node.id}>
        <button
          type="button"
          className={`reading-toc-item${isSubList ? ' reading-toc-item--sub' : ''}${
            activeId === node.id ? ' reading-toc-item--active' : ''
          }`}
          onClick={() => scrollToHeading(node.id)}
          title={node.text}
        >
          <span className="truncate">{node.text}</span>
        </button>
        {node.children?.length ? (
          <ul className="reading-toc-sub">{renderItems(node.children, true)}</ul>
        ) : null}
      </li>
    ));

  return (
    <>
      <div className="reading-toc-backdrop" onClick={onClose} aria-hidden />
      <motion.div
        className="reading-toc-panel"
        role="dialog"
        aria-label={title}
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
      >
        <div className="reading-toc-head">
          <span className="reading-toc-title">{title}</span>
          <span className="reading-toc-count">{headings.length}</span>
        </div>
        <nav className="reading-toc-list" aria-label={title}>
          <ul>{renderItems(headings)}</ul>
        </nav>
      </motion.div>
    </>
  );
}
