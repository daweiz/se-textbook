window.SLIDES = {
  "unit": 14,
  "slug": "unit-14",
  "title": "设计模式（上）：要素与分类",
  "module": "模块三　设计与实现",
  "moduleNum": 3,
  "minutes": 60,
  "qa": "",
  "chapters": [
    "第5章　软件设计与设计模式"
  ],
  "subtitle": "",
  "count": 41,
  "slides": [
    {
      "id": "unit14-cover",
      "type": "title",
      "title": "第14节　设计模式（上）：要素与分类",
      "body": "",
      "narration": ""
    },
    {
      "id": "unit14-1",
      "type": "section",
      "title": "模式的基本要素与价值（概述）",
      "body": "<p class=\"lead\">一个完整的设计模式包含四个要素：</p>",
      "narration": "模式的基本要素与价值。一个完整的设计模式包含四个要素："
    },
    {
      "id": "unit14-2",
      "type": "section",
      "title": "模式的基本要素与价值（要点）",
      "body": "<ul><li><strong>模式名称</strong>：一个助记名，便于交流与思考；</li><li><strong>问题</strong>：说明在何时使用模式，解释设计问题及其前因后果；</li><li><strong>解决方案</strong>：描述设计的组成部分、相互关系、各自职责与协作方式；</li></ul>",
      "narration": "本页要点：模式名称 ：一个助记名，便于交流与思考； 问题 ：说明在何时使用模式，解释设计问题及其前因后果； 解决方案 ：描述设计的组成部分、相互关系、各自职责与协作方式；。"
    },
    {
      "id": "unit14-3",
      "type": "section",
      "title": "模式的基本要素与价值（要点 2）",
      "body": "<ul><li><strong>效果</strong>：描述模式应用的效果与权衡。</li></ul>",
      "narration": "本页要点：效果 ：描述模式应用的效果与权衡。。"
    },
    {
      "id": "unit14-4",
      "type": "section",
      "title": "模式的基本要素与价值（要点 3）",
      "body": "<ul><li>设计模式的价值在于：使人们可以简便地复用已有的良好设计；</li><li>提供一套开发人员之间交流的语言；</li><li>提升看待问题的抽象程度；</li></ul>",
      "narration": "本页要点：设计模式的价值在于：使人们可以简便地复用已有的良好设计； 提供一套开发人员之间交流的语言； 提升看待问题的抽象程度；。"
    },
    {
      "id": "unit14-5",
      "type": "section",
      "title": "模式的基本要素与价值（表格）",
      "body": "<table><thead><tr><th>要素</th><th>说明</th></tr></thead><tbody><tr><td>模式名称</td><td>助记名，便于交流与思考</td></tr><tr><td>问题</td><td>何时使用，设计问题及其前因后果</td></tr><tr><td>解决方案</td><td>组成部分、相互关系、职责与协作</td></tr><tr><td>效果</td><td>应用效果与权衡</td></tr></tbody></table>",
      "narration": "请看这张表，它概括了本节的关键信息。"
    },
    {
      "id": "unit14-6",
      "type": "section",
      "title": "模式的基本要素与价值（要点 4）",
      "body": "<ul><li>模式的四要素构成完整的设计经验描述，如图所示。</li></ul>",
      "narration": "本页要点：模式的四要素构成完整的设计经验描述，如图所示。。"
    },
    {
      "id": "unit14-7",
      "type": "section",
      "title": "模式的基本要素与价值（图示）",
      "body": "<div class=\"img-single\"><img src=\"../src/chapter-05/images/0801-pattern-four.svg\" alt=\"\" style=\"width:85%\"></div>",
      "narration": "请看本页图示，帮助理解本节内容。"
    },
    {
      "id": "unit14-8",
      "type": "section",
      "title": "模式的基本要素与价值（要点 5）",
      "body": "<ul><li>四要素缺一不可：缺少\"问题\"与\"效果\"的模式只能看到结构，无法判断何时该用、用了得失如何。</li></ul>",
      "narration": "本页要点：四要素缺一不可：缺少\"问题\"与\"效果\"的模式只能看到结构，无法判断何时该用、用了得失如何。。"
    },
    {
      "id": "unit14-9",
      "type": "section",
      "title": "模式的分类（概述）",
      "body": "<p class=\"lead\">GoF 将 23 个模式分为三类：</p>",
      "narration": "模式的分类。GoF 将 23 个模式分为三类："
    },
    {
      "id": "unit14-10",
      "type": "section",
      "title": "模式的分类（要点）",
      "body": "<ul><li><strong>创建型模式</strong>解决对象实例化的问题，把\"创建什么\"与\"如何创建\"分离。</li><li>典型模式包括：<strong>单例</strong>（Singleton，保证一个类仅有一个实例并提供全局访问点）、<strong>工厂方法</strong>（Factory Method，由子类决定创建哪个产品）、<strong>抽象工厂</strong>（Abstract Factory，创建一族相关对象）、<strong>生成器</strong>（Builder，分步构造复杂对象）、<strong>原型</strong>（Prototype，通过克隆创建新对象）。</li></ul>",
      "narration": "本页要点：创建型模式 解决对象实例化的问题，把\"创建什么\"与\"如何创建\"分离。 典型模式包括： 单例 （Singleton，保证一个类仅有一个实例并提供全局访问点）、 工厂方法 （Factory Method，由子类决定创建哪个产品）、 抽象工厂 （Abstract Factory，创建一族相关对象）、 生成器 （Builder，分步构造复杂对象）、 原型 （Prototype，通过克隆创建新对象）。。"
    },
    {
      "id": "unit14-11",
      "type": "section",
      "title": "模式的分类（图示）",
      "body": "<div class=\"img-pair\"><img src=\"../src/chapter-05/images/singleton_implementation_-_uml_class_diagram.png\" alt=\"\" style=\"width:45%\"><img src=\"../src/chapter-05/images/factory-method-implementation-uml-class-diagram.png\" alt=\"\" style=\"width:45%\"></div>\n<div class=\"img-single\"><img src=\"../src/chapter-05/images/abstract-factory-pattern.png\" alt=\"\" style=\"width:45%\"></div>",
      "narration": "请看本页图示，帮助理解本节内容。"
    },
    {
      "id": "unit14-12",
      "type": "section",
      "title": "模式的分类（要点 2）",
      "body": "<ul><li><strong>结构型模式</strong>组织类与对象的结构，避免类被赋予过多职责而破坏封装。</li><li>典型模式包括：<strong>适配器</strong>（Adapter，转换接口使不兼容的类协同工作）、<strong>桥接</strong>（Bridge，将抽象与实现解耦）、<strong>组成</strong>（Composite，将对象组成树形整体—部分结构）、<strong>装饰</strong>（Decorator，动态为对象添加职责）、<strong>外观</strong>（Facade，为子系统提供统一入口）、<strong>享元</strong>（Flyweight，共享细粒度对象节省内存）、<strong>代理</strong>（Proxy，用替身控制对对象的访问）。</li></ul>",
      "narration": "本页要点：结构型模式 组织类与对象的结构，避免类被赋予过多职责而破坏封装。 典型模式包括： 适配器 （Adapter，转换接口使不兼容的类协同工作）、 桥接 （Bridge，将抽象与实现解耦）、 组成 （Composite，将对象组成树形整体—部分结构）、 装饰 （Decorator，动态为对象添加职责）、 外观 （Facade，为子系统提供统一入口）、 享元 （Flyweight，共享细粒度对象节省内存）、 代理 （Proxy，用替身控制对对象的访问）。。"
    },
    {
      "id": "unit14-13",
      "type": "section",
      "title": "模式的分类（图示 2）",
      "body": "<div class=\"img-single\"><img src=\"../src/chapter-05/images/composite-design-pattern-example-uml-class-diagram.png\" alt=\"\" style=\"width:45%\"></div>",
      "narration": "请看本页图示，帮助理解本节内容。"
    },
    {
      "id": "unit14-14",
      "type": "section",
      "title": "模式的分类（要点 3）",
      "body": "<ul><li><strong>行为模式</strong>分配对象职责、为对象间协作建模。典型模式包括：<strong>职责链</strong>（Chain of Responsibility，把请求沿处理链传递）、<strong>命令</strong>（Command，把请求封装为对象以支持撤销与排队）、<strong>解释器</strong>、<strong>迭代器</strong>、<strong>中介者</strong>（Mediator，集中协调对象间交互）、<strong>备忘录</strong>、<strong>观察者</strong>（Observer，定义一对多的依赖，状态变化时通知所有依赖者）、<strong>状态</strong>（State，状态改变时对象改变自身行为）、<strong>策略</strong>（Strategy，封装可互换的算法族）、<strong>模板方法</strong>（Template Method，父类定义算法骨架、子类填充细节）、<strong>访问者</strong>（Visitor，在不改动元素类的前提下为对象结构增加操作）。</li></ul>",
      "narration": "本页要点：行为模式 分配对象职责、为对象间协作建模。典型模式包括： 职责链 （Chain of Responsibility，把请求沿处理链传递）、 命令 （Command，把请求封装为对象以支持撤销与排队）、 解释器 、 迭代器 、 中介者 （Mediator，集中协调对象间交互）、 备忘录 、 观察者 （Observer，定义一对多的依赖，状态变化时通知所有依赖者）、 状态 （State，状态改变时对象改变自身行为）、 策略 （Strategy，封装可互换的算法族）、 模板方法 （Template Method，父类定义算法骨架、子类填充细节）、 访问者 （Visitor，在不改动元素类的前提下为对象结构增加操作）。。"
    },
    {
      "id": "unit14-15",
      "type": "section",
      "title": "模式的分类（图示 3）",
      "body": "<div class=\"img-pair\"><img src=\"../src/chapter-05/images/observer_implementation_-_uml_class_diagram.png\" alt=\"\" style=\"width:45%\"><img src=\"../src/chapter-05/images/strategy_implementation_-_uml_class_diagram.png\" alt=\"\" style=\"width:45%\"></div>",
      "narration": "请看本页图示，帮助理解本节内容。"
    },
    {
      "id": "unit14-16",
      "type": "section",
      "title": "模式的分类（要点 4）",
      "body": "<ul><li>以<strong>抽象工厂</strong>为例：它封装具体平台，使应用程序可以在不同平台上运行——用户只与抽象工厂及其产品接口打交道，更换平台只需替换具体工厂。</li><li>以<strong>观察者</strong>为例：新闻社（被观察者）发布新闻时，所有订阅者自动得到通知并更新，符合\"开放—封闭\"原则。</li><li>GoF 三类的模式清单与作用可归纳如下表所示。</li></ul>",
      "narration": "本页要点：以 抽象工厂 为例：它封装具体平台，使应用程序可以在不同平台上运行——用户只与抽象工厂及其产品接口打交道，更换平台只需替换具体工厂。 以 观察者 为例：新闻社（被观察者）发布新闻时，所有订阅者自动得到通知并更新，符合\"开放—封闭\"原则。 GoF 三类的模式清单与作用可归纳如下表所示。。"
    },
    {
      "id": "unit14-17",
      "type": "section",
      "title": "模式的分类（表格）",
      "body": "<table><thead><tr><th>类别</th><th>作用</th><th>代表模式</th></tr></thead><tbody><tr><td>创建型</td><td>解决对象实例化，分离\"创建什么\"与\"如何创建\"</td><td>单例、工厂方法、抽象工厂、生成器、原型</td></tr><tr><td>结构型</td><td>组织类与对象结构，避免职责过多</td><td>适配器、桥接、组成、装饰、外观、享元、代理</td></tr><tr><td>行为型</td><td>分配职责、为协作建模</td><td>策略、观察者、命令、状态、模板方法、访问者等</td></tr></tbody></table>",
      "narration": "请看这张表，它概括了本节的关键信息。"
    },
    {
      "id": "unit14-18",
      "type": "section",
      "title": "模式的分类（要点 5）",
      "body": "<ul><li>GoF 模式的三类划分与典型模式目录如图所示。</li></ul>",
      "narration": "本页要点：GoF 模式的三类划分与典型模式目录如图所示。。"
    },
    {
      "id": "unit14-19",
      "type": "section",
      "title": "模式的分类（图示 4）",
      "body": "<div class=\"img-single\"><img src=\"../src/chapter-05/images/0803-pattern-catalog.svg\" alt=\"\" style=\"width:75%\"></div>",
      "narration": "请看本页图示，帮助理解本节内容。"
    },
    {
      "id": "unit14-20",
      "type": "section",
      "title": "样例：策略模式的应用（概述）",
      "body": "<p class=\"lead\">订单折扣计算是<strong>策略模式</strong>（Strategy，封装可互换的算法族）的典型场景。假设一个电商系统按订单计算折扣：普通用户不打折、会员享 95 折、节假日全场 85 折。</p>",
      "narration": "样例：策略模式的应用。订单折扣计算是策略模式（Strategy，封装可互换的算法族）的典型场景。假设一个电商系统按订单计算折扣：普通用户不打折、会员享 95 折、节假日全场 85 折。"
    },
    {
      "id": "unit14-21",
      "type": "section",
      "title": "样例：策略模式的应用（要点）",
      "body": "<ul><li>若用 if-else 硬编码，每新增一种折扣都要改动计算逻辑本身，违背开闭原则；</li><li>把每种折扣封装成一个策略类、用统一接口替换分支，是教科书式的解法：</li></ul>",
      "narration": "本页要点：若用 if-else 硬编码，每新增一种折扣都要改动计算逻辑本身，违背开闭原则； 把每种折扣封装成一个策略类、用统一接口替换分支，是教科书式的解法：。"
    },
    {
      "id": "unit14-22",
      "type": "section",
      "title": "样例：策略模式的应用（提示词）",
      "body": "<pre class=\"prompt\"><code>interface Discount {\ndouble calc(double price);\n}\nclass NormalDiscount implements Discount {\npublic double calc(double price) { return price; }\n}\nclass MemberDiscount implements Discount {\npublic double calc(double price) { return price * 0.95; }\n}\nclass FestivalDiscount implements Discount {\npublic double calc(double price) { return price * 0.85; }\n}\nclass Order {\nprivate Discount discount = new NormalDiscount();\npublic void setDiscount(Discount d) { this.discount = d; }\npublic double total(double price) { return discount.calc(price); }\n}</code></pre>\n<ul><li>代码中的角色分工如下表所示。</li></ul>",
      "narration": "这是一个可直接套用的提示词模板。要点：代码中的角色分工如下表所示。。"
    },
    {
      "id": "unit14-23",
      "type": "section",
      "title": "样例：策略模式的应用（表格）",
      "body": "<table><thead><tr><th>角色</th><th>本例中的类</th><th>职责</th></tr></thead><tbody><tr><td>策略接口</td><td>Discount</td><td>定义算法统一入口</td></tr><tr><td>具体策略</td><td>Normal/Member/FestivalDiscount</td><td>实现各折扣算法</td></tr><tr><td>上下文</td><td>Order</td><td>持有策略并委托调用</td></tr></tbody></table>",
      "narration": "请看这张表，它概括了本节的关键信息。"
    },
    {
      "id": "unit14-24",
      "type": "section",
      "title": "样例：策略模式的应用（要点 2）",
      "body": "<ul><li>改动从\"改分支\"变成\"加类\"：新增折扣只须写一个新策略类并注入订单，原有代码一字不动，这就是<strong>开闭原则</strong>的直接体现。</li></ul>",
      "narration": "本页要点：改动从\"改分支\"变成\"加类\"：新增折扣只须写一个新策略类并注入订单，原有代码一字不动，这就是 开闭原则 的直接体现。。"
    },
    {
      "id": "unit14-25",
      "type": "section",
      "title": "样例：观察者模式的应用（概述）",
      "body": "<p class=\"lead\">天气 App 的\"订阅推送\"是<strong>观察者模式</strong>（Observer，定义一对多的依赖，状态变化时通知所有依赖者）的典型场景。气象站测得新数据后，手机通知、首页卡片、地图图层等多个界面都要同步更新，且新增界面不应改动气象站。</p>",
      "narration": "样例：观察者模式的应用。天气 App 的\"订阅推送\"是观察者模式（Observer，定义一对多的依赖，状态变化时通知所有依赖者）的典型场景。气象站测得新数据后，手机通知、首页卡片、地图图层等多个界面都要同步更新，且新增界面不应改动气象站。"
    },
    {
      "id": "unit14-26",
      "type": "section",
      "title": "样例：观察者模式的应用（要点）",
      "body": "<ul><li>把气象站作为主题、各界面作为观察者，即构成发布—订阅关系：</li></ul>",
      "narration": "本页要点：把气象站作为主题、各界面作为观察者，即构成发布—订阅关系：。"
    },
    {
      "id": "unit14-27",
      "type": "section",
      "title": "样例：观察者模式的应用（表格）",
      "body": "<table><thead><tr><th>角色</th><th>类</th><th>职责</th></tr></thead><tbody><tr><td>主题（被观察者）</td><td>WeatherStation</td><td>维护观察者列表，数据更新时逐一通知</td></tr><tr><td>观察者接口</td><td>Observer</td><td>定义 update 数据的统一入口</td></tr><tr><td>具体观察者</td><td>PushAlert、CardView、MapLayer</td><td>收到通知后各自刷新</td></tr></tbody></table>",
      "narration": "请看这张表，它概括了本节的关键信息。"
    },
    {
      "id": "unit14-28",
      "type": "section",
      "title": "样例：观察者模式的应用（要点 2）",
      "body": "<ul><li>运行流程是：</li></ul>",
      "narration": "本页要点：运行流程是：。"
    },
    {
      "id": "unit14-29",
      "type": "section",
      "title": "样例：观察者模式的应用（要点 3）",
      "body": "<ul><li>1. 界面启动时调用 subscribe 向气象站注册自己；</li><li>2. 气象站测得新数据，遍历观察者列表调用 update；</li><li>3. 各界面收到数据后自行刷新，气象站不关心界面的具体类型。</li></ul>",
      "narration": "本页要点：1. 界面启动时调用 subscribe 向气象站注册自己； 2. 气象站测得新数据，遍历观察者列表调用 update； 3. 各界面收到数据后自行刷新，气象站不关心界面的具体类型。。"
    },
    {
      "id": "unit14-30",
      "type": "section",
      "title": "样例：观察者模式的应用（要点 4）",
      "body": "<ul><li>新界面只需实现 Observer 接口并注册，无需改动气象站；</li><li>观察者之间也互不感知——这正是\"一对多\"协作的解耦方式。</li></ul>",
      "narration": "本页要点：新界面只需实现 Observer 接口并注册，无需改动气象站； 观察者之间也互不感知——这正是\"一对多\"协作的解耦方式。。"
    },
    {
      "id": "unit14-31",
      "type": "section",
      "title": "案例：模式滥用的反例（概述）",
      "body": "<p class=\"lead\">一个<strong>典型的反例</strong>是：为只有两三个类的简单逻辑，强行套上十几层模式。某团队曾为一个\"取文件路径并保存\"的小需求，引入抽象工厂创建路径、外观封装接口、装饰叠加缓存、代理拦截访问，还配了一套观察者做变更通知——实际上一个函数就能完成。</p>",
      "narration": "案例：模式滥用的反例。一个典型的反例是：为只有两三个类的简单逻辑，强行套上十几层模式。某团队曾为一个\"取文件路径并保存\"的小需求，引入抽象工厂创建路径、外观封装接口、装饰叠加缓存、代理拦截访问，还配了一套观察者做变更通知——实际上一个函数就能完成。"
    },
    {
      "id": "unit14-32",
      "type": "section",
      "title": "案例：模式滥用的反例（要点）",
      "body": "<ul><li>结果代码行数暴涨、调用链深不可测，新人读不懂，改一处要顺着多个间接层排查。</li><li>这样的设计\"模式齐全\"却毫无可维护性：问题不在模式本身，而在滥用。</li></ul>",
      "narration": "本页要点：结果代码行数暴涨、调用链深不可测，新人读不懂，改一处要顺着多个间接层排查。 这样的设计\"模式齐全\"却毫无可维护性：问题不在模式本身，而在滥用。。"
    },
    {
      "id": "unit14-33",
      "type": "section",
      "title": "案例：模式滥用的反例（要点 2）",
      "body": "<ul><li>对照下表可以看清\"该用\"与\"不该用\"的界限。</li></ul>",
      "narration": "本页要点：对照下表可以看清\"该用\"与\"不该用\"的界限。。"
    },
    {
      "id": "unit14-34",
      "type": "section",
      "title": "案例：模式滥用的反例（表格）",
      "body": "<table><thead><tr><th>情形</th><th>该用的地方</th><th>不该用的地方</th></tr></thead><tbody><tr><td>变化点</td><td>存在可独立、频繁且可预期的变化</td><td>结构固定，短期内不会变化</td></tr><tr><td>扩展方式</td><td>需求以新增种类、算法为主</td><td>以修改既有行为为主</td></tr><tr><td>复杂度</td><td>分支众多且纠缠，直写难维护</td><td>两三行分支即可直读直改</td></tr><tr><td>代价</td><td>间接层换来可扩展，收益明确</td><td>间接层徒增理解与调试成本</td></tr></tbody></table>",
      "narration": "请看这张表，它概括了本节的关键信息。"
    },
    {
      "id": "unit14-35",
      "type": "section",
      "title": "案例：模式滥用的反例（要点 3）",
      "body": "<ul><li>判断口诀很朴素：<strong>模式服务于变化点，不为用而用</strong>。</li><li>先写最简单满足需求的方案，变化真实到来且频率可预期时再引入模式，才是健康的演进路径。</li></ul>",
      "narration": "本页要点：判断口诀很朴素： 模式服务于变化点，不为用而用 。 先写最简单满足需求的方案，变化真实到来且频率可预期时再引入模式，才是健康的演进路径。。"
    },
    {
      "id": "unit14-36",
      "type": "section",
      "title": "故事：GoF 与《设计模式》（概述）",
      "body": "<p class=\"lead\">1994 年，Erich Gamma、Richard Helm、Ralph Johnson 与 John Vlissides 四位软件工程师合作出版了《设计模式》（Design Patterns: Elements of Reusable Object-Oriented Software，Addison-Wesley），后世称这四人为\"<strong>四人组</strong>\"（GoF）。这本书后来成为软件工程领域被引用最多的著作之一，也是\"模式运动\"的开端。</p>",
      "narration": "故事：GoF 与《设计模式》。1994 年，Erich Gamma、Richard Helm、Ralph Johnson 与 John Vlissides 四位软件工程师合作出版了《设计模式》（Design Patterns: Elements of Reusable Object Oriented Software，Addison Wesley），后世称这四人为\"四人组\"（GoF）。这本书后来成为软件工程领域被引用最多的著作之一，也是\"模式运动\"的开端。"
    },
    {
      "id": "unit14-37",
      "type": "section",
      "title": "故事：GoF 与《设计模式》（要点）",
      "body": "<ul><li><strong>由来</strong>：四人在面向对象程序设计大会 OOPSLA 上相识；Gamma 在博士阶段构建的 C++ 框架 ET++ 中积累了可复用结构，其余三人也各有研究，遂把这些反复出现的解法提炼为\"模式\"。</li><li><strong>思想源头</strong>：\"模式\"一词借鉴自建筑学家克里斯托弗·亚历山大，他把城市规划中反复成功的方案写成\"模式语言\"，GoF 把同样的思想引入软件设计。</li><li><strong>内容</strong>：全书收录 23 个模式，分创建型、结构型与行为型三类，按名称、问题、解决方案与效果四要素书写。</li></ul>",
      "narration": "本页要点：由来 ：四人在面向对象程序设计大会 OOPSLA 上相识；Gamma 在博士阶段构建的 C++ 框架 ET++ 中积累了可复用结构，其余三人也各有研究，遂把这些反复出现的解法提炼为\"模式\"。 思想源头 ：\"模式\"一词借鉴自建筑学家克里斯托弗·亚历山大，他把城市规划中反复成功的方案写成\"模式语言\"，GoF 把同样的思想引入软件设计。 内容 ：全书收录 23 个模式，分创建型、结构型与行为型三类，按名称、问题、解决方案与效果四要素书写。。"
    },
    {
      "id": "unit14-38",
      "type": "section",
      "title": "故事：GoF 与《设计模式》（要点 2）",
      "body": "<ul><li><strong>影响</strong>：\"设计复用\"思想随畅销迅速传播，催生了 PLoP 等模式会议，\"设计模式\"从此成为软件行业的通用词汇。</li></ul>",
      "narration": "本页要点：影响 ：\"设计复用\"思想随畅销迅速传播，催生了 PLoP 等模式会议，\"设计模式\"从此成为软件行业的通用词汇。。"
    },
    {
      "id": "unit14-39",
      "type": "section",
      "title": "故事：GoF 与《设计模式》（要点 3）",
      "body": "<ul><li>模式把\"好设计\"从大师经验变成可传递的公共知识。</li><li>今天人们谈论观察者、策略时，都在沿用这本书建立的坐标系。</li></ul>",
      "narration": "本页要点：模式把\"好设计\"从大师经验变成可传递的公共知识。 今天人们谈论观察者、策略时，都在沿用这本书建立的坐标系。。"
    },
    {
      "id": "unit14-end",
      "type": "section",
      "title": "本节小结",
      "body": "<ul><li>模式的基本要素与价值</li><li>模式的分类</li><li>样例：策略模式的应用</li><li>样例：观察者模式的应用</li><li>案例：模式滥用的反例</li><li>故事：GoF 与《设计模式》</li></ul>",
      "narration": "本节主要内容就介绍到这里，我们依次学习了：模式的基本要素与价值、模式的分类、样例：策略模式的应用、样例：观察者模式的应用、案例：模式滥用的反例、故事：GoF 与《设计模式》。"
    }
  ]
};
