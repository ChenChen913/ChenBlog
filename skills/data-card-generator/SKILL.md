---
name: data-card-generator
description: 将文字/数据转化为美观的 HTML 数据卡片网页，支持高清 PNG 下载。触发场景：帮我做一张卡片、生成数据海报、把这段文字做成图、制作信息卡片、数据可视化卡片、小红书配图、朋友圈数据图、PPT 配图文案。即使用户没有明确说"卡片"，只要请求涉及将文字/数据转化为美观图文形式，也应触发此 Skill。
---

# 数据卡片生成器 (Data Card Generator)

## Skill 简介

本 Skill 用于将用户提供的文字内容，生成一个**单文件 HTML**格式的数据卡片网页。这张卡片设计精美，用户可以在浏览器中打开，点击按钮后保存为高清 PNG 图片，用于小红书、朋友圈、PPT 配图等场景。

---

## 工作流程 (Workflow)

### 步骤 1 - 内容理解

- 判断用户输入是：一段待整理的原始文字，还是已经明确说了"标题是 X、内容是 Y"这类结构化需求
- 如果是原始文字：提炼出 3-6 个核心数据点，每个数据点包含一个小标题（不超过 8 字）和一段说明（不超过 50 字）
- 如果用户已经提供了结构化内容：直接使用，不要擅自改动
- 判断内容体量：如果内容较多、需要拆分为多张卡片，进入**多卡片模式**（详见规则 6）
- **时事新闻类内容：** 如果用户提供的是社会事件、行业争议等需要核实的内容，应先用 web_search 查证事实，再提炼关键信息生成卡片。内容需客观，对有争议的事件应标注判定性质（如"已核实""存在争议"等），并注意区分不同事件的性质（如架构借鉴 ≠ fine-tune，不同来源的模型不可混淆）

### 步骤 2 - 方案选型

- 根据内容数量和用户要求，从**资产库**中选择最合适的尺寸、版式、皮肤、配色
- 如果用户没有指定，使用以下默认值：尺寸=Mobile 手机竖版，版式=经典竖排，皮肤=液态玻璃，配色=方案A 哑光珊瑚
- **配色决策必须读取 `references/design-guide.md` 第一章**：使用精选方案的具体 hex 值，禁止使用黑名单中的配色（黑名单适用于所有渐变，包括按钮和标签，不只是背景）；根据内容调性参考第五章选择匹配的配色方案
- **内容涉及多个实体（两家公司/两个阵营/对比双方）时，必须读取第六章"叙事配色"**：为每个实体分配专属颜色，在时间线节点、头像、高亮文字中一致使用
- 将选型结果简短告知用户（一行即可），例如："我将为你生成：Mobile 竖版 / 经典竖排 / 液态玻璃 / 方案A 哑光珊瑚配色"

### 步骤 3 - 代码生成

- 根据步骤 2 选定的皮肤和布局，从下表找到对应模板，**在模板基础上修改内容，不得从零重建**：

| 皮肤 / 场景 | 起点模板 |
|-------------|----------|
| 液态玻璃（默认） | `templates/template-mobile.html` |
| 赛博朋克 | `templates/template-cyberpunk.html` |
| 黑金奢华 | `templates/template-black-gold.html` |
| 粘土风 | `templates/template-clay.html` |
| 苹果极简 / 极光渐变 / 新拟态 | 以 `templates/template-mobile.html` 为结构起点，重写 `:root` 配色 |
| 复古像素（霓虹绿深色） | `templates/template-pixel.html` |
| 复古像素（8-bit NES 亮色） | `templates/template-pixel-retro.html` |
| 极客终端 / CLI 命令行 | `templates/template-geek-terminal.html` |
| 噪点渐变 / 潮流深色 | `templates/template-noise-gradient.html` |
| 金句引言（Layout D） | `templates/template-quote.html` |
| 杂志封面排版（Layout H） | `templates/template-magazine.html` |
| 新闻速报 / 时事事件 / 9:16 | `templates/template-news.html` |
| 大数字统计（Layout F，数据报告） | `templates/template-stats.html` |
| 时间线流程（Layout E，步骤/历程） | `templates/template-timeline.html` |
| AI 大模型横评 / 评分对比 | `templates/template-ai-benchmark.html` |
| 两张卡片横排 | `templates/template-multi-card.html` |
| 三张卡片横排 | `templates/template-3col-grid.html` |
| Desktop 宽卡 / 对比版式（Layout B） | `templates/template-desktop.html` |
| 安装引导 / 软件配置（浅色文档风） | `templates/template-install-guide.html` |
| 操作手册 / 命令步骤（深色沉浸风） | `templates/template-operation-manual.html` |
| 转化漏斗（曝光→点击→加购→成交）| `templates/template-funnel.html` |
| 排行榜 TOP 5（颁奖台 + 进度条）| `templates/template-ranking.html` |
| 项目进度（里程碑 + 四状态汇总）| `templates/template-project-progress.html` |
| 健康数据（环形进度 + 多指标网格）| `templates/template-health.html` |
| 告警监控（等级色 + 状态告警列表）| `templates/template-alert-monitor.html` |

- 四张及以上卡片：以 `templates/template-3col-grid.html` 为起点，将 `grid-template-columns` 改为 `repeat(2, 420px)` 实现 2×N 网格
- 所有皮肤和版式均有专属模板，**禁止从零重建**，只需替换数据区文字和 `:root` 颜色变量
- 版式选择不确定时，读取 `references/layout-patterns.md` 查看各版式的完整代码片段
- **生成前必须读取 `references/design-guide.md`**：
  - 第二章：根据内容多少决定是否拆卡，以及如何处理留白问题
  - 第三章：使用正确的 flex 结构防截断，控制标题区比例
  - 第四章：加入微细节提升质感（内发光、字体层级、气泡色调一致性、圆角层级）
- 严格按照**技术规范**章节的所有规则，生成完整的单文件 HTML 代码
- **生成前必须过一遍规则 9 的内容设计规范**：检查是否存在信息冗余、emoji 头像、英文词混入中文、叙事配色缺失等问题，这些问题在代码生成阶段就必须排除
- 代码必须完整可运行，不能有任何省略号或"此处省略"

### 步骤 4 - 代码交付

- 将完整 HTML 代码放在一个代码块中输出
- 在代码块下方，用简短的说明告诉用户：如何修改卡片标题、如何修改内容文字（指向 CSS :root 区域和 HTML 数据区）
- **输出前对照 `references/troubleshooting.md` 末尾的"快速自检清单"做最终检查**，发现问题直接在输出前修正，不要等用户反馈

### 步骤 5 - 等待反馈

- 询问用户是否需要调整版式、配色或内容

---

## 资产库 (Assets Library)

### 尺寸库 (3 种)

| 名称 | 规格 | 适用场景 |
|------|------|----------|
| Mobile 手机竖版 | max-width: 420px, min-height: 800px | 小红书、朋友圈 |
| 9:16 竖屏故事版 | width: 420px, height: 747px（固定比例）| Instagram Story、新闻速报、事件卡 |
| Desktop 电脑横版 | max-width: 900px, min-height: 500px | PPT、网页配图 |
| Square 正方形 | width: 600px, height: 600px | Instagram、头像 |

### 版式库 (6 种)

| 名称 | 描述 | 适用场景 |
|------|------|----------|
| Layout A 经典竖排 | 数据块垂直分布，每项含徽章+正文 | 3-5 个数据点的深度内容 |
| Layout B 横向对比 | 左右分栏，中间分割线 | 两组内容对比（传统 vs 新方式等）|
| Layout C 九宫格 | Grid 自动适配列数（2列或3列）| 6 个以上并列内容，每项较短 |
| Layout D 金句引言 | 居中大字号，衬线字体，极简留白 | 单条金句、名言、每日一句 |
| Layout E 时间线 | 竖向轴线+节点，步骤卡片依次排列 | 流程步骤、历史时间轴、成长历程 |
| Layout F 大数字统计 | 主指标大数字 + 次级2×2网格 + 洞察列表 | 数据报告、年度总结、指标一览 |
| Layout I 安装引导 | 步骤卡 + 代码块 + URL 徽章 + 提示/警告框 | 软件安装、配置教程、操作步骤 |
| Layout J 转化漏斗 | 梯形色块逐层收窄 + 转化率箭头 | 用户转化链路分析、渠道漏斗 |
| Layout K 排行榜 | TOP3 颁奖台 + 4-5名进度条列表 | 销售/业绩/内容排名 |
| Layout L 状态看板 | 横幅告警 + 指标格 + 分级告警列表 | 系统监控、运维状态、项目看板 |
| Layout G 评分对比 | 总评概览行 + 分项进度条打分卡 | 产品横评、工具测评、多维度评分 |
| Layout H 杂志封面 | 全宽色块标题 + 引言 + 正文列表 | 观点输出、品牌内容、深度评论 |

### 皮肤库

| 名称 | 视觉风格 | 适合内容 | 专属模板 |
|------|----------|----------|----------|
| 液态玻璃（默认） | 半透明毛玻璃 + 彩色气泡 | 通用 | `templates/template-mobile.html` |
| 赛博朋克 | 深色 + 霓虹描边 | 科技/游戏 | `templates/template-cyberpunk.html` |
| 黑金奢华 | 纯黑底 + 金色 | 励志/高端 | `templates/template-black-gold.html` |
| 粘土风 | 圆润大圆角 + 堆叠阴影 | 生活/教育 | `templates/template-clay.html` |
| 复古像素（深色霓虹） | 黑底 + 霓虹绿像素字 | 编程/游戏 | `templates/template-pixel.html` |
| 复古像素（亮色8-bit） | LCD 黄绿底 + NES 色板 | 游戏/怀旧 | `templates/template-pixel-retro.html` |
| 极客终端 | 磷光绿 + monospace | 技术/开发者 | `templates/template-geek-terminal.html` |
| 噪点渐变 | mesh gradient + noise纹理 | 设计/潮流 | `templates/template-noise-gradient.html` |
| 杂志封面 | 大色块 + 印刷排版 | 观点/深度 | `templates/template-magazine.html` |
| 新闻速报 | 新闻红 + 白色信息卡 | 资讯/事件 | `templates/template-news.html` |
| 苹果极简 / 极光渐变 / 新拟态 | — | — | 以 `templates/template-mobile.html` 为起点重写配色 |
| 安装引导（浅色文档风） | 蓝白简洁，代码块+提示框 | 教程/引导 | `templates/template-install-guide.html` |
| 操作手册（深色沉浸风） | 深色+橙色强调，命令高亮 | 步骤/命令 | `templates/template-operation-manual.html` |

### 配色库 (6 套)

| 编号 | 名称 | 主色 | 适用场景 |
|------|------|------|----------|
| 1 | 梦幻马卡龙（默认） | 粉紫蓝柔和色 | 生活/情感类 |
| 2 | 商务深蓝 | 深蓝 + 白 | 商业/职场类 |
| 3 | 森林大地 | 绿棕米 | 自然/健康类 |
| 4 | 日落秋日 | 橙红黄 | 励志/人文类 |
| 5 | 赛博霓虹 | 紫粉青荧光色 | 科技/潮流类 |
| 6 | 高级灰底 | 灰 + 黑白 | 极简/设计类 |

---

## 技术规范 (Critical Rules - 必须完整遵守)

### ⚠️ 规则 1：下载按钮必须处于正常文档流，禁止使用 position: fixed

**错误做法（禁止）：** 把下载按钮设置为 `position: fixed` 固定在页面底部。

**正确做法：** 卡片区域和下载按钮都处于普通文档流中，`poster-wrapper`（或多卡片时的 `cards-grid`）在上，`action-wrapper` 在下，两者平级。

**单张卡片必须使用以下 HTML 结构：**

```html
<body>
  <div class="poster-wrapper">
    <div class="poster-container" id="poster">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
      <div class="content-layer">
        <!-- 标题区、数据卡片等 -->
      </div>
    </div>
  </div>

  <!-- ✅ action-wrapper 必须在 poster-wrapper 外面，两者平级 -->
  <div class="action-wrapper">
    <button class="download-btn" id="downloadBtn">保存为高清图片</button>
  </div>
</body>
```

---

### ⚠️ 规则 2：截图必须使用 html-to-image 库，禁止使用 html2canvas

**原因：** html2canvas 无法正确渲染 backdrop-filter（毛玻璃）和复杂 CSS 渐变，截图会失真。

**必须在 `<head>` 中引入：**

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js"></script>
```

**下载按钮的 JS 逻辑必须完整照抄以下代码，不能修改结构：**

```javascript
const downloadBtn = document.getElementById('downloadBtn');
const poster = document.getElementById('poster');

downloadBtn.addEventListener('click', () => {
    const originalText = downloadBtn.innerText;
    downloadBtn.innerText = '正在生成超清原图...';
    downloadBtn.disabled = true;

    // 截图前暂停所有 CSS 动画，防止气泡飘到中途被冻结
    const blobs = poster.querySelectorAll('.blob');
    blobs.forEach(b => b.style.animation = 'none');

    htmlToImage.toPng(poster, {
        pixelRatio: 3,
        style: { transform: 'none' }
    })
    .then(function (dataUrl) {
        const link = document.createElement('a');
        link.download = 'DataCard_Export.png';
        link.href = dataUrl;
        link.click();
        downloadBtn.innerText = '保存成功 ✅';
        setTimeout(() => {
            downloadBtn.innerText = originalText;
            downloadBtn.disabled = false;
            blobs.forEach(b => b.style.animation = ''); // 恢复动画
        }, 2000);
    })
    .catch(function (error) {
        console.error('生成失败:', error);
        downloadBtn.innerText = '生成失败，请重试';
        blobs.forEach(b => b.style.animation = ''); // 恢复动画
        setTimeout(() => {
            downloadBtn.innerText = originalText;
            downloadBtn.disabled = false;
        }, 2000);
    });
});
```

**说明：**
- `pixelRatio: 3`：3 倍超清像素，确保截图文字清晰不模糊，不能删
- `style: { transform: 'none' }`：修复某些浏览器的渲染偏移 Bug，不能删
- 截图前暂停 `.blob` 动画：防止气泡浮动到一半被截图冻结，截完后必须恢复

---

### ⚠️ 规则 3：所有可修改的变量必须集中在 CSS :root 区域

在 `<style>` 标签最顶部，必须用 `:root` 声明所有颜色、圆角、尺寸变量，方便用户直接修改。

```css
:root {
    /* === 用户可修改区域 === */
    --card-width: 420px;             /* 卡片最大宽度 */
    --card-bg: linear-gradient(...); /* 背景色 */
    --accent-color-1: #a1c4fd;       /* 主题色 1 */
    --accent-color-2: #ffc3a0;       /* 主题色 2 */
    --text-primary: #333333;         /* 主要文字颜色 */
    --text-secondary: #666666;       /* 次要文字颜色 */
    --border-radius: 24px;           /* 卡片圆角 */
}
```

---

### ⚠️ 规则 4：HTML 数据内容必须集中放置，便于用户修改

所有用户可能需要修改的文字（标题、副标题、各数据点内容）都必须集中放在 HTML 的一个区域内，并在该区域上方用注释标注：

```html
<!-- ===== 用户数据区，修改这里的文字即可 ===== -->
<h1 class="main-title">卡片主标题</h1>
<p class="sub-title">副标题或描述</p>
<!-- 数据点内容 -->
<!-- ===== 数据区结束 ===== -->
```

---

### ⚠️ 规则 5：内容数量与质量标准

- 单张卡片的独立数据点：最少 2 个，最多 8 个
- **版式选择：** 超过 6 个数据点且用户未指定版式时，推荐使用 Layout C 九宫格，应在生成前告知用户并说明原因
- 每个数据点的小标题：不超过 10 个汉字
- 每个数据点的说明文字：移动端不超过 50 字，桌面端不超过 80 字
- 卡片必须有主标题（可以没有副标题）
- 卡片底部建议加一行署名或来源信息（如"— AI 探索笔记 —"）

---

### ⚠️ 规则 6：多张卡片使用横向网格布局，禁止垂直堆叠

当内容需要生成 **2 张或以上**卡片时，必须将所有卡片横向并排展示。

**卡片数量与列数的对应关系：**

| 卡片数量 | 列数 | 原因 |
|----------|------|------|
| 1 张 | 1 列 | 单卡片居中即可 |
| 2 张 | 2 列 | 左右并排 |
| 3 张 | 3 列 | 三列均分 |
| 4 张 | 2 列 | 4 列过于拥挤，改为 2×2 网格 |
| 5-6 张 | 3 列 | 每行 3 张 |
| 7 张以上 | 3 列 | 每行 3 张，自动换行 |

**必须使用以下 HTML/CSS 结构：**

```css
/* 网格容器：横向排列所有卡片 */
.cards-grid {
    display: grid;
    grid-template-columns: repeat(2, 420px); /* 2 张卡片；3 张改为 repeat(3, 420px) */
    gap: 24px;
    justify-content: center;
    align-items: start; /* 卡片高度不一时顶部对齐，不拉伸 */
}

/* 多卡片时，poster-wrapper 宽度由 grid 控制，不再需要 max-width */
.poster-wrapper {
    width: 420px;
    border-radius: 24px;
    overflow: hidden;
}
```

```html
<body>
  <!-- 页面标题（可选） -->
  <div class="page-header"> ... </div>

  <!-- 横向网格：所有卡片放在这一个容器里 -->
  <div class="cards-grid">
    <div class="poster-wrapper">
      <div class="poster-container" id="poster1"> ... </div>
    </div>
    <div class="poster-wrapper">
      <div class="poster-container" id="poster2"> ... </div>
    </div>
  </div>

  <!-- ✅ 下载按钮区域在 cards-grid 外面，每张卡片对应一个按钮 -->
  <div class="action-wrapper">
    <button class="download-btn" id="downloadBtn1">保存第 1 张</button>
    <button class="download-btn" id="downloadBtn2">保存第 2 张</button>
  </div>
</body>
```

**多卡片 JS 规范：** 每张卡片单独绑定一个下载按钮；截图逻辑与规则 2 完全相同，poster 和 downloadBtn 的 id 分别用数字后缀区分（poster1/poster2、downloadBtn1/downloadBtn2）。

---

### ⚠️ 规则 7：CSS 类名必须与 HTML 严格一致，禁止混用

当新卡片的版式与 `templates/template-mobile.html` 差异较大（如改为命令列表卡、对比卡等新结构），需要为新结构独立定义 CSS 类名。

**必须遵守以下原则：**
- CSS 里定义什么类名，HTML 里就用什么类名，完全一致
- 禁止 CSS 定义 `.foo`，HTML 却用 `.foo-bg` 或 `.foo-item`（类名不一致会导致样式完全失效）
- 在开始写 CSS 之前，先列出所有新 HTML 元素的类名，再逐一在 CSS 中对应定义，不得遗漏

### ⚠️ 规则 8：设计质量自查清单（生成后对照检查）

在输出代码前，对照以下清单自查，不合格的项目必须修正后再输出：

**配色自查：**
- [ ] 配色来自 `references/design-guide.md` 精选方案，未使用黑名单配色
- [ ] 气泡颜色与背景色调同系，无明显色彩割裂
- [ ] **所有渐变（含背景、按钮、标签、分割线）** 方向为 `145deg` 或 `160deg`，禁止 `135deg`

**布局自查：**
- [ ] `poster-container` 有 `display: flex; flex-direction: column`，否则内容层无法使用 `flex: 1`
- [ ] **flex 链条完整**：`poster-container → 中间包裹层（如 content-layer）→ body` 每一层都要有 `flex: 1; display: flex; flex-direction: column`，任何一层断掉，下层的 `flex: 1` 全部失效
- [ ] 卡片容器有 `min-height: 800px`（9:16 固定比例模板除外），防止内容过少时卡片过矮
- [ ] 内容区有 `flex: 1`，不会在底部留大块空白
- [ ] 数据点少于 4 个时，条目有 `flex: 1 + justify-content: center`，不扎堆顶部
- [ ] 所有用户内容完整显示，无 `overflow: hidden` 截断

**字体自查：**
- [ ] 至少有 3 个字号层级（标题 / 条目标题 / 正文）
- [ ] 正文字号不超过 14px，标题字重 900，正文字重 400

**细节自查：**
- [ ] 白色卡片有 `inset 0 1px 0 rgba(255,255,255,0.90)` 顶部内发光
- [ ] 圆角遵循"外大内小"原则
- [ ] CSS 类名与 HTML 完全一致，无混用
- [ ] CSS 中 `font-family` 使用的每一种字体，都已在 `<head>` 的 Google Fonts `<link>` 里导入；未导入的字体会降级成系统字体，截图里渲染效果与预期不符

### ⚠️ 规则 9：内容设计规范（防止低质量生成）

**禁止信息冗余：**
- 在卡片某处已经出现的人名、公司名、核心事实，**不得在同一张卡片的其他区块里重复展示**
- 例：时间线里已提到"Sam Altman / OpenAI CEO"，底部就不应再加一张"人物介绍卡"重复这些信息
- 每个新增区块必须提供前面没有出现过的信息，否则删除该区块

**时间线/多步骤内容的视觉权重分配：**
- 有明确高潮/结论的时间线，**最重要的那个节点必须有更强的视觉区分**，可用：加粗边框、强调色背景、增大标题字号、或在卡片内加"重点"角标
- 所有条目样式完全相同 = 没有叙事重心 = 读者无法判断哪个最重要
- 推荐做法：用 `:last-child` 或专属类名为高潮条目设置强调样式

**人物/头像的正确处理：**
- 禁止用 emoji（🔵🟠🔴等）充当人物头像，这是未完成状态的标志
- 正确做法：用姓名首字母 + 品牌色做字母圆圈，例：`.avatar { background: #10a37f; color: #fff; border-radius: 50%; }` 内容为 `S`（Sam）
- 若没有合适的头像方案，直接省略头像，用文字 + 公司色条替代

**文字语言纯净度：**
- 正文中禁止出现 English words 混入中文句子（如 `reportedly`、`anyway`、`update` 等）
- 如需引用英文术语，应加引号或括号：`"reportedly"（据报道）`，或直接翻译

**用颜色讲故事：**
- 当卡片内容涉及多个实体（如两家公司、两个阵营、对比双方），应为每个实体分配专属颜色，并**在整张卡片中一致使用**：时间线节点颜色、日期标签颜色、事件卡左侧竖条颜色、正文高亮词颜色、人物字母头像背景色——全部跟随所属实体的颜色
- 具体做法：在 `:root` 里声明 `--entity-a` 和 `--entity-b`，凡是属于实体A的元素用 `var(--entity-a)`，属于实体B的用 `var(--entity-b)`，绝不混用
- **时间线日期标签**尤其需要体现归属：OpenAI 事件的日期用 OpenAI 色，Anthropic 事件的用 Anthropic 色，同时涉及双方的用渐变或中性色
- 这不是装饰，是视觉叙事：读者扫一眼颜色就知道这段在讲谁

---

## 参考样板说明

本 Skill 提供 24 份官方模板，存放于 `templates/` 文件夹，AI 生成时直接读取对应文件，无需凭空创作：

| 文件名 | 皮肤风格 | 布局 | 适用内容 |
|--------|----------|------|----------|
| `templates/template-mobile.html` | 液态玻璃 · 马卡龙 | Layout A 竖排 | 通用，默认起点 |
| `templates/template-cyberpunk.html` | 赛博朋克 · 霓虹四色 | Layout A 竖排 | 科技、工具、命令速查 |
| `templates/template-black-gold.html` | 黑金奢华 · 罗马序号 | Layout A 竖排 | 励志、商业洞察、高端内容 |
| `templates/template-clay.html` | 粘土风 · 圆润彩色 | Layout A 竖排 | 学习、生活、教育、亲子 |
| `templates/template-pixel.html` | 复古像素 · 霓虹绿深色 | Layout A 竖排 | 游戏、编程、怀旧主题 |
| `templates/template-pixel-retro.html` | 复古 8-bit · NES 亮色 | 像素边框竖版 | 游戏、怀旧、轻松有趣内容 |
| `templates/template-geek-terminal.html` | 极客终端 · 磷光绿 | CLI 命令行风格 | 编程、技术、开发者向内容 |
| `templates/template-noise-gradient.html` | 噪点渐变 · mesh texture | 深色沉浸式竖版 | 设计趋势、创意/品牌、潮流内容 |
| `templates/template-quote.html` | 极简留白 · 衬线大字 | Layout D 金句 | 单条金句、名言、每日一句 |
| `templates/template-magazine.html` | 杂志封面 · 色块+编辑排版 | Layout H 杂志封面 | 深度观点、人物报道、品牌内容 |
| `templates/template-news.html` | 新闻编辑室 · 红白色调 | 9:16 固定比例 | 时事速报、行业动态、事件核查 |
| `templates/template-stats.html` | 深靛金朱 · 大数字 | Layout F 统计 | 数据报告、年度总结、指标一览 |
| `templates/template-timeline.html` | 苔藓灰绿 · 竖向轴线 | Layout E 时间线 | 流程步骤、历史时间轴、成长历程 |
| `templates/template-ai-benchmark.html` | 深色科技 · 评分条 | 数据对比竖版 | AI 模型横评、产品对比、评分排名 |
| `templates/template-multi-card.html` | 暖橙液态玻璃 | 双卡横排（2列）| 内容分上下篇 |
| `templates/template-3col-grid.html` | 三色液态玻璃 | 三卡横排（3列）| 内容分三个模块 |
| `templates/template-desktop.html` | 商务深蓝 · 左右对比 | Layout B 对比宽卡 | 两两对比、横版配图 |
| `templates/template-install-guide.html` | 蓝色文档风 · 浅色 | 安装引导（含代码块/URL/警告框）| 软件安装、环境配置、新手教程 |
| `templates/template-operation-manual.html` | 深色沉浸 · 橙色强调 | 操作手册（含平台标签/命令高亮）| 操作步骤、命令指南、工具使用 |
| `templates/template-funnel.html` | 暮光蓝紫 · 梯形渐变 | 转化漏斗竖版 | 电商转化、用户流失分析、渠道漏斗 |
| `templates/template-ranking.html` | 深靛金朱 · 奖牌颁奖台 | 排行榜（TOP3颁奖台+4-5名列表）| 销售排名、城市排行、业绩榜单 |
| `templates/template-project-progress.html` | 苹果极简 · 蓝绿状态色 | 项目进度（顶部进度条+里程碑列表）| 项目管理、研发进度、任务追踪 |
| `templates/template-health.html` | 森林大地 · 环形指标 | 健康日报（SVG环+指标网格+周趋势）| 健康数据、运动打卡、日报分享 |
| `templates/template-alert-monitor.html` | 深色科技 · 四级告警色 | 监控告警（横幅+系统指标+告警列表）| 系统监控、运维告警、状态看板 |

### 所有模板共同遵守的核心结构规则

无论使用哪个模板，以下规则不变：

1. `poster-wrapper`（或多卡片时的 `cards-grid`）与 `action-wrapper` **平级**，按钮永远在卡片容器外面
2. 每张卡片的截图区域有且仅有一个带 `id="poster"` 或 `id="posterN"` 的元素
3. 截图 JS 在调用 `htmlToImage.toPng` 前先暂停该卡片内的 `.blob` 动画，截完后恢复；**若模板无气泡动画（如 `templates/template-news.html`、`templates/template-magazine.html`、`templates/template-noise-gradient.html`、`templates/template-pixel-retro.html`、`templates/template-geek-terminal.html`、`templates/template-ai-benchmark.html`、`templates/template-install-guide.html`、`templates/template-operation-manual.html`、`templates/template-project-progress.html`、`templates/template-alert-monitor.html`）则跳过此步骤**；可使用 `references/layout-patterns.md` 末尾的封装函数版 JS 代码
4. `:root` 集中声明所有颜色变量；HTML 数据区用 `<!-- ===== 用户数据区 ===== -->` 注释标注边界
5. **新闻模板特有规则**：`templates/template-news.html` 使用 `width: 420px; height: 747px` 固定 9:16 尺寸，内容必须严格控制在卡片高度内，每个事件条目的正文不超过 60 字，标签不超过 3 个，否则会导致内容溢出截断
6. 所有布局版式的完整代码片段（含 CSS + HTML）收录于 `references/layout-patterns.md`，遇到不熟悉的版式直接读取对应章节照抄，不要凭空构建

---

## 边界与限制 (Limitations)

1. 本 Skill 仅输出单文件 HTML，不生成 React 组件或其他格式
2. 卡片截图依赖浏览器环境，需要用户在浏览器中打开 HTML 文件后点击下载按钮
3. 不支持在卡片中嵌入真实图片（用户未提供图片 URL 时，使用纯色/渐变色块代替）
4. 生成的 HTML 使用了 Google Fonts，在无网络环境下字体会降级为系统字体
5. 不保证 IE 浏览器兼容性，仅支持现代浏览器（Chrome、Safari、Edge）
6. 多卡片横向布局主要面向桌面端预览和下载，在手机浏览器上可能超出屏幕宽度
