import { expect, test } from '@playwright/test';

/**
 * 站内搜索弹窗回归测试
 *
 * 历史缺陷：.search-glass-panel 曾声明 position: relative，与 Tailwind 的
 * .fixed 同特异性且后加载，导致弹窗掉回常规流、把整页 flex 布局挤变形
 * （main 内容区从 896px 挤到 608px）。本文件锁住该行为。
 */
test.describe('站内搜索弹窗', () => {
  test('Ctrl+K 打开弹窗：fixed 定位悬浮且不挤压页面布局', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const main = page.locator('#main-content');
    await main.waitForVisible?.();
    const rectBefore = await main.boundingBox();

    await page.keyboard.press('Control+k');
    const dialog = page.locator('#search-dialog');
    await expect(dialog).toBeVisible();

    // 回归断言：弹窗必须悬浮（fixed），不能进入常规流
    await expect(dialog).toHaveCSS('position', 'fixed');

    // 回归断言：主体内容区位置与宽度保持不变（不被弹窗挤压）
    const rectAfter = await main.boundingBox();
    expect(rectAfter?.width).toBe(rectBefore?.width);
    expect(Math.abs((rectAfter?.x ?? 0) - (rectBefore?.x ?? 0))).toBeLessThan(1);

    // Esc 关闭
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('模糊搜索：子序列关键词可命中文章并高亮命中字符', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Control+k');
    const dialog = page.locator('#search-dialog');
    await expect(dialog).toBeVisible();

    // 等全文索引就绪（输入行右侧 Esc 键帽出现，DOM 中先于底部提示）
    await expect(dialog.locator('.search-kbd').first()).toBeVisible({ timeout: 15000 });

    // "md synt" 无精确子串，仅能靠子序列/跨字段模糊命中 "Markdown 语法测试"
    await dialog.locator('#search-dialog-input').fill('md synt');

    const firstResult = dialog.locator('.search-result-item').first();
    await expect(firstResult).toBeVisible();
    await expect(firstResult.locator('.font-semibold')).toContainText(/Markdown/i);
    // 模糊命中字符以 <mark> 高亮
    await expect(firstResult.locator('mark').first()).toBeVisible();
  });

  test('无结果时展示空状态，点击遮罩可关闭', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Control+k');
    const dialog = page.locator('#search-dialog');
    await expect(dialog).toBeVisible();

    await dialog.locator('#search-dialog-input').fill('zzz不存在的关键词qqq');
    await expect(dialog.locator('#search-dialog-results')).toContainText(/未找到|No posts found/i);

    await page.locator('#search-dialog-overlay').click({ position: { x: 10, y: 10 } });
    await expect(dialog).toBeHidden();
  });
});
