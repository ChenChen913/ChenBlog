import argparse
import subprocess
import os
import time
import urllib.parse
import re
import shutil
from datetime import datetime

# Cache for file extension HEAD requests
_ext_cache = {}

# Domains best handled by yt-dlp
YTDLP_DOMAINS = [
    'youtube.com', 'youtu.be',
    'bilibili.com', 'b23.tv',
    'tiktok.com',
    'instagram.com',
    'twitter.com', 'x.com',
    'facebook.com',
    'vimeo.com',
    'twitch.tv',
    'weibo.com',
    'ixigua.com',
    'kuaishou.com',
]

# Domains that require special handling (use dedicated downloader)
DOUYIN_DOMAINS = ['douyin.com', 'iesdouyin.com', 'v.douyin.com']

# Keywords in yt-dlp stderr that indicate an auth/login problem
AUTH_ERROR_KEYWORDS = [
    'login required',
    'sign in',
    '需要登录',
    'not logged in',
    'authentication',
    '403',
    'private video',
    '该视频已设为私享',
    'members only',
    'age-restricted',
]


def is_ytdlp_supported(url):
    try:
        domain = urllib.parse.urlparse(url).netloc.lower()
        return any(d in domain for d in YTDLP_DOMAINS)
    except Exception:
        return False


def is_douyin_url(url):
    """Check if URL is from Douyin (requires special handling)"""
    try:
        domain = urllib.parse.urlparse(url).netloc.lower()
        return any(d in domain for d in DOUYIN_DOMAINS)
    except Exception:
        return False


def check_ytdlp_installed():
    return shutil.which('yt-dlp') is not None


def download_douyin_video(url, output_dir, title=None):
    """
    Download Douyin video using dedicated downloader (Playwright + curl).
    Returns (success: bool, error_type: str or None).
    """
    import sys
    import importlib.util
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    douyin_script = os.path.join(script_dir, 'douyin_downloader.py')
    
    if not os.path.exists(douyin_script):
        print("[douyin] Error: douyin_downloader.py not found")
        return False, "script_not_found"
    
    try:
        spec = importlib.util.spec_from_file_location("douyin_downloader", douyin_script)
        douyin_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(douyin_module)
        
        print(f"[douyin] Using dedicated downloader for: {url}")
        success = douyin_module.download_douyin_video(url, output_dir, title, headless=True)
        
        if success:
            return True, None
        else:
            return False, "download_failed"
            
    except ImportError as e:
        print(f"[douyin] Error: Missing dependency - {e}")
        print("[douyin] Install with: pip install playwright && playwright install chromium")
        return False, "missing_dependency"
    except Exception as e:
        print(f"[douyin] Error: {e}")
        return False, str(e)


def is_auth_error(stderr_text):
    text = stderr_text.lower()
    return any(kw in text for kw in AUTH_ERROR_KEYWORDS)


def download_with_ytdlp(url, output_dir, title=None, user_agent=None, referer=None,
                         cookies=None, cookies_from_browser=None):
    """Download using yt-dlp. Returns (success: bool, is_auth_error: bool)."""
    try:
        print(f"[yt-dlp] Downloading: {url}")
        cmd = ['yt-dlp', '--no-playlist', '--progress']

        if title:
            safe_title = re.sub(r'[\\/*?:"<>|]', '', title).strip()[:100]
            output_template = os.path.join(output_dir, f'{safe_title}.%(ext)s')
        else:
            output_template = os.path.join(output_dir, '%(title)s.%(ext)s')
        cmd.extend(['-o', output_template])

        if user_agent:
            cmd.extend(['--user-agent', user_agent])
        if referer:
            cmd.extend(['--referer', referer])

        # Cookie options — mutually exclusive, cookies file takes priority
        if cookies:
            if os.path.isfile(cookies):
                cmd.extend(['--cookies', cookies])
                print(f"[yt-dlp] Using cookies file: {cookies}")
            else:
                print(f"[yt-dlp] Warning: cookies file not found: {cookies}")
        elif cookies_from_browser:
            cmd.extend(['--cookies-from-browser', cookies_from_browser])
            print(f"[yt-dlp] Using cookies from browser: {cookies_from_browser}")

        cmd.append(url)

        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stderr_text = result.stderr.decode('utf-8', errors='ignore')

        if result.returncode == 0:
            print(f"[yt-dlp] Success: {url}")
            return True, False
        else:
            print(f"[yt-dlp] Failed:\n{stderr_text}")
            return False, is_auth_error(stderr_text)

    except FileNotFoundError:
        print("[yt-dlp] Error: yt-dlp not found. Install with: pip install yt-dlp")
        return False, False
    except Exception as e:
        print(f"[yt-dlp] Unexpected error: {e}")
        return False, False


def get_extension_from_headers(url, user_agent, referer):
    """HEAD request to determine file extension. Cached."""
    global _ext_cache
    if url in _ext_cache:
        return _ext_cache[url]
    try:
        cmd = ['curl', '-s', '-I', '-L', '--connect-timeout', '10', url]
        if user_agent:
            cmd.extend(['-A', user_agent])
        if referer:
            cmd.extend(['-e', referer])
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=15)
        if result.returncode != 0:
            _ext_cache[url] = None
            return None
        headers = result.stdout.decode('utf-8', errors='ignore').lower()
        ext = None
        if 'content-type: video/mp4' in headers:
            ext = '.mp4'
        elif 'content-type: video/webm' in headers:
            ext = '.webm'
        elif 'content-type: video/x-matroska' in headers:
            ext = '.mkv'
        elif 'content-type: application/x-mpegurl' in headers:
            ext = '.m3u8'
        _ext_cache[url] = ext
        return ext
    except Exception:
        _ext_cache[url] = None
        return None


def sanitize_filename(title, url, output_dir, user_agent=None, referer=None):
    ext = get_extension_from_headers(url, user_agent, referer) or '.mp4'
    name = ''
    if title:
        name = re.sub(r'[\\/*?:"<>|]', '', title).strip()[:100]
    if not name:
        try:
            path = urllib.parse.urlparse(url).path
            name = os.path.basename(path).split('?')[0]
            if not name or len(name) < 4 or name.lower() in ['video', 'watch', 'player', 'index', 'playlist']:
                name = f'video_{int(datetime.now().timestamp())}'
            else:
                name = os.path.splitext(name)[0]
        except Exception:
            name = f'video_{int(datetime.now().timestamp())}'

    filename = f'{name}{ext}'
    full_path = os.path.join(output_dir, filename)
    counter = 1
    while os.path.exists(full_path):
        base, e = os.path.splitext(filename)
        full_path = os.path.join(output_dir, f'{base}_{counter}{e}')
        counter += 1
    return full_path


def is_valid_video_file(path):
    """
    Validates a downloaded file is actually a video by checking:
    1. File size >= 500 KB (HTML error pages from major platforms can exceed 50 KB)
    2. File magic bytes match known video container signatures
    Returns (is_valid: bool, reason: str)
    """
    try:
        size = os.path.getsize(path)
        if size < 512000:  # 500 KB — stricter threshold
            return False, f"too small ({size // 1024} KB), likely an error page"

        # Read first 12 bytes to check container magic numbers
        with open(path, 'rb') as f:
            header = f.read(12)

        # MP4 / MOV: ftyp box at offset 4
        if header[4:8] in (b'ftyp', b'moov', b'mdat', b'wide'):
            return True, "MP4/MOV"
        # WebM / MKV: EBML header
        if header[:4] == b'\x1a\x45\xdf\xa3':
            return True, "WebM/MKV"
        # FLV
        if header[:3] == b'FLV':
            return True, "FLV"
        # AVI: RIFF....AVI
        if header[:4] == b'RIFF' and header[8:12] == b'AVI ':
            return True, "AVI"
        # TS (MPEG transport stream): sync byte 0x47
        if header[0:1] == b'\x47':
            return True, "MPEG-TS"

        # Reject known non-video signatures
        if header[:5] in (b'<!DOC', b'<html', b'<HTML'):
            return False, "file is HTML (login page or error page)"
        if header[:1] == b'{':
            return False, "file is JSON (API error response)"

        # Unknown format but large enough — warn but accept
        return True, f"unknown format (header: {header[:8].hex()}), accepting due to size"

    except Exception as e:
        return False, f"validation error: {e}"


def delete_file_silent(path):
    try:
        os.remove(path)
    except Exception:
        pass


def download_file_curl(url, output_path, user_agent=None, referer=None, retries=3):
    """Download with curl, exponential backoff, magic-byte video validation."""
    base_delay = 2
    for attempt in range(retries + 1):
        try:
            print(f"[curl] Attempt {attempt + 1}/{retries + 1}: {url}")
            cmd = ['curl', '-L', '--connect-timeout', '30', '-o', output_path, url]
            if attempt > 0:
                cmd.extend(['-C', '-'])
            if user_agent:
                cmd.extend(['-A', user_agent])
            if referer:
                cmd.extend(['-e', referer])
            if attempt == retries:
                cmd.append('-k')  # Last attempt: ignore SSL errors

            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

            if not os.path.exists(output_path):
                print("[curl] Error: curl exited 0 but file not found.")
                return False

            valid, reason = is_valid_video_file(output_path)
            if not valid:
                print(f"[curl] Invalid file: {reason}. Deleting.")
                delete_file_silent(output_path)
                return False  # Don't retry — URL is wrong, not a network issue

            print(f"[curl] Success: {output_path} ({os.path.getsize(output_path) // 1024} KB, {reason})")
            return True

        except subprocess.CalledProcessError as e:
            print(f"[curl] Error: {e}")
            if attempt < retries:
                delay = base_delay * (2 ** attempt)
                print(f"[curl] Retrying in {delay}s...")
                time.sleep(delay)
            else:
                print(f"[curl] Failed after {retries + 1} attempts.")
                return False
        except Exception as e:
            print(f"[curl] Unexpected error: {e}")
            return False
    return False


def main():
    parser = argparse.ArgumentParser(description='Web video downloader — yt-dlp + curl')
    parser.add_argument('urls', nargs='+', help='Video URLs (page URL for platforms, direct URL for generic sites)')
    parser.add_argument('--titles', '-t', nargs='+', help='Titles for each URL (optional)')
    parser.add_argument('--output-dir', '-o', default='downloads', help='Output directory (default: ./downloads)')
    parser.add_argument('--delay', '-d', type=int, default=2, help='Delay between downloads in seconds (default: 2)')
    parser.add_argument('--user-agent', '-A',
                        default='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        help='HTTP User-Agent')
    parser.add_argument('--referer', '-e', default='', help='HTTP Referer (for hotlink protection)')
    parser.add_argument('--log', '-l', default='download_log.txt', help='Failed download log file')
    parser.add_argument('--cookies', help='Path to cookies.txt file (Netscape format, for login-required platforms)')
    parser.add_argument('--cookies-from-browser',
                        choices=['chrome', 'firefox', 'edge', 'safari', 'opera', 'brave'],
                        help='Read cookies from an installed browser (requires yt-dlp)')

    args = parser.parse_args()

    abs_output_dir = os.path.abspath(args.output_dir)
    os.makedirs(abs_output_dir, exist_ok=True)

    has_ytdlp = check_ytdlp_installed()
    print(f"[init] yt-dlp: {'available' if has_ytdlp else 'NOT FOUND (will use curl only)'}")
    print(f"[init] Output: {abs_output_dir}")
    if args.cookies:
        print(f"[init] Cookies file: {args.cookies}")
    if args.cookies_from_browser:
        print(f"[init] Cookies from browser: {args.cookies_from_browser}")
    print(f"[init] Starting {len(args.urls)} download(s)...\n")

    titles = list(args.titles) if args.titles else []
    titles.extend([None] * (len(args.urls) - len(titles)))

    success_count = 0
    fail_count = 0
    failed_items = []
    auth_failures = []  # Track URLs that failed due to auth

    for i, (url, title) in enumerate(zip(args.urls, titles)):
        print(f"--- [{i + 1}/{len(args.urls)}] {title or url} ---")
        success = False

        # Priority 1: Douyin (requires special handling)
        if is_douyin_url(url):
            ok, error_type = download_douyin_video(url, abs_output_dir, title)
            if ok:
                success = True
            else:
                print(f"[!] Douyin downloader failed: {error_type}")
                failed_items.append(f"{url} | Title: {title} | Error: {error_type}")
        
        # Priority 2: Other yt-dlp supported platforms
        elif has_ytdlp and is_ytdlp_supported(url):
            ok, auth_fail = download_with_ytdlp(
                url, abs_output_dir, title,
                args.user_agent, args.referer,
                args.cookies, args.cookies_from_browser
            )
            if ok:
                success = True
            elif auth_fail:
                print("\n[!] Authentication required. Will NOT fall back to curl (would produce fake files).")
                if not args.cookies and not args.cookies_from_browser:
                    print("[!] Fix: re-run with --cookies <path/to/cookies.txt>")
                    print("[!]   or: --cookies-from-browser chrome  (if logged in on this machine)")
                auth_failures.append(url)
            else:
                print("[!] yt-dlp failed (non-auth reason). Will NOT fall back to curl for platform URLs.")
                print("[!] Check yt-dlp version: yt-dlp -U")
        
        # Priority 3: Generic sites (direct video URL)
        else:
            output_path = sanitize_filename(title, url, abs_output_dir, args.user_agent, args.referer)
            success = download_file_curl(url, output_path, args.user_agent, args.referer)

        if success:
            success_count += 1
        else:
            fail_count += 1
            failed_items.append(f"{url} | Title: {title}")

        if i < len(args.urls) - 1:
            print(f"\n[delay] Waiting {args.delay}s...\n")
            time.sleep(args.delay)

    # Summary
    print(f"\n{'=' * 40}")
    print(f"Complete: {success_count} succeeded, {fail_count} failed")

    if auth_failures:
        print(f"\n[auth] {len(auth_failures)} URL(s) failed due to login requirement:")
        for u in auth_failures:
            print(f"  - {u}")
        print("\nTo fix: export cookies from your logged-in browser and re-run with:")
        print("  --cookies /path/to/cookies.txt")
        print("  OR: --cookies-from-browser chrome  (if you are logged in on this machine)")

    if failed_items:
        log_path = os.path.abspath(args.log)
        try:
            with open(log_path, 'a', encoding='utf-8') as f:
                f.write(f"\n--- {datetime.now().isoformat()} ---\n")
                for item in failed_items:
                    f.write(f"FAILED: {item}\n")
            print(f"\n[log] Failed items logged to: {log_path}")
        except Exception as e:
            print(f"[log] Error writing log: {e}")


if __name__ == '__main__':
    main()
