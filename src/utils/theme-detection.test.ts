import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { detectTheme, getAutoTheme, observeThemeChanges } from './theme-detection';

/**
 * Theme detection decision chain (must mirror src/hooks/useTheme.ts):
 *   1. documentElement 'dark' class (authoritative — useTheme syncs here)
 *   2. localStorage 'theme-preference' (manual preference)
 *   3. Beijing-time auto rule (20:00–06:00 → dark)
 *
 * prefers-color-scheme must NEVER influence the result: the blog theme is
 * never derived from the system preference. Regression guard for the
 * "light mode renders dark code blocks" bug (2026-10).
 */

function setSystemColorScheme(dark: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: dark && query.includes('prefers-color-scheme: dark'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }))
  );
}

describe('detectTheme decision chain', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('class "dark" on <html> wins (useTheme is the source of truth)', () => {
    setSystemColorScheme(false);
    window.localStorage.setItem('theme-preference', 'light');
    document.documentElement.classList.add('dark');

    expect(detectTheme()).toBe('dark');
  });

  test('stored manual preference is used when the class is not applied yet', () => {
    setSystemColorScheme(false);
    window.localStorage.setItem('theme-preference', 'dark');

    expect(detectTheme()).toBe('dark');
  });

  test('falls back to the Beijing-time auto rule without a stored preference', () => {
    setSystemColorScheme(false);
    expect(detectTheme()).toBe(getAutoTheme());
  });

  test('prefers-color-scheme: dark does NOT force the dark theme', () => {
    setSystemColorScheme(true);
    window.localStorage.setItem('theme-preference', 'light');

    expect(detectTheme()).toBe('light');
  });

  test('system dark + no stored preference never bypasses the auto rule', () => {
    setSystemColorScheme(true);
    const autoResult = getAutoTheme();

    // Even with a dark OS, the blog decides via its own auto rule.
    expect(detectTheme()).toBe(autoResult);
  });

  test('invalid stored values are ignored', () => {
    setSystemColorScheme(false);
    window.localStorage.setItem('theme-preference', 'neon-pink');

    expect(detectTheme()).toBe(getAutoTheme());
  });
});

describe('getAutoTheme Beijing-time rule', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('night hours (20:00–05:59 Beijing) map to dark', () => {
    vi.setSystemTime(new Date('2026-10-06T13:00:00Z')); // 21:00 Beijing
    expect(getAutoTheme()).toBe('dark');
  });

  test('day hours (06:00–19:59 Beijing) map to light', () => {
    vi.setSystemTime(new Date('2026-10-06T03:00:00Z')); // 11:00 Beijing
    expect(getAutoTheme()).toBe('light');
  });
});

describe('observeThemeChanges', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    window.localStorage.clear();
  });

  test('notifies subscribers when the <html> class changes (useTheme toggles)', async () => {
    const callback = vi.fn();
    const cleanup = observeThemeChanges(callback);

    document.documentElement.classList.add('dark');

    // MutationObserver 回调以微任务形式派发, 需异步等待
    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalled();
    });
    expect(callback).toHaveBeenLastCalledWith('dark');

    cleanup();
  });

  test('notifies subscribers when storage changes from another tab', () => {
    const callback = vi.fn();
    const cleanup = observeThemeChanges(callback);

    window.dispatchEvent(
      new StorageEvent('storage', { key: 'theme-preference', newValue: 'light' })
    );

    expect(callback).toHaveBeenCalled();

    cleanup();
  });

  test('ignores storage events for unrelated keys', () => {
    const callback = vi.fn();
    const cleanup = observeThemeChanges(callback);

    window.dispatchEvent(new StorageEvent('storage', { key: 'sidebar-width', newValue: '280px' }));

    expect(callback).not.toHaveBeenCalled();

    cleanup();
  });

  test('cleanup disconnects observers', () => {
    const callback = vi.fn();
    const cleanup = observeThemeChanges(callback);
    callback.mockClear();

    cleanup();
    document.documentElement.classList.add('dark');

    expect(callback).not.toHaveBeenCalled();
  });
});
