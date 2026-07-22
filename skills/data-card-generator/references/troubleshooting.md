# 常见翻车场景与修复手册

> 本文件记录了 AI 生成数据卡片时最常出现的错误，以及对应的修复代码。
> 生成完成后，可对照本文件做最终检查。

---

## 🔴 翻车 1：内容被截断、底部看不见

**症状：** 卡片内容被切掉了一半，底部几个条目消失，或者文字溢出卡片边缘。

**根因：** 使用了 `height` 固定高度 + `overflow: hidden`。

**错误代码：**
```css
/* ❌ 错误 */
.poster-container {
    height: 800px;       /* 固定高度，内容超出就截断 */
    overflow: hidden;    /* 超出的全部切掉 */
}
```

**修复代码：**
```css
/* ✅ 正确 */
.poster-container {
    min-height: 800px;   /* 最小高度，内容多时自动撑高 */
    overflow: hidden;    /* 保留 overflow:hidden 是为了裁切气泡，不是为了裁切内容 */
    display: flex;
    flex-direction: column;
}

/* 内容层必须能够自由撑高 */
.content-layer {
    flex: 1;             /* 占满容器剩余空间 */
    display: flex;
    flex-direction: column;
}
```

---

## 🔴 翻车 2：卡片底部大块空白

**症状：** 只有 2-3 个条目，但它们全挤在顶部，下面空着一大片。

**根因：** 数据列表没有用 `flex: 1` 撑满，或者没有设 `justify-content`。

**修复代码：**
```css
/* ✅ 让数据列表占满内容区剩余空间 */
.glass-card {
    flex: 1;
    display: flex;
    flex-direction: column;
}

/* ✅ 2-3 个条目时：均匀分布 */
.glass-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;  /* 条目均匀分布，不堆顶 */
    gap: 0;  /* 关闭 gap，用 space-between 控制间距 */
}

/* ✅ 每个条目也让内容垂直居中 */
.stage-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
```

---

## 🔴 翻车 3：配色烂大街，一眼 AI 味

**症状：** 背景是 `#667eea → #764ba2` 的紫色渐变，或者 `#f093fb → #f5576c` 的粉紫色。

**根因：** AI 训练数据里这类配色出现频率极高，是最容易被默认选择的"保险"颜色。

**修复：** 立即替换为 `references/design-guide.md` 中的精选配色方案。

**快速替换参考：**
```css
/* ❌ 立即替换：最滥用的 5 种渐变 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);  → 方案E
background: linear-gradient(to right, #f093fb, #f5576c);         → 方案D
background: linear-gradient(to right, #43e97b, #38f9d7);         → 方案B
background: linear-gradient(135deg, #ff6b6b, #feca57);           → 方案A
background: linear-gradient(to right, #4facfe, #00f2fe);         → 方案E

/* ✅ 推荐替换：方案A 哑光珊瑚（通用暖色） */
background: linear-gradient(145deg, #fef5ee 0%, #fde8d8 100%);

/* ✅ 推荐替换：方案E 暮光蓝紫（科技调性） */
background: linear-gradient(145deg, #f0eef8 0%, #e2ddf2 100%);
```

---

## 🔴 翻车 4：序号（数字）和标题不在同一行

**症状：** 卡片里的数字"1""2""3"单独占一行，下一行才是标题，看起来非常别扭。

**根因：** 序号 `<span>` 放在了 `.item-header` 容器的外面，导致独自成行。

**错误结构：**
```html
<!-- ❌ 序号在 header 外面，单独成行 -->
<span class="item-num">1</span>
<div class="item-header">
    <span class="badge">STEP 1</span>
    <span class="item-title">标题文字</span>
</div>
```

**修复结构：**
```html
<!-- ✅ 序号在 header 里面，与徽章同行 -->
<div class="item-header">
    <span class="item-num">1</span>
    <span class="badge">STEP 1</span>
    <span class="item-title">标题文字</span>
</div>
```

```css
/* item-header 必须是 flex 容器，子元素才能同行 */
.item-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}
.item-num {
    font-size: 18px; font-weight: 900;
    color: rgba(102, 126, 234, 0.30);
    min-width: 22px; flex-shrink: 0;
    /* 注意：CSS 里的类名必须与 HTML 完全一致，不能写 .item-number-bg */
}
```

---

## 🔴 翻车 5：CSS 类名定义了但 HTML 里没用（或反过来）

**症状：** 某些样式完全不生效，仔细看发现 CSS 写的是 `.command-number`，HTML 写的是 `.command-number-bg`。

**根因：** 类名不一致，浏览器匹配不到。

**预防流程：**
1. 先写 HTML 结构，确定所有类名
2. 再写 CSS，每一个 HTML 类名都必须在 CSS 里有对应定义
3. 生成完成后，搜索 HTML 中的每一个 `class="..."` 值，确认 CSS 里有对应的选择器

```bash
# 检查方法：在代码里全局搜索
# 搜索 HTML 中用到但 CSS 没定义的类名
# 搜索 CSS 定义了但 HTML 没有用到的类名
```

---

## 🟠 翻车 6：下载按钮被卡片遮住，或按钮在卡片内部

**症状：** 按钮看不见，或者按钮包含在卡片里，截图时会把按钮也截进去。

**根因：** `action-wrapper` 被放进了 `poster-wrapper` 内部。

**正确结构（必须平级）：**
```html
<body>
  <!-- 卡片 -->
  <div class="poster-wrapper">
    <div class="poster-container" id="poster">
      ...
    </div>
  </div>
  <!-- 按钮必须在 poster-wrapper 外面，两者是兄弟元素 -->
  <div class="action-wrapper">
    <button id="downloadBtn">保存</button>
  </div>
</body>
```

---

## 🟠 翻车 7：截图有动画残影，气泡位置奇怪

**症状：** 保存的图片里，气泡飘到了奇怪的位置，或者有动画中途的拖影。

**根因：** 截图时没有暂停 CSS 动画。

**修复（截图前加这两行）：**
```javascript
// 截图前暂停动画
const blobs = poster.querySelectorAll('.blob');
blobs.forEach(b => b.style.animation = 'none');

// 截图完成后恢复（放在 .then() 里的 setTimeout 内）
blobs.forEach(b => b.style.animation = '');
```

---

## 🟠 翻车 8：多张卡片上下堆叠，没有横排

**症状：** 两张卡片上下叠放，占满整个屏幕高度，非常浪费空间。

**根因：** 没有使用 `cards-grid` 容器，或者误用了 `flex-direction: column`。

**修复：**
```css
/* ✅ 两张横排 */
.cards-grid {
    display: grid;
    grid-template-columns: repeat(2, 420px);
    gap: 24px;
    justify-content: center;
    align-items: start;
}
```
```html
<div class="cards-grid">  <!-- 所有卡片放进来 -->
    <div class="poster-wrapper"><div id="poster1">...</div></div>
    <div class="poster-wrapper"><div id="poster2">...</div></div>
</div>
<div class="action-wrapper"> ... </div>  <!-- 按钮在 cards-grid 外 -->
```

---

## 🟡 翻车 9：文字全是同一大小，没有层次感

**症状：** 标题、正文、标签都是差不多的字号，整张卡片看起来平平无奇。

**修复：确保至少 3 个字号层级**
```css
.main-title    { font-size: 26px; font-weight: 900; }  /* 大 */
.item-title    { font-size: 15px; font-weight: 700; }  /* 中 */
.item-desc     { font-size: 13px; font-weight: 400; }  /* 小 */
.footer-text   { font-size: 11px; font-weight: 400; }  /* 微 */
.badge         { font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }
```

---

## 🟡 翻车 10：气泡颜色与背景色调不搭

**症状：** 背景是米白暖色，气泡却是霓虹蓝绿，整体色调割裂。

**原则：气泡颜色必须与背景同色系，只是饱和度更高。**

```css
/* ✅ 暖色背景 → 暖色气泡 */
/* 背景：#fef5ee（浅橙米） */
.blob-1 { background: #e8876a; }  /* 珊瑚橙，比背景更饱和 */
.blob-2 { background: #f2c4a0; }  /* 浅桃，与背景同色系 */

/* ✅ 冷色背景 → 冷色气泡 */
/* 背景：#f0eef8（浅紫灰） */
.blob-1 { background: #6b5fb5; }  /* 深紫，比背景更饱和 */
.blob-2 { background: #9e95d0; }  /* 薰衣草，与背景同色系 */

/* ❌ 冷暖混搭（禁止） */
/* 背景：#fef5ee（暖色） */
.blob-1 { background: #74b9ff; }  /* 蓝色气泡 → 色调割裂 */
```

---

## 🟡 翻车 11：9:16 固定高度卡片内容溢出

**症状：** 使用新闻模板或固定 `height: 747px` 的卡片，内容超出边界。

**原因：** 每个事件的文字超过了预算（正文 >60 字）。

**修复：精简文字，严格按预算控制**

| 区域 | 最大字数 | 如超出的处理方式 |
|------|---------|----------------|
| 主标题 | 20 字 | 删减修饰词 |
| 每个事件正文 | 60 字 | 只保留最核心的一个事实 |
| 每个事件标签 | 3 个，每个 ≤6 字 | 删至 2 个 |

```css
/* 同时确保事件卡用 flex: 1 均分高度 */
.ev {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;  /* 这里允许 hidden，因为是固定高度容器 */
}
.ev-body {
    /* 万不得已时可用这个，但必须先精简文字 */
    display: -webkit-box;
    -webkit-line-clamp: 4;  /* 最多显示 4 行 */
    -webkit-box-orient: vertical;
    overflow: hidden;
}
```

---

## 快速自检清单

生成代码后，5 分钟快速检查：

```
□ poster-container 用 min-height，不用 height（9:16 除外）
□ glass-card / 数据列表有 flex: 1
□ action-wrapper 在 poster-wrapper 外面（同级）
□ 配色未使用黑名单中的渐变
□ 气泡颜色与背景同色系
□ 至少 3 个字号层级
□ CSS 类名与 HTML 类名完全一致
□ 截图 JS 有暂停/恢复气泡动画的代码
□ 多卡片用 cards-grid（grid 布局），不用 flex-column
□ 序号在 item-header 内部，不是外部
```

---

## 🔴 翻车 12：poster-container 缺少 flex 声明，内容无法均匀分布

**症状：** 内容全堆在顶部，底部大块空白；或者内容区 `flex: 1` 不生效。

**根因：** `poster-container` 没有 `display: flex; flex-direction: column`，子元素的 `flex: 1` 对没有 flex 上下文的父元素无效。

**修复：**
```css
/* ✅ 必须同时有这两个属性 */
.poster-container {
    display: flex;
    flex-direction: column;
    min-height: 800px;
}
.content-layer {
    flex: 1;
    display: flex;
    flex-direction: column;
}
```

---

## 🔴 翻车 13：时间线所有节点视觉权重相同，找不到重点

**症状：** 3-5 个时间线事件，每个卡片样式完全一样，读者无法判断哪个最重要。

**根因：** 没有为高潮/结论节点设置差异化样式。

**修复：为最重要的节点加视觉强调**
```css
/* 方法 1：最后一个节点加彩色边框 */
.timeline-item:last-child .item-card {
    border-color: var(--accent);
    border-width: 2px;
    background: linear-gradient(145deg, rgba(37,99,235,0.04), #ffffff);
}

/* 方法 2：加"重点"角标 */
.timeline-item.highlight .item-card::before {
    content: '★ 关键';
    position: absolute;
    top: -10px; right: 12px;
    font-size: 9px; font-weight: 700;
    color: var(--accent);
    background: white;
    padding: 1px 8px;
    border: 1px solid var(--accent);
    border-radius: 4px;
}

/* 方法 3：高潮节点标题加色 */
.timeline-item.highlight .item-title {
    color: var(--accent);
}
```

---

## 🔴 翻车 14：信息冗余——同一内容在卡片里出现了两次

**症状：** 时间线正文里提到了"Sam Altman / OpenAI CEO"，底部又做了一张人物介绍卡重复展示。读者感觉在读同一件事两遍。

**根因：** 没有检查新增区块是否与已有内容重复。

**判断标准：**
- 新区块的每一条信息，在卡片其他地方都没有出现 → 保留
- 新区块的信息在其他地方已经出现 → **删除该区块**，用腾出来的空间让现有内容更宽松

**人物展示的正确做法（如果确实需要）：**
```html
<!-- ✅ 每个人物信息是全新的，未在正文出现过 -->
<div class="people-card">
    <!-- 字母头像（代替 emoji） -->
    <div class="avatar" style="background:#10a37f">S</div>
    <div class="people-name">Sam Altman</div>
    <div class="people-role">OpenAI CEO · 前 Y Combinator 主席</div>
    <!-- "前 YC 主席"是新信息，正文里没有 -->
</div>
```

```css
.avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    color: #fff;
    font-size: 16px; font-weight: 900;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 8px;
    box-shadow: 0 3px 0 rgba(0,0,0,0.15);
}
```

---

## 🟠 翻车 15：按钮和小组件的渐变也用了 135deg

**症状：** 背景大色块避开了黑名单渐变，但下载按钮、标签徽章的 `background: linear-gradient(135deg,...)` 照样用了被禁方向。

**根因：** 135deg 禁令只在"背景色"语境下意识到，小组件上没有应用。

**规则：所有渐变，无论在哪个元素上，统一禁止 135deg。**
```css
/* ❌ 按钮也不行 */
.download-btn { background: linear-gradient(135deg, #10a37f, #059669); }

/* ✅ 改为 145deg 或 160deg */
.download-btn { background: linear-gradient(145deg, #10a37f, #059669); }

/* ✅ 标签也一样 */
.tag-pill { background: linear-gradient(145deg, rgba(16,163,127,0.1), rgba(217,119,6,0.1)); }
```

---

## 🟡 翻车 16：正文混入英文单词

**症状：** 中文卡片里出现 `reportedly`、`update`、`anyway` 等英文单词混入句子中间。

**规则：** 纯中文语境的正文不得有未翻译的英文词汇混入。
```
❌ "Altman 被 reportedly 接触 Dario"
✅ "据报道，Altman 接触了 Dario"
✅ "Altman 据悉已接触 Dario"
```
专有名词（人名、产品名、公司名）是例外，不需要翻译。
---

## 🔴 翻车 17：flex 链条中间断裂，flex:1 在子层完全失效

**症状：** `poster-container` 已经有 `display: flex; flex-direction: column`，但 `.body { flex: 1 }` 仍然不生效，内容堆在顶部，底部大片空白。

**根因：** `poster-container` 和 `.body` 之间有一个中间包裹层（如 `.content-layer`），这个中间层没有 `flex: 1; display: flex; flex-direction: column`，导致 flex 链条在此断开。CSS 的 `flex: 1` 只对**直接父元素是 flex 容器**的子元素有效，跨层无效。

**错误结构：**
```css
.poster-container { display: flex; flex-direction: column; }  /* ✅ */
.content-layer { position: relative; z-index: 10; }           /* ❌ 没有 flex，链条断裂 */
.body { flex: 1; display: flex; flex-direction: column; }     /* 无效，父级不是 flex 容器 */
```

**修复：flex 链条每一层都必须透传**
```css
.poster-container { display: flex; flex-direction: column; min-height: 800px; }
.content-layer    { flex: 1; display: flex; flex-direction: column; position: relative; z-index: 10; }
.body             { flex: 1; display: flex; flex-direction: column; gap: 14px; }
```

**记忆口诀：** 从 `poster-container` 到最内层的数据容器，每一个中间层都要同时有三行：`flex: 1; display: flex; flex-direction: column`。

---

## 🔴 翻车 18：字体 CSS 里用了但 head 里没导入

**症状：** 某个元素的字体看起来不对，和设计意图不符，截图里渲染成了系统默认等宽字体。

**根因：** CSS `font-family` 里写了 `'JetBrains Mono'`，但 `<head>` 的 Google Fonts `<link>` 里只引了 Noto Sans SC 等其他字体，JetBrains Mono 没有导入，浏览器找不到就降级到系统字体。

**检查方法：** 在 CSS 里全文搜索 `font-family`，把所有用到的自定义字体列出来，逐一确认 Google Fonts link 里有对应导入。

**标准 Google Fonts 多字体导入格式：**
```html
<!-- 在一个 link 里同时引入多个字体族，用 & 拼接 -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&family=Noto+Serif+SC:wght@700;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
```

**常用字体族的 Google Fonts 参数：**
```
Noto Sans SC   → family=Noto+Sans+SC:wght@300;400;500;700;900
Noto Serif SC  → family=Noto+Serif+SC:wght@400;700;900
JetBrains Mono → family=JetBrains+Mono:wght@400;600;700
Press Start 2P → family=Press+Start+2P
```

---

## 🟠 翻车 19：时间线日期颜色不区分实体，叙事配色形同虚设

**症状：** 卡片涉及 A、B 两家公司的事件，但时间线里所有日期标签颜色完全一样，读者看不出每条事件在讲哪一方。

**根因：** 只定义了一个 `--accent-red` 给所有日期用，没有按事件归属分配实体颜色。

**修复：**
```css
:root {
    --entity-openai:     #10a37f;   /* OpenAI 绿 */
    --entity-anthropic:  #d97706;   /* Anthropic 橙 */
}
```
```html
<!-- 属于 OpenAI 的事件，日期用 OpenAI 色 -->
<div class="tl-date" style="color: var(--entity-openai)">2023.11</div>
<!-- 属于 Anthropic 的事件，日期用 Anthropic 色 -->
<div class="tl-date" style="color: var(--entity-anthropic)">2025.03</div>
<!-- 同时涉及两方的事件，用渐变或中性灰 -->
<div class="tl-date" style="color: #6b7280">2026.02.19</div>
```

更规范的做法是给时间线条目加实体类：
```html
<div class="timeline-item item-openai"> ... </div>
<div class="timeline-item item-both">   ... </div>
```
```css
.item-openai    .tl-date { color: var(--entity-openai); }
.item-anthropic .tl-date { color: var(--entity-anthropic); }
.item-both      .tl-date { color: #6b7280; }
```
