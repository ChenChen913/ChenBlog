import { describe, expect, test } from 'vitest';
import { fuzzyIndices, highlightParts, tokenizeQuery } from './search';

describe('tokenizeQuery', () => {
  test('splits on whitespace and lowercases', () => {
    expect(tokenizeQuery('  React Hooks  ')).toEqual(['react', 'hooks']);
  });

  test('keeps CJK queries intact as single tokens', () => {
    expect(tokenizeQuery('机器学习')).toEqual(['机器学习']);
  });
});

describe('fuzzyIndices', () => {
  test('matches query as subsequence and returns positions', () => {
    // r...n: "return" 中 r(0) n(5)
    expect(fuzzyIndices('rn', 'return')).toEqual([0, 5]);
  });

  test('returns null when subsequence is impossible', () => {
    expect(fuzzyIndices('xyz', 'return')).toBeNull();
  });

  test('rejects single-character and CJK queries (noise control)', () => {
    expect(fuzzyIndices('r', 'return')).toBeNull();
    expect(fuzzyIndices('机器', '机器人')).toBeNull();
  });

  test('is case-insensitive against the target', () => {
    expect(fuzzyIndices('rn', 'RETURN')).toEqual([0, 5]);
  });
});

describe('highlightParts with fuzzy fallback', () => {
  test('exact substring hit highlights the whole token', () => {
    const parts = highlightParts('React Hooks', ['react']);
    expect(parts).toEqual([
      { text: 'React', hit: true },
      { text: ' Hooks', hit: false },
    ]);
  });

  test('fuzzy-only token highlights matched characters individually', () => {
    // "hoks" 子串不在 "Hooks" 中，按子序列命中 h(0) o(1) k(4) s(5)，
    // 高亮保留原文大小写
    const parts = highlightParts('Hooks', ['hoks']);
    expect(parts.filter(p => p.hit).map(p => p.text)).toEqual(['Ho', 'ks']);
  });

  test('no match at all returns a single unhighlighted part', () => {
    expect(highlightParts('abc', ['zzz'])).toEqual([{ text: 'abc', hit: false }]);
  });

  test('CJK token keeps substring semantics (no fuzzy confetti)', () => {
    const parts = highlightParts('机器学习入门', ['学习']);
    expect(parts).toEqual([
      { text: '机器', hit: false },
      { text: '学习', hit: true },
      { text: '入门', hit: false },
    ]);
  });
});
