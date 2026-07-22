import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import Home from './pages/Home';
import Post from './pages/Post';
import Categories from './pages/Categories';
import Highlights from './pages/Highlights';
import About from './pages/About';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import StatusPage from './pages/StatusPage';
import NotFound from './pages/NotFound';

const LIST_PATHS = new Set(['/', '/categories', '/highlights']);

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
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/posts/:slug" element={<Post />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/highlights" element={<Highlights />} />
              <Route path="/about" element={<About />} />
              <Route path="/status/:code" element={<StatusPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </ErrorBoundary>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
