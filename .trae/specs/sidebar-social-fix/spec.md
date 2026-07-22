# 侧边栏社交图标与文章卡片优化 Spec

## Why
侧边栏底部的社交图标存在以下问题：图标未居中、X 图标使用的是旧版 Twitter 图标、公众号图标不正确、二维码显示的是占位图片而非真实图片。同时，文章卡片展示时不需要显示封面图片。

## What Changes
- 侧边栏底部社交图标区域居中对齐
- 将 Twitter 图标替换为最新的 X 图标（使用自定义 SVG）
- 将公众号图标替换为正确的图标（使用微信图标）
- 将公众号二维码图片替换为真实的 `公众号.jpeg` 图片
- 文章卡片组件移除封面图片显示

## Impact
- Affected code: 
  - `src/components/SideBar.tsx` - 图标居中、替换图标、替换二维码图片
  - `src/components/PostCard.tsx` - 移除封面图片显示

## ADDED Requirements

### Requirement: 社交图标居中显示
侧边栏底部的社交图标应在容器中居中对齐。

#### Scenario: 图标居中
- **WHEN** 用户查看侧边栏底部
- **THEN** X、GitHub、公众号三个图标在容器中水平居中显示

### Requirement: 使用正确的社交图标
社交图标应使用最新、正确的图标样式。

#### Scenario: X 图标显示正确
- **WHEN** 用户查看侧边栏底部
- **THEN** X 图标显示为最新的 X (原 Twitter) 品牌图标

#### Scenario: 公众号图标显示正确
- **WHEN** 用户查看侧边栏底部
- **THEN** 公众号图标显示为微信图标

### Requirement: 显示真实二维码图片
公众号二维码应显示真实图片而非占位图。

#### Scenario: 二维码图片显示
- **WHEN** 用户点击公众号图标
- **THEN** 显示 `公众号.jpeg` 图片

### Requirement: 文章卡片不显示封面图片
文章卡片列表中不显示封面图片。

#### Scenario: 无封面图片
- **WHEN** 用户浏览文章列表
- **THEN** 文章卡片不显示封面图片，只显示标题、摘要等信息

## MODIFIED Requirements

### Requirement: SideBar 社交区域布局
原布局改为居中对齐，图标更新为正确样式。

### Requirement: PostCard 组件
移除封面图片显示逻辑。

## REMOVED Requirements
无
