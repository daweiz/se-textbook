// 由 slides/tools/generate.js 生成，旁白由 tools/apply-narration.js 合并
window.SLIDES = {
  "chapter": "chapter-08",
  "num": 8,
  "slug": "chapter-08",
  "title": "设计模式",
  "subtitle": "设计模式描述软件设计过程中常见问题的解决方案，是从大量成功实践中总结出来并被广泛公认的经验",
  "slides": [
    {
      "id": "chapter08-title",
      "type": "title",
      "title": "第8章　设计模式",
      "body": "",
      "narration": "欢迎学习《智能软件工程基础》第八章，设计模式。设计模式是从大量成功实践中总结出的常见问题解决方案。本章先讲模式的基本要素与分类，穿插策略、观察者的应用样例、模式滥用的反例与 GoF 的故事，再重点讨论设计模式与 AI 代码生成的关系。"
    },
    {
      "id": "chapter08-1",
      "type": "section",
      "title": "模式的基本要素与价值",
      "body": "<p class=\"lead\">一个完整的设计模式包含四个要素：</p>\n<ul><li><strong>模式名称</strong>：一个助记名，便于交流与思考；</li><li><strong>问题</strong>：说明在何时使用模式，解释设计问题及其前因后果；</li><li><strong>解决方案</strong>：描述设计的组成部分、相互关系、各自职责与协作方式；</li><li><strong>效果</strong>：描述模式应用的效果与权衡。</li></ul>\n<ul><li>设计模式的价值在于：使人们可以简便地复用已有的良好设计；</li><li>提供一套开发人员之间交流的语言；</li><li>提升看待问题的抽象程度；</li></ul>\n<table><thead><tr><th>要素</th><th>说明</th></tr></thead><tbody><tr><td>模式名称</td><td>助记名，便于交流与思考</td></tr><tr><td>问题</td><td>何时使用，设计问题及其前因后果</td></tr><tr><td>解决方案</td><td>组成部分、相互关系、职责与协作</td></tr><tr><td>效果</td><td>应用效果与权衡</td></tr></tbody></table>\n<ul><li>模式的四要素构成完整的设计经验描述，如图所示。</li></ul>",
      "narration": "一个完整的设计模式包含四个要素：模式名称便于交流思考，问题说明何时使用，解决方案描述组成与协作，效果说明应用的得失。其价值在于复用良好设计、提供交流语言、提升抽象程度。"
    },
    {
      "id": "chapter08-2",
      "type": "section",
      "title": "模式的基本要素与价值（续）",
      "body": "<div class=\"img-single\"><img src=\"../src/chapter-08/images/0801-pattern-four.svg\" alt=\"\" style=\"width:85%\"></div>\n<p class=\"lead\">四要素缺一不可：缺少\"问题\"与\"效果\"的模式只能看到结构，无法判断何时该用、用了得失如何。</p>",
      "narration": "这四个要素缺一不可。如果缺少问题与效果，模式就只能看到结构，无法判断何时该用、用了得失如何。所以，理解一个模式，一定要同时看到它的动机与代价。"
    },
    {
      "id": "chapter08-3",
      "type": "section",
      "title": "模式的分类",
      "body": "<p class=\"lead\">GoF 将 23 个模式分为三类：</p>\n<ul><li><strong>创建型模式</strong>解决对象实例化的问题，把\"创建什么\"与\"如何创建\"分离。</li><li>典型模式包括：<strong>单例</strong>（Singleton，保证一个类仅有一个实例并提供全局访问点）、<strong>工厂方法</strong>（Factory Method，由子类决定创建哪个产品）、<strong>抽象工厂</strong>（Abstract Factory，创建一族相关对象）、<strong>生成器</strong>（Builder，分步构造复杂对象）、<strong>原型</strong>（Prototype，通过克隆创建新对象）。</li></ul>\n<div class=\"img-pair\"><img src=\"../src/chapter-08/images/singleton_implementation_-_uml_class_diagram.png\" alt=\"\" style=\"width:45%\"><img src=\"../src/chapter-08/images/factory-method-implementation-uml-class-diagram.png\" alt=\"\" style=\"width:45%\"></div>\n<div class=\"img-single\"><img src=\"../src/chapter-08/images/abstract-factory-pattern.png\" alt=\"\" style=\"width:45%\"></div>\n<ul><li><strong>结构型模式</strong>组织类与对象的结构，避免类被赋予过多职责而破坏封装。</li><li>典型模式包括：<strong>适配器</strong>（Adapter，转换接口使不兼容的类协同工作）、<strong>桥接</strong>（Bridge，将抽象与实现解耦）、<strong>组成</strong>（Composite，将对象组成树形整体—部分结构）、<strong>装饰</strong>（Decorator，动态为对象添加职责）、<strong>外观</strong>（Facade，为子系统提供统一入口）、<strong>享元</strong>（Flyweight，共享细粒度对象节省内存）、<strong>代理</strong>（Proxy，用替身控制对对象的访问）。</li></ul>",
      "narration": "GoF 将二十三个经典模式分为三类。创建型模式解决对象实例化，把创建什么与如何创建分离，典型的有单例、工厂方法、抽象工厂、生成器和原型；结构型模式组织类与对象的结构，避免职责过多，典型的有适配器、桥接等。"
    },
    {
      "id": "chapter08-4",
      "type": "section",
      "title": "模式的分类（续）",
      "body": "<div class=\"img-single\"><img src=\"../src/chapter-08/images/composite-design-pattern-example-uml-class-diagram.png\" alt=\"\" style=\"width:45%\"></div>\n<p class=\"lead\"><strong>行为模式</strong>分配对象职责、为对象间协作建模。典型模式包括：<strong>职责链</strong>（Chain of Responsibility，把请求沿处理链传递）、<strong>命令</strong>（Command，把请求封装为对象以支持撤销与排队）、<strong>解释器</strong>、<strong>迭代器</strong>、<strong>中介者</strong>（Mediator，集中协调对象间交互）、<strong>备忘录</strong>、<strong>观察者</strong>（Observer，定义一对多的依赖，状态变化时通知所有依赖者）、<strong>状态</strong>（State，状态改变时对象改变自身行为）、<strong>策略</strong>（Strategy，封装可互换的算法族）、<strong>模板方法</strong>（Template Method，父类定义算法骨架、子类填充细节）、<strong>访问者</strong>（Visitor，在不改动元素类的前提下为对象结构增加操作）。</p>\n<div class=\"img-pair\"><img src=\"../src/chapter-08/images/observer_implementation_-_uml_class_diagram.png\" alt=\"\" style=\"width:45%\"><img src=\"../src/chapter-08/images/strategy_implementation_-_uml_class_diagram.png\" alt=\"\" style=\"width:45%\"></div>\n<ul><li>以<strong>抽象工厂</strong>为例：它封装具体平台，使应用程序可以在不同平台上运行——用户只与抽象工厂及其产品接口打交道，更换平台只需替换具体工厂。</li><li>以<strong>观察者</strong>为例：新闻社（被观察者）发布新闻时，所有订阅者自动得到通知并更新，符合\"开放—封闭\"原则。</li><li>GoF 三类的模式清单与作用可归纳如下表所示。</li></ul>",
      "narration": "第三类是行为模式，它分配对象职责、为对象间协作建模，典型的有职责链、命令、中介者、观察者、状态、策略、模板方法和访问者等。观察者定义一对多的依赖，状态变化时通知所有依赖者。"
    },
    {
      "id": "chapter08-5",
      "type": "section",
      "title": "模式的分类（续）",
      "body": "<table><thead><tr><th>类别</th><th>作用</th><th>代表模式</th></tr></thead><tbody><tr><td>创建型</td><td>解决对象实例化，分离\"创建什么\"与\"如何创建\"</td><td>单例、工厂方法、抽象工厂、生成器、原型</td></tr><tr><td>结构型</td><td>组织类与对象结构，避免职责过多</td><td>适配器、桥接、组成、装饰、外观、享元、代理</td></tr><tr><td>行为型</td><td>分配职责、为协作建模</td><td>策略、观察者、命令、状态、模板方法、访问者等</td></tr></tbody></table>\n<p class=\"lead\">GoF 模式的三类划分与典型模式目录如图所示。</p>\n<div class=\"img-single\"><img src=\"../src/chapter-08/images/0803-pattern-catalog.svg\" alt=\"\" style=\"width:75%\"></div>",
      "narration": "这张表归纳了三类模式的作用与代表模式：创建型分离创建什么与如何创建，结构型组织类与对象的结构，行为型分配职责、为协作建模。理解模式的分类，是学会选对模式的第一步。"
    },
    {
      "id": "chapter08-6",
      "type": "section",
      "title": "样例：策略模式的应用",
      "body": "<p class=\"lead\">订单折扣计算是<strong>策略模式</strong>（Strategy，封装可互换的算法族）的典型场景。假设一个电商系统按订单计算折扣：普通用户不打折、会员享 95 折、节假日全场 85 折。</p>\n<ul><li>若用 if-else 硬编码，每新增一种折扣都要改动计算逻辑本身，违背开闭原则；</li><li>把每种折扣封装成一个策略类、用统一接口替换分支，是教科书式的解法：</li></ul>\n<pre class=\"prompt\"><code>interface Discount {\n    double calc(double price);\n}\nclass NormalDiscount implements Discount {\n    public double calc(double price) { return price; }\n}\nclass MemberDiscount implements Discount {\n    public double calc(double price) { return price * 0.95; }\n}\nclass FestivalDiscount implements Discount {\n    public double calc(double price) { return price * 0.85; }\n}\nclass Order {\n    private Discount discount = new NormalDiscount();\n    public void setDiscount(Discount d) { this.discount = d; }\n    public double total(double price) { return discount.calc(price); }\n}</code></pre>\n<ul><li>代码中的角色分工如下表所示。</li></ul>\n<table><thead><tr><th>角色</th><th>本例中的类</th><th>职责</th></tr></thead><tbody><tr><td>策略接口</td><td>Discount</td><td>定义算法统一入口</td></tr><tr><td>具体策略</td><td>Normal/Member/FestivalDiscount</td><td>实现各折扣算法</td></tr><tr><td>上下文</td><td>Order</td><td>持有策略并委托调用</td></tr></tbody></table>",
      "narration": "先看一个策略模式的应用样例。电商系统按订单计算折扣：普通用户不打折、会员九五折、节假日八五折。若用 if-else 硬编码，每新增一种折扣都要改动计算逻辑本身，违背开闭原则。"
    },
    {
      "id": "chapter08-7",
      "type": "section",
      "title": "样例：策略模式的应用（续）",
      "body": "<p class=\"lead\">改动从\"改分支\"变成\"加类\"：新增折扣只须写一个新策略类并注入订单，原有代码一字不动，这就是<strong>开闭原则</strong>的直接体现。</p>",
      "narration": "教科书式的解法，是把每种折扣封装成一个策略类，用统一接口替换分支。改动就从改分支变成加类：新增折扣只须写一个新策略类并注入订单，原有代码一字不动，这正是开闭原则的直接体现。"
    },
    {
      "id": "chapter08-8",
      "type": "section",
      "title": "样例：观察者模式的应用",
      "body": "<p class=\"lead\">天气 App 的\"订阅推送\"是<strong>观察者模式</strong>（Observer，定义一对多的依赖，状态变化时通知所有依赖者）的典型场景。气象站测得新数据后，手机通知、首页卡片、地图图层等多个界面都要同步更新，且新增界面不应改动气象站。</p>\n<ul><li>把气象站作为主题、各界面作为观察者，即构成发布—订阅关系：</li></ul>\n<table><thead><tr><th>角色</th><th>类</th><th>职责</th></tr></thead><tbody><tr><td>主题（被观察者）</td><td>WeatherStation</td><td>维护观察者列表，数据更新时逐一通知</td></tr><tr><td>观察者接口</td><td>Observer</td><td>定义 update 数据的统一入口</td></tr><tr><td>具体观察者</td><td>PushAlert、CardView、MapLayer</td><td>收到通知后各自刷新</td></tr></tbody></table>\n<ul><li>运行流程是：</li></ul>\n<ul><li>1. 界面启动时调用 subscribe 向气象站注册自己；</li><li>2. 气象站测得新数据，遍历观察者列表调用 update；</li><li>3. 各界面收到数据后自行刷新，气象站不关心界面的具体类型。</li></ul>\n<ul><li>新界面只需实现 Observer 接口并注册，无需改动气象站；</li><li>观察者之间也互不感知——这正是\"一对多\"协作的解耦方式。</li></ul>",
      "narration": "再看观察者模式的应用。天气 App 里，气象站测得新数据后，手机通知、首页卡片、地图图层等界面都要同步更新，且新增界面不应改动气象站。把气象站作为主题、各界面作为观察者，就构成了发布—订阅关系。"
    },
    {
      "id": "chapter08-9",
      "type": "section",
      "title": "案例：模式滥用的反例",
      "body": "<p class=\"lead\">一个<strong>典型的反例</strong>是：为只有两三个类的简单逻辑，强行套上十几层模式。某团队曾为一个\"取文件路径并保存\"的小需求，引入抽象工厂创建路径、外观封装接口、装饰叠加缓存、代理拦截访问，还配了一套观察者做变更通知——实际上一个函数就能完成。</p>\n<ul><li>结果代码行数暴涨、调用链深不可测，新人读不懂，改一处要顺着多个间接层排查。</li><li>这样的设计\"模式齐全\"却毫无可维护性：问题不在模式本身，而在滥用。</li></ul>\n<ul><li>对照下表可以看清\"该用\"与\"不该用\"的界限。</li></ul>\n<table><thead><tr><th>情形</th><th>该用的地方</th><th>不该用的地方</th></tr></thead><tbody><tr><td>变化点</td><td>存在可独立、频繁且可预期的变化</td><td>结构固定，短期内不会变化</td></tr><tr><td>扩展方式</td><td>需求以新增种类、算法为主</td><td>以修改既有行为为主</td></tr><tr><td>复杂度</td><td>分支众多且纠缠，直写难维护</td><td>两三行分支即可直读直改</td></tr><tr><td>代价</td><td>间接层换来可扩展，收益明确</td><td>间接层徒增理解与调试成本</td></tr></tbody></table>\n<ul><li>判断口诀很朴素：<strong>模式服务于变化点，不为用而用</strong>。</li><li>先写最简单满足需求的方案，变化真实到来且频率可预期时再引入模式，才是健康的演进路径。</li></ul>",
      "narration": "再看一个反例。某团队为一个取文件路径并保存的小需求，强行引入抽象工厂、外观、装饰、代理和观察者，实际上一个函数就能完成。结果代码行数暴涨、调用链深不可测，模式齐全却毫无可维护性——问题不在模式本身，而在滥用。"
    },
    {
      "id": "chapter08-10",
      "type": "section",
      "title": "故事：GoF 与《设计模式》",
      "body": "<p class=\"lead\">1994 年，Erich Gamma、Richard Helm、Ralph Johnson 与 John Vlissides 四位软件工程师合作出版了《设计模式》（Design Patterns: Elements of Reusable Object-Oriented Software，Addison-Wesley），后世称这四人为\"<strong>四人组</strong>\"（GoF）。这本书后来成为软件工程领域被引用最多的著作之一，也是\"模式运动\"的开端。</p>\n<ul><li><strong>由来</strong>：四人在面向对象程序设计大会 OOPSLA 上相识；Gamma 在博士阶段构建的 C++ 框架 ET++ 中积累了可复用结构，其余三人也各有研究，遂把这些反复出现的解法提炼为\"模式\"。</li><li><strong>思想源头</strong>：\"模式\"一词借鉴自建筑学家克里斯托弗·亚历山大，他把城市规划中反复成功的方案写成\"模式语言\"，GoF 把同样的思想引入软件设计。</li><li><strong>内容</strong>：全书收录 23 个模式，分创建型、结构型与行为型三类，按名称、问题、解决方案与效果四要素书写。</li><li><strong>影响</strong>：\"设计复用\"思想随畅销迅速传播，催生了 PLoP 等模式会议，\"设计模式\"从此成为软件行业的通用词汇。</li></ul>\n<ul><li>模式把\"好设计\"从大师经验变成可传递的公共知识。</li><li>今天人们谈论观察者、策略时，都在沿用这本书建立的坐标系。</li></ul>",
      "narration": "讲一个故事。一九九四年，Gamma、Helm、Johnson 与 Vlissides 四位软件工程师出版了《设计模式》，后世称他们为四人组，也就是 GoF。这本书成为软件工程领域被引用最多的著作之一，也是模式运动的开端。"
    },
    {
      "id": "chapter08-11",
      "type": "section",
      "title": "模式与 AI 代码生成",
      "body": "<p class=\"lead\">设计模式是 AI 代码生成最擅长复用的知识之一。大语言模型在训练中接触了大量模式实例，能够：依据\"何时用何种模式\"的描述<strong>推荐</strong>合适的模式；</p>\n<ul><li>从类图或需求<strong>生成</strong>模式对应的代码骨架；</li><li>根据 SOLID 与 DRY 原则对已有代码<strong>提出</strong>重构建议；</li><li>在评审时<strong>识别</strong>模式滥用与过度设计。</li></ul>\n<ul><li>但模式的本质是权衡，AI 生成模式代码时往往会\"有得无失\"地套用，因此需要工程师把关：只有当下注目的可变化点对应模式的适用场景时，引入模式才有价值。</li><li>理解模式背后的动机与代价，是运用 AI 生成模式代码的前提。</li></ul>\n<ul><li>模式推荐的正确条件并非\"某个类需要解耦\"，而是\"存在一个可以独立变化、且变化频率可预期的点\"——变化点是引入模式的理由，没有变化点，模式就是负担。</li><li>AI 在推荐模式时应被要求说明\"它正在解决哪个变化点、带来了什么代价\"，而不是只输出\"建议使用观察者模式\"。</li><li>这种条件化的输出让工程师不必逐条推敲模型推荐的动机，可以直接基于变化点的真实性做出判断。</li></ul>\n<ul><li>防范过度设计需要双向的纪律：一方面要求 AI 在生成代码时<strong>优先给出最简单满足需求的方案</strong>，仅在指明变化点时引入模式；</li><li>另一方面在评审时让 AI 对照\"是否过度设计\"的检查清单（是否存在无使用者的抽象、是否可以用更简单的结构替代、模式是否增加了不必要的间接层）扫描代码。</li><li>模式是解决特定问题的良方，不是所有问题的答案——这一点对人与 AI 同样适用。</li></ul>\n<ul><li>是否引入设计模式的决策流程如图所示。</li></ul>\n<div class=\"img-single\"><img src=\"../src/chapter-08/images/0800-pattern-decision.svg\" alt=\"\" style=\"width:55%\"></div>",
      "narration": "设计模式是 AI 代码生成最擅长复用的知识之一。大语言模型能够推荐合适的模式、从类图或需求生成代码骨架、提出重构建议，并识别模式滥用。但模式的本质是权衡，关键在于是否存在可以独立变化、且变化频率可预期的变化点。"
    },
    {
      "id": "chapter08-12",
      "type": "section",
      "title": "模式与 AI 代码生成（续）",
      "body": "<p class=\"lead\">面对 23 个模式，过去工程师靠记忆与经验完成\"问题—模式\"的匹配；AI 辅助把这一步变成可复用的工作流，工程师的角色从\"背模式目录\"转向\"验证模式动机\"。</p>\n<ul><li>模式选择辅助可以归纳为四步工作流：</li></ul>\n<ul><li>1. <strong>描述问题与变化点</strong>：用自然语言说明\"哪个对象在什么情况下需要变化、变化频率如何、有哪些关注方\"，而不是直接说出模式名；</li><li>2. <strong>映射候选模式</strong>：让 AI 依据问题特征推荐候选模式，并要求说明\"该模式正在解决哪个变化点\"；</li><li>3. <strong>对照权衡</strong>：请 AI 给出候选模式的效果与代价对比表，标注\"何时不该用\"；</li></ul>\n<ul><li>大语言模型在训练语料中见过大量模式应用案例，能把\"对象创建方式可能变化\"\"一对多通知\"这类问题特征映射到相应模式，这是其推荐能力的来源；</li><li>但同一问题可以有多种措辞，措辞不同推荐可能不同，所以工作流第一步刻意用固定结构描述问题，降低推荐的偶然性。</li><li>常见的问题特征与候选模式类别的对应如下表所示。</li></ul>\n<table><thead><tr><th>问题特征</th><th>适用模式</th></tr></thead><tbody><tr><td>对象创建方式可能变化</td><td>创建型：工厂方法、抽象工厂、生成器</td></tr><tr><td>接口不兼容、需协同工作</td><td>适配器、外观</td></tr><tr><td>一对多状态变化、需同步通知</td><td>观察者</td></tr><tr><td>算法族可互换</td><td>策略</td></tr><tr><td>行为随内部状态变化</td><td>状态</td></tr><tr><td>职责可动态叠加</td><td>装饰</td></tr><tr><td>需在不动元素类时增加操作</td><td>访问者</td></tr></tbody></table>\n<ul><li>需要说明的是，上表是启发式的对应关系而非判定规则——同一问题特征可能对应多种模式，具体选择还取决于变化频率、代价承受与既有结构。</li><li>AI 的推荐价值在于缩小候选范围，最终取舍仍要回到变化点与权衡上。</li></ul>",
      "narration": "面对二十三个模式，过去工程师靠记忆与经验完成问题与模式的匹配，AI 辅助则把这一步变成可复用的工作流，工程师的角色从背模式目录转向验证模式动机。工作流包括描述问题与变化点、映射候选模式、对照权衡等步骤。"
    },
    {
      "id": "chapter08-13",
      "type": "section",
      "title": "模式与 AI 代码生成（续）",
      "body": "<p class=\"lead\">以报表导出为例：某模块需把多种导出格式（PDF、Excel、CSV）与报表逻辑分离，且格式会持续新增。按工作流第一步，工程师应写出\"导出格式会不断新增，需在不改报表逻辑的前提下扩展\"，AI 据此推荐策略模式；</p>\n<ul><li>若只写\"类之间耦合太高\"，模型就可能给出适配器、外观等若干不相关的候选。</li><li>输入描述越贴近变化点，推荐越收敛。</li></ul>\n<ul><li>AI 生成模式代码的质量门禁，可以概括为五道关卡，其中自动化检查与人工把关各司其职。</li></ul>\n<table><thead><tr><th>关卡</th><th>执行者</th><th>检查内容</th><th>通过标准</th></tr></thead><tbody><tr><td>静态检查</td><td>工具/CI</td><td>编译、lint、类型检查</td><td>无语法与低级错误</td></tr><tr><td>结构校验</td><td>AI + 工具</td><td>参与者、关系对照标准结构</td><td>角色与协作符合模式定义</td></tr><tr><td>语义保真</td><td>人工</td><td>变化点是否真实存在并被对应</td><td>模式动机与实现一致</td></tr><tr><td>单元测试</td><td>CI</td><td>行为正确、扩展性可验证</td><td>用例全部通过</td></tr><tr><td>人工评审</td><td>工程师</td><td>无用抽象、权衡与代价</td><td>无过度设计，理由可追溯</td></tr></tbody></table>\n<ul><li>五道关卡中，前两道可由工具与 AI 自动完成，后三道必须以人或测试把关：语义保真回答\"模式用对没有\"，单元测试回答\"行为正确没有\"，人工评审回答\"值得用没有\"。</li><li>把门禁写成项目约定，让 AI 在生成时就自报变化点与权衡，可显著减少评审阶段的返工。</li><li>把\"模式选择 + 质量门禁\"编码为提示词模板如下：</li></ul>",
      "narration": "以报表导出为例：导出格式会不断新增，须在不改报表逻辑的前提下扩展，AI 据此推荐策略模式；若只写类之间耦合太高，模型就可能给出不相关的候选。质量门禁则按静态检查、结构校验等关卡把关。"
    },
    {
      "id": "chapter08-14",
      "type": "section",
      "title": "模式与 AI 代码生成（续）",
      "body": "<pre class=\"prompt\"><code>你是资深软件工程师。请根据问题描述推荐设计模式并生成代码骨架：\n问题：&lt;描述对象、变化点与关注方，例如\"订单状态变化时，多个界面与通知\n需同步更新，且后续可能新增关注方\"&gt;\n要求：\n1. 先说明推荐哪个模式、该模式解决哪个变化点、带来什么代价；\n2. 仅当变化点真实存在时才引入模式，否则给出最简单的直写方案；\n3. 生成骨架代码，命名用驼峰式，注释说明各参与者职责；\n4. 最后给出 100 字以内的权衡说明，标注\"何时不该用此模式\"。</code></pre>\n<p class=\"lead\">质量门禁的落地依赖测试支撑——观察者、策略这类行为模式的验证需要单元测试构造关注方与变化场景，测试用例设计将在第 10 章详细展开；\"可编译不等于可维护\"的判断标准则已在第 9 章软件实现中讨论。</p>\n<ul><li>AI 生成模式代码进入基线前必须通过门禁，这条纪律与人工编写代码完全相同。</li></ul>\n<ul><li>模式与 AI 代码生成同样存在局限与失败模式，如下表所示。</li></ul>\n<table><thead><tr><th>失败模式</th><th>典型表现</th><th>应对</th></tr></thead><tbody><tr><td>结构套用</td><td>生成\"教科书结构\"却无对应变化点</td><td>先问变化点，再谈模式</td></tr><tr><td>变体误选</td><td>单例/工厂/生成器选错，引入不必要的全局状态</td><td>要求模型说明创建场景与变体差异</td></tr><tr><td>双标准代码</td><td>生成代码与既有风格、依赖不一致</td><td>提示词注入项目规范，必要时参考既有模式实例</td></tr><tr><td>单模式遗漏</td><td>真实系统需多模式组合，AI 只给单模式</td><td>要求列出候选组合与组合带来的约束</td></tr></tbody></table>",
      "narration": "工程上可以给出结构化的提示词：先说明推荐哪个模式、解决哪个变化点、带来什么代价；仅当变化点真实存在时才引入模式，否则给出最简单的直写方案。质量门禁的落地，依赖单元测试等测试支撑。"
    },
    {
      "id": "chapter08-15",
      "type": "section",
      "title": "模式与 AI 代码生成（续）",
      "body": "<p class=\"lead\">设计模式是详细设计层面的复用单位，与已在第 7 章讨论的体系结构风格互补——前者解决类级协作，后者解决系统级组织；本章聚焦模式与 AI 的组合应用。</p>",
      "narration": "设计模式是详细设计层面的复用单位，与第 7 章讨论的体系结构风格互补：前者解决类级协作，后者解决系统级组织。本章聚焦模式与 AI 的组合应用。"
    },
    {
      "id": "chapter08-16",
      "type": "section",
      "title": "AI 生成模式代码的实践",
      "body": "<p class=\"lead\">让 AI 可靠地生成模式代码，关键在于提示词中给出足够的结构信息。一个常用的做法是\"意图 + 变化点\"式描述：不仅告诉模型\"用观察者模式\"，还说明\"库存变化时多个界面需要同步更新，且后续可能新增关注方\"，模型据此生成的代码才能贴合并可维护。</p>\n<ul><li>若仅有模式名而无意图，模型往往套用教科书结构，产生大量无用抽象。</li></ul>\n<ul><li>工程上可以进一步把模式知识组织为可检索资源：团队把沉淀的模式实例、适用场景与权衡记录整理入库，通过检索增强生成（RAG）让模型基于团队自己的经验作答，而不是仅凭通用训练数据。</li><li>评审 AI 生成的模式代码时，建议对照以下清单：</li></ul>\n<ul><li>变化点是否真实存在且需要提前支持？</li><li>模式的参与者、关系是否符合其标准结构？</li><li>是否引入了无使用者的接口或抽象？</li><li>现有代码中是否存在可被该模式替代的重复结构？</li></ul>\n<ul><li>模式代码与普通代码一样，需要经过测试与评审才能进入基线。</li><li>评审 AI 生成的模式代码，可对照以下清单逐项检查。</li></ul>\n<table><thead><tr><th>评审问题</th><th>检查要点</th></tr></thead><tbody><tr><td>变化点是否真实存在？</td><td>是否确需提前支持变化</td></tr><tr><td>参与者是否符合标准结构？</td><td>模式的角色与关系是否正确</td></tr><tr><td>是否存在无用抽象？</td><td>无使用者的接口或抽象</td></tr><tr><td>是否可替代重复结构？</td><td>现有代码中可被该模式替代的部分</td></tr></tbody></table>",
      "narration": "让 AI 可靠地生成模式代码，关键在于提示词给出足够的结构信息，常用做法是意图加变化点式描述。仅有模式名而无意图，模型往往套用教科书结构，产生大量无用抽象。工程上还可把模式知识整理入库，用检索增强生成让 AI 基于团队经验作答。"
    },
    {
      "id": "chapter08-17",
      "type": "section",
      "title": "AI 生成模式代码的实践（续）",
      "body": "<p class=\"lead\">让 AI 生成模式代码并以评审清单把关的流程如图所示。</p>\n<div class=\"img-single\"><img src=\"../src/chapter-08/images/0802-pattern-prompt.svg\" alt=\"\" style=\"width:65%\"></div>\n<ul><li>\"意图+变化点\"式描述让模型生成贴合的代码，评审清单则防止模式被盲目套用。</li><li>对 AI 生成代码的评测、幻觉防范与责任归属，将在第 17 章系统讨论。</li></ul>\n<ul><li>一个完整的实例如下。</li><li>需求是：订单状态变化时，邮件、短信与日志三个关注方需要同步更新，且后续可能新增关注方（如推送、审计）。</li><li>工程师按\"意图 + 变化点\"的方式写下的提示词为：</li></ul>\n<pre class=\"prompt\"><code>订单状态变化时，邮件、短信与日志三个关注方需要同步更新，且后续可能新增关注方。\n请推荐模式并生成骨架代码：先说明推荐理由与变化点，再生成实现，最后给出权衡。</code></pre>",
      "narration": "这张图展示了让 AI 生成模式代码、并以评审清单把关的完整流程。一个完整实例如下：订单状态变化时，邮件、短信与日志三个关注方需要同步更新，且后续可能新增关注方，工程师据此写出意图加变化点的提示词。"
    },
    {
      "id": "chapter08-18",
      "type": "section",
      "title": "AI 生成模式代码的实践（续）",
      "body": "<p class=\"lead\">AI 推荐观察者模式，理由是\"关注方集合可以独立扩展\"，并生成了 <code>OrderObserver</code> 接口、<code>OrderService</code> 维护观察者列表、<code>changeState</code> 遍历通知的骨架代码。工程师对照评审清单评估发现：变化点真实存在、参与者符合观察者标准结构，但有两处契约细节缺失——其一，通知顺序未约定，多个关注方并发订阅时行为不确定；</p>\n<ul><li>其二，未处理\"观察者抛异常导致状态更新中断\"的异常路径。</li><li>工程师把这两点写入提示词（\"按订阅顺序通知、观察者异常隔离\"）后生成第二版，补齐了顺序通知与异常捕获，经单元测试（模拟新增关注方、注入异常）验证后进入基线。</li></ul>\n<ul><li>这个实例说明两点：AI 生成的第一版往往\"结构对而契约缺\"——模式骨架标准，但边界与异常路径这类非模式本身的细节仍需补全；</li><li>把\"意图 + 变化点\"与评审清单写进提示词，能显著提高首版质量。</li><li>与纯人工相比，效率提升集中在接口设计与样板代码，而\"模式动机的判断与权衡把关\"始终属于人——评审清单不是流程摆设，而是把人的经验外化，供 AI 生成、工程师审查共同使用。</li></ul>\n<h3>模式与 AI 的要点对照</h3>\n<ul><li>设计模式是 AI 代码生成最擅长复用的知识，也是过度设计的高发区。</li><li>模式的四要素——名称、问题、解决方案与效果——共同决定了模式的价值边界。</li><li>评审 AI 生成的模式代码，可对照以下清单。</li></ul>\n<table><thead><tr><th>评审检查项</th><th>说明</th></tr></thead><tbody><tr><td>变化点是否真实存在</td><td>是否存在可独立变化、且变化频率可预期的点</td></tr><tr><td>模式结构是否符合标准</td><td>参与者、关系与协作是否贴合标准结构</td></tr><tr><td>是否引入无用抽象</td><td>是否存在无使用者的接口或抽象类</td></tr><tr><td>是否有可替代的简单方案</td><td>能否用更简单的结构达成同样目的</td></tr><tr><td>是否说明权衡与代价</td><td>模式带来效果上的\"有得有失\"</td></tr></tbody></table>",
      "narration": "AI 推荐观察者模式，理由是关注方集合可以独立扩展，并生成了 OrderObserver 接口与遍历通知的骨架代码。对照评审清单发现，通知顺序与观察者抛异常两处契约细节缺失；写入提示词补齐后，经单元测试验证进入基线。"
    },
    {
      "id": "chapter08-19",
      "type": "section",
      "title": "AI 生成模式代码的实践（续）",
      "body": "<p class=\"lead\">设计模式的四要素结构如图所示。</p>\n<div class=\"img-single\"><img src=\"../src/chapter-08/images/0800-pattern-elements.svg\" alt=\"\" style=\"width:60%\"></div>\n<ul><li>对 AI 生成模式代码的评审应当双向进行：一方面要求 AI 优先给出最简单满足需求的方案、仅在指明变化点时引入模式；</li><li>另一方面让 AI 对照\"是否过度设计\"的检查清单扫描已有代码，把模式的应用建立在变化点真实性的判断之上。</li></ul>\n<h3>前沿演进：模式知识库与 AI 驱动的重构</h3>\n<ul><li>模式知识的前沿实践是把团队沉淀的模式实例、适用场景与权衡记录组织为<strong>可检索的知识库</strong>，通过 RAG 让 AI 基于团队自己的经验生成建议，而非仅凭通用训练数据。</li><li>同时，AI 驱动的重构（自动识别重复结构、坏味道，生成重构方案）把\"模式应用\"从人工判断推向自动化辅助；</li><li>架构重构（模块化拆分、依赖清理）也借助 AI 的全局分析能力。</li></ul>",
      "narration": "评审应当双向进行：一方面要求 AI 优先给出最简单方案，仅在指明变化点时引入模式；另一方面让 AI 对照是否过度设计的清单扫描代码。前沿演进上，模式知识库配合 AI 驱动的重构，把模式应用推向自动化辅助。"
    },
    {
      "id": "chapter08-20",
      "type": "section",
      "title": "AI 生成模式代码的实践（续）",
      "body": "<table><thead><tr><th>实践</th><th>做法</th><th>价值</th></tr></thead><tbody><tr><td>实例沉淀</td><td>记录成功/失败模式案例</td><td>经验可复用</td></tr><tr><td>知识入库</td><td>向量化并索引</td><td>支撑 RAG 检索</td></tr><tr><td>按需检索</td><td>生成时按变化点检索</td><td>建议贴合团队</td></tr><tr><td>反馈闭环</td><td>新案例回流入库</td><td>知识持续生长</td></tr></tbody></table>\n<p class=\"lead\">模式知识库的检索增强闭环——从沉淀到反馈——如图所示。</p>\n<div class=\"img-single\"><img src=\"../src/chapter-08/images/0800-pattern-rag-loop.svg\" alt=\"\" style=\"width:85%\"></div>\n<ul><li>模式知识库把\"经验\"变成组织资产：团队的每一次重构、每一个成功或失败的模式应用都沉淀为知识，AI 生成的建议因此越来越贴合项目实际——知识库的质量，取决于团队沉淀与校验的纪律。</li></ul>",
      "narration": "这张表展示了模式知识库的检索增强闭环：实例沉淀让经验可复用，知识入库支撑 RAG 检索，生成时按变化点检索让建议贴合团队，新案例回流入库让知识持续生长。知识库的质量，取决于团队沉淀与校验的纪律。"
    },
    {
      "id": "chapter08-21",
      "type": "section",
      "title": "本章小结",
      "body": "<p class=\"lead\">设计模式是从成功实践总结出的常见问题解决方案，四要素——名称、问题、解决方案与效果——决定其价值边界。模式与 AI 代码生成把模式复用推向自动化：AI 依据问题特征推荐模式、生成骨架代码，质量门禁（静态检查、结构校验、语义保真、单元测试、人工评审）防止\"符合标准结构却无使用价值\"的代码进入基线。</p>\n<ul><li>模式的本质是权衡，变化点真实性是引入模式的唯一理由，过度设计需要双向纪律约束。</li><li>人机分工上，AI 快速生成候选与结构检查，人负责变化点裁决与权衡把关；</li><li>验证优先、决策在人。</li></ul>\n<ul><li><strong>思考与讨论：</strong> 1. 为什么\"某个类需要解耦\"不足以成为引入模式的理由？</li><li>变化点指什么？</li><li>2. 请编写一条\"从问题描述推荐模式\"的提示词，并说明如何让它避免推荐过度设计。</li></ul>",
      "narration": "本章小结。设计模式四要素决定其价值边界，模式与 AI 代码生成把复用推向自动化，质量门禁防止只有结构、没有价值的代码进入基线。模式的本质是权衡，变化点真实性是引入模式的唯一理由；人机分工、验证优先，决策在人。"
    }
  ]
};
