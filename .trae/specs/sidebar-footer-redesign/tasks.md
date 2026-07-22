# Tasks

- [x] Task 1: 创建浮动操作按钮组件 (FloatingActions.tsx)
  - [x] SubTask 1.1: 创建 FloatingActions 组件，包含主题切换和语言切换按钮
  - [x] SubTask 1.2: 设置 fixed 定位，确保按钮固定在页面右上角
  - [x] SubTask 1.3: 添加适当的 z-index 确保按钮始终在最上层
  - [x] SubTask 1.4: 添加悬停效果和过渡动画

- [x] Task 2: 修改 SideBar 组件底部区域
  - [x] SubTask 2.1: 移除原有的主题切换和语言切换按钮
  - [x] SubTask 2.2: 添加联系方式区域，包含 X、GitHub、公众号图标
  - [x] SubTask 2.3: 实现 X 和 GitHub 的外链跳转（新标签页打开）
  - [x] SubTask 2.4: 实现公众号图标的二维码浮动显示功能

- [x] Task 3: 在 Layout 组件中集成 FloatingActions 组件
  - [x] SubTask 3.1: 读取 Layout.tsx 文件
  - [x] SubTask 3.2: 导入并添加 FloatingActions 组件
  - [x] SubTask 3.3: 确保组件在桌面端和移动端都正常显示

- [x] Task 4: 添加公众号二维码占位图片
  - [x] SubTask 4.1: 创建或使用占位图片资源
  - [x] SubTask 4.2: 实现点击显示/隐藏二维码的交互逻辑

- [x] Task 5: 测试和验证
  - [x] SubTask 5.1: 验证浮动按钮在页面滚动时始终可见
  - [x] SubTask 5.2: 验证主题切换和语言切换功能正常
  - [x] SubTask 5.3: 验证社交链接跳转正确
  - [x] SubTask 5.4: 验证公众号二维码显示/隐藏交互正常

# Task Dependencies
- [Task 3] 依赖 [Task 1]
- [Task 5] 依赖 [Task 1], [Task 2], [Task 3], [Task 4]
