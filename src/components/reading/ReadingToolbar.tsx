import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { List, SlidersHorizontal, X } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReadingModeApi } from '../../hooks/useReadingMode';
import type { LangKey } from '../../i18n';
import type {
  ReadingFocusSpan,
  ReadingFocusStyle,
  ReadingFontSize,
  ReadingLineHeight,
  ReadingPageWidth,
  ReadingRulerLines,
  ReadingRulerPosition,
  ReadingRulerStyle,
  ReadingTheme,
} from '../../utils/reading-mode';
import { calcReadTime } from '../../utils/storage';

interface ReadingToolbarProps {
  api: ReadingModeApi;
  hasToc: boolean;
  content?: string;
  t: (key: LangKey) => string;
}

/** 剩余阅读分钟数：文章域进度 × 总时长（与站点 calcReadTime 同口径） */
function useReadingTimeRemaining(active: boolean, content?: string): number | null {
  const [remaining, setRemaining] = useState<number | null>(null);
  const totalRef = useRef(0);

  useEffect(() => {
    totalRef.current = content ? calcReadTime(content) : 0;
  }, [content]);

  useEffect(() => {
    // 工具胶囊仅在非标准模式下挂载，active 恒为 true；防御性短路不 setState。
    // 依赖 content：胶囊可能在正文 chunk 到达前挂载（自动恢复模式），
    // 此时 totalRef 为 0 会早退，内容到达后必须重算一次剩余时长
    if (!active) {
      return;
    }
    let raf = 0;
    let last = -1;
    const update = () => {
      const el = document.getElementById('post-content');
      if (!el || totalRef.current === 0) {
        return;
      }
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const start = top - 100;
      const end = top + rect.height - window.innerHeight;
      const denom = Math.max(1, end - start);
      const p = Math.min(1, Math.max(0, (window.scrollY - start) / denom));
      const value = Math.max(1, Math.ceil(totalRef.current * (1 - p)));
      if (value !== last) {
        last = value;
        setRemaining(value);
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [active, content]);

  return remaining;
}

interface SegOption<T> {
  value: T;
  label: string;
}

function Seg<T extends string | number>(props: {
  label: string;
  options: SegOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  const { label, options, value, onChange } = props;
  return (
    <div className="reading-panel-row">
      <span className="reading-panel-label">{label}</span>
      <div className="reading-seg" role="group" aria-label={label}>
        {options.map(option => (
          <button
            key={String(option.value)}
            type="button"
            className={`reading-seg-btn${value === option.value ? ' reading-seg-btn--active' : ''}`}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleRow(props: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  const { label, hint, checked, onChange } = props;
  return (
    <div className="reading-panel-row reading-panel-row--toggle">
      <span className="reading-toggle-text">
        <span className="reading-panel-label">{label}</span>
        <span className="reading-toggle-hint">{hint}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`reading-switch${checked ? ' reading-switch--on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="reading-switch-knob" />
      </button>
    </div>
  );
}

const THEME_DOTS: Record<ReadingTheme, string> = {
  auto: 'linear-gradient(135deg, #faf9f5 50%, #26231f 50%)',
  paper: '#faf9f5',
  sepia: '#f3ecdc',
  night: '#201d1a',
};

function ThemeRow(props: {
  label: string;
  theme: ReadingTheme;
  onChange: (theme: ReadingTheme) => void;
  optionLabels: Record<ReadingTheme, string>;
}) {
  const { label, theme, onChange, optionLabels } = props;
  const themes: ReadingTheme[] = ['auto', 'paper', 'sepia', 'night'];
  return (
    <div className="reading-panel-row">
      <span className="reading-panel-label">{label}</span>
      <div className="reading-swatches" role="group" aria-label={label}>
        {themes.map(value => (
          <button
            key={value}
            type="button"
            className={`reading-swatch${theme === value ? ' reading-swatch--active' : ''}`}
            aria-pressed={theme === value}
            onClick={() => onChange(value)}
          >
            <span className="reading-swatch-dot" style={{ background: THEME_DOTS[value] }} />
            <span>{optionLabels[value]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * 专注阅读底部工具胶囊 + 设置面板（桌面 popover / 移动底部抽屉）。
 * 胶囊承载高频操作：分节导航、专注/引导切换、剩余时长、设置、退出。
 * 面板承载低频调节：字号 4 档 / 行高 3 档 / 页宽 3 档 / 背景 4 选 / 引导细化。
 * 液态玻璃只用在工具层——内容区保持纯净，这是与 ADHD 友好目标的一致性约束。
 *
 * 面板与背板 portal 到 body：#reading-toolbar 自带 transform（居中定位），
 * 会劫持内部 fixed 元素的包含块——上一版背板实际只盖住胶囊大小的一小块，
 * 点击页面空白处根本落在背板上，造成"只能点叉号关闭"。挂到 body 后
 * fixed 回到视口坐标系，点击空白关闭才能成立（桌面透明背板 + 移动暗色背板）。
 */
export default function ReadingToolbar({ api, hasToc, content, t }: ReadingToolbarProps) {
  const { mode, prefs, enter, exit, setPrefs, setTocOpen, panelOpen, setPanelOpen } = api;
  const remaining = useReadingTimeRemaining(mode !== 'standard', content);
  const panelRef = useRef<HTMLDivElement>(null);

  // 桌面端 popover：点面板外的任意位置关闭（背板已覆盖，此处兑底防止
  // 背板被未来重构移除后行为退化；触发按钮自身豁免，避免 toggle 冲突）
  useEffect(() => {
    if (!panelOpen) {
      return;
    }
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) {
        return;
      }
      if (panelRef.current?.contains(target)) {
        return;
      }
      if (target instanceof Element && target.closest('[data-reading-panel-trigger]')) {
        return;
      }
      setPanelOpen(false);
    };
    // pointerdown 而非 click：拖动选中文本松手在面板外时不误触关闭
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [panelOpen, setPanelOpen]);

  const fontSizeOptions: SegOption<ReadingFontSize>[] = [
    { value: 0, label: t('reading_fs_small') },
    { value: 1, label: t('reading_fs_standard') },
    { value: 2, label: t('reading_fs_large') },
    { value: 3, label: t('reading_fs_xlarge') },
  ];
  const lineHeightOptions: SegOption<ReadingLineHeight>[] = [
    { value: 0, label: t('reading_lh_compact') },
    { value: 1, label: t('reading_lh_cozy') },
    { value: 2, label: t('reading_lh_roomy') },
  ];
  const pageWidthOptions: SegOption<ReadingPageWidth>[] = [
    { value: 0, label: t('reading_pw_narrow') },
    { value: 1, label: t('reading_pw_medium') },
    { value: 2, label: t('reading_pw_wide') },
  ];
  const focusStyleOptions: SegOption<ReadingFocusStyle>[] = [
    { value: 'paragraph', label: t('reading_focus_paragraph') },
    { value: 'line', label: t('reading_focus_line') },
  ];
  const focusSpanOptions: SegOption<ReadingFocusSpan>[] = [
    { value: 0, label: t('reading_span_narrow') },
    { value: 1, label: t('reading_span_standard') },
    { value: 2, label: t('reading_span_wide') },
  ];
  const rulerStyleOptions: SegOption<ReadingRulerStyle>[] = [
    { value: 'follow', label: t('reading_ruler_follow') },
    { value: 'fixed', label: t('reading_ruler_fixed') },
  ];
  const rulerLinesOptions: SegOption<ReadingRulerLines>[] = [
    { value: 0, label: '1' },
    { value: 1, label: '3' },
    { value: 2, label: '5' },
  ];
  const rulerPositionOptions: SegOption<ReadingRulerPosition>[] = [
    { value: 0, label: t('reading_pos_high') },
    { value: 1, label: t('reading_pos_mid') },
    { value: 2, label: t('reading_pos_low') },
  ];
  const themeLabels: Record<ReadingTheme, string> = {
    auto: t('reading_theme_auto'),
    paper: t('reading_theme_paper'),
    sepia: t('reading_theme_sepia'),
    night: t('reading_theme_night'),
  };

  const timeText =
    remaining === null ? '' : t('reading_time_left').replace('{n}', String(remaining));

  const panel = panelOpen && (
    <>
      <div className="reading-panel-backdrop" onClick={() => setPanelOpen(false)} aria-hidden />
      <motion.div
        ref={panelRef}
        className="reading-panel"
        role="dialog"
        aria-label={t('reading_settings')}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <div className="reading-panel-head">
          <span className="reading-panel-title">{t('reading_settings')}</span>
          <button
            type="button"
            className="reading-panel-close"
            onClick={() => setPanelOpen(false)}
            aria-label={t('reading_settings')}
          >
            <X size={15} />
          </button>
        </div>
        <div className="reading-panel-body">
          <Seg
            label={t('reading_font_size')}
            options={fontSizeOptions}
            value={prefs.fontSize}
            onChange={value => setPrefs({ fontSize: value })}
          />
          <Seg
            label={t('reading_line_height')}
            options={lineHeightOptions}
            value={prefs.lineHeight}
            onChange={value => setPrefs({ lineHeight: value })}
          />
          <Seg
            label={t('reading_page_width')}
            options={pageWidthOptions}
            value={prefs.pageWidth}
            onChange={value => setPrefs({ pageWidth: value })}
          />
          <ThemeRow
            label={t('reading_theme')}
            theme={prefs.theme}
            onChange={value => setPrefs({ theme: value })}
            optionLabels={themeLabels}
          />
          {mode === 'guide' && (
            <>
              <Seg
                label={t('reading_focus_style')}
                options={focusStyleOptions}
                value={prefs.focusStyle}
                onChange={value => setPrefs({ focusStyle: value })}
              />
              {prefs.focusStyle === 'paragraph' ? (
                <Seg
                  label={t('reading_span')}
                  options={focusSpanOptions}
                  value={prefs.focusSpan}
                  onChange={value => setPrefs({ focusSpan: value })}
                />
              ) : (
                <>
                  <Seg
                    label={t('reading_ruler_style')}
                    options={rulerStyleOptions}
                    value={prefs.rulerStyle}
                    onChange={value => setPrefs({ rulerStyle: value })}
                  />
                  <Seg
                    label={t('reading_ruler_lines')}
                    options={rulerLinesOptions}
                    value={prefs.rulerLines}
                    onChange={value => setPrefs({ rulerLines: value })}
                  />
                  {prefs.rulerStyle === 'fixed' && (
                    <Seg
                      label={t('reading_ruler_pos')}
                      options={rulerPositionOptions}
                      value={prefs.rulerPosition}
                      onChange={value => setPrefs({ rulerPosition: value })}
                    />
                  )}
                </>
              )}
            </>
          )}
          <div className="reading-panel-divider" />
          <ToggleRow
            label={t('reading_bionic')}
            hint={t('reading_bionic_hint')}
            checked={prefs.bionic}
            onChange={value => setPrefs({ bionic: value })}
          />
          <ToggleRow
            label={t('reading_reminder')}
            hint={t('reading_reminder_hint')}
            checked={prefs.reminder}
            onChange={value => setPrefs({ reminder: value })}
          />
        </div>
      </motion.div>
    </>
  );

  return (
    <div id="reading-toolbar" className="reading-toolbar">
      {panelOpen && createPortal(panel, document.body)}

      <div className="reading-capsule" role="toolbar" aria-label={t('focus_reading')}>
        {hasToc && (
          <button
            type="button"
            className="reading-capsule-btn"
            onClick={() => setTocOpen(true)}
            aria-label={t('reading_toc')}
            title={t('reading_toc')}
          >
            <List size={16} strokeWidth={2.2} />
            <span className="reading-capsule-btn-text">{t('reading_toc')}</span>
          </button>
        )}

        <div className="reading-mode-seg" role="group" aria-label={t('focus_reading')}>
          <button
            type="button"
            className={`reading-mode-btn${mode === 'focus' ? ' reading-mode-btn--active' : ''}`}
            aria-pressed={mode === 'focus'}
            onClick={() => enter('focus')}
          >
            {t('reading_mode_focus')}
          </button>
          <button
            type="button"
            className={`reading-mode-btn${mode === 'guide' ? ' reading-mode-btn--active' : ''}`}
            aria-pressed={mode === 'guide'}
            onClick={() => enter('guide')}
          >
            {t('reading_mode_guide')}
          </button>
        </div>

        {timeText && (
          <span className="reading-time-chip" aria-live="off">
            {timeText}
          </span>
        )}

        <button
          type="button"
          data-reading-panel-trigger
          className={`reading-capsule-btn${panelOpen ? ' reading-capsule-btn--active' : ''}`}
          onClick={() => setPanelOpen(!panelOpen)}
          aria-expanded={panelOpen}
          aria-label={t('reading_settings')}
          title={t('reading_settings')}
        >
          <SlidersHorizontal size={16} strokeWidth={2.2} />
        </button>

        <button
          type="button"
          className="reading-capsule-btn reading-capsule-btn--exit"
          onClick={exit}
          aria-label={t('reading_exit')}
          title={t('reading_exit')}
        >
          <X size={16} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
