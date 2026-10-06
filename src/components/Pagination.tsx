import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // 显示的页码数量

    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="flex justify-center items-center gap-2 my-8" aria-label="文章分页">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="上一页"
      >
        <ChevronLeft size={20} />
      </button>

      {getPageNumbers().map((page, index) =>
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => handlePageChange(page)}
            className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-colors ${
              page === currentPage
                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                : 'hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            aria-label={`第 ${page} 页`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="px-2 text-stone-400">
            {page}
          </span>
        )
      )}

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="下一页"
      >
        <ChevronRight size={20} />
      </button>
    </nav>
  );
}
