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

- 基础格式：加粗、斜体、删除线、行内代码
- 标题：h2、h3 会自动生成目录
- 列表：有序、无序、任务列表
- 代码块：支持语法高亮、行号、复制按钮
- 阅读字号：文章页支持“小 / 标准 / 大”三档调节，并会记住用户偏好
- 数学公式：行内 `$...$`，块级 `$$...$$`
- 表格
- 图片：支持点击放大
- 视频：支持 YouTube、Bilibili 嵌入
- 音频

## 项目结构

```
src/
├── components/          # 组件
│   ├── FloatingActions.tsx   # 右上角浮动按钮
│   ├── Layout.tsx            # 页面布局
│   ├── MobileBottomBar.tsx   # 手机底部导航
│   ├── PostCard.tsx          # 文章卡片
│   ├── ScrollToTop.tsx       # 回到顶部按钮
│   ├── SideBar.tsx           # 侧边栏
│   ├── TableOfContents.tsx   # 文章目录
│   └── TopNav.tsx            # 手机顶部导航
├── context/             # Context
├── i18n/                # 国际化
├── pages/               # 页面
├── posts/               # Markdown 文章
├── utils/               # 工具函数
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
- Highlight.js (代码高亮)
- Framer Motion (动画)
