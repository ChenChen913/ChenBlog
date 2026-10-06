import React from 'react';
import { Rss } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Footer() {
  const { t } = useAppContext();

  return (
    <footer id="app-footer" className="mt-20 pb-24 md:pb-8 pt-8 border-t border-stone-200 dark:border-stone-800 text-center text-sm text-stone-500 dark:text-stone-400">
      <p id="footer-copyright">© {new Date().getFullYear()} My Blog. Built with React & Tailwind.</p>
      <a
        id="footer-rss-link"
        href="/rss.xml"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 mt-2 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
        title="RSS"
      >
        <Rss size={14} aria-hidden />
        <span>{t('subscribe')}</span>
      </a>
    </footer>
  );
}
