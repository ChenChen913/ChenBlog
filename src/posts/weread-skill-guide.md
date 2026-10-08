---
title: "微信读书 Skill 从入门到进阶：一份覆盖终端、桌面、手机的完整指南"
title_en: "WeRead Skill Guide: From Basics to Advanced Across Terminal, Desktop and Mobile"
date: "2026-05-19"
category: "AI"
tags: ["AI", "微信读书", "Skill"]
---

5月16日，微信读书官方开放了它的 skill，说是 skill，其实是一个 CLI 接口，你可能会说，看个书还用什么 skill，或者说这个东西到底有什么用呢？

![微信读书 skill 官方介绍页](/images/weread-skill-guide/01.png)

微信读书官方 skill 页面：让 AI 成为你的阅读搭档

其实在此之前，飞书也做了类似的举动，开放了自己的 CLI 接口，其目的就是让 AI 在本地终端就可以读取用户的飞书信息，包括：飞书里写的文档、会议和闹钟和日程等等，这些信息都可以让 AI 通过 CLI 接口去获取。

不管是飞书还是微信读书，它们开放这些接口，其实都是在为 AI 铺路，方便用户后期使用 AI Agent 管理在各个平台上的信息。

下面我将从多方面出发，讲一下如何安装和调用这个 skill，从而获取微信读书中的信息，一是告诉你这个 skill 应该怎么用；二是通过介绍一些比较简单的方法，也能让不熟悉终端的用户用上这个 skill。

使用这个功能有一个大前提：首先，你得在微信读书上有一定的阅读积累。

如果你没在上面读过书，或者只读过寥寥几本书，那么这个 skill 对你来说可能就很鸡肋，也就是说，如果你想把这个 skill 的作用发挥到极致，那么你首先应该做的就是多读书。

## 1 基础篇：在 Claude Code 中安装并使用微信读书 Skill

按照官网（https://weread.qq.com/r/weread-skills）给出的快速配置教程，在本地的终端中进行快速配置。下面以 Claude Code 为例进行配置。

> 如果没有安装 Claude Code 等 AI agent，可以看看这一、二节的大体功能介绍，然后跳到第三或第四部分。

![微信读书 skill 官网快速配置教程](/images/weread-skill-guide/02.png)

官网给出的快速配置教程

在 Claude Code 中直接发送下面内容：下载 https://cdn.weread.qq.com/skills/weread-skills.zip 安装 skill。

或者你也可以直接打开这个网址（https://cdn.weread.qq.com/skills/weread-skills.zip），系统会自动把这个压缩包下载下来。然后你解压这个压缩包，告诉 Claude Code 解压后的文件夹所处的位置，让它自动安装到指定目录下也可以。

安装完这个 weread skill 之后，如果需要进行下一步操作，那么需要获取 API Key。

请按照以下步骤操作：

1. 获取 API Key
2. 把这个 API Key 复制到终端窗口中
3. 让 AI 自行配置

![API Key 获取页面](/images/weread-skill-guide/03.png)

在官网获取自己的 API Key

关于这个 skill 有什么功能、怎么用，也可以直接问 AI，下面是这个 skill 它在主文件中的功能说明：

![weread skill 主文件中的功能说明](/images/weread-skill-guide/04.png)

weread skill 的功能说明

下面演示几个主要功能，注意如果是新会话的话，最好手动说明一下让 AI 调用 weread-skill。

```markdown
帮我搜一下《围城》这本书
```

AI 给出的回复：

![weread skill 搜索《围城》的结果](/images/weread-skill-guide/05.png)

可以看到它不仅搜到《围城》这本书的信息，而且还发现我的书架中已经有这本书了。

```markdown
看一下评分最高的那一个版本，它的具体书籍信息，还有这本书的公开点评、热门划线等等
```

AI 的回复：

![《围城》评分最高版本的书籍信息](/images/weread-skill-guide/06.png)

书籍信息

![《围城》的公开点评](/images/weread-skill-guide/07.png)

公开点评

![《围城》的热门划线](/images/weread-skill-guide/08.png)

热门划线

```markdown
看看我书架上都有一些什么书
```

AI 回复（部分截图）：

![AI 回复的书架书籍列表](/images/weread-skill-guide/09.png)

书架书籍列表（部分）

当然还有其他功能，比如说：

1. **推荐系统**
   让 AI 根据书架中的书，为你推荐一些高评分、高热度的书籍。

2. **读书信息读取与分析**
   让 AI 读取你的全部读书信息。它甚至可以获取你从开通微信账号以来的所有数据，包括：
   - 阅读时长和天数
   - 偏好分析
   - 阅读统计
   - 概要总结等

这些信息都是可以获取到的。

## 2 进阶篇：装上这两个社区 Skill，体验直接翻倍

下面列出两位 AI 界大佬根据“微信读书”Skill 创作的两个辅助类 Skill。

你想使用这两个辅助类 Skill 的前提，是必须先安装好前面提到的 weread skill。

注意安装这两个 skill 库的时候，直接根据我给出的地址，把地址交给 AI agent，让它自行下载并安装就可以了。

### 2.1 花叔的“读书顾问”：更聪明的推荐和更系统的学习规划

skill 名称：huashu-weread

访问地址：https://github.com/alchaincyf/huashu-weread

这个 skill 是知名 AI 创作者花叔创作的一个 skill。它是在官方“微信读书”的 skill 之上，又加了一层“读书顾问”的工作流。

它的这个 skill 主要是给微信官方的那个 skill 加强了四个功能：

1. 推荐阅读
2. 搞懂某一个领域
3. 整理笔记
4. 读书复盘

![huashu-weread 的功能介绍](/images/weread-skill-guide/10.png)

huashu-weread 在官方 skill 上加强的四个功能

比如说在没有使用这个加强 skill 的时候，我调用微信读书的 weread skill 时，让他给我推荐几本中国文学类的书，AI 会给出如下的回答（部分截图）：

![未加强时的书籍推荐结果](/images/weread-skill-guide/11.png)

未使用加强 skill 时的推荐结果（部分）

后面我说了一句：

```markdown
现在我需要你配合huashu-weread Skill，再帮我重新做一下关于中国文学的书籍推荐搜索。
```

然后 AI 给我的回答就变得更详细了（部分截图）：

![配合 huashu-weread 后的推荐结果](/images/weread-skill-guide/12.png)

配合 huashu-weread 后更详细的推荐结果（部分）

我尝试了加强 skill 中的第二个功能，就是我想搞懂某一个领域，让他先判断我的段位，然后给出一些推荐的书。

比如我是这样和 AI 说的：

```markdown
我想了解或者搞懂某一个领域，就是如何写作的这个领域。请你调用刚才的这个 skill，帮我推荐几本书，或者说根据我的段位，给我来一个进阶的书单。
```

然后 AI 先是根据我书架上已有的一本书，向我判断我在这个领域的段位。

![AI 判断写作领域段位](/images/weread-skill-guide/13.png)

AI 根据书架已有书籍判断段位

和 AI 确认交流好之后，AI 就开始调用 Skill 的加强功能，帮我做了一些规划，并推荐了一些书目（部分截图）：

![AI 给出的学习规划和推荐书单](/images/weread-skill-guide/14.png)

AI 做出的规划与推荐书目（部分）

### 2.2 把你的阅读数据变成一份精美的可视化报告

skill 名称：yao-weread-skill

访问地址：https://github.com/yaojingang/yao-open-skills/tree/main/skills/yao-weread-skill

这个也是 AI 业界大佬做的一个比较好的 skill。它的主要功能是在 weread skill 的基础上，获取到用户的详细读书信息，然后根据这些信息做成一个网页版的可视化报告。

具体功能如下：

![yao-weread-skill 的功能介绍](/images/weread-skill-guide/15.png)

yao-weread-skill 的功能列表

安装上这个 skill 之后，你可以这样和 AI 说：

```markdown
调用这个 skill，并根据我的微信读书的所有信息，给我生成一份详细的真实阅读报告。把这个阅读报告放在桌面即可
```

下面就是 AI 根据我的微信读书信息，生成的一份可视化报告。

<!-- 视频：AI 根据微信读书信息生成的可视化报告演示（时长 00:30），公众号视频待补 -->

因为我在微信读书中读的书不多，所以这个数据可视化报告可能不太好看。

## 3 桌面端友好方案：WorkBuddy 一站式安装和使用微信读书 Skill

考虑到有一些用户可能还没有上手 AI agent，或者说对终端界面比较抗拒，那么我就想到，这种用户可以使用 WorkBuddy 这种界面友好的 AI agent。

为什么要用这个 WorkBuddy 呢？

首先，WorkBuddy 是腾讯旗下的一个 AI agent，而微信读书也是腾讯家的。恰好微信读书的这个 skill 在 WorkBuddy 里面是可以直接选择安装的。

因为它们都属于同一家的产品，用起来都比较方便。

WorkBuddy 下载地址：

https://www.codebuddy.cn/work/

![WorkBuddy 官网下载页](/images/weread-skill-guide/16.png)

WorkBuddy 官网

WorkBuddy 一般是通过微信扫码就可以登录。

登录后看到这个界面，然后选择左侧导航栏中的“技能”（也就是所谓的 skill）

![WorkBuddy 主界面](/images/weread-skill-guide/17.jpeg)

登录后的 WorkBuddy 主界面

直接在搜索框中搜索“微信读书”，然后选择直接安装这个 skill 就可以

![在技能市场搜索「微信读书」](/images/weread-skill-guide/18.png)

搜索框中搜索「微信读书」

安装完这个 skill 之后，回到主界面。

在聊天框这个地方选择“技能”，再选择刚才安装的“微信读书助手”，就可以使用了。

![聊天框中选择「微信读书助手」](/images/weread-skill-guide/19.png)

在聊天框选择「技能」并选中「微信读书助手」

初次使用应该会让你配置 API key，这个在上面已经提到过如何获取，就是在这个网站（https://weread.qq.com/r/weread-skills）下获取你自己的 API key。

上面所说的 skill 的功能在这个软件中都可以使用。前提是你得先选中“微信读书助手”这个 skill。

例如，下面我让它列举我书架上的书，这是它给出的答复，从界面上看，比终端要好看一点（部分截图）：

![WorkBuddy 中列举书架书籍的答复](/images/weread-skill-guide/20.png)

WorkBuddy 中列举书架书籍（部分）

然后另外两个扩展技能需要你手动上传添加才可以用。

下面以“生成可视化数据报告”那个 skill 为例，教你如何上传并使用这个技能。

> 考虑到有些用户无法打开 GitHub，所以我将这两个扩展 skill 的更便捷的获取方式放在了文章的末尾。

依旧是点击左侧导航栏的“技能”按钮，进来之后点击右上角的“添加技能”，弹出下拉菜单以后，点击“上传技能”，然后把这个 skill 的压缩包上传一下并选择直接安装就可以使用了

![「添加技能」菜单中的「上传技能」](/images/weread-skill-guide/21.png)

通过「上传技能」添加扩展 skill

选中这个 skill 之后，直接在后面和 AI 说调用这个 skill，根据微信读书的用户信息帮我生成一份可视化数据报告。

下面是执行结果：

![可视化数据报告生成结果](/images/weread-skill-guide/22.png)

生成的可视化数据报告

## 4 移动端方案：一个 APP 就能调用微信读书 Skill

随后又考虑到，还有些用户不想开电脑，只想在手机上操作，这也是可以实现的。下面我就介绍这种方法：使用字节旗下的一个 APP，直接就可以完成上述的所有功能。

首先，你去应用商店搜索：trae

![应用商店中的 trae](/images/weread-skill-guide/23.jpeg)

应用商店中的 trae

登录后在 MTC 模式下直接对话就可以，然后操作和上面的差不多，我直接用视频展示我和它的对话内容，里面的命令在上面都有：

<!-- 视频：手机端 trae APP 调用微信读书 Skill 的实操演示（时长 00:53），公众号视频待补 -->

> 视频中的 API key 已经重置，无需担心我的信息安全。

为了方便你直接复制粘贴，我把视频中的会用到的命令，统一放在下面：

> 前提是先去微信读书官方（https://weread.qq.com/r/weread-skills）获取到自己的 API key

```markdown
下载 https://cdn.weread.qq.com/skills/weread-skills.zip 安装 skill

这是我的API key：【此处填写你自己的 API key，获取方式上面有】

看看我书架上都有哪些书

帮我把这个skill安装上：https://github.com/yaojingang/yao-open-skills/tree/main/skills/yao-weread-skill

调用刚刚安装的这个skill，根据我的微信读书信息，生成一份可视化的数据报告

把这个 skill 安装上：https://github.com/alchaincyf/huashu-weread

调用刚刚安装的这个 skill，我想涉足中国历史领域，帮我推荐几本书
```

考虑到部分读者可能无法访问 GitHub，我把文章中用到的三个 skill 打包放在了飞书文档中：
https://zcnvxfsiud9i.feishu.cn/docx/Vu1Bdn9BQoT6zUxTnU0cLW72n0c?from=from_copylink


