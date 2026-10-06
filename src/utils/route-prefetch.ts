/**
 * 路由级 chunk 预热
 * ------------------------------------------------------------------
 * 背景：文章页（Post）为懒加载路由，携带 react-markdown / remark /
 * rehype / Shiki / KaTeX 等重型依赖（压缩后约 170KB gzip）。用户首次
 * 点击文章时才开始拉取/解析，体感为「点了没反应，第二次才顺畅」。
 *
 * 策略（与 hover 正文预取互补）：
 *  1. 应用挂载后、浏览器空闲时（requestIdleCallback）后台预热文章页
 *     组件 chunk——用户还没点，资源已经就位
 *  2. hover / 键盘聚焦文章入口时预热（与 loadPostContent 并行）
 *
 * 省流守卫：saveData 或 slow-2g 网络下跳过，避免替用户做决定。
 * import 路径与 App.tsx 的懒加载声明完全一致，Vite 按「解析后的模块
 * id」去重——预取的就是路由要用的同一个 chunk，零浪费。
 */

type RouteName = 'post' | 'weekly' | 'categories' | 'about' | 'status';

const ROUTE_LOADERS: Record<RouteName, () => Promise<unknown>> = {
  post: () => import('../pages/Post'),
  weekly: () => import('../pages/Weekly'),
  categories: () => import('../pages/Categories'),
  about: () => import('../pages/About'),
  status: () => import('../pages/StatusPage'),
};

const inflight = new Map<RouteName, Promise<unknown>>();

function isMeteredConnection(): boolean {
  if (typeof navigator === 'undefined') return false;
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;
  return Boolean(connection?.saveData || connection?.effectiveType === 'slow-2g');
}

/** 预热单个路由 chunk（幂等：同一路由只发一次 import，失败后允许重试） */
export function prefetchRoute(name: RouteName): void {
  if (typeof window === 'undefined' || inflight.has(name)) return;
  if (isMeteredConnection()) return;
  const load = ROUTE_LOADERS[name]().catch(() => {
    // 失败不缓存标记：下次触发时重试
    inflight.delete(name);
  });
  inflight.set(name, load);
}

/** 浏览器空闲时批量预热（挂在应用挂载后调用，不阻塞首屏任何工作） */
export function scheduleIdleRoutePrefetch(names: RouteName[], timeoutMs = 3000): void {
  if (typeof window === 'undefined') return;
  const run = () => {
    for (const name of names) prefetchRoute(name);
  };
  const idleWindow = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  };
  if (typeof idleWindow.requestIdleCallback === 'function') {
    idleWindow.requestIdleCallback(run, { timeout: timeoutMs });
  } else {
    window.setTimeout(run, 1200);
  }
}
