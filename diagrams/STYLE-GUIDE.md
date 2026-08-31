# 插图重绘规范指南（Redraw Style Guide）

本文件为《智能软件工程基础》全书插图统一重绘的规范。所有结构图用 **Graphviz `.dot`**，数据图用 **matplotlib `.py`**，少量原生图型（gantt/pie/sequence/state）保留 **Mermaid `.mmd`**。目标：全部图宽高比落在 **[0.7, 2.4]**，SVG 输出含可检索中文文本。

## 1. 统一调色板

| 角色 | 色值 | 用途 |
|------|------|------|
| 主色·深蓝 | `#2C5F8A` | 节点描边、核心节点填充、图题文字 |
| 主色·亮蓝 | `#4A90D9` | 强调元素、第二序列 |
| 填充·浅蓝 | `#DCE9F7` | 普通节点填充 |
| 强调·琥珀橙 | `#E8833A` | 分支/异常/返回路径、重点标注 |
| 决策·浅黄 | `#FFF3D6` | 决策菱形填充 |
| 中性·深灰 | `#333333` | 正文文字 |
| 描边·中灰 | `#9AA7B4` | 连线 |

字体一律 **Microsoft YaHei**。背景白色。

## 2. `.dot` 统一头模板

```dot
digraph G {
    rankdir=LR;   // 或 TB，见布局模板
    labelloc="t";
    label="图题";
    graph [fontname="Microsoft YaHei", bgcolor="white", nodesep=0.5, ranksep=0.7, splines=ortho, pad=0.3, fontsize=15, fontcolor="#2C5F8A"];
    node [fontname="Microsoft YaHei", shape=box, style="rounded,filled", fillcolor="#DCE9F7", color="#2C5F8A", fontcolor="#333333", penwidth=1.3, fontsize=11, margin="0.2,0.1"];
    edge [fontname="Microsoft YaHei", fontsize=10, color="#9AA7B4", fontcolor="#333333", arrowsize=0.8, penwidth=1.2];
}
```

节点变体：
- 决策节点：`shape=diamond, fillcolor="#FFF3D6", color="#E8833A"`
- 核心/结论节点：`fillcolor="#2C5F8A", fontcolor="white"`
- 强调/异常节点：`fillcolor="#FCE9DB", color="#E8833A"`
- 回环/返回边：`style=dashed, color="#E8833A", fontcolor="#E8833A"`

## 3. 布局模板（按图型选用）

### T1 蛇形流程（LR，2 行）
线性流程 ≤ 8 步用。每列放 2 个节点（`rank=same` 同列）。
```
{ rank=same; n1; n5 }
{ rank=same; n2; n6 }
{ rank=same; n3; n7 }
{ rank=same; n4; n8 }
```
边按 n1→n2→… 连接形成"下、右、上、右"蛇形。参考 `chapter-01/0102-lifecycle.dot`、`chapter-10/1003-cfg.dot`。

### T2 配对流程（TB，行配对）
长流程用 TB，每行 2 节点、奇数序号排左、偶数排右，边产生自然蛇形；分支放在决策行下方。
参考 `chapter-12/1200-formal-verify.dot`。

### T3 三列闭环（TB，3 列）
循环/闭环流程（如 MLOps）用 3 列紧凑排布，分支节点（决策+异常）排在下行。
参考 `chapter-16/1600-mlops-closed-loop.dot`。

### T4 星形（TB，hub 居中）
1 中心 + 多子项：中心上下各排一行动子节点，`rank=same` 分组。
参考 `chapter-09/0903-code-standard.dot`。

### T5 矩阵 / 双域（LR，双 cluster）
两类主体对比：左右两个 `subgraph cluster` + 中央 hub 或交叉连线。
参考 `chapter-01/0100-ai4se-se4ai.dot`。

### T6 if/else 分支（LR 或 TB）
决策菱形居中，是/否两支分列两侧或上下，拒绝支短路到旁边、接受支继续主流程。
参考 `chapter-04/0404-change-flow.dot`、`chapter-04/0400-req-workflow.dot`。

### T7 泳道 / 阶段分组（cluster 模拟）
阶段分组用 `subgraph cluster_阶段名 { label="…"; … }`，虚线框 + 浅灰底。
参考 `chapter-03/0300-gate-forward.dot`（紧凑版不强制 cluster）。

### T8 时间轴（LR，带描述行）
演进/时间轴类：主序列一行，描述文字做第二行节点或节点多行标签。
参考 `chapter-02/0200-evolution-path.dot`。

### T9 matplotlib 柱状图（`.py`）
仅当书中有真实数值时用。模板：
```python
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
plt.rcParams["axes.unicode_minus"] = False
plt.rcParams["svg.fonttype"] = "none"   # 必须：输出真实文本
```
参考 `chapter-15/1501-team-network.py`。约定输出 `<stem>.svg` 与 `<stem>.png` 到 `sys.argv[1]`。

### T10 保留 Mermaid（`.mmd`）
gantt、pie、sequenceDiagram、stateDiagram 保留 Mermaid。若 `.mmd` 流程图比例失衡，改用 `.dot` 重绘。参考 `chapter-13/1303-iter-gantt.mmd`、`chapter-11/1102-maintenance-cost.mmd`。

## 4. 关键坑（务必遵守）

1. **ortho 边标签**：`splines=ortho` 下，**决策菱形→同秩目标框**的边标签会被丢弃（如"否"）。修复：该边改用 `xlabel="否"`。垂直边标签正常。凡是决策菱形发出的同秩边，一律用 `xlabel`。
2. **标签长度**：节点标签过长会撑爆宽度。超过 10 字用 `\n` 拆两行；父节点括号补充放第二行。
3. **节点间距**：`nodesep` 控制同秩间距，`ranksep` 控制秩间距。比例太宽 → 增大 ranksep；太窄 → 缩小/压缩标签。
4. **删除旧源**：`.puml` 转 `.dot` 后**删除原 `.puml`**（同名双产物会冲突）。本项目 PlantUML 版本不支持多色节点（`;line:` 语法报错），结构图一律用 `.dot`。
5. **图题**：`label="…"` + `labelloc="t"`，图题用深蓝。
6. **不编造数据**：柱状图/雷达图仅当书中有可比数值才用；定性维度用矩阵/径向布局。
7. **借用图不改**：`chapXX-*`、`implementation-*`、照片等无源图不重绘。

## 5. 输出与校验

- 渲染管线：`make diagrams` → `.harness/tools/generate-diagrams.py`，从 `diagrams/chapter-NN/*` 渲染到 `src/chapter-NN/images/*.svg` + `*.png`。
- 校验：`python -X utf8 .harness/tools/check-aspect-ratios.py`，要求 ratio ∈ [0.7, 2.4] 且 SVG 含 `<text`。
- 全部达标后再更新书稿引用（`.png` → `.svg`，按比例重算 `width=`）。
