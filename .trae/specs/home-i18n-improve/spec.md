# 主页国际化与语言切换优化 Spec

## Why
当前语言切换按钮显示图标和文字，不够简洁。主页介绍文字固定为英文，缺少中文版本。推荐文章显示封面图片，与用户需求不符。

## What Changes
- 语言切换按钮简化为只显示 "ZH" 或 "EN" 文字，移除图标
- 主页标题和介绍文字支持中英文切换
- 推荐文章不显示封面图片

## Impact
- Affected code: 
  - `src/components/FloatingActions.tsx` - 简化语言切换按钮
  - `src/pages/Home.tsx` - 添加中英文介绍文字，移除推荐文章封面图片
  - `src/i18n/index.ts` - 添加主页介绍文字的翻译

## ADDED Requirements

### Requirement: 简化语言切换按钮
语言切换按钮只显示当前语言的缩写。

#### Scenario: 显示简洁的语言标识
- **WHEN** 用户查看右上角浮动按钮
- **THEN** 语言切换按钮只显示 "ZH" 或 "EN" 文字，无图标

### Requirement: 主页介绍文字国际化
主页标题和介绍文字应根据当前语言显示对应版本。

#### Scenario: 中文模式显示中文
- **WHEN** 语言设置为中文
- **THEN** 标题显示 "你好，世界"，介绍文字显示中文版本

#### Scenario: 英文模式显示英文
- **WHEN** 语言设置为英文
- **THEN** 标题显示 "Hello, World"，介绍文字显示英文版本

### Requirement: 推荐文章不显示封面图片
推荐文章区域不显示封面图片。

#### Scenario: 无封面图片
- **WHEN** 用户查看推荐文章
- **THEN** 文章卡片不显示封面图片，只显示标题、分类、日期和摘要

## MODIFIED Requirements

### Requirement: FloatingActions 组件
语言切换按钮简化为纯文字显示。

### Requirement: Home 页面
添加国际化支持，移除推荐文章封面图片。

## REMOVED Requirements
无
