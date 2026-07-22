# 侧边栏底部与浮动按钮重设计 Spec

## Why
当前主题切换按钮和语言切换按钮位于左侧侧边栏底部，用户需要滚动到页面顶部才能使用这些功能。将这两个按钮改为浮动模式可以提升用户体验，同时利用侧边栏底部空间展示联系方式，增加社交互动入口。

## What Changes
- 将主题切换（黑夜/白天）按钮和语言切换（中/英）按钮从侧边栏底部移动到页面右上角，设置为固定浮动模式
- 在侧边栏底部新增联系方式区域，包含 X、GitHub 和公众号三个社交图标
- X 链接到 `https://x.com/ChenWang282708`
- GitHub 链接到 `https://github.com/ChenChen913`
- 公众号图标点击后浮动显示二维码图片（暂时使用占位图片）

## Impact
- Affected specs: SideBar 组件、TopNav 组件、可能需要新增浮动按钮组件
- Affected code: 
  - `src/components/SideBar.tsx` - 移除底部切换按钮，添加联系方式
  - `src/components/TopNav.tsx` - 可能需要调整或复用
  - 可能需要创建新的 `FloatingActions.tsx` 组件

## ADDED Requirements

### Requirement: 浮动操作按钮
系统应在页面右上角提供固定浮动的主题切换和语言切换按钮。

#### Scenario: 用户滚动页面时按钮始终可见
- **WHEN** 用户在任意页面滚动到任意位置
- **THEN** 主题切换按钮和语言切换按钮始终显示在页面右上角，可被点击

#### Scenario: 主题切换功能正常
- **WHEN** 用户点击主题切换按钮
- **THEN** 页面主题在明暗模式之间切换

#### Scenario: 语言切换功能正常
- **WHEN** 用户点击语言切换按钮
- **THEN** 页面语言在中英文之间切换

### Requirement: 侧边栏联系方式
系统应在侧边栏底部显示联系方式图标。

#### Scenario: 显示社交图标
- **WHEN** 用户查看侧边栏底部
- **THEN** 显示 X、GitHub 和公众号三个图标

#### Scenario: X 链接跳转
- **WHEN** 用户点击 X 图标
- **THEN** 在新标签页打开 `https://x.com/ChenWang282708`

#### Scenario: GitHub 链接跳转
- **WHEN** 用户点击 GitHub 图标
- **THEN** 在新标签页打开 `https://github.com/ChenChen913`

#### Scenario: 公众号二维码显示
- **WHEN** 用户点击公众号图标
- **THEN** 在图标附近浮动显示二维码图片
- **AND** 再次点击或点击其他区域时关闭图片

## MODIFIED Requirements

### Requirement: SideBar 组件底部区域
原底部区域的主题切换和语言切换按钮被移除，替换为联系方式图标区域。

## REMOVED Requirements
无
