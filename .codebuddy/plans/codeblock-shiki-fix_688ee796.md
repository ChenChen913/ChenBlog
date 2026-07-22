---
name: codeblock-shiki-fix
overview: "重写 CodeBlock 组件：使用 Shiki codeToHtml 异步高亮，CSS Grid 布局实现行号与代码对齐，white-space: pre-wrap 自动换行，删除斑马纹，深色磨砂玻璃背景。"
todos:
  - id: rewrite-codeblock
    content: 完全重写 CodeBlock.tsx：Shiki 异步高亮 + Grid 布局渲染行号和代码行
    status: completed
  - id: rewrite-codeblock-css
    content: 重写 index.css 代码块样式（第132-386行）：Grid 布局、删除斑马纹、rgba(15,23,42,0.8) 背景、pre-wrap 换行
    status: completed
    dependencies:
      - rewrite-codeblock
---

## 用户需求

完全重写 CodeBlock 组件，解决以下核心问题：

1. **Shiki 高亮不生效**：必须使用原生 Shiki createHighlighter + codeToHtml，通过 useEffect 异步加载高亮 HTML
2. **行号与代码对齐**：使用 CSS Grid 布局（左列行号，右列代码），确保代码折行时行号仍垂直居顶对齐
3. **自动换行**：`white-space: pre-wrap` + `word-break: break-all`
4. **字体强制指定**：`'JetBrains Mono', monospace`
5. **删除所有斑马纹和行号背景色**
6. **背景统一**：`rgba(15, 23, 42, 0.8)` + `backdrop-blur-md`
7. **功能完整**：语言标识 + 一键复制按钮 + Mac 窗口标题栏
8. **纯净实现**：直接用原生 Shiki，不用第三方封装库（rehype-pretty-code 等）

## 技术方案

### 核心思路

完全重写 `CodeBlock.tsx`，将 Shiki 输出按 `<span class="line">` 拆分为行数组，每行渲染为一个 CSS Grid 行（左列行号，右列代码 HTML）。用 React state 管理加载状态，Shiki 未就绪时显示 skeleton 占位。

### CodeBlock.tsx 关键实现

- **Shiki 单例**：保持现有懒初始化模式，主题 `github-light` + `tokyo-night`
- **行拆分**：用正则按 Shiki 的 `<span class="line">` 分割 innerHtml，提取每行的高亮 HTML
- **Grid 渲染**：每行 `display: grid; grid-template-columns: 48px 1fr;`，左列 `<span>` 行号，右列 `<span dangerouslySetInnerHTML>`
- **加载态**：`lines === null` 时渲染等宽 skeleton，不渲染未高亮的纯文本（避免闪烁）

### index.css 关键改动

- 删除全部旧的 `.code-line`、`.code-lines-wrapper`、CSS counter 行号样式
- 新增 `.code-grid`：`display: grid; grid-template-columns: 48px 1fr;`
- `.code-line-num`：行号列，`text-align: right; user-select: none;`
- `.code-line-content`：代码列，`white-space: pre-wrap; word-break: break-all;`
- 背景统一为 `rgba(15, 23, 42, 0.8)` + `backdrop-filter: blur(12px)`（亮色模式用对应浅色）
- 删除所有斑马纹（`nth-child(even)` 背景）和行号背景色

### 不修改的文件

- `Post.tsx`：接口不变（className + children），无需改动
- `index.html`：字体已正确配置
- `@theme --font-mono`：已是 JetBrains Mono

## 文件变更清单

```
src/components/CodeBlock.tsx  # [REWRITE] 完全重写
src/index.css                  # [MODIFY] 第132-386行，重写代码块样式
```