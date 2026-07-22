import React from 'react';

export default function Footer() {
  return (
    <footer id="app-footer" className="mt-20 pb-24 md:pb-8 pt-8 border-t border-stone-200 dark:border-stone-800 text-center text-sm text-stone-500 dark:text-stone-400">
      <p id="footer-copyright">© {new Date().getFullYear()} My Blog. Built with React & Tailwind.</p>
    </footer>
  );
}
