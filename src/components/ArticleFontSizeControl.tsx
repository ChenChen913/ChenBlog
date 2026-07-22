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

const OPTIONS: ArticleFontSizeMode[] = ['small', 'standard', 'large'];

export default function ArticleFontSizeControl({
  mode,
  language,
  onChange,
}: ArticleFontSizeControlProps) {
  const labels = LABELS[language];

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
              {labels[option]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
