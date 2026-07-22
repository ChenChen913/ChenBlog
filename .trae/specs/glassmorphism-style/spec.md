# 苹果液态玻璃风格 UI 优化 Spec

## Why
当前侧边栏导航标签和右上角浮动按钮的样式较为普通，缺乏视觉吸引力。采用苹果液态玻璃（Glassmorphism）风格可以提升整体 UI 的现代感和美观度。

## What Changes
- 侧边栏导航标签（首页、分类、精选、关于）选中状态采用液态玻璃效果
- 选中状态的标签添加四角圆滑的圆角
- 右上角浮动按钮（主题切换、语言切换）采用液态玻璃效果

## Impact
- Affected code: 
  - `src/components/SideBar.tsx` - 导航标签液态玻璃效果
  - `src/components/FloatingActions.tsx` - 浮动按钮液态玻璃效果

## ADDED Requirements

### Requirement: 侧边栏导航标签液态玻璃效果
选中的导航标签应具有苹果液态玻璃风格。

#### Scenario: 选中状态显示液态玻璃效果
- **WHEN** 用户查看侧边栏导航
- **THEN** 选中的标签显示半透明模糊背景、微妙边框、柔和阴影的液态玻璃效果
- **AND** 标签四角圆滑

#### Scenario: 未选中状态保持原样
- **WHEN** 用户查看侧边栏导航
- **THEN** 未选中的标签保持普通样式，无液态玻璃效果

### Requirement: 浮动按钮液态玻璃效果
右上角的主题切换和语言切换按钮应具有液态玻璃风格。

#### Scenario: 浮动按钮显示液态玻璃效果
- **WHEN** 用户查看右上角浮动按钮
- **THEN** 按钮容器显示半透明模糊背景、微妙边框、柔和阴影的液态玻璃效果

## MODIFIED Requirements

### Requirement: SideBar 导航样式
选中标签采用液态玻璃效果，未选中标签保持普通样式。

### Requirement: FloatingActions 样式
整个容器采用液态玻璃效果。

## REMOVED Requirements
无
