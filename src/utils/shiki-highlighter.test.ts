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
    expect(contrast(adjusted!, '#fbfaf8')).toBeGreaterThanOrEqual(4.5);
  });

  test('keeps already readable colors unchanged', () => {
    expect(ensureReadableLightColor('#0969da', '#fbfaf8')).toBe('#0969da');
  });
});
