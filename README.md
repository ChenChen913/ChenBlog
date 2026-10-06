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
title: "文章标题"
title_en: "Article Title"  # 可选，英文标题
date: "2025-01-15"
category: "tech"           # tech | life | reading
tags: ["React", "TypeScript"]
featured: false            # 可选，是否精选
draft: false               # 可选，是否草稿
coverImage: "https://..."  # 可选，封面图片
---

文章正文...
```

### Frontmatter 字段说明

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `title` | ✅ | string | 文章标题（中文） |
| `title_en` | ❌ | string | 文章标题（英文） |
| `date` | ✅ | string | 发布日期，格式 `YYYY-MM-DD` |
| `category` | ✅ | string | 分类：`tech` / `life` / `reading` |
| `tags` | ✅ | string[] | 标签数组 |
| `featured` | ❌ | boolean | 是否精选文章 |
| `draft` | ❌ | boolean | 是否草稿（草稿不会在列表显示） |
| `coverImage` | ❌ | string | 封面图片 URL |

### 草稿功能

设置 `draft: true` 的文章：
- 不会出现在首页、分类页、精选页
- 可以通过直接访问 URL 查看
- 访问草稿时会显示提示信息

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

| 变量 | 作用 |
|------|------|
| `VITE_SITE_URL` | RSS/sitemap/robots 中的绝对链接域名；Vercel 会自动读取 `VERCEL_PROJECT_PRODUCTION_DOMAIN`，通常无需设置 |
| `VITE_GISCUS_REPO` | giscus 评论仓（如 `ChenChen913/ChenBlog`），四项全配才渲染评论区 |
| `VITE_GISCUS_REPO_ID` | giscus.app 配置工具获取 |
| `VITE_GISCUS_CATEGORY` | Discussions 分类名 |
| `VITE_GISCUS_CATEGORY_ID` | giscus.app 配置工具获取 |

## 性能设计

- **文章数据双通道**：列表页只读构建期生成的轻量元数据索引（`virtual:posts-index`，几 KB）；正文按需加载独立 chunk，首页零正文流量
- **字体 unicode-range 分片**：LXGW 楷体拆为 latin(60KB) / 常用字(881KB) / 次常用字(4.4MB) 三片，文章页典型流量 5.1MB → 941KB；新增文章引入新字后运行 `python3 scripts/font-split.py` 重建（需 fontTools + brotli，源字体在 `scripts/font-src/`）
- **路由级代码分割**：非首屏页面与 Shiki 语法包均按需加载
- **frontmatter 解析**：构建期 gray-matter（js-yaml）解析，正确支持引号/多行数组/YAML 标量；单篇失败降级不阻塞构建
- **暗色首帧引导**：index.html 内联脚本首帧前同步主题，消除暗色用户白闪

## CI

推送到 main 或发起 PR 时自动运行（`.github/workflows/ci.yml`）：

1. **Lint & Unit**：tsc 类型检查 + vitest 94 项单测
2. **Build & Prerender**：完整构建 + 产物存在性断言，dist 快照上传为 artifact
3. **E2E**：Playwright 桌面 + 移动双视口 27 项用例，失败时上传报告

## 项目结构

```
scripts/
├── posts-index-plugin.ts   # 构建期文章元数据索引（virtual:posts-index）
├── feeds-plugin.ts         # RSS / sitemap / robots 生成
├── prerender.mjs           # 构建后预渲染
└── font-split.py           # 字体 unicode-range 分片（可重复执行）
src/
├── components/          # 组件
│   ├── FloatingActions.tsx   # 右上角浮动按钮
│   ├── Layout.tsx            # 页面布局
│   ├── MobileBottomBar.tsx   # 手机底部导航
│   ├── PostCard.tsx          # 文章卡片
│   ├── ScrollToTop.tsx       # 回到顶部按钮
│   ├── SearchDialog.tsx      # 站内搜索弹窗（⌘K）
│   ├── ReadingProgress.tsx   # 阅读进度条
│   ├── JsonLd.tsx            # JSON-LD 结构化数据
│   ├── Comments.tsx          # giscus 评论（env 门控）
│   ├── SideBar.tsx           # 侧边栏
│   ├── TableOfContents.tsx   # 文章目录
│   └── TopNav.tsx            # 手机顶部导航
├── context/             # Context
├── hooks/               # usePageMeta / useTheme / useLanguage 等
├── i18n/                # 国际化
├── pages/               # 页面
├── posts/               # Markdown 文章
├── utils/               # 工具函数（search.ts 站内搜索等）
└── index.css            # 全局样式
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
