# 《智能软件工程基础》幻灯片系统

基于书稿 `../src/`（19 章 Markdown）生成的**零依赖、纯前端、离线可用**幻灯片播放器。
全书按教学划分为 **32 个小节**（每节 60 分钟，是否含提问/交流/讨论环节见小节封面），**每节一套讲解用 deck**，支持：

- 🖥 **全屏播放**（Fullscreen API，`F` 键）
- 🔊 **语音朗读**（浏览器内置 Web Speech API，中文 TTS，音色/语速/音调/音量可调）
- 📜 **字幕高亮**（朗读时字幕随语音逐短语高亮）
- ⏺ **录屏下载**（MediaRecorder + getDisplayMedia，可混入麦克风，输出 WebM）

## 快速开始

直接双击打开 [index.html](index.html)（小节菜单）→ 按 6 大模块点击任意小节卡片即可播放。
无需服务器、无需网络、无需安装任何依赖。

> 推荐浏览器：**Chrome / Edge**。两者支持中文语音朗读、语音随标签页音频被录进视频、以及 `onboundary` 逐字字幕高亮。
> 若音色列表为空，请稍候（语音包异步加载）或检查系统是否安装了中文语音包。

## 使用说明

| 按键 | 功能 |
|------|------|
| `←` / `→` / `↑` / `↓` / `PageUp` / `PageDown` | 翻页 |
| `Space` | 下一页 |
| `Home` / `End` | 首页 / 末页 |
| `F` | 进入 / 退出全屏 |
| `Enter` | 朗读 / 暂停当前页旁白 |
| `O` | 打开网格总览（点击任意卡片跳转，Esc 关闭） |
| `-` / `_` | 缩小字号（工具条 `A−`） |
| `=` / `+` | 放大字号（工具条 `A+`） |
| `0` | 字号复位为 100% |

**朗读**：点「朗读」按钮（或按 `Enter`）。底栏字幕随朗读逐短语高亮；音色、语速、音调、音量均可调；
勾选「读完自动下一页」可连续播放整节。

**录屏**：点「⏺ 开始录屏」→ 在 Chrome/Edge 弹窗中选择共享源 → 点「停止录屏」自动下载 WebM 视频。**共享源决定能否录到 TTS 语音**：
- **有声音优先**：选**「此标签页」**，并勾选弹窗里的**「同时分享标签页中的音频」**，TTS 朗读语音会一并录进视频（代价：视频顶部会录进浏览器"正在共享此标签页"提示条）；
- **画面干净优先**：选**「整个屏幕」或「窗口」**，无顶部大提示条（代价：Chrome 通常不提供标签页音频，TTS 语音录不进来，请勾选「混入麦克风」录讲解人声）；
- 勾选**「混入麦克风」**可叠加讲解人声（需允许麦克风权限）；若录制后无声，先确认弹窗里是否勾选了"同时分享标签页中的音频"。

## 目录结构

```
slides/
  index.html            # 小节菜单页（6 模块分组，32 节卡片）
  player.html           # 播放器页（URL 参数 ?u=unit-NN，兼容 ?ch=chapter-NN）
  css/player.css        # 播放器样式（亮/暗两套主题 + 小节封面样式）
  js/player.js          # 播放器核心逻辑
  data/_manifest.js     # 章节清单（window.CHAPTERS）+ 小节清单（window.UNITS）
  data/chapter-NN.js    # 每章幻灯片数据（生成，作为小节数据源与历史备份）
  data/unit-NN.js       # 每小节讲解用 deck（生成 + 封面旁白注入）
  tools/units.js        # 32 节划分表（单一事实来源：每节覆盖哪些章节内容片、时长、环节）
  tools/generate.js     # 生成器：src → chapter-NN.js → unit-NN.js（拆细）
  tools/apply-narration.js  # 合并人工旁白到数据文件
  tools/narration/      # 人工旁白：unit-covers.js（32 篇封面）+ chapter-*.js（19 章导语）
  tools/verify.js       # 校验：数据可解析、图片存在、旁白完整、每节 ≥30 页、内容片覆盖不重不漏
```

## 数据说明

- 数据以 **`<script src>` 全局变量**形式加载（`window.SLIDES` / `window.CHAPTERS` / `window.UNITS`），而非 `fetch` JSON——
  因为 Chrome/Edge 在 `file://` 下会因 CORS 拦截本地 JSON，而脚本标签不受限。
- 图片不复制：播放器通过 `<img src="../src/chapter-NN/images/xxx.png">` 直接引用书稿原图。
- 每张幻灯片含 `id / type / title / body / narration` 五个字段；`narration` 为口语化旁白（TTS 朗读文本，同时作为字幕）。
- 小节数据含封面片（`*-cover`，只留节标题，不含规划性提纲/徽标）与小结片（`*-end`）；封面旁白人工撰写（`tools/narration/unit-covers.js`）。

## 重新生成（改动书稿或划分后）

```bash
# 1. 从书稿 src/ 重新生成章节数据与 32 节讲解 deck
node slides/tools/generate.js

# 2. 合并人工旁白（封面旁白在 tools/narration/unit-covers.js，可选限定小节/章节）
node slides/tools/apply-narration.js            # 全部
node slides/tools/apply-narration.js unit-05    # 仅第 5 节
node slides/tools/apply-narration.js chapter-05 # 仅第 5 章

# 3. 校验数据、图片引用、旁白完整性与覆盖分配
node slides/tools/verify.js
```

> 旁白单独存放在 `tools/narration/*.js`，重新生成数据文件不会丢失人工旁白。
> 调整 32 节划分只改 `tools/units.js`（每节的 `parts` 字段 = 覆盖的章节内容片区间），重新生成即可。

## 生成规则摘要（tools/generate.js）

### 章节数据（chapter-NN.js，作为小节的数据源）
- `#` → 章标题；`##` → 一张内容片；`###` → 幻灯片内小节标题（`<h3>`）；
- 表格 / 列表 / 图片（`{width=xx%}` → CSS 宽度）原样保留；两张 ≤55% 宽的图片自动并排；```` ```text ```` 代码围栏渲染为**提示词框**（`<pre class="prompt">`，围栏标记不进正文）；
- 行内数学 `$…$` 转斜体 `<i>`，`**粗体**` → `<strong>`，`` `代码` `` → `<code>`；
- 内容超过 6 个块的长节自动拆成多张（标题加「（续）」）。

### 小节 deck（unit-NN.js，按 tools/units.js 划分 + 拆细）
- 把覆盖范围内的内容片按去掉「（续）」的节名归并为**逻辑节**，再按块类型拆成讲解子页：
  **概述页**（首段导语，原「导引」）、**要点页**（列表，每页至多 3 条，过长拆多页）、**表格页**、**图示页**、**提示词页**；
- 概述页、图示页、表格页均不吸收列表——列表各自独立成页，保证每节页数充足（≥30 页）；
- 同一逻辑节仅首个导语块成"概述"页，后续导语段转为要点（避免旁白重复）；
- 每节 deck = 封面片（只留节标题）→ 各逻辑节讲解子页 → 本节小结片；
- 封面旁白人工撰写（`tools/narration/unit-covers.js`，由 apply-narration.js 注入）；概述页复用章节人工旁白；其余子页为内容派生草案。

## 校验（tools/verify.js）

- 19 章数据可解析、id 唯一、旁白非空、图片引用齐全；
- 32 节时长 ∈ [35,60]、含封面片（type=title、旁白非空）、id 唯一、图片齐全；
- **每节 ≥30 页**：32 节讲解 deck 页数均不少于 30；
- **覆盖校验**：各章内容片被 32 节逐一分配、不重不漏（对照 `tools/units.js`，总数动态计算）。
