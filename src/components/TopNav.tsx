import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function TopNav({ onOpenSearch }: { onOpenSearch: () => void }) {
  const { theme, toggleTheme, lang, toggleLang, t } = useAppContext();

  return (
    <header id="mobile-topnav" className="mobile-topnav md:hidden sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3 w-full">
        <Link id="mobile-topnav-logo-link" to="/" className="flex items-center gap-2 flex-shrink-0">
          <div
            id="mobile-topnav-logo-icon"
            className="w-8 h-8 rounded-lg bg-stone-900 dark:bg-stone-100 flex items-center justify-center text-white dark:text-stone-900 font-bold text-lg"
          >
            M
          </div>
          <span id="mobile-topnav-logo-text" className="font-bold text-lg tracking-tight">
            {t('site_name')}
          </span>
        </Link>

        <div id="mobile-topnav-actions" className="flex items-center gap-2 flex-shrink-0">
          <button
            id="mobile-topnav-search-btn"
            onClick={onOpenSearch}
            className="mobile-topnav-btn"
            aria-label={t('search_placeholder')}
          >
            <Search size={20} />
          </button>
          <button
            id="mobile-topnav-theme-toggle"
            onClick={toggleTheme}
            className="mobile-topnav-btn"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            id="mobile-topnav-lang-toggle"
            onClick={toggleLang}
            className="mobile-topnav-btn text-sm font-semibold"
          >
            {lang === 'zh' ? 'EN' : 'ZH'}
          </button>
        </div>
      </div>
    </header>
  );
}
