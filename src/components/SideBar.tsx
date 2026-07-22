import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Hash, Star, User, Github } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const XIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const WechatIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
  </svg>
);

const ITEM_HEIGHT = 44;
const ITEM_GAP = 8;

export default function SideBar() {
  const { t, lang } = useAppContext();
  const location = useLocation();
  const [showQrCode, setShowQrCode] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { path: '/', icon: Home, label: t('nav_home'), id: 'nav-home' },
    { path: '/categories', icon: Hash, label: t('nav_categories'), id: 'nav-categories' },
    { path: '/highlights', icon: Star, label: t('nav_highlights'), id: 'nav-highlights' },
    { path: '/about', icon: User, label: t('nav_about'), id: 'nav-about' },
  ];

  const activeIndex = navItems.findIndex(
    (item) =>
      location.pathname === item.path ||
      (item.path !== '/' && location.pathname.startsWith(item.path))
  );
  const sliderTop = activeIndex >= 0 ? activeIndex * (ITEM_HEIGHT + ITEM_GAP) : 0;
  const sliderVisible = activeIndex >= 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (qrCodeRef.current && !qrCodeRef.current.contains(event.target as Node)) {
        setShowQrCode(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside
      id="desktop-sidebar"
      className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-stone-200/70 dark:border-stone-800 p-6"
    >
      <div id="sidebar-logo-container" className="flex items-center justify-center gap-3 mb-10">
        <div
          id="sidebar-logo-icon"
          className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-stone-100 flex items-center justify-center text-white dark:text-stone-900 font-bold text-xl flex-shrink-0"
        >
          W
        </div>
        <span id="sidebar-logo-text" className="font-bold text-xl tracking-tight">
          {t('site_name')}
        </span>
      </div>

      <nav
        id="sidebar-nav"
        aria-label="主导航"
        role="navigation"
        className="flex-1"
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: `${ITEM_GAP}px` }}
      >
        <div
          aria-hidden="true"
          className="nav-glass-active"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: `${ITEM_HEIGHT}px`,
            top: `${sliderTop}px`,
            opacity: sliderVisible ? 1 : 0,
            transition: 'top 0.32s cubic-bezier(0.34, 1.20, 0.64, 1), opacity 0.2s ease',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
    
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              id={item.id}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
              style={{ position: 'relative', zIndex: 1, height: `${ITEM_HEIGHT}px`, flexShrink: 0 }}
              className={`flex items-center ${lang === 'en' ? 'w-full gap-1' : 'justify-center gap-6'} px-4 rounded-xl transition-colors duration-200 ${
                isActive
                  ? 'text-stone-900 dark:text-stone-100 font-semibold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100'
              }`}
            >
              <div className={`${lang === 'en' ? 'w-5' : ''} flex-shrink-0 flex justify-center`}>
                <item.icon size={20} />
              </div>
              <span className={`text-sm ${lang === 'en' ? 'flex-1 text-center' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    
      <div
        id="sidebar-footer-social"
        className="flex items-center justify-center gap-4 pt-6 border-t border-stone-200 dark:border-stone-800"
      >
        <a
          id="sidebar-social-x"
          href="https://x.com/ChenWang282708"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X (Twitter) 在新窗口打开"
          className="p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          title="X (Twitter)"
        >
          <XIcon size={20} />
        </a>
        <a
          id="sidebar-social-github"
          href="https://github.com/ChenChen913"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub 在新窗口打开"
          className="p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          title="GitHub"
        >
          <Github size={20} />
        </a>
        <div ref={qrCodeRef} className="relative">
          <button
            id="sidebar-social-wechat"
            onClick={() => setShowQrCode(!showQrCode)}
            className="p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            title="公众号"
          >
            <WechatIcon size={20} />
          </button>
          {showQrCode && (
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-white dark:bg-stone-800 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700 z-50"
              style={{ minWidth: '160px' }}
            >
              <img
                src="/wechat-qr.jpg"
                alt="公众号二维码"
                className="w-36 h-36"
                style={{ objectFit: 'cover' }}
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
