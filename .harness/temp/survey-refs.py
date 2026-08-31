# -*- coding: utf-8 -*-
"""调研书稿 markdown 中所有图片引用，按源/借用、png/svg 分类。"""
import os
import sys
import re

sys.stdout.reconfigure(encoding="utf-8")
ROOT = r"d:/bookspace/se_textbook/book"

refs = []
for dirpath, _, files in os.walk(os.path.join(ROOT, "src")):
    for f in sorted(files):
        if not f.endswith(".md"):
            continue
        p = os.path.join(dirpath, f)
        rel = os.path.relpath(p, ROOT).replace("\\", "/")
        for m in re.finditer(r"!\[[^\]]*\]\(([^()]*)\)\{width=([^}]*)\}", open(p, encoding="utf-8").read()):
            refs.append((rel, m.group(1).strip(), m.group(2)))

png_diagram, png_borrow, svg_diagram, svg_other = [], [], [], []
for md, path, wd in refs:
    if not path.startswith("images/"):
        continue
    stem = os.path.basename(path)[:-4]
    ch = md.split("/")[1]
    has_src = any(os.path.exists(os.path.join(ROOT, "diagrams", ch, stem + e))
                  for e in (".dot", ".puml", ".mmd", ".py"))
    if path.endswith(".png"):
        (png_diagram if has_src else png_borrow).append((md, stem, wd))
    else:
        (svg_diagram if has_src else svg_other).append((md, stem, wd))

print(f".png 有源(需改.svg): {len(png_diagram)}")
print(f".png 借用(不改扩展): {len(png_borrow)}")
print(f".svg 有源(已OK): {len(svg_diagram)}")
print(f".svg 其他: {len(svg_other)}")
for r in sorted(svg_other):
    print("   svg-other:", r)
print("--- png 有源清单 ---")
for r in sorted(png_diagram):
    print("   ", r)
