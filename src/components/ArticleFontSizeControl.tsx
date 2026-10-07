import type { ArticleFontSizeMode } from '../utils/article-font-size';

interface ArticleFontSizeControlProps {
  mode: ArticleFontSizeMode;
  language: 'zh' | 'en';
  onChange: (mode: ArticleFontSizeMode) => void;
}

const LABELS = {
  zh: {
    group: '字体大小',
    small: '小',
    standard: '标准',
    large: '大',
  },
  en: {
    group: 'Font size',
    small: 'Small',
    standard: 'Standard',
    large: 'Large',
  },
} as const;

/* 手机端紧凑标签：英文 Small/Standard/Large 太宽，与专注阅读按钮同行时会溢出重叠；
   换成 A-/A/A+ 通用字号记号。中文本来就短，紧凑标签与全称一致 */
const COMPACT_LABELS = {
  zh: {
    small: '小',
    standard: '标准',
    large: '大',
  },
  en: {
    small: 'A-',
    standard: 'A',
    large: 'A+',
  },
} as const;

const OPTIONS: ArticleFontSizeMode[] = ['small', 'standard', 'large'];

export default function ArticleFontSizeControl({
  mode,
  language,
  onChange,
}: ArticleFontSizeControlProps) {
  const labels = LABELS[language];
  const compact = COMPACT_LABELS[language];

  return (
    <div className="article-font-size-control" aria-label={labels.group}>
      <span className="article-font-size-control__label">{labels.group}</span>
      <div className="article-font-size-control__segments" role="group" aria-label={labels.group}>
        {OPTIONS.map(option => {
          const selected = mode === option;

          return (
            <button
              aria-pressed={selected}
              className={`article-font-size-control__button ${
                selected ? 'article-font-size-control__button--active' : ''
              }`}
              key={option}
              onClick={() => onChange(option)}
              type="button"
            >
              {compact[option] === labels[option] ? (
                <span>{labels[option]}</span>
              ) : (
                <>
                  <span className="article-font-size-control__full">{labels[option]}</span>
                  <span className="article-font-size-control__compact">{compact[option]}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
