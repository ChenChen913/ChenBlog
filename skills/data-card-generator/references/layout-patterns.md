# 版式代码片段库

> 当 AI 需要构建特定版式时，直接复制本文件中的代码片段，不要凭空编写。
> 每个片段都经过测试，可直接嵌入模板使用。

---

## Layout A · 经典竖排（3-5 个数据点）

### 标准条目结构

```html
<div class="glass-card">
    <div class="stage-item">
        <div class="stage-number-bg">01</div>
        <div class="stage-title">
            <span class="badge b-1">STAGE 1</span>
            <span class="item-name">条目标题</span>
        </div>
        <div class="stage-content">
            <span class="quote-icon">"</span>正文内容，控制在 50 字以内
        </div>
    </div>
    <!-- 更多条目... -->
</div>
```

```css
/* glass-card 容器 */
.glass-card {
    background: rgba(255, 255, 255, 0.45);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.80);
    border-radius: 24px;
    padding: 24px 18px;
    box-shadow: inset 0 0 15px rgba(255,255,255,0.70),
                0 10px 30px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;  /* 关键：撑满剩余空间，防止底部留白 */
}

/* 单个条目 */
.stage-item {
    position: relative;
    background: rgba(255, 255, 255, 0.90);
    border-radius: 16px;
    padding: 20px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.95),
                0 4px 15px rgba(0,0,0,0.03);
    border: 1px solid rgba(255,255,255,0.95);
    overflow: hidden;
    flex: 1;           /* 每个条目等高，均匀分布 */
    display: flex;
    flex-direction: column;
    justify-content: center;
}

/* 水印大数字 */
.stage-number-bg {
    position: absolute;
    top: -5px; right: 10px;
    font-size: 55px; font-weight: 900;
    color: rgba(0,0,0,0.035);
    font-style: italic; line-height: 1; z-index: 0;
}

/* 标题行（徽章 + 文字同行） */
.stage-title {
    position: relative; z-index: 1;
    display: flex; align-items: center; gap: 10px;
    font-size: 17px; font-weight: 700;
    color: #333; margin-bottom: 12px;
}

/* 渐变徽章（三种颜色，按需扩展） */
.badge { font-size: 12px; padding: 4px 10px; border-radius: 8px; font-weight: 700; letter-spacing: 0.5px; }
.b-1 { background: linear-gradient(135deg, #e0c3fc, #8ec5fc); color: #4834d4; }
.b-2 { background: linear-gradient(135deg, #ffecd2, #fcb69f); color: #d35400; }
.b-3 { background: linear-gradient(135deg, #fbc2eb, #a6c1ee); color: #6c5ce7; }
.b-4 { background: linear-gradient(135deg, #d4fc79, #96e6a1); color: #1e6b35; }
.b-5 { background: linear-gradient(135deg, #ffd89b, #19547b); color: #0a2d45; }

/* 引用符号 */
.quote-icon { font-family: serif; font-size: 22px; color: #c8d6e5; line-height: 0; vertical-align: bottom; margin-right: 4px; }

/* 正文 */
.stage-content { position: relative; z-index: 1; font-size: 14px; color: #555; line-height: 1.7; text-align: justify; }
```

---

## Layout B · 横向对比（左右分栏）

```html
<div class="compare-grid">
    <!-- 左列 -->
    <div class="compare-col">
        <div class="col-header col-header-left">
            <div class="col-icon icon-left">⚙️</div>
            <div>
                <p class="col-label label-left">BEFORE</p>
                <p class="col-title">传统方式</p>
            </div>
        </div>
        <div class="compare-item">
            <div class="item-dot dot-left"></div>
            <div>
                <p class="item-keyword">关键词</p>
                <p class="item-detail">详细说明文字</p>
            </div>
        </div>
        <!-- 更多条目... -->
    </div>

    <div class="compare-divider"></div>

    <!-- 右列（结构同左列）-->
    <div class="compare-col"> ... </div>
</div>
```

```css
.compare-grid {
    display: grid;
    grid-template-columns: 1fr 1px 1fr;
    gap: 0 32px;
}
.compare-divider {
    background: linear-gradient(to bottom, transparent 0%, rgba(100,116,139,0.25) 15%, rgba(100,116,139,0.25) 85%, transparent 100%);
    width: 1px;
    align-self: stretch;
}
.compare-col { display: flex; flex-direction: column; gap: 12px; }
.col-header {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 18px; border-radius: 14px; margin-bottom: 4px;
}
.col-header-left  { background: linear-gradient(135deg, #dbeafe, #eff6ff); }
.col-header-right { background: linear-gradient(135deg, #ede9fe, #f5f3ff); }
.compare-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 13px 16px;
    background: rgba(255,255,255,0.82);
    backdrop-filter: blur(12px);
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.95);
    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
}
.item-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
.item-keyword { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 3px; }
.item-detail { font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
```

---

## Layout C · 九宫格（6 个以上并列内容）

```html
<div class="grid-container">
    <div class="grid-item">
        <div class="grid-icon">🎯</div>
        <p class="grid-title">标题</p>
        <p class="grid-desc">简短说明</p>
    </div>
    <!-- 继续添加 .grid-item，CSS grid 自动换行 -->
</div>
```

```css
.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);  /* 3 列，6 个条目正好 2 行 */
    gap: 10px;
    flex: 1;
    align-content: start;
}
/* 内容多时改为 2 列 */
/* grid-template-columns: repeat(2, 1fr); */

.grid-item {
    background: rgba(255,255,255,0.88);
    border-radius: 14px;
    padding: 16px 12px;
    text-align: center;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.95),
                0 3px 10px rgba(0,0,0,0.05);
    border: 1px solid rgba(255,255,255,0.95);
    display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.grid-icon  { font-size: 24px; line-height: 1; }
.grid-title { font-size: 13px; font-weight: 700; color: #1e293b; }
.grid-desc  { font-size: 11px; color: #64748b; line-height: 1.5; }
```

---

## Layout E · 时间线（步骤 / 历程 / 流程）

```html
<div class="timeline">
    <div class="step">
        <div class="step-node">1</div>
        <div class="step-card">
            <div class="step-top">
                <span class="step-title">步骤标题</span>
                <span class="step-time">第 1 周</span>  <!-- 可改为日期、阶段等 -->
            </div>
            <p class="step-desc">步骤说明，控制在 40 字以内</p>
            <span class="step-outcome">输出成果</span>  <!-- 可选 -->
        </div>
    </div>
    <!-- 更多步骤... -->
</div>
```

```css
.timeline { display: flex; flex-direction: column; gap: 0; position: relative; flex: 1; }
/* 贯穿竖线 */
.timeline::before {
    content: ''; position: absolute;
    left: 20px; top: 12px; bottom: 12px;
    width: 2px;
    background: linear-gradient(to bottom, var(--accent) 0%, var(--accent-lt) 100%);
    border-radius: 2px; opacity: 0.25;
}
.step { display: flex; align-items: flex-start; gap: 16px; padding-bottom: 14px; }
.step:last-child { padding-bottom: 0; }
.step-node {
    flex-shrink: 0; width: 42px; height: 42px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 900; color: #fff;
    background: var(--accent);
    box-shadow: 0 3px 0 rgba(0,0,0,0.20), 0 6px 16px rgba(0,0,0,0.15);
    position: relative; z-index: 1;
}
.step-card {
    flex: 1; background: #fff; border-radius: 14px; padding: 14px 16px 12px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 3px 10px rgba(0,0,0,0.06);
    border: 1px solid rgba(255,255,255,0.80);
}
.step-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.step-title { font-size: 14px; font-weight: 700; color: #1a2e26; flex: 1; }
.step-time  { font-size: 9.5px; color: #8aaa9d; background: #e4ede9; padding: 2px 7px; border-radius: 10px; white-space: nowrap; }
.step-desc  { font-size: 12px; color: #4d6b5f; line-height: 1.62; }
.step-outcome {
    display: inline-flex; align-items: center; gap: 4px; margin-top: 7px;
    font-size: 10px; font-weight: 600; color: var(--accent);
    background: var(--accent-bg); border: 1px solid var(--border);
    padding: 2px 8px; border-radius: 4px;
}
.step-outcome::before { content: '→'; }
```

---

## Layout F · 大数字统计（数据报告 / 年度总结）

```html
<!-- 主指标大数字 -->
<div class="hero-stat">
    <p class="hero-label">指标名称</p>
    <div class="hero-number">4.2<span class="unit">万亿</span></div>
    <p class="hero-desc">同比增长 38.6%</p>
</div>

<!-- 次级 2×2 统计网格 -->
<div class="stat-grid">
    <div class="stat-cell">
        <p class="stat-label">指标 A</p>
        <div class="stat-number">4,300<span class="stat-unit">家</span></div>
        <p class="stat-trend"><span class="trend-up">↑</span> 同比 +22%</p>
    </div>
    <!-- 共 4 个 .stat-cell -->
</div>

<!-- 洞察文字列表 -->
<div class="insight-list">
    <div class="insight-item">
        <div class="insight-dot"></div>
        <p class="insight-text"><b>重点</b>补充说明</p>
    </div>
</div>
```

```css
.hero-stat {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(236,179,101,0.15);
    border-radius: 18px; padding: 22px 24px; margin-bottom: 16px;
    box-shadow: inset 0 1px 0 rgba(236,179,101,0.12), 0 4px 20px rgba(0,0,0,0.25);
    position: relative;
}
.hero-stat::before {  /* 顶部金线 */
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
}
.hero-number { font-size: 56px; font-weight: 900; color: var(--accent); line-height: 1; letter-spacing: -2px; }
.hero-number .unit { font-size: 22px; font-weight: 700; vertical-align: super; margin-left: 2px; }

.stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
.stat-cell {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; padding: 16px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
}
.stat-number { font-size: 28px; font-weight: 900; line-height: 1; letter-spacing: -1px; }
.stat-unit   { font-size: 13px; font-weight: 600; opacity: 0.80; }
.stat-trend  { font-size: 10.5px; display: flex; align-items: center; gap: 3px; }
.trend-up    { color: #55efc4; }
.trend-down  { color: #ff7675; }

.insight-list { display: flex; flex-direction: column; gap: 9px; flex: 1; justify-content: flex-end; }
.insight-item {
    display: flex; align-items: flex-start; gap: 10px;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px; padding: 11px 13px;
}
.insight-dot { width: 6px; height: 6px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
.insight-text { font-size: 12px; line-height: 1.62; }
```

---

## 通用：多卡片横排容器

```css
/* 2 列 */
.cards-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 420px);
    gap: 24px;
    justify-content: center;
    align-items: start;
}

/* 3 列（单卡宽度略窄，整体协调） */
.cards-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 380px);
    gap: 20px;
    justify-content: center;
    align-items: start;
}

/* 4 张卡：2×2 */
.cards-grid-4 {
    display: grid;
    grid-template-columns: repeat(2, 420px);
    gap: 20px;
    justify-content: center;
    align-items: start;
}

/* 多卡片模式下 poster-wrapper 宽度由 grid 控制，不要设 max-width */
.cards-grid-2 .poster-wrapper,
.cards-grid-3 .poster-wrapper { width: 100%; border-radius: 24px; overflow: hidden; }
```

---

## 通用：下载按钮（浅色背景版 / 深色背景版）

```html
<!-- 浅色背景用 -->
<button class="download-btn-dark" id="downloadBtn">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
    </svg>
    <span id="btnText">保存为高清图片</span>
</button>

<!-- 深色背景用 -->
<button class="download-btn-light" id="downloadBtn"> ... </button>
```

```css
/* 深色按钮（用于浅色背景页面） */
.download-btn-dark {
    background: #1a1a2e; color: #fff; border: none; border-radius: 50px;
    padding: 15px 36px; font-size: 15px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 10px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.20);
    transition: all 0.2s ease;
}
.download-btn-dark:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.28); }

/* 金色渐变按钮（用于深色背景页面） */
.download-btn-gold {
    background: linear-gradient(135deg, #ecb365, #d4963a); color: #1a1000;
    border: none; border-radius: 50px; padding: 14px 36px;
    font-size: 14px; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; gap: 10px;
    box-shadow: 0 4px 20px rgba(236,179,101,0.30);
    transition: all 0.2s ease;
}

/* 绿色按钮（用于自然/苔藓风页面） */
.download-btn-green {
    background: #3d6b5a; color: #fff; border: none; border-radius: 50px;
    padding: 14px 36px; font-size: 14px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 10px;
    box-shadow: 0 4px 0 rgba(29,80,62,0.40), 0 8px 20px rgba(61,107,90,0.28);
    transition: all 0.15s ease;
}
.download-btn-green:active { transform: translateY(2px); box-shadow: 0 2px 0 rgba(29,80,62,0.40); }

/* 通用禁用态 */
.download-btn-dark:disabled,
.download-btn-gold:disabled,
.download-btn-green:disabled { opacity: 0.50; cursor: not-allowed; transform: none !important; }
```

---

## 通用：截图 JS（含气泡暂停 / 封装函数版）

```javascript
// 单张卡片版（标准）
function setupDownload(btnId, posterId, filename) {
    const btn    = document.getElementById(btnId);
    const poster = document.getElementById(posterId);
    const btnTxt = btn.querySelector('span') || btn;  // 如果有 <span id="btnText">

    btn.addEventListener('click', () => {
        const orig = btnTxt.innerText;
        btnTxt.innerText = '正在生成超清原图...';
        btn.disabled = true;

        // 暂停气泡动画（如果有）
        const blobs = poster.querySelectorAll('.blob');
        blobs.forEach(b => b.style.animation = 'none');

        htmlToImage.toPng(poster, { pixelRatio: 3, style: { transform: 'none' } })
        .then(dataUrl => {
            const a = document.createElement('a');
            a.download = filename; a.href = dataUrl; a.click();
            btnTxt.innerText = '保存成功 ✅';
            setTimeout(() => {
                btnTxt.innerText = orig; btn.disabled = false;
                blobs.forEach(b => b.style.animation = '');
            }, 2000);
        })
        .catch(err => {
            console.error(err); btnTxt.innerText = '生成失败，请重试';
            blobs.forEach(b => b.style.animation = '');
            setTimeout(() => { btnTxt.innerText = orig; btn.disabled = false; }, 2000);
        });
    });
}

// 调用示例
setupDownload('downloadBtn', 'poster', 'card-export.png');
// 多卡片
setupDownload('downloadBtn1', 'poster1', 'card-part1.png');
setupDownload('downloadBtn2', 'poster2', 'card-part2.png');
setupDownload('downloadBtn3', 'poster3', 'card-part3.png');
```
