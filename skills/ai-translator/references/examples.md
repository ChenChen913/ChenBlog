# 翻译输入输出示例

本文档提供不同场景的翻译示例，用于参考目标翻译风格。

---

## 示例 1：技术博客段落

### 原文

```
The model endpoint `/api/v1/predict` accepts POST requests.
The training process, which utilizes GPU acceleration,
typically completes in 2-3 hours. It is recommended to use
a batch size of 32 for optimal performance.
```

### 糟糕的翻译（有翻译腔）

```
模型终点 `/api/v1/predict` 接受POST请求。训练过程，它利用GPU加速，
通常在2-3小时内完成。建议使用32的批大小以获得最佳性能。
```

问题：endpoint 误译为"终点"、多余代词"它"、数字缺空格、翻译腔

### 优秀的翻译

```
模型端点 `/api/v1/predict` 接受 POST 请求。训练过程使用 GPU 加速，
通常需要 2-3 小时完成。建议将批大小设置为 32 以获得最佳性能。
```

亮点：术语准确（端点）、去掉多余代词、中英文加空格、表达自然

---

## 示例 2：学术论文摘要

### 原文

```
We propose a novel attention mechanism that significantly
outperforms existing methods on multiple benchmarks. Our approach,
which we call Multi-Scale Attention (MSA), achieves state-of-the-art
results on ImageNet with a top-1 accuracy of 87.3%.
```

### 优秀的翻译

```
本文提出了一种新的注意力机制，在多个基准测试中显著优于现有方法。
我们将该方法称为多尺度注意力（Multi-Scale Attention, MSA），
在 ImageNet 上取得了业界领先的结果，top-1 准确率达到 87.3%。
```

亮点：长句拆分、术语首次中英对照、SOTA 翻译为"业界领先"、数据准确

---

## 示例 3：API 文档

### 原文

原文：

> **Authentication** — All API requests require a valid API key. Include your key in the `Authorization` header: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.example.com/v1/models`. Parameters: model_id (string, Required) — The ID of the model to use; temperature (float, Optional) — Sampling temperature (0-2).

### 优秀的翻译

> **身份验证** — 所有 API 请求都需要有效的 API 密钥。请在 `Authorization` 请求头中包含你的密钥。

翻译要点：
- 标题：Authentication → 身份验证
- 代码块（curl 命令）保持完全不变
- 表头翻译：Parameter→参数, Type→类型, Required→必填, Description→说明
- 参数名保持英文：model_id, temperature
- Required 值：Yes→是, No→否
- 说明翻译：The ID of the model to use → 要使用的模型 ID

亮点：代码块完整保留、参数名保持英文、表格结构完整、表头翻译

---

## 示例 4：代码注释

### 原文

```python
class DataProcessor:
    """
    Process raw data and apply transformations.

    Args:
        data: Raw input data as a list of dictionaries
        config: Processing configuration object

    Returns:
        List of processed data entries
    """

    def process(self, data, config):
        # Filter invalid entries
        valid = [item for item in data if item.get('is_valid')]

        # Apply transformations based on config
        return [self.transform(item, config) for item in valid]
```

### 优秀的翻译

```python
class DataProcessor:
    """
    处理原始数据并应用转换。

    参数:
        data: 原始输入数据，格式为字典列表
        config: 处理配置对象

    返回:
        处理后的数据条目列表
    """

    def process(self, data, config):
        # 过滤无效条目
        valid = [item for item in data if item.get('is_valid')]

        # 根据配置应用转换
        return [self.transform(item, config) for item in valid]
```

亮点：类名/函数名/变量名保持英文、所有注释翻译、文档字符串完整翻译

---

## 示例 5：长句拆分

### 原文

```
The proposed framework, which integrates both supervised and
unsupervised learning techniques and leverages a novel
multi-modal architecture that processes text, image, and audio
inputs simultaneously, demonstrates remarkable performance
improvements across all evaluated benchmarks while maintaining
computational efficiency comparable to single-modal baselines.
```

### 糟糕的翻译（未拆分）

```
所提出的框架，它集成了监督学习和无监督学习技术，并利用了一种新颖的
多模态架构来同时处理文本、图像和音频输入，在所有评估基准测试中展示了
显著的性能改进，同时保持了与单模态基线相当的计算效率。
```

### 优秀的翻译（拆分后）

```
本文提出的框架融合了监督学习和无监督学习技术，采用了一种新的多模态架构，
能够同时处理文本、图像和音频输入。该框架在所有评估基准测试中均取得了
显著的性能提升，同时保持了与单模态基线相当的计算效率。
```

亮点：拆分为 2 句、去掉"它"、"所提出的"改为"本文提出的"、表达自然

---

## 示例 6：更新日志

### 原文

```
## v2.1.0 (2024-01-15)

### Added
- Multi-GPU training support for distributed environments
- New `--checkpoint-interval` CLI argument

### Fixed
- Memory leak in data loader when using large batch sizes (#142)
- Incorrect gradient calculation in custom loss functions

### Deprecated
- `legacy_mode` parameter will be removed in v3.0
```

### 优秀的翻译

```
## v2.1.0（2024 年 1 月 15 日）

### 新增
- 支持分布式环境下的多 GPU 训练
- 新增 `--checkpoint-interval` 命令行参数

### 修复
- 修复批大小较大时数据加载器的内存泄漏问题（#142）
- 修复自定义损失函数中的梯度计算错误

### 废弃
- `legacy_mode` 参数将在 v3.0 中移除
```

亮点：版本号保持原样、日期本地化、Issue 编号保留、分类标签翻译、CLI 参数保持英文
