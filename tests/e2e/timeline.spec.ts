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
    expect(titleLefts.length).toBeGreaterThanOrEqual(2);
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
    // 列表顶部不再有「文 章」胶囊标签（减法定稿）
    await expect(page.locator('.sec-label, #home-posts-label')).toHaveCount(0);
    // weekly 文章按普通文章渲染（无任何专属类名/角标）
    const weeklyRows = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.pt-row'));
      return rows.filter(r => /weekly|week-/.test(r.className)).length;
    });
    expect(weeklyRows).toBe(0);
    // gem 行有标记类（内容库存在精选文章时才可验证，不硬编码内容形态）
    const gemRows = await page.locator('.pt-row--gem').count();
    if (gemRows > 0) {
      await expect(page.locator('.pt-row--gem').first()).toBeAttached();
    }
  });

  test('组头时间字号：年份 > 月份，整体与标题同量级（时间放大定稿）', async ({ page }) => {
    const sizes = await page.evaluate(() => {
      const label = document.querySelector<HTMLElement>('.pt-group-label');
      const title = document.querySelector<HTMLElement>('.pt-title');
      if (!label || !title) return null;
      return {
        year: getComputedStyle(label.querySelector('b')!).fontSize,
        month: getComputedStyle(label).fontSize,
        title: getComputedStyle(title).fontSize,
      };
    });
    expect(sizes).not.toBeNull();
    const px = (s: string) => parseFloat(s);
    // 桌面 20px / 移动 18px（响应式断点），统一不小于 17px
    expect(px(sizes!.year)).toBeGreaterThanOrEqual(17);
    // 桌面 15.5px / 移动 14px，统一不小于 13.5px
    expect(px(sizes!.month)).toBeGreaterThanOrEqual(13.5);
    expect(px(sizes!.year)).toBeGreaterThan(px(sizes!.month));
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

// 暂无 weekly: true 文章（原演示周刊文章已删除），周刊页用例整体暂停：
// 新增周刊文章后把 test.describe.skip 改回 test.describe 即可恢复
test.describe.skip('周刊页', () => {
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

  test('周历条交互升级：着色周格是按钮、点击后高亮对应周', async ({ page }) => {
    // 有文章的周（W39/W40/W41）渲染为可点击按钮，空周是纯刻度
    await expect(page.locator('.wk-cell--btn')).toHaveCount(3);
    const emptyCells = await page.evaluate(
      () => document.querySelectorAll('.wk-cell:not(.wk-cell--btn)').length
    );
    expect(emptyCells).toBeGreaterThan(40);
    // 单年数据不渲染年份切换（界面零噪声，多年才出现）
    await expect(page.locator('.wk-year-tab')).toHaveCount(0);
    // 点击 W39 格子：即时高亮反馈（跳转滚动受页面高度钳制，不锁具体位置）
    await page.locator('.wk-cell--btn[data-week="39"]').click();
    await page.waitForTimeout(800);
    await expect(page.locator('.wk-cell--active')).toHaveAttribute('data-week', '39');
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

  test('侧边栏靠左排布：图标基准线与文字左缘各成一条竖线（定稿回归锁）', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const metrics = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll<HTMLElement>('#sidebar-nav a'));
      return links.map(link => ({
        iconLeft: (link.querySelector('svg') as HTMLElement).getBoundingClientRect().left,
        labelLeft: (link.querySelector('span') as HTMLElement).getBoundingClientRect().left,
        linkLeft: link.getBoundingClientRect().left,
      }));
    });
    expect(metrics.length).toBe(4);
    // 图标全部起于同一条竖线，文字全部起于同一条竖线
    const spread = (arr: number[]) => Math.max(...arr) - Math.min(...arr);
    expect(spread(metrics.map(m => m.iconLeft))).toBeLessThanOrEqual(0.5);
    expect(spread(metrics.map(m => m.labelLeft))).toBeLessThanOrEqual(0.5);
    // 靠左排布：图标紧贴行首（居中布局时偏移会 > 30px）
    for (const m of metrics) {
      expect(m.iconLeft - m.linkLeft).toBeLessThan(20);
    }
  });

  test('旧精选链接重定向到分类页 ◆ 过滤', async ({ page }) => {
    await page.goto('/highlights');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/categories\?filter=gem$/);
    await expect(page.locator('#category-btn-gem')).toHaveAttribute('aria-pressed', 'true');
    // 过滤结果只含 gem 文章（行数与精选总数一致，不硬编码内容库形态）
    const rows = await page.evaluate(() => document.querySelectorAll('.pt-row').length);
    const gemTotal = await page.evaluate(() => document.querySelectorAll('.pt-row--gem').length);
    expect(rows).toBe(gemTotal);
  });

  test('周刊文章底部有上一周/下一周互链', async ({ page }) => {
    // 暂无 weekly: true 文章：唯一周刊文章 two-routes-of-ai-coding-tools 已删除，
    // 待新增周刊文章后删除下面这行恢复用例
    test.skip(true, 'no weekly post available since two-routes-of-ai-coding-tools removed');
    await page.goto('/posts/two-routes-of-ai-coding-tools');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#weekly-context')).toBeVisible();
    // W40 的上一周是 W39（两篇周），下一周是 W41
    await expect(page.locator('[id^="wk-nav-prev-"]')).toBeVisible();
    await expect(page.locator('[id^="wk-nav-next-"]')).toBeVisible();
  });
});
