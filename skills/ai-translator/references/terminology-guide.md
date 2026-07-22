# 术语管理指南

本文档包含完整的术语表和术语管理规则，在预翻译准备阶段加载。

---

## 术语管理三层架构

### 第 1 层：核心术语表（本文件内嵌）

固定翻译规则，每次翻译必须遵守。

### 第 2 层：用户自定义术语

用户提供的术语表，优先级最高，覆盖核心术语表。

### 第 3 层：动态发现术语

翻译过程中发现的新术语，记录到工作目录下的 `discovered_terms.md`。

---

## 保持英文不翻译的术语

以下术语在任何场景下保持英文：

**通用技术**：API, SDK, HTTP, HTTPS, JSON, XML, YAML, REST, GraphQL, URL, URI, HTML, CSS, JavaScript, TypeScript, Python, Java, C++, Go, Rust, Docker, Kubernetes, Git, GitHub, GitLab, Linux, Windows, macOS, iOS, Android

**硬件/基础设施**：CPU, GPU, TPU, RAM, ROM, SSD, HDD, FPGA, ASIC

**协议/标准**：TCP/IP, SSH, SSL/TLS, OAuth, JWT, WebSocket, gRPC, MQTT

**开发流程**：CI/CD, DevOps, Agile, Scrum, Kanban, PR (Pull Request)

**数据格式**：CSV, PDF, PNG, JPEG, SVG, MP4, WAV

---

## AI/ML 领域术语表

| English | 中文 | 使用规则 |
|---------|------|----------|
| Artificial Intelligence (AI) | 人工智能 | 缩写 AI 保持英文 |
| Machine Learning (ML) | 机器学习 | 缩写 ML 保持英文 |
| Deep Learning | 深度学习 | |
| Neural Network | 神经网络 | |
| Transformer | Transformer | 首次标注"一种基于注意力机制的架构" |
| Large Language Model (LLM) | 大语言模型 | 可缩写 LLM |
| Foundation Model | 基础模型 | |
| Pre-training | 预训练 | |
| Fine-tuning | 微调 | |
| Transfer Learning | 迁移学习 | |
| Inference | 推理 | |
| Training | 训练 | |
| Backpropagation | 反向传播 | |
| Gradient Descent | 梯度下降 | |
| Stochastic Gradient Descent (SGD) | 随机梯度下降 | |
| Loss Function | 损失函数 | |
| Cost Function | 代价函数 | |
| Activation Function | 激活函数 | |
| Attention Mechanism | 注意力机制 | |
| Self-Attention | 自注意力 | |
| Multi-Head Attention | 多头注意力 | |
| Embedding | 嵌入 / Embedding | 视上下文，技术文档可保持英文（数学/底层原理侧重"嵌入"，应用层侧重 Embedding） |
| Token | Token / 词元 | 技术文档保持英文，科普可用"词元" |
| Tokenization | 分词 / Tokenization | |
| Prompt | 提示词 | |
| Prompt Engineering | 提示词工程 | |
| Chain of Thought (CoT) | 思维链 | |
| In-Context Learning | 上下文学习 | |
| Few-Shot Learning | 少样本学习 | |
| Zero-Shot Learning | 零样本学习 | |
| Reinforcement Learning (RL) | 强化学习 | |
| RLHF | RLHF | 首次标注"基于人类反馈的强化学习" |
| Supervised Learning | 监督学习 | |
| Unsupervised Learning | 无监督学习 | |
| Semi-Supervised Learning | 半监督学习 | |
| Self-Supervised Learning | 自监督学习 | |
| Convolutional Neural Network (CNN) | 卷积神经网络 | |
| Recurrent Neural Network (RNN) | 循环神经网络 | |
| LSTM | LSTM | 首次标注"长短期记忆网络" |
| GAN | GAN | 首次标注"生成对抗网络" |
| Diffusion Model | 扩散模型 | |
| VAE | VAE | 首次标注"变分自编码器" |
| NLP | NLP | 首次标注"自然语言处理" |
| Computer Vision | 计算机视觉 | |
| RAG | RAG | 首次标注"检索增强生成" |
| Agent | 智能体 / Agent | AI Agent 场景优先用"智能体"；强化学习或一般软件代理可用 Agent |
| Benchmark | 基准测试 | |
| SOTA / State of the Art | 业界领先水平 | 不译为"最先进"（学术语境下强调当前最高水平） |
| Overfitting | 过拟合 | |
| Underfitting | 欠拟合 | |
| Regularization | 正则化 | |
| Dropout | Dropout | 首次标注"一种正则化技术" |
| Batch Normalization | 批量归一化 | |
| Layer Normalization | 层归一化 | |
| Hyperparameter | 超参数 | |
| Epoch | Epoch / 轮次 | 技术文档保持英文 |
| Batch Size | 批大小 / Batch Size | |
| Learning Rate | 学习率 | |
| Latent Space | 潜在空间 | |
| Feature Extraction | 特征提取 | |
| Data Augmentation | 数据增强 | |
| Cross-Validation | 交叉验证 | |
| Precision | 精确率 | |
| Recall | 召回率 | |
| F1 Score | F1 分数 | |
| AUC | AUC | 首次标注"曲线下面积" |
| Confusion Matrix | 混淆矩阵 | |
| Ground Truth | 真实标签 / Ground Truth | |

---

## 软件开发术语表

| English | 中文 | 使用规则 |
|---------|------|----------|
| Endpoint | 端点 | |
| Middleware | 中间件 | |
| Microservice | 微服务 | |
| Container | 容器 | |
| Orchestration | 编排 | |
| Deployment | 部署 | |
| Repository | 仓库 / 代码库 | |
| Branch | 分支 | |
| Merge | 合并 | |
| Commit | 提交 / Commit | |
| Pull Request | Pull Request / PR | 保持英文 |
| Code Review | 代码审查 | |
| Refactoring | 重构 | |
| Debugging | 调试 | |
| Compilation | 编译 | |
| Runtime | 运行时 | |
| Framework | 框架 | |
| Library | 库 | |
| Package | 包 | |
| Module | 模块 | |
| Dependency | 依赖 | |
| Configuration | 配置 | |
| Environment Variable | 环境变量 | |
| Authentication | 身份验证 / 认证 | |
| Authorization | 授权 | |
| Encryption | 加密 | |
| Hashing | 哈希 | |
| Caching | 缓存 | |
| Load Balancing | 负载均衡 | |
| Scalability | 可扩展性 | |
| High Availability | 高可用性 | |
| Latency | 延迟 | |
| Throughput | 吞吐量 | |
| Concurrency | 并发 | |
| Parallelism | 并行 | |
| Thread | 线程 | |
| Process | 进程 | |
| Callback | 回调 | |
| Promise | Promise | 首次标注"异步编程模式" |
| Async/Await | Async/Await | 保持英文 |
| ORM | ORM | 首次标注"对象关系映射" |
| Payload | 载荷 / 请求体 | 视上下文 |
| Schema | Schema / 模式 | 数据库场景用"模式"，其他保持英文 |
| Webhook | Webhook | 首次标注"网络钩子/回调" |
| Serverless | Serverless / 无服务器 | |
| Edge Computing | 边缘计算 | |

---

## 多义词对照表

| 术语 | AI/ML | 软件开发 | 数据库 | 硬件 |
|------|-------|----------|--------|------|
| Model | 模型 | 模式（设计模式） | 数据模型 | 型号 |
| Service | 服务 | 服务/微服务 | 服务 | 维护 |
| Pipeline | 数据流水线 | 构建流水线(CI/CD) | 数据管道 | 管线 |
| Handler | 处理器 | 路由处理器 | 处理程序 | - |
| Instance | 实例 | 实例 | 实例 | 实体 |
| Environment | 环境 | 开发/生产环境 | - | 环境 |
| Port | - | 端口 | 端口 | 接口 |
| Image | 图像 | 镜像（Docker） | - | - |
| Volume | - | 卷（Docker） | - | 音量 |
| Pool | - | 连接池/线程池 | 连接池 | - |
| Build | - | 构建 | - | - |
| Release | - | 发布/版本 | - | - |
| Stack | 堆栈(数据结构) | 技术栈 | - | - |

---

## 术语处理决策流程

遇到新术语时按以下优先级处理：

1. **查术语表**：本文件中是否有对应翻译？→ 有则直接使用
2. **查用户自定义**：用户是否提供了自定义译法？→ 有则优先使用
3. **查动态发现库**：之前翻译中是否已处理过？→ 有则复用
4. **网络搜索**（如可用）：
   - 搜索 `"{术语} 中文翻译"` 或 `"{术语} Chinese translation"`
   - 参考权威来源（官方文档、学术论文、知名技术社区）
   - 多源交叉验证
5. **AI 知识推测**：基于训练知识推测译法
6. **保守处理**：不确定时保持英文，首次出现加中文注释

**所有新发现的术语记录到 `discovered_terms.md`**，格式：

```markdown
## 新发现术语

| 英文 | 中文 | 来源 | 置信度 | 备注 |
|------|------|------|--------|------|
| quantum annealing | 量子退火 | AI 推测 | 中 | 待验证 |
| ... | ... | ... | ... | ... |
```
