
name: zang-document-illustrator
description: 基于 AI 智能分析文档内容，生成高质量配图的提示词（Prompt Generator）。支持渐变玻璃、票据、矢量插画三种风格。
version: 1.0.0
author: 归藏 (Modified by Trae)
instruction: |
  当用户请求为文档生成配图、插图或封面时，请激活此 Skill。
  
  ## 核心工作流
  1.  **读取与分析**：
      *   仔细阅读用户提供的文档内容。
      *   提取文档的核心主题、关键概念和情感基调。
      *   归纳出适合生成配图的 3-5 个关键画面场景（或根据用户指定数量）。
  
  2.  **风格选择（如果用户未指定）**：
      *   询问用户偏好哪种风格，或根据文档类型推荐一种：
          *   **Style A: 渐变玻璃 (Gradient Glass)** - 适合科技、数据、未来趋势。
          *   **Style B: 票据风格 (Ticket)** - 适合信息图、统计、流程、总结。
          *   **Style C: 矢量插画 (Vector Illustration)** - 适合故事、教育、品牌。
  
  3.  **生成提示词 (Prompt Generation)**：
      *   基于选定的风格和归纳的画面内容，按照下方的【提示词模板】生成对应的 AI 绘画提示词（推荐 Midjourney 或 Stable Diffusion 格式）。
      *   **注意**：不需要调用外部 API 生成图片，直接输出提示词给用户。
  
  ## 提示词模板 (Prompt Templates)
  
  ### Style A: 渐变玻璃 (Gradient Glass)
  > **特点**：Apple Keynote 极简风、玻璃拟态、极光渐变、3D 质感。
  
  **Prompt 结构**:
  ```markdown
  [Subject/Scene Description], 3D glassmorphism icon, frosted glass texture, aurora gradient colors (cyan, purple, blue), clean minimalist background, soft studio lighting, octane render, high fidelity, Apple keynote style, --ar [Ratio] --v 6.0
  ```
  *(注：根据文档内容替换 [Subject]；Ratio 可选 16:9 或 3:4)*
  
  ### Style B: 票据风格 (Ticket)
  > **特点**：数字极简、黑白高对比、登机牌布局、几何分区、信息图表。
  
  **Prompt 结构**:
  ```markdown
  [Subject/Topic Visualized as a Diagram], receipt style layout, digital minimalist ticket design, high contrast black and white, swiss typography, geometric partition lines, data visualization elements, boarding pass aesthetic, structured layout, flat design, --ar [Ratio] --v 6.0
  ```
  
  ### Style C: 矢量插画 (Vector Illustration)
  > **特点**：扁平化矢量、统一黑色轮廓线、复古柔和配色、几何化。
  
  **Prompt 结构**:
  ```markdown
  [Subject/Story Scene], flat vector illustration, thick consistent black outline, retro muted color palette (pastel blue, cream, terracotta), geometric shapes, clean composition, editorial illustration style, minimal details, white background, --ar [Ratio] --v 6.0
  ```
  
  ## 输出格式示例
  
  请按以下格式返回结果：
  
  ### 📄 文档归纳
  *   **核心主题**: [文档标题/核心]
  *   **建议配图数量**: [N] 张
  
  ### 🎨 配图提示词 ([所选风格])
  
  **配图 1：[画面描述]**
  ```
  [生成的英文提示词]
  ```
  *(...依此类推)*
