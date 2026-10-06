import { describe, expect, test } from 'vitest';
import { hasMathDelimiters } from './math-detect';

/**
 * 探测规则与 remark-math 的可解析条件对齐（宁可误报不漏报）。
 * 详见 math-detect.ts 头部注释。
 */
describe('hasMathDelimiters', () => {
  test('detects multi-line display math', () => {
    expect(hasMathDelimiters('前提：\n\n$$\nE = mc^2\n$$\n\n结论')).toBe(true);
  });

  test('detects single-line display math', () => {
    expect(hasMathDelimiters('公式 $$a^2 + b^2 = c^2$$ 成立')).toBe(true);
  });

  test('detects inline math on one line', () => {
    expect(hasMathDelimiters('质能方程 $E = mc^2$ 举世闻名')).toBe(true);
  });

  test('plain text without dollars is not math', () => {
    expect(hasMathDelimiters('# 标题\n\n普通正文，没有任何公式。')).toBe(false);
  });

  test('single dollar on a line is not math', () => {
    expect(hasMathDelimiters('这台键盘售价 $100，性价比不错')).toBe(false);
  });

  test('dollar amounts on separate lines are not math', () => {
    expect(hasMathDelimiters('第一件 $40\n\n第二件 $60')).toBe(false);
  });

  test('price range matches remark-math parseability (current site renders it as math)', () => {
    // remark-math 会把 "$50-$80" 解析为公式，探测必须同样返回 true，
    // 否则行为回归（原本渲染成公式的地方变成裸文本）
    expect(hasMathDelimiters('预算 $50-$80 之间的都有')).toBe(true);
  });

  test('escaped dollars still signal math (conservative)', () => {
    expect(hasMathDelimiters('价格 \\$5 与 \\$10 的对比')).toBe(true);
  });

  test('shell variable $$ in code fence signals math (conservative)', () => {
    // 代码块里的 $$ 可能是 shell 变量，也可能是公式意图——宽松策略下返回 true
    expect(hasMathDelimiters('```bash\necho $$\n```')).toBe(true);
  });

  test('empty content is not math', () => {
    expect(hasMathDelimiters('')).toBe(false);
  });

  test('long content without dollars scans fast', () => {
    const content = Array.from({ length: 2000 }, (_, i) => `第 ${i} 行普通文本`).join('\n');
    expect(hasMathDelimiters(content)).toBe(false);
  });
});
