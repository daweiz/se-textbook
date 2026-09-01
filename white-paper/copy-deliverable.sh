#!/bin/bash
# 生成白皮书交付文件（中文文件名）
# 说明：Windows 下 GNU make 解析 Makefile 时会把非 ASCII 字节损坏，
#       故中文文件名放在本 UTF-8 脚本中，Makefile 只调用本脚本（ASCII 命令）。
# 用法：bash copy-deliverable.sh [build]
set -e
BLD="${1:-build}"
SRC="$BLD/whitepaper.pdf"
DST="$BLD/智能软件工程基础-白皮书.pdf"
cp "$SRC" "$DST"
echo "[pdf] 完成: $DST ($(wc -c < "$DST" | tr -d ' ') bytes)"
