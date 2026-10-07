# ChenBlog — MaoChen 的个人博客

![CI](https://github.com/ChenChen913/ChenBlog/actions/workflows/ci.yml/badge.svg)

一个**为「长期写作」而生的个人博客系统**：中英双语、日夜双主题、手机/桌面自适应，内置一套完整的沉浸式阅读体验。基于 React 19 + TypeScript + Vite 6 + Tailwind CSS 4 构建，纯前端静态部署，开箱即用。

> 📖 **给 AI Agent / 自动化部署？** 请直接阅读 [AGENTS.md](./AGENTS.md)——包含项目全貌、架构原理与踩坑避坑清单。

## 这个项目是做什么的

这是 MaoChen 的个人数字花园：记录技术学习、读书笔记与生活思考，并把它当成一个**持续经营的产品**来打磨——不只是"能发文"，而是围绕阅读体验做了大量工程化投入：

- **写作者视角**：文章就是一个个 Markdown 文件（`src/posts/*.md`），带 frontmatter 元数据，保存即生效；草稿、精选、周刊三种组织形态自由组合
- **读者视角**：站内搜索（⌘K）、目录导航、阅读进度、字号调节、图片放大、代码一键复制、数学公式、视频嵌入……长文还有完整的「专注阅读模式」（段落聚焦、行标尺、背景切换、进度记忆）
- **工程视角**：路由级代码分割、文章元数据与正文双通道加载、字体 unicode-range 分片、构建期预渲染、CI 三阶段门禁（类型+单测 → 构建 → E2E 双视口）

### 功能特性总览

| 领域 | 特性                                                                                                                               |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 内容 | Markdown 写作 · frontmatter 元数据 · 草稿 · 精选（时间轴金色菱形）· 周刊页（ISO 周历条 + 周分组）· 标签 · 12 个分类                |
| 阅读 | 专注/引导双预设模式 · 段落聚焦 · 行标尺 · 字号/行高/页宽/背景四维调节 · 分节目录 scroll-spy · 阅读位置记忆 · 节奏提醒              |
| 排版 | Shiki 代码高亮（40+ 语言按需加载、行号、复制）· KaTeX 数学公式 · 表格 · 任务列表 · 图片 Lightbox · YouTube/Bilibili 嵌入           |
| 站点 | 中英双语（一键切换）· 亮暗双主题（无白闪）· 站内搜索（⌘K 全文索引）· RSS / sitemap / robots 自动生成 · SEO meta / JSON-LD / 预渲染 |
| 视觉 | 液态玻璃质感（backdrop-filter）· Motion 动效 · 光影层次 · 手机底部导航 · 离线提示 · 无障碍（skip-link / aria / 键盘导航）          |
| 工程 | TypeScript 全覆盖 · ESLint + Prettier + husky 门禁 · vitest 单测 · Playwright E2E（桌面+移动双视口）· GitHub Actions CI            |

## 快速开始（详细安装）

### 环境要求

| 依赖                          | 版本                          | 说明                                                                    |
| ----------------------------- | ----------------------------- | ----------------------------------------------------------------------- |
| Node.js                       | **≥ 20**（推荐 20 LTS / 22+） | 构建脚本与 Vite 6 的基线                                                |
| npm                           | ≥ 10（随 Node 附带）          | 也可换 pnpm/yarn，但 lockfile 是 `package-lock.json`                    |
| Python 3 + fontTools + brotli | 可选                          | 仅在**新增文章引入新汉字**后需要重建字体分片（见[性能设计](#性能设计)） |
| Playwright Chromium           | 可选                          | 仅在需要跑 E2E / 预渲染时：`npx playwright install chromium`            |

### 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/ChenChen913/ChenBlog.git
cd ChenBlog

# 2. 安装依赖（首次约 1–2 分钟）
npm install

# 3. 启动开发服务器（默认端口 3000，--host 已含局域网访问）
npm run dev

# 4. 打开浏览器访问
#    http://localhost:3000
```

常用开发命令：

```bash
npm run dev          # 开发服务器（热更新）
npm run lint         # TypeScript 类型检查（tsc --noEmit）
npm run lint:eslint  # ESLint 检查
npm run test         # vitest 单测（watch 模式）
npm run test:run     # vitest 单测（单次）
npm run test:e2e     # Playwright E2E（需先装 Chromium）
npm run build        # 生产构建 + 预渲染 + RSS/sitemap/robots
npm run build:spa    # 纯 SPA 构建（跳过预渲染）
npm run preview      # 本地预览 dist 产物
```

### 环境变量（全部可选）

复制 `.env.example` 为 `.env` 按需填写：

| 变量                      | 作用                                                                                                            |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `VITE_SITE_URL`           | RSS/sitemap/robots 中的绝对链接域名；**Vercel 部署会自动读取 `VERCEL_PROJECT_PRODUCTION_DOMAIN`，通常无需设置** |
| `VITE_GISCUS_REPO`        | giscus 评论仓（如 `ChenChen913/ChenBlog`），**四项全配才渲染评论区**                                            |
| `VITE_GISCUS_REPO_ID`     | 到 [giscus.app](https://giscus.app) 配置工具获取                                                                |
| `VITE_GISCUS_CATEGORY`    | Discussions 分类名                                                                                              |
| `VITE_GISCUS_CATEGORY_ID` | 同上                                                                                                            |

### 部署到 Vercel（推荐，零配置）

1. Fork 或推送到你的 GitHub 仓库
2. [vercel.com](https://vercel.com) → Add New Project → 导入该仓库
3. 框架预设自动识别为 Vite，**无需改任何构建配置**，直接 Deploy
4. （可选）想启用 giscus 评论 / 预渲染时，在 Project → Settings → Environment Variables 里添加对应变量；预渲染需设 `PRERENDER=1`（构建机无浏览器，默认跳过）

静态产物也可部署到任意静态托管（Netlify / Cloudflare Pages / GitHub Pages / Nginx）：`npm run build` 后把 `dist/` 目录上传即可，SPA 路由回退规则参照 `vercel.json` 的 `rewrites`。

## 内容管理

### 新建文章

在 `src/posts/` 下新建 `.md` 文件（文件名即 URL slug，建议英文短横线命名）：

```markdown
---
title: '文章标题'
title_en: 'Article Title' # 可选，英文标题（英文界面显示）
date: '2025-01-15'
category: 'tech' # 12 个分类见下表
tags: ['React', 'TypeScript']
featured: false # 可选，精选（时间轴金色菱形轴点）
weekly: false # 可选，进入 /weekly 周刊页
draft: false # 可选，草稿
coverImage: 'https://...' # 可选，封面图片
---

这里是摘要，会显示在列表页。

<!-- more -->

正文从这里开始……
```

### Frontmatter 字段说明

| 字段         | 必填 | 类型     | 说明                                                                                                                                                                                         |
| ------------ | ---- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`      | ✅   | string   | 文章标题                                                                                                                                                                                     |
| `title_en`   | ❌   | string   | 英文标题（英文界面显示，缺省回退中文）                                                                                                                                                       |
| `date`       | ✅   | string   | 发布日期 `YYYY-MM-DD`                                                                                                                                                                        |
| `category`   | ✅   | string   | 分类（12 个）：`tech` 技术 · `life` 生活 · `reading` 读书 · `AI` · `product` 产品 · `career` 职场 · `finance` 理财 · `travel` 旅行 · `food` 美食 · `music` 音乐 · `movie` 电影 · `game` 游戏 |
| `tags`       | ✅   | string[] | 标签数组（**注意用 YAML 数组写法 `['a', 'b']` 或 `[a, b]`**）                                                                                                                                |
| `featured`   | ❌   | boolean  | 精选文章：时间轴金色菱形轴点，分类页可 ◆ 过滤                                                                                                                                                |
| `weekly`     | ❌   | boolean  | 周刊文章：进入 /weekly，与首页时间轴混排无标识                                                                                                                                               |
| `draft`      | ❌   | boolean  | 草稿：不出现在任何列表，但可直接访问 URL 查看                                                                                                                                                |
| `coverImage` | ❌   | string   | 封面图片 URL                                                                                                                                                                                 |

> ⚠️ frontmatter 由构建期 gray-matter（js-yaml）解析。含冒号/引号的标题请加引号；`tags` 写错会在终端看到 `[posts-index] ⚠️ 解析失败` 告警并按无元数据降级。

### Markdown 支持

- 基础格式：加粗、斜体、删除线、行内代码、`==高亮==`
- 标题：h2/h3 自动生成目录（点击跳转、滚动联动高亮）
- 列表：有序、无序、任务列表
- 代码块：Shiki 语法高亮、行号、复制按钮、40+ 语言按需加载、日夜双主题配色
- 数学公式：行内 `$...$`，块级 `$$...$$`（KaTeX）
- 表格、图片（点击放大 Lightbox）、音频、YouTube/Bilibili 视频嵌入
- 阅读增强：字号三档调节（记忆偏好）、顶部阅读进度条

### 站内搜索

快捷键 `⌘K` / `Ctrl+K`，或侧栏/顶栏搜索入口。标题、标签、分类、摘要即时可搜；打开后自动并行加载全文索引（~200KB）。权重排序 + 命中词高亮 + 键盘导航（↑↓ 选择、Enter 打开、Esc 关闭）。

### 专注阅读模式（Focus Reading）

文章页头部「专注阅读」按钮进入，`Esc` 或胶囊 `×` 退出（两种退出方式都会弹轻提示）：

- **三个预设档位**：标准（正常站点）/ 专注（隐藏侧栏、顶栏、页脚、推荐与评论，正文收窄居中）/ 引导（专注 + 注意力引导）
- **段落聚焦**（引导模式默认）：当前阅读带内的段落全不透明，上下段落降至 38% 透明度；代码块与公式永不参与变暗
- **行标尺**（引导模式进阶）：柔和高亮带锁定当前行，桌面跟随鼠标、触屏锚定视口 30% 处
- **阅读调节面板**：字号 4 档 / 行高 3 档 / 页宽 3 档 / 背景 4 选（跟随主题、纸白、暖米、暖黑）
- **进度与剩余时长**：顶部进度条 + 胶囊内「约 N 分钟」实时估计
- **分节导航**：玻璃浮层目录，scroll-spy 联动高亮当前小节
- **Bionic 英文锚定**（默认关）、**节奏提醒**（默认关，每 15 分钟）、**阅读位置记忆**（回来提示「继续上次阅读 · N%」）
- **可分享链接**：`?focus=1` 直接进入；偏好持久化到 localStorage

## 性能设计

- **文章数据双通道**：列表页只读构建期轻量元数据索引（`virtual:posts-index`，几 KB）；正文按需加载独立 chunk，首页零正文流量
- **hover 预取 + 路由预热**：卡片与上/下篇链接 hover / 键盘聚焦时预取正文 chunk；空闲时段自动预热主要路由，首次点击即达；省流模式与 slow-2g 自动跳过
- **字体 unicode-range 分片**：LXGW 楷体拆为 latin(60KB) / 常用字(881KB) / 次常用字(4.4MB) 三片，文章页典型流量 5.1MB → 941KB。**新增文章引入新字后运行 `python3 scripts/font-split.py` 重建**（需 fontTools + brotli，源字体在 `scripts/font-src/`）
- **路由级代码分割**：非首屏页面与 Shiki 语法包均按需加载
- **高亮零 wasm**：Shiki 使用 JavaScript 正则引擎，CSP 因此得以收紧
- **暗色首帧引导**：index.html 内联脚本首帧前同步主题，消除暗色用户白闪

## 项目结构

```
├── scripts/
│   ├── posts-index-plugin.ts   # 构建期文章元数据索引（virtual:posts-index）
│   ├── feeds-plugin.ts         # RSS / sitemap / robots 生成
│   ├── prerender.mjs           # 构建后预渲染
│   └── font-split.py           # 字体 unicode-range 分片（可重复执行）
├── src/
│   ├── components/             # 组件
│   │   ├── Layout.tsx          #   页面布局
│   │   ├── SideBar.tsx         #   侧边栏（导航/搜索/社交）
│   │   ├── TopNav.tsx          #   手机顶部导航
│   │   ├── MobileBottomBar.tsx #   手机底部导航
│   │   ├── PostTimeline.tsx    #   首页时间轴
│   │   ├── PostCard.tsx        #   文章卡片
│   │   ├── PostNavigation.tsx  #   上一篇/下一篇
│   │   ├── RelatedPosts.tsx    #   相关推荐
│   │   ├── WeeklyNavigation.tsx#   周刊上周/下周互链
│   │   ├── TableOfContents.tsx #   文章目录（滚动联动）
│   │   ├── CodeBlock.tsx       #   代码块（Shiki/行号/复制）
│   │   ├── SearchDialog.tsx    #   搜索弹窗（⌘K）
│   │   ├── ReadingProgress.tsx #   阅读进度条
│   │   ├── ArticleFontSizeControl.tsx # 字号控制
│   │   ├── Lightbox.tsx        #   图片放大
│   │   ├── FloatingActions.tsx #   浮动操作
│   │   ├── ScrollToTop.tsx     #   回到顶部
│   │   ├── SkipLink.tsx        #   无障碍跳转
│   │   ├── NetworkStatusBanner.tsx # 离线提示
│   │   ├── ErrorBoundary.tsx   #   渲染错误边界
│   │   ├── StatusView.tsx      #   状态视图（404/错误）
│   │   ├── JsonLd.tsx          #   JSON-LD 结构化数据
│   │   ├── Comments.tsx        #   giscus 评论（env 门控）
│   │   ├── Footer.tsx          #   页脚
│   │   └── reading/            #   专注阅读模式组件族
│   ├── pages/                  # Home / Weekly / Categories / Post / About / NotFound / StatusPage
│   ├── context/                # AppContext（主题/语言/阅读模式）
│   ├── hooks/                  # usePageMeta / useTheme / useLanguage / useReadingMode 等
│   ├── i18n/                   # 中英文案
│   ├── posts/                  # Markdown 文章（内容即数据）
│   ├── utils/                  # search / weekly / route-prefetch / security 等
│   ├── index.css               # 样式入口（@import 串联）
│   └── styles/                 # 按功能区块拆分：tokens（色彩 token 表）/ base /
│                               # code-block / article / components / overlays /
│                               # timeline / reading / fallback
├── tests/e2e/                  # Playwright 用例（桌面+移动双视口）
├── .github/workflows/ci.yml    # CI：Lint&Unit → Build → E2E
├── vercel.json                 # Vercel 配置（SPA 回退 + 安全头 + 缓存）
└── .env.example                # 环境变量示例
```

## 技术栈

| 层   | 技术                                                                                                              |
| ---- | ----------------------------------------------------------------------------------------------------------------- |
| UI   | React 19 · Tailwind CSS 4 · Motion（动效）· lucide-react（图标）                                                  |
| 语言 | TypeScript（全覆盖）                                                                                              |
| 构建 | Vite 6 · @vitejs/plugin-react · 自研 posts-index / feeds 插件                                                     |
| 内容 | react-markdown · remark-gfm / remark-math · rehype-katex / rehype-raw · gray-matter（构建期）· marked（RSS 摘要） |
| 高亮 | Shiki 4（JS 正则引擎，零 wasm，语言按需动态 import）                                                              |
| 质量 | ESLint 10 + Prettier 3 + husky/lint-staged · vitest（单测）· Playwright（E2E + 预渲染）                           |

## 代码规范与 CI

- **ESLint**（flat config）：三环境分区 + react-hooks 依赖检查，error 级拦截
- **Prettier**：单引号 / 分号 / printWidth 100，文章目录已豁免
- **husky + lint-staged**：提交暂存文件自动 eslint --fix + prettier，违规提交被拦截
- **CI**（推 main 或 PR 触发）：
  1. **Lint & Unit**：tsc + ESLint 门禁 + vitest 单测
  2. **Build & Prerender**：完整构建 + 产物存在性断言
  3. **E2E**：Playwright 桌面 + 移动双视口全量用例，失败自动上传报告

## 常见问题

<details>
<summary><b>文章改了但页面内容没变 / 出现 500？</b></summary>

dev server 偶发坏缓存（多由外部工具在 dev server 运行时原地重写源文件触发，如格式化器）。解决：停掉 dev server → 删 `node_modules/.vite` → 重启 `npm run dev`。提交钩子已改为只校验不重写，正常提交不会再触发此问题；手动跑 `npm run format` / `npm run lint:fix` 后若 dev server 正在运行，建议重启一次。
</details>

<details>
<summary><b>构建时报 Playwright / Chromium 相关错误？</b></summary>

预渲染依赖 Chromium：本地执行 `npx playwright install chromium`；或在 Vercel 上设置 `PRERENDER=1`（构建机默认跳过预渲染）、本地 `SKIP_PRERENDER=1` 强制跳过。
</details>

<details>
<summary><b>新文章里的部分汉字显示成兜底字体？</b></summary>

新字不在现有字体分片内：运行 `python3 scripts/font-split.py` 重建（需要 `pip install fonttools brotli`）。
</details>

<details>
<summary><b>评论区不显示？</b></summary>

giscus 四个环境变量（REPO / REPO_ID / CATEGORY / CATEGORY_ID）缺一不可；仓库需先开启 Discussions。详见 `.env.example`。
</details>

更完整的部署细节、架构原理与踩坑清单，见 [AGENTS.md](./AGENTS.md)。

## License

博客源代码仅供学习参考；文章内容（`src/posts/`）版权归作者所有。
