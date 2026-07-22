# Tasks

- [x] Task 1: 将 CodeBlock 迁移到 Shiki 语法高亮
  - [x] 1.1 修改 CodeBlock.tsx 使用 Shiki highlighter 替代 react-syntax-highlighter
  - [x] 1.2 实现异步高亮加载（使用 useState 和 useEffect）
  - [x] 1.3 添加加载状态显示（骨架屏或占位符）
  - [x] 1.4 实现双主题支持（light/dark 主题切换）
  - [x] 1.5 测试各种语言的代码高亮

- [x] Task 2: 实现自定义行号渲染
  - [x] 2.1 创建行号渲染逻辑（基于代码行数生成）
  - [x] 2.2 使用 CSS Grid 布局实现行号与代码对齐
  - [x] 2.3 添加行号样式（右对齐、低对比度颜色）
  - [x] 2.4 实现行号选择排除（user-select: none）

- [x] Task 3: 实现自动换行与行号对齐
  - [x] 3.1 使用 CSS Grid 实现自动换行布局
  - [x] 3.2 设置 grid-template-columns: auto 1fr
  - [x] 3.3 实现换行时缩进保持
  - [x] 3.4 确保复制时不包含行号

- [x] Task 4: 添加无障碍功能
  - [x] 4.1 添加 ARIA 标签到复制按钮
  - [x] 4.2 确保复制按钮可通过 Tab 聚焦
  - [x] 4.3 支持 Enter 和 Space 键激活复制
  - [x] 4.4 添加屏幕阅读器复制反馈（aria-live region）
  - [x] 4.5 验证 WCAG AA 对比度标准

- [x] Task 5: 视觉样式优化
  - [x] 5.1 完善 macOS 风格窗口设计
  - [x] 5.2 添加主题切换过渡动画
  - [x] 5.3 响应式布局测试（320px - 2560px）

- [x] Task 6: 移除 react-syntax-highlighter
  - [x] 6.1 从 CodeBlock.tsx 移除 react-syntax-highlighter 导入
  - [x] 6.2 卸载 react-syntax-highlighter 包
  - [x] 6.3 清理相关类型定义

- [x] Task 7: 最终测试与验证
  - [x] 7.1 测试多代码块页面性能
  - [x] 7.2 测试主题切换功能
  - [x] 7.3 测试移动端响应式
  - [x] 7.4 测试复制功能

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 5] depends on [Task 1]
- [Task 6] depends on [Task 1, Task 2, Task 3, Task 4, Task 5]
- [Task 7] depends on [Task 6]
