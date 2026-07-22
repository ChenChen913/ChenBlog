# 个人博客建站完整需求文档 v2.0
> 本文档面向 Lovable / Cursor 等 AI 开发工具，描述博客的**功能逻辑与工程规范**。
> 前端视觉设计（颜色、字体、组件样式、布局）已单独整理在《前端界面设计文档 v2.0》中，
> 两份文档配合使用，本文档不重复描述任何 UI 样式细节。

---

## 目录

1. [项目基础信息](#一项目基础信息)
2. [技术栈与项目结构](#二技术栈与项目结构)
3. [文章管理方式](#三文章管理方式)
4. [主题模式（日夜自动切换）](#四主题模式日夜自动切换)
5. [多语言支持](#五多语言支持)
6. [页面功能说明](#六页面功能说明)
7. [代码块完整实现方案](#七代码块完整实现方案)
8. [数学公式支持](#八数学公式支持)
9. [媒体文件支持](#九媒体文件支持)
10. [文章目录组件（TOC）](#十文章目录组件toc)
11. [回到顶部按钮](#十一回到顶部按钮)
12. [响应式断点规范](#十二响应式断点规范)
13. [全站安全加固](#十三全站安全加固)
14. [不需要的功能](#十四不需要的功能)

---

## 一、项目基础信息

- **博客名称**：MaoChen（可替换）
- **博客定位**：极简风格个人博客
- **内容方向**：技术与编程、生活随笔、读书笔记
- **目标域名**：`maochen.dev`（推荐）或 `chen913.dev`
- **前端视觉规范**：见《前端界面设计文档 v2.0》，本文档不重复

---

## 二、技术栈与项目结构

```
技术栈：React + TypeScript + Tailwind CSS + Vite
```

### 项目目录结构

```
src/
├── components/     # 通用组件（Navbar, SideBar, Footer, PostCard, CodeBlock, TOC...）
├── pages/          # 页面组件（Home, Post, Categories, Highlights, About）
├── posts/          # Markdown 文章文件（.md）
├── i18n/           # 双语文案 index.ts
├── hooks/          # 自定义 hooks（useTheme, useLanguage, useReadCount）
├── utils/          # 工具函数（解析 markdown、计算阅读时间、截取摘要、storage 封装）
└── styles/         # 全局样式（CSS counter 行号、TOC 激活态等 Tailwind 不便表达的样式）
```

### 关键工程规范

- 所有颜色通过 Tailwind 自定义 config 管理，禁止在组件中硬编码颜色值
- 深色/浅色模式通过 `darkMode: "class"` 切换，根元素 `class` 上加 `dark`
- 所有图标使用 Material Symbols Outlined（`<span class="material-symbols-outlined">`）
- 路由使用 React Router v6，文章详情页路由为 `/posts/:slug`
- 组件拆分原则：每个页面对应独立页面组件，公共 UI 抽成独立 components

---

## 三、文章管理方式

### 使用本地 Markdown 文件

- 所有文章以 `.md` 文件形式存放在 `src/posts/` 目录下
- 使用 `import.meta.glob` 在构建时批量读取所有 `.md` 文件
- 使用 `gray-matter` 解析 frontmatter，使用 `marked` 渲染正文
- **摘要不需要单独写**，直接截取正文前 150 字（去除 Markdown 标记后的纯文本）作为预览

### Frontmatter 格式规范

```yaml
---
title: "文章标题"
title_en: "Article Title"
date: "2024-03-01"
category: "tech"       # tech | life | reading
tags: ["React", "TypeScript"]
featured: false        # true 表示加入精选页及首页精选横幅
gem: false             # true 表示在列表中显示 💎 标记
coverImage: ""         # 文章封面图 URL，用于文章头部大图
---
```

### 示例文章要求

在 `src/posts/` 中预置至少 6 篇示例文章（技术、生活、读书各 2 篇），其中至少 2 篇正文包含：
- 代码块示例（用于展示语法高亮与行号效果）
- 数学公式示例（用于展示 KaTeX 渲染效果，含行内 `$...$` 和行间 `$$...$$`）
- 高亮文字示例（`==高亮文字==` 语法）
- 至少包含 3 个 h2 标题（用于展示 TOC 目录效果）

### 阅读时间计算

```typescript
// 中文按 300 字/分钟，英文按 200 词/分钟，混合取平均
function calcReadTime(content: string): number {
  const cnChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const enWords = content.replace(/[\u4e00-\u9fa5]/g, '').trim()
                         .split(/\s+/).filter(Boolean).length;
  const minutes = cnChars / 300 + enWords / 200;
  return Math.max(1, Math.round(minutes));
}
```

### 浏览次数统计

用 `localStorage` 本地计数模拟，key 格式为 `views:${slug}`：

```typescript
function incrementViews(slug: string): number {
  const key = `views:${slug}`;
  const prev = parseInt(safeGetStorage(key) || '0', 10);
  const next = prev + 1;
  safeSetStorage(key, String(next));
  return next;
}
```

每次访问文章详情页时调用，返回值展示在卡片和详情页顶部。

---

## 四、主题模式（日夜自动切换）

### 逻辑规则

- **夜间模式时段**：北京时间 20:00 ～ 次日 06:00（含边界）
- **日间模式时段**：北京时间 06:00 ～ 20:00
- **北京时间 = UTC+8**，必须用 UTC 偏移量计算，不能依赖用户设备本地时区

### 优先级规则（从高到低）

1. 用户手动切换过 → 使用用户选择，持久化到 `localStorage`（key: `"theme-preference"`，值: `"dark"` 或 `"light"`）
2. 用户未手动切换过 → 根据当前北京时间自动判断
3. 不跟随系统 `prefers-color-scheme`，时间优先于系统设置

### 完整实现代码（src/hooks/useTheme.ts）

```typescript
function getBeijingHour(): number {
  const now = new Date();
  const beijingOffset = 8 * 60 * 60 * 1000;
  const beijingTime = new Date(now.getTime() + beijingOffset);
  return beijingTime.getUTCHours();
}

function getAutoTheme(): 'dark' | 'light' {
  const hour = getBeijingHour();
  return (hour >= 20 || hour < 6) ? 'dark' : 'light';
}

export function useTheme() {
  const stored = safeGetStorage('theme-preference') as 'dark' | 'light' | null;
  const [theme, setTheme] = useState<'dark' | 'light'>(stored ?? getAutoTheme());

  useEffect(() => {
    // 使用 class 切换（配合 Tailwind darkMode: "class"）
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // 每分钟检查一次，仅在用户没有手动设置时自动切换
  useEffect(() => {
    const timer = setInterval(() => {
      if (!safeGetStorage('theme-preference')) {
        setTheme(getAutoTheme());
      }
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    safeSetStorage('theme-preference', next);
  }

  function resetToAuto() {
    safeRemoveStorage('theme-preference');
    setTheme(getAutoTheme());
  }

  return { theme, toggleTheme, resetToAuto };
}
```

### 主题切换按钮行为

- 日间显示月亮图标（`dark_mode`），夜间显示太阳图标（`light_mode`）
- 图标旁显示小标签：手动设置时显示「手动」，自动时显示「自动」
- 长按或右键切换按钮，弹出「重置为自动」选项（可选实现）

---

## 五、多语言支持

- 支持中文 / 英文切换，顶部导航放 CN / EN 切换按钮
- 切换**仅影响 UI 界面文字**（导航、按钮、标签名称、关于我页面内容）
- 文章正文本身不翻译
- 语言状态持久化到 `localStorage`（key: `"lang-preference"`）
- 双语文案统一管理在 `src/i18n/index.ts`

### i18n 文案结构

```typescript
// src/i18n/index.ts
export const i18n = {
  zh: {
    nav_home: '首页', nav_posts: '文章', nav_categories: '分类',
    nav_highlights: '精选', nav_about: '关于',
    toc_title: '目录',
    tab_latest: '最新', tab_recommend: '推荐',
    tab_tech: '技术', tab_reading: '读书',
    read_min: '分钟', views: '次阅读',
    copy: '复制', copied: '已复制 ✓',
    permalink: '原始链接',
    subscribe: '订阅更新',
    related: '相关文章', view_all: '查看全部',
    category_tech: '技术', category_life: '生活', category_reading: '读书',
    theme_auto: '自动', theme_manual: '手动',
  },
  en: {
    nav_home: 'Home', nav_posts: 'Posts', nav_categories: 'Categories',
    nav_highlights: 'Highlights', nav_about: 'About',
    toc_title: 'Contents',
    tab_latest: 'Latest', tab_recommend: 'Featured',
    tab_tech: 'Tech', tab_reading: 'Books',
    read_min: 'min read', views: 'views',
    copy: 'Copy', copied: 'Copied ✓',
    permalink: 'Permalink',
    subscribe: 'Subscribe',
    related: 'Related', view_all: 'View All',
    category_tech: 'Tech', category_life: 'Life', category_reading: 'Reading',
    theme_auto: 'Auto', theme_manual: 'Manual',
  }
} as const;

export type LangKey = keyof typeof i18n.zh;
export type Lang = 'zh' | 'en';
```

---

## 六、页面功能说明

### 公共布局结构

**桌面端（≥ 1024px）：**
- 左侧固定侧边栏（宽 288px）：含头像、博客简介、导航链接、订阅 CTA 按钮，`position: sticky`
- 右侧为主内容区（`flex: 1`）

**移动端（< 768px）：**
- 侧边栏隐藏
- 顶部精简导航栏（Logo + 右侧功能按钮）
- 底部固定浮动操作栏（5 个图标按钮），替代汉堡菜单

---

### 1. 首页（/）

- Hero 区：满幅大图 + 玻璃卡片叠加，显示博客名称和个人介绍语（中英双语）
- Tab 切换栏：「最新 | 推荐 | 技术 | 读书」，点击后文章列表过滤切换，带淡入动画
- 精选文章横幅：仅在「推荐」Tab 激活时显示，展示 `featured: true` 的文章，视觉突出
- 文章卡片列表：两列网格，每张卡片包含封面图（hover 放大）、分类标签、标题（gem 则显示 💎）、摘要（正文前 150 字）、日期（`2024/08`，只到月份）、阅读时间、浏览次数

---

### 2. 文章详情页（/posts/:slug）

- 顶部满幅大图 Hero（16:9 / 21:9）：封面图 + 玻璃卡片（含分类、标题、阅读时间）
- 文章首字下沉（正文第一段 `first-letter` 样式）
- 正文渲染：代码块（见第七节）、数学公式（见第八节）、`==高亮==` 语法、图片 Lightbox、视频/音频（见第九节）、标题锚点、引用块、表格等
- 右侧 TOC 目录（桌面 ≥ 1280px，见第十节）
- 内联折叠目录（平板/手机端，见第十节）
- 文章底部：标签列表、永久链接、上一篇 / 下一篇导航（手机端纵向堆叠）
- 相关文章区（同分类最新 2 篇）
- 右下角回到顶部按钮（见第十一节）
- 每次访问自动 `views +1`（localStorage 计数）

---

### 3. 分类页（/categories）

- 三个分类大卡片（技术 / 生活 / 读书），点击激活后过滤下方文章列表
- 标签云：所有文章 tag 汇总，点击后按 tag 过滤
- 支持 URL 参数：`/categories?cat=tech&tag=React`，页面刷新后恢复选中状态

---

### 4. 精选页（/highlights）

- 页面标题区：「✦ 精选合集」+ 说明文字
- 三栏精选列表（`featured: true` 或 `gem: true` 的文章）：技术精选 / 生活精选 / 读书精选
- 无文章时显示「暂无精选文章」占位

---

### 5. 搜索功能

- 点击顶部导航搜索图标，展开搜索框（带淡入动画）
- 实时过滤文章标题、摘要、标签（纯前端）
- 搜索结果高亮匹配关键词（`<mark>` 标签）
- 无结果显示「未找到相关文章」
- 按 ESC 或点击其他区域关闭搜索
- 手机端搜索框展开后占满顶部导航栏宽度

---

### 6. 关于我页面（/about）

- 头像（圆形）+ 博客名 + 一句话简介 + 社交链接
- 中英双语自我介绍段落（跟随语言切换）
- 技能 / 兴趣标签列表

---

### 7. Footer

- 版权信息 + 当年年份自动更新（`new Date().getFullYear()`）
- 社交链接（GitHub、Twitter/X、RSS）

---

## 七、代码块完整实现方案

> ⚠️ 严格按照以下方案实现，不得使用 table 双列方案，不得自行变通。

### 核心方案：CSS counter 行号

放弃行号列与代码列分离的方案（table 双列），改用 **CSS counter 伪元素**方案。
这是唯一能保证行号与换行后的代码行严格对应的可靠实现。

### HTML 结构（由 marked renderer 生成）

```html
<div class="code-block">
  <div class="code-header">
    <span class="code-lang">JavaScript</span>
    <button class="code-copy" onclick="copyCode(this)">复制</button>
  </div>
  <pre class="code-pre">
    <code class="code-content hljs language-javascript">
      <span class="code-line">第一行代码</span>
      <span class="code-line">第二行代码</span>
      <span class="code-line">很长很长的第三行，超出宽度自动换行不横向滚动</span>
    </code>
  </pre>
</div>
```

### CSS（放在全局样式文件中）

```css
.code-content {
  display: block;
  padding: 14px 0;
  counter-reset: line-number;
  background: transparent;
}

.code-line {
  display: block;
  position: relative;
  padding-left: 54px;
  padding-right: 20px;
  white-space: pre-wrap;   /* 长行自动换行，禁止横向滚动 */
  word-break: break-all;   /* 超长单词也强制换行 */
  min-height: 1.6em;
  line-height: 1.6;
  counter-increment: line-number;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 13px;
}

.code-line::before {
  content: counter(line-number);
  position: absolute;
  left: 0;
  width: 38px;
  text-align: right;
  font-size: 12px;
  line-height: 1.6;
  user-select: none;       /* 复制时不带行号 */
  pointer-events: none;
  opacity: 0.4;
}
```

### marked renderer 中的 code 处理函数

```javascript
function wrapCodeLines(highlightedCode: string): string {
  const lines = highlightedCode.split('\n');
  // 去掉末尾空行，防止多出一个空行号
  if (lines[lines.length - 1] === '') lines.pop();
  return lines
    .map(line => `<span class="code-line">${line || ' '}</span>`)
    .join('');
}

renderer.code = (code: string, language: string) => {
  const validLang = hljs.getLanguage(language) ? language : 'plaintext';
  let highlighted: string;
  try {
    highlighted = hljs.highlight(code, { language: validLang }).value;
  } catch {
    // fallback：任何 hljs 异常都降级为纯文本，绝不在 header 显示报错
    highlighted = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  const wrapped = wrapCodeLines(highlighted);
  const langLabel = language || 'code';
  return `
    <div class="code-block">
      <div class="code-header">
        <span class="code-lang">${langLabel}</span>
        <button class="code-copy" onclick="copyCode(this)">复制</button>
      </div>
      <pre class="code-pre"><code class="code-content hljs language-${validLang}">${wrapped}</code></pre>
    </div>
  `;
};
```

### 复制按钮逻辑

```javascript
function copyCode(btn: HTMLButtonElement) {
  const codeEl = btn.closest('.code-block')?.querySelector('.code-content');
  if (!codeEl) return;
  // 行号是伪元素，不在 DOM 里，textContent 只含代码文本
  const text = Array.from(codeEl.querySelectorAll('.code-line'))
    .map(line => line.textContent ?? '')
    .join('\n');
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = '已复制 ✓';
    setTimeout(() => { btn.textContent = '复制'; }, 1500);
  });
}
```

### highlight.js 主题切换

```typescript
function switchHljsTheme(isDark: boolean) {
  const link = document.getElementById('hljs-theme') as HTMLLinkElement;
  if (!link) return;
  const base = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/';
  link.href = isDark
    ? `${base}atom-one-dark.min.css`
    : `${base}atom-one-light.min.css`;
}
// 在 useTheme 的 useEffect 中调用 switchHljsTheme(theme === 'dark')
```

### 特别注意事项（必须全部遵守）

1. `code-header` 必须设置 `min-height`，防止语言识别失败时塌陷
2. `language` 参数为空或 `undefined` 时，`langLabel` 显示 `"code"`，不报错，不在 header 显示异常信息
3. `wrapCodeLines` 必须去掉末尾空行，否则最后会多出一个空行号
4. `white-space: pre-wrap` 设置在 `.code-line` 上，不是 `pre` 上
5. hljs 渲染任何异常都必须有 fallback（纯文本降级），绝不让报错信息出现在 UI 中

---

## 八、数学公式支持

- 使用 **KaTeX** 渲染数学公式
- 行内公式语法：`$...$`
- 行间公式语法：`$$...$$`，居中显示，右侧显示编号 `(1)`、`(2)`
- 行间公式容器设置 `overflow-x: auto`，手机上横向滑动查看超宽公式
- 公式区域不出现多余 scrollbar 干扰排版
- 编号用 CSS 右对齐实现，不依赖滚动容器

### KaTeX 初始化

```javascript
document.addEventListener('DOMContentLoaded', () => {
  renderMathInElement(document.querySelector('.article-body'), {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$',  right: '$',  display: false },
    ],
    throwOnError: false,  // 公式语法错误时降级为原始文本，不崩溃
  });
});
```

---

## 九、媒体文件支持

### 图片

- 标准 Markdown 语法：`![alt](url)`
- 点击图片后全屏 Lightbox 查看，点击遮罩或按 ESC 关闭

```typescript
function initLightbox() {
  document.querySelectorAll('.article-body img').forEach(img => {
    img.addEventListener('click', () => {
      const overlay = document.createElement('div');
      overlay.style.cssText =
        'position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.85);' +
        'backdrop-filter:blur(8px);display:flex;align-items:center;' +
        'justify-content:center;cursor:zoom-out;';
      const clone = (img as HTMLImageElement).cloneNode() as HTMLImageElement;
      clone.style.cssText =
        'max-width:90vw;max-height:90vh;border-radius:12px;object-fit:contain;';
      overlay.appendChild(clone);
      overlay.addEventListener('click', () => overlay.remove());
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') overlay.remove();
      }, { once: true });
      document.body.appendChild(overlay);
    });
  });
}
```

### 视频

支持两种方式：
1. HTML `<video>` 标签（`<video src="..." controls></video>`）
2. YouTube / Bilibili iframe 嵌入（DOMPurify 白名单已允许）

视频容器用 `padding-bottom: 56.25%`（16:9）包裹，防止加载前高度塌陷。

### 音频

支持 `<audio src="..." controls></audio>` 语法，使用浏览器原生控件。

---

## 十、文章目录组件（TOC）

### 目录生成逻辑

- 文章渲染完成后，自动扫描正文中所有 `h2` 和 `h3` 标签（`h1` 不纳入）
- 每个 `h2/h3` 在渲染时自动生成唯一 `id`：标题文本转 slug，保留中文，空格替换为 `-`
- `h2` 对应一级目录项，`h3` 对应二级目录项（缩进更深）
- 若文章无任何 `h2/h3`，不渲染目录组件

### 桌面端 Sticky 跟随——关键规范

```css
/* ⚠️ 父容器必须是 align-items: flex-start，否则 sticky 不触发 */
.article-page {
  display: flex;
  align-items: flex-start;  /* 绝对不能是默认值 stretch */
  gap: 48px;
}

.article-toc-wrap {
  width: 208px;
  flex-shrink: 0;
  position: sticky;
  top: 88px;                /* 导航栏高度 + 8px */
  max-height: calc(100vh - 104px);
  overflow-y: auto;
  scrollbar-width: none;
}
.article-toc-wrap::-webkit-scrollbar { display: none; }
```

**为什么 `align-items` 必须是 `flex-start`：**
默认值 `stretch` 会将 TOC 容器高度拉伸为与文章正文相同，`sticky` 永远不会触发。
`flex-start` 让 TOC 高度由自身内容决定，`sticky` 才能正常工作。

### IntersectionObserver 实现

```javascript
function initTOC() {
  const tocLinks = document.querySelectorAll<HTMLElement>('.toc-item');
  const headings = document.querySelectorAll<HTMLElement>('article h2, article h3');
  if (!tocLinks.length || !headings.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const activeId = entry.target.id;
          tocLinks.forEach(link => {
            link.classList.toggle('toc-active', link.getAttribute('data-id') === activeId);
          });
          // 目录本身跟随高亮项滚动（长文章目录超出视口时）
          document.querySelector<HTMLElement>(`.toc-item[data-id="${activeId}"]`)
            ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    },
    { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
  );

  headings.forEach(h => observer.observe(h));
}
```

> ⚠️ 必须使用 `IntersectionObserver`，不能用 `scroll` 事件监听，防止性能问题。

### 常见错误排查（实现后必须逐一检查）

1. 外层容器有 `overflow: hidden` 或 `overflow: auto` → 导致 `sticky` 失效，必须移除
2. 外层容器高度固定 → `sticky` 参考容器太矮，确保父容器高度由内容撑开
3. `align-items` 使用了默认 `stretch` → 必须改为 `flex-start`
4. `top` 值小于导航栏实际高度 → 目录会被导航栏遮住

### 平板 / 手机端（< 1280px）

改为文章正文顶部的**内联折叠目录块**：
- 使用 HTML `<details>` 元素，默认折叠，只显示「目录」标题行
- 展开后显示完整目录列表，目录项点击后滚动到对应标题，`<details>` 自动收起

---

## 十一、回到顶部按钮

### 显示 / 隐藏逻辑

- 页面向下滚动超过 **400px** 时淡入显示，低于 400px 时淡出隐藏
- 使用 `scroll` 事件 + `requestAnimationFrame` 节流

### 点击行为

```javascript
btn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  btn.classList.remove('visible');  // 点击后立即隐藏，不等滚动完成
});
```

### 其他规范

- `position: fixed`，`z-index: 50`（低于导航栏的 100）
- 全局生效，所有页面滚动超过 400px 就显示
- 不使用第三方库，原生实现
- 样式与响应式定位见前端 UI 文档

---

## 十二、响应式断点规范

| 断点名 | Tailwind 前缀 | 范围 | 说明 |
|--------|--------------|------|------|
| 手机 | 默认 | < 768px | 底部浮动操作栏，无侧边栏 |
| 平板 | `md:` | ≥ 768px | 顶部导航出现，底部操作栏消失 |
| 桌面小 | `lg:` | ≥ 1024px | 左侧侧边栏显示 |
| 桌面大 | `xl:` | ≥ 1280px | 右侧 TOC 列显示 |

### 各断点关键功能变化

**手机（< 768px）：**
- 左侧侧边栏：`hidden`
- 底部浮动操作栏：显示（`md:hidden`）
- 文章列表：单列，右侧 TOC 隐藏改为内联折叠 `<details>`
- 精选页 / 分类页：单列，关于我头部：纵向排列
- 回到顶部按钮：`right: 16px; bottom: 80px`（避开底部浮动操作栏）

**平板（768px ～ 1024px）：**
- 左侧侧边栏：`hidden`，底部浮动操作栏：`md:hidden`
- 文章列表：两列，右侧 TOC 仍隐藏（内联折叠目录）
- 精选页 / 分类页：两列

**桌面（≥ 1024px）：**
- 左侧侧边栏：显示（`hidden lg:block w-72`）

**桌面大屏（≥ 1280px）：**
- 右侧 TOC 列：显示（`hidden xl:block`）

### 触摸体验通用规范

- 所有可点击元素最小点击区域：**44 × 44px**
- 所有 `:hover` 专属样式必须用 `@media (hover: hover)` 包裹，防止触摸设备误触发

---

## 十三、全站安全加固

### 1. HTTP 安全响应头（最高优先级）

在项目根目录创建 `vercel.json`（同时创建 `netlify.toml` 作为备用）：

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; media-src 'self' https:; frame-src https://www.youtube.com https://player.bilibili.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';"
        },
        { "key": "X-Content-Type-Options",      "value": "nosniff" },
        { "key": "X-Frame-Options",              "value": "SAMEORIGIN" },
        { "key": "X-XSS-Protection",             "value": "1; mode=block" },
        { "key": "Referrer-Policy",              "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy",           "value": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
        { "key": "Strict-Transport-Security",    "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "Cross-Origin-Opener-Policy",   "value": "same-origin" },
        { "key": "Cross-Origin-Resource-Policy", "value": "same-origin" }
      ]
    }
  ]
}
```

### 2. XSS 防护

所有 Markdown 渲染输出必须经过 **DOMPurify** 净化：

```javascript
import DOMPurify from 'dompurify';

const rawHtml = marked(markdownContent);
const cleanHtml = DOMPurify.sanitize(rawHtml, {
  ALLOWED_TAGS: [
    'h1','h2','h3','h4','h5','h6','p','br','hr',
    'strong','em','del','code','pre','blockquote',
    'ul','ol','li','table','thead','tbody','tr','th','td',
    'a','img','video','audio','source','iframe',
    'div','span','mark','details','summary',
  ],
  ALLOWED_ATTR: [
    'href','src','alt','title','class','id',
    'controls','autoplay','loop','muted','poster',
    'width','height','allowfullscreen','frameborder',
    'target','rel','data-id','data-lang',
  ],
  ALLOW_DATA_ATTR: false,
  FORBID_SCRIPTS: true,
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
});
```

- 禁止使用 `dangerouslySetInnerHTML` 直接插入未净化内容
- 所有外部链接强制添加 `rel="noopener noreferrer" target="_blank"`

### 3. 依赖安全

```json
"scripts": {
  "security-check": "npm audit --audit-level=high"
}
```

- 所有依赖包使用**精确版本号**（去掉 `^` 和 `~`）
- 不引入不必要的第三方依赖

### 4. 敏感信息保护

- 所有环境变量存放在 `.env` 文件，绝对不能硬编码在源码里
- `.env` 文件加入 `.gitignore`
- 前端只使用 `VITE_` 前缀的环境变量
- 禁止 `console.log` 输出任何敏感数据

### 5. 第三方资源完整性校验（SRI）

所有从 CDN 加载的外部 CSS/JS 必须添加 `integrity` 属性，哈希值从 cdnjs.cloudflare.com 资源详情页获取：

```html
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.min.css"
  integrity="sha384-xxxx"
  crossorigin="anonymous"
/>
```

### 6. 防点击劫持（双重保险）

```javascript
// 在每个页面 <head> 中添加
if (window.top !== window.self) {
  window.top!.location.href = window.self.location.href;
}
```

### 7. 本地存储安全封装

```typescript
// src/utils/storage.ts
export function safeGetStorage(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
export function safeSetStorage(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch {}
}
export function safeRemoveStorage(key: string): void {
  try { localStorage.removeItem(key); } catch {}
}
```

- `localStorage` 只存储主题偏好、语言偏好、文章浏览次数，不存储任何用户身份信息

### 8. 错误信息不泄露

- 生产环境禁止展示任何技术性错误详情（堆栈信息、文件路径、组件名等）
- 所有 `ErrorBoundary` 只显示友好提示文案，不展示 `error.stack`
- `vite.config.ts` 关闭 source map：

```javascript
build: {
  sourcemap: false,
}
```

---

## 十四、不需要的功能

- ❌ 不需要评论系统
- ❌ 不需要后台 CMS 或用户登录 / 注册
- ❌ 不需要服务端渲染（SSR），纯静态即可
- ❌ 不需要付费 / 订阅功能
- ❌ 不需要站内消息通知

---

## 附录：设计参考来源

| 参考网站 | 借鉴的功能点 |
|----------|------------|
| zarazhang.com | 内容优先、热门文章模块、正文首段作摘要 |
| hzwer.com | 浏览量显示、精选页导航、💎 精品标记 |
| writings.sh | 首页多 Tab 筛选、日期只显示年月 |
| liuchuo.net | 代码块行号结构、语言标签、行号不可选中设计 |
| The Atelier（参考稿） | 整体视觉语言，见《前端界面设计文档 v2.0》 |

---

*文档版本：v2.0 · 2026年3月*
*配套文档：《前端界面设计文档 v2.0》（blog_frontend_ui_v2.md）*
