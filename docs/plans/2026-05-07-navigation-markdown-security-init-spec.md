# 文章导航、Markdown、安全防护与初始化文档 Spec / 执行计划

> **执行要求：** 后续实现必须严格按照本文档逐项推进。每完成一个小目标，立刻把对应的 `[ ] Goal:` 改成 `[x] Goal:`，并在阶段测试记录里写明测试命令与结果。每完成一个大阶段，必须启动项目或运行该阶段指定测试，确认项目仍可正常使用。

**目标：** 修复文章进入/退出时的假滑动、恢复文章左侧固定 Back 按钮、补齐 Markdown 语法测试页的渲染能力、审计并升级项目安全防护、补充项目初始化与迁移说明文档。

**技术栈：** React 19、TypeScript、Vite、React Router、Tailwind CSS 4、React Markdown、remark/rehype 插件、DOMPurify、KaTeX、Shiki、Vitest、Playwright、Vercel 静态部署配置。

---

## 一、当前项目观察

本次开始执行前，已经先检查了以下核心文件：

- `src/App.tsx`
- `src/pages/Post.tsx`
- `src/pages/Home.tsx`
- `src/pages/Categories.tsx`
- `src/pages/Highlights.tsx`
- `src/components/Layout.tsx`
- `src/components/PostCard.tsx`
- `src/components/ScrollToTop.tsx`
- `src/utils/markdown.ts`
- `src/posts/markdown-syntax-test.md`
- `src/index.css`
- `src/components/CodeBlock.tsx`
- `tests/e2e/blog.spec.ts`
- `vercel.json`
- `public/robots.txt`
- `README.md`
- `docs/plans/2026-04-29-article-codeblock-font-size-spec.md`

初步看到的问题和风险：

- `src/App.tsx` 里的全局 `ScrollRestoration` 当前会在 `location.pathname` 改变时执行 `window.scrollTo(0, 0)`。这会导致从文章返回列表时无法保留原来的列表滚动位置。
- `src/pages/Post.tsx` 的文章主体使用了 `motion.article`，包含 `initial={{ opacity: 0, y: 20 }}` 和 `exit={{ opacity: 0, y: -20 }}`。这正是用户看到的进入文章和退出文章时的上下滑动假动作之一。
- `src/pages/Home.tsx`、`src/pages/Categories.tsx`、`src/pages/Highlights.tsx` 也使用了带 `y` 位移的 `motion.div`。文章列表页返回时也可能出现不必要的滑动感。
- 上一次修改后，`#back-button` 被放进文章流内，`.post-back-btn` 目前只是桌面端显示的普通按钮，不再是用户希望的“文章左侧固定漂浮按钮”。
- `markdown-syntax-test.md` 本身包含多处 Markdown/HTML 书写错误或转义问题，例如 fenced code block 被写成 `\```，部分 HTML 标签闭合异常，部分有序列表缺少换行。这会让测试文章本身无法作为可靠验收样例。
- 当前 Markdown 渲染管线使用 `ReactMarkdown + remarkGfm + remarkMath + rehypeRaw + DOMPurify + rehypeKatex`，具备一定基础，但高亮语法 `==文本==` 只在段落字符串里做了简易处理，列表、表格、标题、强调内部不一定生效。
- `vercel.json` 已经配置了一批安全响应头，包括 CSP、HSTS、X-Content-Type-Options、Referrer-Policy、Permissions-Policy 等，这是好的基础。
- 当前代码块由 `src/components/CodeBlock.tsx` 和 `src/index.css` 中的 `.code-block__*` 样式共同实现。顶部信息栏包含语言标签和复制按钮，但整体高度、内边距和左右间距偏宽，读文章时会显得头部信息块有些厚。
- 当前代码块主体使用两列 grid 渲染行号和代码内容，`.code-block__line-number` 与 `.code-block__code` 分别设置字体大小、padding 和 line-height。二者虽然接近，但存在轻微视觉错位风险，需要统一行高、字体渲染和垂直对齐基准。
- 当前代码高亮颜色主要来自 Shiki token。亮色模式下部分 token 颜色可能过浅、偏灰白，导致代码可读性不足，需要增加亮色主题对比度审计、颜色兜底或 token 色值修正策略。
- 当前 CSP 允许 `script-src 'unsafe-inline'`，也允许 `style-src 'unsafe-inline'`。对 Vite/React 静态站可能有兼容原因，但仍需要审计能否收紧，不能盲目收紧到破坏项目功能。
- `public/robots.txt` 已存在，但 `Sitemap` 仍是 `https://your-domain.com/sitemap.xml`，迁移或上线时需要文档明确说明要替换为真实域名。防爬取能力不能只依赖 robots，因为 robots 只是约定，不是强制安全边界。
- 项目目前有 README，但缺少面向“AI 快速接手初始化/迁移”的专门 Markdown 文档。
- 仓库目录当前不是 Git 仓库，后续执行时不能依赖 `git status` 来确认变更范围，需要通过文件清单和测试记录控制变更。

---

## 二、总体原则

- 不追求炫酷动效，优先保证文章阅读过程稳定、直接、可预测。
- 进入文章时，用户应直接看到文章顶部，不出现上下滑动假动作。
- 从文章返回列表时，应保留用户在列表中的原滚动位置。
- Back 按钮恢复为桌面端文章左侧固定漂浮形态，并且不能遮挡文章标题、正文、目录或移动端导航。
- Markdown 修复要同时处理“测试文章内容本身”和“渲染管线能力”，不能只改页面样式。
- 代码块继续保持之前已经做好的功能基础，但要进一步压缩顶部信息栏、修正行号对齐、增强亮色模式代码颜色对比度。
- 安全升级必须实际有效，但不能承诺静态站可以“绝对防黑客/绝对防爬取”。目标是合理、强健、可验证的分层防护。
- 任何安全限制都必须通过测试验证不影响正常文章、图片、代码块、数学公式、视频/音频、站内导航、主题切换和字体大小调节。
- 初始化文档必须让另一个 AI 或人类开发者可以在新电脑、新磁盘路径下快速跑起项目。

---

## 三、不做的事情

- 不重做整个博客视觉系统。
- 不替换 React、Vite、React Router 或 Markdown 主渲染方案。
- 不引入后端登录、防火墙、验证码、真实 WAF 等静态站无法本地完成的能力。
- 不为了“防爬取”破坏搜索引擎收录、正常分享链接、正常浏览器访问。
- 不删除用户文章内容，除非是修复 `markdown-syntax-test.md` 这类测试文章里的明显语法错误。
- 不做无关大重构，不清理与本需求无关的历史乱码注释，除非该内容影响 UI、测试、安全或文档准确性。

---

## 四、产品需求

### 4.1 文章进入、返回与滚动位置

- 进入文章详情页时，页面应立即定位到文章顶部。
- 进入文章时不能有 `y` 方向位移动画。
- 退出文章返回列表时，列表页应保持用户离开前的滚动位置。
- 返回首页、分类页、精选页时，都应分别保留各自列表页面的滚动位置。
- 用户主动点击顶部导航切换到另一个主页面时，可以回到该页面顶部，但不能产生假滑动动画。
- 如使用浏览器原生 history scroll restoration，必须和 React Router 当前行为配合稳定。
- 如自定义滚动位置缓存，必须按 pathname/key 区分页面，避免不同列表页互相污染。

### 4.2 Back 按钮

- 文章页桌面端显示左侧固定 Back 按钮，位置在文章主体左侧附近，而不是文章最顶部。
- Back 按钮在文章下滑时保持 fixed/sticky 可见，方便用户随时返回。
- Back 按钮不遮挡文章标题、字体大小调节器、正文、目录或侧边栏。
- Back 按钮优先执行 `navigate(-1)` 返回上一个列表位置；没有可返回历史时回到首页。
- 移动端不强制显示左侧固定 Back，避免和移动端顶部/底部导航冲突。
- Back 按钮应保留键盘可访问性、焦点态、可读 aria-label。

### 4.3 Markdown 语法测试页

- 修复 `src/posts/markdown-syntax-test.md` 中错误的 Markdown/HTML 示例，让它成为可靠验收文章。
- Markdown 测试页至少覆盖：
  - h1-h6 标题
  - 段落、换行、水平分割线
  - 粗体、斜体、粗斜体、删除线
  - 行内代码、 fenced code block
  - 无序列表、有序列表、嵌套列表、任务列表
  - 链接、图片
  - 引用块、多行引用
  - 表格与对齐
  - 行内数学公式、块级数学公式
  - 安全 HTML 标签，如 `mark`、`details`、`summary`
  - 高亮语法 `==文本==`，如果决定支持，就要在多个上下文中稳定渲染；如果不支持，就从测试文章中明确改为不承诺。
- 不允许为了通过测试放开危险 HTML 或危险属性。
- Markdown 测试页在桌面端和移动端都不能造成横向溢出。

### 4.4 代码块视觉与可读性升级

- 代码块顶部信息栏必须更紧凑，减少垂直 padding、左右 padding、语言标签与复制按钮之间的多余间距。
- 顶部信息栏不能因为变窄而影响语言标签识别或复制按钮点击。
- 复制按钮仍必须保留图标、可访问名称、成功/失败反馈。
- 语言标签过长时必须优雅截断或收缩，不能挤压复制按钮，也不能撑爆代码块。
- 代码块主体中，行号和对应代码行必须在同一视觉基线上对齐。
- 行号列和代码列应使用统一的行高变量，避免分别写死造成微小错位。
- 空行、长行、自动换行、加载骨架、fallback 纯文本状态都要保持行号与代码内容对齐。
- 亮色模式下，代码 token 颜色必须有足够对比度，避免出现过浅的灰白色。
- 如果 Shiki 主题本身给出的 token 颜色过浅，需要通过主题选择、颜色映射或亮色模式兜底策略修正。
- 暗色模式也要保持可读，不能因为亮色模式加深而让暗色模式过曝或刺眼。
- 代码块修改不能破坏已有语法高亮、行号、复制、自动换行、移动端不横向溢出等功能。

### 4.5 安全防护

安全升级覆盖以下方向：

- XSS 防护：所有 Markdown raw HTML 必须经过 DOMPurify 或等效安全处理。
- URL 安全：链接、图片、iframe、video、audio 的 `src/href` 必须限制危险协议，禁止 `javascript:`、`data:text/html` 等高风险输入。
- iframe 安全：只允许可信视频来源，例如 YouTube 和 Bilibili；其他 iframe 默认不渲染或降级显示。
- 外链安全：外部链接必须使用 `target="_blank"` 时配套 `rel="noopener noreferrer"`。
- HTML 属性安全：禁止事件属性，如 `onclick`、`onerror`、`onload` 等。
- CSP：审计 `vercel.json` 中 Content-Security-Policy，尽可能收紧但不破坏 Vite 构建产物、字体、图片、KaTeX、视频嵌入等正常功能。
- 安全响应头：继续保留并检查 `X-Content-Type-Options`、`Referrer-Policy`、`Permissions-Policy`、`Strict-Transport-Security`、`X-Frame-Options` 或 `frame-ancestors`。
- 依赖安全：运行 `npm audit`，记录结果；只做低风险升级，不能盲目升级到破坏项目的主版本。
- 爬虫控制：检查 `robots.txt`、`sitemap.xml`、文档说明。必须明确 robots 不是强制防护，真正的恶意爬虫需要部署层限速/WAF/CDN 配合。
- 隐私与密钥：确认 `.env.example`、`.gitignore`、文档中不要求提交真实密钥。
- 不影响功能：安全升级后必须验证文章、代码块复制、字体大小、图片灯箱、数学公式、视频/音频、导航返回均正常。

### 4.6 初始化与迁移文档

新增一个 Markdown 文档，建议路径：

- `docs/PROJECT_INIT_AND_MIGRATION.md`

文档必须包含：

- 项目用途说明。
- 技术栈说明。
- 本地运行前置条件：Node.js、npm、浏览器、Playwright 依赖说明。
- 初始化命令：
  - `npm install`
  - `npm run dev`
  - `npm run lint`
  - `npm run test:run`
  - `npm run build`
  - `npm run test:e2e`
- 常见端口与访问地址：默认 `http://localhost:3000`。
- 目录结构说明。
- 文章新增/编辑流程。
- 环境变量说明。
- 部署注意事项，尤其是 `vercel.json`、`public/robots.txt`、`public/sitemap.xml`。
- 迁移到其他电脑或磁盘时必须保留的内容。
- 可以删除并重新生成的内容。
- 迁移后的验证清单。
- 给 AI 接手项目时的推荐阅读顺序。

迁移说明必须明确：

- 必须保留：`src/`、`public/`、`package.json`、`package-lock.json`、`vite.config.ts`、`vitest.config.ts`、`playwright.config.ts`、`tsconfig.json`、`vercel.json`、`index.html`、`README.md`、`docs/`、`.env.example`、`.gitignore`、`.prettierrc`、`.editorconfig`。
- 通常可以删除/不复制：`node_modules/`、`dist/`、`coverage/`、`test-results/`、`playwright-report/`、`.vite/`、日志文件如 `vite-dev.log`、`vite-dev.err.log`。
- 谨慎处理：真实 `.env` 文件、未备份的本地草稿、未提交或未复制的新文章、截图/报告类临时文件。

---

## 五、阶段计划与 Goal 勾选规则

执行时只修改本文档中列出的相关文件。每完成一个小目标，马上更新 Goal 状态。每个阶段完成后，必须执行该阶段测试。

### 阶段 1：基线复查与问题复现

**涉及文件：**

- 读取：`src/App.tsx`
- 读取：`src/pages/Post.tsx`
- 读取：`src/pages/Home.tsx`
- 读取：`src/pages/Categories.tsx`
- 读取：`src/pages/Highlights.tsx`
- 读取：`src/index.css`
- 读取：`tests/e2e/blog.spec.ts`
- 读取：`vercel.json`
- 读取：`public/robots.txt`
- 读取：`src/posts/markdown-syntax-test.md`

**目标：**

- [x] Goal: 记录当前 `npm run lint` 基线结果。
- [x] Goal: 记录当前 `npm run test:run` 基线结果。
- [x] Goal: 记录当前 `npm run build` 基线结果。
- [x] Goal: 记录当前 `npm run test:e2e` 基线结果。
- [x] Goal: 用浏览器复现文章进入时的滑动、返回列表时滚动位置丢失、Back 按钮位置不符合预期。
- [x] Goal: 记录 Markdown 测试文章中明确失败或写法错误的语法项。
- [x] Goal: 记录当前安全配置已经具备的防护项和缺口。

**阶段测试：**

```bash
npm run lint
npm run test:run
npm run build
npm run test:e2e
```

**测试记录：**

- `npm run lint`：通过，`tsc --noEmit` 无报错。
- `npm run test:run`：通过，6 个测试文件、87 个测试全部通过。
- `npm run build`：通过，Vite 生产构建成功；仍有既有警告：`texture.png` 构建时未解析，以及部分 chunk 大于 500 kB。
- `npm run test:e2e`：通过，Chromium 与 Mobile Chrome 共 16 个测试全部通过。
- 行为复现记录：`src/App.tsx` 中全局 `ScrollRestoration` 在任何 pathname 变化时 `window.scrollTo(0, 0)`，会破坏返回列表时的原滚动位置；`Post.tsx`、`Home.tsx`、`Categories.tsx`、`Highlights.tsx` 均存在 `y` 方向 `motion` 进出场位移；`#back-button` 当前位于文章流内，不是左侧固定漂浮按钮。
- Markdown 问题记录：`markdown-syntax-test.md` 中存在 fenced code block 转义、HTML 标签闭合、有序列表换行、总结清单格式等问题；渲染管线对 `==文本==` 的支持目前仅是段落内简易字符串处理。
- 安全记录：`vercel.json` 已有 CSP、HSTS、nosniff、Referrer-Policy、Permissions-Policy 等基础；仍需补齐 URL 协议校验、iframe 来源限制、外链 rel、DOMPurify 允许项审计、`robots.txt` 占位 sitemap 说明和 `npm audit` 记录。

### 阶段 2：补充导航与滚动行为测试

**涉及文件：**

- 修改：`tests/e2e/blog.spec.ts`
- 必要时新增：`tests/e2e/navigation-scroll.spec.ts`

**目标：**

- [x] Goal: 增加 E2E，验证从首页某个滚动位置进入文章后，文章页处于顶部。
- [x] Goal: 增加 E2E，验证从文章点击 Back 返回首页后，首页滚动位置保持。
- [x] Goal: 增加 E2E，验证分类页进入文章再返回后，分类页滚动位置保持。
- [x] Goal: 增加 E2E，验证精选页进入文章再返回后，精选页滚动位置保持。
- [x] Goal: 增加 E2E 或 DOM/CSS 断言，确认文章页和列表页路由切换不再存在 `y` 方向进入/退出位移动画。
- [x] Goal: 增加桌面端 Back 按钮位置断言，确认它固定在文章左侧且滚动后仍可见。
- [x] Goal: 增加移动端断言，确认 Back 按钮不造成横向溢出或遮挡移动端导航。

**阶段测试：**

```bash
npm run test:e2e
```

**预期：** 在实现阶段 3 之前，新增测试可以失败，但失败原因必须对应当前待修复行为。

**测试记录：**

- 新增 `tests/e2e/navigation-markdown.spec.ts`，覆盖首页/分类页/精选页返回滚动位置、文章顶部定位、源码层禁止 `y` 位移、桌面 Back 左侧固定、移动端不横向溢出，以及 Markdown 测试文章基础渲染。
- `npm run test:e2e -- tests/e2e/navigation-markdown.spec.ts`：按预期失败。失败项集中在当前待修复行为：返回首页/分类页后滚动位置变为 0；`Post.tsx` 等源码仍包含 `y` 位移动画；Back 按钮当前 x 坐标与文章主体相同，尚未固定到文章左侧。精选页测试在不可滚动时会按测试逻辑跳过。

### 阶段 3：修复路由动效、滚动恢复与 Back 按钮

**涉及文件：**

- 修改：`src/App.tsx`
- 修改：`src/pages/Post.tsx`
- 修改：`src/pages/Home.tsx`
- 修改：`src/pages/Categories.tsx`
- 修改：`src/pages/Highlights.tsx`
- 修改：`src/index.css`
- 必要时新增：`src/utils/scroll-restoration.ts`

**目标：**

- [x] Goal: 移除文章页 `motion.article` 的 `y` 方向进入/退出位移。
- [x] Goal: 移除首页、分类页、精选页中不必要的 `y` 方向页面切换位移。
- [x] Goal: 替换当前全局 `ScrollRestoration`，让进入文章页时回到顶部，但从文章返回列表页时保留列表滚动位置。
- [x] Goal: 确保浏览器后退、文章 Back 按钮、直接访问文章链接三种路径都符合滚动规则。
- [x] Goal: 将桌面端 Back 按钮恢复为文章左侧固定漂浮位置。
- [x] Goal: 调整 Back 按钮在 768px、1024px、1280px、1440px 常见宽度下不遮挡正文或标题。
- [x] Goal: 移动端保持布局干净，不出现左侧漂浮 Back 按钮导致的遮挡或横向滚动。
- [x] Goal: 保留 Back 按钮的键盘焦点态、aria-label 和点击逻辑。

**阶段测试：**

```bash
npm run lint
npm run test:run
npm run build
npm run test:e2e
npm run dev
```

**手工检查：**

- 访问 `http://localhost:3000`。
- 在首页向下滚动后进入文章，确认文章顶部正常显示。
- 点击文章左侧 Back，确认回到首页原位置。
- 在文章内向下滚动，确认 Back 按钮始终可见。

**测试记录：**

- `npm run test:e2e -- tests/e2e/navigation-markdown.spec.ts`：通过，7 个有效测试通过、7 个移动/桌面互斥测试按条件跳过。
- `npm run lint`：通过。
- `npm run test:run`：通过，6 个测试文件、87 个测试全部通过。
- `npm run build`：通过；保留既有 `texture.png` 与大 chunk 警告。
- `npm run test:e2e`：通过，新增后共 23 个有效 E2E 测试通过、7 个按条件跳过。
- 实现记录：`ScrollRestoration` 已改为手动管理浏览器滚动恢复，列表页按路径缓存滚动位置，文章页进入时使用 instant top；`Home`、`Categories`、`Highlights`、`Post` 的路由级 `y` 位移已移除；桌面 Back 按钮恢复为 fixed 左侧漂浮，移动端隐藏且无横向溢出。

### 阶段 4：修复 Markdown 测试文章与渲染能力

**涉及文件：**

- 修改：`src/posts/markdown-syntax-test.md`
- 修改：`src/pages/Post.tsx`
- 修改：`src/index.css`
- 必要时修改：`src/utils/markdown.ts`
- 必要时新增：`src/utils/markdown-security.ts`
- 修改或新增：Markdown 相关单元测试/E2E 测试

**目标：**

- [x] Goal: 修复 `markdown-syntax-test.md` 文件中的 fenced code block、列表、HTML 标签、数学公式、总结清单等明显语法错误。
- [x] Goal: 明确 Markdown 测试文章中哪些语法是“承诺支持”，哪些只是说明“不支持/部分支持”。
- [x] Goal: 补齐 h4-h6 的基础样式，避免测试文章标题层级显示失衡。
- [x] Goal: 确保任务列表 checkbox 正确渲染且不破坏列表排版。
- [x] Goal: 确保表格在移动端可横向内部滚动，而不是撑爆页面。
- [x] Goal: 确保 `==文本==` 高亮语法的支持策略明确且测试通过。
- [x] Goal: 确保 raw HTML 中允许的安全标签能显示，危险标签和事件属性被过滤。
- [x] Goal: 为 Markdown 测试文章增加 E2E 覆盖，验证关键语法真实渲染。

**阶段测试：**

```bash
npm run lint
npm run test:run
npm run build
npm run test:e2e
npm run dev
```

**手工检查：**

- 访问 `http://localhost:3000/posts/markdown-syntax-test`。
- 检查所有承诺支持的语法是否按预期显示。
- 检查移动端 375px 宽度无页面级横向溢出。

**测试记录：**

- `npm run lint`：通过。
- `npm run test:run`：通过，6 个测试文件、87 个测试全部通过。
- `npm run build`：通过；保留既有 `texture.png` 与大 chunk 警告。
- `npm run test:e2e -- tests/e2e/navigation-markdown.spec.ts`：通过，Markdown 测试文章的标题、表格、任务列表、mark、高亮、KaTeX、代码块和页面无横向溢出均通过。
- 实现记录：`markdown-syntax-test.md` 已重写为可验收样例；新增 `rehypeHighlightMarks` 统一处理 `==文本==`；CSS 补齐 h4-h6 和任务列表 checkbox 的基础样式。

### 阶段 5：代码块顶部栏、行号对齐与亮色可读性升级

**涉及文件：**

- 修改：`src/components/CodeBlock.tsx`
- 修改：`src/index.css`
- 必要时修改：`src/utils/shiki-highlighter.ts`
- 修改：`src/components/CodeBlock.test.tsx`
- 修改：`src/components/CodeBlockHeader.test.tsx`
- 修改：`src/components/CodeBlockCopy.test.tsx`
- 必要时修改：`tests/e2e/blog.spec.ts`

**目标：**

- [x] Goal: 记录当前代码块顶部信息栏的高度、padding、语言标签和复制按钮布局问题。
- [x] Goal: 压缩 `.code-block__header` 的垂直高度和左右间距，让顶部信息栏更窄、更轻。
- [x] Goal: 确保语言标签和复制按钮在窄屏、长语言名、复制成功/失败反馈状态下不溢出。
- [x] Goal: 保留复制按钮的图标、点击区域、aria-label、成功/失败反馈和键盘可访问性。
- [x] Goal: 统一代码块行号与代码行的 line-height、font-size 或垂直对齐基准。
- [x] Goal: 修复行号与代码内容轻微错位问题，覆盖普通行、空行、长行、自动换行、loading skeleton、fallback 纯文本状态。
- [x] Goal: 审计亮色模式下 Shiki token 颜色，找出过浅、偏灰白、对比度不足的 token。
- [x] Goal: 为亮色模式增加更清晰的 token 色值策略或颜色兜底，让代码文字在白天模式下清楚可读。
- [x] Goal: 确认暗色模式代码颜色仍然舒服、清晰，不因亮色优化被破坏。
- [x] Goal: 增加或更新单元测试，覆盖顶部栏紧凑布局的关键 class/结构、复制按钮状态、行号与代码行数量一致。
- [x] Goal: 增加或更新 E2E/视觉检查，确认代码块在桌面端和移动端没有横向溢出，行号与代码行视觉对齐。

**阶段测试：**

```bash
npm run lint
npm run test:run -- src/components/CodeBlock.test.tsx src/components/CodeBlockHeader.test.tsx src/components/CodeBlockCopy.test.tsx
npm run build
npm run test:e2e
npm run dev
```

**手工检查：**

- 访问 `http://localhost:3000/posts/typescript-advanced`。
- 检查顶部信息栏是否明显更紧凑。
- 检查行号和代码行是否逐行对齐。
- 在亮色模式下检查是否还有很虚、很浅、难以阅读的代码颜色。
- 切换暗色模式，检查代码块仍然清晰。
- 在 375px 移动端宽度检查代码块不造成页面级横向溢出。

**测试记录：**

- `npm run test:run -- src/components/CodeBlock.test.tsx src/components/CodeBlockHeader.test.tsx src/components/CodeBlockCopy.test.tsx src/utils/shiki-highlighter.test.ts`：通过，4 个测试文件、18 个测试全部通过。
- `npm run lint`：通过。
- `npm run build`：通过；保留既有 `texture.png` 与大 chunk 警告。
- `npm run test:e2e -- tests/e2e/blog.spec.ts`：首次执行发现顶部栏高度仍偏高；压缩 header、按钮、窗口圆点和移动端 padding 后复测通过，20 个测试全部通过。
- 实现记录：`src/index.css` 统一了代码块行高变量、行号列宽、行号与代码内容垂直对齐；顶部栏更紧凑；`src/utils/shiki-highlighter.ts` 增加亮色 token 对比度兜底；`tests/e2e/blog.spec.ts` 增加顶部栏高度、行号对齐与亮色 token 对比度验证。

### 阶段 6：安全审计与防护升级

**涉及文件：**

- 修改：`src/pages/Post.tsx`
- 必要时新增：`src/utils/security.ts`
- 必要时新增：`src/utils/markdown-security.ts`
- 修改：`vercel.json`
- 修改：`public/robots.txt`
- 必要时修改：`public/sitemap.xml`
- 修改或新增：安全相关测试

**目标：**

- [ ] Goal: 运行 `npm audit` 并记录结果。
- [ ] Goal: 审计所有 `dangerouslySetInnerHTML`、raw HTML、DOMPurify、iframe、外链、媒体资源入口。
- [ ] Goal: 抽离或整理安全 URL 判断函数，统一禁止危险协议。
- [ ] Goal: 限制 iframe 只允许可信来源，默认拒绝未知 iframe。
- [ ] Goal: 外部链接自动补齐 `rel="noopener noreferrer"`。
- [ ] Goal: 检查 DOMPurify 配置，移除不必要的危险标签或属性，尤其是宽泛 `style` 属性是否必须保留。
- [ ] Goal: 增加 XSS 回归测试，覆盖 script 标签、事件属性、javascript 链接、恶意 iframe。
- [ ] Goal: 审查 CSP，在不破坏功能的前提下尽量收紧。
- [ ] Goal: 更新 `robots.txt` 和 sitemap 相关说明，避免保留占位域名造成迁移误导。
- [ ] Goal: 明确文档说明：静态站的防爬取需要部署层限速、CDN/WAF、访问日志监控配合，项目内只能提供合理基础防护。
- [ ] Goal: 完成安全升级后验证文章阅读、代码复制、图片、视频、音频、数学公式、字体大小、导航返回全部正常。

**阶段测试：**

```bash
npm audit
npm run lint
npm run test:run
npm run build
npm run test:e2e
npm run dev
```

**手工检查：**

- 访问 Markdown 测试文章。
- 访问包含代码块的文章。
- 访问包含图片或视频的文章。
- 检查浏览器控制台是否出现 CSP 阻断正常资源的错误。

**测试记录：**

- 待执行。

### 阶段 7：初始化与迁移文档

**涉及文件：**

- 新增：`docs/PROJECT_INIT_AND_MIGRATION.md`
- 必要时修改：`README.md`

**目标：**

- [ ] Goal: 新增项目初始化与迁移文档。
- [ ] Goal: 写清楚技术栈、初始化命令、开发命令、测试命令、构建命令。
- [ ] Goal: 写清楚目录结构与各目录职责。
- [ ] Goal: 写清楚新增文章、编辑文章、frontmatter 的基本规范。
- [ ] Goal: 写清楚迁移项目时必须保留的文件和目录。
- [ ] Goal: 写清楚可以删除并重新生成的文件和目录。
- [ ] Goal: 写清楚迁移到新电脑/新磁盘后的验证步骤。
- [ ] Goal: 写清楚部署前需要修改的域名、sitemap、robots、环境变量事项。
- [ ] Goal: 在 README 中补充指向该初始化文档的入口。

**阶段测试：**

```bash
npm run lint
npm run test:run
npm run build
```

**文档核对：**

- 所有命令必须与 `package.json` 一致。
- 所有路径必须是真实存在或计划新增的路径。
- 迁移说明不能要求复制 `node_modules/`。

**测试记录：**

- 待执行。

### 阶段 8：最终回归与交付

**涉及文件：**

- 本 Spec 文档
- 所有本次修改过的源码、测试、文档文件

**目标：**

- [ ] Goal: 确认所有小 Goal 已按实际完成情况打勾。
- [ ] Goal: 确认每个阶段都有测试记录。
- [ ] Goal: 运行完整 lint、单元测试、构建、E2E。
- [ ] Goal: 启动项目并给出本地访问地址。
- [ ] Goal: 手工验证用户列出的导航、Back、Markdown、安全、初始化文档、代码块 6 类问题都已处理或有明确说明。
- [ ] Goal: 汇总剩余风险，例如静态站无法单靠前端彻底阻止恶意爬虫。

**最终测试：**

```bash
npm run lint
npm run test:run
npm run build
npm run test:e2e
npm run dev
```

**最终验收标准：**

- [ ] Goal: 进入文章无上下滑动假动作。
- [ ] Goal: 文章页默认显示顶部。
- [ ] Goal: 返回文章列表时保留原滚动位置。
- [ ] Goal: Back 按钮在桌面端恢复到文章左侧固定漂浮位置。
- [ ] Goal: Back 按钮滚动时保持可见且不遮挡内容。
- [ ] Goal: Markdown 语法测试文章中的承诺支持项全部正常渲染。
- [ ] Goal: 代码块顶部信息栏更紧凑，语言标签和复制按钮仍正常可用。
- [ ] Goal: 代码块行号与代码内容逐行对齐。
- [ ] Goal: 亮色模式代码颜色清晰，不再出现难以辨认的浅灰白 token。
- [ ] Goal: 安全防护有明确测试覆盖和配置说明。
- [ ] Goal: 安全升级不破坏项目正常功能。
- [ ] Goal: 初始化与迁移文档完整、可执行、适合 AI 快速接手。
- [ ] Goal: 项目可通过完整测试并可本地访问。

---

## 六、实施注意事项

- 每次修改保持小范围，先测试后继续下一阶段。
- 修改滚动逻辑时，要同时考虑直接打开文章、从首页进入文章、从分类页进入文章、从精选页进入文章、浏览器后退、文章 Back 按钮返回。
- 修改 Back 按钮时，不要只在当前屏幕宽度看起来正常，要用 Playwright 覆盖常见桌面和移动视口。
- 修改 Markdown 渲染时，不要为了支持某个语法而放开危险 HTML。
- 修改 CSP 时，不要一次性过度收紧；每次收紧后都要检查正常资源加载。
- `robots.txt` 只能作为礼貌爬虫规则，不能当成安全边界。
- 任何 `npm audit fix --force` 都不能直接执行，除非先确认不会破坏主版本兼容。
- 因为当前目录不是 Git 仓库，执行时要特别小心记录改动文件，不能依赖 Git 来回滚。
