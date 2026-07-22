"""
抖音视频下载器 - 通过网络请求捕获获取真实视频URL

解决 yt-dlp 在抖音平台上因 Cookie 问题无法下载的情况。
使用 Playwright 捕获网络请求，提取 douyinvod.com 的视频直链。
"""
import asyncio
import subprocess
import os
import re
import sys
from datetime import datetime


async def capture_douyin_video_url(page_url: str, headless: bool = False, timeout: int = 60) -> str:
    """
    使用 Playwright 捕获抖音视频的真实下载URL
    
    Args:
        page_url: 抖音视频页面URL
        headless: 是否无头模式运行
        timeout: 超时时间（秒）
    
    Returns:
        视频下载URL，失败返回 None
    """
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("[error] playwright not installed. Run: pip install playwright && playwright install chromium")
        return None
    
    video_urls = []
    
    async def handle_response(response):
        url = response.url
        if 'douyinvod.com' in url and '/video/' in url:
            print(f"[capture] Found video URL: {url[:100]}...")
            video_urls.append(url)
    
    print(f"[douyin] Starting browser to capture video URL...")
    
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=headless)
            context = await browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            page = await context.new_page()
            
            page.on('response', handle_response)
            
            print(f"[douyin] Navigating to: {page_url}")
            
            try:
                await page.goto(page_url, timeout=timeout * 1000, wait_until='domcontentloaded')
            except Exception as e:
                if 'Timeout' in str(e):
                    print("[douyin] Page load timeout (expected for video pages)")
                else:
                    raise
            
            await asyncio.sleep(5)
            
            if not video_urls:
                await page.reload(wait_until='domcontentloaded', timeout=30000)
                await asyncio.sleep(3)
            
            await browser.close()
    except Exception as e:
        print(f"[douyin] Browser error: {e}")
    
    if video_urls:
        return video_urls[0]
    return None


def download_with_curl(video_url: str, output_path: str, referer: str = 'https://www.douyin.com/') -> bool:
    """
    使用 curl 下载视频文件
    
    Args:
        video_url: 视频直链URL
        output_path: 输出文件路径
        referer: HTTP Referer
    
    Returns:
        下载成功返回 True
    """
    curl_path = shutil.which('curl')
    if not curl_path:
        curl_path = r'C:\Windows\System32\curl.exe'
    
    if not os.path.exists(curl_path):
        curl_path = 'curl'
    
    print(f"[curl] Downloading to: {output_path}")
    
    cmd = [
        curl_path, '-L',
        '--connect-timeout', '30',
        '-o', output_path,
        video_url,
        '-H', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        '-H', f'Referer: {referer}'
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0 and os.path.exists(output_path):
            size = os.path.getsize(output_path)
            print(f"[curl] Success: {output_path} ({size // 1024 // 1024} MB)")
            return True
        else:
            print(f"[curl] Failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"[curl] Error: {e}")
        return False


import shutil


def sanitize_filename(title: str) -> str:
    """清理文件名中的非法字符"""
    if not title:
        return f"douyin_video_{int(datetime.now().timestamp())}"
    return re.sub(r'[\\/*?:"<>|]', '', title).strip()[:100]


def is_douyin_url(url: str) -> bool:
    """检查是否是抖音URL"""
    return any(d in url.lower() for d in ['douyin.com', 'iesdouyin.com', 'v.douyin.com'])


def extract_video_id(url: str) -> str:
    """从URL中提取视频ID"""
    match = re.search(r'/video/(\d+)', url)
    if match:
        return match.group(1)
    return None


def download_douyin_video(url: str, output_dir: str, title: str = None, headless: bool = False) -> bool:
    """
    下载抖音视频的主函数
    
    Args:
        url: 抖音视频页面URL
        output_dir: 输出目录
        title: 视频标题（可选）
        headless: 是否无头模式
    
    Returns:
        下载成功返回 True
    """
    if not is_douyin_url(url):
        print(f"[error] Not a douyin URL: {url}")
        return False
    
    os.makedirs(output_dir, exist_ok=True)
    
    video_url = asyncio.run(capture_douyin_video_url(url, headless=headless))
    
    if not video_url:
        print("[error] Failed to capture video URL")
        return False
    
    if not title:
        video_id = extract_video_id(url) or str(int(datetime.now().timestamp()))
        title = f"douyin_{video_id}"
    
    safe_title = sanitize_filename(title)
    output_path = os.path.join(output_dir, f"{safe_title}.mp4")
    
    counter = 1
    while os.path.exists(output_path):
        output_path = os.path.join(output_dir, f"{safe_title}_{counter}.mp4")
        counter += 1
    
    return download_with_curl(video_url, output_path)


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='抖音视频下载器')
    parser.add_argument('url', help='抖音视频页面URL')
    parser.add_argument('-o', '--output-dir', default='downloads', help='输出目录')
    parser.add_argument('-t', '--title', help='视频标题')
    parser.add_argument('--headless', action='store_true', help='无头模式运行浏览器')
    
    args = parser.parse_args()
    
    success = download_douyin_video(args.url, args.output_dir, args.title, args.headless)
    sys.exit(0 if success else 1)
