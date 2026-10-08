---
title: "ClaudeCode Skills 原理解读"
title_en: "Understanding Claude Code Skills"
date: "2026-01-16"
category: "tech"
tags: ["Claude Code", "AI", "Agent Skills"]
---

主要是对 Anthropic 官方在 2025 年 10 月 16 日发布的 Agent Skill 文档的翻译和再解读

> ⚡ **导读**
>
> 1、什么是 Skills
>
> 2、Skills 原理解读
>
> 3、Skills 的使用指南
>
> 4、安全注意事项

## 1、什么是 Skills

它是由指令、脚本和资源组成的文件夹，Agent 可以动态发现并加载这些文件，从而更好地完成特定任务。

Skills 通过将专业知识打包成可组合的资源供 Claude 使用，扩展了 Claude 的功能，将通用代理转变为满足用户需求的专用代理。

为 Agent 构建 skill 就像为新员工编写入职指南。有了 skill 之后，无需再为每个任务构建零散的、定制化的 Agent，Claude 的 skill 允许你把自己的"操作经验"（流程化的东西）记录下来变成一个个小工具，然后你可以把这些小工具组合起来教给 AI，让它变成某个领域的专家。

下面是拥有 skill 的 Agent 架构

![拥有 skill 的 Agent 架构](/images/claude-code-skills/01.jpeg)

拥有 skill 的 Agent 架构

## 2、Skills 原理解读

### 2.1 渐进式披露（Progressive Disclosure）

实例：Claude 已经对 PDF 文件有一定的理解能力，但是 Claude 操作 PDF 的能力是很有限的，比如：填写表单

而针对 PDF 而生的 PDF skill 就赋予了 Claude 操作 PDF 的能力。

skill 就是一个包含 SKILL.md 文件的目录。

这个 SKILL.md 文件必须以 YAML 前置元数据开头，其中包含一些必需的元数据：name 和 description。

在 Claude 刚执行任务时，Agent 会将每个已安装 skill 的 name 和 description 预加载到其系统提示词中。

引入概念：渐进式披露，我的理解就是层层递进、按需读取！每一层信息的读取顺序是固定的，其实这和优先级有点像，每一个文件中优先级最高的信息被优先读取，尽管文件中不同层级信息的优先级不同，在实际执行任务时，所有层级的信息并不一定都会被读取，但是优先级最高的那层信息是一定会被读取的

YAML 元数据是渐进式披露的第一层信息：这也是 Claude 必须读取的一层信息，这层信息就是让 Claude 知道何时应该使用各项技能，从而无需将所有信息都加载到上下文中。

skill 的实际内容则是文件的第二层信息，如果 Claude 认为这个 skill 与当前任务相关，它会读取完整的 SKILL.md 文件，并将文件中第二层的信息加载到上下文中；反之，如果 Claude 认为这个 skill 与当前任务无关，就不会读取 SKILL.md 中的第二层信息

下面是一个简单的处理 PDF 的 SKILL.md 文件

![一个简单的处理 PDF 的 SKILL.md 文件](/images/claude-code-skills/02.jpeg)

一个简单的处理 PDF 的 SKILL.md 文件

### 2.2 skill 的嵌套结构

随着 skill 复杂性的增加，过多的信息可能会使单个 SKILL.md 变得臃肿，而且某些信息仅在特定场景下才会被使用。

在这种情况下，skill 可以在 skill 目录中捆绑其他文件，并在 SKILL.md 文件中按名称引用这些文件。

这些额外的链接引用构成了第三层（或更高层）的信息，Claude 可以根据需要选择读取这些文件。

```
pdf-skill/
├── SKILL.md (main instructions)
├── FORMS.md (form-filling guide)
├── REFERENCE.md (detailed API reference)
└── scripts/
    └── fill_form.py (utility script)
```

在下方所示的 PDF skill 示例中，SKILL.md 引用了两个附加文件（reference.md 和 forms.md），skill 作者选择将这两个文件与核心的 SKILL.md 文件绑定。

因为 Claude 只会在填写表单时读取 forms.md 文件，所以将"表单填写说明"移至单独的文件（forms.md），这样可以让 skill 核心内容保持简洁。

![PDF skill 的嵌套结构示例](/images/claude-code-skills/03.jpeg)

PDF skill 的嵌套结构示例

渐进式披露是使 Agent skill 灵活且可扩展的核心设计原则。

就像一本结构条理的手册，从目录开始，然后是具体章节，最后是附录

skill 使 Claude 仅在需要时加载必要信息，下图展示的是 SKILL.md 文件的三层结构及每层信息的加载时机

![SKILL.md 文件的三层结构及每层信息的加载时机](/images/claude-code-skills/04.jpeg)

SKILL.md 文件的三层结构及每层信息的加载时机

拥有文件系统和代码执行工具的 Agent 在执行特定任务时，无需将 skill 的全部内容读取到上下文窗口中，这就意味着 skill 中可以包含的上下文信息量实际上是无限的（通过捆绑、引用其他文件来实现）。

### 2.3 上下文窗口的变化

下图显示了当用户消息触发 skill 时，上下文窗口是如何变化的。

![用户消息触发 skill 时上下文窗口的变化](/images/claude-code-skills/05.jpeg)

用户消息触发 skill 时上下文窗口的变化

所示操作顺序：

1. 首先，上下文窗口会显示
   - 核心系统提示词（应该是 CLAUDE.md 文件中的内容）
   - 每个已安装 skill 的元数据
   - 用户的初始消息
2. Claude 通过调用 Bash 工具读取 pdf/SKILL.md 的内容来触发 PDF skill；
3. Claude 读取与该 skill 捆绑在一起的 forms.md 文件；
4. 最后，Claude 从 PDF skill 中加载了相关说明后，便开始执行用户的任务。

### 2.4 skill 中的代码引用

skills 中还可以包括代码，Claude 可以自行决定将这些代码作为工具来执行，因为某些任务可能更适合用传统的代码执行。

例如，通过生成标记来对列表进行排序远比直接运行排序算法成本高得多。

除了效率问题之外，许多应用还需要通过代码段来提高可靠性。

在下图的例子中，PDF skill 包含了一个预先编写的 Python 脚本，该脚本读取 PDF 文件并提取所有表单字段。

Claude 无需将 Python 脚本的全部内容或 PDF 文件加载到上下文中，skill 在执行时，Python 脚本被单独执行，只需要将 Python 程序返回的结果加入到 skill 中即可。

由于代码是固定的，因此该工作流具有一致性和可重复性。

![PDF skill 中预先编写的 Python 脚本示例](/images/claude-code-skills/06.jpeg)

PDF skill 中预先编写的 Python 脚本示例

## 3、Skills 的使用指南

- 任务评估：通过让 Agent 执行代表性任务，观察它在哪些方面遇到困难或需要更多附加信息，从而找出 Agent 经常卡壳的地方，然后通过创建 skill 来弥补这些缺陷。
- 结构化设计：
  - 当 SKILL.md 文件中的信息过载时，应将其内容拆分为多个单独的文件并分别引用。
  - 如果 skill 中的某些信息无法同时生效或很少同时使用，那么将这些内容以不同文件的形式分开，则会降低 Token 的消耗。
  - 最后，代码既可以作为可执行工具，也可以作为文档引用。用户应该明确 Claude 是应该直接运行脚本，还是应该将这些脚本作为引用信息。
- 看 Claude 的执行效果：看 Claude 在实际场景中如何执行 skill，并根据它的执行效果反复迭代优化，注意观察 skill 在使用过程中的意外情况。不能忽略 skill 的 name 和 description，因为 Claude 会根据这些信息来决定是否在当前任务中触发该 skill。
- skill 的反复迭代：在 Claude 完成任务时，让其将重复性操作和常见错误记录下来，并将其转化为可复用的 skill 代码和上下文。如果它在使用 skill 完成任务时偏离了方向，让 Claude 进行自我反思，找出问题所在。这个过程将帮助你发现 Claude 实际需要的上下文。

## 4、安全注意事项

skill 赋予了 Claude 新的能力，虽然这使其功能强大，但这也意味着恶意 skill 可能会在其使用环境中引入漏洞，或者诱使 Claude 窃取数据并执行非预期操作！！！

建议仅从可信来源安装 skill，如果从不可信的来源安装 skill，请在使用前进行彻底地审核：

- 首先，阅读 skill 中包含的文件内容，了解其功能，尤其要注意代码依赖关系和捆绑的资源；
- 同样，也要注意 skill 中是否有指令或代码使 Claude 连接到不受信任的外部网络资源。

参考链接：

[1]. https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills

[2]. https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
