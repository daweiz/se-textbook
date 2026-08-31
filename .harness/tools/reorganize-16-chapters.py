# -*- coding: utf-8 -*-
"""重组书稿：24 章 → 16 章（方案 B，零内容缩减）。

按 NEW 映射合并章节：主章（较小原章号）保留章标题，附章去掉 `#` 标题行后全文并入；
images 与 diagrams 随目录并入主章（重名冲突检测）；旧章节目录删除，新目录按新章号落位。

用法：
  python .harness/tools/reorganize-16-chapters.py            # dry-run：仅打印计划与冲突
  python .harness/tools/reorganize-16-chapters.py --execute  # 执行重组
"""
import os
import re
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, "src")
DIAG = os.path.join(ROOT, "diagrams")
TMP = os.path.join(ROOT, "_reorg_tmp")

# 新章号 -> 原章号列表（顺序：主章在前）
NEW = {
    1: [1], 2: [2, 3], 3: [4, 5], 4: [6], 5: [7, 8], 6: [9, 10],
    7: [11, 12], 8: [13], 9: [14, 15], 10: [16], 11: [17, 18],
    12: [19], 13: [20, 21], 14: [22], 15: [23], 16: [24],
}

TITLES = {
    1: "软件工程概述",
    2: "软件开发方法与软件过程",
    3: "需求工程与用例建模",
    4: "软件分析",
    5: "软件设计与设计模式",
    6: "软件实现与测试",
    7: "软件演化与质量保证",
    8: "软件项目管理",
    9: "软件工程工具、实践与伦理",
    10: "AI 系统工程与 MLOps",
    11: "大模型应用开发范式",
    12: "智能体系统工程",
    13: "AI 原生软件工程",
    14: "软件工程 3.0：大模型驱动的研发新范式",
    15: "自主软件工程：智能体网络与自主开发",
    16: "智能软件工程的治理、安全与未来",
}

SLUGS = {
    1: "0100-introduction.md", 2: "0200-method-process.md", 3: "0300-requirement-uml.md",
    4: "0400-analysis.md", 5: "0500-design-pattern.md", 6: "0600-implementation-testing.md",
    7: "0700-evolution-quality.md", 8: "0800-management.md", 9: "0900-tools-practice-ethics.md",
    10: "1000-ai-engineering-mlops.md", 11: "1100-llm-application.md", 12: "1200-agent-systems.md",
    13: "1300-ai-native.md", 14: "1400-se30.md", 15: "1500-autonomous-se.md",
    16: "1600-governance-future.md",
}

HAN = re.compile(r"[一-鿿]")


def han_count(text):
    return len(HAN.findall(text))


def find_md(chapter_dir):
    """章目录下唯一的 *.md（忽略 images）。"""
    if not os.path.isdir(chapter_dir):
        raise FileNotFoundError(f"缺章目录 {chapter_dir}")
    mds = [f for f in os.listdir(chapter_dir) if f.endswith(".md")]
    if len(mds) != 1:
        raise RuntimeError(f"目录 {chapter_dir} 应恰好一个 md，实际 {mds}")
    return os.path.join(chapter_dir, mds[0])


def img_files(chapter_dir):
    img = os.path.join(chapter_dir, "images")
    if not os.path.isdir(img):
        return []
    return sorted(os.listdir(img))


def dot_files(chapter_dir):
    if not os.path.isdir(chapter_dir):
        return []
    return sorted(f for f in os.listdir(chapter_dir) if f.endswith(".dot"))


def build_new_content(new_ch):
    """合并各原章 md 为新章内容（附章去掉 # 标题行）。返回 (content, section_list)。"""
    parts = []
    sections = []
    for old in NEW[new_ch]:
        p = os.path.join(SRC, f"chapter-{old:02d}")
        md = find_md(p)
        with open(md, encoding="utf-8") as f:
            lines = f.read().splitlines(keepends=True)
        # 去掉第一行 `# 标题`
        body = lines[1:]
        if old == NEW[new_ch][0]:
            head = f"# {TITLES[new_ch]}\n"
        else:
            head = ""
        parts.append(head + "".join(body))
        for ln in body:
            m = re.match(r"^#{1,4}\s+(.*)$", ln.rstrip("\n"))
            if m:
                sections.append((old, m.group(1)))
    content = ("\n".join(parts)).strip() + "\n"
    return content, sections


def main():
    execute = "--execute" in sys.argv

    # —— 预检：收集原章信息 ——
    info = {}
    for old in range(1, 25):
        p = os.path.join(SRC, f"chapter-{old:02d}")
        if not os.path.isdir(p):
            print(f"✗ 缺原章目录 {p}")
            sys.exit(1)
        info[old] = {
            "md": os.path.basename(find_md(p)),
            "imgs": img_files(p),
        }

    # —— dry-run 计划 ——
    print("重组计划（24 章 → 16 章）：\n")
    conflicts = []
    for new_ch in sorted(NEW):
        olds = NEW[new_ch]
        content, sections = build_new_content(new_ch)
        wc = han_count(content)
        imgs = []
        for old in olds:
            for f in info[old]["imgs"]:
                if f in imgs:
                    conflicts.append(f"images 重名 {f}：新第 {new_ch} 章")
                imgs.append(f)
        tag = "合并" if len(olds) > 1 else "独立"
        src_names = "+".join(f"ch{o}({info[o]['md']})" for o in olds)
        print(f"  新 {new_ch:2d} 章  《{TITLES[new_ch]}》  [{tag}] {src_names}")
        print(f"       目标 {SLUGS[new_ch]} · 现约 {wc} 字 · {len(imgs)} 张图 · {len(sections)} 个标题")
        # 输出合并章的 `##`/`###` 节清单（来源标注）
        if len(olds) > 1:
            for old, name in sections:
                print(f"         └  ch{old} | {name}")

    print(f"\nimages 冲突：{conflicts if conflicts else '无'}")

    if not execute:
        print("\n[dry-run] 未执行任何写操作。加 --execute 执行重组。")
        return

    # —— 执行：构建临时新结构 ——
    tmp_src = os.path.join(TMP, "src")
    tmp_diag = os.path.join(TMP, "diagrams")
    if os.path.exists(TMP):
        shutil.rmtree(TMP)
    for new_ch in sorted(NEW):
        td = os.path.join(tmp_src, f"chapter-{new_ch:02d}")
        os.makedirs(td, exist_ok=True)
        content, _ = build_new_content(new_ch)
        with open(os.path.join(td, SLUGS[new_ch]), "w", encoding="utf-8") as f:
            f.write(content)
        timg = os.path.join(td, "images")
        os.makedirs(timg, exist_ok=True)
        for old in NEW[new_ch]:
            for f in info[old]["imgs"]:
                shutil.copy2(os.path.join(SRC, f"chapter-{old:02d}", "images", f), os.path.join(timg, f))
            # diagrams
            dsrc = os.path.join(DIAG, f"chapter-{old:02d}")
            for f in dot_files(dsrc):
                tdd = os.path.join(tmp_diag, f"chapter-{new_ch:02d}")
                os.makedirs(tdd, exist_ok=True)
                shutil.copy2(os.path.join(dsrc, f), os.path.join(tdd, f))

    # —— 删除旧章节目录 ——
    for old in range(1, 25):
        for base, kind in ((SRC, "src"), (DIAG, "diagrams")):
            d = os.path.join(base, f"chapter-{old:02d}")
            if os.path.isdir(d):
                shutil.rmtree(d)
                print(f"  删 {kind}/chapter-{old:02d}")

    # —— 落位新目录 ——
    for new_ch in sorted(NEW):
        shutil.move(os.path.join(tmp_src, f"chapter-{new_ch:02d}"), os.path.join(SRC, f"chapter-{new_ch:02d}"))
        dsrc = os.path.join(tmp_diag, f"chapter-{new_ch:02d}")
        if os.path.isdir(dsrc):
            os.makedirs(os.path.join(DIAG, f"chapter-{new_ch:02d}"), exist_ok=True)
            shutil.move(dsrc, os.path.join(DIAG, f"chapter-{new_ch:02d}"))
    shutil.rmtree(TMP, ignore_errors=True)

    print("\n完成：16 章已落位。请检查 Makefile、slides 数据与交叉引用。")

    # —— 字数量复：新章现字数 ——
    print("\n新章字数：")
    total = 0
    for new_ch in sorted(NEW):
        p = os.path.join(SRC, f"chapter-{new_ch:02d}", SLUGS[new_ch])
        with open(p, encoding="utf-8") as f:
            wc = han_count(f.read())
        total += wc
        print(f"  {new_ch:2d}. {TITLES[new_ch]}：{wc} 字")
    print(f"  合计：约 {total} 字")


if __name__ == "__main__":
    main()
