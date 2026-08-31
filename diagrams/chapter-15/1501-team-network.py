#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""团队沟通渠道增长（N(N−1)/2）柱状图。

数据来自软件工程理论：N 人团队沟通渠道数为 N(N−1)/2。
输出 SVG + PNG 到第一个命令行参数指定的目录。
"""
import os
import sys
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
plt.rcParams["axes.unicode_minus"] = False
plt.rcParams["svg.fonttype"] = "none"  # 输出真实文本而非路径轮廓

OUT = sys.argv[1]
STEM = os.path.splitext(os.path.basename(__file__))[0]

N = [3, 5, 8]
CH = [int(n * (n - 1) / 2) for n in N]  # 3, 10, 28

fig, ax = plt.subplots(figsize=(5.4, 3.4))
bars = ax.bar(
    [f"{n} 人团队" for n in N],
    CH,
    color=["#DCE9F7", "#4A90D9", "#2C5F8A"],
    edgecolor="#2C5F8A",
    linewidth=1.2,
    width=0.55,
)
for bar, v in zip(bars, CH):
    ax.text(
        bar.get_x() + bar.get_width() / 2,
        v + 0.8,
        str(v),
        ha="center", va="bottom", fontsize=13, color="#333333",
    )
ax.set_ylim(0, 33)
ax.set_ylabel("沟通渠道数 N(N−1)/2", fontsize=11)
ax.set_yticks([0, 10, 20, 30])
ax.tick_params(colors="#333333", labelsize=11)
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
fig.tight_layout()
fig.savefig(os.path.join(OUT, STEM + ".png"), dpi=200)
fig.savefig(os.path.join(OUT, STEM + ".svg"))
