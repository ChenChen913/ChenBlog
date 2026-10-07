import { BookOpenText } from 'lucide-react';

interface ReadingFocusButtonProps {
  onEnter: () => void;
  label: string;
  /** 手机端紧凑文案（英文 "Focus Reading" 太长，与字号控件同行时溢出；中文与全称相同） */
  compactLabel?: string;
}

/**
 * 文章页头部的"专注阅读"入口（仅标准模式渲染）。
 * 液态玻璃胶囊质感，与站点按钮语言一致；图标用 BookOpenText 呼应"翻开书页"。
 */
export default function ReadingFocusButton({
  onEnter,
  label,
  compactLabel,
}: ReadingFocusButtonProps) {
  return (
    <button
      id="focus-reading-button"
      type="button"
      onClick={onEnter}
      className="focus-reading-btn"
      aria-haspopup="true"
    >
      <BookOpenText size={17} strokeWidth={2.1} />
      {compactLabel && compactLabel !== label ? (
        <>
          <span className="focus-reading-btn__full">{label}</span>
          <span className="focus-reading-btn__compact">{compactLabel}</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </button>
  );
}
