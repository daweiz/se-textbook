#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""校验各章插图的宽高比是否落在目标区间（书籍/幻灯片双适配）。

读 src/chapter-NN/images/ 下由 diagrams/ 生成的 PNG，统计宽高比，
标出不在 [TARGET_LO, TARGET_HI] 区间的图；同时校验对应 SVG 是否存在、
SVG 是否含文本节点（避免空白图）。

用法：
  python .harness/tools/check-aspect-ratios.py
  python .harness/tools/check-aspect-ratios.py --json   # 输出 JSON 供脚本消费
  python .harness/tools/check-aspect-ratios.py --lo 0.6 --hi 2.6   # 自定义区间
"""
import struct
import glob
import os
import sys
import json

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TARGET_LO = 0.7
TARGET_HI = 2.4
# 由 diagrams/ 生成的图（与图源同名），其余 chapXX-* 等借用图为排除项。
SOURCE_EXTS = (".puml", ".mmd", ".dot", ".gv", ".py")


def png_size(path):
    with open(path, "rb") as f:
        data = f.read()
    w, h = struct.unpack(">II", data[16:24])
    return w, h


def svg_has_text(path):
    """SVG 是否包含可见文本（用于排除空白/文字丢失的图）。"""
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        # 去掉纯图元后仍应有 <text> 或 <tspan>
        return "<text" in content or "<tspan" in content or len(content) > 2000
    except OSError:
        return False


def main():
    global TARGET_LO, TARGET_HI
    args = sys.argv[1:]
    want_json = "--json" in args
    if "--lo" in args:
        TARGET_LO = float(args[args.index("--lo") + 1])
    if "--hi" in args:
        TARGET_HI = float(args[args.index("--hi") + 1])

    # 收集所有有图源的 stem
    stems = set()
    for src in glob.glob(os.path.join(ROOT, "diagrams", "**", "*"), recursive=True):
        if os.path.splitext(src)[1].lower() in SOURCE_EXTS:
            rel = os.path.relpath(src, os.path.join(ROOT, "diagrams"))
            chapter, fname = rel.split(os.sep)
            stem = os.path.splitext(fname)[0]
            stems.add((chapter, stem))

    rows = []
    for chapter, stem in sorted(stems):
        png = os.path.join(ROOT, "src", chapter, "images", stem + ".png")
        svg = os.path.join(ROOT, "src", chapter, "images", stem + ".svg")
        entry = {
            "name": f"{chapter}/{stem}",
            "w": None, "h": None, "ratio": None,
            "svg": os.path.exists(svg), "svg_text": False,
            "ok": True, "reason": "",
        }
        if not os.path.exists(png):
            entry["ok"] = False
            entry["reason"] = "缺少 PNG"
        else:
            w, h = png_size(png)
            entry["w"], entry["h"], entry["ratio"] = w, h, w / h
            if not (TARGET_LO <= w / h <= TARGET_HI):
                entry["ok"] = False
                entry["reason"] = f"宽高比 {w/h:.2f} 不在 [{TARGET_LO},{TARGET_HI}]"
        if os.path.exists(svg):
            entry["svg_text"] = svg_has_text(svg)
            if not entry["svg_text"]:
                entry["ok"] = False
                entry["reason"] = (entry["reason"] + "；SVG 无文本").strip("；")
        else:
            entry["ok"] = False
            entry["reason"] = (entry["reason"] + "；缺少 SVG").strip("；")
        rows.append(entry)

    bad = [r for r in rows if not r["ok"]]
    good = [r for r in rows if r["ok"]]

    if want_json:
        print(json.dumps(rows, ensure_ascii=False, indent=1))
        return 1 if bad else 0

    print(f"共 {len(rows)} 张插图：{len(good)} 张达标，{len(bad)} 张待修\n")
    if bad:
        print("=== 待修 ===")
        for r in sorted(bad, key=lambda x: (x["ratio"] is None, x["ratio"] or 0)):
            print(f'  {r["name"]:34s} '
                  f'{str(r["w"])+"x"+str(r["h"]) if r["w"] else "-":>14s} '
                  f'ratio={r["ratio"]:.2f}  {r["reason"]}')
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
