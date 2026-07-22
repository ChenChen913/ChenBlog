import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, WifiOff } from 'lucide-react';

export default function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="mx-auto mb-6 flex w-full max-w-4xl items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-100">
      <div className="flex items-center gap-3">
        <WifiOff size={18} />
        <div>
          <div className="font-semibold">当前网络连接异常</div>
          <div className="text-amber-800/80 dark:text-amber-200/80">请检查网络后刷新页面，或先返回首页继续浏览缓存内容。</div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-300 px-3 py-2 font-medium hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/40"
        >
          <RefreshCw size={14} />
          刷新
        </button>
        <Link
          to="/status/network"
          className="rounded-xl bg-amber-900 px-3 py-2 font-medium text-white hover:bg-amber-800 dark:bg-amber-200 dark:text-amber-950 dark:hover:bg-amber-300"
        >
          查看说明
        </Link>
      </div>
    </div>
  );
}
