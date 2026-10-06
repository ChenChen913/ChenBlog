import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function FloatingActions() {
  const { theme, toggleTheme, lang, toggleLang } = useAppContext();

  return (
    <div
      id="floating-actions"
      className="hidden md:flex fixed top-4 right-4 z-50 items-center gap-2"
    >
      <button
        id="floating-theme-toggle"
        onClick={toggleTheme}
        className="btn-glass-pill p-2 text-stone-600 dark:text-stone-200"
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <button
        id="floating-lang-toggle"
        onClick={toggleLang}
        className="btn-glass-pill px-3 py-2 text-stone-600 dark:text-stone-200 text-sm font-bold uppercase"
        title="Toggle Language"
      >
        {lang === 'zh' ? 'EN' : 'ZH'}
      </button>
    </div>
  );
}
