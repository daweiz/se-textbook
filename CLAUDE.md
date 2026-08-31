# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# CLAUDE.md

本文件为 Claude Code（claude.ai/code）在此仓库中工作时提供指导。

## 项目概述

- **项目类型**：教科书编写项目（整理资料生成教科书），书稿为《智能软件工程基础》
- **项目语言**：中文（标识符、注释、提交信息均使用中文）
- **开发语言**：TypeScript（仅用于 Hook 脚本）
- **内容参考**：`D:/bookspace/se_textbook/se`，软件工程教材的 Markdown 书稿样例
- **编译环境参考**：`D:/bookspace/sd_harmony/book`，完整的 Pandoc 编译 Markdown 成书工作环境（本仓库的 Makefile 据此搭建）

## 常用命令

- 安装依赖（仅 tsx，用于运行 hook 脚本）：`npm install`
- 单独运行 hook 脚本（调试日志系统用）：
  - `npx tsx .claude/hooks/user-prompt-submit.ts`
  - `npx tsx .claude/hooks/stop.ts`
- 书籍编译（根目录 Makefile）：
  - `make all`（等价于依次执行 `init html tex pdf`）
  - `make init`（清理/重建 `build/` 目录，并汇总 `src` 下所有 `images/` 图片到 `build/images/`）
  - `make html`、`make tex`（Pandoc 分别编译 HTML 与 TeX）
  - `make pdf`（latexmk 调 xelatex 编译 PDF）
  - 编译产物统一输出到 `build/`（已被 `.gitignore` 忽略）

## 书籍编译工作流（参照 sd_harmony/book）

书稿通过 Pandoc 工具链编译，核心依赖：

- `PANDOCX := D:/bookspace/pandocx`（Pandoc 扩展集合，含 init.py、fenced_divs.py 过滤器、HTML/TeX 模板、`repos/crs/zh-CN.yaml` 交叉引用配置）。`common.mk` 中亦支持从 `PANDOCX_HOME` 环境变量读取
- 外部工具：`pandoc`、`pandoc-crossref`（配合 `-M crossrefYaml=.../zh-CN.yaml`）、`xelatex`/`latexmk`（TeX Live）
- HTML 输出用 `--number-sections --top-level-division=chapter`，模板为 pandocx 下的 `src/main/templates/html/book/book.html`
- TeX 输出经 `fenced_divs.py` 过滤器处理，元数据来自 `src/main/templates/tex/book/md_writing.yaml`，模板为 `md_writing.tpl`
- 所有产物输出到 `build/` 目录
- 兼容性说明：Pandoc ≥3.8.2 对无题注表格输出 `{\def\LTcaptype{none}...}`，新版 longtable 会报 `No counter 'none' defined`；pandocx 的 `md_writing.tpl` 已含 `\newcounter{none}` 修复，故书稿中无题注表格可直接编译
- 模板不含标题页，书以 `# 前言` 开篇（书名、作者等元数据在 `src/metadata.yaml`，供 epub 等用途）

## 书稿组织与命名约定

章节按 `src/chapter-NN/NNNN-slug.md` 组织，文件名规则 `NNNN-` = 章号×100 + 小节序号，例如 `0100-introduction.md`、`0300-requirement-uml.md`。Makefile 的 `INPUT` 列表按此顺序罗列各章节文件作为 Pandoc 输入。

编译约束（重要）：Pandoc 以 `--top-level-division=chapter` 编译，每个 `#` 标题会成为一个独立顶层章节。因此**每章只有一个主文件**以 `#` 开头（章标题），同章子文件必须以 `##` 开头（节标题）、内部小节用 `###`/`####`，否则会拆散全书章节结构。新增章节时保持此约定，并把文件追加到 Makefile 的 `INPUT` 列表。

当前书稿共 **16 章、约 16 万字**：`src/frontmatter.md`（前言）、`src/chapter-01/`~`src/chapter-16/` 各章（第一章至第九章为传统软件工程基础，第十至第十六章为智能软件工程专章：AI 系统工程与 MLOps、大模型应用开发范式、智能体系统工程、AI 原生软件工程、软件工程 3.0、自主软件工程、智能软件工程的治理安全与未来（全书结语））、`src/backmatter.md`（后记）。内容编写参照 `D:/bookspace/se_textbook/se` 的章节组织；图片放各章 `images/` 目录，`make init` 会将其汇总到 `build/images/`；`make diagrams` 把 `diagrams/chapter-NN/` 下的图源渲染为各章 `images/` 的 SVG/PNG。

幻灯片系统：`docs/` 由书稿生成，划分表为 `docs/tools/units.js`（37 节、每节 60 分钟、6 模块），配套 `docs/tools/verify.js` 校验（每节 ≥30 页、内容片覆盖不重不漏）；改书稿或划分后运行 `/slides`（生成 → 合并旁白 → 校验）。

## 交互日志系统

`.claude/` 下有一套自包含的交互日志系统：

- `.claude/settings.json` 注册了两个 hook：`UserPromptSubmit` 与 `Stop`，均以 `npx tsx` 运行对应脚本
- `.claude/hooks/user-prompt-submit.ts`：按提示词首行关键词分类用户输入，写入 `.harness/logs/{startup,summary,tuning,action}/日期.md`，同时提取上一条 Claude 输出到 `answer/`
- `.claude/hooks/stop.ts`：会话结束时保存最后一条输出与 Token 统计到 `answer/`
- `.claude/skills/logs/SKILL.md`：`/logs` 命令的说明文档，含完整分类规则
- 详细原始交互数据在 `$HOME/.claude/projects/<项目>/<session-id>.jsonl`

hook 脚本是自包含 TypeScript，仅依赖 Node.js 内置模块，不引入 npm 依赖。
