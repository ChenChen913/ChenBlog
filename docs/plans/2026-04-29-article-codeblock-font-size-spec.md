# 文章代码框与字体大小调节功能 Spec / 执行计划

> **执行要求：** 后续实现必须严格按照本文档逐项执行。每完成一个小目标，就把对应的 `[ ] Goal:` 改成 `[x] Goal:`。每完成一个大阶段，就运行该阶段指定的测试命令，并把结果记录到 `测试记录` 中。

**目标：** 优化文章页阅读体验：先审查当前项目缺陷，再美化每篇文章中的代码框，最后为每篇文章增加“小、标准、大”三档字体大小调节功能。

**整体架构：** 继续让 `src/pages/Post.tsx` 负责文章页和 Markdown 渲染，让 `src/components/CodeBlock.tsx` 负责代码框行为，让 `src/index.css` 负责文章与代码框样式。新增文章阅读字号偏好，使用 `localStorage` 持久化，并通过 `#post-content` 上的 class 或 data 属性控制字号。

**技术栈：** React 19、TypeScript、Vite、Tailwind CSS 4、React Markdown、Shiki、Vitest、React Testing Library、Playwright。

---

## 一、当前项目初步观察

项目是一个 React + TypeScript + Vite 个人博客。文章页核心在 `src/pages/Post.tsx`，代码框核心在 `src/components/CodeBlock.tsx`，Shiki 高亮逻辑在 `src/utils/shiki-highlighter.ts`，大部分文章和代码框样式集中在 `src/index.css`。

目前看到的缺陷、缺点和可补充点：

- `src/pages/Post.tsx` 中有不少乱码注释，部分边界状态下的用户可见文案也像是乱码。这不直接阻塞本次需求，但会增加后续维护难度。
- 代码框功能基本存在，但视觉偏重：圆角过大、阴影较强、渐变层次较多、语言标签像胶囊按钮，整体有点抢文章正文的注意力。
- 当前代码框成功渲染路径主要使用 `div` / `span` 行结构，语义化 `<pre><code>` 不够完整。需要尽量补齐语义，或明确保留当前结构的可访问性替代方案。
- `src/index.css` 里混有旧版和新版代码框样式，例如 `.code-block-wrapper`、`.line-numbers`、`.code-content`、`.code-pre`、`.code-block__*` 同时存在，后续容易互相影响。
- 代码框测试疑似过期：一些测试仍在查旧 Tailwind 类名，例如 `.rounded-full`、`hover:bg-zinc-200/60`、`.shadow-md`，但当前组件已经改成 BEM 风格类名。
- 文章正文字号被固定在 `.article-body { font-size: 1.25rem; line-height: 1.95; }`，用户无法按阅读习惯调节。
- 文章正文标题样式同时存在 `Post.tsx` 内联 style 和 `index.css` 的 `!important` 规则。后续做字号联动时，最好逐步收敛到 CSS 变量。
- E2E 测试文件中也有乱码描述，并且部分选择器比较宽泛。新增测试应优先使用稳定 id、可访问名称或明确约定的类名。

## 二、不做的事情

- 不重做整个博客视觉系统。
- 不替换 Markdown 渲染管线。
- 不新增全局设置页。
- 不修改文章 frontmatter 或 Markdown 写作格式。
- 不引入新的代码高亮库，除非 Shiki 实在无法满足。
- 不大规模清理无关乱码文本，只处理本次触碰到、会影响 UI / 测试 / 可访问性的部分。

## 三、产品需求

### 3.1 代码框需求

- 每篇文章里的 Markdown fenced code block 都要渲染成更好看的代码框。
- 视觉上要更安静、更适合阅读，不要像过度装饰的小组件。
- 保留语言标签、复制按钮、语法高亮、行号、自动换行、加载态、错误 fallback。
- 复制时必须复制原始代码内容，不能复制行号，也不能复制视觉自动换行产生的断行。
- 亮色和暗色主题下都要清晰可读。
- 移动端不能导致页面横向溢出。
- 成功渲染路径应尽量包含语义化 `<pre><code>`，如果由于逐行 token 渲染限制无法完全做到，需要用 ARIA 和测试说明补足。

### 3.2 文章字体大小调节需求

- 每篇文章页都要在文章标题下方显示字体大小控制器。
- 控制器只提供三种模式：
  - 小
  - 标准
  - 大
- 默认值为“标准”。
- 选中模式应影响文章正文内容，包括段落、列表、引用、表格、行内代码和代码框。
- 文章主标题、侧边栏、目录、移动端导航等页面框架不应被该控制器影响。
- 用户选择应保存到 `localStorage`，跨文章和刷新后仍然生效。
- 控制器必须支持键盘操作，并有清晰的 ARIA 标识。

## 四、视觉方向

### 4.1 代码框视觉方向

- 圆角控制在 8px 左右或更小，除非现有系统强烈要求更大。
- 减少强渐变和大阴影。
- 使用细边框、安静背景、清晰头部和紧凑按钮。
- 行号低对比但必须可读。
- 代码字体继续使用 JetBrains Mono / monospace。
- 复制按钮优先使用图标，并提供可访问名称；宽屏可显示简短文字。
- 长语言名和窄屏情况下，头部不能溢出。

### 4.2 字号控制器视觉方向

- 使用 segmented control（三段式切换），不要做成三个分散按钮。
- 放在 `#post-title` 下方、正文之前，读者开始阅读前就能看到。
- 文案简短，例如中文下显示“字体大小”。
- 必须有清晰选中态、focus 态、hover 态。

## 五、字号比例

使用 CSS 变量统一控制，避免散落硬编码。

正文建议：

- 小：正文 `1.0625rem`，段落 / 列表行高 `1.9`
- 标准：正文 `1.25rem`，段落 / 列表行高 `2.05`
- 大：正文 `1.4375rem`，段落 / 列表行高 `2.08`

代码框建议温和缩放：

- 小：代码 `0.84rem`
- 标准：代码 `0.92rem`
- 大：代码 `1rem`

正文内部标题：

- H1 / H2 / H3 保持层级，但跟随字号模式做适度变化。
- 文章主标题 `#post-title` 不跟随变化。

## 六、Goal 勾选规则

执行时使用以下约定：

- `[ ] Goal:` 表示未完成。
- `[x] Goal:` 表示已完成。
- 每完成一个小目标，立刻更新本文档。
- 每完成一个阶段，必须运行该阶段的测试命令。
- 每个阶段的 `测试记录` 必须写明：命令、通过 / 失败、简短原因。

## 七、阶段 1：基线审查

**涉及文件：**

- 读取：`src/pages/Post.tsx`
- 读取：`src/components/CodeBlock.tsx`
- 读取：`src/components/CodeBlock.types.ts`
- 读取：`src/utils/code-extraction.ts`
- 读取：`src/utils/shiki-highlighter.ts`
- 读取：`src/index.css`
- 读取：`src/components/*.test.tsx`
- 读取：`tests/e2e/blog.spec.ts`

**目标：**

- [x] Goal: 运行 `npm run lint`，记录 TypeScript 当前状态。
- [x] Goal: 运行 `npm run test:run`，记录单元测试当前状态。
- [x] Goal: 运行 `npm run build`，记录生产构建当前状态。
- [x] Goal: 区分哪些失败是修改前已经存在，哪些是后续实现引入。
- [x] Goal: 判断旧代码框测试应更新、替换还是拆分。

**阶段测试：**

```bash
npm run lint
npm run test:run
npm run build
```

**测试记录：**

- `npm run lint`：通过，TypeScript 当前无报错。
- `npm run test:run`：失败。共 5 个测试文件运行，其中 `src/components/CodeBlockHeader.test.tsx`、`src/components/CodeBlock.test.tsx`、`src/components/CodeBlockCopy.test.tsx` 失败，合计 54 个失败测试；失败集中在旧 Tailwind 类名、旧文案 `Copied!` / `Failed`、旧大小写语言标签，以及异步高亮加载态未等待。
- `npm run build`：通过。Vite 构建成功，但有既有警告：`texture.png` 构建时未解析，以及部分 chunk 大于 500 kB。
- 结论：当前失败是修改前已经存在的代码框测试契约过期问题。阶段 2 应重写这三个测试文件，改为断言当前与目标行为，而不是旧实现细节。

## 八、阶段 2：确定代码框测试契约

**涉及文件：**

- 修改：`src/components/CodeBlock.test.tsx`
- 修改：`src/components/CodeBlockCopy.test.tsx`
- 修改：`src/components/CodeBlockHeader.test.tsx`
- 修改或新增：`tests/e2e/blog.spec.ts`

**目标：**

- [x] Goal: 更新单元测试，不再断言过期 Tailwind 内部类名。
- [x] Goal: 增加语言标签、行号、代码提取、复制成功、复制失败、fallback 渲染测试。
- [x] Goal: 增加或更新包含代码框的文章 E2E 测试。
- [x] Goal: 增加移动端视口下代码框不撑破页面的断言。
- [x] Goal: 测试优先使用稳定选择器、可访问名称或明确约定的 BEM 类名。

**阶段测试：**

```bash
npm run test:run -- src/components/CodeBlock.test.tsx src/components/CodeBlockCopy.test.tsx src/components/CodeBlockHeader.test.tsx
```

**预期：** 在实现新行为前，测试可以因为目标行为尚未实现而失败，但失败原因必须清楚。

**测试记录：**

- `npm run test:run -- src/components/CodeBlock.test.tsx src/components/CodeBlockCopy.test.tsx src/components/CodeBlockHeader.test.tsx`：失败，但符合阶段预期。16 个测试中 14 个通过，剩余 2 个失败对应阶段 3 目标行为：行号当前 `aria-hidden="false"`，成功渲染路径当前缺少语义化 `pre code`。

## 九、阶段 3：优化代码框组件与样式

**涉及文件：**

- 修改：`src/components/CodeBlock.tsx`
- 修改：`src/components/CodeBlock.types.ts`
- 修改：`src/index.css`
- 必要时修改：`src/utils/shiki-highlighter.ts`

**目标：**

- [x] Goal: 保留现有代码提取、语言识别、Shiki 高亮、缓存、复制、主题检测能力。
- [x] Goal: 改善成功渲染路径的语义化和可访问性。
- [x] Goal: 确保行号不会被复制，也不会参与用户选择。
- [x] Goal: 简化代码框头部视觉，降低装饰感。
- [x] Goal: 用更安静的边框、圆角、背景和阴影替代当前偏重的样式。
- [x] Goal: 确保窄屏和长语言名下头部不溢出。
- [x] Goal: 加载骨架屏尺寸接近最终布局，减少布局跳动。
- [x] Goal: 删除或隔离已废弃的旧代码框 CSS 选择器。
- [x] Goal: 保持亮色 / 暗色主题表现一致。

**阶段测试：**

```bash
npm run test:run -- src/components/CodeBlock.test.tsx src/components/CodeBlockCopy.test.tsx src/components/CodeBlockHeader.test.tsx src/utils/code-extraction.test.ts
npm run build
```

**预期：** 代码框相关测试和构建通过；如果失败，需记录是否为既有问题。

**测试记录：**

- `npm run test:run -- src/components/CodeBlock.test.tsx src/components/CodeBlockCopy.test.tsx src/components/CodeBlockHeader.test.tsx src/utils/code-extraction.test.ts`：通过，4 个测试文件、71 个测试全部通过。
- `npm run build`：首次执行因 `src/index.css` 中旧乱码 `aria-label` 属性选择器在 CSS 重写后无法解析而失败；已将底部导航样式改为 `.mobile-bottomnav` 类选择器，并顺手修正 `MobileBottomBar.tsx` 中两个移动端导航的 `aria-label`。
- `npm run build`：修复后通过。仍保留既有警告：`texture.png` 构建时未解析，以及部分 chunk 大于 500 kB。

## 十、阶段 4：文章字号状态与控制器

**涉及文件：**

- 修改：`src/pages/Post.tsx`
- 修改：`src/index.css`
- 可选新增：`src/components/ArticleFontSizeControl.tsx`
- 可选新增：`src/components/ArticleFontSizeControl.test.tsx`
- 可选新增：`src/utils/article-font-size.ts`

**目标：**

- [x] Goal: 定义字号模式类型：`small | standard | large`。
- [x] Goal: 从 `localStorage` 读取初始模式，非法值安全回退到 `standard`。
- [x] Goal: 用户切换后写入 `localStorage`。
- [x] Goal: 在 `#post-title` 下方渲染三段式控制器。
- [x] Goal: 尽量接入现有语言环境，中文显示“小 / 标准 / 大”。
- [x] Goal: 三个选项都有可访问名称和选中状态。
- [x] Goal: 根据当前模式给 `#post-content` 添加 class 或 data 属性。
- [x] Goal: 不影响文章主标题、侧边栏、目录、移动端导航或全局布局。

**阶段测试：**

```bash
npm run test:run
npm run build
```

**预期：** 单元测试和构建通过。

**测试记录：**

- `npm run test:run`：通过，6 个测试文件、87 个测试全部通过。
- `npm run build`：通过，Vite 生产构建成功。仍保留既有警告：`texture.png` 构建时未解析，以及部分 chunk 大于 500 kB。

## 十一、阶段 5：文章排版缩放

**涉及文件：**

- 修改：`src/index.css`
- 必要时修改：`src/pages/Post.tsx`

**目标：**

- [x] Goal: 用 CSS 变量替换 `.article-body` 中固定字号。
- [x] Goal: 段落、列表、引用、表格、行内代码和代码框一致响应字号模式。
- [x] Goal: 必要时移除正文标题的内联固定字号，改由 CSS 变量控制。
- [x] Goal: 三种字号下代码框行高和行号对齐保持稳定。
- [x] Goal: 大字号移动端下，表格和行内代码不破坏布局。
- [x] Goal: 小字号仍然舒适可读。

**阶段测试：**

```bash
npm run test:run
npm run build
```

**预期：** 单元测试和构建通过。

**测试记录：**

- `npm run test:run`：通过，6 个测试文件、87 个测试全部通过。
- `npm run build`：通过，Vite 生产构建成功。仍保留既有警告：`texture.png` 构建时未解析，以及部分 chunk 大于 500 kB。

## 十二、阶段 6：E2E 与视觉验证

**涉及文件：**

- 修改：`tests/e2e/blog.spec.ts`
- 除非验证发现问题，否则不改生产代码。

**目标：**

- [x] Goal: 增加 E2E：打开文章后切换“小 / 标准 / 大”，验证计算后的正文字号确实变化。
- [x] Goal: 增加 E2E：刷新页面后字号选择仍然保持。
- [x] Goal: 增加 E2E：代码框复制后出现反馈。
- [x] Goal: 增加 E2E：移动端文章页没有横向溢出。
- [x] Goal: 手动检查一篇代码较多文章的亮色主题。
- [x] Goal: 手动检查一篇代码较多文章的暗色主题。
- [x] Goal: 手动检查 375px 移动端视口。

**阶段测试：**

```bash
npm run test:run
npm run build
npm run test:e2e
```

**预期：** 自动化测试全部通过。如果 Playwright 浏览器依赖或环境不可用，记录具体阻塞，并通过 dev server 完成人工验证。

**测试记录：**

- `npm run test:run`：通过，6 个测试文件、87 个测试全部通过。
- `npm run build`：通过，Vite 生产构建成功。仍保留既有警告：`texture.png` 构建时未解析，以及部分 chunk 大于 500 kB。
- `npm run test:e2e`：首次因项目缺少 `@playwright/test` 无法加载 Playwright 配置；已补充 dev dependency。
- `npm run test:e2e`：随后因 `src/index.css` 文件头存在多个 BOM 隐藏字符导致 Vite dev server 报 `Invalid declaration: @import "tailwindcss"`；已清理文件头 BOM。
- `npm run test:e2e`：修复后 16 个 Playwright 测试全部通过，覆盖 Chromium 与 Mobile Chrome。
- 视觉检查：通过 Playwright 截图检查 `typescript-advanced` 文章亮色桌面、暗色桌面真实主题切换、375px 移动端大字号；三种场景均有 3 个代码框，页面横向溢出为 0。
- 额外修正：视觉检查发现桌面端 Back 按钮固定定位会遮挡文章标题，已改为文章流内按钮，避免影响标题和字号控制器。

## 十三、阶段 7：清理与文档

**涉及文件：**

- 必要时修改：`README.md`
- 修改：本文档
- 必要时修改：`.kiro/specs/codeblock-enhancement/*`

**目标：**

- [x] Goal: 移除旧代码框实现留下的未使用 CSS 选择器。
- [x] Goal: 删除或重写断言旧 Tailwind 内部类名的过期测试。
- [x] Goal: 如果 README 记录读者功能，则补充文章字号功能说明。
- [x] Goal: 在本文档记录最终测试结果。
- [x] Goal: 确认没有修改无关项目文件。

**最终测试：**

```bash
npm run lint
npm run test:run
npm run build
npm run test:e2e
```

**预期：** 全部通过；如有剩余失败，必须写明原因和下一步处理建议。

**测试记录：**

- `npm run lint`：通过，`tsc --noEmit` 无报错。
- `npm run test:run`：通过，6 个测试文件、87 个测试全部通过。
- `npm run build`：通过，Vite 生产构建成功。仍保留既有警告：`texture.png` 构建时未解析，以及部分 chunk 大于 500 kB。
- `npm run test:e2e`：通过，Chromium 与 Mobile Chrome 共 16 个 E2E 测试全部通过。
- 清理确认：`src/index.css` 中已查不到 `.code-pre`、`.code-block-wrapper`、`.line-numbers`、`.code-content`、`.loading-skeleton` 等旧代码框选择器；代码框相关组件测试中已查不到旧 Tailwind 类名和旧英文反馈文案断言。
- 文档确认：README 的 Markdown 支持列表已补充“阅读字号：文章页支持小 / 标准 / 大三档调节，并会记住用户偏好”。
- 变更范围确认：当前目录不是 git 仓库，无法使用 `git status`；通过近期文件清单核对，源码与文档变更集中在本次需求相关文件，以及为运行 E2E 补充的 `@playwright/test` 依赖。

## 十四、最终验收标准

- [x] Goal: 每篇文章页标题下方都有“小 / 标准 / 大”三档字号控制。
- [x] Goal: 切换字号后，文章正文立即变化。
- [x] Goal: 字号偏好刷新后仍保留，并能跨文章生效。
- [x] Goal: 代码框视觉比当前实现更干净、更适合阅读。
- [x] Goal: 代码框复制功能仍正常，并有成功 / 失败反馈。
- [x] Goal: 代码框语法高亮在亮色和暗色主题下都正常。
- [x] Goal: 移动端代码框不会造成页面横向滚动。
- [x] Goal: 单元测试覆盖新版 CodeBlock 契约。
- [x] Goal: E2E 测试覆盖字号切换、字号持久化和代码框行为。
- [x] Goal: 生产构建成功。

## 十五、实现注意事项

- 每次只做小范围、聚焦的修改。
- 不要重构整条 Markdown 渲染链路。
- 保留已有 E2E 可能依赖的 id，尤其是 `#post-title`、`#post-content` 和文章容器 id。
- 字号控制不要使用跟视口宽度绑定的 `vw` 缩放，必须使用明确档位。
- 字号控制器不要做成卡片嵌套卡片，也不要变成装饰性组件。
- 代码框颜色要有层次，不要变成单一灰色块。
- 如果某个测试在新改动前已经失败，先记录到对应阶段的 `测试记录`，不要误判为本次改动导致。
