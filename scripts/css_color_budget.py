#!/usr/bin/env python3
"""CI 颜色预算棘轮:统计规则体内裸颜色字面量数(2026-10 token 化后基线为 0)。
口径(与生成脚本 color_token_execute.py 一致):
  - 范围 src/index.css + src/styles/*.css;fallback.css 除外(兼容镜像,
    值需与前文玻璃声明手工同步,不引用 token)
  - 排除:注释 / 自定义属性定义(token 之家,含 @theme) / var() 内部回退值
用法: python3 scripts/css_color_budget.py [--budget N]
新色值请取 src/styles/tokens.css 既有 token;确需新色先补 token 再引用。"""
import re, glob, sys, os

BUDGET = 0
args = sys.argv[1:]
if '--budget' in args:
    BUDGET = int(args[args.index('--budget') + 1])

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
FILES = ['src/index.css'] + [f for f in sorted(glob.glob('src/styles/*.css')) if 'fallback' not in f]

DECL_RE = re.compile(r'(?P<prop>[a-zA-Z-][\w-]*)\s*:\s*(?P<val>[^;{}]+);', re.S)
LITERAL_RE = re.compile(r'#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|oklch\([^)]*\)')
VAR_SPAN_RE = re.compile(r'var\([^()]*(?:\([^()]*\)[^()]*)*\)')
THEME_BLOCK_RE = re.compile(r'@theme[^{]*\{', re.S)

count = 0
details = []
for f in FILES:
    css = open(f, encoding='utf-8').read()
    nocomment = re.sub(r'/\*.*?\*/', lambda m: re.sub(r'[^\n]', ' ', m.group(0)), css, flags=re.S)
    tspans = [(m.start(), nocomment.find('}', m.end())) for m in THEME_BLOCK_RE.finditer(nocomment)]
    for m in DECL_RE.finditer(nocomment):
        if m.group('prop').startswith('--'):
            continue
        if any(ts <= m.start() <= te for ts, te in tspans):
            continue
        val = VAR_SPAN_RE.sub('var()', m.group('val'))
        for lit in LITERAL_RE.finditer(val):
            count += 1
            details.append(f'{f}:{nocomment[:m.start()].count(chr(10)) + 1} {lit.group(0)}')

print(f'css rule-body color literals = {count} (budget {BUDGET})')
for d in details[:10]:
    print(' ', d)
if count > BUDGET:
    print('FAIL: 超出颜色预算——新色值请取 tokens.css 既有 token,或先补 token 再引用')
    sys.exit(1)
print('PASS')
