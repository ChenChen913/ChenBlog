/**
 * 数学公式定界符探测
 *
 * KaTeX 渲染管线（remark-math + rehype-katex + katex CSS）体积大，只有含
 * 公式的文章才值得加载。本工具在正文 chunk 到达后做一次同步正则扫描，
 * 决定是否动态拉取公式渲染管线。
 *
 * 设计原则：与 remark-math 的可解析条件保持一致、宁可误报也不漏报。
 * remark-math（singleDollarTextMath 默认开启）会把同一行内满足
 * 「开 `$` 后非空白、闭 `$` 前非空白」的 `$...$` 解析为公式——例如
 * "预算 $50-$80" 在现有站点上本就会被渲染成公式。因此探测规则同样宽松：
 *   - 跨行 `$$...$$` 块级公式
 *   - 同一行出现 ≥2 个 `$`
 * 误报的代价只是多加载一个（已被缓存的）chunk，漏报则会让用户看到
 * 裸露的 "$...$" 原文。
 */

/** 块级公式：$$ 任意内容（含换行）$$ */
const DISPLAY_MATH = /\$\$[\s\S]+?\$\$/;

function countChar(line: string, ch: string): number {
  let count = 0;
  for (const c of line) {
    if (c === ch) {
      count += 1;
    }
  }
  return count;
}

/**
 * 检测 Markdown 正文是否包含数学公式定界符。
 *
 * @param content Markdown 原文
 * @returns true 表示应加载 KaTeX 渲染管线
 */
export function hasMathDelimiters(content: string): boolean {
  if (!content) {
    return false;
  }

  if (DISPLAY_MATH.test(content)) {
    return true;
  }

  for (const line of content.split('\n')) {
    if (countChar(line, '$') >= 2) {
      return true;
    }
  }

  return false;
}
