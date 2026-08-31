# -*- coding: utf-8 -*-
"""更新书稿 markdown 图片引用：
- 有 diagrams/ 图源的图：扩展名改为 .svg（HTML 矢量），并按 PNG 实际宽高比重算 width=%。
- 借用图（无图源）：不改扩展名与宽度。
宽高比→宽度规则：ratio 0.7→55%，2.4→92%，线性插值并四舍五入到 5。
"""
import os
import re
import sys

from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")
ROOT = r"d:/bookspace/se_textbook/book"


def width_for(ratio):
    if ratio <= 0:
        return 55
    w = 55 + (ratio - 0.7) / 1.7 * 37.0
    return max(50, min(92, int(round(w / 5.0) * 5)))


def main():
    changed_files = 0
    changed_refs = 0
    skipped_borrow = 0
    missing_png = []
    for dirpath, _, files in os.walk(os.path.join(ROOT, "src")):
        for f in sorted(files):
            if not f.endswith(".md"):
                continue
            p = os.path.join(dirpath, f)
            ch = os.path.basename(dirpath)  # chapter-NN
            text = open(p, encoding="utf-8").read()

            def repl(m):
                nonlocal changed_refs, skipped_borrow
                path = m.group(1).strip()
                if not path.startswith("images/"):
                    return m.group(0)
                stem = os.path.basename(path)[:-4]
                has_src = any(
                    os.path.exists(os.path.join(ROOT, "diagrams", ch, stem + e))
                    for e in (".dot", ".puml", ".mmd", ".py")
                )
                if not has_src:
                    skipped_borrow += 1
                    return m.group(0)  # 借用图不动
                # 目标 PNG（SVG 尺寸与 PNG 一致）
                png = os.path.join(ROOT, "src", ch, "images", stem + ".png")
                if not os.path.exists(png):
                    missing_png.append(os.path.join(ch, stem))
                    return m.group(0)
                with Image.open(png) as im:
                    w, h = im.size
                ratio = w / h if h else 0
                new_w = width_for(ratio)
                new_ref = f"![](images/{stem}.svg){{width={new_w}%}}"
                changed_refs += 1
                return new_ref

            new_text = re.sub(
                r"!\[[^\]]*\]\(([^()]*)\)\{width=[^}]*\}",
                repl,
                text,
            )
            if new_text != text:
                open(p, "w", encoding="utf-8", newline="\n").write(new_text)
                changed_files += 1
                print(f"  更新: {os.path.relpath(p, ROOT)}")
    print(f"更新文件 {changed_files}，引用 {changed_refs}，借用跳过 {skipped_borrow}")
    if missing_png:
        print("缺失 PNG（未更新）:", missing_png)


if __name__ == "__main__":
    main()
