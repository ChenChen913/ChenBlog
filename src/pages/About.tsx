import React from 'react';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';

export default function About() {
  const { t, lang } = useAppContext();

  return (
    <motion.div 
      id="about-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-12 max-w-2xl"
    >
      <header id="about-header" className="space-y-4">
        <h1 id="about-title" className="text-4xl md:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {t('nav_about')}
        </h1>
      </header>

      <div id="about-content" className="prose dark:prose-invert prose-stone max-w-none">
        <p className="text-lg leading-relaxed text-stone-700 dark:text-stone-300">
          {t('about_intro')}
        </p>
        
        <p className="text-lg leading-relaxed text-stone-700 dark:text-stone-300">
          {t('about_description')}
        </p>

        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-8 mb-4">
          {t('about_tech_title')}
        </h2>
        <p className="text-lg leading-relaxed text-stone-700 dark:text-stone-300">
          {t('about_tech_desc')}
        </p>

        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-8 mb-4">
          {t('about_life_title')}
        </h2>
        <p className="text-lg leading-relaxed text-stone-700 dark:text-stone-300">
          {t('about_life_desc')}
        </p>

        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-8 mb-4">
          {t('about_contact')}
        </h2>
        <p className="text-lg leading-relaxed text-stone-700 dark:text-stone-300">
          {t('about_contact_desc')}
        </p>
        
        <ul className="list-none space-y-2 mt-4">
          <li className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
            <span className="font-medium">GitHub:</span>
            <a
              href="https://github.com/ChenChen913"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              github.com/ChenChen913
            </a>
          </li>
          <li className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
            <span className="font-medium">Email:</span>
            <a
              href="mailto:wcn913@gmail.com"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              wcn913@gmail.com
            </a>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
