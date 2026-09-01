# 后记 {epub:type=preface .unnumbered}

本书从传统软件工程出发，走向智能软件工程，试图为读者勾勒一幅完整的图景：软件工程的核心问题——在成本与进度约束下交付高质量软件——历经半个多世纪而未变，而解决这一问题的手段正随着人工智能的成熟而剧烈演进。

在编写过程中，我们始终提醒自己两点。其一，软件工程的"三要素"——过程、方法、工具——是整体演进的：正如敏捷方法标志着一个时代的更替，大语言模型正在同时触动软件工程的过程、方法、工具与范型四个维度，预示着智能软件工程新时代的到来。其二，无论工具如何强大，人始终是软件工程的主体：AI 增强的是工程师的能力，而需求的理解、架构的判断、质量的责任仍然属于人。

人工智能时代的软件工程师，需要的不仅是编码能力，更是定义问题的能力、与模型协作的能力、以及坚守职业伦理的定力。愿本书的读者在掌握工程方法的同时，始终保持对软件质量的敬畏，始终以公众利益为先，让软件真正走入人心。

本书在第二版中进一步向智能软件工程方向扩充：既有各章把智能化内容加深到实践层面，新增"大模型应用开发范式"与"智能体系统工程与智能软件工程展望"两章，覆盖 LLM 应用架构、模型路由治理、RAG 工程化、LLM 评测与质量保障、智能体系统架构、多智能体协作与 AI 驱动开发的组织效能；在第三版中再向 AI 原生软件工程方向扩充，新增"AI 原生开发范式"与"AI 原生平台、组织与智能软件工程未来"两章，把大模型能力确立为软件开发基础设施，系统展开意图驱动开发、规格即代码、分级质量门禁、AI 原生平台与人机混合团队等范式与组织议题；在第四版中再向软件工程 3.0 方向扩充，新增"软件工程 3.0：大模型驱动的研发新范式""自主软件工程：智能体网络与自主开发"与"智能软件工程的治理、安全与未来"三章，把大模型确立的 AI 原生范式上升为以意图为中心、以对话为方式的第三代软件工程，系统展开三代范式的演进脉络、软件即模型、Vibe Coding 与智能体工程、自主性分级、智能体网络、信任与验证，以及大模型时代的软件安全、度量治理与全书结语。在最近一次修订中，全书重新组织为十六章：将主题相近的章节合并，形成以软件生命周期为主线、传统与智能两大部分相互衔接的整体框架——第一至第九章为传统软件工程基础，第十至第十六章为智能软件工程专章，并在章节衔接处对各章内容作了进一步深化与完善。扩充所引用的相关文献，一并补充于参考文献中，供读者延伸阅读。

本书成稿于辽宁师范大学，作者在此向长期以来关心和支持本书的同事与同学致以诚挚的谢意。书中不当之处，敬请读者指正。

张大为
2026 年 8 月

## 参考文献

[1] 张海藩. 软件工程导论[M]. 北京：清华大学出版社.

[2] Brooks F P. The Mythical Man-Month: Essays on Software Engineering[M]. Addison-Wesley, 1975.

[3] Brooks F P. No Silver Bullet: Essence and Accidents of Software Engineering[J]. IEEE Computer, 1987, 20(4): 10-19.

[4] Bourque P, Dupuis R, Abran A, et al. The Guide to the Software Engineering Body of Knowledge[J]. IEEE Software, 1999: 35-44.

[5] Abran A, Moore J W. SWEBOK: Guide to the Software Engineering Body of Knowledge[M]. IEEE Computer Society Press, 2002.

[6] IEEE/ACM Joint Task Force on Software Engineering Ethics and Professional Practices. Software Engineering Code of Ethics and Professional Practice[S]. 1999.

[7] Chen M, Tworek J, Jun H, et al. Evaluating Large Language Models Trained on Code[J]. arXiv:2107.03374, 2021.

[8] Peng S, Kalliamvakou E, Cihon P, et al. The Impact of AI on Developer Productivity: Evidence from GitHub Copilot[J]. arXiv:2302.06590, 2023.

[9] IEEE Computer Society. Guide to the Software Engineering Body of Knowledge (SWEBOK), Version 4.0[S]. 2024.

[10] Martínez-Fernández S, Bogner J, Franch X, et al. Software Engineering for AI-Based Systems: A Survey[J]. arXiv:2105.01984, 2021.

[11] Lewis P, Perez E, Piktus A, et al. Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks[C]. NeurIPS, 2020.

[12] Yao S, Zhao J, Yu D, et al. ReAct: Synergizing Reasoning and Acting in Language Models[C]. ICLR, 2023.

[13] Jimenez C E, Yang J, Wettig A, et al. SWE-bench: Can Language Models Resolve Real-World GitHub Issues?[C]. ICLR, 2024.

[14] Vaswani A, Shazeer N, Parmar N, et al. Attention Is All You Need[C]. NeurIPS, 2017.

[15] Li Y, Choi D, Chung J, et al. Competition-Level Code Generation with AlphaCode[J]. Science, 2022, 378(6624): 1092-1097.

[16] Yang J, Jimenez C E, Wettig A, et al. SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering[C]. NeurIPS, 2024.

[17] Wang L, Ma C, Feng X, et al. A Survey on Large Language Model based Autonomous Agents[J]. Frontiers of Computer Science, 2024, 18(6): 186345.

[18] Hassan A E, Oliva G A, Lin D, et al. Towards AI-Native Software Engineering (SE 3.0): A Vision and a Challenge Roadmap[J]. ACM Transactions on Software Engineering and Methodology, 2024. arXiv: 2410.06107.

[19] Karpathy A. There's a New Kind of Coding Called "Vibe Coding"[EB/OL]. X (Twitter), 2025-02-02.

[20] Karpathy A. Agentic Engineering[EB/OL]. 2026-02.

[21] Dong Y, Jiang X, Qian J, et al. A Survey on Code Generation with LLM-based Agents[J]. arXiv: 2508.00083, 2025.
