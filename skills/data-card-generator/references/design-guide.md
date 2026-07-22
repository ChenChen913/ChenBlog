# 数据卡片设计规范手册

> 本文件在 SKILL.md 步骤 2（方案选型）和步骤 3（代码生成）时按需读取。
> 目标：让 AI 生成的卡片在没有用户指导的情况下，也能达到设计师水准。

---

## 一、配色规范

### 1.1 精选配色方案（附完整 hex 代码）

以下配色经过精心挑选，**直接照抄 hex 值**，不要自行发挥。按内容调性选择：

#### 方案 A · 哑光珊瑚（生活 / 情感 / 温暖）
```css
--bg:       linear-gradient(145deg, #fef5ee 0%, #fde8d8 100%);
--blob-1:   #e8876a;  /* 珊瑚橙 */
--blob-2:   #f2c4a0;  /* 浅桃 */
--blob-3:   #fbd5c5;  /* 奶橙 */
--accent:   #c9563a;
--text-pri: #2d1a0e;
--text-sec: #7a4a35;
```

#### 方案 B · 苔藓灰绿（自然 / 健康 / 知识）
```css
--bg:       linear-gradient(145deg, #f2f5f0 0%, #e4ece6 100%);
--blob-1:   #7c9e8f;  /* 苔藓绿 */
--blob-2:   #b5cdc4;  /* 雾霾绿 */
--blob-3:   #d4e2de;  /* 薄荷白 */
--accent:   #3d6b5a;
--text-pri: #1a2e26;
--text-sec: #4d6b5f;
```

#### 方案 C · 深靛金朱（商业 / 励志 / 高端）
```css
--bg:       linear-gradient(145deg, #1a1f3c 0%, #252d54 100%);
--blob-1:   #c84b31;  /* 朱红 */
--blob-2:   #ecb365;  /* 琥珀金 */
--blob-3:   #4a6fa5;  /* 深蓝 */
--accent:   #ecb365;
--text-pri: #f0ece0;
--text-sec: #a09880;
```

#### 方案 D · 玫瑰烟粉（女性 / 美妆 / 情感）
```css
--bg:       linear-gradient(145deg, #fdf0f5 0%, #f8e0e8 100%);
--blob-1:   #c9788e;  /* 玫瑰 */
--blob-2:   #e8b4bc;  /* 浅樱 */
--blob-3:   #f5d0d8;  /* 奶粉 */
--accent:   #a0506a;
--text-pri: #2d1520;
--text-sec: #7a4055;
```

#### 方案 E · 暮光蓝紫（科技 / 思考 / 夜晚）
```css
--bg:       linear-gradient(145deg, #f0eef8 0%, #e2ddf2 100%);
--blob-1:   #6b5fb5;  /* 深紫 */
--blob-2:   #9e95d0;  /* 薰衣草 */
--blob-3:   #c4bfe8;  /* 雾紫 */
--accent:   #4a4080;
--text-pri: #1a1530;
--text-sec: #5a5080;
```

#### 方案 F · 新闻墨白（新闻 / 资讯 / 专业）
```css
--bg:       #f8f8fc;
--accent:   #e63946;  /* 新闻红 */
--ink:      #1a1a2e;
--ink-mid:  #3d3d5c;
--ink-dim:  #8888aa;
--rule:     #e8e8f0;
```

#### 方案 G · 杂志深红（观点 / 专栏 / 人文）
```css
--cover-bg:    #c9302a;   /* 封面色块：深红 */
--cover-accent:#ffdc6a;   /* 强调金色 */
--body-bg:     #fafaf8;   /* 内容区米白 */
--ink:         #1a1a1a;
--ink-mid:     #4a4a4a;
--ink-dim:     #9a9a9a;
--rule-color:  #e0ddd8;
/* 换色方案：将 --cover-bg 改为其他颜色即可整体换调 */
/* 深蓝版：#1e3a5f  |  墨绿版：#1a3a2a  |  炭灰版：#2a2a2a */
```

#### 方案 H · 噪点渐变（创意 / 品牌 / 潮流）
```css
/* 渐变三色决定整体色调，改这三个值即可 */
--grad-a: #ff6b35;    /* 起始：活力橙 */
--grad-b: #c026d3;    /* 中间：品红紫 */
--grad-c: #2563eb;    /* 结束：宝蓝 */
/* 推荐换色组合：
   科技蓝：#00d2ff → #3a7bd5 → #1a1a2e
   自然绿：#56ab2f → #a8e063 → #1a3a2a
   日落橙：#f7971e → #ffd200 → #c9302a
   极光：  #43e97b → #38f9d7 → #667eea  (这个可以用，因为是作为噪点底层不显烂) */
--card-bg: rgba(255, 255, 255, 0.12);     /* 条目毛玻璃 */
--card-border: rgba(255, 255, 255, 0.22);
```

---

### 1.2 🚫 绝对禁止使用的配色（烂大街黑名单）

以下配色被大量 AI 生成工具和免费模板滥用，**识别到就不用，换精选方案**：

```
❌ linear-gradient(135deg, #667eea 0%, #764ba2 100%)   → 最滥用紫色渐变
❌ linear-gradient(to right, #f093fb, #f5576c)          → 粉紫渐变
❌ linear-gradient(to right, #43e97b, #38f9d7)          → 绿青渐变
❌ linear-gradient(135deg, #ff6b6b, #feca57)            → 珊瑚黄撞色
❌ linear-gradient(135deg, #a18cd1, #fbc2eb)            → 烂粉紫
❌ linear-gradient(to right, #4facfe, #00f2fe)          → 蓝青渐变
❌ #ff6b6b + #4ecdc4                                    → 红绿撞色经典烂款
❌ 纯白背景 + 纯彩色圆角卡 + 无纹理                    → 无设计感 UI 套件风
```

禁止使用理由：这些颜色在 2018-2022 年的设计资源包中大量出现，让人一眼看出"AI 生成"。

---

### 1.3 配色使用原则

1. **60-30-10 法则**：背景色占 60%，主题色占 30%，强调色占 10%
2. **深色文字配浅色背景，浅色文字配深色背景**，对比度不低于 4.5:1
3. **气泡颜色与背景同色系，但饱和度更高**，不要跳出整体色调
4. **渐变方向优先 `145deg` 或 `160deg`**，比 `135deg` 更自然
5. **纯色背景需要纹理辅助**，否则单调：可用点阵、菱形暗纹、细线网格（透明度 3-5%）

---

## 二、文字密度管理

### 2.1 内容过多时的处理策略

**判断标准：** 单张卡片超过 6 个数据点，或单个数据点正文超过 60 字。

**处理优先级（依次尝试）：**

1. **拆分为多张卡片**（首选）：超过 5 个数据点时考虑上下篇，使用横排布局
2. **精简文案**：每个数据点正文控制在 2 句话内，删掉修饰性词语
3. **缩小字号**：正文从 `14px` 降到 `12.5px`，行高从 `1.7` 降到 `1.6`
4. **压缩间距**：`gap` 从 `16px` 降到 `12px`，`padding` 从 `20px` 降到 `14px`

**绝对禁止：** 使用 `overflow: hidden` 或 `text-overflow: ellipsis` 截断用户内容。用户的内容必须完整显示，宁可拆卡，也不截断。

---

### 2.2 内容过少时的处理策略

**判断标准：** 卡片底部有明显大块空白（超过卡片高度的 20%）。

**处理方法：**

```css
/* 方法 1：让数据列表撑满剩余空间 */
.glass-card {
    flex: 1;           /* 关键：占满父容器剩余高度 */
    justify-content: space-between;  /* 条目均匀分布，不集中在顶部 */
}

/* 方法 2：让每个条目均分高度 */
.stage-item {
    flex: 1;           /* 所有条目等高 */
    display: flex;
    flex-direction: column;
    justify-content: center;  /* 内容垂直居中在条目内 */
}
```

```css
/* 方法 3：内容少时增大行高和间距，让文字呼吸 */
/* 2-3 个数据点时 */
.stage-content { font-size: 15px; line-height: 1.85; }
.glass-card { gap: 20px; padding: 28px 22px; }
```

**不要做的事：**
- 不要在底部加无意义的空 `div` 或 `padding` 撑高
- 不要让同一张卡片里有的条目文字多、有的条目文字少，造成视觉失衡（解决方案：让每个条目 `flex: 1`）

---

### 2.3 固定高度卡片（9:16）的文字预算

使用 `template-news.html` 这类固定 `height: 747px` 的卡片时，必须遵守文字预算：

| 区域 | 最大字数 |
|------|---------|
| 主标题 | 20 字 |
| 副标题 | 30 字 |
| 每个事件正文 | 60 字 |
| 每个事件标签 | 最多 3 个，每个最多 6 字 |
| 底部署名 | 20 字 |

超出预算时，必须削减正文，**不得削减标题**（标题是用户最想保留的部分）。

---

## 三、布局质量规范

### 3.1 防截断布局：正确的 Flex 结构

绝大多数截断问题来自错误的 flex 使用。正确模式：

```css
/* ✅ 正确：卡片容器用 min-height，不用 height */
.poster-container {
    min-height: 800px;   /* 最小高度，内容撑高时自动扩展 */
    display: flex;
    flex-direction: column;
}

/* ✅ 正确：内容层占满剩余空间 */
.content-layer {
    flex: 1;
    display: flex;
    flex-direction: column;
}

/* ✅ 正确：数据列表自然撑满 */
.glass-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 14px;
}
```

```css
/* ❌ 错误：固定高度导致截断 */
.poster-container {
    height: 800px;        /* 固定高度，内容超出就截断 */
    overflow: hidden;     /* 更严重：直接切掉内容 */
}
```

**例外情况：** 只有 `template-news.html` 等 9:16 固定比例卡片才允许使用 `height: 747px`，并且必须严格控制文字预算（见 2.3 节）。

---

### 3.2 顶部对齐 vs 均匀分布

多个条目时，根据内容数量选择对齐策略：

```css
/* 内容多（4 个以上条目）：紧凑排列，顶部对齐 */
.glass-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    justify-content: flex-start;
}

/* 内容少（2-3 个条目）：均匀分布，充分利用空间 */
.glass-card {
    display: flex;
    flex-direction: column;
    gap: 0;
    justify-content: space-between;
    flex: 1;
}
```

---

### 3.3 标题区比例控制

标题区（含主标题、副标题）不应超过卡片高度的 **25%**。

```css
/* 标题区推荐 margin-bottom */
.header { margin-bottom: 24px; }  /* 3-5 个条目时 */
.header { margin-bottom: 16px; }  /* 6+ 个条目时 */

/* 主标题推荐字号 */
.main-title { font-size: 26-30px; }  /* 标题 ≤ 10 字 */
.main-title { font-size: 22-24px; }  /* 标题 11-16 字 */
.main-title { font-size: 18-20px; }  /* 标题 17+ 字或多行 */
```

---

## 四、视觉质感提升

### 4.1 必须加的微细节（区分普通和精品的关键）

以下细节成本极低，但能让卡片质感提升一个档次：

```css
/* 1. 白色卡片顶部内发光（模拟玻璃厚度感） */
.glass-card {
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.90),
                0 4px 16px rgba(0,0,0,0.06);
}

/* 2. 深色背景卡片顶部高光 */
.ev-card {
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.10),
                0 2px 8px rgba(0,0,0,0.30);
}

/* 3. 渐变文字（标题专用，不要滥用） */
.main-title {
    background: linear-gradient(135deg, #2d1a0e, #7a4a35);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* 4. 徽章/标签的精细处理 */
.badge {
    letter-spacing: 0.5px;    /* 字间距让小字更易读 */
    font-weight: 700;          /* 徽章字重要比正文重 */
    white-space: nowrap;       /* 防止换行 */
}

/* 5. 图标 SVG 与文字的精确对齐 */
.icon-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    line-height: 1;            /* 避免行高影响垂直对齐 */
}
```

---

### 4.2 字体层级（必须区分，不能全用同一字号）

一张卡片里**至少要有 3 个字号层级**：

| 层级 | 用途 | 推荐字号 | 字重 |
|------|------|---------|------|
| 大 | 主标题 | 24-30px | 900 |
| 中 | 条目标题 / 徽章 | 14-16px | 700 |
| 小 | 正文 / 说明 | 12-13.5px | 400 |
| 微 | 标签 / 署名 | 10-11px | 400-600 |

**禁止：** 所有文字都用 14px，没有层次感。

---

### 4.3 气泡背景的正确用法

```css
/* ✅ 气泡颜色与背景同色系，饱和度提高 30% */
/* 背景是浅橙色系时 */
.blob-1 { background: #e8876a; opacity: 0.55; filter: blur(50px); }
.blob-2 { background: #f2c4a0; opacity: 0.65; filter: blur(45px); }

/* ❌ 背景是浅橙，气泡却用蓝色 → 色调割裂 */
.blob-1 { background: #74b9ff; }   /* 禁止 */

/* ✅ 气泡尺寸：大的在角落，小的在中间 */
.blob-1 { width: 260px; height: 260px; top: -70px; left: -70px; }   /* 角落大气泡 */
.blob-2 { width: 220px; height: 220px; bottom: -55px; right: -55px; } /* 对角大气泡 */
.blob-3 { width: 150px; height: 150px; top: 42%; left: 38%; }         /* 中间小气泡 */

/* ❌ 三个气泡同等大小 → 无主次感 */
```

---

### 4.4 卡片圆角规范

```css
/* 圆角层级要一致，外大内小 */
.poster-wrapper  { border-radius: 28-32px; }  /* 最外层最大 */
.glass-card      { border-radius: 20-24px; }  /* 中层 */
.stage-item      { border-radius: 14-16px; }  /* 内层条目 */
.badge           { border-radius: 6-8px;   }  /* 徽章 */
.tag             { border-radius: 4px;     }  /* 最小标签 */

/* 同一层级的元素圆角必须统一 */
/* ❌ 有的 stage-item 是 12px，有的是 20px → 不一致 */
```

---

## 五、内容风格指南

### 5.1 数据点文案写法

| 类型 | 推荐写法 | 禁止写法 |
|------|---------|---------|
| 标题 | 动词打头："识别痛点"、"建立系统" | 名词堆砌："痛点识别系统建立" |
| 正文 | 一句话说清楚，然后补充一个细节 | 抽象概括，没有具体信息 |
| 数字 | 尽量用具体数字："提升 3 倍"、"4 万亿参数" | "大幅提升"、"显著改善" |
| 署名 | "— 来源 / 主题 —" | "作者：XXX" |

---

### 5.2 什么内容适合什么皮肤（快速决策）

| 内容关键词 | 推荐皮肤 | 推荐配色方案 |
|-----------|---------|------------|
| AI、科技、工具、代码 | 苹果极简 / 赛博朋克 | 方案 E（暮光蓝紫）|
| 励志、人生、商业 | 黑金奢华 / 液态玻璃 | 方案 C（深靛金朱）|
| 学习、知识、教育 | 粘土风 / 液态玻璃 | 方案 B（苔藓灰绿）|
| 生活、情感、日常 | 液态玻璃 / 极光渐变 | 方案 A（哑光珊瑚）|
| 新闻、事件、快讯 | 新闻模板 | 方案 F（新闻墨白）|
| 金融、数据、报告 | 新拟态 / 苹果极简 | 方案 C 或 E |
| 美妆、女性、穿搭 | 粘土风 / 液态玻璃 | 方案 D（玫瑰烟粉）|
| 游戏、二次元 | 赛博朋克 / 复古像素 | 赛博霓虹（模板内置）|
| 金句、名言 | 金句引言模板 | 方案 E 或方案 B |
| 产品横评、工具测评 | 评分对比（Layout G） | 方案 E（暮光蓝紫）|
| 品牌观点、深度评论 | 杂志封面（Layout H） | 方案 A（哑光珊瑚）或方案 C（深靛金朱）|
| 观点文章、深度专栏 | 杂志封面模板 | 方案 G（杂志深红，改色块色可换调性）|
| 设计、品牌、潮流创意 | 噪点渐变模板 | 方案 H（三色渐变自由组合）|
| 游戏、怀旧、轻松内容 | 像素复古模板（亮色 8-bit）| NES 内置色板（--px-red/blue/green/yellow）|
| 编程、技术、开发者向 | 极客终端模板 | 磷光绿（默认）/ 改 --term-green 换琥珀/青色 |
| AI 评测、模型对比、评分排名 | AI 评测模板 | 深色科技（内置，绿蓝黄三模型色）|

---

## 六、叙事配色（用颜色讲故事）

当卡片内容涉及**多个实体**（两家公司、两个阵营、对比双方、多个角色），必须为每个实体分配专属颜色，并在整张卡片中**一致使用**。

### 6.1 实体颜色分配

```css
/* 在 :root 里为每个实体声明颜色，全卡统一用这套 */
:root {
    --entity-a: #10a37f;   /* 实体A颜色（如 OpenAI 绿）*/
    --entity-b: #d97706;   /* 实体B颜色（如 Anthropic 橙）*/
}
```

**颜色应该一致出现在：** 时间线节点 · 人物字母头像背景 · 事件卡左侧竖条 · 正文高亮 span · 徽章标签

### 6.2 字母头像（禁止用 emoji 充当头像）

```html
<div class="avatar avatar-a">S</div>   <!-- Sam，用 entity-a 色 -->
<div class="avatar avatar-b">D</div>   <!-- Dario，用 entity-b 色 -->
```
```css
.avatar {
    width: 36px; height: 36px; border-radius: 50%;
    color: #fff; font-size: 16px; font-weight: 900;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 3px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.20);
}
.avatar-a { background: var(--entity-a); }
.avatar-b { background: var(--entity-b); }
```

### 6.3 时间线高潮节点强调

有叙事高潮的时间线，最重要的节点**必须有视觉强化**：

```css
.timeline-item.climax .item-card {
    border: 2px solid var(--entity-a);
    background: linear-gradient(145deg, rgba(16,163,127,0.04), #ffffff);
    position: relative;
}
.timeline-item.climax .item-card::before {
    content: '★ 关键事件';
    position: absolute; top: -10px; right: 12px;
    font-size: 9px; font-weight: 700;
    color: var(--entity-a); background: white;
    padding: 1px 8px; border: 1px solid var(--entity-a); border-radius: 4px;
}
```

### 6.4 无气泡卡片的背景质感

没有气泡动画的浅色卡片，用以下方式增加层次感：

```css
/* 方案1：右下角水印大字 */
.poster-container::after {
    content: attr(data-watermark);   /* HTML 里设 data-watermark="2026" */
    position: absolute; right: -10px; bottom: -20px;
    font-size: 100px; font-weight: 900;
    color: rgba(0,0,0,0.03); line-height: 1; pointer-events: none;
}
/* 方案2：细线网格底纹 */
.poster-container::before {
    content: ''; position: absolute; inset: 0;
    background-image:
        linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
    background-size: 24px 24px; z-index: 0;
}
```
