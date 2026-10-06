import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { usePostContext } from '../context/PostContext';
import { AnimatePresence, motion } from 'motion/react';
import { X, ArrowLeft, List } from 'lucide-react';
import type { HeadingNode } from '../utils/headingParser';

/* ── 文章页底部栏（返回 + 目录）── */
function PostBottomBar() {
  const navigate = useNavigate();
  const { t } = useAppContext();
  const { headings } = usePostContext();
  const [showTOC, setShowTOC] = useState(false);

  const handleBack = () => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('is-back-navigation', 'true');
    }
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const scrollToHeading = useCallback((id: string) => {
    setShowTOC(false);
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const header = document.querySelector('header');
      const offset = header?.getBoundingClientRect().bottom ?? 0;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - offset - 16,
        behavior: 'smooth',
      });
    });
  }, []);

  const renderItems = (items: HeadingNode[], isSub = false) =>
    items.map(node => (
      <li key={node.id}>
        <button
          onClick={() => scrollToHeading(node.id)}
          className={`mobile-toc-item w-full text-left py-2.5 px-4 rounded-xl transition-all duration-150 ${
            isSub ? 'pl-8 text-sm' : 'text-sm font-semibold'
          }`}
        >
          {node.text}
        </button>
        {node.children?.length ? (
          <ul className="mt-0.5">{renderItems(node.children, true)}</ul>
        ) : null}
      </li>
    ));

  return (
    <>
      <nav
        aria-label="移动端文章操作"
        className="mobile-topnav md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-center gap-6 px-6 py-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mobile-action-btn"
          >
            <ArrowLeft size={18} />
            {t('nav_back') || '杩斿洖'}
          </button>
          <button
            onClick={() => setShowTOC(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mobile-action-btn"
          >
            <List size={18} />
            {t('toc_title')}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {showTOC && (
          <>
            {/* 遮罩 */}
            <motion.div
              className="fixed inset-0 z-[60] bg-black/30 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTOC(false)}
            />
            {/* 目录面板 */}
            <motion.div
              className="mobile-toc-panel fixed bottom-0 left-0 right-0 z-[61] md:hidden"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/20 dark:border-white/10">
                <span className="text-base font-bold text-stone-800 dark:text-stone-100">
                  {t('toc_title')}
                </span>
                <button
                  onClick={() => setShowTOC(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full mobile-action-btn"
                >
                  <X size={18} />
                </button>
              </div>
              <ul className="px-3 py-3 max-h-[60vh] overflow-y-auto mobile-toc-scroll">
                {renderItems(headings)}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── 正常导航底部栏 ── */
function NavBottomBar() {
  const { t, lang } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [refractionLevels, setRefractionLevels] = useState<number[]>([0, 0, 0, 0]);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { path: '/', label: t('nav_home').replace(/\s/g, ''), id: 'mobile-nav-home' },
    { path: '/weekly', label: t('nav_weekly').replace(/\s/g, ''), id: 'mobile-nav-weekly' },
    {
      path: '/categories',
      label: t('nav_categories').replace(/\s/g, ''),
      id: 'mobile-nav-categories',
    },
    { path: '/about', label: t('nav_about').replace(/\s/g, ''), id: 'mobile-nav-about' },
  ];

  const getIndicatorRect = useCallback((index: number) => {
    const el = itemsRef.current[index];
    const container = containerRef.current;
    if (!el || !container) return null;
    const cr = container.getBoundingClientRect();
    const ir = el.getBoundingClientRect();
    return { left: ir.left - cr.left - 8, width: ir.width + 16 };
  }, []);

  const updateIndicator = useCallback(() => {
    const rect = getIndicatorRect(activeIndex);
    if (rect && indicatorRef.current) {
      indicatorRef.current.style.width = `${rect.width}px`;
      if (!isDragging) {
        indicatorRef.current.style.left = `${rect.left}px`;
      }
    }
  }, [activeIndex, isDragging, getIndicatorRect]);

  useEffect(() => {
    const index = navItems.findIndex(
      item =>
        location.pathname === item.path ||
        (item.path !== '/' && location.pathname.startsWith(item.path))
    );
    setActiveIndex(index >= 0 ? index : 0);
  }, [location.pathname]);

  useEffect(() => {
    updateIndicator();
  }, [activeIndex, lang, updateIndicator]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current) e.preventDefault();
    };
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => container.removeEventListener('touchmove', onTouchMove);
  }, []);

  const findNearestIndex = useCallback(
    (clientX: number) => {
      const container = containerRef.current;
      if (!container) return activeIndex;
      const containerRect = container.getBoundingClientRect();
      const x = clientX - containerRect.left;
      let nearest = 0;
      let minDist = Infinity;
      itemsRef.current.forEach((el, i) => {
        if (!el) return;
        const ir = el.getBoundingClientRect();
        const center = (ir.left + ir.right) / 2 - containerRect.left;
        const dist = Math.abs(x - center);
        if (dist < minDist) {
          minDist = dist;
          nearest = i;
        }
      });
      return nearest;
    },
    [activeIndex]
  );

  const calcRefraction = useCallback(() => {
    const pill = indicatorRef.current;
    if (!pill) return;
    const pillRect = pill.getBoundingClientRect();
    const levels = navItems.map((_, i) => {
      const el = itemsRef.current[i];
      if (!el) return 0;
      const ir = el.getBoundingClientRect();
      const oL = Math.max(pillRect.left, ir.left);
      const oR = Math.min(pillRect.right, ir.right);
      if (oR <= oL) return 0;
      return Math.min(1, (oR - oL) / ir.width);
    });
    setRefractionLevels(levels);
  }, [navItems.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const pill = indicatorRef.current;
    if (!pill) return;
    const r = pill.getBoundingClientRect();
    if (
      touch.clientX >= r.left &&
      touch.clientX <= r.right &&
      touch.clientY >= r.top &&
      touch.clientY <= r.bottom
    ) {
      setIsDragging(true);
      isDraggingRef.current = true;
      setDragOffset(touch.clientX - r.left);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const pill = indicatorRef.current;
    const container = containerRef.current;
    if (!pill || !container) return;
    const cr = container.getBoundingClientRect();
    const pw = pill.offsetWidth;
    const nl = Math.max(0, Math.min(cr.width - pw, touch.clientX - cr.left - dragOffset));
    pill.style.left = `${nl}px`;
    pill.style.transition = 'none';
    const nearest = findNearestIndex(touch.clientX);
    if (nearest !== activeIndex) setActiveIndex(nearest);
    calcRefraction();
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    isDraggingRef.current = false;
    setDragOffset(0);
    setRefractionLevels([0, 0, 0, 0]);
    const pill = indicatorRef.current;
    if (pill) pill.style.transition = '';
    const rect = getIndicatorRect(activeIndex);
    if (rect && pill) pill.style.left = `${rect.left}px`;
    navigate(navItems[activeIndex].path);
  };

  return (
    <nav
      aria-label="移动端导航"
      role="navigation"
      className="mobile-bottomnav md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div
        ref={containerRef}
        className={`relative flex justify-center items-center px-6 py-4 ${lang === 'en' ? 'gap-3' : 'gap-6'}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={indicatorRef}
          className="mobile-nav-pill absolute h-10 rounded-full"
          style={{ top: '50%', transform: 'translateY(-50%)', opacity: 1, cursor: 'grab' }}
        />
        {navItems.map((item, index) => {
          const isActive = index === activeIndex;
          const refraction = refractionLevels[index];
          return (
            <Link
              key={item.path}
              id={item.id}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
              ref={el => {
                itemsRef.current[index] = el;
              }}
              onClick={() => {
                if (!isDragging) setActiveIndex(index);
              }}
              className={`
                relative z-10 flex items-center justify-center
                ${lang === 'en' ? 'px-3' : 'px-5'} py-2 rounded-full font-medium whitespace-nowrap
                ${lang === 'en' ? 'text-xs' : 'text-sm'}
                transition-all duration-150 ease-out
                ${isActive ? 'text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}
              `}
              style={
                isDragging && refraction > 0
                  ? {
                      transform: `scale(${1 + refraction * 0.15}) translateY(${-refraction * 2}px)`,
                      filter: `blur(${refraction * 0.3}px) brightness(${1 + refraction * 0.15}) saturate(${1 + refraction * 0.4})`,
                      color: refraction > 0.3 ? 'rgba(28, 25, 23, 1)' : undefined,
                    }
                  : undefined
              }
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* ── 主组件：根据路由切换 ── */
export default function MobileBottomBar() {
  const location = useLocation();
  const isPost = /^\/posts\/[^/]+$/.test(location.pathname);

  if (isPost) return <PostBottomBar />;
  return <NavBottomBar />;
}
