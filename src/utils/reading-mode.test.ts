import { afterEach, describe, expect, test } from 'vitest';
import { vi } from 'vitest';
import {
  DEFAULT_READING_PREFS,
  READING_MODE_STORAGE_KEY,
  READING_PREFS_STORAGE_KEY,
  readReadingPrefs,
  readSavedReadingMode,
  saveReadingMode,
  saveReadingPrefs,
} from './reading-mode';

describe('reading-mode preferences', () => {
  afterEach(() => {
    localStorage.clear();
  });

  test('returns defaults when nothing stored', () => {
    expect(readReadingPrefs()).toEqual({ ...DEFAULT_READING_PREFS });
  });

  test('roundtrips a full preference set', () => {
    const prefs = {
      fontSize: 3,
      lineHeight: 2,
      pageWidth: 0,
      theme: 'sepia',
      focusStyle: 'line',
      bionic: true,
      reminder: true,
    } as const;
    saveReadingPrefs(prefs);
    expect(readReadingPrefs()).toEqual(prefs);
  });

  test('clamps out-of-range gears to valid indices', () => {
    localStorage.setItem(
      READING_PREFS_STORAGE_KEY,
      JSON.stringify({ fontSize: 99, lineHeight: -4, pageWidth: 'x' })
    );
    const prefs = readReadingPrefs();
    expect(prefs.fontSize).toBe(3);
    expect(prefs.lineHeight).toBe(0);
    expect(prefs.pageWidth).toBe(0);
  });

  test('falls back to defaults for invalid enum values', () => {
    localStorage.setItem(
      READING_PREFS_STORAGE_KEY,
      JSON.stringify({ theme: 'neon', focusStyle: 'spotlight', bionic: 'yes' })
    );
    const prefs = readReadingPrefs();
    expect(prefs.theme).toBe('auto');
    expect(prefs.focusStyle).toBe('paragraph');
    expect(prefs.bionic).toBe(false);
  });

  test('ignores corrupted JSON silently', () => {
    localStorage.setItem(READING_PREFS_STORAGE_KEY, '{not json');
    expect(readReadingPrefs()).toEqual({ ...DEFAULT_READING_PREFS });
  });
});

describe('reading-mode persistence', () => {
  afterEach(() => {
    localStorage.clear();
  });

  test('saved mode roundtrips focus and guide', () => {
    saveReadingMode('focus');
    expect(readSavedReadingMode()).toBe('focus');
    saveReadingMode('guide');
    expect(readSavedReadingMode()).toBe('guide');
  });

  test('standard roundtrip and garbage both fall back to standard', () => {
    saveReadingMode('standard');
    expect(readSavedReadingMode()).toBe('standard');
    localStorage.setItem(READING_MODE_STORAGE_KEY, 'yolo');
    expect(readSavedReadingMode()).toBe('standard');
  });
});

describe('reading-mode storage safety', () => {
  test('save never throws even when localStorage rejects', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota');
    });
    expect(() => saveReadingPrefs({ ...DEFAULT_READING_PREFS })).not.toThrow();
    expect(() => saveReadingMode('focus')).not.toThrow();
    setItem.mockRestore();
  });

  test('read never throws even when localStorage is unavailable', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied');
    });
    expect(readReadingPrefs()).toEqual({ ...DEFAULT_READING_PREFS });
    expect(readSavedReadingMode()).toBe('standard');
    getItem.mockRestore();
  });
});
