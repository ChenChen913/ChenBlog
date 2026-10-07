# AGENTS.md — ChenBlog 交付给 AI Agent 的部署与开发指南

> 本文档面向**被要求部署、修改或排查本项目的 AI Agent / 自动化工具**（Claude Code、Cursor、Devin、Codex 等）。人类开发者请阅读 [README.md](./README.md)。
>
> 读完本文你应当能：不踩坑地跑起来这个项目、安全地改代码并验证、独立完成一次生产部署。

---

## 1. 项目基本信息

### 1.1 这是什么

**ChenBlog** 是 MaoChen（GitHub: ChenChen913）的个人博客——一个**纯前端、零后端、静态部署**的 SPA 站点，同时也是一套围绕「长期写作 + 沉浸阅读」打磨的博客引擎。

- 仓库：`https://github.com/ChenChen913/ChenBlog`
- 线上形态：Vercel 托管的静态站（`vercel.json` 已配好 SPA 回退、安全头、缓存策略）
- 内容形态：`src/posts/*.md`，文件即文章（frontmatter 元数据 + Markdown 正文），无 CMS、无数据库

### 1.2 项目背景

作者把博客当产品经营，因此项目有两条主线：**内容线**（随时写 Markdown 发文）与**体验线**（中英双语、日夜主题、液态玻璃视觉、专注阅读模式、性能预算）。历史上经历了多轮工程化改造：字体子集化（152MB → 5.2MB）、Shiki 细粒度按需加载（主包 -63%）、路由级代码分割、SEO 全套补齐、预渲染与 RSS/sitemap 管道、专注阅读模式组件族。**改动时请尊重这些既有投入，不要引入让主包膨胀或破坏双主题/双语能力的回退。**

### 1.3 站点能力速览

| 维度     | 现状                                                                                                                                                                                      |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 路由     | `/` 首页（时间轴+分页）· `/posts/:slug` 文章 · `/categories`（`?filter=gem` 精选）· `/weekly` 周刊 · `/about` · `/status/:code` · `/highlights`→301 到 `/categories?filter=gem` · `*` 404 |
| 主题     | 亮/暗双主题，`localStorage['theme-preference']`（`light`/`dark`），index.html 内联脚本首帧前防白闪                                                                                        |
| 语言     | 中/英，`localStorage['lang-preference']`（`zh`/`en`），文案在 `src/i18n/index.ts`                                                                                                         |
| 阅读模式 | `localStorage['reading-mode']`（`standard`/`focus`/`guide`），`?focus=1` URL 直入                                                                                                         |
| 内容分类 | 12 个：tech/life/reading/AI/product/career/finance/travel/food/music/movie/game（`src/config/categories.ts`）                                                                             |

---

## 2. 技术细节

### 2.1 技术栈与版本基线

| 层     | 技术                                                   | 备注                                                                                                  |
| ------ | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| 运行时 | **Node.js ≥ 20**                                       | 构建脚本与 Vite 6 基线，低版本会报语法错                                                              |
| UI     | React 19 · react-router-dom 7 · Tailwind CSS 4         | Tailwind 4 用 `@tailwindcss/vite` 插件，**无 tailwind.config.js**（CSS-first 配置在 `src/index.css`） |
| 动效   | motion（原 framer-motion）12                           | ⚠️ 见 4.6 transform 劫持坑                                                                            |
| 内容   | react-markdown 10 + remark-gfm/math + rehype-katex/raw | rehype-raw 启用，但经过自研安全管道（见 2.4）                                                         |
| 高亮   | Shiki 4，`shiki/core` 细粒度 + 语言动态 import         | JS 正则引擎（无 oniguruma wasm），CSP 因此可收紧                                                      |
| 构建   | Vite 6 + 两个自研插件 + prerender.mjs                  | 见 2.2                                                                                                |
| 测试   | vitest（jsdom）+ Playwright 1.59                       | E2E 双视口（桌面 + 390×844 移动）                                                                     |
| 质量   | ESLint 10 flat config + Prettier 3 + husky/lint-staged | 提交钩子会**原地重写暂存文件**（坑，见 4.1）                                                          |

### 2.2 架构与原理

**数据流（核心设计——改任何内容相关功能前先理解这个）：**

```
构建期（vite 插件，dev 与 build 都生效）
  scripts/posts-index-plugin.ts
    读取 src/posts/*.md
    → gray-matter 解析 frontmatter（引号/数组/日期规范化）
    → 预计算 excerpt / readTime
    → 生成虚拟模块 virtual:posts-index（纯 JS，几 KB）
  scripts/feeds-plugin.ts
    → dist/rss.xml（全文 RSS 2.0）/ sitemap.xml / robots.txt
  scripts/prerender.mjs（build 后）
    → Playwright 逐路由预渲染 dist/<route>/index.html
      （爬虫可直接读正文；浏览器访问时 React 照常接管）

运行时
  列表页（Home/Weekly/Categories）
    → 同步 import virtual:posts-index（零正文流量）
  文章页（Post.tsx）
    → import.meta.glob('../posts/*.md', { eager: false }) 按需加载正文 chunk
    → hover/键盘聚焦预取 + requestIdleCallback 路由预热（route-prefetch.ts）
```

**关键点：**

- 文章 frontmatter 改动的生效链路 = vite watcher 失效虚拟模块 → full-reload。若 dev server 行为异常，先怀疑 transform 缓存（见 4.1）
- `virtual:posts-index` 在浏览器按纯 JS 解析，**不能含 TypeScript 语法**；类型声明在 `src/vite-env.d.ts`
- 单篇 frontmatter 解析失败不会拖垮构建：降级为最小元数据 + 终端 `[posts-index] ⚠️` 告警（`normalizeFrontmatter` 兜底 title/tags/date）

**前端结构：**

```
src/
├── App.tsx              # 路由表 + React.lazy 分割 + 滚动恢复 + 空闲预取
├── context/AppContext   # 主题/语言/阅读模式 全局状态（localStorage 持久化）
├── hooks/               # usePageMeta（SEO）/ useTheme / useLanguage / useReadingMode
├── components/          # 20+ 组件；reading/ 子目录是专注模式组件族
├── utils/               # security.ts（URL 白名单）/ search.ts / weekly.ts / shiki-highlighter.ts 等
└── index.css            # 全局样式：液态玻璃、时间轴、周刊、专注模式 4 套阅读背景主题
```

**专注阅读模式（交互最复杂的子系统）：**

- 入口：文章页「专注阅读」按钮或 `?focus=1`；退出：胶囊 `×` 或 `Esc`（**两条路径都走 `useReadingMode` 的 `onExit` 回调统一触发 toast**——改退出逻辑时不要绕过它）
- 4 套阅读背景：`auto`（跟随站点主题）/ `paper` 纸白 / `sepia` 暖米 / `night` 暖黑，落在 `[data-reading-theme]` 属性上
- 涉及文件：`hooks/useReadingMode.ts`、`components/reading/*`、`index.css` 第 12–14 节（强主题覆盖——**层叠顺序敏感**，见 4.7）

### 2.3 安全体系（改动前必读）

- **URL 安全**（`src/utils/security.ts`）：协议白名单（http/https/mailto/tel），`javascript:`/`data:` 拦截，控制字符剥离（`java\nscript:` 类绕过无效）；YouTube/Bilibili 嵌入只信白名单 host + 视频 ID 正则，重组成受信 embed URL
- **渲染安全**：rehype-raw 开启但组件层对 `img/src`、`a/href`、iframe 全部过安全管道；危险图片降级为 `/article-demo-placeholder.svg`。Markdown 树清洗已抽离为 `src/utils/markdown-sanitize.ts`（rehype 插件，含单测）
- **CSP 与安全头**（`vercel.json`）：`default-src 'self'` + frame-src 白名单（youtube/bilibili/giscus）+ nosniff + XFO + HSTS + Referrer-Policy + Permissions-Policy。`index.html` 的 meta CSP 与部署头保持同源同宽（`connect-src 'self' https: wss:`）。
  - `script-src 'unsafe-inline'` 是首帧防白闪内联脚本的既定取舍：改用 sha256 hash 虽更严，但后续任何对内联脚本的改动忘同步 hash 会静默失效首帧主题，风险大于收益
  - `style-src 'unsafe-inline'` 同为既定取舍（字号控制/KaTeX 尺寸等大量内联 style）
- **npm audit 现状**：gray-matter 构建链存在 sprintf-js moderate（DoS）告警。已 `overrides: sprintf-js@^1.1.3`（最新版，无官方修复版）。**实际攻击面为零**：js-yaml 仅在其 CLI bin 里 require argparse，库 API（gray-matter 所用）完全不触及；且仅构建期处理仓库自有 Markdown。勿试图 `npm audit fix --force`（会降级 gray-matter@2 破坏构建）
- 无任何 secrets 入库；`.env` 均为可选公开配置（站点域名 / giscus）

### 2.4 测试基线

```bash
npm run lint          # tsc --noEmit，必须 0 错误
npm run lint:eslint   # 0 errors / ~60 warnings（测试文件存量 any，渐进治理中，勿新增）
npm run test:run      # vitest，~172 用例必须全绿
npm run test:e2e      # Playwright 83+ 用例（首跑偶发 scroll-restoration 抖动，复跑即可）
npm run build         # build + prerender：末尾输出 16 条路由的预渲染成功/失败计数，
                      # 必须全部成功；产物存在性断言（10 项 test -f / grep -q）
                      # 在 CI 的 Verify build artifacts 步骤（.github/workflows/ci.yml）
```

E2E 依赖三篇**内置测试文章**（勿删）：`markdown-syntax-test.md`（reading-mode/navigation 用例的载体）、`codeblock-stress-test.md`、`test-duplicate-headings.md`；`文章模板.md` 是写作模板。均为 `draft: true`（syntax-test 除外——它需要出现在列表里供 e2e 断言）。

CI（checks job）另有 **CSS 债务预算棘轮**：`src/index.css` 占位注释 ≤57、`!important` ≤50、`z-index` ≤36、总行数 ≤4935，只减不增；偿还债务（拆分/token 化）后应同步下调阈值，确需上调须在 PR 里说明理由。

---

## 3. 部署

### 3.1 本地跑起来（标准流程）

```bash
git clone https://github.com/ChenChen913/ChenBlog.git && cd ChenBlog
npm install                 # Node ≥ 20；首次约 1–2 分钟
npm run dev                 # http://localhost:3000（--host 0.0.0.0 已内置）
```

健康检查：`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` 应返回 `200`；再抽查 `/posts/markdown-syntax-test`。

### 3.2 Vercel（推荐）

1. Vercel → Import Git Repository → 选本仓库
2. 框架自动识别 Vite，**构建命令/输出目录保持默认**（`npm run build` → `dist`）
3. `vercel.json` 已包含 SPA rewrites、安全头、`/assets` 与 `/fonts` 一年 immutable 缓存，无需再配
4. 可选环境变量：`PRERENDER=1`（开启预渲染，构建 +1–2 分钟，需构建机可装 Playwright）；`VITE_SITE_URL`（自定义域时设，否则自动读 Vercel 域名变量）；giscus 四件套（见 `.env.example`）

### 3.3 其他静态托管

`npm run build` 后上传 `dist/`。必须配置 SPA 回退（所有未命中路径 → `/index.html`）；预渲染产物在 `dist/<route>/index.html`，与 SPA 回退共存不冲突。Nginx 参考（**安全头必配**——否则只剩 meta CSP，meta 中 `frame-ancestors` 不生效、XFO 缺席，点击劫持防护整体缺席）：

```nginx
location / {
  try_files $uri $uri/ /index.html;
  add_header X-Content-Type-Options nosniff always;
  add_header X-Frame-Options SAMEORIGIN always;
  add_header Referrer-Policy strict-origin-when-cross-origin always;
  add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://giscus.app; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' https: data: blob:; media-src 'self' https: data: blob:; connect-src 'self' https: wss:; frame-src https://www.youtube.com https://player.bilibili.com https://giscus.app; object-src 'none'; base-uri 'self'; frame-ancestors 'self'" always;
}
location /assets/ { expires 1y; add_header Cache-Control immutable; }
location /fonts/  { expires 1y; add_header Cache-Control immutable; }
```

（与 `vercel.json` 的安全头逐条对齐，改动任何一边时同步另一边。）

### 3.4 交付前自检清单（Agent 必做）

- [ ] 四项测试基线全绿（lint / vitest / e2e / build）
- [ ] 桌面 + 390×844 移动双视口，亮/暗 × 中/英抽查无布局破坏、无 console error
- [ ] 改动专注模式时：4 套阅读背景 × 亮/暗站点的矩阵抽查（暗色站 + paper/sepia 亮背景是历史重灾区）
- [ ] 涉及新汉字内容时：`python3 scripts/font-split.py` 重建字体分片
- [ ] git 提交被 husky 拦截时：先看是不是真违规（eslint error / 格式不符），手动修复后重提，**不要 --no-verify 绕过**

### 3.5 域名与 SEO 元数据机制

`og:url` / `canonical` / `og:image` 的绝对地址由构建期注入：`vite.config.ts` 会把 `VITE_SITE_URL`（缺省时回退 `VERCEL_PROJECT_PRODUCTION_DOMAIN` / `VERCEL_URL`）提前写入环境，`usePageMeta` 与预渲染产物据此生成正式域名 URL，`index.html` 的 og:url 静态兜底值（`/`）也在构建时被替换。**自定义域名上线时只需设置 `VITE_SITE_URL` 重新构建**，无需改代码；自托管且不设该变量时运行时回退 `window.location.origin`（但预渲染产物会带构建兜底域名，建议自托管必须设置）。

---

## 4. 踩坑与避坑指南（历史事故沉淀，按复发率排序）

### 4.1 ⚠️ vite 坏缓存 → 页面 500 / 内容陈旧（复发 3+ 次，头号坑）

**症状**：dev server 起着的时候，任何外部工具（格式化器/lint fix/脚本）**原地重写**源文件，之后文章页 500 或内容不更新。
**根因**：watcher 在文件被外部重写的瞬间读到空/半截 transform 并长期缓存。历史上主要由 husky lint-staged 的 `--fix`/`--write` 触发（复发 3+ 次）。
**已根治**：pre-commit 钩子已改为**只校验、不重写**（eslint + prettier --check），提交动作本身不再改写文件。
**仍需注意**：手动跑 `npm run lint:fix` / `npm run format` 等会写盘的命令时，若 dev server 正在运行，跑完后执行一次三连：

```bash
# 杀掉 dev server → 清缓存 → 重启（标准三连）
pkill -f "vite.*3000" || true
rm -rf node_modules/.vite
npm run dev
```

### 4.2 暗色模式测试方法（测错=白测）

主题由 **localStorage 驱动，不是媒体查询**。`set media dark` 无效！正确姿势：

```js
localStorage.setItem('theme-preference', 'dark');
location.reload();
```

同理语言 `lang-preference`（zh/en）、阅读模式 `reading-mode`。截图验证暗色时先 reload 再截。

### 4.3 预渲染 / E2E 的 Chromium 依赖

- 本地跑 e2e 或 build：先 `npx playwright install chromium`（CI 里 workflow 已装）
- Vercel 默认跳过预渲染（构建机无浏览器）；要开就设 `PRERENDER=1`
- 本地想跳过：`SKIP_PRERENDER=1 npm run build`

### 4.4 字体分片与新汉字

LXGW 楷体按 unicode-range 拆三片（latin/常用/次常用）。新文章用到分片外汉字会**回退系统字体**（观感不一致但不算 bug）。修复：

```bash
pip install fonttools brotli
python3 scripts/font-split.py   # 幂等，可重复执行；源字体在 scripts/font-src/
```

### 4.5 `virtual:posts-index` 的约束

虚拟模块输出 `JSON.stringify(entries)`——浏览器按纯 JS 解析。新增 frontmatter 字段如果含函数/Date 等非 JSON 值会被静默丢弃；Date 已在 `normalizeFrontmatter` 统一转 `YYYY-MM-DD` 字符串。

### 4.6 motion 动画的 transform 劫持

motion 组件上任何 `y`/`scale` 等动画属性会**整体覆盖** CSS 的 `translateX(-50%)` 居中。需要居中+动画时，把居中也交给 motion：`animate={{ x: '-50%', y: 0 }}`。（历史案例：退出 toast 的 CSS 居中被动画覆盖导致水平错位。）

### 4.7 index.css 层叠反转（暗色 + 强阅读主题的样式覆盖）

`.dark .article-body h2 { color: X !important }` 写在 `@layer base` 里时，**important 层间反转**使其优先于 unlayered/ utilities 的 `dark:!text-*`。专注模式的 paper/sepia/night 强主题覆盖必须写在**同一 layer 且更高 specificity**，且要覆盖**子元素**（元素级规则赢过容器继承）。改 `index.css` 第 12–14 节前后务必跑暗色×全背景矩阵。

### 4.8 手机端布局断点

- 专注模式退出后手机底部导航（`mobile-bottomnav`，fixed 67px）回归，toast 等底部浮层要留出 `bottom ≥ 5.25rem`
- 手机端文案必须单行（`white-space: nowrap` + `max-width` 兜底），英文比中文长 25% 左右，双语都要截查

### 4.9 其他小坑

- e2e 首跑偶发 scroll-restoration 抖动：复跑一次再判
- `npm test` 默认 watch 模式，CI/脚本里用 `npm run test:run`
- Shiki 语言 loader 是动态 import：dev server 重启后旧页面会报 `Failed to fetch dynamically imported module`（旧 hash 残留），reload 即愈，非 bug
- 搜索索引打开弹窗时才并行加载（~200KB），相关断言要等 networkidle

### 4.10 index.css 的 G 区兜底与 CSS 债务路线图

- **G 区（文件末尾 `@supports not` 块）**：不支持 backdrop-filter 的浏览器（旧 Android WebView / 老 Firefox）靠它把低透明玻璃提到实色保可读。新增玻璃容器若亮色透明度 ≤0.75 或为暗色白玻璃（0.07–0.16 白），必须同步在 G 区补兜底（头部「新增样式约定」亦有约定）。该块必须保持在文件**最末**（unlayered，靠源顺序压过同特异性原规则），不要往前插、也不要改写块内选择器的写法。
- **债务路线图**（源自外部评审 D1/D7，按评审自身纪律分批执行，勿一次性大爆炸重写）：
  1. 已完成：A–G 分节目录、新增样式约定、CI 预算棘轮、G 区兜底、vendor-react 分包
  2. 待做（上线后分批、每批独立 PR）：index.css 物理拆分为 `src/styles/` 多文件——内容整块原样搬，保持 layer 归属与选择器优先级，每迁一节跑全量验证，拆分前后 CSS 总体积应持平（±2%）；z-index 16 档归并为语义档位——须先逐对验证 Toast / 搜索弹窗 / Lightbox / 专注工具栏 / TOC 的叠放关系，档位映射不得改变现有实际层级
  3. 随后：`@layer base` 内 !important 偿还（同层提高 specificity 替代，**不可**叠加新 important 对冲——4.7 的层间反转教训）；约 250 处硬编码色 token 化
- **vendor 分包**：`vite.config.ts` 用对象式 `manualChunks` 精确列 react / react-dom / react-router-dom 三件套；**严禁**改成函数式 `id.includes('react')` 粗匹配——会把 react-markdown 渲染链（约 500KB）吸进 vendor chunk，反伤首屏。shiki / katex 已按需分包不归并，motion 跨组件共享留在默认分包。

---

## 5. 快速任务手册

**加一篇文章**：`src/posts/` 新建 md（frontmatter 模板见 `src/posts/文章模板.md`）→ 有新汉字跑 font-split → 完成。

**改文案/加 i18n key**：`src/i18n/index.ts` 的 zh/en **两个语言块都要加**，漏一边英文界面会显示 key 原文。

**改路由**：`src/App.tsx` 路由表 + `scripts/prerender.mjs` 的路由清单 + `tests/e2e` 相应用例，三处同步。

**改安全策略**：`src/utils/security.ts` + `src/utils/markdown-sanitize.ts`（及各自单测）+ `vercel.json` CSP + `index.html` meta CSP + AGENTS.md 3.3 Nginx 示例是一套，改任何一处同步其余并跑 `npx vitest run src/utils/security.test.ts src/utils/markdown-sanitize.test.ts`。

**提交代码**：`git add` 后 husky 只校验不改写（eslint error / 格式不符会拦截）。被拦时手动 `npm run lint:fix` / `npm run format`，修完重新 add，**不要 --no-verify 绕过**；若当时 dev server 在跑，格式化后记得执行 4.1 的三连。
