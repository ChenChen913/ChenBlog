![img](https://zcnvxfsiud9i.feishu.cn/space/api/box/stream/download/asynccode/?code=ZjFmODE1Yzk1ZTc0MGEwZTg0NzA1Yjg1YTg5MWFiMDFfdGZ1d3c0ZG05QzlzUHVHM096Q3U0ZEtkaVZoakV2eU9fVG9rZW46UTJVbGJsTm5rbzkzN0d4SWlReWN3SVhVbmZjXzE3NzAwOTUxNzQ6MTc3MDA5ODc3NF9WNA)

最近我在考虑如何更有效地和 AI 沟通，虽然不是什么很新颖的话题，但是我一直觉得这是一个很值得重视的问题，比如在问 AI 提问时，你是不是也是简单的提问一句？当你遇到你不了解的领域时，你是不是连提问题都不会提？······

今天我们就一起探讨一下，如何把问 AI 的问题详细化、具体化？如何把 AI 要执行的任务揉碎了、拆解开？

说明：

1、**写 Part1 的时候我就在想：****这和很多 AI 中引入的深度思考、研究模式和 Plan 模式挺像的****，所以 Part1 是底层方法论，Part2 是工具化实践，如果你想快速上手工具，可以先看 Part2， 但建议回来补 Part1，理解原理后用得更灵活；**

2、AI 中的研究模式和 Plan 模式未必就能得到很好的结果，所以阅读一下 Part 1 可能会打开你解决问题的思路；

3、为了让你得到更好的阅读体验，相当排版的文章可以查看飞书连接：

[好的开始是成功的一半！在干活儿之前我把 AI 当成了我的秘书和顾问（从 Prompt 过渡到 Skills ）](https://zcnvxfsiud9i.feishu.cn/docx/LveddpW4BoNDtexPU5BcBZzcnwb?from=from_copylink)

4、文章涉及 ClaudeCode，以 CC 代替

**导读：**

Part 1、从写好提示词出发（Prompt 工程 - 授人以鱼）

Part 2、从构建好 Skills 出发（Skills 工程 - 授人以渔）

# Part 1 从写好提示词出发（Prompt 工程 - 授人以鱼）

**最初的构想**：在问 AI 问题时，最好是先让它去网上调研一下，然后根据调研的结果写一份报告，再根据这份报告和我对问题进行反复的讨论，然后确定好任务的整体框架和方向

![img](https://zcnvxfsiud9i.feishu.cn/space/api/box/stream/download/asynccode/?code=ZWE5MjNlZmU1NGQ5MWQzZTY1YzE3ODJiYzU5YjE0OGVfZURINXpraUVqSEF4cVFFVkpzejUwRnYzTzFLblFZaGpfVG9rZW46QnpSR2JrSjhMb1ZPaVl4UFdaNGNuV0cybjFkXzE3NzAwOTUxNzQ6MTc3MDA5ODc3NF9WNA)

当我把我些想法告诉 Gemini、Claude 和 ChatGPT 后，它们抛给我了一份更详细的“沟通战术”，甚至还给我抛出了一些专有名词，说我的构想就是 RAG 和 CoT 的实战操作。

小知识：

RAG（Retrieval-Augmented Generation， 检索增强生成）：先去查资料，再回答问题

CoT（Chain of Thought， 思维链）：让 AI 展示推理过程，而不是直接给答案

这方面我先不深入研究，它说的这两个名词其实是 AI 界早就刮过去的风，说白了，我提出的最初构想只是说要“更仔细、更全面的分析问题”，所以我把它们的观点整合了一下：

> 当然，我的想法是越详细越好，下面的策略只是给你提供一些思路，遇到问题还是要具体情况具体分析，对于有些简单问题而言这套策略还是太啰嗦了

## 1.1  让 AI 调研的同时，还要设定“角色”与“目标”

- **具体做法：**
  - **赋予身份：** “你现在是[XX 领域的资深专家/麦肯锡咨询顾问/高级产品经理]，请以这个身份进行调研。”
  - **明确受众：** “这份报告是写给我看的，我是一个[初学者/资深从业者]，请略过基础概念，重点关注[趋势/实操案例/潜在风险]。”
  - **明确目标**：做决策、学习知识、寻找灵感、验证假设等
  - **网站建议**：www.perplexity.ai、https://github.com/
- **示例：**

```Markdown
【角色设定】
你现在是 [具体角色 + 经验背景]。

【受众定位】
这份报告是写给 [我的身份 + 知识水平 + 决策约束] 的。

【调研目标】
我需要 [做决策/学习/寻找灵感/验证假设]，具体问题是：
[一句话核心问题]

【调研要求】
1. 信息时效：优先 [最近 3 个月 / 2024-2025 / 经典案例]
2. 信息来源：必须包含 [官方文档 / 学术论文 / 实战案例]
3. 信息密度：我需要 [概述级别 / 可直接执行的细节]
4. 特别关注：[成本 / 风险 / 时间 / 技术难度 / ...]

【调研范围限制】
- 不要关注：[明确排除的内容]
- 必须覆盖：[强制要求的维度]

【输出格式】
最终报告请使用 [Markdown 表格 / Mermaid 图 / SWOT 分析] 呈现。
（无论什么主题，调研报告必须包含：执行摘要、事实发现、分析与推论、待验证假设、信息缺口、结构化对比和信息来源）

【推荐工具】
请优先使用 www.perplexity.ai 进行调研，因为它擅长实时信息检索。
```

- **更省时省力的做法**：
  - **直接使用元提示词**：即：把上述示例提示词扔给 AI，提出你的问题，让 AI 按照这个格式给出一个最初的提示词，然后再把提示词喂给 AI

## 1.2 与 AI 进行反复的商讨，并引入“批判性思维” 

- **具体做法：**
  - 基于上述的调研结果，通过和 AI 反复对话，确定你想要的框架和方向
  - 假设-->反驳-->修正：让 AI 扮演**反对者**。在确定框架时，提出你对整个问题的假设，再专门要求 AI 指出计划中的漏洞、逻辑矛盾或不可落地的点，然后再修正，反复循环，直至出现满意的答案为止。
- **示例：**

>  “基于刚才生成的调研报告和你提出的初步框架，请你现在以此为靶子，列出这个计划最容易失败的 3 个原因，或者指出我逻辑中最大的漏洞是什么？不要恭维我，请犀利一点。”

## 1.3 分阶段输出，使用“结构化约束” 

“商量”的过程很容易变成聊天，信息密度会随着对话变长而稀释。你需要强制 AI 用结构化的方式来总结每一阶段的成果。

- **具体做法：**
  - **强制格式：** 要求 AI 用 Markdown 表格、思维导图格式（Mermaid 代码）、或者 SWOT 分析法来呈现结果。
  - **分步确认：** 也就是**检查点机制**。不要让它一次性把整个大计划写完，而是说“我们先确定第一阶段，确认无误后，你再写第二阶段”。
- **示例 1：**

>  “我们刚才聊了很多。现在请把我们确定的框架整理成一个 Markdown 表格。
>
> 列分别为：【阶段】、【关键动作】、【所需资源】、【潜在风险】。
>
> **请不要输出任何解释性的废话，直接给我表格。**”

- **示例 2：**

```Markdown
❌ 错误示范： "帮我分析技术方案、设计 UI、写项目计划、评估风险" 

✅ 正确示范： "我们先只讨论技术方案。确定后，我会说'进入下一阶段'， 再讨论 UI 设计。现在请只回答：在 React 和 Vue 之间， 哪个更适合我们的场景？给出 3 个决策性理由。"
```

## 1.4  结束前：让 AI 反向生成“通用指令” 

这是最高阶的一招。当你和 AI 聊完，调研也做了，框架也定了，不仅要拿结果，还要把这个过程“固化”下来，方便以后复用或让其他 AI 执行。（尤其是后面使用 Skills 的时候用！) 

- **具体做法：**
  - 让 AI 总结你们的对话，把你脑子里的意图通过 AI 的理解，翻译成一条**完美的 Prompt**。
- **示例 1：**

> “我们已经完成了这个计划的制定。现在，请你回顾我们所有的对话历史，**帮我写一条最精准的提示词（Prompt）。**

> 假设我明天要让另一个 AI 直接帮我执行这个计划，我该把什么指令发给它，才能让它完全理解我们今天的结论并开始工作？”

- **示例 2：**

```Markdown
我们已经完成了 [主题] 的讨论。现在请你执行最后一步：

【任务】
回顾我们所有的对话历史，帮我生成一条**完美的提示词（Prompt）**。

【要求】
1. 假设我明天要让另一个 AI（或者 3 个月后的你）直接执行这个任务
2. 这条提示词应该包含：
   - 角色设定（AI 应该扮演谁）
   - 背景信息（项目情况、约束条件）
   - 我们已确定的决策（避免 AI 重新讨论已解决的问题）
   - 具体任务目标（要输出什么）
   - 输出格式要求（表格/图表/代码）
   - 质量标准（如何判断完成得好不好）

3. 这条提示词应该让 AI 能够"一次性"生成 80% 可用的结果，
   而不是需要 10 轮对话才能得到答案。
```

当然了，如果对最后的提示词不满意可以再和 AI 进行多次迭代。

当我发现每次做重要事情时，都要重复写一大坨 prompt、反复调、反复修，我开始意识到一个问题：

**也许问题不在于 Prompt 写得不够好，而在于 Prompt 能不能变成可复用的模块，所以就有了 Part 2 中的 Skills 概念**

# Part 2 从构建好 Skills 出发（Skills 工程 - 授人以渔）

## 2.1 为什么要 Skills

**Prompt 的局限**

\1. Prompt 太长，无法复用，每次问 AI 都要使用长提示词，甚至需要现场构思提示词的内容；

\2. 无法版本管理，当提示词中有些细节需要修改时，需要人工对 Skill 进行修改。

**Skills 的优势**  

\1. 一次编写，多次使用，每次只需提出自己的需求，AI 就会自动调用相应的 Skill； 

\2. 可迭代优化，可团队共享；

\3. 可以把大量重复性或者相似性的工作抽象化、流程化a

**Skills 是什么？**

是 AI 每次执行任务必读的 **SOP（标准流程）**，也是实现各种功能的**技能包**。

**Skills 的文件目录结构**

下面以操作 pdf 的 skill 为例，最重要的文件也是唯一必须存在的文件就是 SKILL.md，其他文件都是 SKILL.md 的附属资源

```Markdown
pdf-skill/
├── SKILL.md (main instructions)
├── FORMS.md (form-filling guide)
├── REFERENCE.md (detailed API reference)
└── scripts/
    └── fill_form.py (utility script)
```

**SKILL.md 文件的构成**

第一层：YAML 前置描述层，必须存在

第二层：markdown 描述层，说明 AI 需要执行的具体指令或操作

第三层：资源层，可以根据选择读取这一层指向的文件或资源

**Skill 的读取原理**

采用渐进式披露的加载原理，AI 按需加载，层层渐进，其中第一层的描述部分是每次执行任务前必须加载的部分，如果在执行任务时，遇到和描述部分相似的内容则直接加载第二层，否则不加载；当在第二层中遇到需要引用其他资源的情况，则运行或加载其他资源（也就是第三层），并将操作其他资源的结果返回给第二层，如果不需要引用其他资源，则不加载第三层

**Skill 深入生活日常**

其实 Skills 不仅仅是用来写代码，还可以用来做别的事情，具体的说就是 Skill 可以将每个人的生活和工作工程化和项目化，假如说你天天做 PPT 的话，我就可以单独建一个文件夹用来存放我的 PPT，然后可以用 ClaudeCode 定位到这个文件夹，让 CC 干预你的 PPT 制作流程，比如你可以将一些做 PPT 的固定流程打包成 Skill 存放到项目文件下，使用时间长了还可以不断的迭代修改这个 Skill······

以上关于 Skills 的讲解就是大体一说，具体请参考下面的文章：

1、ClaudeCode Skills 原理解读

2、显然，Gemini3 < （ ClaudeCode + Skills ）

3、Claude Skills 实践与体会

## 2.2 设计 Skills 体系

如果说之前用 Prompt 是人工进行生产操作，那么用 Skills 就是将之前的人工操作转化为工厂自动化流水线！

为了完善这个流水线，你得有厂房、生产设备、质检设备是吧，一个具备生产能力的流水线就是引入或者创建了各类 Skill，每一类 Skill 都有它独特的功能，比如在一个饮料生产线中，A Skill 会拧瓶盖，B Skill 会注入饮料，C Skill 会贴标签，在这之前使用 Prompt 就相当于人工进行拧瓶盖、注入饮料和贴标签，下面我们就搭建这个“流水线”

![img](https://zcnvxfsiud9i.feishu.cn/space/api/box/stream/download/asynccode/?code=MjA4YzEwNjJiMzM5ZmE1ZmMyZjFlOTZmZDdiMmExNmFfaTNvWEFFRVVxMDE1YjM1ZnJ5Sjlra1Z3elY3QzZkb1pfVG9rZW46V1l1Y2JDMmhzb25GT294SVBGdGN0RXpVbjVlXzE3NzAwOTUxNzQ6MTc3MDA5ODc3NF9WNA)

因为我的 CC 主要是由国产大模型驱动，我觉得无法达到特别好的效果，于是我选择了国内的 Trae 进行 Skill 的开发和使用

操作就是直接在文件目录下新建一个文件夹然后用 Trae 打开就行，然后注意：在 Trae 中配置 Skill，需要先将 Skill 打包成一个 zip 压缩包或者一个.skill 文件才能导入

![img](https://zcnvxfsiud9i.feishu.cn/space/api/box/stream/download/asynccode/?code=ZWRlYTI1ZjczMmYxYjI1MTBiNGEyYzc0Nzc1N2M5ODBfSFFrdVBEd24ySE82bXdjMHF3SXg1NjAyVHViR0V0VjlfVG9rZW46THlNZ2JGSko4b1RNdWN4M3RncmM5ZDFpbm5oXzE3NzAwOTUxNzQ6MTc3MDA5ODc3NF9WNA)

下面主要展示我在 Trae 中配置了哪些 Skills，你们可以参考一下

> 首先这个列表就是我让 AI 调用 local-skill-manager 自动生成的，其中会涉及以下几个 Skills 库：
>
> 1、Anthropic 官方 Skills 库：https://github.com/anthropics/skills
>
> 2、superpower 库：https://github.com/obra/superpowers
>
> 3、Anthropic 开源的 plugin 库：https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-simplifier
>
> 4、UI/UX 设计 Skill（ui-ux-pro-max-skill）：https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

### Skill 管理与元能力

*这一部分主要就是 Skills 的创建、审核、管理、完善等，就相当于 Skills 的管理系统*

- **local-skill-manager**: 本地 Skill 的查询、安装、删除管理。
- **skill-creator**: 创建全新的 Skill。
- **writing-skills**: 编写、编辑和验证 Skill 文档。
- **skill-auditor**: 审计 Skill 的质量、安全性和可用性。
- **skill-evolution-tracker**: 监控 Skill 运行状态并自动更新文档。
- **using-superpowers**: 基础能力，用于查找和正确调用其他 Skill。

> 说明：local-skill-manager 和 skill-evolution-tracker 是受数字生命卡兹克的启发，自己用 AI 生成的两个 Skills，然后 skill-creator 是来自官方的 Skill 库，skill-auditor 是我自己想创建的一个 Skill，其他来自 superpower 库
>
> 在使用 skill-auditor 审核 skill 时我会让它至少审核三遍

### 规划与决策 

*在执行任务之前需要进行各种计划，或者决定要调用哪些 Skills*

- **brainstorming**: 创造性工作前的头脑风暴和需求探索。
- **daily-decision-making**: 个人生活/职业决策辅助系统。
- **planning-with-files**: 针对复杂任务的文件化规划 （Manus-style）。
- **writing-plans**: 制定多步骤任务的技术规范或实施计划。
- **executing-plans**: 执行已制定的实施计划。

> 说明：都是来自 superpower 库

### 质量保证与调试

*确保代码质量，处理 Bug 和 Review*

- **systematic-debugging**: 系统性 Bug 排查和修复。
- **requesting-code-review**: 在合并前请求代码审查。
- **receiving-code-review**: 处理和验证他人的代码审查意见。
- **verification-before-completion**: 提交前的最终验证检查。

> 说明：都是来自 superpower 库

### 开发与编码 （Development & Coding）

*辅助代码编写、重构和版本控制工作流。*

- **simplifying-code**: 重构代码以提高可读性 （不改变行为）。
- **test-driven-development**: 辅助进行测试驱动开发 （TDD）。
- **using-git-worktrees**: 管理 Git worktrees 以隔离功能开发。
- **finishing-a-development-branch**: 辅助开发分支的收尾、合并和清理。
- **subagent-driven-development**: 驱动子 Agent 执行具体编码任务。

> 说明：simplifying-code 是根据那个插件（Anthropic 开源的 plugin 库里的 code-simplifier）让 AI 改成了 Skill，其他都是来自 superpower 库

### 实用工具与协作

*特定用途的工具和多 Agent 协作。*

- **dispatching-parallel-agents**: 调度多个 Agent 并行处理无依赖任务。

> 说明：来自 superpower 库

关于 Skills 的使用我有几点补充：

1、上面的 Skills 只是给每一个开发者大体列了个框架，还有很多其他的 Skills 值得你去探索，比如经常写前端还可以引入 Anthropic 官方 Skills 库中的 frontend-design，还有最近比较火的 ui-ux-pro-max

2、有时候 AI 可能不会触发相应的 Skills，也就是不会隐式调用，这时可以用自然语言显示调用，或者通过 AI 增强一下 Skills 的触发条件

3、注意安全！不要安装过多的 skills，按需安装！因为很多不明由来的 Skills 可能会有危险操作，这也是我创建 skill-auditor 的原因，每次安装或创建新的 Skill 时我都会使用 skill-auditor 进行多次的审核

## 2.3 设计 Skills 实例

### 城市风格图片提示词抽象成一个 Skill

> 这个想法是我看到视频号一个叫“玩学家”的博主介绍的，然后他是借鉴的 BerryXia.AI 神佬的提示词，我呢，再借鉴玩学家的思想，哈哈哈哈

在这篇图文中我用 AI 画了很多关于一个城市的不同风格的图片，每一张图片都是我从 X 上收集来的提示词，大概是 9 种风格，也就是 9 份高质量的提示词

我的目的就是提取这些提示词的优点、风格、布局和提示词的写法，然后抽象成一个 Skill，便于我后期生成更多城市和更多风格的图片提示词

我把这些提示词放到了一个叫"city prompt.txt"的文件中，放到 Trae 的项目目录下，然后就开始创建 Skill，我和 AI 这样说：

```Markdown
创建一个新的skill，因为它是一个生图类的skill。这个skill主要用来生成一些关于城市的图片，具体的细节也可以在目录下的参考文件夹中找到，有一个叫city prompt的文件，里面是生成各种类型的AI城市提示词，你把这些提示词抽象出来，创建一个新的城市类AI图片的skill
```

执行完一次任务后可以再将需求变得更详细：

```Markdown
关于刚才的设计方案和这个skill，你是否已经形成了一个多层的架构方案？比如，第一层是风格资源库，包含各种风格名称等；第二层是布局模板；第三层是智能推荐引擎，能根据我输入的内容自动推荐风格（包括具体的实现方案和伪代码等）。我想知道，你刚才做的这个skill，是否具备类似这样的多层架构？如果有，那很好。如果没有，就需要进行补充。现在我想更进一步，我的目标不仅仅是学会这些城市的提示词。我最终想要的是得到一个提示词，然后去找像Nano Banana Pro这样的顶级模型来生成图片。因为它不仅能理解语义，还具备世界知识，并且可以在图片上输出文字，所以功能非常强大。由于它具备这些能力，我所做的事情本质上就等于在用自然语言绘画。

但你也知道，刚才那个提示词能取得好效果，是因为它的自然语言非常专业，而我不具备这样的专业能力。在整个过程中，我可能只有一些基础能力：比如可以画一些格子，大致给出一个版式，但我没有设计能力。所以我在想，如果我说了一个内容，这个顶级模型能否告诉我它适合什么样的风格，并给我一些选项？但还有一个问题：这些选项不一定是最佳的。因为你知道，人类设计出来的东西肯定不是平均水平的，所以它需要基于常识，还要做一些微创新——不是随机扰动，而是仍然保持美观和商业感。这里需要注意的细节非常多。我希望的是，通过我能描述的那个颗粒度，把格局和内容表达出来。但我甚至不知道自己想要什么风格，可能也说不清楚。我只要给出这些有限且模糊的信息（我已经把最重要的文字信息发给你了），我期待的是你能通过一些比较美的元设计、元素，或者设计方法、排版格局，把它做成一种库。或者，没有库也行，就是大模型能即时生成这样的东西。然后，你会给我一个提示词。那个提示词长什么样呢？就是我刚才分析的那样，它是一个非常专业的提示词。我想要的就是这样一个东西。

好了，到此为止，你应该明白我在说什么了。根据我这一大段描述，请你审视现在已经成型的skill，看看它缺少什么，或者哪些地方还不完善，然后给它补上。或者，如果你之前做的skill有哪些不恰当的地方，也可以适当修改或补充。但是，我不希望每天生成的东西都一样，所以我需要和你确认一下：这个模板库大概能生成多少种风格？每一个类别、每一个模板大概能生成多少种风格的图片？如果只有几十种，那肯定不够，因为我可能一年365天每天都画，甚至每天不止生成一张图。
```

最后 Skill 创建完了之后再用审核类的 Skill 进行审核：

```Markdown
现在你需要用审核类的Skill对你刚才创建的Skill进行审核，至少审核三遍，每一遍审核后如果发现有什么不足的地方马上进行修改纠正补充和完善，注意一定是至少审核三遍！
```

Skill 的使用：

```Markdown
给我设计一个生图提示词，图片内容是漫画风格的青岛
```

你看！不再需要大量专业的提示词，我提出需求后，AI 默认调用刚创建的这个 Skill，给我了一份直接就可以用的提示词，当然可以让它改成中文的

```Markdown
/imagine prompt: 
[1. THE ARTISTIC STROKE]
A Vibrant Digital Illustration poster of Qingdao in the style of high-end Anime Background Art (Makoto Shinkai style).
The composition features a dynamic "Crashing Ocean Wave" shape sweeping diagonally across the canvas.
Inside this wave shape, we see a detailed miniature of the red "May Wind" sculpture, the historic Zhan Qiao Pier, and the twin spires of St. Michael's Cathedral.
Outside the wave, the canvas is clean White Matte Paper with generous negative space, dotted with subtle cherry blossom petals.

[2. TYPOGRAPHY SYSTEM]
- Main Title: "QINGDAO" in Bold Modern Sans-Serif.
- Subtitle: "The Sailing City" in elegant serif.
- Details: "36°04′N 120°23′E".

[3. COLOR & MOOD]
Dominant Tones: Azure Blue, Coral Red, Terracotta Orange.
Lighting: Clear Sunny Day with lens flares and high-contrast cloud shadows (Anime Sky).

[4. SPECS]
--ar 3:4 --v 6.0 --style raw --stylize 300 --niji 6
```

### 举一反三

不仅仅是城市图片， 我还去 X 上收集了一些关于物品介绍、日历打卡、简笔画等各类提示词，每一类提示词都可以抽象成一个 Skill

这只是 Skills 的冰山一角，不仅仅是生成图片，还可以用 Skill 做 PPT、写文章等，下期文章我将在 coze 中演示使用 Skill，这是一种更方便、无需配置在本地的 Skill 实现方案，敬请期待！