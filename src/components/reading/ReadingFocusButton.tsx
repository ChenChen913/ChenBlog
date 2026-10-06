import { BookOpenText } from 'lucide-react';

interface ReadingFocusButtonProps {
  onEnter: () => void;
  label: string;
}

/**
 * 文章页头部的"专注阅读"入口（仅标准模式渲染）。
 * 液态玻璃胶囊质感，与站点按钮语言一致；图标用 BookOpenText 呼应"翻开书页"。
 */
export default function ReadingFocusButton({ onEnter, label }: ReadingFocusButtonProps) {
  return (
    <button
      id="focus-reading-button"
      type="button"
      onClick={onEnter}
      className="focus-reading-btn"
      aria-haspopup="true"
    >
      <BookOpenText size={17} strokeWidth={2.1} />
      <span>{label}</span>
    </button>
  );
}
