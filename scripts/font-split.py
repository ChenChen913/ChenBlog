#!/usr/bin/env python3
"""
ChenBlog LXGW WenKai 字体 unicode-range 分片
=============================================

背景：站点实际只使用约 1100 个 CJK 字符（∪ GB2312 一级常用字共约 3853 字形），
而原单文件字体包含 21625 字形（5.1MB），约 79% 的流量被浪费。

分片策略（三个 @font-face 同族同字重，靠声明顺序与 unicode-range 协作）：
  1. lxgw-latin.woff2       拉丁/标点/全角形式（~0.3MB，首屏 ASCII 即刻可用）
  2. lxgw-cjk-common.woff2  语料 ∪ GB2312 一级字 ∪ CJK 标点（~1.2MB，页面常载）
  3. lxgw-cjk-rare.woff2    其余全部 CJK 字形（~3.6MB，仅当页面出现次常用字才下载）

关键浏览器语义（已在 Chromium 实测验证）：
  - 同族多 face 匹配同一字符时，【后声明者胜】（last-match-wins），
    因此 cjk-rare 声明在前（unicode-range: U+4E00-9FA5 全段，CSS 仅 11 字节），
    cjk-common 声明在后（显式字符列表），常用字稳定命中 common 分片；
  - 浏览器按 unicode-range 精确按需下载，未用到的分片零请求。

字形全部来自同一源字体、同一子集化参数，渲染观感与单文件方案完全一致。

重新执行场景：新增文章引入了 common 分片之外的字符时，
运行 `python3 scripts/font-split.py` 重建分片与 src/fonts.css。
源字体（完整子集）保存在 scripts/font-src/lxgw-source.woff2。

用法：python3 scripts/font-split.py   （需 fontTools + brotli）
"""
import os
import subprocess
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # 仓库根
SRC_FONT = os.path.join(BASE, "scripts/font-src/lxgw-source.woff2")
OUT_DIR = os.path.join(BASE, "public/fonts/lxgw")
FONTS_CSS = os.path.join(BASE, "src/fonts.css")

LATIN_RANGES = "U+0020-007E,U+00A0-00FF,U+2000-206F,U+2190-21FF,U+2460-24FF,U+FF00-FFEF"
CJK_PUNCT = "，。、；：？！「」『』（）《》〈〉【】…—·"


def run(cmd):
    print("+", " ".join(cmd[:6]), "...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(result.stdout)
        print(result.stderr)
        sys.exit(1)
    return result


def size_of(path):
    return os.path.getsize(path) / 1024


def parse_ranges(range_str):
    cps = set()
    for part in range_str.split(","):
        lo, _, hi = part[2:].partition("-")
        lo, hi = int(lo, 16), int(hi or lo, 16)
        cps |= set(range(lo, hi + 1))
    return cps


def to_runs(cps):
    runs = []
    for cp in sorted(cps):
        if runs and cp == runs[-1][1] + 1:
            runs[-1][1] = cp
        else:
            runs.append([cp, cp])
    return runs


def runs_to_css(runs):
    return ",".join(f"U+{lo:04X}" + (f"-{hi:04X}" if hi != lo else "") for lo, hi in runs)


def build_corpus():
    """站点语料：文章正文 + UI 源码中的全部字符"""
    chars = set()
    posts_dir = os.path.join(BASE, "src/posts")
    for f in os.listdir(posts_dir):
        if f.endswith(".md"):
            with open(os.path.join(posts_dir, f), encoding="utf-8") as fp:
                chars |= set(fp.read())
    src_dir = os.path.join(BASE, "src")
    for root, _dirs, files in os.walk(src_dir):
        if "posts" in root:
            continue
        for f in files:
            if f.endswith((".ts", ".tsx", ".css")):
                with open(os.path.join(root, f), encoding="utf-8") as fp:
                    chars |= set(fp.read())
    with open(os.path.join(BASE, "index.html"), encoding="utf-8") as fp:
        chars |= set(fp.read())
    return chars


def gb2312_level1():
    chars = set()
    for qu in range(16, 56):
        for wei in range(1, 95):
            try:
                chars.add(bytes([0xA0 + qu, 0xA0 + wei]).decode("gb2312"))
            except UnicodeDecodeError:
                pass
    return chars


def read_cmap(path):
    from fontTools.ttLib import TTFont
    return set(TTFont(path).getBestCmap().keys())


def subset(name, unicodes):
    """按码点集合子集化源字体，输出 woff2"""
    list_file = f"/tmp/font-unicodes-{name}.txt"
    with open(list_file, "w", encoding="utf-8") as fp:
        fp.write(",".join(f"U+{cp:04X}" for cp in sorted(unicodes)))
    out = os.path.join(OUT_DIR, f"lxgw-{name}.woff2")
    run([
        "pyftsubset", SRC_FONT,
        f"--unicodes-file={list_file}",
        "--flavor=woff2",
        f"--output-file={out}",
        # 与首版子集化参数保持一致，确保字形/排版特性逐位相同
        "--layout-features=*",
        "--glyph-names",
        "--symbol-cmap",
        "--legacy-cmap",
        "--notdef-glyph",
        "--notdef-outline",
        "--recommended-glyphs",
    ])
    print(f"  lxgw-{name}.woff2: {len(unicodes)} 字形, {size_of(out):.0f} KB")
    return out


def main():
    if not os.path.exists(SRC_FONT):
        sys.exit(f"源字体不存在: {SRC_FONT}")

    font_chars = read_cmap(SRC_FONT)
    corpus = build_corpus()
    level1 = gb2312_level1()

    latin = parse_ranges(LATIN_RANGES) & font_chars
    cjk_common = (
        {ord(c) for c in corpus if 0x4E00 <= ord(c) <= 0x9FA5}
        | {ord(c) for c in level1}
        | {ord(c) for c in CJK_PUNCT}
        | {cp for cp in font_chars if 0x3000 <= cp <= 0x303F}   # CJK 标点区块
    ) & font_chars
    cjk_rare = {cp for cp in font_chars if 0x4E00 <= cp <= 0x9FA5} - cjk_common

    # 完整性校验：三片必须覆盖源字体全部字形
    leftover = font_chars - latin - cjk_common - cjk_rare
    if leftover:
        print(f"[i] {len(leftover)} 个未归类字形并入 latin:", "".join(chr(c) for c in sorted(leftover))[:40])
        latin |= leftover

    print(f"源字体 {len(font_chars)} 字形 → latin {len(latin)} / common {len(cjk_common)} / rare {len(cjk_rare)}")

    os.makedirs(OUT_DIR, exist_ok=True)
    subset("latin", latin)
    subset("cjk-common", cjk_common)
    subset("cjk-rare", cjk_rare)

    common_css = runs_to_css(to_runs(cjk_common))
    css = f"""/* ============================================================
 * 自动生成：scripts/font-split.py —— 请勿手改
 *
 * LXGW WenKai unicode-range 分片（同族同字重，声明顺序即优先级）：
 *   1) cjk-rare   全 CJK 段声明在前，兜底次常用字（~3.6MB，按需下载）
 *   2) cjk-common 语料∪一级常用字显式列表，后声明优先命中（~1.2MB）
 *   3) latin      拉丁/标点/全角形式（~0.3MB，ASCII 首屏即刻渲染）
 * 字形同源自字体，观感与单文件方案完全一致。
 * ============================================================ */

@font-face {{
  font-family: "LXGW Local WenKai";
  src: url("/fonts/lxgw/lxgw-cjk-rare.woff2") format("woff2");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
  unicode-range: U+4E00-9FA5;
}}

@font-face {{
  font-family: "LXGW Local WenKai";
  src: url("/fonts/lxgw/lxgw-cjk-common.woff2") format("woff2");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
  unicode-range: {common_css};
}}

@font-face {{
  font-family: "LXGW Local WenKai";
  src: url("/fonts/lxgw/lxgw-latin.woff2") format("woff2");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
  unicode-range: {LATIN_RANGES};
}}
"""
    with open(FONTS_CSS, "w", encoding="utf-8") as fp:
        fp.write(css)
    print(f"已生成 {FONTS_CSS}（common 列表 {len(common_css)} 字节）")
    print("完成。记得删除旧的 LXGWWenKai-Medium-subset.woff2 引用并提交。")


if __name__ == "__main__":
    main()
