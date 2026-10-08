/**
 * 构建后预渲染（SSG-lite）
 * ------------------------------------------------------------------
 * 1. vite build 产出 SPA 产物后，启动 vite preview + 无头浏览器逐路由
 *    访问，等待应用渲染完成（含异步正文 chunk、字体、SEO meta 更新），
 *    将完整 DOM 快照写为 dist/<route>/index.html。
 * 2. 效果：爬虫/禁 JS 环境直接读到正文与路由级 meta（Baidu 等对
 *    CSR 支持差的引擎友好）；正常用户访问时 createRoot 照常接管，
 *    行为与纯 SPA 完全一致（非 hydration，无水合不匹配风险）。
 * 3. Vercel 默认跳过（构建机无浏览器，避免每次构建下载 120MB），
 *    设置 PRERENDER=1 开启；本地与 CI 默认启用。
 *    SKIP_PRERENDER=1 可强制跳过。
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
// Windows 下 file:///D:/... 的 .pathname 是 "/D:/..."，直接拼接会得到
// "D:\D:\..." 的错误路径；必须用 fileURLToPath 转成真实盘符路径
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;

const require = createRequire(import.meta.url);

function log(msg) {
  console.log(`[prerender] ${msg}`);
}

/** 读取公开文章路由（草稿/未发布不预渲染） */
function getRoutes() {
  const matter = require('gray-matter');
  const postsDir = path.join(ROOT, 'src/posts');
  const routes = ['/', '/categories', '/weekly', '/about'];

  for (const file of fs.readdirSync(postsDir)) {
    if (!file.endsWith('.md')) continue;
    try {
      const { data } = matter(fs.readFileSync(path.join(postsDir, file), 'utf-8'));
      if (data.draft === true || data.published === false) continue;
      routes.push(`/posts/${file.replace(/\.md$/, '')}`);
    } catch (err) {
      log(`⚠️ 跳过无法解析的文章 ${file}: ${err.message}`);
    }
  }
  return routes;
}

function waitForServer(url, timeoutMs = 30000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const poll = () => {
      http
        .get(url, res => {
          res.resume();
          resolve();
        })
        .on('error', () => {
          if (Date.now() - started > timeoutMs) {
            reject(new Error(`preview server 启动超时: ${url}`));
          } else {
            setTimeout(poll, 400);
          }
        });
    };
    poll();
  });
}

async function main() {
  if (process.env.SKIP_PRERENDER === '1') {
    log('SKIP_PRERENDER=1，跳过预渲染');
    return;
  }
  if (process.env.VERCEL && process.env.PRERENDER !== '1') {
    log('Vercel 环境默认跳过（如需开启请在项目环境变量中设置 PRERENDER=1）');
    return;
  }
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    log('dist/index.html 不存在，请先执行 vite build');
    process.exit(1);
  }

  // 浏览器可用性探测（本地/CI 已装则直接用，否则给出可操作提示）
  let chromium;
  try {
    ({ chromium } = require('@playwright/test'));
    const probe = await chromium.launch({ args: ['--no-sandbox'] });
    await probe.close();
  } catch (err) {
    log(`⚠️ 无头浏览器不可用，跳过预渲染（${err.message.split('\n')[0]}）`);
    log('   本地启用：npx playwright install chromium');
    return;
  }

  const routes = getRoutes();
  log(`待预渲染路由 ${routes.length} 条`);

  // 启动 preview 服务器
  // 不经 npx/shell，直接用当前 node 可执行文件运行 vite 的 bin 入口：
  //  - Windows 下 npx 是 .cmd 批处理，Node 出于安全（CVE-2024-27980）禁止
  //    无 shell 直接 spawn，而 shell 包装又有参数转义告警（DEP0190）；
  //  - process.execPath 是 node 本体，跨平台可直接 spawn，且直接子进程
  //    就是 vite preview 进程，stopServer 常规 kill 即可生效。
  const viteBin = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
  const preview = spawn(process.execPath, [viteBin, 'preview', `--port=${PORT}`, '--strictPort'], {
    cwd: ROOT,
    stdio: 'ignore',
    detached: false,
  });

  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  let rendered = 0;
  let failed = 0;

  try {
    await waitForServer(BASE_URL);
    log(`preview 服务器就绪: ${BASE_URL}`);

    for (const route of routes) {
      const page = await browser.newPage({
        viewport: { width: 1280, height: 900 },
      });
      try {
        const url = BASE_URL + route;
        await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });

        // 等待 React 应用挂载完成
        await page.waitForFunction(() => document.querySelector('#root')?.children.length > 0, {
          timeout: 20000,
        });

        // 文章页：等待异步正文 chunk 渲染（骨架屏消失）
        if (route.startsWith('/posts/')) {
          await page
            .waitForSelector('#post-content #post-content-skeleton', {
              state: 'detached',
              timeout: 20000,
            })
            .catch(() => log(`⚠️ ${route} 骨架屏未按期消失`));
        }

        // 等待字体与入场动效落定，确保快照为最终形态
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(900);

        const html = await page.content();
        const outFile =
          route === '/'
            ? path.join(DIST, 'index.html')
            : path.join(DIST, route.replace(/^\//, ''), 'index.html');
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
        fs.writeFileSync(outFile, html);
        rendered++;
        log(
          `✓ ${route} -> ${path.relative(DIST, outFile)} (${(html.length / 1024).toFixed(0)} KB)`
        );
      } catch (err) {
        failed++;
        log(`✗ ${route}: ${err.message.split('\n')[0]}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close().catch(() => {});
    await stopServer(preview);
  }

  log(`完成：成功 ${rendered} / 失败 ${failed} / 共 ${routes.length}`);
  if (failed > 0) {
    process.exitCode = 1;
  }
}

/** 确保子进程（及其子孙进程）彻底退出，避免句柄悬挂阻塞 node 退出 */
function stopServer(server, graceMs = 3000) {
  return new Promise(resolve => {
    if (server.exitCode !== null || server.killed) {
      resolve();
      return;
    }
    const forceKill = setTimeout(() => {
      try {
        server.kill('SIGKILL');
      } catch {}
      resolve();
    }, graceMs);
    server.once('exit', () => {
      clearTimeout(forceKill);
      resolve();
    });
    try {
      server.kill('SIGTERM');
    } catch {}
  });
}

main().catch(err => {
  console.error('[prerender] 执行失败:', err);
  process.exit(1);
});
