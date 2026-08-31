window.SLIDES = {
  "unit": 16,
  "slug": "unit-16",
  "title": "软件编码、规范与代码审查",
  "module": "模块三　设计与实现",
  "moduleNum": 3,
  "minutes": 60,
  "qa": "",
  "chapters": [
    "第6章　软件实现与测试"
  ],
  "subtitle": "",
  "count": 43,
  "slides": [
    {
      "id": "unit16-cover",
      "type": "title",
      "title": "第16节　软件编码、规范与代码审查",
      "body": "",
      "narration": ""
    },
    {
      "id": "unit16-1",
      "type": "section",
      "title": "软件编码的工作（概述）",
      "body": "<p class=\"lead\">软件编码包括六个环节：<strong>程序设计</strong>（理解需求与设计模型、补充遗漏的详细设计、设计代码结构）、<strong>设计审查</strong>（检查设计结果并记录缺陷）、<strong>编写代码</strong>（遵循编码规范、保证代码易验证）、<strong>代码走查</strong>（确认代码完成既定工作、记录缺陷）、<strong>编译代码</strong>（修正语法错误）、<strong>测试代码</strong>（单元测试与调试）。六个环节的任务与目的如下表所示。</p>",
      "narration": "面向对象分析以用例驱动，从三个相互补充的视角建立模型。功能模型从用户角度描述系统功能，由用例和场景组成；分析对象模型描述系统的概念实体，由类图和对象图组成；动态模型描述对象之间的交互行为，由状态图和顺序图组成。分析阶段的制品包括分析类、用例实现、分析包与体系结构描述。"
    },
    {
      "id": "unit16-2",
      "type": "section",
      "title": "软件编码的工作（表格）",
      "body": "<table><thead><tr><th>环节</th><th>主要任务</th><th>目的</th></tr></thead><tbody><tr><td>程序设计</td><td>理解需求与设计、设计代码结构</td><td>保证编码有据可依</td></tr><tr><td>设计审查</td><td>检查设计结果并记录缺陷</td><td>早期发现设计问题</td></tr><tr><td>编写代码</td><td>遵循编码规范、保证易验证</td><td>产出可读可维护代码</td></tr><tr><td>代码走查</td><td>确认代码完成既定工作</td><td>发现并记录缺陷</td></tr><tr><td>编译代码</td><td>修正语法错误</td><td>保证可编译运行</td></tr><tr><td>测试代码</td><td>单元测试与调试</td><td>验证行为正确</td></tr></tbody></table>",
      "narration": "请看这张表，它概括了本节的关键信息。"
    },
    {
      "id": "unit16-3",
      "type": "section",
      "title": "软件编码的工作（图示）",
      "body": "<div class=\"img-single\"><img src=\"../src/chapter-06/images/implementation-01.png\" alt=\"\" style=\"width:60%\"></div>",
      "narration": "请看本页图示，帮助理解本节内容。"
    },
    {
      "id": "unit16-4",
      "type": "section",
      "title": "编码规范（概述）",
      "body": "<p class=\"lead\">编码规范是与语言相关的代码编写规则集合，其目的是提高编码质量、增强可读性、可重用性与可移植性。规范从几个方面展开：</p>",
      "narration": "三大视图从不同角度互补地刻画系统，其关系如图所示。功能模型回答系统做什么，对象模型回答有哪些概念实体、如何组织，动态模型回答对象之间如何交互，三者合在一起才构成完整的分析模型。"
    },
    {
      "id": "unit16-5",
      "type": "section",
      "title": "编码规范（要点）",
      "body": "<ul><li><strong>基本要求</strong>：程序结构清晰简单、算法直接了当、尽量使用标准库与公共函数、用括号消除二义性；</li><li><strong>可读性</strong>：可读性第一、效率第二。文件与函数有头注释、变量与常量有说明、注释与代码一致、用统一缩进显示逻辑结构，嵌套层次不超过五层；</li><li><strong>命名规则</strong>：标识符望文知义，遵循\"最小长度下的最大信息\"原则；变量用名词、函数用动词；类名首字母大写组合、常量全大写用下划线分隔、成员与局部变量用驼峰式命名；</li></ul>",
      "narration": "本页要点：基本要求 ：程序结构清晰简单、算法直接了当、尽量使用标准库与公共函数、用括号消除二义性； 可读性 ：可读性第一、效率第二。文件与函数有头注释、变量与常量有说明、注释与代码一致、用统一缩进显示逻辑结构，嵌套层次不超过五层； 命名规则 ：标识符望文知义，遵循\"最小长度下的最大信息\"原则；变量用名词、函数用动词；类名首字母大写组合、常量全大写用下划线分隔、成员与局部变量用驼峰式命名；。"
    },
    {
      "id": "unit16-6",
      "type": "section",
      "title": "编码规范（要点 2）",
      "body": "<ul><li><strong>结构化要求</strong>：禁止 GOTO，避免多个循环出口，函数保持单入口单出口；</li><li><strong>正确性与容错性</strong>：程序首先是正确其次才是优美；对用户输入进行合法性检查、变量使用前初始化、提交联调前必须通过单元测试（对每个公有方法测试正确输入与容错处理）；</li><li><strong>可重用与可移植性</strong>：相对独立的功能封装为公共类或模板，尽量使用标准库与标准 SQL，避免依赖第三方专用接口。</li></ul>",
      "narration": "本页要点：结构化要求 ：禁止 GOTO，避免多个循环出口，函数保持单入口单出口； 正确性与容错性 ：程序首先是正确其次才是优美；对用户输入进行合法性检查、变量使用前初始化、提交联调前必须通过单元测试（对每个公有方法测试正确输入与容错处理）； 可重用与可移植性 ：相对独立的功能封装为公共类或模板，尽量使用标准库与标准 SQL，避免依赖第三方专用接口。。"
    },
    {
      "id": "unit16-7",
      "type": "section",
      "title": "编码规范（要点 3）",
      "body": "<ul><li>常见的实现缺陷包括：内存泄漏（malloc 分配后未释放）、指针参数失效（值传递无法修改实参）、\"野指针\"（释放后未置空）、异常处理中的资源未释放、循环内重复计算等。</li><li>对策是：申请内存后立即检查、释放后置 NULL、申请与释放配对、算法优化与把循环不变量提出循环体。</li><li>常用命名规范速查如下表所示。</li></ul>",
      "narration": "本页要点：常见的实现缺陷包括：内存泄漏（malloc 分配后未释放）、指针参数失效（值传递无法修改实参）、\"野指针\"（释放后未置空）、异常处理中的资源未释放、循环内重复计算等。 对策是：申请内存后立即检查、释放后置 NULL、申请与释放配对、算法优化与把循环不变量提出循环体。 常用命名规范速查如下表所示。。"
    },
    {
      "id": "unit16-8",
      "type": "section",
      "title": "编码规范（表格）",
      "body": "<table><thead><tr><th>标识符</th><th>命名规则</th><th>示例</th></tr></thead><tbody><tr><td>类名</td><td>首字母大写、组合单词</td><td>OrderManager</td></tr><tr><td>方法/函数</td><td>动词开头、驼峰式</td><td>calculateTotal()</td></tr><tr><td>常量</td><td>全大写、下划线分隔</td><td>MAX_BUFFER_SIZE</td></tr><tr><td>成员变量</td><td>驼峰式、可加下划线前缀</td><td>_orderCount</td></tr><tr><td>局部变量</td><td>驼峰式、简洁达意</td><td>totalAmount</td></tr></tbody></table>",
      "narration": "请看这张表，它概括了本节的关键信息。"
    },
    {
      "id": "unit16-9",
      "type": "section",
      "title": "编码规范（要点 4）",
      "body": "<ul><li>编码规范的六个维度共同保证代码质量，如图所示。</li></ul>",
      "narration": "本页要点：编码规范的六个维度共同保证代码质量，如图所示。。"
    },
    {
      "id": "unit16-10",
      "type": "section",
      "title": "编码规范（图示）",
      "body": "<div class=\"img-single\"><img src=\"../src/chapter-06/images/0903-code-standard.svg\" alt=\"\" style=\"width:75%\"></div>\n<div class=\"img-single\"><img src=\"../src/chapter-06/images/implementation-02.png\" alt=\"\" style=\"width:60%\"></div>",
      "narration": "请看本页图示，帮助理解本节内容。"
    },
    {
      "id": "unit16-11",
      "type": "section",
      "title": "编码规范（要点 5）",
      "body": "<ul><li>模块之间应保持单向依赖，环形依赖是代码腐化的信号，正确与错误的结构对比如图所示。</li></ul>",
      "narration": "本页要点：模块之间应保持单向依赖，环形依赖是代码腐化的信号，正确与错误的结构对比如图所示。。"
    },
    {
      "id": "unit16-12",
      "type": "section",
      "title": "编码规范（图示 2）",
      "body": "<div class=\"img-single\"><img src=\"../src/chapter-06/images/0904-module-dep.svg\" alt=\"\" style=\"width:70%\"></div>",
      "narration": "请看本页图示，帮助理解本节内容。"
    },
    {
      "id": "unit16-13",
      "type": "section",
      "title": "代码检查与审查（概述）",
      "body": "<p class=\"lead\">编译没有错误绝不意味着程序没有错误。<strong>代码检查</strong>通过静态阅读代码发现逻辑、计算、接口、数据处理与文档等各类缺陷，并按严重性（严重/中等/很小）排序调度修正工作。</p>",
      "narration": "用例实现是从设计和分析追溯到需求的方法：动态上以直接对应用例事件序列的交互图表示，静态上以反映参与用例的类及其关系的类图表示。三类分析类的职责与识别要点可对照上表：实体类对应现实世界的\"事物\"，边界类对应参与者与系统的交互，控制类封装事件流控制逻辑。"
    },
    {
      "id": "unit16-14",
      "type": "section",
      "title": "代码检查与审查（要点）",
      "body": "<ul><li>检查清单通常按类、属性、构造函数、方法头、方法体分项检查：命名是否与设计相符、是否尽量私有、头部是否说明目的与前后置条件、每个循环能否终止、是否考虑了非法参数等。</li><li><strong>代码审查</strong>则由同行以会议形式系统性检查，是发现缺陷、分享知识的重要手段。</li><li>三种手段的对比如下表所示。</li></ul>",
      "narration": "本页要点：检查清单通常按类、属性、构造函数、方法头、方法体分项检查：命名是否与设计相符、是否尽量私有、头部是否说明目的与前后置条件、每个循环能否终止、是否考虑了非法参数等。 代码审查 则由同行以会议形式系统性检查，是发现缺陷、分享知识的重要手段。 三种手段的对比如下表所示。。"
    },
    {
      "id": "unit16-15",
      "type": "section",
      "title": "代码检查与审查（表格）",
      "body": "<table><thead><tr><th>手段</th><th>方式</th><th>主要目的</th></tr></thead><tbody><tr><td>代码检查</td><td>按清单静态阅读代码</td><td>发现逻辑、接口等缺陷并按严重性排序</td></tr><tr><td>代码走查</td><td>作者讲解、小组验证</td><td>确认代码完成既定工作、记录缺陷</td></tr><tr><td>代码审查</td><td>同行会议式评审</td><td>系统性检查、分享知识</td></tr></tbody></table>",
      "narration": "请看这张表，它概括了本节的关键信息。"
    },
    {
      "id": "unit16-16",
      "type": "section",
      "title": "代码检查与审查（要点 2）",
      "body": "<ul><li>代码检查、走查与审查三种手段共同构成编码后的质量关口，如图所示。</li></ul>",
      "narration": "本页要点：代码检查、走查与审查三种手段共同构成编码后的质量关口，如图所示。。"
    },
    {
      "id": "unit16-17",
      "type": "section",
      "title": "代码检查与审查（图示）",
      "body": "<div class=\"img-single\"><img src=\"../src/chapter-06/images/0901-review-types.svg\" alt=\"\" style=\"width:85%\"></div>",
      "narration": "请看本页图示，帮助理解本节内容。"
    },
    {
      "id": "unit16-18",
      "type": "section",
      "title": "代码检查与审查（要点 3）",
      "body": "<ul><li>三者都指向缺陷修正，只是方式与侧重不同——检查靠清单、走查靠讲解、审查靠同行碰撞。</li></ul>",
      "narration": "本页要点：三者都指向缺陷修正，只是方式与侧重不同——检查靠清单、走查靠讲解、审查靠同行碰撞。。"
    },
    {
      "id": "unit16-19",
      "type": "section",
      "title": "样例：命名从糟糕到良好（概述）",
      "body": "<p class=\"lead\">命名是编码规范中最立竿见影的一环：标识符是读者理解代码的第一线索，<strong>望文知义的命名</strong>让意图直接可见，糟糕的命名则逼读者逐行推理。下面同一段逻辑——计算图书借阅超期天数与罚款——先给出糟糕的命名版本：</p>",
      "narration": "这张图展示的是实体类之间如何通过关系连接、形成领域结构。比如订单系统中，顾客、订单与支付记录的关系就能用实体关系图清晰地表达出来，这是领域模型的基础。"
    },
    {
      "id": "unit16-20",
      "type": "section",
      "title": "样例：命名从糟糕到良好（提示词）",
      "body": "<pre class=\"prompt\"><code>void handle() {\nint a = b.ret - b.due;   // a：借阅天数，b：借阅记录\nint d1 = a - b.allow;    // d1：超期天数\ndouble tmp = d1 * 0.5;   // tmp：罚款金额，每天 0.5 元\nif (d1 &lt;= 0) { tmp = 0; }\nSystem.out.println(d1 + \"天，\" + tmp + \"元\");\n}</code></pre>\n<ul><li>再给出良好的命名版本：</li></ul>\n<pre class=\"prompt\"><code>void printOverdueInfo(Borrower borrower) {\nint daysBorrowed = daysBetween(borrower.returnDate, borrower.dueDate);\nint daysOverdue  = daysBorrowed - borrower.allowedDays;\ndouble fine = daysOverdue &gt; 0 ? daysOverdue * DAILY_FINE : 0;\nSystem.out.println(daysOverdue + \"天，\" + fine + \"元\");\n}\nboolean isOverdue(Borrower borrower) {\nreturn borrower.returnDate &gt; borrower.dueDate;\n}</code></pre>",
      "narration": "这是一个可直接套用的提示词模板。要点：再给出良好的命名版本：。"
    },
    {
      "id": "unit16-21",
      "type": "section",
      "title": "样例：命名从糟糕到良好（要点）",
      "body": "<ul><li>两版功能完全相同，可读性却天差地别：</li></ul>",
      "narration": "本页要点：两版功能完全相同，可读性却天差地别：。"
    },
    {
      "id": "unit16-22",
      "type": "section",
      "title": "样例：命名从糟糕到良好（要点 2）",
      "body": "<ul><li><code>handle()</code> → <code>printOverdueInfo()</code>：函数名从\"什么也不说\"变成\"做什么一目了然\"；</li><li><code>a</code>、<code>d1</code>、<code>tmp</code> → <code>daysBorrowed</code>、<code>daysOverdue</code>、<code>fine</code>：变量名把含义（天数、金额）写进标识符，读者不必回看注释；</li><li><code>b</code> → <code>borrower</code>：参数的角色与类型清楚，调用处无需猜测\"这个 b 是谁\"；</li></ul>",
      "narration": "本页要点：handle() → printOverdueInfo() ：函数名从\"什么也不说\"变成\"做什么一目了然\"； a 、 d1 、 tmp → daysBorrowed 、 daysOverdue 、 fine ：变量名把含义（天数、金额）写进标识符，读者不必回看注释； b → borrower ：参数的角色与类型清楚，调用处无需猜测\"这个 b 是谁\"；。"
    },
    {
      "id": "unit16-23",
      "type": "section",
      "title": "样例：命名从糟糕到良好（要点 3）",
      "body": "<ul><li>新增 <code>isOverdue()</code>：把\"是否超期\"提炼成可复用、可测试的布尔函数，命名本身就是一句注释。</li></ul>",
      "narration": "本页要点：新增 isOverdue() ：把\"是否超期\"提炼成可复用、可测试的布尔函数，命名本身就是一句注释。。"
    },
    {
      "id": "unit16-24",
      "type": "section",
      "title": "样例：命名从糟糕到良好（要点 4）",
      "body": "<ul><li>命名改变的只是几个字符，改变的却是整个团队理解与维护这段代码的成本。</li></ul>",
      "narration": "本页要点：命名改变的只是几个字符，改变的却是整个团队理解与维护这段代码的成本。。"
    },
    {
      "id": "unit16-25",
      "type": "section",
      "title": "案例：代码审查抓住的经典缺陷（概述）",
      "body": "<p class=\"lead\">代码审查的价值常被概括为\"<strong>第二双眼睛</strong>\"：作者熟悉自己的意图，容易\"想当然\"跳过边界，而旁观者总能问出\"这里真的对吗\"。一个典型的例子是边界条件——<code>&lt;=</code> 与 <code>&lt;</code> 的一字之差。</p>",
      "narration": "以图书借阅系统为例，完整走一遍分析建模的过程。系统主要支持读者借书、还书与查询图书，从问题域中不难找出图书、读者、借阅记录等候选类，再按分析类的三种类型归类，便形成上表所示的候选清单。实体类对应问题域中的\"事物\"，边界类对应用例中参与者与系统的交互点，控制类封装用例的事件流。"
    },
    {
      "id": "unit16-26",
      "type": "section",
      "title": "案例：代码审查抓住的经典缺陷（要点）",
      "body": "<ul><li>一次订单系统的促销活动规则是\"单笔订单满 100 元免运费\"，实现时条件却写成了：</li></ul>",
      "narration": "本页要点：一次订单系统的促销活动规则是\"单笔订单满 100 元免运费\"，实现时条件却写成了：。"
    },
    {
      "id": "unit16-27",
      "type": "section",
      "title": "案例：代码审查抓住的经典缺陷（提示词）",
      "body": "<pre class=\"prompt\"><code>if (total &lt; 100) { chargeShipping(); }   // 缺陷：恰好 100 元的订单被收运费</code></pre>\n<ul><li>正确应为 <code>total &lt;= 100</code>。</li><li>这一字之差意味着，恰好落在 100 元档位的订单会被错误收取运费，若上线将引发成批客诉与赔付。</li><li>代码审查时，同事一句\"100 元整的订单呢？</li></ul>",
      "narration": "这是一个可直接套用的提示词模板。要点：正确应为 total <= 100 。 这一字之差意味着，恰好落在 100 元档位的订单会被错误收取运费，若上线将引发成批客诉与赔付。 代码审查时，同事一句\"100 元整的订单呢？。"
    },
    {
      "id": "unit16-28",
      "type": "section",
      "title": "案例：代码审查抓住的经典缺陷（要点 2）",
      "body": "<ul><li><strong>数组越界</strong>：循环 <code>i &lt; n</code> 写成 <code>i &lt;= n</code>，或下标从 1 而非 0 开始；</li><li><strong>空指针</strong>：解引用前未判断对象可能为 null，异常输入下崩溃；</li><li><strong>资源泄漏</strong>：异常路径漏释放内存、连接或文件句柄；</li></ul>",
      "narration": "本页要点：数组越界 ：循环 i < n 写成 i <= n ，或下标从 1 而非 0 开始； 空指针 ：解引用前未判断对象可能为 null，异常输入下崩溃； 资源泄漏 ：异常路径漏释放内存、连接或文件句柄；。"
    },
    {
      "id": "unit16-29",
      "type": "section",
      "title": "案例：代码审查抓住的经典缺陷（要点 3）",
      "body": "<ul><li><strong>语义偏差</strong>：逻辑与需求表述不一致，代码\"能跑\"但\"不对\"。</li></ul>",
      "narration": "本页要点：语义偏差 ：逻辑与需求表述不一致，代码\"能跑\"但\"不对\"。。"
    },
    {
      "id": "unit16-30",
      "type": "section",
      "title": "案例：代码审查抓住的经典缺陷（要点 4）",
      "body": "<ul><li>审查把\"作者自证正确\"换成\"他人质疑正确\"，一次往往能发现 3–5 处测试未必覆盖的边界缺陷。正是这双\"第二双眼睛\"，让许多事故止步于合入之前。</li></ul>",
      "narration": "本页要点：审查把\"作者自证正确\"换成\"他人质疑正确\"，一次往往能发现 3–5 处测试未必覆盖的边界缺陷。正是这双\"第二双眼睛\"，让许多事故止步于合入之前。。"
    },
    {
      "id": "unit16-31",
      "type": "section",
      "title": "样例：注释与文档的规范写法（概述）",
      "body": "<p class=\"lead\">注释是写给下一个维护者看的，而不是写给编译器。规范写法的第一原则是：<strong>注释解释\"为什么\"，而非复述\"是什么\"</strong>。</p>",
      "narration": "从一段典型的需求描述到初步类图，可走\"读需求、找名词、定类、画关联\"四步。先通读全文圈出名词——读者、借书证、图书、索书号、还书日期、滞纳金；再区分类、属性与同义词，读者、图书是类；于是得到以借阅记录为中心的初步类图，已具备类、属性与关联这些关键要素，补充需求在后续迭代中逐步加入。"
    },
    {
      "id": "unit16-32",
      "type": "section",
      "title": "样例：注释与文档的规范写法（要点）",
      "body": "<ul><li>复述代码的注释只是噪音，解释取舍、约束与历史原因的注释才传递知识。</li><li>先看差的写法：</li></ul>",
      "narration": "本页要点：复述代码的注释只是噪音，解释取舍、约束与历史原因的注释才传递知识。 先看差的写法：。"
    },
    {
      "id": "unit16-33",
      "type": "section",
      "title": "样例：注释与文档的规范写法（提示词）",
      "body": "<pre class=\"prompt\"><code>double total = 0;\nfor (Item it : items) {\ntotal += it.price * it.count;   // 累加价格\n}</code></pre>\n<ul><li>再看好的写法——同样的功能，把\"为什么\"写清楚：</li></ul>\n<pre class=\"prompt\"><code>/**\n* 判断订单是否满足发货条件。\n* 前置条件：order 非空且状态已锁定。\n* 后置条件：不修改订单状态。\n*/\nboolean canShip(Order order) {\n// 为什么只判库存：运费、地址等校验已在更早的下单环节完成\n// 为什么用 &gt; 而非 &gt;=：库存恰好为 0 时无货可发\nreturn order.stock &gt; 0;\n}</code></pre>",
      "narration": "这是一个可直接套用的提示词模板。要点：再看好的写法——同样的功能，把\"为什么\"写清楚：。"
    },
    {
      "id": "unit16-34",
      "type": "section",
      "title": "样例：注释与文档的规范写法（要点 2）",
      "body": "<ul><li>规范注释通常分三类：</li></ul>",
      "narration": "本页要点：规范注释通常分三类：。"
    },
    {
      "id": "unit16-35",
      "type": "section",
      "title": "样例：注释与文档的规范写法（表格）",
      "body": "<table><thead><tr><th>注释类型</th><th>位置</th><th>内容</th></tr></thead><tbody><tr><td>头注释</td><td>类或模块开头</td><td>职责、使用方式、维护约定</td></tr><tr><td>接口注释</td><td>函数声明上方</td><td>意图、前置/后置条件、参数含义</td></tr><tr><td>关键逻辑注释</td><td>算法或取舍处</td><td>解释\"为什么这样写\"及历史原因</td></tr></tbody></table>",
      "narration": "请看这张表，它概括了本节的关键信息。"
    },
    {
      "id": "unit16-36",
      "type": "section",
      "title": "样例：注释与文档的规范写法（要点 3）",
      "body": "<ul><li>头注释让读者不读实现即知职责，接口注释让调用者不读实现即会用，关键逻辑注释保护那些\"代码读不出来\"的决策。</li><li>而<strong>与代码不一致的注释比没有注释更有害</strong>——它会把维护者引向错误的方向。</li></ul>",
      "narration": "本页要点：头注释让读者不读实现即知职责，接口注释让调用者不读实现即会用，关键逻辑注释保护那些\"代码读不出来\"的决策。 而 与代码不一致的注释比没有注释更有害 ——它会把维护者引向错误的方向。。"
    },
    {
      "id": "unit16-37",
      "type": "section",
      "title": "案例：一份可读的代码胜过十页文档（概述）",
      "body": "<p class=\"lead\">\"代码即文档\"（code as documentation）的含义是：可读的代码本身就是最可靠的文档——它时刻与实际行为一致，不需要维护，也<strong>不会过期</strong>。注释与文档都可能撒谎，代码不会。</p>",
      "narration": "LLM 分析助手的四类能力最终都汇交给分析人员决策，AI 压缩的是文本处理与候选枚举的成本，领域判断始终由分析人员作出。从需求文档到分析模型，典型工作流分五步：统一术语、生成数据字典草稿；识别候选类、按三类枚举并标注依据；分配职责、把事件流动作映射到候选类。把前几步落到提示词上，便是从需求文档到分析模型的模板。"
    },
    {
      "id": "unit16-38",
      "type": "section",
      "title": "案例：一份可读的代码胜过十页文档（要点）",
      "body": "<ul><li>一个典型的接手场景印证了这一点。</li></ul>",
      "narration": "本页要点：一个典型的接手场景印证了这一点。。"
    },
    {
      "id": "unit16-39",
      "type": "section",
      "title": "案例：一份可读的代码胜过十页文档（要点 2）",
      "body": "<ul><li>团队接手一个遗留系统，其中有两个规模相近的模块：模块 A 几乎没有注释，但命名清晰、结构简单，如 <code>invoiceDueDate</code>、<code>chargeLateFee()</code>，一眼能读出意图；</li><li>模块 B 注释满篇，命名却混乱，如 <code>a</code>、<code>tmp</code>、<code>doThing()</code>，且注释常与代码不符——代码已改而注释未改。</li><li>半年后，两组维护体验天差地别：</li></ul>",
      "narration": "本页要点：团队接手一个遗留系统，其中有两个规模相近的模块：模块 A 几乎没有注释，但命名清晰、结构简单，如 invoiceDueDate 、 chargeLateFee() ，一眼能读出意图； 模块 B 注释满篇，命名却混乱，如 a 、 tmp 、 doThing() ，且注释常与代码不符——代码已改而注释未改。 半年后，两组维护体验天差地别：。"
    },
    {
      "id": "unit16-40",
      "type": "section",
      "title": "案例：一份可读的代码胜过十页文档（表格）",
      "body": "<table><thead><tr><th>模块</th><th>特点</th><th>维护体验</th></tr></thead><tbody><tr><td>A</td><td>无注释，命名清晰</td><td>读代码即理解意图，改动无需担心旁支</td></tr><tr><td>B</td><td>注释满篇，命名混乱</td><td>每次改动都要通读上下文猜测意图</td></tr></tbody></table>",
      "narration": "请看这张表，它概括了本节的关键信息。"
    },
    {
      "id": "unit16-41",
      "type": "section",
      "title": "案例：一份可读的代码胜过十页文档（要点 3）",
      "body": "<ul><li>对模块 B 的一次需求变更，团队排查了两天才敢动手，最后靠重读旧代码并补写单元测试验证；</li><li>而模块 A 的同类变更当天完成。</li><li>这正说明<strong>命名与结构承担\"是什么\"，注释只负责解释\"为什么\"</strong>——与其堆十页文档，不如让每一行代码都被人一眼读懂。</li></ul>",
      "narration": "本页要点：对模块 B 的一次需求变更，团队排查了两天才敢动手，最后靠重读旧代码并补写单元测试验证； 而模块 A 的同类变更当天完成。 这正说明 命名与结构承担\"是什么\"，注释只负责解释\"为什么\" ——与其堆十页文档，不如让每一行代码都被人一眼读懂。。"
    },
    {
      "id": "unit16-end",
      "type": "section",
      "title": "本节小结",
      "body": "<ul><li>软件编码的工作</li><li>编码规范</li><li>代码检查与审查</li><li>样例：命名从糟糕到良好</li><li>案例：代码审查抓住的经典缺陷</li><li>样例：注释与文档的规范写法</li><li>案例：一份可读的代码胜过十页文档</li></ul>",
      "narration": "本节主要内容就介绍到这里，我们依次学习了：软件编码的工作、编码规范、代码检查与审查、样例：命名从糟糕到良好、案例：代码审查抓住的经典缺陷、样例：注释与文档的规范写法、案例：一份可读的代码胜过十页文档。"
    }
  ]
};
