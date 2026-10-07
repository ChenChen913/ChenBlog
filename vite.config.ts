import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { postsIndexPlugin } from './scripts/posts-index-plugin';
import { feedsPlugin, DEFAULT_SITE_URL } from './scripts/feeds-plugin';

/**
 * 生产域名归一化（与 scripts/feeds-plugin.ts 的 resolveSiteUrl 同一优先级链）：
 *   VITE_SITE_URL > VERCEL_PROJECT_PRODUCTION_DOMAIN > VERCEL_URL > （仅构建）兜底域名
 * 在任何插件/客户端代码读取之前写入 VITE_SITE_URL，让 usePageMeta 通过
 * import.meta.env 拿到绝对地址——否则预渲染产物会把预览服务器地址
 * （http://localhost:4173）烘进 og:url / canonical，污染搜索引擎收录。
 * dev（serve）不落兜底：保持 window.location 回退，方便本地调试。
 */
function normalizeSiteUrlEnv(command: 'serve' | 'build'): void {
  const fromEnv =
    process.env.VITE_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_DOMAIN ||
    process.env.VERCEL_URL;
  if (fromEnv && !process.env.VITE_SITE_URL) {
    const normalized = fromEnv.startsWith('http') ? fromEnv : `https://${fromEnv}`;
    process.env.VITE_SITE_URL = normalized.replace(/\/+$/, '');
  }
  if (command === 'build' && !process.env.VITE_SITE_URL) {
    console.warn(
      `[vite.config] ⚠️ 未检测到站点域名环境变量，og:url/canonical 使用兜底域名 ${DEFAULT_SITE_URL}（与 feeds 行为一致）`
    );
    process.env.VITE_SITE_URL = DEFAULT_SITE_URL;
  }
}

/**
 * 构建期把 index.html 的 og:url 静态兜底值（"/"）替换为正式域名。
 * 静态值服务于不执行 JS 的分享爬虫；dev 未设域名时保持 "/"。
 */
function ogUrlFallbackPlugin(): Plugin {
  return {
    name: 'chenblog:og-url-fallback',
    transformIndexHtml(html) {
      const siteUrl = process.env.VITE_SITE_URL;
      if (!siteUrl) {
        return html;
      }
      return html.replace(/(<meta\s+property="og:url"\s+content=")\/("\s*\/>)/, `$1${siteUrl}/$2`);
    },
  };
}

export default defineConfig(({ command }) => {
  normalizeSiteUrlEnv(command);

  return {
    plugins: [postsIndexPlugin(), feedsPlugin(), ogUrlFallbackPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // vendor 分包：框架三件套独立成 chunk，业务代码迭代不再使回访用户
          // 的框架缓存失效。⚠ 必须用对象式精确列包——函数式 id.includes('react')
          // 会把 react-markdown 渲染链（约 500KB）吸进 vendor，反伤首屏；
          // shiki / katex 已按需分包不归并，motion 跨组件共享留在默认分包
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
    server: {
      port: 3000,
      host: true,
      strictPort: true,
      allowedHosts: true,
    },
  };
});
