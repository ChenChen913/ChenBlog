---
title: "Markdown 与数学公式全功能测试"
title_en: "Markdown & Math Formula Full Test"
date: "2025-01-01"
category: "tech"
tags: ["Markdown", "KaTeX", "测试"]
featured: true
---

## 一、基础文字格式

这是一段普通正文。支持 **加粗**、*斜体*、~~删除线~~、`行内代码` 以及 ==高亮文本==。

> 这是一段引用文字。引用块支持多行内容，可以包含**加粗**等行内样式。

---

## 二、有序与无序列表

无序列表：
- 苹果
- 香蕉
  - 大香蕉
  - 小香蕉
- 橙子

有序列表：
1. 第一步：打开终端
2. 第二步：运行命令
3. 第三步：查看结果

任务列表：
- [x] 支持 Markdown 基础格式
- [x] 支持代码块与行号
- [ ] 支持数学公式
- [ ] 支持目录导航

---

## 三、代码块（含行号与复制）

### JavaScript 示例

```javascript
// 快速排序算法
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const mid = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  return [...quickSort(left), ...mid, ...quickSort(right)];
}

const result = quickSort([3, 6, 8, 10, 1, 2, 1]);
console.log(result); // [1, 1, 2, 3, 6, 8, 10]
```

### Python 示例（长行换行测试）

```python
# 这是一行非常非常非常非常非常非常非常非常非常长的注释，用来测试代码块的长行自动换行效果，不应该出现横向滚动条
import numpy as np

def gaussian(x, mu=0, sigma=1):
    """标准高斯函数"""
    return (1 / (sigma * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - mu) / sigma) ** 2)

x_values = np.linspace(-4, 4, 100)
y_values = gaussian(x_values)
print(y_values)
```

---

## 四、数学公式

### 行内公式

爱因斯坦质能方程：$E = mc^2$，其中 $m$ 是质量，$c$ 是光速。

欧拉公式：$e^{i\pi} + 1 = 0$

### 块级公式

二次方程求根公式：

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

正态分布概率密度函数：

$$
f(x) = \frac{1}{\sigma\sqrt{2\pi}} \, e^{-\dfrac{(x-\mu)^2}{2\sigma^2}}
$$

矩阵乘法示例：

$$
\begin{pmatrix} a & b \\ c & d \end{pmatrix}
\begin{pmatrix} e & f \\ g & h \end{pmatrix}
=
\begin{pmatrix} ae+bg & af+bh \\ ce+dg & cf+dh \end{pmatrix}
$$

求和与极限：

$$
\lim_{n \to \infty} \sum_{k=1}^{n} \frac{1}{k^2} = \frac{\pi^2}{6}
$$

傅里叶变换：

$$
\hat{f}(\xi) = \int_{-\infty}^{\infty} f(x)\, e^{-2\pi i x \xi} \, dx
$$

---

## 五、表格

| 语言       | 范式     | 典型用途              |
| ---------- | -------- | --------------------- |
| Python     | 多范式   | 数据科学、AI          |
| Rust       | 系统级   | 操作系统、WebAssembly |
| TypeScript | 面向对象 | 前端、Node.js         |
| Haskell    | 纯函数式 | 学术研究              |

---

## 六、链接与图片

[访问 Anthropic 官网](https://www.anthropic.com/)

![示例图片](https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80)

---

## 七、总结

以上内容覆盖了博客系统需要支持的主要 Markdown 格式，包括：

1. 文字格式（加粗、斜体、删除线、高亮）
2. 列表（有序、无序、任务）
3. 代码块（行号、复制按钮、长行换行）
4. 数学公式（行内 $...$ 和块级 $$...$$）
5. 表格
6. 链接与图片
