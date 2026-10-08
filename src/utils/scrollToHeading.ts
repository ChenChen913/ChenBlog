/**
 * 目录跳转：测量 → 预载 → 平滑滚动 → 落点纠偏。
 *
 * 为什么需要纠偏：正文图片是 loading="lazy" 且没有 width/height 占位，
 * 未加载时高度为 0。首次点击目录靠下的标题时，滚动途中上方图片才陆续
 * 加载、把目标标题不断往下推；而 window.scrollTo 的目标 y 是点击瞬间
 * 一次性算好的，于是滚动会「快到标题时莫名停下」。反复点击之所以能
 * 自愈，是因为布局随图片加载逐渐稳定。
 *
 * 策略：
 * 1. 跳转前把目标标题之前的懒加载图片提前置为 eager，尽早稳定布局；
 * 2. 每轮滚动停止后复查标题实际位置，偏移超阈值就按新布局补滚，
 *    直到落点稳定（或达到重试上限）；
 * 3. 用户手动滚动（滚轮/触摸/按键）或发起新跳转时，立即放弃纠偏。
 */

interface ScrollToHeadingOptions {
  /** 固定页头等需要让出的顶部高度 */
  offset?: number;
  /** 标题与视口顶之间的呼吸间距 */
  gap?: number;
}

/** 落点偏差小于该值（px）不再纠正，避免亚像素抖动 */
const DRIFT_THRESHOLD = 8;
/** 连续这么多帧 scrollY 无位移视为本轮滚动结束（60fps 下约 330ms） */
const STABLE_FRAMES = 20;
/** 纠偏轮数上限（防御性，正常 1~3 轮收敛） */
const MAX_RETRIES = 8;

/** 代际令牌：新一次跳转让上一次尚未结束的纠偏循环整体失效 */
let activeToken = 0;

export function scrollToHeading(id: string, options: ScrollToHeadingOptions = {}) {
  const { offset = 0, gap = 16 } = options;
  if (!document.getElementById(id)) return;

  const token = ++activeToken;

  // 目标之前的图片决定标题的最终位置，提前触发加载（之后的保持懒加载）
  preloadImagesAbove(id);

  // 目标 y 必须每轮重测：图片加载会持续改变文档高度；
  // 元素也按 id 重新解析，避免正文子树 remount 后闭包引用脱离 DOM
  const targetY = () => {
    const el = document.getElementById(id);
    if (!el || !el.isConnected) return window.scrollY; // 标题已卸载，保持原地
    return Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset - gap);
  };

  window.scrollTo({ top: targetY(), behavior: 'smooth' });
  watchAndCorrect(token, targetY, 0);
}

/** 把目标标题之前的懒加载图片立即置为 eager */
function preloadImagesAbove(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach(img => {
    // compareDocumentPosition：img 在 target 之前（PRECEDING）才预载
    if (target.compareDocumentPosition(img) & Node.DOCUMENT_POSITION_PRECEDING) {
      img.loading = 'eager';
    }
  });
}

/** 监听本轮滚动结束并纠偏；用户手动介入则立即退出 */
function watchAndCorrect(token: number, targetY: () => number, retry: number) {
  let cancelled = false;
  let lastY = window.scrollY;
  let stableFrames = 0;
  let rafId = 0;

  // 手动滚动 = 阅读意图改变，纠偏立即让位
  const onUserIntent = () => {
    cancelled = true;
    cleanup();
  };

  const cleanup = () => {
    window.removeEventListener('wheel', onUserIntent);
    window.removeEventListener('touchstart', onUserIntent);
    window.removeEventListener('keydown', onUserIntent);
    cancelAnimationFrame(rafId);
  };

  window.addEventListener('wheel', onUserIntent, { passive: true });
  window.addEventListener('touchstart', onUserIntent, { passive: true });
  window.addEventListener('keydown', onUserIntent);

  const step = () => {
    if (cancelled || token !== activeToken) {
      cleanup(); // removeEventListener/cancelAnimationFrame 幂等，重复调用无害
      return;
    }

    const y = window.scrollY;
    stableFrames = Math.abs(y - lastY) < 0.5 ? stableFrames + 1 : 0;
    lastY = y;

    if (stableFrames < STABLE_FRAMES) {
      rafId = requestAnimationFrame(step);
      return;
    }

    // 本轮滚动已停止：复查落点，被懒加载撑偏则补滚一轮
    cleanup();
    const drift = targetY() - window.scrollY;
    if (Math.abs(drift) > DRIFT_THRESHOLD && retry < MAX_RETRIES) {
      window.scrollTo({ top: targetY(), behavior: 'smooth' });
      watchAndCorrect(token, targetY, retry + 1);
    }
  };

  rafId = requestAnimationFrame(step);
}
