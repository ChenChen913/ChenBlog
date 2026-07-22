# 测试文档

## E2E 测试

本项目使用 Playwright 进行端到端测试。

### 安装依赖

首先需要安装 Playwright 及其浏览器:

```bash
npm install -D @playwright/test
npx playwright install
```

### 运行测试

**运行所有测试**:
```bash
npm run test:e2e
```

**交互式测试模式(推荐)**:
```bash
npm run test:e2e:ui
```

**调试测试**:
```bash
npm run test:e2e:debug
```

**在特定浏览器上运行**:
```bash
npx playwright test --project=chromium
npx playwright test --project="Mobile Chrome"
```

### 测试覆盖

当前测试覆盖以下功能:

#### 基础功能 ✅
- ✅ 首页加载
- ✅ 文章列表显示
- ✅ 文章详情页导航
- ✅ 语言切换(中文/英文)
- ✅ 主题切换(深色/浅色)
- ✅ 响应式设计(移动端)

#### 文章详情页 ✅
- ✅ 文章目录功能
- ✅ 代码块复制功能
- ✅ 回到顶部功能

#### 导航和路由 ✅
- ✅ 分类页面导航
- ✅ 精选页面导航
- ✅ 关于页面导航

#### 可访问性 ✅
- ✅ 图片 alt 属性检查
- ✅ 链接可访问文本检查

### 添加新测试

在 `tests/e2e/` 目录下创建新的测试文件:

```typescript
import { test, expect } from '@playwright/test'

test.describe('新功能测试', () => {
  test('测试描述', async ({ page }) => {
    await page.goto('/')
    // 你的测试代码
  })
})
```

### 测试最佳实践

1. **使用 data-testid**: 在元素上添加 `data-testid` 属性,使测试更稳定
2. **等待加载**: 使用 `waitForLoadState('networkidle')` 确保页面完全加载
3. **断言清晰**: 使用明确的 expect 语句验证结果
4. **独立性**: 每个测试应该独立运行,不依赖其他测试

### 故障排除

**测试失败**:
- 检查开发服务器是否运行在 `http://localhost:3000`
- 查看测试报告: `npx playwright show-report`
- 使用 UI 模式调试: `npm run test:e2e:ui`

**浏览器问题**:
```bash
# 重新安装浏览器
npx playwright install --force
```

### 持续集成

在 CI/CD 环境中运行测试:

```bash
# 无头模式运行
npm run test:e2e
```

测试报告会生成在 `playwright-report/` 目录。
