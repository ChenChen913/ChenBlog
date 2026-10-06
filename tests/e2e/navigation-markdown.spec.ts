import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

function isMobileProject(projectName: string) {
  return projectName.toLowerCase().includes('mobile');
}

async function waitForArticle(page: Page) {
  await page.waitForLoadState('networkidle');
  await expect(page.locator('#post-content')).toBeVisible();
}

async function expectListScrollRestored(page: Page, listPath: string) {
  await page.goto(listPath);
  await page.waitForLoadState('networkidle');

  const canScroll = await page.evaluate(
    () => document.documentElement.scrollHeight > window.innerHeight + 260
  );
  test.skip(!canScroll, `${listPath} is not tall enough to verify scroll restoration`);

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 520, behavior: 'instant' });
  });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(120);
  const before = await page.evaluate(() => window.scrollY);

  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/posts/"]'));
    const visibleLink =
      links.find(link => {
        const rect = link.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
      }) ?? links[0];
    visibleLink.click();
  });
  await waitForArticle(page);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(4);

  await page.locator('#back-button').click();
  await page.waitForURL(`**${listPath}`);

  const after = await page.evaluate(() => window.scrollY);
  expect(after).toBeGreaterThan(before - 80);
  expect(after).toBeLessThan(before + 80);
}

test.describe('Navigation scroll restoration', () => {
  test('desktop: returns from article to the previous home scroll position', async ({
    page,
  }, testInfo) => {
    test.skip(isMobileProject(testInfo.project.name), 'Desktop-only Back button behavior');

    await expectListScrollRestored(page, '/');
  });

  test('desktop: returns from article to the previous categories scroll position', async ({
    page,
  }, testInfo) => {
    test.skip(isMobileProject(testInfo.project.name), 'Desktop-only Back button behavior');

    await expectListScrollRestored(page, '/categories');
  });

  test('desktop: returns from article to the previous weekly scroll position when scrollable', async ({
    page,
  }, testInfo) => {
    test.skip(isMobileProject(testInfo.project.name), 'Desktop-only Back button behavior');

    await expectListScrollRestored(page, '/weekly');
  });

  // Playwright 固定签名：首参必须为 fixture 解构对象（此处无需 fixture）
  // eslint-disable-next-line no-empty-pattern
  test('source: page route transitions do not use vertical y displacement', async ({}, testInfo) => {
    test.skip(isMobileProject(testInfo.project.name), 'Source assertion only needs one project');

    const root = process.cwd();
    const files = [
      'src/pages/Post.tsx',
      'src/pages/Home.tsx',
      'src/pages/Categories.tsx',
      'src/pages/Weekly.tsx',
    ];

    for (const file of files) {
      const source = fs.readFileSync(path.join(root, file), 'utf8');
      expect(source, `${file} should not define y displacement route transitions`).not.toMatch(
        /\by\s*:\s*[-\d]/
      );
    }
  });

  test('desktop: floating Back button stays visible while article scrolls', async ({
    page,
  }, testInfo) => {
    test.skip(isMobileProject(testInfo.project.name), 'Desktop-only Back button behavior');

    await page.goto('/posts/typescript-advanced');
    await waitForArticle(page);

    const backButton = page.locator('#back-button');
    await expect(backButton).toBeVisible();
    const before = await backButton.boundingBox();
    const article = await page.locator('article[id^="post-article-"]').boundingBox();
    expect(before).not.toBeNull();
    expect(article).not.toBeNull();
    expect(before!.x).toBeLessThan(article!.x);

    await page.evaluate(() => window.scrollTo(0, 1200));
    await expect(backButton).toBeVisible();
    const after = await backButton.boundingBox();
    expect(after).not.toBeNull();
    expect(Math.abs(after!.y - before!.y)).toBeLessThan(2);
    expect(Math.abs(after!.x - before!.x)).toBeLessThan(2);
  });

  test('mobile: article pages do not gain horizontal overflow from Back controls', async ({
    page,
  }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'Mobile-only layout behavior');

    await page.goto('/posts/typescript-advanced');
    await waitForArticle(page);

    const metrics = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
  });
});

test.describe('Markdown syntax article', () => {
  test('renders the promised syntax examples without page overflow', async ({ page }) => {
    await page.goto('/posts/markdown-syntax-test');
    await waitForArticle(page);

    await expect(page.locator('#post-content h2').first()).toBeVisible();
    await expect(page.locator('#post-content table').first()).toBeVisible();
    await expect(page.locator('#post-content input[type="checkbox"]').first()).toBeVisible();
    await expect(page.locator('#post-content mark').first()).toBeVisible();
    await expect(page.locator('#post-content .katex').first()).toBeVisible();
    await expect(page.locator('#post-content .code-block').first()).toBeVisible();
    await expect(page.locator('#post-content script')).toHaveCount(0);
    await expect(page.locator('#post-content iframe[src*="example.com"]')).toHaveCount(0);
    await expect(page.locator('#post-content a[href^="javascript:"]')).toHaveCount(0);

    const safeExternalLink = page.locator('#post-content a[href="https://github.com"]').last();
    await expect(safeExternalLink).toHaveAttribute('target', '_blank');
    await expect(safeExternalLink).toHaveAttribute('rel', /noopener/);

    const metrics = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
  });
});
