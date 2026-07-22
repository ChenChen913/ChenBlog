# 文档类型翻译策略

本文档包含不同文档类型的特殊翻译规则，在翻译执行阶段根据文档分类结果加载。

---

## API 文档

### 特殊规则

```
API 文档翻译规范：
1. 端点路径保持英文：/api/v1/users
2. HTTP 方法保持英文：GET, POST, PUT, DELETE
3. 参数名保持英文，翻译参数说明
4. 状态码保持数字，翻译说明文字
5. JSON 示例中键名保持英文，注释翻译为中文
6. 错误代码保持原样，翻译错误消息
7. 请求/响应示例保持英文结构
```

### 示例

原文：
```
The endpoint `/api/v1/predict` accepts POST requests with a JSON body.
```

译文：
```
端点 `/api/v1/predict` 接受包含 JSON 请求体的 POST 请求。
```

---

## 用户手册

### 特殊规则

```
用户手册翻译原则：
1. 使用用户友好的语言，避免过度技术化
2. 操作步骤清晰明确，使用祈使句
3. 警告和注意事项突出强调
4. UI 元素名称与实际界面一致
5. 如有截图说明，标注是否需要本地化截图
6. "Note:" → "注意："，"Warning:" → "警告："，"Tip:" → "提示："
```

### 语气要求

- 亲切友好，不居高临下
- 使用"你"而非"您"（除非用户要求正式语气）
- 步骤使用祈使句：`点击设置按钮` 而非 `用户需要点击设置按钮`

---

## 学术论文

### 特殊规则

```
学术论文翻译规范：
1. 保持学术严谨性和客观性
2. 专业术语使用学术界公认译法
3. 数学公式保持 LaTeX 格式不变
4. 公式中的变量符号保持英文（x, y, θ, α）
5. 仅翻译公式前后的说明文字
6. 公式编号格式保持一致
7. 参考文献格式保持不变
8. 作者姓名保持原文
9. 摘要（Abstract）需特别注意准确性
```

### 公式处理

```
原文：
The loss function is defined as $$L(\theta) = \sum_{i=1}^{n}(y_i - f(x_i;\theta))^2$$
where $\theta$ represents the model parameters.

译文：
损失函数定义为 $$L(\theta) = \sum_{i=1}^{n}(y_i - f(x_i;\theta))^2$$
其中 $\theta$ 表示模型参数。
```

### 常见学术表达

| 英文 | 中文 |
|------|------|
| where X represents... | 其中 X 表示... |
| Equation (1) shows... | 公式 (1) 表明... |
| Let θ denote... | 令 θ 表示... |
| as shown in Figure 1 | 如图 1 所示 |
| the proposed method | 本文提出的方法 |
| state-of-the-art | 业界领先 / 当前最优 |
| outperforms | 优于 / 表现优于 |

---

## 技术博客

### 特殊规则

```
技术博客翻译原则：
1. 保持文章的轻松感和可读性
2. 口语化表达可以适当保留
3. 幽默和比喻可以意译以适应中文文化
4. 链接文字翻译，URL 保持原样
5. 代码示例完整保留，翻译注释
6. 保持作者的个人风格和语气
```

### 语气要求

- 比正式文档更轻松
- 可以使用第一人称
- 保持教程的引导感

---

## 更新日志 / Release Notes

### 特殊规则

```
更新日志翻译规范：
1. 版本号保持原格式：v2.0.1
2. 日期格式本地化：2024-01-15 → 2024 年 1 月 15 日
3. 功能名称与产品界面一致
4. Issue 编号保持原样：Issue #123, PR #456
5. Git 信息保持原样
6. 保持条目的简洁性
7. 分类标签翻译：
   - Added → 新增
   - Changed → 变更
   - Deprecated → 废弃
   - Removed → 移除
   - Fixed → 修复
   - Security → 安全
```

---

## 商业/营销文档

### 特殊规则

```
商业/营销文档翻译原则：
1. 使用有吸引力、有说服力的语言
2. 品牌名称、产品名称保持原文或使用官方中文名
3. 数据和统计保持准确，可适当本地化格式
4. 行动号召（Call to Action）需符合中文营销习惯
5. 避免过度直译英文营销套话
6. 货币单位视需要转换或保留
7. 保持简洁有力，避免冗长表达
```

### 语气要求

- 积极正面，突出价值
- 面向决策者时专业权威，面向消费者时亲切易懂
- "Get started" → "立即开始" / "马上体验"
- "Learn more" → "了解更多"
- "Free trial" → "免费试用"

---

## 通用代码处理规则

适用于所有包含代码的文档类型：

### 代码块

```python
# 原文
def calculate_average(numbers):
    """
    Calculate the average of a list of numbers.

    Args:
        numbers: A list of numeric values

    Returns:
        The arithmetic mean of the input numbers
    """
    total = sum(numbers)  # Sum all numbers
    count = len(numbers)  # Get the count
    return total / count

# 翻译后
def calculate_average(numbers):
    """
    计算数字列表的平均值。

    参数:
        numbers: 数值列表

    返回:
        输入数字的算术平均值
    """
    total = sum(numbers)  # 求所有数字的和
    count = len(numbers)  # 获取数字个数
    return total / count
```

### 代码处理清单

- [ ] 代码逻辑保持英文不变
- [ ] 所有注释翻译为中文
- [ ] 文档字符串完整翻译
- [ ] 代码缩进和格式不变
- [ ] 变量名、函数名不翻译
- [ ] 字符串常量视情况决定是否翻译

---

## 版本和数字信息

| 类型 | 处理方式 | 示例 |
|------|----------|------|
| 版本号 | 保持原样 | v2.0.1, Python 3.9 |
| 日期 | 本地化 | 2024-01-15 → 2024 年 1 月 15 日 |
| 大数字 | 中文习惯 | 10,000 → 10000 或 1 万 |
| 百分比 | 保留 | 95% |
| 文件大小 | 加空格 | 128 MB |

---

## 链接和引用

```
翻译链接文字，保持 URL：
原文：See the [documentation](https://example.com/docs) for details.
译文：详情请参见[文档](https://example.com/docs)。

内部引用：
原文：As mentioned in Section 3.2...
译文：如第 3.2 节所述...
```
