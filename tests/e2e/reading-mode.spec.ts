import { expect, test, type Page } from '@playwright/test';

/**
 * 专注阅读模式（Focus Reading）端到端行为锁定。
 *
 * 固定 theme-preference 避免自动主题的时间依赖（历史 CI 盲区）；
 * 每个 test.beforeEach 清掉 reading 相关 localStorage，互不串扰。
 */

const POST_URL = '/posts/markdown-syntax-test';

/** 视口自适应的站点 chrome 定位器：桌面看侧栏，移动端看顶栏（均随专注模式隐藏） */
function chromeLocator(page: Page) {
  const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
  return isMobile ? page.locator('#mobile-topnav') : page.locator('#desktop-sidebar');
}

async function clearReadingStorage(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.removeItem('reading-prefs');
    window.localStorage.removeItem('reading-mode');
    window.localStorage.removeItem('theme-preference');
  });
}

async function enterFocusViaButton(page: Page) {
  await page.goto(POST_URL);
  await page.waitForLoadState('networkidle');
  await page.locator('#focus-reading-button').click();
  await expect(page.locator('#reading-toolbar')).toBeVisible();
}

test.describe('专注阅读模式', () => {
  test.beforeEach(async ({ page }) => {
    await clearReadingStorage(page);
  });

  test('入口按钮可见，点击进入专注模式并隐藏站点 chrome', async ({ page }) => {
    await page.goto(POST_URL);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('#focus-reading-button')).toBeVisible();
    await expect(chromeLocator(page)).toBeVisible();

    await page.locator('#focus-reading-button').click();

    // html 类切换 + URL 参数
    await expect(page.locator('html')).toHaveClass(/reading-focus/);
    expect(page.url()).toContain('focus=1');

    // 站点 chrome 隐藏
    await expect(chromeLocator(page)).toBeHidden();
    await expect(page.locator('#footer-container')).toBeHidden();
    await expect(page.locator('#post-meta-bottom')).toBeHidden();
    await expect(page.locator('#post-footer')).toBeHidden();

    // 工具胶囊与剩余时长可见
    await expect(page.locator('#reading-toolbar')).toBeVisible();
    await expect(page.locator('.reading-time-chip')).toBeVisible();
  });

  test('Esc 退出专注模式，站点 chrome 恢复', async ({ page }) => {
    await enterFocusViaButton(page);

    await page.keyboard.press('Escape');

    await expect(page.locator('html')).not.toHaveClass(/reading-focus/);
    expect(page.url()).not.toContain('focus=1');
    await expect(chromeLocator(page)).toBeVisible();
    await expect(page.locator('#post-meta-bottom')).toBeVisible();
    await expect(page.locator('#reading-toolbar')).toBeHidden();
  });

  test('Esc 退出与叉号退出均弹退出轻提示（约 1 秒后自动消失）', async ({ page }) => {
    // 用户反馈：叉号退出有轻提示，Esc 退出没有——两路径必须一致。
    // 注：停留时长精确值（800ms+160ms 退场）由 ReadingExitToast.test.tsx 的
    // fake-timer 单测锁定；headless e2e 中动画与断言轮询争抡主线程，
    // 消失超时放宽到 3s 只验“会出现且会自动消失”。
    await enterFocusViaButton(page);
    await page.waitForTimeout(400); // 等工具胶囊入场动画稳定，避免进出动画叠加

    // Esc 退出：toast 出现并自动消失
    await page.keyboard.press('Escape');
    const toastByEsc = page.locator('.reading-exit-toast');
    await expect(toastByEsc).toBeVisible();
    await expect(toastByEsc).toContainText(/已退出专注模式|Exited Focus/);
    await expect(toastByEsc).toBeHidden({ timeout: 3000 });

    // 叉号退出：同样有轻提示
    await enterFocusViaButton(page);
    await page.waitForTimeout(400);
    await page.locator('.reading-capsule-btn--exit').click();
    const toastByButton = page.locator('.reading-exit-toast');
    await expect(toastByButton).toBeVisible();
    await expect(toastByButton).toContainText(/已退出专注模式|Exited Focus/);
    await expect(toastByButton).toBeHidden({ timeout: 3000 });
  });

  test('?focus=1 直接进入专注模式（可分享的纯净链接）', async ({ page }) => {
    await page.goto(`${POST_URL}?focus=1`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('html')).toHaveClass(/reading-focus/);
    await expect(page.locator('#reading-toolbar')).toBeVisible();
    await expect(chromeLocator(page)).toBeHidden();
  });

  test('引导模式：html 带 reading-guide 类，段落获得聚焦标记', async ({ page }) => {
    await enterFocusViaButton(page);

    // 胶囊切到「引导」
    await page.locator('.reading-mode-btn', { hasText: /引导|Guide/ }).click();
    await expect(page.locator('html')).toHaveClass(/reading-guide/);

    // 阅读带内的段落被标记为 reading-active（opacity 1），
    // 阅读带外的段落保持暗态（opacity 0.38）
    const activeCount = await page.locator('#post-content .reading-active').count();
    expect(activeCount).toBeGreaterThan(0);
  });

  test('刷新后自动恢复引导模式，段落聚焦依然生效（DOM 重建回归锁）', async ({ page }) => {
    // 历史 bug：自动恢复模式下，段落观察器挂在 react-markdown 异步渲染
    // 之前的骨架节点上，内容到达后 DOM 整体重建，观察器永不再触发。
    // 此用例锁定"内容渲染完成后阅读带内段落必须被标记"。
    await page.addInitScript(() => {
      window.localStorage.setItem('reading-mode', 'guide');
      window.localStorage.setItem(
        'reading-prefs',
        JSON.stringify({
          fontSize: 1,
          lineHeight: 1,
          pageWidth: 1,
          theme: 'auto',
          focusStyle: 'paragraph',
          bionic: false,
          reminder: false,
        })
      );
    });
    await page.goto(POST_URL);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('html')).toHaveClass(/reading-guide/);
    await expect(page.locator('#post-content > p').first()).toBeVisible();
    const activeCount = await page.locator('#post-content .reading-active').count();
    expect(activeCount).toBeGreaterThan(0);

    // 剩余时长在正文渲染完成后自动出现，无需等首次滚动（历史 bug 回归锁）
    await expect(page.locator('.reading-time-chip')).toBeVisible({ timeout: 8000 });
  });

  test('设置面板可以调节字号并持久化', async ({ page }) => {
    await enterFocusViaButton(page);

    // 打开设置面板
    await page.locator('.reading-capsule-btn[aria-expanded]').click();
    const panel = page.locator('.reading-panel');
    await expect(panel).toBeVisible();

    // 切到「特大」字号
    const sizeRow = panel.locator('.reading-panel-row').filter({ hasText: /字号|Font size/ });
    await sizeRow.locator('.reading-seg-btn').last().click();

    const fontSize = await page
      .locator('#post-content')
      .evaluate(el => Number.parseFloat(window.getComputedStyle(el).fontSize));
    expect(fontSize).toBeGreaterThanOrEqual(24);

    // 偏好已持久化
    const stored = await page.evaluate(() => window.localStorage.getItem('reading-prefs'));
    expect(stored).toContain('"fontSize":3');
  });

  test('退出后回到首页，站点 chrome 不受残留影响', async ({ page }) => {
    // 先经过首页再进文章，保证 goBack 有真实的历史目标
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('a[href*="/posts/"]').first().click();
    await page.waitForLoadState('networkidle');

    await page.locator('#focus-reading-button').click();
    await expect(page.locator('#reading-toolbar')).toBeVisible();

    // 专注模式下返回首页：Post 卸载须彻底清理 html 类
    await page.goBack();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('html')).not.toHaveClass(/reading-focus/);
    await expect(chromeLocator(page)).toBeVisible();
  });
});
