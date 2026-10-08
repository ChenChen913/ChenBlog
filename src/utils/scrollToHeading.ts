/**
 * 目录跳转：预载 + 连续追踪滚动。
 *
 * 背景：正文图片是 loading="lazy" 且没有 width/height 占位，未加载时高度
 * 为 0。点击目录靠下的标题时，滚动途中上方图片才陆续加载、把目标标题
 * 不断往下推；若按点击瞬间的布局一次性算好目标 y 再滚，落点必然偏短。
 *
 * v1「先滚再纠」（已废弃）：先 smooth 滚到旧目标，滚动停止后再补滚纠偏。
 * 落点正确，但肉眼可见「两段式跳转」——冲到旧目标、停顿约 0.3s、再滚
 * 第二段，用户反馈卡顿。
 *
 * v2「边滚边追」（当前）：rAF 循环里每帧重测目标 y，用指数逼近（lerp）
 * 追着目标滚。图片加载导致的目标下移被自然吸收成同一段连续轨迹，全程
 * 只有一次平滑动画；目标与滚动位置连续多帧无变化（正常收敛，或页面已
 * 到物理滚动极限）才算完成。用户滚轮/触摸/按键介入时立即让位。
 */

interface ScrollToHeadingOptions {
  /** 固定页头等需要让出的顶部高度 */
  offset?: number;
  /** 标题与视口顶之间的呼吸间距 */
  gap?: number;
}

/** 每帧（60fps 基准）向目标靠近的比例：远距离约 0.6~1s 平滑收敛 */
const FOLLOW_RATIO = 0.16;
/** 位置与目标连续这么多帧无位移视为完成（60fps 下约 330ms） */
const STABLE_FRAMES = 20;
/** 追踪总时长上限（ms），防御性兜底 */
const MAX_DURATION_MS = 6000;

/** 代际令牌：新一次跳转让上一次尚未结束的追踪循环整体失效 */
let activeToken = 0;

export function scrollToHeading(id: string, options: ScrollToHeadingOptions = {}) {
  const { offset = 0, gap = 16 } = options;
  if (!document.getElementById(id)) return;

  const token = ++activeToken;

  // 目标之前的图片决定标题的最终位置，提前触发加载（之后的保持懒加载）
  preloadImagesAbove(id);

  // 目标 y 每帧重测：图片加载会持续改变文档高度；
  // 元素按 id 重新解析，避免正文子树 remount 后闭包引用脱离 DOM
  const targetY = () => {
    const el = document.getElementById(id);
    if (!el || !el.isConnected) return window.scrollY; // 标题已卸载，保持原地
    return Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset - gap);
  };

  followTarget(token, targetY);
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

/** rAF 循环追踪目标；用户手动介入则立即退出 */
function followTarget(token: number, targetY: () => number) {
  // 减少动态偏好：不做连续动画，直接跳到目标（后续位移同样瞬时校正）
  const reducedMotion =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cancelled = false;
  let rafId = 0;

  // 手动滚动 = 阅读意图改变，追踪立即让位
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

  let lastY = window.scrollY;
  let lastTarget = targetY();
  let lastTime = 0;
  let stableFrames = 0;
  const t0 = performance.now();

  const step = (now: number) => {
    if (cancelled || token !== activeToken) {
      cleanup(); // removeEventListener/cancelAnimationFrame 幂等，重复调用无害
      return;
    }

    const target = targetY();
    const y = window.scrollY;
    const gap = target - y;

    // 帧率归一化的指数逼近。behavior 必须是 'instant'：html 全局有
    // scroll-behavior:smooth，若走 'auto' 会被 CSS 二次平滑，每帧都
    // 起一段平滑滚动，画面会抖
    const dt = lastTime ? now - lastTime : 16.7;
    const k = reducedMotion ? 1 : Math.min(1, 1 - Math.pow(1 - FOLLOW_RATIO, dt / 16.7));
    window.scrollTo({ top: y + gap * k, behavior: 'instant' });
    lastTime = now;

    // 完成判定：位置与目标都连续多帧不动——既覆盖正常收敛（gap→0），
    // 也覆盖页面已滚到物理极限（gap 恒存在但位置被钳住，如底部标题）
    const settled = Math.abs(window.scrollY - lastY) < 0.5 && Math.abs(target - lastTarget) <= 1;
    stableFrames = settled ? stableFrames + 1 : 0;
    lastY = window.scrollY;
    lastTarget = target;

    if (stableFrames >= STABLE_FRAMES || now - t0 > MAX_DURATION_MS) {
      cleanup();
      return;
    }
    rafId = requestAnimationFrame(step);
  };

  rafId = requestAnimationFrame(step);
}
