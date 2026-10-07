// reduced-motion 行为验证脚本（D3 验收）：
// 1. 模拟系统「减少动态效果」打开：专注模式进出、toast 出现应瞬时到位（无位移动画）
// 2. toast 水平定位必须仍居中（motion x:'-50%' 不受 reducedMotion 影响）
// 3. 全程无 console error
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3000';
const results = [];

async function check(name, fn) {
  try {
    await fn();
    results.push(`PASS ${name}`);
  } catch (err) {
    results.push(`FAIL ${name}: ${err.message.split('\n')[0]}`);
  }
}

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => {
  if (m.type() === 'error') errors.push(m.text());
});

await page.goto(`${BASE}/posts/markdown-syntax-test`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

await check('页面在 reduce 模式下正常渲染', async () => {
  if (!(await page.locator('h1').first().isVisible())) throw new Error('h1 不可见');
});

// 进入专注模式：工具胶囊应立即就位（瞬时）
await check('进入专注模式（瞬时）', async () => {
  await page
    .getByRole('button', { name: /专注阅读|Focus Reading/ })
    .first()
    .click();
  await page.waitForSelector('.reading-capsule', { timeout: 5000 });
  await page.waitForTimeout(250);
  const box = await page.locator('.reading-capsule').boundingBox();
  if (!box) throw new Error('胶囊不存在');
  const centered = Math.abs(box.x + box.width / 2 - 720);
  if (centered > 30) throw new Error(`胶囊水平偏差 ${centered.toFixed(0)}px`);
});

// 叉号退出：toast 应立即出现且水平居中
await check('退出 toast（瞬时+水平居中）', async () => {
  await page
    .locator('.reading-capsule [aria-label*="xit" i], .reading-capsule button')
    .last()
    .click();
  await page
    .waitForSelector('[class*="exit-toast"], [role="status"]', { timeout: 3000 })
    .catch(() => {});
  const toast = page.locator('body > [class*="toast" i]').first();
  const visible = await toast.isVisible().catch(() => false);
  if (!visible) throw new Error('toast 不可见（瞬时出现应立即可见）');
  const box = await toast.boundingBox();
  if (!box) throw new Error('toast 无 bbox');
  const centered = Math.abs(box.x + box.width / 2 - 720);
  if (centered > 40)
    throw new Error(`toast 水平偏差 ${centered.toFixed(0)}px（MotionConfig x:-50% 定位失效？）`);
  await page.waitForTimeout(1400); // 等 1s 生命周期结束
});

// ESC 路径同样验证
await check('ESC 退出 toast（瞬时+水平居中）', async () => {
  await page
    .getByRole('button', { name: /专注阅读|Focus Reading/ })
    .first()
    .click();
  await page.waitForSelector('.reading-capsule', { timeout: 5000 });
  await page.keyboard.press('Escape');
  const toast = page.locator('body > [class*="toast" i]').first();
  const visible = await toast.isVisible().catch(() => false);
  if (!visible) throw new Error('toast 不可见');
  const box = await toast.boundingBox();
  const centered = Math.abs(box.x + box.width / 2 - 720);
  if (centered > 40) throw new Error(`toast 水平偏差 ${centered.toFixed(0)}px`);
});

// 搜索弹窗在 reduce 模式下也应立即可见且居中
await check('搜索弹窗（瞬时+可用）', async () => {
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(300);
  const input = page.locator('[role="dialog"] input, input[type="search"]').first();
  if (!(await input.isVisible())) throw new Error('搜索输入框不可见');
  await page.keyboard.press('Escape');
});

await check('无 console/page 错误', async () => {
  if (errors.length) throw new Error(errors.slice(0, 3).join(' | '));
});

await browser.close();
console.log(results.join('\n'));
process.exit(results.some(r => r.startsWith('FAIL')) ? 1 : 0);
