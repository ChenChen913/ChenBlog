# 个人博客

一个基于 React + TypeScript + Vite + Tailwind CSS 构建的个人博客系统。

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看博客。

## 内容管理

### 新建文章

在 `src/posts/` 目录下创建 `.md` 文件：

```markdown
---
title: '文章标题'
title_en: 'Article Title' # 可选，英文标题
date: '2025-01-15'
category: 'tech' # tech | life | reading | product
tags: ['React', 'TypeScript']
featured: false # 可选，精选（时间轴上的金色菱形轴点）
weekly: false # 可选，周刊文章（进入 /weekly 周刊页）
draft: false # 可选，是否草稿
coverImage: 'https://...' # 可选，封面图片
---

文章正文...
```

### Frontmatter 字段说明

| 字段         | 必填 | 类型     | 说明                                        |
| ------------ | ---- | -------- | ------------------------------------------- |
| `title`      | ✅   | string   | 文章标题（中文）                            |
| `title_en`   | ❌   | string   | 文章标题（英文）                            |
| `date`       | ✅   | string   | 发布日期，格式 `YYYY-MM-DD`                 |
| `category`   | ✅   | string   | 分类：`tech` / `life` / `reading` / `product` |
| `tags`       | ✅   | string[] | 标签数组                                    |
| `featured`   | ❌   | boolean  | 精选文章：时间轴上显示为金色菱形轴点，分类页可 ◆ 过滤 |
| `weekly`     | ❌   | boolean  | 周刊文章：进入 /weekly 周刊页，与首页混排无标识 |
| `draft`      | ❌   | boolean  | 是否草稿（草稿不会在列表显示）              |
| `coverImage` | ❌   | string   | 封面图片 URL                                |

### 草稿功能

设置 `draft: true` 的文章：

- 不会出现在首页、周刊页、分类页
- 可以通过直接访问 URL 查看
- 访问草稿时会显示提示信息

### 周刊（/weekly）

写作 `weekly: true` 的文章会进入独立的周刊页：

- 顶部是一条 28px 高的周历条（52/53 格），着色格代表已发文的周，可点击跳转到对应周分组；滚动时周历条吸顶固定，当前浏览的周自动高亮联动；跨年内容可按年份切换
- 下方按 ISO 8601 周号分组：一周一篇直达文章，多篇则显示周组头（日期区间 + 周序），空周不渲染
- 周刊文章同时也在首页时间轴混排，无任何额外标识
- 文章页底部有上一周 / 下一周互链
- 主题自动切换：北京时间 20:00–06:00 暗色，其余亮色；手动切换优先

### Markdown 支持

- 基础格式：加粗、斜体、删除线、行内代码、`==高亮==`
- 标题：h2、h3 会自动生成目录（点击跳转、滚动联动高亮）
- 列表：有序、无序、任务列表
- 代码块：Shiki 语法高亮、行号、复制按钮、40+ 语言按需加载
- 阅读字号：文章页支持“小 / 标准 / 大”三档调节，并会记住用户偏好
- 阅读进度条：文章页顶部渐变细条实时反馈阅读位置
- 数学公式：行内 `$...$`，块级 `$$...$$`（KaTeX）
- 表格
- 图片：支持点击放大
- 视频：支持 YouTube、Bilibili 嵌入
- 音频

### 站内搜索

- 快捷键 `⌘K` / `Ctrl+K`，或点击侧栏/顶栏搜索入口
- 标题、标签、分类、摘要即时可搜；打开后自动并行加载全文索引（~200KB）
- 权重排序 + 命中词高亮 + 键盘导航（↑↓ 选择、Enter 打开、Esc 关闭）

### 专注阅读模式（Focus Reading）

为长文阅读提供的沉浸式体验（文章页头部「专注阅读」按钮进入，`Esc` 或胶囊 `×` 退出）：

- **三个预设档位**：标准（正常站点）/ 专注（隐藏侧栏、顶栏、页脚、推荐与评论，正文收窄居中）/ 引导（专注 + 注意力引导）
- **段落聚焦**（引导模式默认）：当前阅读带内的段落全不透明，上下段落降至 38% 透明度，滚动平滑过渡；代码块与公式永不参与变暗
- **行标尺**（引导模式进阶）：柔和高亮带锁定当前行，桌面跟随鼠标、触屏锚定视口 30% 处
- **阅读调节面板**：字号 4 档 / 行高 3 档 / 页宽 3 档 / 背景 4 选（跟随主题、纸白、暖米、暖黑——夜间用暖深灰而非纯黑，避免光晕）
- **进度与剩余时长**：顶部进度条 + 胶囊内「约 N 分钟」实时剩余估计
- **分节导航**：玻璃浮层目录，scroll-spy 联动高亮当前小节
- **Bionic 英文锚定**（默认关）：加粗英文单词前半为视线提供锚点；中文不适用（无词前缀结构），引导职责由段落聚焦承担
- **节奏提醒**（默认关）：每 15 分钟温和提示休息，仅统计前台可见时间
- **阅读位置记忆**：离开时保存文章进度，回来提示「继续上次阅读 · N%」
- **可分享链接**：`?focus=1` 直接进入专注模式；偏好与模式持久化到 localStorage，下次自动恢复

## 构建与部署

```bash
npm run build      # vite build + 预渲染 + RSS/sitemap/robots 生成
npm run build:spa  # 纯 SPA 构建（跳过预渲染）
npm run preview    # 本地预览 dist
```

构建产物包含：

- `dist/<route>/index.html`：预渲染的静态页面（爬虫/禁 JS 环境可直接读到正文与路由级 meta；正常访问时 React 照常接管）
- `dist/rss.xml`：RSS 2.0 全文订阅源（Footer 订阅入口 / `<link rel=alternate>` 自动发现）
- `dist/sitemap.xml` / `dist/robots.txt`：按公开文章自动生成

预渲染依赖 Playwright Chromium：

- 本地/CI：已安装则自动执行；未安装时 `npx playwright install chromium` 后重试
- Vercel：默认跳过（构建机无浏览器），在项目环境变量中设置 `PRERENDER=1` 开启（每次构建额外约 1–2 分钟）
- `SKIP_PRERENDER=1` 可强制跳过

### 环境变量（均可选，见 `.env.example`）

| 变量                      | 作用                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| `VITE_SITE_URL`           | RSS/sitemap/robots 中的绝对链接域名；Vercel 会自动读取 `VERCEL_PROJECT_PRODUCTION_DOMAIN`，通常无需设置 |
| `VITE_GISCUS_REPO`        | giscus 评论仓（如 `ChenChen913/ChenBlog`），四项全配才渲染评论区                                        |
| `VITE_GISCUS_REPO_ID`     | giscus.app 配置工具获取                                                                                 |
| `VITE_GISCUS_CATEGORY`    | Discussions 分类名                                                                                      |
| `VITE_GISCUS_CATEGORY_ID` | giscus.app 配置工具获取                                                                                 |

## 性能设计

- **文章数据双通道**：列表页只读构建期生成的轻量元数据索引（`virtual:posts-index`，几 KB）；正文按需加载独立 chunk，首页零正文流量
- **hover 预取 + 路由预热**：文章卡片与上/下篇链接在 hover / 键盘聚焦时提前拉取正文 chunk；空闲时段（requestIdleCallback）自动预热主要路由 chunk，首次点击文章即达；省流模式与 slow-2g 自动跳过
- **字体 unicode-range 分片**：LXGW 楷体拆为 latin(60KB) / 常用字(881KB) / 次常用字(4.4MB) 三片，文章页典型流量 5.1MB → 941KB；新增文章引入新字后运行 `python3 scripts/font-split.py` 重建（需 fontTools + brotli，源字体在 `scripts/font-src/`）
- **路由级代码分割**：非首屏页面与 Shiki 语法包均按需加载
- **高亮零 wasm**：Shiki 使用 JavaScript 正则引擎（forgiving 模式），彻底移除 oniguruma wasm（155KB gzip）依赖，CSP 同步收紧
- **frontmatter 解析**：构建期 gray-matter（js-yaml）解析，正确支持引号/多行数组/YAML 标量；单篇失败降级不阻塞构建
- **暗色首帧引导**：index.html 内联脚本首帧前同步主题，消除暗色用户白闪

## 代码规范

- **ESLint 10**（`eslint.config.js`）：flat config 三环境分区 + react-hooks 依赖检查；error 级拦截，存量 warn 项渐进治理
- **Prettier 3**（`.prettierrc.json`）：单引号 / 分号 / printWidth 100；文章内容目录已豁免
- **husky + lint-staged**：提交暂存文件自动 eslint --fix + prettier，违规的提交会被拦截
- 常用命令：`npm run lint`（tsc）/ `npm run lint:eslint` / `npm run lint:fix` / `npm run format` / `npm run format:check`

## CI

推送到 main 或发起 PR 时自动运行（`.github/workflows/ci.yml`）：

1. **Lint & Unit**：tsc 类型检查 + ESLint 门禁 + vitest 150+ 项单测
2. **Build & Prerender**：完整构建 + 产物存在性断言，dist 快照上传为 artifact
3. **E2E**：Playwright 桌面 + 移动双视口 70+ 项用例（含时间轴几何对齐、周历交互、双主题代码块对比度回归锁），失败时上传报告

## 项目结构

```
scripts/
├── posts-index-plugin.ts   # 构建期文章元数据索引（virtual:posts-index）
├── feeds-plugin.ts         # RSS / sitemap / robots 生成
├── prerender.mjs           # 构建后预渲染
└── font-split.py           # 字体 unicode-range 分片（可重复执行）
src/
├── components/          # 组件
│   ├── Layout.tsx            # 页面布局
│   ├── SideBar.tsx           # 侧边栏（导航/搜索入口/社交链接）
│   ├── TopNav.tsx            # 手机顶部导航
│   ├── MobileBottomBar.tsx   # 手机底部导航
│   ├── PostTimeline.tsx      # 首页时间轴文章列表
│   ├── PostCard.tsx          # 文章卡片（分类页等）
│   ├── PostNavigation.tsx    # 上一篇/下一篇
│   ├── RelatedPosts.tsx      # 相关文章推荐
│   ├── WeeklyNavigation.tsx  # 周刊文章上周/下周互链
│   ├── TableOfContents.tsx   # 文章目录（滚动联动高亮）
│   ├── CodeBlock.tsx         # 代码块（Shiki 高亮/行号/复制）
│   ├── SearchDialog.tsx      # 站内搜索弹窗（⌘K，液态玻璃）
│   ├── ReadingProgress.tsx   # 阅读进度条
│   ├── ArticleFontSizeControl.tsx # 阅读字号控制
│   ├── Lightbox.tsx          # 图片点击放大
│   ├── FloatingActions.tsx   # 浮动操作按钮
│   ├── ScrollToTop.tsx       # 回到顶部
│   ├── SkipLink.tsx          # 无障碍跳转链接
│   ├── NetworkStatusBanner.tsx # 离线提示
│   ├── ErrorBoundary.tsx     # 渲染错误边界
│   ├── StatusView.tsx        # 状态视图（404/错误）
│   ├── JsonLd.tsx            # JSON-LD 结构化数据
│   ├── Comments.tsx          # giscus 评论（env 门控）
│   └── Footer.tsx            # 页脚
├── pages/               # Home / Weekly / Categories / Post / About / NotFound / StatusPage
├── context/             # Context
├── hooks/               # usePageMeta / useTheme / useLanguage 等
├── i18n/                # 国际化
├── posts/               # Markdown 文章
├── utils/               # 工具函数（search.ts 站内搜索、weekly.ts 周号计算、route-prefetch.ts 路由预热等）
└── index.css            # 全局样式（含时间轴/周刊页/液态玻璃）
```

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router
- React Markdown
- KaTeX (数学公式)
- Shiki (代码高亮)
- Motion (动画)
- gray-matter / marked (构建期 RSS 与元数据)
- Playwright (e2e 与预渲染)
