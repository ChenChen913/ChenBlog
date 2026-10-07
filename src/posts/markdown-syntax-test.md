---
title: Markdown 语法测试
title_en: Markdown Syntax Test
date: 2025-01-01
category: tech
tags: [markdown, test]
draft: false
---

这是一篇专门用于验证博客 Markdown 渲染能力的测试文章。下面的语法属于当前项目承诺支持的范围。

## 1. 标题

# 一级标题示例

## 二级标题示例

### 三级标题示例

#### 四级标题示例

##### 五级标题示例

###### 六级标题示例

## 2. 文本格式

这是 **粗体文本**。

这是 __另一种粗体文本__。

这是 *斜体文本*。

这是 _另一种斜体文本_。

这是 ***粗斜体文本***。

这是 ~~删除线文本~~。

这是 <mark>HTML mark 高亮文本</mark>。

这是 ==双等号高亮文本==。

列表里的 ==高亮文本== 也应该正常显示。

## 3. 列表

### 无序列表

- 项目 1
- 项目 2
  - 嵌套项目 2.1
  - 嵌套项目 2.2
- 项目 3

### 有序列表

1. 第一项
2. 第二项
3. 第三项

### 任务列表

- [x] 已完成的任务
- [ ] 未完成的任务
- [ ] 另一个未完成的任务

## 4. 链接和图片

[GitHub](https://github.com)

![图片示例](/article-demo-placeholder.svg)

## 5. 代码

这是 `inline code` 行内代码示例。

```javascript
function hello(name) {
  const message = `Hello, ${name}!`;
  console.log(message);
}

hello('World');
```

```python
def hello(name: str) -> None:
    print(f"Hello, {name}!")

hello("World")
```

```python
# 长行换行测试：这是一行非常非常非常非常非常非常非常非常非常长的注释，
# 用来验证代码块的长行自动换行效果，不应该出现横向滚动条
import numpy as np

def gaussian(x, mu=0, sigma=1):
    """标准高斯函数"""
    return (1 / (sigma * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - mu) / sigma) ** 2)

x_values = np.linspace(-4, 4, 100)
y_values = gaussian(x_values)
print(y_values)
```

## 6. 引用块

> 这是一段引用文本。
>
> 引用可以有多行，也可以包含 **强调文本**。

## 7. 表格

| 列 A | 列 B | 列 C |
|------|------|------|
| A1   | B1   | C1   |
| A2   | B2   | C2   |
| A3   | B3   | C3   |

### 表格对齐

| 左对齐 | 居中 | 右对齐 |
|:-------|:----:|-------:|
| A      | B    | C      |
| D      | E    | F      |

## 8. 分割线

---

***

___

## 9. 数学公式

行内公式：$E = mc^2$。

块级公式：

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

$$
\int_{a}^{b} f(x) dx = F(b) - F(a)
$$

## 10. 安全 HTML 标签

<details>
  <summary>点击展开 details 示例</summary>
  <p>这里是可展开内容，应该能够正常显示。</p>
</details>

<div>
  这是安全的 div 内容，其中包含 <span>span 文本</span>。
</div>

<figure>
  <img src="/article-demo-placeholder.svg" alt="figure 图片示例" />
  <figcaption>figure 与 figcaption 示例</figcaption>
</figure>

## 11. 当前支持范围总结

**完全支持：**

- 标题 h1-h6
- 段落、换行、分割线
- 粗体、斜体、粗斜体、删除线
- HTML `<mark>` 高亮和 `==文本==` 高亮
- 有序列表、无序列表、嵌套列表、任务列表
- 链接和图片
- 行内代码和代码块
- 表格与对齐
- 引用块
- KaTeX 数学公式
- 经过安全过滤的 HTML 标签

**暂不承诺支持：**

- 脚注
- 定义列表
- Mermaid 图表
- 任意第三方 iframe

如果后续要支持这些语法，需要先补充渲染插件、样式和安全测试。

## 12. 安全过滤验证

下面这些危险内容用于自动化测试，不应该在页面中形成可执行脚本、危险链接或未知 iframe。

<script>window.__markdownXssExecuted = true;</script>

<img src="javascript:alert('xss')" alt="危险图片示例" />

<iframe src="https://example.com/unsafe-embed"></iframe>

<a href="javascript:alert('xss')">危险链接示例</a>

[安全外链示例](https://github.com)
