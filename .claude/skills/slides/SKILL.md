# /slides 命令

## 功能说明

基于书稿 `src/chapter-NN/NNNN-*.md` 生成 / 重建幻灯片系统，输出到 `docs/`。全书按教学划分为 **37 个小节**（每节 60 分钟，是否含提问/交流环节见小节封面），**每节一套讲解用 deck**。幻灯片系统为**零依赖、纯前端、离线可用**的播放器，支持全屏播放、浏览器 TTS 语音朗读、字幕高亮与录屏下载。

## 使用场景

| 场景 | 命令 |
|------|------|
| 重新生成全部数据（16 章 + 37 节讲解 deck） | `/slides` |
| 只重建某一节 / 某一章 | `/slides unit-05`、`/slides chapter-05` |
| 改动书稿后同步到幻灯片 | `/slides`（生成 → 合并旁白 → 校验） |
| 调整 37 节划分（改 `tools/units.js`）后重建 | `/slides` |

## 执行流程

依次执行以下三步（`unit-NN` / `chapter-NN` 可选，缺省为全部）：

```bash
# 1. 生成器：解析 src/ 书稿 → chapter-NN.js（数据源）→ unit-NN.js（拆细讲解 deck）+ 清单
node docs/tools/generate.js

# 2. 合并旁白：把 tools/narration/ 下人工撰写的旁白注入数据文件（可选限定小节/章节）
node docs/tools/apply-narration.js            # 全部
node docs/tools/apply-narration.js unit-05    # 仅第 5 节
node docs/tools/apply-narration.js chapter-05 # 仅第 5 章

# 3. 校验：数据可解析、id 唯一、图片引用齐全、旁白完整、每节 ≥30 页、内容片覆盖不重不漏
node docs/tools/verify.js
```

## 输出与产物

```
docs/
  index.html            # 小节菜单（6 模块分组，37 节卡片，双击打开即用）
  player.html           # 播放器（?u=unit-NN，兼容 ?ch=chapter-NN）
  css/player.css        # 播放器样式（亮/暗双主题 + 小节封面样式）
  js/player.js          # 播放器核心逻辑
  data/_manifest.js     # 章节清单（window.CHAPTERS）+ 小节清单（window.UNITS）
  data/chapter-NN.js    # 每章数据（生成，作为小节数据源与历史备份）
  data/unit-NN.js       # 每小节讲解用 deck（生成 + 封面旁白注入）
  tools/units.js        # 37 节划分表（单一事实来源：parts 覆盖区间、时长、环节）
  tools/generate.js     # 生成器
  tools/apply-narration.js  # 旁白合并脚本
  tools/narration/      # 人工旁白：unit-covers.js（37 篇封面）+ chapter-*.js（16 章导语）
  tools/verify.js       # 校验脚本
  README.md             # 使用说明
```

## 关键约定

- **每章一个 Markdown 文件**，文件按 `NNNN-*.md` 命名（`NNNN` = 章号×100 + 小节序号），必须位于 `src/chapter-NN/` 下且每章**恰好一个**。
- **标题层级约束**：`#` 为章标题（全书唯一顶层章节）、`##` 为节（对应章节数据中的一张内容片）、`###`/`####` 为节内小节。若书稿新增章节，须保持此约定，并同步追加到根目录 `Makefile` 的 `INPUT` 列表（`generate.js` 的 `chapterSlugs()` 自动扫描目录）。
- **37 节划分表**：`docs/tools/units.js` 是划分的单一事实来源——每节由 `parts: [{ch, from, to}]` 指定覆盖的章节内容片区间（下标 1 起，0 为章封面）、`minutes`（每节 60 分钟）、`qa`（提问/交流/讨论/演示等环节）。调整划分只改该文件再跑 `/slides`。
- **拆细规则**（讲解用 deck）：内容片按去掉「（续）」的节名归并为逻辑节，再拆成**概述页（原导引，首段导语独立成页）/ 要点页（每页至多 3 条，过长拆多页）/ 表格页 / 图示页 / 提示词页（```text 代码围栏）**；概述页、图示页、表格页均不吸收列表（列表各自成页，保证每节 ≥30 页）；同一逻辑节仅首个导语成"概述"页，后续导语转要点，避免旁白重复。
- **封面与提示词**：小节封面只留节标题（无本讲导引提纲、无模块/时长/环节徽标），封面旁白仍由 `tools/narration/unit-covers.js` 注入；书稿中的 ```text 围栏渲染为提示词框（`<pre class="prompt">`），围栏标记不进正文。
- **每节 ≥30 页**：verify.js 校验每节 deck 页数 ≥30。划分范围随书稿内容增减同步重算（`units.js` 的 parts 区间与各章内容片一一对应）。
- **图片不复制**：数据中以 `../src/chapter-NN/images/...` 相对路径引用书稿原图，`make init` 汇总到 `build/images/` 与幻灯片无关。
- **旁白独立存储**：封面旁白在 `tools/narration/unit-covers.js`（37 篇，人工撰写）、章节导语旁白在 `tools/narration/chapter-*.js`，重新运行 `generate.js` 不会丢失；改旁白只改这些文件再执行 `apply-narration.js`。子页旁白由内容自动派生（导引页复用章节人工旁白），重新生成会覆盖对子页旁白的直接修改。
- **数据加载方式**：数据文件以 `<script src>` 全局变量（`window.SLIDES`/`window.CHAPTERS`/`window.UNITS`）加载而非 `fetch` JSON——Chrome/Edge 在 `file://` 下会因 CORS 拦截本地 JSON，脚本标签不受限。

## 注意事项

- 生成前确认依赖环境：仅需 Node.js（内置模块），无需 npm 安装。
- 校验（verify.js）不通过时（如图片缺失、旁白为空、id 重复、覆盖区间超界或重复分配），先修复再交付；`apply-narration.js` 对缺失/多余的旁白键会报错并返回非零退出码。
- 生成结束后提示用户在 Chrome/Edge 中打开 `docs/index.html` 走查：小节菜单（6 模块）→ 任选一节 → 封面片（只留节标题）→ 概述/要点/表格/图示/提示词页翻页 → 全屏（F）→ 朗读（Enter，字幕随语音高亮）→ 字号缩放（工具条 `A−`/`A+` 或 `-`/`=`，`0` 复位）→ 录屏（⏺ 按钮下载 WebM）。重点抽查每节页数 ≥30、提示词以框渲染（无 ```` ``` ```` 围栏泄漏）。
