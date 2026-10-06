/**
 * Theme Detection Utility
 *
 * Provides utilities for detecting and monitoring the current theme (light/dark)
 * with multiple fallback strategies for robustness.
 */

/**
 * Detect the current theme with multiple fallback strategies
 *
 * Priority order:
 * 1. Check document.documentElement.classList for 'dark' class
 * 2. Fall back to prefers-color-scheme media query
 * 3. Default to 'light' if all detection methods fail
 *
 * @returns 'light' | 'dark'
 */
export function detectTheme(): 'light' | 'dark' {
  try {
    // Strategy 1: Check for 'dark' class on document element
    if (document.documentElement.classList.contains('dark')) {
      return 'dark';
    }

    // Strategy 2: Check prefers-color-scheme media query
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // Default to light theme
    return 'light';
  } catch (err) {
    console.warn('Theme detection failed, defaulting to light theme:', err);
    return 'light';
  }
}

/**
 * Set up a theme change observer
 *
 * Monitors changes to the document element's class list and calls the callback
 * when the theme changes. Also monitors prefers-color-scheme changes.
 *
 * @param callback Function to call when theme changes
 * @returns Cleanup function to disconnect observers
 */
export function observeThemeChanges(callback: (theme: 'light' | 'dark') => void): () => void {
  const cleanupFunctions: Array<() => void> = [];

  try {
    // Observer 1: Watch for class changes on document element
    const mutationObserver = new MutationObserver(() => {
      callback(detectTheme());
    });

    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    cleanupFunctions.push(() => mutationObserver.disconnect());

    // Observer 2: Watch for prefers-color-scheme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const mediaQueryHandler = () => callback(detectTheme());

      // Modern browsers support addEventListener
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', mediaQueryHandler);
        cleanupFunctions.push(() => mediaQuery.removeEventListener('change', mediaQueryHandler));
      }
      // Fallback for older browsers
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(mediaQueryHandler);
        cleanupFunctions.push(() => mediaQuery.removeListener?.(mediaQueryHandler));
      }
    }
  } catch (err) {
    console.error('Failed to set up theme observers:', err);
  }

  // Return cleanup function that calls all cleanup functions
  return () => {
    cleanupFunctions.forEach(cleanup => {
      try {
        cleanup();
      } catch (err) {
        console.error('Error during theme observer cleanup:', err);
      }
    });
  };
}

/**
 * Subscribe-style theme detection with automatic updates
 *
 * Sets the initial theme immediately and observes system changes until the
 * returned cleanup function is called. Typically invoked inside useEffect.
 * (Renamed from useThemeDetection: it is a plain subscription helper, not a
 * React hook - the old name falsely tripped react-hooks/rules-of-hooks.)
 *
 * @param setTheme State setter function from useState
 * @returns Cleanup function
 */
export function subscribeThemeDetection(setTheme: (theme: 'light' | 'dark') => void): () => void {
  // Set initial theme
  setTheme(detectTheme());

  // Set up observers
  return observeThemeChanges(setTheme);
}
