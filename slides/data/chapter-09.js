// 由 slides/tools/generate.js 生成，旁白由 tools/apply-narration.js 合并
window.SLIDES = {
  "chapter": "chapter-09",
  "num": 9,
  "slug": "chapter-09",
  "title": "软件实现",
  "subtitle": "软件编码不是把设计机械地转换成源代码的低水平工作，而是一个复杂而迭代的过程",
  "slides": [
    {
      "id": "chapter09-title",
      "type": "title",
      "title": "第9章　软件实现",
      "body": "",
      "narration": "欢迎学习《智能软件工程基础》第九章，软件实现。本章先讲编码的六个环节与编码规范，穿插命名、注释的样例与代码审查的案例，再看代码检查、走查、审查三道质量关口，最后讨论智能编码如何改变实现方式。"
    },
    {
      "id": "chapter09-1",
      "type": "section",
      "title": "软件编码的工作",
      "body": "<p class=\"lead\">软件编码包括六个环节：<strong>程序设计</strong>（理解需求与设计模型、补充遗漏的详细设计、设计代码结构）、<strong>设计审查</strong>（检查设计结果并记录缺陷）、<strong>编写代码</strong>（遵循编码规范、保证代码易验证）、<strong>代码走查</strong>（确认代码完成既定工作、记录缺陷）、<strong>编译代码</strong>（修正语法错误）、<strong>测试代码</strong>（单元测试与调试）。六个环节的任务与目的如下表所示。</p>\n<table><thead><tr><th>环节</th><th>主要任务</th><th>目的</th></tr></thead><tbody><tr><td>程序设计</td><td>理解需求与设计、设计代码结构</td><td>保证编码有据可依</td></tr><tr><td>设计审查</td><td>检查设计结果并记录缺陷</td><td>早期发现设计问题</td></tr><tr><td>编写代码</td><td>遵循编码规范、保证易验证</td><td>产出可读可维护代码</td></tr><tr><td>代码走查</td><td>确认代码完成既定工作</td><td>发现并记录缺陷</td></tr><tr><td>编译代码</td><td>修正语法错误</td><td>保证可编译运行</td></tr><tr><td>测试代码</td><td>单元测试与调试</td><td>验证行为正确</td></tr></tbody></table>\n<div class=\"img-single\"><img src=\"../src/chapter-09/images/implementation-01.png\" alt=\"\" style=\"width:60%\"></div>",
      "narration": "软件编码包括六个环节：程序设计、设计审查、编写代码、代码走查、编译代码、测试代码。六者环环相扣，从理解设计到产出可运行的代码，共同保证编码有据可依、质量可控。"
    },
    {
      "id": "chapter09-2",
      "type": "section",
      "title": "编码规范",
      "body": "<p class=\"lead\">编码规范是与语言相关的代码编写规则集合，其目的是提高编码质量、增强可读性、可重用性与可移植性。规范从几个方面展开：</p>\n<ul><li><strong>基本要求</strong>：程序结构清晰简单、算法直接了当、尽量使用标准库与公共函数、用括号消除二义性；</li><li><strong>可读性</strong>：可读性第一、效率第二。文件与函数有头注释、变量与常量有说明、注释与代码一致、用统一缩进显示逻辑结构，嵌套层次不超过五层；</li><li><strong>命名规则</strong>：标识符望文知义，遵循\"最小长度下的最大信息\"原则；变量用名词、函数用动词；类名首字母大写组合、常量全大写用下划线分隔、成员与局部变量用驼峰式命名；</li><li><strong>结构化要求</strong>：禁止 GOTO，避免多个循环出口，函数保持单入口单出口；</li><li><strong>正确性与容错性</strong>：程序首先是正确其次才是优美；对用户输入进行合法性检查、变量使用前初始化、提交联调前必须通过单元测试（对每个公有方法测试正确输入与容错处理）；</li><li><strong>可重用与可移植性</strong>：相对独立的功能封装为公共类或模板，尽量使用标准库与标准 SQL，避免依赖第三方专用接口。</li></ul>\n<ul><li>常见的实现缺陷包括：内存泄漏（malloc 分配后未释放）、指针参数失效（值传递无法修改实参）、\"野指针\"（释放后未置空）、异常处理中的资源未释放、循环内重复计算等。</li><li>对策是：申请内存后立即检查、释放后置 NULL、申请与释放配对、算法优化与把循环不变量提出循环体。</li><li>常用命名规范速查如下表所示。</li></ul>\n<table><thead><tr><th>标识符</th><th>命名规则</th><th>示例</th></tr></thead><tbody><tr><td>类名</td><td>首字母大写、组合单词</td><td>OrderManager</td></tr><tr><td>方法/函数</td><td>动词开头、驼峰式</td><td>calculateTotal()</td></tr><tr><td>常量</td><td>全大写、下划线分隔</td><td>MAX_BUFFER_SIZE</td></tr><tr><td>成员变量</td><td>驼峰式、可加下划线前缀</td><td>_orderCount</td></tr><tr><td>局部变量</td><td>驼峰式、简洁达意</td><td>totalAmount</td></tr></tbody></table>\n<ul><li>编码规范的六个维度共同保证代码质量，如图所示。</li></ul>",
      "narration": "编码规范是与语言相关的代码编写规则集合，目标是提高编码质量与可读性。基本要求结构清晰、多用标准库；可读性第一、效率第二；命名望文知义；禁止 GOTO、单入口单出口；程序首先要正确。"
    },
    {
      "id": "chapter09-3",
      "type": "section",
      "title": "编码规范（续）",
      "body": "<div class=\"img-single\"><img src=\"../src/chapter-09/images/0903-code-standard.svg\" alt=\"\" style=\"width:75%\"></div>\n<div class=\"img-single\"><img src=\"../src/chapter-09/images/implementation-02.png\" alt=\"\" style=\"width:60%\"></div>\n<p class=\"lead\">模块之间应保持单向依赖，环形依赖是代码腐化的信号，正确与错误的结构对比如图所示。</p>\n<div class=\"img-single\"><img src=\"../src/chapter-09/images/0904-module-dep.svg\" alt=\"\" style=\"width:70%\"></div>",
      "narration": "这一页继续看结构要求：模块之间应保持单向依赖，环形依赖是代码腐化的信号。图中对比了正确与错误的结构，我们应当保持模块间清晰的单向关系。"
    },
    {
      "id": "chapter09-4",
      "type": "section",
      "title": "代码检查与审查",
      "body": "<p class=\"lead\">编译没有错误绝不意味着程序没有错误。<strong>代码检查</strong>通过静态阅读代码发现逻辑、计算、接口、数据处理与文档等各类缺陷，并按严重性（严重/中等/很小）排序调度修正工作。</p>\n<ul><li>检查清单通常按类、属性、构造函数、方法头、方法体分项检查：命名是否与设计相符、是否尽量私有、头部是否说明目的与前后置条件、每个循环能否终止、是否考虑了非法参数等。</li><li><strong>代码审查</strong>则由同行以会议形式系统性检查，是发现缺陷、分享知识的重要手段。</li><li>三种手段的对比如下表所示。</li></ul>\n<table><thead><tr><th>手段</th><th>方式</th><th>主要目的</th></tr></thead><tbody><tr><td>代码检查</td><td>按清单静态阅读代码</td><td>发现逻辑、接口等缺陷并按严重性排序</td></tr><tr><td>代码走查</td><td>作者讲解、小组验证</td><td>确认代码完成既定工作、记录缺陷</td></tr><tr><td>代码审查</td><td>同行会议式评审</td><td>系统性检查、分享知识</td></tr></tbody></table>\n<ul><li>代码检查、走查与审查三种手段共同构成编码后的质量关口，如图所示。</li></ul>\n<div class=\"img-single\"><img src=\"../src/chapter-09/images/0901-review-types.svg\" alt=\"\" style=\"width:85%\"></div>\n<ul><li>三者都指向缺陷修正，只是方式与侧重不同——检查靠清单、走查靠讲解、审查靠同行碰撞。</li></ul>",
      "narration": "记住，编译没有错误绝不意味着程序没有错误。代码检查按清单静态阅读代码、按严重性排序缺陷；代码走查由作者讲解、小组验证；代码审查由同行以会议形式系统性检查，是发现缺陷、分享知识的重要手段。"
    },
    {
      "id": "chapter09-5",
      "type": "section",
      "title": "样例：命名从糟糕到良好",
      "body": "<p class=\"lead\">命名是编码规范中最立竿见影的一环：标识符是读者理解代码的第一线索，<strong>望文知义的命名</strong>让意图直接可见，糟糕的命名则逼读者逐行推理。下面同一段逻辑——计算图书借阅超期天数与罚款——先给出糟糕的命名版本：</p>\n<pre class=\"prompt\"><code>void handle() {\n    int a = b.ret - b.due;   // a：借阅天数，b：借阅记录\n    int d1 = a - b.allow;    // d1：超期天数\n    double tmp = d1 * 0.5;   // tmp：罚款金额，每天 0.5 元\n    if (d1 &lt;= 0) { tmp = 0; }\n    System.out.println(d1 + \"天，\" + tmp + \"元\");\n}</code></pre>\n<ul><li>再给出良好的命名版本：</li></ul>\n<pre class=\"prompt\"><code>void printOverdueInfo(Borrower borrower) {\n    int daysBorrowed = daysBetween(borrower.returnDate, borrower.dueDate);\n    int daysOverdue  = daysBorrowed - borrower.allowedDays;\n    double fine = daysOverdue &gt; 0 ? daysOverdue * DAILY_FINE : 0;\n    System.out.println(daysOverdue + \"天，\" + fine + \"元\");\n}\n\nboolean isOverdue(Borrower borrower) {\n    return borrower.returnDate &gt; borrower.dueDate;\n}</code></pre>",
      "narration": "先看命名的样例。命名是编码规范中最立竿见影的一环，标识符是读者理解代码的第一线索。同一段计算图书超期天数与罚款的逻辑，糟糕的命名版本里 handle、a、d1 很难看出意图。"
    },
    {
      "id": "chapter09-6",
      "type": "section",
      "title": "样例：命名从糟糕到良好（续）",
      "body": "<p class=\"lead\">两版功能完全相同，可读性却天差地别：</p>\n<ul><li><code>handle()</code> → <code>printOverdueInfo()</code>：函数名从\"什么也不说\"变成\"做什么一目了然\"；</li><li><code>a</code>、<code>d1</code>、<code>tmp</code> → <code>daysBorrowed</code>、<code>daysOverdue</code>、<code>fine</code>：变量名把含义（天数、金额）写进标识符，读者不必回看注释；</li><li><code>b</code> → <code>borrower</code>：参数的角色与类型清楚，调用处无需猜测\"这个 b 是谁\"；</li><li>新增 <code>isOverdue()</code>：把\"是否超期\"提炼成可复用、可测试的布尔函数，命名本身就是一句注释。</li></ul>\n<ul><li>命名改变的只是几个字符，改变的却是整个团队理解与维护这段代码的成本。</li></ul>",
      "narration": "接着看，两版功能完全相同，可读性却天差地别：handle 改成 printOverdueInfo、a、d1 改成 daysBorrowed、daysOverdue、b 改成 borrower，还提炼出 isOverdue。改的是几个字符，变的却是维护这段代码的成本。"
    },
    {
      "id": "chapter09-7",
      "type": "section",
      "title": "案例：代码审查抓住的经典缺陷",
      "body": "<p class=\"lead\">代码审查的价值常被概括为\"<strong>第二双眼睛</strong>\"：作者熟悉自己的意图，容易\"想当然\"跳过边界，而旁观者总能问出\"这里真的对吗\"。一个典型的例子是边界条件——<code>&lt;=</code> 与 <code>&lt;</code> 的一字之差。</p>\n<ul><li>一次订单系统的促销活动规则是\"单笔订单满 100 元免运费\"，实现时条件却写成了：</li></ul>\n<pre class=\"prompt\"><code>if (total &lt; 100) { chargeShipping(); }   // 缺陷：恰好 100 元的订单被收运费</code></pre>\n<ul><li>正确应为 <code>total &lt;= 100</code>。</li><li>这一字之差意味着，恰好落在 100 元档位的订单会被错误收取运费，若上线将引发成批客诉与赔付。</li><li>代码审查时，同事一句\"100 元整的订单呢？</li></ul>\n<ul><li><strong>数组越界</strong>：循环 <code>i &lt; n</code> 写成 <code>i &lt;= n</code>，或下标从 1 而非 0 开始；</li><li><strong>空指针</strong>：解引用前未判断对象可能为 null，异常输入下崩溃；</li><li><strong>资源泄漏</strong>：异常路径漏释放内存、连接或文件句柄；</li><li><strong>语义偏差</strong>：逻辑与需求表述不一致，代码\"能跑\"但\"不对\"。</li></ul>",
      "narration": "再看代码审查的经典案例。审查常被概括为第二双眼睛。满一百元免运费写成 total 小于一百才收费，恰好一百元的订单被错收运费。同事一句一百元整的订单呢，就抓住了这个边界缺陷。"
    },
    {
      "id": "chapter09-8",
      "type": "section",
      "title": "案例：代码审查抓住的经典缺陷（续）",
      "body": "<p class=\"lead\">审查把\"作者自证正确\"换成\"他人质疑正确\"，一次往往能发现 3–5 处测试未必覆盖的边界缺陷。正是这双\"第二双眼睛\"，让许多事故止步于合入之前。</p>",
      "narration": "审查把作者自证正确换成他人质疑正确，一次往往能发现三到五处测试未必覆盖的边界缺陷。正是这双第二双眼睛，让许多事故止步于合入之前。"
    },
    {
      "id": "chapter09-9",
      "type": "section",
      "title": "样例：注释与文档的规范写法",
      "body": "<p class=\"lead\">注释是写给下一个维护者看的，而不是写给编译器。规范写法的第一原则是：<strong>注释解释\"为什么\"，而非复述\"是什么\"</strong>。</p>\n<ul><li>复述代码的注释只是噪音，解释取舍、约束与历史原因的注释才传递知识。</li><li>先看差的写法：</li></ul>\n<pre class=\"prompt\"><code>double total = 0;\nfor (Item it : items) {\n    total += it.price * it.count;   // 累加价格\n}</code></pre>\n<ul><li>再看好的写法——同样的功能，把\"为什么\"写清楚：</li></ul>\n<pre class=\"prompt\"><code>/**\n * 判断订单是否满足发货条件。\n * 前置条件：order 非空且状态已锁定。\n * 后置条件：不修改订单状态。\n */\nboolean canShip(Order order) {\n    // 为什么只判库存：运费、地址等校验已在更早的下单环节完成\n    // 为什么用 &gt; 而非 &gt;=：库存恰好为 0 时无货可发\n    return order.stock &gt; 0;\n}</code></pre>",
      "narration": "再来看注释的规范写法。注释写给下一个维护者，第一原则是解释为什么，而非复述是什么。复述代码的注释只是噪音，解释取舍、约束与历史原因的注释才传递知识。"
    },
    {
      "id": "chapter09-10",
      "type": "section",
      "title": "样例：注释与文档的规范写法（续）",
      "body": "<p class=\"lead\">规范注释通常分三类：</p>\n<table><thead><tr><th>注释类型</th><th>位置</th><th>内容</th></tr></thead><tbody><tr><td>头注释</td><td>类或模块开头</td><td>职责、使用方式、维护约定</td></tr><tr><td>接口注释</td><td>函数声明上方</td><td>意图、前置/后置条件、参数含义</td></tr><tr><td>关键逻辑注释</td><td>算法或取舍处</td><td>解释\"为什么这样写\"及历史原因</td></tr></tbody></table>\n<ul><li>头注释让读者不读实现即知职责，接口注释让调用者不读实现即会用，关键逻辑注释保护那些\"代码读不出来\"的决策。</li><li>而<strong>与代码不一致的注释比没有注释更有害</strong>——它会把维护者引向错误的方向。</li></ul>",
      "narration": "规范注释分三类：头注释说明职责、接口注释说明意图与前后置条件、关键逻辑注释解释为什么。头注释让读者不读实现即知职责，接口注释让调用者不读实现即会用。记住，与代码不一致的注释比没有注释更有害。"
    },
    {
      "id": "chapter09-11",
      "type": "section",
      "title": "案例：一份可读的代码胜过十页文档",
      "body": "<p class=\"lead\">\"代码即文档\"（code as documentation）的含义是：可读的代码本身就是最可靠的文档——它时刻与实际行为一致，不需要维护，也<strong>不会过期</strong>。注释与文档都可能撒谎，代码不会。</p>\n<ul><li>一个典型的接手场景印证了这一点。</li></ul>\n<ul><li>团队接手一个遗留系统，其中有两个规模相近的模块：模块 A 几乎没有注释，但命名清晰、结构简单，如 <code>invoiceDueDate</code>、<code>chargeLateFee()</code>，一眼能读出意图；</li><li>模块 B 注释满篇，命名却混乱，如 <code>a</code>、<code>tmp</code>、<code>doThing()</code>，且注释常与代码不符——代码已改而注释未改。</li><li>半年后，两组维护体验天差地别：</li></ul>\n<table><thead><tr><th>模块</th><th>特点</th><th>维护体验</th></tr></thead><tbody><tr><td>A</td><td>无注释，命名清晰</td><td>读代码即理解意图，改动无需担心旁支</td></tr><tr><td>B</td><td>注释满篇，命名混乱</td><td>每次改动都要通读上下文猜测意图</td></tr></tbody></table>\n<ul><li>对模块 B 的一次需求变更，团队排查了两天才敢动手，最后靠重读旧代码并补写单元测试验证；</li><li>而模块 A 的同类变更当天完成。</li><li>这正说明<strong>命名与结构承担\"是什么\"，注释只负责解释\"为什么\"</strong>——与其堆十页文档，不如让每一行代码都被人一眼读懂。</li></ul>",
      "narration": "这个案例印证了代码即文档。可读的代码时刻与实际行为一致、不会过期，注释与文档却可能撒谎。接手遗留系统时，无注释但命名清晰的模块，远比注释满篇却混乱的模块更易维护。"
    },
    {
      "id": "chapter09-12",
      "type": "section",
      "title": "智能编码",
      "body": "<p class=\"lead\">大语言模型把\"编码\"从人工逐行书写推向人机协作。AI 编码助手可以：根据注释与函数签名<strong>生成</strong>函数体与测试代码，<strong>补全</strong>上下文相关的代码，对提交前的代码<strong>执行</strong>静态检查与安全扫描，按规范<strong>重构</strong>代码并给出解释。</p>\n<ul><li>智能编码的实践要点在于\"规范前置\"：把命名规则、注释格式、结构要求写入项目约定或提示词，AI 生成的代码才能符合规范；</li><li>同时在提交前以代码审查清单为提示词让 AI <strong>自检</strong>，以单元测试验证生成结果。</li><li>AI 大幅提高了编码效率，但正确性与可维护性的责任仍然落在程序员身上——尤其是内存管理、异常路径这类\"机器容易犯、且犯错代价高\"的场景。</li></ul>\n<ul><li>代码生成的质量需要区分两个层次：<strong>可编译</strong>只说明语法正确，<strong>可维护</strong>才意味着可以长期演进。</li><li>AI 生成的代码在语法层面已经相当可靠，但可维护性——命名是否达意、结构是否符合项目约定、是否包含不必要的抽象、异常路径是否被妥善处理——仍需要以规范和审查来约束。</li><li>把\"能否通过静态检查与单元测试\"作为 AI 生成代码的准入门槛，是防止\"能跑但不可维护\"的低质代码混入基线的最低要求。</li></ul>\n<ul><li>对内存管理、并发与异常路径这类\"机器容易犯、且犯错代价高\"的场景，应当采取更保守的策略：要求 AI 在生成此类代码时<strong>显式说明其资源与并发假设</strong>，由工程师逐行审查后再进入测试；</li><li>必要时把这类高风险模块标记为\"禁止 AI 直接合并\"，强制人工评审。</li><li>编码规范的本质是对风险的分配——AI 适合承担高频低风险的常规实现，而低频高风险的部分始终保留人的判断。</li></ul>\n<table><thead><tr><th>环节</th><th>AI 承担</th><th>人保留</th></tr></thead><tbody><tr><td>代码生成</td><td>函数体、补全、重构</td><td>定义意图与规范</td></tr><tr><td>质量检查</td><td>静态检查、安全扫描、自检</td><td>逐行审查高风险部分</td></tr><tr><td>规范执行</td><td>按项目约定输出</td><td>制定与维护规范</td></tr><tr><td>风险模块</td><td>高频低风险的常规实现</td><td>内存、并发、异常路径把关</td></tr></tbody></table>",
      "narration": "进入智能编码。大语言模型把编码从人工逐行书写推向人机协作。AI 可以生成函数体与测试、补全代码、执行静态检查、按规范重构。实践要点是规范前置，但正确性与可维护性的责任仍在人。"
    },
    {
      "id": "chapter09-13",
      "type": "section",
      "title": "智能编码（续）",
      "body": "<p class=\"lead\">人机协作编码中，人与 AI 在生成、检查、审查之间交替接力，流程如图所示。</p>\n<div class=\"img-single\"><img src=\"../src/chapter-09/images/0902-ai-coding.svg\" alt=\"\" style=\"width:90%\"></div>\n<ul><li>AI 负责高频低风险的生成与检查，人守住审查与合并的最终关口。</li><li>AI 在不同编码任务上的能力并不均等，边界与人工把关点如下表所示。</li></ul>\n<table><thead><tr><th>任务类型</th><th>AI 能力</th><th>人工把关点</th></tr></thead><tbody><tr><td>代码补全</td><td>强（局部、上下文相关）</td><td>采纳后审查语义是否贴合意图</td></tr><tr><td>代码问答与解释</td><td>强</td><td>核对解释与实现一致</td></tr><tr><td>函数级生成</td><td>中强（依赖提示质量）</td><td>规范符合性、异常路径处理</td></tr><tr><td>跨文件重构</td><td>中（易引入遗漏）</td><td>逐文件评审、跑全量测试</td></tr><tr><td>架构级决策</td><td>弱（缺乏全局约束）</td><td>由人决策，AI 仅提供候选方案</td></tr></tbody></table>\n<ul><li>把编码规范落到提示词上，就是一条\"规范前置\"的生成模板：</li></ul>",
      "narration": "这一页看人机协作的分工。AI 负责高频低风险的生成与检查，人守住审查与合并的最终关口。AI 在补全、问答上很强，函数级生成中强，跨文件重构居中，架构级决策最弱，最需人工把关。"
    },
    {
      "id": "chapter09-14",
      "type": "section",
      "title": "智能编码（续）",
      "body": "<pre class=\"prompt\"><code>你是本项目的资深工程师，请根据函数签名实现函数体，并遵守项目编码规范：\n- 命名：动词开头、驼峰式；局部变量简洁达意\n- 头注释：先写 3 行说明意图与前置/后置条件\n- 容错：对非法参数返回明确错误，不抛裸异常\n- 单入口单出口；不使用全局状态\n函数签名：public BigDecimal calculateTotal(List&lt;OrderItem&gt; items)\n请先输出实现，再输出 100 字以内的自检说明（列出满足了哪些约束）。</code></pre>\n<p class=\"lead\">把编码规范写进提示词有四个好处：规范随每次生成自动执行，而非事后检查；要求模型自检把\"审查\"前移到生成时；</p>\n<ul><li>提示词本身可版本化、随规范演进；</li><li>同一模板可复用为评审提示词，把\"生成规范\"与\"审查规范\"统一。</li><li>规范前置的落地流程是：建立项目规范 → 写进提示词模板 → AI 生成并自检 → 静态检查与单元测试 → 人工审查高风险部分，形成闭环。</li></ul>",
      "narration": "这是一条规范前置的生成模板：要求 AI 按编码规范实现函数体，并输出自检说明。规范随每次生成自动执行，自检把审查前移到生成时，提示词还可版本化、随规范演进。"
    },
    {
      "id": "chapter09-15",
      "type": "section",
      "title": "智能编码实践",
      "body": "<p class=\"lead\">智能编码的工程落地主要围绕编码助手与审查流水线展开。<strong>编码助手选型</strong>上，编辑器内嵌的补全型助手（如 GitHub Copilot）适合常规代码补全，对话式开发工具（如 Cursor、Claude Code）适合多文件修改与重构，团队可按任务类型组合使用。</p>\n<ul><li>无论选哪类工具，都应先建立项目级编码规范，再让 AI 输出，即\"规范前置\"：</li></ul>\n<table><thead><tr><th>编码规范条目</th><th>提示词化要点</th></tr></thead><tbody><tr><td>命名规则</td><td>在提示词中说明命名风格与示例</td></tr><tr><td>文件与函数头注释</td><td>要求 AI 输出前先写注释说明意图</td></tr><tr><td>结构化要求</td><td>禁止 GOTO、单入口单出口</td></tr><tr><td>正确性与容错性</td><td>要求 AI 处理非法输入并说明边界</td></tr><tr><td>可重用与可移植性</td><td>要求优先使用标准库</td></tr></tbody></table>\n<ul><li>提交前的质量关卡通常由\"自动检查 + AI 自检 + 人工审查\"三层构成：静态分析工具（如 SonarQube、CodeRabbit）自动扫描规则违反与安全风险；</li><li>让 AI 对照评审清单对自身输出自检，报告已知缺陷；</li><li>工程师针对改动的高风险部分人工审查。</li></ul>\n<ul><li>编码助手按任务类型组合使用，选型要点如下表所示。</li></ul>",
      "narration": "再看工程落地。补全型助手适合常规补全，对话式工具适合多文件修改与重构。无论选哪类，都应先建项目级编码规范、再让 AI 输出，命名、头注释、结构化、容错等条目都要提示词化。"
    },
    {
      "id": "chapter09-16",
      "type": "section",
      "title": "智能编码实践（续）",
      "body": "<table><thead><tr><th>工具类型</th><th>代表</th><th>适合任务</th><th>局限</th></tr></thead><tbody><tr><td>补全型</td><td>GitHub Copilot</td><td>常规补全、样板代码</td><td>缺全局上下文，跨文件能力弱</td></tr><tr><td>对话式</td><td>Cursor、Claude Code</td><td>多文件修改、重构、问答</td><td>依赖清晰指令，须人工评审</td></tr><tr><td>自动化代理</td><td>Agent 化编码工具</td><td>端到端任务（生成测试、修复缺陷）</td><td>输出必须经严格验证才能进入基线</td></tr></tbody></table>\n<p class=\"lead\">智能编码的工程落地可归纳为四步：其一，<strong>立规范</strong>——建立项目编码规范并写成约定文件（如 CLAUDE.md、AGENTS.md）与提示词模板；其二，<strong>选工具</strong>——按任务类型组合补全型与对话式工具，先小范围试点并跟踪采纳率；</p>\n<ul><li>其三，<strong>建关卡</strong>——配置\"自动检查 + AI 自检 + 人工审查\"三层门禁，高风险模块标记\"禁止 AI 直接合并\"；</li><li>其四，<strong>评效果</strong>——用基准任务与交付指标（采纳率、缺陷率、交付周期）评估工具收益与边界，持续调优提示词与治理策略。</li><li>四步形成从选型到治理的闭环，让 AI 编码从\"个人效率工具\"升级为\"团队工程资产\"。</li></ul>\n<ul><li>与生成债相伴的是<strong>维护成本前置</strong>：AI 可以快速产出大量代码，也让错误以同样速度积累。</li><li>生成债（generation debt）指自动生成的、缺乏设计沉淀与测试覆盖的代码堆叠而成的高维护成本区域。</li><li>控制生成债的关键是把 AI 编码纳入与人工编码同等的工程纪律——生成即测试、生成即评审、定期重构，并在度量上跟踪\"AI 产出代码的缺陷密度与返工率\"，让效率提升不转化为债务堆积。</li></ul>\n<ul><li>\"规范前置\"还要求规范可及：AI 编码助手需要能读到项目规范与相关代码。</li><li>团队通常以<strong>约定文件</strong>（如 CLAUDE.md、AGENTS.md）集中描述项目结构、编码规范、常用命令与红线约束，并配套检索知识库，让 AI 在生成时动态获取相关上下文。</li><li>约定文件的常见内容如下表所示。</li></ul>",
      "narration": "工具按任务组合：补全型缺全局上下文，对话式须人工评审，Agent 化输出须经严格验证。落地先立规范、写约定文件与提示词模板，再选工具、小范围试点，然后建自动检查加 AI 自检加人工审查的关卡。"
    },
    {
      "id": "chapter09-17",
      "type": "section",
      "title": "智能编码实践（续）",
      "body": "<table><thead><tr><th>内容</th><th>说明</th><th>示例条目</th></tr></thead><tbody><tr><td>项目概览</td><td>技术栈、目录结构、构建方式</td><td>\"本仓库为 Spring Boot 多模块项目\"</td></tr><tr><td>编码规范</td><td>命名、注释、结构要求</td><td>\"标识符用驼峰式、常量全大写\"</td></tr><tr><td>常用命令</td><td>构建、测试、运行命令</td><td>\"make test 运行全部单元测试\"</td></tr><tr><td>约束与红线</td><td>禁止事项与降级策略</td><td>\"禁止 AI 直接修改数据层\"</td></tr></tbody></table>\n<p class=\"lead\">提交前的三层质量关卡如图所示。</p>\n<div class=\"img-single\"><img src=\"../src/chapter-09/images/0900-quality-gate.svg\" alt=\"\" style=\"width:85%\"></div>\n<ul><li>智能编码的边界在于：AI 擅长的是\"把已有的明确意图转换为代码\"，而\"这个意图是否正确\"\"改动是否引入了回归\"仍需测试与评审回答。</li><li>工程师在智能编码时代的新角色——阅读、评估与整合 AI 生成代码——被概括为\"代码策展\"（code curator），这一概念将在第 17 章详细展开。</li></ul>\n<ul><li>一个完整的智能编码实例如下。</li><li>需求是\"实现购物车价格汇总：按单价×数量累加，满 1000 元打九折\"。</li><li>工程师写下的提示词为：</li></ul>",
      "narration": "约定文件要写清项目概览、编码规范、常用命令与约束红线。智能编码的边界在于：AI 擅长把明确意图转为代码，而意图是否正确、是否引入回归，仍需测试与评审回答，工程师的新角色是代码策展。"
    },
    {
      "id": "chapter09-18",
      "type": "section",
      "title": "智能编码实践（续）",
      "body": "<pre class=\"prompt\"><code>实现 calculateTotal：对订单项按\"单价×数量\"累加，满 1000 元打 9 折；\n金额用 BigDecimal 避免浮点误差；入参为空返回 0；头注释说明前置条件。</code></pre>\n<p class=\"lead\">AI 的第一版输出了可编译的实现，并在自检中说明已满足\"BigDecimal 与空入参\"两条约束。工程师评审发现两处可维护性问题：其一，折扣率 0.9 被硬编码为字面量，而项目约定\"业务参数可配置优先\"；</p>\n<ul><li>其二，BigDecimal 除法未指定舍入模式，输入含除不尽的比例时可能抛出 <code>ArithmeticException</code>。</li><li>把这两点写入提示词后生成第二版，补齐了配置提取与舍入处理，经单元测试与静态检查后合入。</li></ul>\n<ul><li>这个实例说明两点：AI 生成的第一版往往\"能跑\"但\"不符合约定\"，命名、可配置性、边界处理这类可维护性缺陷仍需人工评审发现；</li><li>而提示词中声明\"用 BigDecimal、说明前置条件\"等约束，能显著减少首版缺陷。</li><li>与纯人工编写相比，首版效率提升明显，但审查环节并未消失——它只是从\"写之前思考\"部分转移到\"生成后评审\"。</li></ul>\n<h3>智能编码的要点与误区</h3>\n<ul><li>智能编码的常见误区，是混淆\"可编译\"与\"可维护\"两个层次，或在内存、并发等高风险场景放松审查。</li><li>要点与误区如下表所示。</li></ul>",
      "narration": "这个实例中，AI 第一版实现了 calculateTotal 且可编译，但评审发现折扣率被硬编码、除法未指定舍入模式两处问题。把这两点写入提示词后生成第二版，补齐配置提取与舍入处理，测试通过后合入。"
    },
    {
      "id": "chapter09-19",
      "type": "section",
      "title": "智能编码实践（续）",
      "body": "<table><thead><tr><th>误区</th><th>典型表现</th><th>应对要点</th></tr></thead><tbody><tr><td>可编译即可维护</td><td>语法正确却难以演进的代码入基线</td><td>以规范与审查约束命名、结构与异常路径</td></tr><tr><td>高风险场景放权</td><td>内存/并发代码由 AI 直接合并</td><td>要求 AI 显式说明资源与并发假设，人工逐行审查</td></tr><tr><td>规范后置</td><td>先让 AI 输出再补规范</td><td>规范前置：命名、注释、结构要求先写入提示词</td></tr><tr><td>三层关卡缺层</td><td>只做静态检查，无人审高风险改动</td><td>自动检查 + AI 自检 + 人工审查三层齐备</td></tr></tbody></table>\n<p class=\"lead\">代码策展的工作流——从阅读评估到验证把关——如图所示。</p>\n<div class=\"img-single\"><img src=\"../src/chapter-09/images/0900-code-curator.svg\" alt=\"\" style=\"width:75%\"></div>\n<ul><li>把\"能否通过静态检查与单元测试\"作为 AI 生成代码的准入门槛，是防止\"能跑但不可维护\"的低质代码混入基线的最低要求；</li><li>而对高风险模块，应把这类改动标记为\"禁止 AI 直接合并\"，强制人工评审。</li></ul>\n<h3>前沿演进：上下文工程与 AI 编码治理</h3>",
      "narration": "常见误区有四：把可编译当可维护、高风险场景放权、规范后置、三层关卡缺层。应对之策，是把能否通过静态检查与单元测试作为准入门槛，并把高风险改动标记为禁止 AI 直接合并。"
    },
    {
      "id": "chapter09-20",
      "type": "section",
      "title": "智能编码实践（续）",
      "body": "<p class=\"lead\">前沿的 AI 编码实践把<strong>上下文工程</strong>（context engineering）作为核心：项目以约定文件（如 CLAUDE.md、.cursorrules、AGENTS.md）与检索知识库组织上下文，AI 编码时按任务动态检索架构文档、编码规范与代码样例，让生成贴合项目实际。同时，<strong>AI 编码的治理</strong>关注采纳率、生成债与降级策略：评测 AI 工具的效果（如 SWE-bench 类基准）、管理自动生成的代码债、定义何时退回人工编码。</p>\n<ul><li>治理面与目标如下表所示。</li></ul>\n<table><thead><tr><th>治理面</th><th>实践</th><th>目标</th></tr></thead><tbody><tr><td>上下文组织</td><td>约定文件 + 检索知识库</td><td>生成贴合实际</td></tr><tr><td>效果评测</td><td>基准与采纳率跟踪</td><td>量化工具价值</td></tr><tr><td>生成债管理</td><td>定期重构与清理</td><td>控制技术债</td></tr><tr><td>降级策略</td><td>高风险场景人工编码</td><td>保障质量底线</td></tr></tbody></table>\n<ul><li>项目上下文工程的闭环——从收集到沉淀——如图所示。</li></ul>\n<div class=\"img-single\"><img src=\"../src/chapter-09/images/0900-context-engineering.svg\" alt=\"\" style=\"width:85%\"></div>\n<ul><li>上下文工程揭示了一个关键转变：AI 编码的质量不再只取决于模型能力，而取决于\"喂给模型什么\"。</li><li>上下文组织能力成为工程师的核心技能，它与代码评审一起，构成 AI 编码时代质量的两道闸门。</li></ul>",
      "narration": "前沿实践把上下文工程作为核心，用约定文件与检索知识库让生成贴合项目实际。AI 编码的治理则关注采纳率、生成债与降级策略，用基准评测效果、定期重构清还代码债。"
    },
    {
      "id": "chapter09-21",
      "type": "section",
      "title": "本章小结",
      "body": "<p class=\"lead\">软件实现是把设计转译为可运行、可维护代码的活动。编码规范（命名、可读性、结构化、容错、可重用）与代码检查、走查、审查三道质量关口，是传统实现阶段的质量保障。</p>\n<ul><li>智能编码把 AI 引入生成、补全、检查与重构，但正确性与可维护性的责任仍在人：\"规范前置\"让生成符合约定，三层关卡（自动检查 + AI 自检 + 人工审查）防止低质代码入基线，内存、并发、异常路径等高风险模块保留人工把关。</li><li>工程师的新角色是代码策展——阅读、评估、整合 AI 生成的代码；</li><li>上下文工程与 AI 编码治理成为新的质量闸门。</li></ul>\n<ul><li><strong>思考与讨论：</strong> 1. 为什么\"可编译\"不等于\"可维护\"？</li><li>举一个 AI 生成代码\"能跑但不可维护\"的具体例子。</li><li>2. 请为你的团队编写一条编码提示词模板，并说明你选择了哪些规范条目、为什么。</li></ul>",
      "narration": "本章小结。软件实现是把设计转译为可运行、可维护代码的活动。编码规范与检查、走查、审查三道关口是传统质量保障；智能编码则靠规范前置与三层关卡，高风险模块保留人工把关，工程师的新角色是代码策展。好，这就是第九章的内容，我们下一章见。"
    }
  ]
};
