# Advanced Video Format Handling

## m3u8 / HLS Streams

当视频源 URL 以 `.m3u8` 结尾，说明这是 HTTP Live Streaming 分片流，`curl` 无法下载，需要用 `ffmpeg` 合并：

```bash
ffmpeg -i "HLS_URL" -c copy -bsf:a aac_adtstoasc "output.mp4"
```

参数说明：
- `-c copy`：直接复制流，不重新编码（速度快）
- `-bsf:a aac_adtstoasc`：修复 MP4 容器中的音频流格式问题

**ffmpeg 安装**：
- macOS：`brew install ffmpeg`
- Linux：`sudo apt install ffmpeg`
- Windows：从 ffmpeg.org 下载，将 `bin` 目录加入 PATH

---

## Blob URLs

如果提取到的视频 src 以 `blob:https://` 开头，说明视频数据存在于浏览器内存中，任何命令行工具（curl/ffmpeg/yt-dlp）都无法直接获取。这是本 Skill 的**硬性限制**。

**告知用户的建议**：
> 此视频使用了 Blob URL 加密流，无法通过命令行自动下载。建议使用浏览器插件手动捕获，例如：
> - Firefox / Chrome：**Video DownloadHelper**
> - Chrome：**Stream Recorder**
>
> 请不要继续尝试自动下载，以免浪费时间。
