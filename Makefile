# Pandoc 书籍编译环境
# 参考 sd_harmony/book 项目的构建方式（该参考自 handout 项目沿袭）。
#
# 章节命名约定：
#   src/chapter-NN/NNNN-slug.md
#   NNNN = 章号×100 + 小节序号，例如 0100-introduction.md、0200-requirement.md、0800-design.md
# 每章的主文件以 `#` 开头（章标题），同章子文件以 `##` 开头（节标题），
# 编译后每章对应一个顶层章节。新增章节后把文件路径追加到下面的 INPUT 列表（行尾反斜杠续行）。

include common.mk

PANDOCX := D:/bookspace/pandocx
OUTPUT  := md_writing

# PlantUML 图表渲染（diagrams/chapter-NN/*.puml -> src/chapter-NN/images/*.png）
PLANTUML := d:/envroot/idea/pandoc-3.9/plantuml.jar

INPUT := src/frontmatter.md \
	src/chapter-01/0100-introduction.md \
	src/chapter-02/0200-method.md \
	src/chapter-03/0300-process.md \
	src/chapter-04/0400-requirement.md \
	src/chapter-05/0500-uml.md \
	src/chapter-06/0600-analysis.md \
	src/chapter-07/0700-design.md \
	src/chapter-08/0800-pattern.md \
	src/chapter-09/0900-implementation.md \
	src/chapter-10/1000-testing.md \
	src/chapter-11/1100-evolution-quality.md \
	src/chapter-12/1200-formal.md \
	src/chapter-13/1300-management.md \
	src/chapter-14/1400-tool.md \
	src/chapter-15/1500-practice.md \
	src/chapter-16/1600-ai-engineering.md \
	src/chapter-17/1700-agent-development.md \
	src/chapter-18/1800-llm-application.md \
	src/chapter-19/1900-agent-systems.md \
	src/backmatter.md

all: diagrams init html tex pdf

init:
	python $(PANDOCX)/src/main/python/init.py build

diagrams:
	python .harness/tools/generate-diagrams.py

.PHONY: diagrams

html:
	pandoc --verbose --resource-path=$(PANDOCX) \
		-M crossrefYaml=$(PANDOCX)/repos/crs/zh-CN.yaml \
		-F pandoc-crossref \
		--number-sections \
		--top-level-division=chapter \
		--template=src/main/templates/html/book/book.html \
		$(INPUT) \
		-output-directory=build \
		-o build/$(OUTPUT).html

tex:
	pandoc --verbose --pdf-engine=xelatex --resource-path=$(PANDOCX) \
		--filter $(PANDOCX)/src/main/python/fenced_divs.py \
		--lua-filter=.harness/filters/svg-to-png.lua \
		-M crossrefYaml=$(PANDOCX)/repos/crs/zh-CN.yaml \
		--metadata-file=$(PANDOCX)/src/main/templates/tex/book/md_writing.yaml \
		-F pandoc-crossref \
		--number-sections \
		--top-level-division=chapter \
		--template=src/main/templates/tex/book/md_writing.tpl \
		$(INPUT) \
		-o build/$(OUTPUT).tex

pdf:
	latexmk build/$(OUTPUT).tex -xelatex -shell-escape \
		-halt-on-error -interaction=nonstopmode -output-directory=build

# 渲染 diagrams/ 下的 PlantUML 源为各章 images/ 的 PNG（需要 Java 与 plantuml.jar）。
# 本仓库暂未引入 diagrams/ 与 .harness/tools/generate-diagrams.py，后续需要时再补此 target。
