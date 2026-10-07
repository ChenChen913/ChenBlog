import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { ChevronUp } from 'lucide-react';

interface ReadingBackTopProps {
  active: boolean;
}

/**
 * 专注阅读模式的"一键返回顶部"（设置里可开关，默认开）。
 *
 * 正常模式的 .scroll-to-top-btn 会被 html.reading-focus 隐藏（站点 chrome 一并退场），
 * 因此这里用独立的类名做一枚同语言的玻璃小圆钮，悬停在工具胶囊上方右角。
 * portal 到 body：避免任何祖先 transform 劫持 fixed 包含块（本项目反复踩过的坑）。
 */
export default function ReadingBackTop({ active }: ReadingBackTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      return;
    }
    const onScroll = () => {
      setVisible(window.scrollY > 480);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [active]);

  if (!active || !visible) {
    return null;
  }

  return createPortal(
    <motion.button
      type="button"
      className="reading-backtop-btn"
      aria-label="回到顶部"
      title="回到顶部"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      onClick={() => {
        setVisible(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    >
      <ChevronUp size={18} strokeWidth={2.2} />
    </motion.button>,
    document.body
  );
}
