import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HeadingNode } from '../utils/headingParser';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { scrollToHeading } from '../utils/scrollToHeading';
import { motion } from 'motion/react';

interface Props {
  parsedHeadings: HeadingNode[];
}

export default function TableOfContents({ parsedHeadings }: Props) {
  const [isClient, setIsClient] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeId = useIntersectionObserver(parsedHeadings);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // activeId 变化时自动滚动 TOC 让高亮条目可见
  useEffect(() => {
    if (!activeId || collapsed || !scrollRef.current) return;
    const target = scrollRef.current.querySelector(`[data-hid="${activeId}"]`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeId, collapsed]);

  // 目录跳转：scrollToHeading 内部带懒加载图片预载与落点纠偏，
  // 修复「点靠下标题时滚到一半停下」的问题
  const handleTocClick = useCallback((id: string) => {
    const header = document.querySelector('header');
    scrollToHeading(id, { offset: header?.offsetHeight ?? 0, gap: 16 });
  }, []);

  if (parsedHeadings.length === 0) return null;
  if (!isClient) return <div className="toc-shell" style={{ visibility: 'hidden' }} />;

  // 递归渲染任意层级的标题节点
  const renderItems = (items: HeadingNode[], isSubList = false) =>
    items.map(node => {
      const isActive = activeId === node.id;

      return (
        <li key={node.id} data-hid={node.id}>
          <div className="relative">
            {isActive && (
              <motion.span
                layoutId="toc-pill"
                className="toc-pill"
                transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 1 }}
                aria-hidden
              />
            )}
            <button
              onClick={() => handleTocClick(node.id)}
              className={
                'toc-item' +
                (isSubList ? ' toc-item--h3' : '') +
                (isActive ? ' toc-item--active' : '')
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

  return (
    <motion.div
      className={`toc-shell${collapsed ? ' toc-shell--collapsed' : ''}`}
      animate={{ width: collapsed ? 52 : 180 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      {/* 收起后露出的柳条 */}
      <button
        className="toc-strip"
        onClick={() => setCollapsed(false)}
        title="展开目录"
        aria-label="展开目录"
      >
        <span className="toc-strip-text">展开目录</span>
      </button>

      {/* 展开：正常目录内容 */}
      {!collapsed && (
        <>
          <div className="toc-title-row">
            <span className="toc-title">目录</span>
            <span
              className="toc-collapse-btn"
              onClick={() => setCollapsed(true)}
              role="button"
              tabIndex={0}
              title="收起目录"
            >
              收起目录
            </span>
          </div>
          <div className="toc-scroll" ref={scrollRef}>
            <ul className="space-y-0.5">{renderItems(parsedHeadings)}</ul>
          </div>
        </>
      )}
    </motion.div>
  );
}
