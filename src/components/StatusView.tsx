import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Home, RefreshCw, WifiOff } from 'lucide-react';

interface StatusViewProps {
  code: string;
  title: string;
  description: string;
  hint?: string;
  showBackButton?: boolean;
  primaryActionLabel?: string;
  primaryActionTo?: string;
  onPrimaryAction?: () => void;
}

export default function StatusView({
  code,
  title,
  description,
  hint,
  showBackButton = true,
  primaryActionLabel,
  primaryActionTo,
  onPrimaryAction,
}: StatusViewProps) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-3xl border border-stone-200 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/90">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200">
          {code === 'NETWORK' ? <WifiOff size={26} /> : <AlertTriangle size={26} />}
        </div>
        <div className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-stone-400 dark:text-stone-500">
          {code}
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {title}
        </h1>
        <p className="mb-4 text-lg leading-8 text-stone-600 dark:text-stone-300">
          {description}
        </p>
        {hint ? (
          <p className="mb-8 rounded-2xl bg-stone-50 px-4 py-3 text-sm leading-7 text-stone-500 dark:bg-stone-800/80 dark:text-stone-400">
            {hint}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          {primaryActionTo ? (
            <Link
              to={primaryActionTo}
              className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
            >
              <Home size={16} />
              {primaryActionLabel || '返回首页'}
            </Link>
          ) : null}
          {onPrimaryAction ? (
            <button
              type="button"
              onClick={onPrimaryAction}
              className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
            >
              <RefreshCw size={16} />
              {primaryActionLabel || '重新加载'}
            </button>
          ) : null}
          {showBackButton ? (
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              <ArrowLeft size={16} />
              返回上一页
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
