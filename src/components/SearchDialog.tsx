import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Search, CornerDownLeft, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getCategoryLabel } from '../config/categories';
import { formatDate } from '../utils/dateFormat';
import {
  loadAllPostContents,
  searchPosts,
  tokenizeQuery,
  highlightParts,
  type SearchResult,
} from '../utils/search';

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchDialog({ open, onClose }: SearchDialogProps) {
  const navigate = useNavigate();
  const { lang, t } = useAppContext();

  const [query, setQuery] = useState('');
  const [contents, setContents] = useState<Record<string, string> | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const tokens = useMemo(() => tokenizeQuery(query), [query]);
  const results = useMemo(
    () => (open ? searchPosts(query, contents ?? {}) : []),
    [open, query, contents]
  );

  // 打开时：预加载全文索引、聚焦输入框、记录焦点恢复点、锁定背景滚动
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    setQuery('');
    setActiveIndex(0);
    requestAnimationFrame(() => inputRef.current?.focus());

    let cancelled = false;
    if (!contents) {
      loadAllPostContents().then(loaded => {
        if (!cancelled) setContents(loaded);
      });
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      cancelled = true;
      document.body.style.overflow = prevOverflow;
      restoreFocusRef.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = useCallback(() => onClose(), [onClose]);

  const select = useCallback(
    (result: SearchResult) => {
      close();
      navigate(`/posts/${result.slug}`);
    },
    [close, navigate]
  );

  // 键盘导航：↑↓ 选择、Enter 打开、Esc 关闭
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length > 0) {
        setActiveIndex(i => (i + 1) % results.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length > 0) {
        setActiveIndex(i => (i - 1 + results.length) % results.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = results[activeIndex];
      if (target) select(target);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  // 活动项滚动可见
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // 输入变化时重置选择
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const highlight = (text: string) =>
    highlightParts(text, tokens).map((part, i) =>
      part.hit ? (
        <mark key={i} className="search-mark">
          {part.text}
        </mark>
      ) : (
        <React.Fragment key={i}>{part.text}</React.Fragment>
      )
    );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            id="search-dialog-overlay"
            className="fixed inset-0 z-[70] bg-black/30 dark:bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={close}
            aria-hidden
          />
          <motion.div
            id="search-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={t('search_placeholder')}
            className="search-glass-panel fixed left-1/2 top-[12vh] z-[71] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            onKeyDown={handleKeyDown}
          >
            {/* 输入行 */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-200/60 dark:border-white/10">
              <Search size={18} className="shrink-0 text-stone-400" aria-hidden />
              <input
                ref={inputRef}
                id="search-dialog-input"
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('search_placeholder')}
                className="w-full bg-transparent outline-none text-[15px] text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
                aria-controls="search-dialog-results"
                aria-activedescendant={
                  results[activeIndex] ? `search-option-${activeIndex}` : undefined
                }
                autoComplete="off"
                spellCheck={false}
              />
              {!contents && (
                <Loader2
                  size={16}
                  className="shrink-0 animate-spin text-stone-400"
                  aria-label={t('search_loading')}
                />
              )}
              <kbd className="search-kbd shrink-0">Esc</kbd>
            </div>

            {/* 结果区 */}
            <div
              id="search-dialog-results"
              ref={listRef}
              role="listbox"
              aria-label={t('search_placeholder')}
              className="max-h-[52vh] overflow-y-auto search-scroll"
            >
              {query.trim() === '' ? (
                <div className="px-4 py-10 text-center text-sm text-stone-400 dark:text-stone-500">
                  {lang === 'en'
                    ? 'Enter keywords to search posts. Title, tags and full text are indexed.'
                    : '输入关键词搜索文章，支持标题、标签与全文检索'}
                </div>
              ) : results.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-stone-400 dark:text-stone-500">
                  {t('no_search_results')}
                </div>
              ) : (
                results.map((result, index) => (
                  <button
                    key={result.slug}
                    id={`search-option-${index}`}
                    data-index={index}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => select(result)}
                    className={`search-result-item ${
                      index === activeIndex ? 'search-result-item--active' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                      <span className="text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        {getCategoryLabel(result.category, lang === 'en' ? 'en' : 'zh')}
                      </span>
                      <span aria-hidden>·</span>
                      <time dateTime={result.date}>
                        {formatDate(result.date, lang === 'en' ? 'en' : 'zh')}
                      </time>
                    </div>
                    <div className="mt-1 text-[15px] font-semibold leading-snug text-stone-900 dark:text-stone-100">
                      {highlight(lang === 'en' && result.titleEn ? result.titleEn : result.title)}
                    </div>
                    {(result.snippet || result.excerpt) && (
                      <div className="mt-1 text-[13px] leading-relaxed text-stone-500 dark:text-stone-400 line-clamp-2">
                        {highlight(result.snippet || result.excerpt)}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* 底部快捷键提示 */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-stone-200/60 dark:border-white/10 text-[11px] text-stone-400 dark:text-stone-500">
              <span className="flex items-center gap-1">
                <kbd className="search-kbd">
                  <CornerDownLeft size={10} />
                </kbd>
                {lang === 'en' ? 'Open' : '打开'}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="search-kbd">
                  <ArrowUp size={10} />
                </kbd>
                <kbd className="search-kbd">
                  <ArrowDown size={10} />
                </kbd>
                {lang === 'en' ? 'Navigate' : '选择'}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="search-kbd">Esc</kbd>
                {lang === 'en' ? 'Close' : '关闭'}
              </span>
              <span className="ml-auto hidden sm:inline">
                {contents
                  ? lang === 'en'
                    ? 'full text ready'
                    : '全文索引已就绪'
                  : lang === 'en'
                    ? 'indexing…'
                    : '索引加载中…'}
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
