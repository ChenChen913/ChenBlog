import { expect, test, type Page } from '@playwright/test';

async function getArticleFontSize(page: Page) {
  return page.locator('#post-content').evaluate(element =>
    Number.parseFloat(window.getComputedStyle(element).fontSize)
  );
}

test.describe('博客基础功能', () => {
  test('首页可以加载并显示主要内容', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/个人博客|Personal Blog/i);
    await expect(page.locator('main').or(page.locator('[role="main"]'))).toBeVisible();
  });

  test('可以打开一篇文章详情页', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.locator('a[href*="/posts/"]').first().click();
    await page.waitForLoadState('networkidle');

    expect(page.url()).toMatch(/\/posts\/.+/);
    await expect(page.locator('#post-content')).toBeVisible();
  });
});

test.describe('文章代码框', () => {
  test('代码较多的文章会显示代码框、语言标签和复制按钮', async ({ page }) => {
    await page.goto('/posts/typescript-advanced');
    await page.waitForLoadState('networkidle');

    const codeBlock = page.locator('.code-block').first();
    await expect(codeBlock).toBeVisible();
    await expect(codeBlock.locator('.code-block__language')).toContainText(/TypeScript/i);
    await expect(codeBlock.getByRole('button', { name: /copy code/i })).toBeVisible();
  });

  test('代码框复制后会显示反馈', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/posts/typescript-advanced');
    await page.waitForLoadState('networkidle');

    const copyButton = page.locator('.code-block').first().getByRole('button', { name: /copy code/i });
    await copyButton.click();

    await expect(page.locator('.code-block').first().getByRole('button', { name: /code copied/i })).toBeVisible();
  });

  test('移动端代码框不会造成页面横向溢出', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/posts/react-hooks');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.code-block').first()).toBeVisible();
    const metrics = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
  });

  test('代码框顶部栏更紧凑，行号和代码行保持对齐', async ({ page }) => {
    await page.goto('/posts/typescript-advanced');
    await page.waitForLoadState('networkidle');

    const codeBlock = page.locator('.code-block').first();
    await expect(codeBlock).toBeVisible();

    const metrics = await codeBlock.evaluate(block => {
      const header = block.querySelector('.code-block__header') as HTMLElement;
      const row = block.querySelector('.code-block__row') as HTMLElement;
      const lineNumber = row?.querySelector('.code-block__line-number') as HTMLElement;
      const lineContent = row?.querySelector('.code-block__line-content') as HTMLElement;

      return {
        headerHeight: header.getBoundingClientRect().height,
        lineNumberTop: lineNumber.getBoundingClientRect().top,
        lineContentTop: lineContent.getBoundingClientRect().top,
      };
    });

    expect(metrics.headerHeight).toBeLessThanOrEqual(42);
    expect(Math.abs(metrics.lineNumberTop - metrics.lineContentTop)).toBeLessThanOrEqual(1);
  });

  test('亮色模式代码 token 保持足够清晰', async ({ page }) => {
    await page.goto('/posts/typescript-advanced');
    await page.waitForLoadState('networkidle');

    const minimumContrast = await page.locator('.code-block').first().evaluate(block => {
      const background = getComputedStyle(block.querySelector('.code-block__viewport') as HTMLElement).backgroundColor;
      const tokens = Array.from(block.querySelectorAll('.code-block__token')).slice(0, 80);

      const parseRgb = (value: string) => {
        const match = value.match(/\d+/g);
        if (!match) return [0, 0, 0];
        return match.slice(0, 3).map(Number);
      };

      const luminance = ([red, green, blue]: number[]) => {
        const channel = (raw: number) => {
          const normalized = raw / 255;
          return normalized <= 0.03928
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
        };

        return (0.2126 * channel(red)) + (0.7152 * channel(green)) + (0.0722 * channel(blue));
      };

      const backgroundLuminance = luminance(parseRgb(background));

      return tokens.reduce((minimum, token) => {
        const color = getComputedStyle(token as HTMLElement).color;
        const tokenLuminance = luminance(parseRgb(color));
        const lighter = Math.max(backgroundLuminance, tokenLuminance);
        const darker = Math.min(backgroundLuminance, tokenLuminance);
        const contrast = (lighter + 0.05) / (darker + 0.05);
        return Math.min(minimum, contrast);
      }, Number.POSITIVE_INFINITY);
    });

    expect(minimumContrast).toBeGreaterThanOrEqual(4.2);
  });
});

test.describe('文章字号控制', () => {
  test('可以切换小、标准、大，并真实改变正文字号', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('article-font-size-mode');
    });
    await page.goto('/posts/typescript-advanced');
    await page.waitForLoadState('networkidle');

    const content = page.locator('#post-content');
    await expect(content).toHaveAttribute('data-article-font-size', 'standard');
    const standardSize = await getArticleFontSize(page);

    await page.getByRole('button', { name: /^小$|^Small$/ }).click();
    await expect(content).toHaveAttribute('data-article-font-size', 'small');
    const smallSize = await getArticleFontSize(page);

    await page.getByRole('button', { name: /^大$|^Large$/ }).click();
    await expect(content).toHaveAttribute('data-article-font-size', 'large');
    const largeSize = await getArticleFontSize(page);

    expect(smallSize).toBeLessThan(standardSize);
    expect(largeSize).toBeGreaterThan(standardSize);
  });

  test('刷新后保留字号选择', async ({ page }) => {
    await page.goto('/posts/typescript-advanced');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /^大$|^Large$/ }).click();
    await expect(page.locator('#post-content')).toHaveAttribute('data-article-font-size', 'large');

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('#post-content')).toHaveAttribute('data-article-font-size', 'large');
    await expect(page.getByRole('button', { name: /^大$|^Large$/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('移动端大字号不会造成文章页横向溢出', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.addInitScript(() => {
      window.localStorage.setItem('article-font-size-mode', 'large');
    });
    await page.goto('/posts/typescript-advanced');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('#post-content')).toHaveAttribute('data-article-font-size', 'large');
    const metrics = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
  });
});
