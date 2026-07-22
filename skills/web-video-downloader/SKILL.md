---
name: web-video-downloader
description: >
  通过检查 DOM 中的视频源 URL 从网页下载视频，或调用 yt-dlp 下载主流平台视频。
  支持单视频和批量下载，内置 Cookie 管理以处理需要登录的平台（B站、抖音等）。
  当用户想要执行以下操作时，必须使用此技能：
  (1) 下载 B站、抖音、YouTube、TikTok、Instagram、Twitter/X、Vimeo 等平台的视频，
  (2) 从任意网页中提取并下载嵌入的 .mp4 / .m3u8 视频，
  (3) 批量下载多个视频链接，
  (4) 恢复中断的下载，处理防盗链或网络波动。
  即使用户没有明确说"下载"，只要提到"保存视频"、"离线观看"、"视频链接"、
  "复制视频"、"下载B站"、"存抖音"，也必须立即触发此技能。
  用户粘贴任何视频页面 URL 并询问如何保存时，也必须触发。
triggers:
  - download video
  - batch download
  - video downloader
  - save video
  - extract video
  - offline video
  - save to local
  - 下载视频
  - 批量下载
  - 视频下载
  - 保存视频
  - 提取视频
  - 网页视频下载
  - 下载B站
  - 下载抖音
  - 下载YouTube
  - 存视频
  - 离线看
  - 复制视频
  - 视频链接保存
---

# 网页视频下载器 (Web Video Downloader)

全能视频下载方案。集成 `yt-dlp`（主流平台）+ `curl`（通用直链），并内置 **Cookie 注入**机制，解决 B站、抖音等需要登录才能下载的问题。

---

## 环境依赖 (Prerequisites)

| 工具 | 用途 | 安装方式 |
|---|---|---|
| Python 3.7+ | 运行脚本 | python.org |
| yt-dlp | 主流平台下载 | `pip install yt-dlp` |
| curl | 通用直链下载 | Windows 10 1803+ 内置；旧版从 curl.se/windows 下载 |
| ffmpeg（可选） | m3u8/HLS 下载 | `brew install ffmpeg` / `apt install ffmpeg` |

**运行前检查**：
```bash
yt-dlp --version
curl --version
```

---

## 决策树：下载前先判断平台

```
用户提供 URL
    │
    ├─ 是抖音？(douyin.com / v.douyin.com / iesdouyin.com)
    │       │
    │       └─ 是 → 走【场景 D】：抖音专用下载器（网络请求捕获法）
    │
    ├─ 是主流平台？(B站/YouTube/TikTok/Instagram/Twitter/Vimeo/Twitch)
    │       │
    │       ├─ 是 → 走【场景 A】：yt-dlp 直接下载
    │       │         如果失败且提示认证错误 → 走【Cookie 修复流程】
    │       │
    │       └─ 否 → 走【场景 B】：浏览器解析 DOM → curl 下载
    │
    └─ URL 是否包含 .m3u8？
            └─ 是 → 读 references/advanced-formats.md 的 HLS 章节
```

---

## 场景 D：抖音视频下载（推荐）

**抖音平台特殊性**：抖音使用 blob URL 加载视频，无法直接从 HTML 提取直链。且 yt-dlp 的 `--cookies-from-browser` 在 Windows 上经常因权限问题失败。

**解决方案**：使用 Playwright 捕获网络请求，获取 `douyinvod.com` 的真实视频 URL。

### D-1. 使用抖音专用下载器

```bash
python scripts/douyin_downloader.py "https://v.douyin.com/xxxxx/" -o "./downloads"
```

脚本会自动：
1. 启动 Chromium 浏览器访问抖音页面
2. 监听网络请求，捕获 `douyinvod.com` 的视频 URL
3. 使用 curl 下载视频文件

### D-2. 指定视频标题

```bash
python scripts/douyin_downloader.py "https://v.douyin.com/xxxxx/" -o "./downloads" -t "视频标题"
```

### D-3. 无头模式（后台运行）

```bash
python scripts/douyin_downloader.py "https://v.douyin.com/xxxxx/" -o "./downloads" --headless
```

### D-4. 依赖安装

```bash
pip install playwright
playwright install chromium
```

### D-5. 如果专用下载器失败

回退到【场景 A】的 yt-dlp 方案，但需要手动提供 cookies：

```bash
# 方法1：使用 cookies 文件
yt-dlp --cookies "cookies.txt" -o "downloads/%(title)s.%(ext)s" "抖音URL"

# 方法2：从浏览器读取（需要管理员权限）
yt-dlp --cookies-from-browser edge -o "downloads/%(title)s.%(ext)s" "抖音URL"
```

---

## 场景 A：主流平台下载

### A-1. 首次尝试（无 Cookie）

```bash
python scripts/downloader.py "PAGE_URL" -o "./downloads"
```

脚本会自动识别域名，调用 `yt-dlp`。

### A-2. 如果失败，判断失败原因

查看输出中的错误关键词：

| 错误关键词 | 含义 | 处理方式 |
|---|---|---|
| `login required` / `需要登录` / `403` / `Sign in` | 需要账号 Cookie | → 走【Cookie 修复流程】 |
| `Private video` / `该视频已设为私享` | 视频本身无权限 | 告知用户，停止 |
| `yt-dlp: command not found` | 未安装 yt-dlp | `pip install yt-dlp` 后重试 |
| `Requested format not available` | 格式问题 | 加 `-f best` 参数重试 |
| 其他网络错误 | 网络或 IP 问题 | 重试，或告知用户检查网络 |

### A-3. Cookie 修复流程

**B站、抖音等平台在未登录时会拒绝下载，或只返回低画质版本。必须使用浏览器 Cookie。**

#### 方法一：让用户导出 Cookie 文件（推荐）

1. 告知用户：  
   > "此视频需要登录才能下载。请安装浏览器插件 **Get cookies.txt LOCALLY**（Chrome/Edge）或 **cookies.txt**（Firefox），登录 B站/抖音后，导出 `cookies.txt` 文件，并告诉我文件保存的路径。"

2. 用户提供路径后，执行：
   ```bash
   python scripts/downloader.py "PAGE_URL" --cookies "/path/to/cookies.txt" -o "./downloads"
   ```

#### 方法二：使用浏览器内置 Cookie（仅限本机，需 Chrome/Firefox）

```bash
# 使用 Chrome 的已登录状态
python scripts/downloader.py "PAGE_URL" --cookies-from-browser chrome -o "./downloads"

# 使用 Firefox 的已登录状态
python scripts/downloader.py "PAGE_URL" --cookies-from-browser firefox -o "./downloads"
```

> ⚠️ 此方法要求用户的本机浏览器已登录对应平台，且操作系统允许读取浏览器 Cookie（部分系统版本可能需要管理员权限）。

---

## 场景 B：通用网页（直链 MP4）

适用于直接在 DOM 中嵌入视频文件链接的网站。

### 单视频

1. 使用浏览器工具导航到页面
2. 执行通用提取脚本（见"常见问题 A"）获取视频 URL
3. 下载：
   ```bash
   python scripts/downloader.py "VIDEO_SRC_URL" --titles "视频标题" -o "./downloads"
   ```

### 批量视频

严格串行，**禁止同时开多个标签页**：

```
创建 Todo 列表
Loop：
  1. browser navigate → 页面 URL
  2. 执行提取脚本 → 得到 src URL + 页面标题
  3. 立即关闭标签页
  4. 等待 1-2 秒
收集完所有 src 后，一次调用脚本批量下载：
python scripts/downloader.py "url1" "url2" ... --titles "t1" "t2" ...
```

---

## 脚本参数一览

```
scripts/downloader.py [URLs...] [选项]

位置参数:
  urls                  视频 URL 列表（主流平台填页面URL，通用网页填视频直链）

可选参数:
  --titles/-t           标题列表（与 URLs 一一对应）
  --output-dir/-o       输出目录（默认 ./downloads）
  --delay/-d            下载间隔秒数（默认 2）
  --cookies             cookies.txt 文件路径（解决登录问题）
  --cookies-from-browser  从浏览器读取 Cookie（chrome/firefox/edge）
  --referer/-e          HTTP Referer（防盗链）
  --user-agent/-A       HTTP User-Agent
  --log/-l              失败日志文件（默认 download_log.txt）
```

---

## 常见问题 (Troubleshooting)

### A. 通用视频源提取脚本

在浏览器控制台或 `browser_evaluate` 中执行，依次尝试多种提取方式：

```javascript
(() => {
  // 1. video 标签直接 src
  const v = document.querySelector('video');
  if (v && v.src && !v.src.startsWith('blob:')) return 'MP4: ' + v.src;

  // 2. source 子标签
  const s = document.querySelector('source[src]');
  if (s && s.src) return 'MP4: ' + s.src;

  // 3. HTML 全文正则匹配 mp4
  const mp4 = document.documentElement.innerHTML.match(/https?:\/\/[^"' ]+\.mp4[^"' ]*/);
  if (mp4) return 'MP4: ' + mp4[0];

  // 4. 匹配 m3u8（需用 ffmpeg 下载，见 references/advanced-formats.md）
  const m3u8 = document.documentElement.innerHTML.match(/https?:\/\/[^"' ]+\.m3u8[^"' ]*/);
  if (m3u8) return 'M3U8: ' + m3u8[0];

  // 5. Blob URL（无法自动下载，见 references/advanced-formats.md）
  if (v && v.src && v.src.startsWith('blob:')) return 'BLOB: 无法自动下载，见 advanced-formats.md';

  return 'NOT_FOUND';
})();
```

根据返回前缀决定下一步：
- `MP4:` → 直接传给脚本
- `M3U8:` → 读 `references/advanced-formats.md` HLS 章节
- `BLOB:` → 读 `references/advanced-formats.md` Blob 章节
- `NOT_FOUND` → 尝试等待动态加载（见下）

### B. 视频动态加载（JS 注入）

```javascript
new Promise(resolve => {
  let attempts = 0;
  const check = () => {
    const v = document.querySelector('video');
    if (v && v.src && !v.src.startsWith('blob:')) {
      resolve('MP4: ' + v.src);
    } else if (attempts >= 15) {
      resolve('NOT_FOUND: 超时');
    } else {
      attempts++;
      setTimeout(check, 1000);
    }
  };
  check();
});
```

### C. m3u8 / Blob URL

遇到这两种情况，请读取 `references/advanced-formats.md` 获取完整处理方案。
