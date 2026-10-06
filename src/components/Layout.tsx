import React, { ReactNode, useEffect, useState } from 'react';
import SideBar from './SideBar';
import TopNav from './TopNav';
import Footer from './Footer';
import MobileBottomBar from './MobileBottomBar';
import FloatingActions from './FloatingActions';
import ScrollToTop from './ScrollToTop';
import { SkipLink } from './SkipLink';
import NetworkStatusBanner from './NetworkStatusBanner';
import SearchDialog from './SearchDialog';
import ReadingProgress from './ReadingProgress';

export default function Layout({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  // 全局搜索快捷键：⌘K / Ctrl+K 切换，Esc 由弹窗内部处理
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(open => !open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const openSearch = () => setSearchOpen(true);

  return (
    <div id="app-layout" className="min-h-screen bg-white dark:bg-stone-900 transition-colors duration-300 flex">
      <SkipLink />
      <SideBar onOpenSearch={openSearch} />

      {/* min-w-0：斩断宽公式等内容沿 flex 链的 min-width:auto 传播，
          否则移动端会被超宽 KaTeX 公式撑出横向滚动 */}
      <div id="content-wrapper" className="flex-1 min-w-0 flex flex-col min-h-screen">
        <TopNav onOpenSearch={openSearch} />
        <main id="main-content" className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-24 md:pb-12">
          <NetworkStatusBanner />
          {children}
        </main>

        <div id="footer-container" className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Footer />
        </div>
      </div>

      <MobileBottomBar />
      <FloatingActions />
      <ScrollToTop />
      <ReadingProgress />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
