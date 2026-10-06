import { describe, expect, test } from 'vitest';
import { ensureReadableLightColor } from './shiki-highlighter';

function hexToRgb(color: string): [number, number, number] {
  const value = color.replace('#', '');
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function luminance([red, green, blue]: [number, number, number]) {
  const channel = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
}

function contrast(foreground: string, background: string) {
  const foregroundLuminance = luminance(hexToRgb(foreground));
  const backgroundLuminance = luminance(hexToRgb(background));
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

describe('ensureReadableLightColor', () => {
  test('darkens low-contrast light tokens against the code background', () => {
    const adjusted = ensureReadableLightColor('#d1d5db', '#fbfaf8');

    expect(adjusted).toBeDefined();
    expect(contrast(adjusted!, '#fbfaf8')).toBeGreaterThanOrEqual(5.6);
  });

  test('keeps already readable colors unchanged', () => {
    // #032f62 对 #fbfaf8 对比度约 12:1，远超下限，应保持原色
    expect(ensureReadableLightColor('#032f62', '#fbfaf8')).toBe('#032f62');
  });

  test('darkens github-light faint tokens to the stricter floor (comments / punctuation)', () => {
    // github-light 注释色：4.6:1 在小字号下仍显灰虚，应被加深到 ≥ 5.6
    const comment = ensureReadableLightColor('#6a737d', '#ffffff');
    expect(comment).toBeDefined();
    expect(comment).not.toBe('#6a737d');
    expect(contrast(comment!, '#ffffff')).toBeGreaterThanOrEqual(5.6);

    // github-light 属性/变量色（4.67:1 → ≥ 5.6，同时保留橙色色相）
    const property = ensureReadableLightColor('#b95310', '#ffffff');
    expect(property).toBeDefined();
    expect(contrast(property!, '#ffffff')).toBeGreaterThanOrEqual(5.6);
    const rgb = hexToRgb(property!);
    expect(rgb[0]).toBeGreaterThan(rgb[2]); // 红通道 > 蓝通道：色相仍是暖色
  });

  test('respects a custom minContrast override', () => {
    const adjusted = ensureReadableLightColor('#b95310', '#ffffff', 4.5);
    // 4.67 ≥ 4.5，自定义下限下应保持原色
    expect(adjusted).toBe('#b95310');
  });

  test('parses 3-digit hex backgrounds (Shiki github-light returns #fff)', () => {
    // 回归：github-light 的 tokens.bg 是 "#fff"，解析失败曾导致浅色 token 原样透传
    const adjusted = ensureReadableLightColor('#e36209', '#fff');
    expect(adjusted).toBeDefined();
    expect(adjusted).not.toBe('#e36209');
    expect(contrast(adjusted!, '#ffffff')).toBeGreaterThanOrEqual(5.6);
  });
});
