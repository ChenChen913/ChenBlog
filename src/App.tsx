import React, { Suspense, lazy, useEffect, useLayoutEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import Home from './pages/Home';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './pages/NotFound';

/**
 * ⚡ 路由级代码分割：非首屏页面按需加载。
 * Post 页携带 react-markdown / remark / rehype / KaTeX / Shiki 等重型依赖，
 * 拆分后首屏（首页）不再为这些库付费，文章页进入时才并行拉取对应 chunk。
 */
const Post = lazy(() => import('./pages/Post'));
const Categories = lazy(() => import('./pages/Categories'));
const Highlights = lazy(() => import('./pages/Highlights'));
const About = lazy(() => import('./pages/About'));
const StatusPage = lazy(() => import('./pages/StatusPage'));

const LIST_PATHS = new Set(['/', '/categories', '/highlights']);

/** 懒加载路由的加载态：极简骨架，避免布局抖动 */
function RouteFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="加载中">
      <div className="w-8 h-8 border-2 border-stone-300 dark:border-stone-600 border-t-stone-800 dark:border-t-stone-200 rounded-full animate-spin" />
    </div>
  );
}

function ScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollPositionsRef = useRef(new Map<string, number>());

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  useLayoutEffect(() => {
    const currentPath = location.pathname;
    const isArticlePath = currentPath.startsWith('/posts/');
    const shouldRestoreListPosition = LIST_PATHS.has(currentPath) && navigationType === 'POP';
    const restoredTop = shouldRestoreListPosition
      ? scrollPositionsRef.current.get(currentPath) ?? 0
      : 0;

    const restoreScroll = () => {
      window.scrollTo({
        top: isArticlePath ? 0 : restoredTop,
        left: 0,
        behavior: 'instant' as ScrollBehavior,
      });
    };

    window.requestAnimationFrame(restoreScroll);
    const shouldRetry = isArticlePath || shouldRestoreListPosition;
    const shortDelay = shouldRetry ? window.setTimeout(restoreScroll, 50) : undefined;
    const contentDelay = shouldRetry ? window.setTimeout(restoreScroll, 150) : undefined;

    return () => {
      if (shortDelay !== undefined) {
        window.clearTimeout(shortDelay);
      }
      if (contentDelay !== undefined) {
        window.clearTimeout(contentDelay);
      }
      if (LIST_PATHS.has(currentPath)) {
        scrollPositionsRef.current.set(currentPath, window.scrollY);
      }
    };
  }, [location.pathname, navigationType]);

  return null;
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollRestoration />
        <ErrorBoundary>
          <Layout>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/posts/:slug" element={<Post />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/highlights" element={<Highlights />} />
                <Route path="/about" element={<About />} />
                <Route path="/status/:code" element={<StatusPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </ErrorBoundary>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
