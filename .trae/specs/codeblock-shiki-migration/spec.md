# CodeBlock Shiki 迁移规格

## Why
当前 CodeBlock 组件使用 react-syntax-highlighter 进行代码高亮，但执行计划要求迁移到 Shiki 以获得更好的性能和主题集成。Shiki 提供更精确的语法高亮、更好的主题支持（支持双主题切换）和更小的运行时开销。

## What Changes
- 将 CodeBlock 组件从 react-syntax-highlighter 迁移到 Shiki
- 实现自定义行号渲染（支持自动换行对齐）
- 实现自动换行功能并保持行号对齐
- 添加无障碍功能（ARIA 标签、键盘导航）
- 优化性能（懒加载、缓存已实现）
- 移除 react-syntax-highlighter 依赖

## Impact
- Affected specs: 代码块渲染、主题切换、无障碍访问
- Affected code: 
  - `src/components/CodeBlock.tsx` - 主要修改
  - `src/index.css` - 可能需要添加样式
  - `package.json` - 移除 react-syntax-highlighter

## ADDED Requirements

### Requirement: Shiki 语法高亮
系统应使用 Shiki 进行代码语法高亮，支持双主题（light/dark）切换。

#### Scenario: 代码高亮渲染
- **WHEN** 用户查看包含代码块的文章
- **THEN** 代码应以 Shiki 高亮显示，并根据当前主题自动切换配色

### Requirement: 自定义行号渲染
系统应实现自定义行号渲染，支持自动换行时行号与代码行对齐。

#### Scenario: 行号显示
- **WHEN** 代码块启用行号显示
- **THEN** 每行代码左侧应显示对应的行号，且自动换行时行号保持对齐

### Requirement: 自动换行支持
系统应支持代码自动换行，并在换行时保持缩进和行号对齐。

#### Scenario: 长代码行换行
- **WHEN** 代码行超过容器宽度
- **THEN** 代码应自动换行，换行后的内容应正确缩进，行号保持不变

### Requirement: 无障碍访问
系统应符合 WCAG AA 标准，提供完整的键盘导航和屏幕阅读器支持。

#### Scenario: 键盘复制
- **WHEN** 用户使用 Tab 键导航到复制按钮
- **THEN** 用户应能通过 Enter 或 Space 键激活复制功能

## MODIFIED Requirements

### Requirement: CodeBlock 组件
CodeBlock 组件应使用 Shiki 而非 react-syntax-highlighter 进行语法高亮。

## REMOVED Requirements

### Requirement: react-syntax-highlighter
**Reason**: 迁移到 Shiki 后不再需要
**Migration**: 卸载 react-syntax-highlighter 包，移除相关导入
