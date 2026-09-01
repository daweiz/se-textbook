# ============================================================
# 《智能软件工程基础》白皮书 — 构建脚本
# 参照 D:/workspace/harness/itpss/itpss2+/course/book/v3 的
# ctexbook 白皮书构建方法（pandoc → template.tex → xelatex）。
#
# 用法（在 white-paper/ 目录下，或 make -C white-paper）：
#   make          — 构建白皮书 PDF
#   make latex    — 仅生成 LaTeX 中间文件
#   make images   — 仅汇总图片到 build/images/
#   make clean    — 清理构建产物
#
# 图片解析机制：pandoc 对多个 INPUT 文件按各自源目录解析图片引用，
# 输出字面路径 images/xxx；本 Makefile 把各章 images/ 汇总到
# build/images/，xelatex 按主 tex 文件所在目录（build/）解析到它。
# ============================================================

PANDOC   := pandoc

BLD      := build
TEX      := $(BLD)/whitepaper.tex
PDF      := $(BLD)/whitepaper.pdf
TMPL     := template.tex
META     := metadata.yaml
SVGFILT  := ../.harness/filters/svg-to-png.lua

# 章节输入（与根 Makefile 的 INPUT 一致：frontmatter + 16 章 + backmatter）
INPUT := ../src/frontmatter.md \
	../src/chapter-01/0100-introduction.md \
	../src/chapter-02/0200-method-process.md \
	../src/chapter-03/0300-requirement-uml.md \
	../src/chapter-04/0400-analysis.md \
	../src/chapter-05/0500-design-pattern.md \
	../src/chapter-06/0600-implementation-testing.md \
	../src/chapter-07/0700-evolution-quality.md \
	../src/chapter-08/0800-management.md \
	../src/chapter-09/0900-tools-practice-ethics.md \
	../src/chapter-10/1000-ai-engineering-mlops.md \
	../src/chapter-11/1100-llm-application.md \
	../src/chapter-12/1200-agent-systems.md \
	../src/chapter-13/1300-ai-native.md \
	../src/chapter-14/1400-se30.md \
	../src/chapter-15/1500-autonomous-se.md \
	../src/chapter-16/1600-governance-future.md \
	../src/backmatter.md

.PHONY: all latex images pdf clean help

all: pdf

help:
	@echo "============================================"
	@echo " 《智能软件工程基础》白皮书 — 构建"
	@echo "============================================"
	@echo "  make          — 构建白皮书 PDF"
	@echo "  make latex    — 仅生成 LaTeX 中间文件"
	@echo "  make images   — 汇总各章图片到 build/images/"
	@echo "  make clean    — 清理构建产物"
	@echo "============================================"

$(BLD):
	mkdir -p $(BLD)

# --- 第 1 步：汇总图片（各章 images/ → build/images/，同名覆盖，同 init.py） ---
images: $(BLD)
	@mkdir -p $(BLD)/images
	@for img in $$(find ../src -path '*/images/*' -type f); do \
		cp "$$img" $(BLD)/images/; \
	done
	@echo "[images] 已汇总 $$(ls $(BLD)/images | wc -l) 个图片文件"

# --- 第 2 步：Markdown → LaTeX ---
latex: images
	@echo "[latex] pandoc → LaTeX..."
	$(PANDOC) --lua-filter=$(SVGFILT) \
		--number-sections \
		--top-level-division=chapter \
		--template=$(TMPL) \
		--metadata-file=$(META) \
		$(INPUT) \
		-o $(TEX)
	@echo "[latex] 已生成 $(TEX)"

# --- 第 3 步：LaTeX → PDF ---
pdf: latex
	@echo "[pdf] xelatex ×2 (latexmk)..."
	latexmk $(TEX) -xelatex -shell-escape \
		-halt-on-error -interaction=nonstopmode -output-directory=$(BLD)
	@if [ -f "$(PDF)" ]; then \
		bash copy-deliverable.sh $(BLD); \
	else \
		echo "[pdf] 失败：未生成 whitepaper.pdf，请检查 $(BLD)/whitepaper.log"; \
		exit 1; \
	fi

# --- 清理 ---
clean:
	@rm -rf $(BLD)
	@echo "[clean] 已清理"
