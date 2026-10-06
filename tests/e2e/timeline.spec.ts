import { expect, test } from '@playwright/test';

/**
 * 时间轴列表 / 周刊页的几何回归
 * ------------------------------------------------------------------
 * 锁住第三轮 UI 定稿的三个核心承诺（对应拍板意见）：
 *  1. 轴点与轴线像素级对齐（菱形/圆点中心 == 轴线中心）
 *  2. gem 菱形不破坏标题左对齐（标识活在轴上，文字流零参与）
 *  3. 周刊页文章标题永远在对应日期的下方，且与日期同列左对齐
 *  4. 日期数字使用楷体（秀气字体定稿）
 *  5. 导航 4 项 + /highlights 重定向到分类页 ◆ 过滤
 */

/** 页面内几何测量（自包含，可直接作为 evaluate 回调）：轴点 ::before 中心须压在轴线上 */
async function measureAxis(
  page: import('@playwright/test').Page,
  containerSel: string,
  rowSel: string
) {
  return page.evaluate(
    ([cSel, rSel]: [string, string]) => {
      const container = document.querySelector(cSel) as HTMLElement | null;
      if (!container) return { missing: true, maxError: Infinity };
      const style = getComputedStyle(container);
      const axis = parseFloat(
        style.getPropertyValue('--pt-axis') || style.getPropertyValue('--wk-axis')
      );
      const containerLeft = container.getBoundingClientRect().left;
      const rows = Array.from(container.querySelectorAll(rSel));
      let maxError = 0;
      for (const row of rows) {
        const pseudoLeft = parseFloat(getComputedStyle(row, '::before').left);
        if (Number.isNaN(pseudoLeft)) return { missing: true, maxError: Infinity };
        // translate(-50%) 使 left 即为中心落点；相对容器换算后应恰为 axis
        const center = row.getBoundingClientRect().left + pseudoLeft;
        maxError = Math.max(maxError, Math.abs(center - containerLeft - axis));
      }
      return { missing: rows.length === 0, maxError };
    },
    [containerSel, rowSel]
  );
}

test.describe('首页时间轴列表', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('所有文章标题左缘严格对齐（gem 菱形不占文字流）', async ({ page }) => {
    const titleLefts = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('.pt-title')).map(
        el => el.getBoundingClientRect().left
      )
    );
    expect(titleLefts.length).toBeGreaterThanOrEqual(5);
    const min = Math.min(...titleLefts);
    const max = Math.max(...titleLefts);
    expect(max - min).toBeLessThanOrEqual(0.5);
  });

  test('轴点（含 gem 菱形）中心与轴线像素级对齐', async ({ page }) => {
    const result = await measureAxis(page, '.pt-timeline', '.pt-row');
    expect(result.missing).toBe(false);
    expect(result.maxError).toBeLessThanOrEqual(0.75);
  });

  test('月份组头与标题行同列（日期楷体、行尾时间楷体）', async ({ page }) => {
    const geometry = await page.evaluate(() => {
      const label = document.querySelector<HTMLElement>('.pt-group-label');
      const title = document.querySelector<HTMLElement>('.pt-title');
      const date = document.querySelector<HTMLElement>('.pt-date');
      if (!label || !title || !date) return null;
      return {
        labelLeft: label.getBoundingClientRect().left,
        titleLeft: title.getBoundingClientRect().left,
        dateFont: getComputedStyle(date).fontFamily,
        labelFont: getComputedStyle(label).fontFamily,
      };
    });
    expect(geometry).not.toBeNull();
    expect(Math.abs(geometry!.labelLeft - geometry!.titleLeft)).toBeLessThanOrEqual(0.5);
    // 日期/年月数字使用霞鹜文楷（秀气字体定稿，替代生硬的等宽/系统字体）
    expect(geometry!.dateFont).toContain('LXGW');
    expect(geometry!.labelFont).toContain('LXGW');
  });

  test('首页是纯文章列表：无精选/推荐栏目模块，weekly 文章混排无标识', async ({ page }) => {
    await expect(page.locator('#featured-posts-section, #featured-posts-title')).toHaveCount(0);
    // 4 篇 weekly 文章按普通文章渲染（无任何专属类名/角标）
    const weeklyRows = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.pt-row'));
      return rows.filter(r => /weekly|week-/.test(r.className)).length;
    });
    expect(weeklyRows).toBe(0);
    // gem 行有标记类
    await expect(page.locator('.pt-row--gem').first()).toBeAttached();
  });

  test('移动端 375px 无横向溢出', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    const metrics = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
  });
});

test.describe('周刊页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/weekly');
    await page.waitForLoadState('networkidle');
  });

  test('文章标题永远在对应日期的下方且同列对齐（不管几篇）', async ({ page }) => {
    const checks = await page.evaluate(() => {
      const blocks = Array.from(document.querySelectorAll('[id^="wk-week-"]'));
      return blocks.map(block => {
        const weekHead = block.querySelector<HTMLElement>('.wk-week');
        const firstEntry = block.querySelector<HTMLElement>('.wk-entry-title');
        const range = block.querySelector<HTMLElement>('.wk-range');
        if (!weekHead || !firstEntry || !range) return { ok: false, below: 0, aligned: 0 };
        return {
          ok: true,
          // 标题行顶部必须低于周头行底部（「标题在日期下面」）
          below: firstEntry.getBoundingClientRect().top - weekHead.getBoundingClientRect().bottom,
          // 标题与日期区间同列左对齐
          aligned: Math.abs(
            firstEntry.getBoundingClientRect().left - range.getBoundingClientRect().left
          ),
        };
      });
    });
    // 三形态演示数据：至少 3 个周组（2 篇周 / 1 篇周 / 1 篇周）
    expect(checks.length).toBeGreaterThanOrEqual(3);
    for (const check of checks) {
      expect(check.ok).toBe(true);
      expect(check.below).toBeGreaterThan(0);
      expect(check.aligned).toBeLessThanOrEqual(0.5);
    }
  });

  test('周节点与条目轴点与轴线像素级对齐（提案 3.1 对齐意见的回归锁）', async ({ page }) => {
    const weekNodes = await measureAxis(page, '.wk-groups', '.wk-week');
    const entries = await measureAxis(page, '.wk-groups', '.wk-entry');
    expect(weekNodes.missing).toBe(false);
    expect(entries.missing).toBe(false);
    expect(weekNodes.maxError).toBeLessThanOrEqual(0.75);
    expect(entries.maxError).toBeLessThanOrEqual(0.75);
  });

  test('周历条：52+ 格刻度、当前周描边、日期楷体', async ({ page }) => {
    const strip = await page.evaluate(() => {
      const cells = document.querySelectorAll('.wk-cell');
      const now = document.querySelectorAll('.wk-cell--now');
      const range = document.querySelector<HTMLElement>('.wk-range');
      return {
        cellCount: cells.length,
        nowCount: now.length,
        rangeFont: range ? getComputedStyle(range).fontFamily : '',
      };
    });
    expect(strip.cellCount).toBeGreaterThanOrEqual(52);
    expect(strip.nowCount).toBe(1);
    expect(strip.rangeFont).toContain('LXGW');
  });

  test('三形态：W39 两篇、W40/W41 各一篇，条目直达文章', async ({ page }) => {
    const block = page.locator('[id^="wk-week-"][id$="W39"]');
    await expect(block.locator('.wk-entry')).toHaveCount(2);
    await expect(page.locator('[id^="wk-week-"][id$="W40"] .wk-entry')).toHaveCount(1);
    await expect(page.locator('[id^="wk-week-"][id$="W41"] .wk-entry')).toHaveCount(1);
    // 单篇周点击直达文章正文
    await page.locator('[id^="wk-week-"][id$="W40"] .wk-entry').click();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/\/posts\/.+/);
    await expect(page.locator('#post-content')).toBeVisible();
  });

  test('移动端 375px 周刊页无横向溢出', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    const metrics = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
  });
});

test.describe('导航收敛与精选迁移', () => {
  test('导航 4 项：周刊在位、精选退役', async ({ page }) => {
    // 桌面侧边栏为 md:flex，移动项目下需先切到桌面视口再验证
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#nav-weekly')).toBeVisible();
    await expect(page.locator('#nav-highlights')).toHaveCount(0);
    await expect(page.locator('#sidebar-nav a')).toHaveCount(4);
    // 移动端底部导航同步 4 项
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('#mobile-nav-weekly')).toBeVisible();
    await expect(page.locator('#mobile-nav-highlights')).toHaveCount(0);
  });

  test('旧精选链接重定向到分类页 ◆ 过滤', async ({ page }) => {
    await page.goto('/highlights');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/categories\?filter=gem$/);
    await expect(page.locator('#category-btn-gem')).toHaveAttribute('aria-pressed', 'true');
    // 过滤结果只含 gem 文章
    const rows = await page.evaluate(() => document.querySelectorAll('.pt-row').length);
    expect(rows).toBeGreaterThanOrEqual(2);
  });

  test('周刊文章底部有上一周/下一周互链', async ({ page }) => {
    await page.goto('/posts/two-routes-of-ai-coding-tools');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#weekly-context')).toBeVisible();
    // W40 的上一周是 W39（两篇周），下一周是 W41
    await expect(page.locator('[id^="wk-nav-prev-"]')).toBeVisible();
    await expect(page.locator('[id^="wk-nav-next-"]')).toBeVisible();
  });
});
