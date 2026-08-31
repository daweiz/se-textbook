#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""渲染 diagrams/ 下的多种图源为各章 images/ 的图片。

支持四种图源：
  .puml  PlantUML       -> SVG + PNG（双产物，HTML 用 SVG、TeX 用 PNG）
  .mmd   Mermaid(mmdc)  -> SVG + PNG（双产物）
  .dot/.gv  Graphviz    -> SVG + PNG（双产物）
  .py    matplotlib 脚本 -> SVG + PNG（双产物，脚本自绘雷达/柱状等图型）

用法：python .harness/tools/generate-diagrams.py
对应关系：diagrams/chapter-NN/xxx.<ext> -> src/chapter-NN/images/xxx.{png,svg}
依赖：Java 与 plantuml.jar（路径可用环境变量 PLANTUML 覆盖）、
      mmdc（mermaid-cli）、dot（Graphviz）、python（matplotlib 仅 .py 源需要）。
"""
import os
import sys
import glob
import shutil
import subprocess

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DIAGRAMS = os.path.join(ROOT, "diagrams")
PLANTUML = os.environ.get("PLANTUML", "d:/envroot/idea/pandoc-3.9/plantuml.jar")
TMP = os.path.join(ROOT, ".harness", "temp", "diagram-render")


def mmdc_cmd() -> list:
    """解析 mmdc（mermaid-cli）可执行路径。

    Windows 下 npm 全局脚本是 .cmd 批处理，CreateProcess 不能直接执行，
    须经 cmd.exe /c 调用。
    """
    exe = shutil.which("mmdc")
    if exe is None:
        raise RuntimeError("未找到 mmdc（mermaid-cli），请先全局安装")
    if os.name == "nt" and exe.lower().endswith((".cmd", ".bat")):
        return ["cmd.exe", "/c", exe]
    return [exe]

# 每种产物渲染前的重试次数（mmdc 渲染 PNG 偶发产物缺失）
RETRY = 3


def run(cmd, label):
    subprocess.run(
        cmd,
        check=True, cwd=TMP,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )
    return label


def move_out(tmp_path, target_path, ext):
    if not os.path.exists(tmp_path):
        return False
    shutil.move(tmp_path, target_path)
    return True


def render_plantuml(src, stem, target_dir):
    """PlantUML -> SVG + PNG（HTML 用 SVG，TeX 经 lua filter 转回 PNG）。"""
    outputs = []
    for fmt, ext in (("png", ".png"), ("svg", ".svg")):
        out = os.path.join(TMP, stem + ext)
        for _ in range(RETRY):
            try:
                run(["java", "-jar", PLANTUML, "-charset", "UTF-8", "-t" + fmt,
                     "-o", TMP, src], "plantuml[" + fmt + "]")
            except subprocess.CalledProcessError as e:
                msg = e.stderr.decode("utf-8", "ignore")[:300]
                print(f"      plantuml[{fmt}] 错误：{msg}")
                return None
            if os.path.exists(out):
                break
        dest = os.path.join(target_dir, stem + ext)
        if move_out(out, dest, ext):
            outputs.append(ext)
    return outputs


def render_matplotlib(src, stem, target_dir):
    """matplotlib 脚本 -> SVG + PNG。

    脚本约定：以输出目录作为第一个命令行参数，自绘图表后把
    <脚本名>.svg 与 <脚本名>.png 写入该目录。
    """
    outputs = []
    try:
        run([sys.executable, os.path.abspath(src), TMP], "matplotlib")
    except subprocess.CalledProcessError as e:
        msg = e.stderr.decode("utf-8", "ignore")[:300]
        print(f"      matplotlib 错误：{msg}")
        return None
    for ext in (".svg", ".png"):
        out = os.path.join(TMP, stem + ext)
        dest = os.path.join(target_dir, stem + ext)
        if move_out(out, dest, ext):
            outputs.append(ext)
    return outputs


def render_mermaid(src, stem, target_dir):
    outputs = []
    for fmt, ext in (("svg", ".svg"), ("png", ".png")):
        out = os.path.join(TMP, stem + ext)
        for _ in range(RETRY):
            try:
                run(mmdc_cmd() + ["-i", src, "-o", out, "-e", fmt, "-b", "white", "-s", "2"],
                    f"mmdc[{fmt}]")
            except subprocess.CalledProcessError as e:
                msg = e.stderr.decode("utf-8", "ignore")[:300]
                print(f"      mmdc[{fmt}] 错误：{msg}")
                return None
            if os.path.exists(out):
                break
        dest = os.path.join(target_dir, stem + ext)
        if move_out(out, dest, ext):
            outputs.append(ext)
    return outputs


def render_dot(src, stem, target_dir):
    outputs = []
    exe = shutil.which("dot")
    if exe is None:
        raise RuntimeError("未找到 dot（Graphviz），请先安装")
    for fmt, ext in (("svg", ".svg"), ("png", ".png")):
        out = os.path.join(TMP, stem + ext)
        try:
            run([exe, "-T" + fmt, src, "-o", out], f"dot[{fmt}]")
        except subprocess.CalledProcessError as e:
            msg = e.stderr.decode("utf-8", "ignore")[:300]
            print(f"      dot[{fmt}] 错误：{msg}")
            return None
        dest = os.path.join(target_dir, stem + ext)
        if move_out(out, dest, ext):
            outputs.append(ext)
    return outputs


RENDERERS = {
    ".puml": render_plantuml,
    ".mmd": render_mermaid,
    ".dot": render_dot,
    ".gv": render_dot,
    ".py": render_matplotlib,
}


def main() -> int:
    os.makedirs(TMP, exist_ok=True)
    srcs = sorted(
        glob.glob(os.path.join(DIAGRAMS, "**", "*"), recursive=True)
    )
    srcs = [s for s in srcs if os.path.splitext(s)[1].lower() in RENDERERS]
    if not srcs:
        print("未找到任何可渲染的图源文件（.puml/.mmd/.dot/.gv）")
        return 0

    ok = fail = 0
    for src in srcs:
        rel = os.path.relpath(src, DIAGRAMS)          # chapter-NN/xxx.ext
        chapter, fname = rel.split(os.sep)
        stem = os.path.splitext(fname)[0]
        ext = os.path.splitext(fname)[1].lower()
        target_dir = os.path.join(ROOT, "src", chapter, "images")
        os.makedirs(target_dir, exist_ok=True)

        try:
            outputs = RENDERERS[ext](src, stem, target_dir)
        except subprocess.CalledProcessError as e:
            msg = e.stderr.decode("utf-8", "ignore")[:300]
            print(f"[失败] {src}\n      {msg}")
            fail += 1
            continue

        if not outputs:
            print(f"[失败] {src}: 未生成任何产物")
            fail += 1
            continue

        files = ", ".join(
            os.path.join("src", chapter, "images", stem + o)
            for o in outputs
        )
        sizes = ", ".join(
            f"{os.path.getsize(os.path.join(ROOT, 'src', chapter, 'images', stem + o))}B"
            for o in outputs
        )
        print(f"[OK] {src} -> {files} ({sizes})")
        ok += 1

    print(f"\n完成：{ok} 成功，{fail} 失败")
    return 1 if fail else 0


if __name__ == "__main__":
    sys.exit(main())
