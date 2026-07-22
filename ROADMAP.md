# 博客演进路线图

> 本文档记录博客从纯静态项目到全栈项目的演进规划，供未来开发参考。

---

## 当前状态（Phase 1 — 纯静态）

- **技术栈**：React 19 + Vite 6 + TypeScript + Tailwind CSS 4
- **部署方式**：静态站点（可部署到 Vercel / GitHub Pages / 任意静态托管）
- **文章存储**：Markdown 文件 + frontmatter（`src/posts/*.md`）
- **文章可见性**：通过 frontmatter 的 `published: false` 控制是否展示（Phase 1 实现）

### Phase 1 已实现的接口预留

在 `src/utils/markdown.ts` 中：

```ts
// PostFrontmatter 接口已预留 published 字段
export interface PostFrontmatter {
  title: string;
  title_en?: string;
  date: string;
  category: string;
  tags: string[];
  featured?: boolean;
  gem?: boolean;
  coverImage?: string;
  draft?: boolean;
}

// getAllPosts 函数签名预留了扩展空间
export function getAllPosts(includeDraft = false): Post[]
```

**关键设计决策**：`getAllPosts()` 是所有页面获取文章列表的统一入口。未来方案二的所有过滤逻辑都可以在这个函数中扩展，不需要修改任何页面组件。

---

## Phase 2 — 后端集成（未来规划）

当博客成长到需要更强大管理能力的阶段时，可以引入后端服务。

### 推荐技术栈

| 层 | 推荐 | 备选 |
|---|---|---|
| 框架 | Next.js (App Router) | Nuxt 3 (如果偏好 Vue) |
| API | Next.js API Routes | Express / Fastify / Cloudflare Workers |
| 数据库 | SQLite (本地) / Turso (云端) | Supabase / PlanetScale |
| 认证 | NextAuth.js | Clerk / 自建 JWT |
| 文件存储 | 本地文件系统 / S3 兼容 | Cloudflare R2 / 上传 OSS |
| 部署 | Vercel (Next.js 原生) | 自有服务器 / Docker |

### 迁移策略

从当前 React + Vite 迁移到 Next.js 的步骤：

1. **创建 Next.js 项目**，将 `src/` 下的组件和页面迁移过去
2. **Markdown → 数据库**：写一个迁移脚本，将所有 `.md` 文件的 frontmatter 导入数据库
3. **API Routes 替代 import.meta.glob**：`getAllPosts()` 从读取本地文件改为调用 API
4. **前端组件几乎不需要改**：因为 `getAllPosts()` 是统一入口，页面组件只依赖返回的 `Post[]` 类型

### Phase 2 功能规划

#### 2.1 文章管理面板

**优先级：⭐⭐⭐（核心功能）**

- **在线编辑器**：在网页上写文章、编辑文章，支持 Markdown 实时预览
  - 推荐使用 [Milkdown](https://milkdown.dev/) 或 [Tiptap](https://tiptap.dev/) 作为编辑器内核
  - 支持图片上传（拖拽 / 粘贴 / 选择文件）
  - 自动保存草稿

- **可见性开关**：每篇文章一个 toggle 开关，即时切换公开 / 私密
  - API 设计：
    ```ts
    PATCH /api/posts/:slug/visibility
    Body: { published: boolean }
    Response: { success: true, post: Post }
    ```
  - 作者模式下在文章列表中显示开关，普通用户看不到

- **批量操作**：
  - 批量公开 / 批量隐藏
  - 批量删除（移入回收站）
  - 批量修改分类 / 标签
  - API 设计：
    ```ts
    PATCH /api/posts/batch
    Body: { 
      action: 'publish' | 'unpublish' | 'delete' | 'update-category' | 'update-tags',
      slugs: string[],
      data?: { category?: string, tags?: string[] }
    }
    ```

- **定时发布**：
  - 设置发布时间，到达后自动公开
  - 需要 Cron Job（Vercel Cron / node-cron）
  - 数据库字段：`publishedAt: datetime | null`

- **草稿箱**：
  - 未完成的文章自动保存为草稿
  - 草稿列表独立展示，不占公开文章列表

- **版本历史**：
  - 每次保存自动创建版本快照
  - 支持查看历史版本、回滚

#### 2.2 评论系统

**优先级：⭐⭐⭐（核心功能）**

- **基础评论**：读者可以在文章下方发表评论
  - 数据库表设计：
    ```sql
    CREATE TABLE comments (
      id TEXT PRIMARY KEY,
      post_slug TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_email TEXT,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      parent_id TEXT,          -- 回复评论的 ID
      is_author_reply BOOLEAN DEFAULT FALSE,
      is_visible BOOLEAN DEFAULT TRUE
    );
    ```
  - API 设计：
    ```ts
    GET    /api/posts/:slug/comments     -- 获取评论列表（树形结构）
    POST   /api/posts/:slug/comments     -- 提交评论
    DELETE /api/comments/:id             -- 删除评论（需要认证）
    PATCH  /api/comments/:id             -- 管理员回复
    ```

- **反垃圾**：
  - 简单方案：Akismet API / 关键词过滤
  - 进阶方案：验证码 / 人工审核队列

- **通知**：
  - 有人回复你的评论时邮件通知（需要邮件发送服务，如 Resend）

#### 2.3 访问统计

**优先级：⭐⭐（重要但非紧急）**

- **文章浏览量**：
  - 每次访问文章时 +1（通过 API，不是前端计数器）
  - 数据库字段：`viewCount: number`
  - API：`POST /api/posts/:slug/view`

- **站点整体统计**：
  - 日 / 周 / 月 UV、PV
  - 热门文章排行
  - 访问来源分布
  - 设备 / 浏览器分布

- **管理面板可视化**：
  - 简单图表（可以用 Recharts / Chart.js）
  - 不需要太复杂，能看到趋势就行

#### 2.4 互动功能

**优先级：⭐⭐（增强用户粘性）**

- **点赞**：
  - 每篇文章可以点赞（同一用户只能点一次）
  - 用 Cookie / LocalStorage + IP 去重（轻量方案）
  - 进阶方案：需要登录才能点赞

- **收藏 / 书签**：
  - 用户可以收藏文章
  - 需要登录（Local Storage 方案只能本地保存）

- **分享**：
  - 分享到社交媒体（Twitter / 微博 / 微信）
  - 生成分享图片（OG Image）
  - 复制链接功能

#### 2.5 搜索功能

**优先级：⭐⭐（文章多了之后会需要）**

- **Phase 1 已有**：前端 JS 搜索（适合 < 100 篇文章）
- **Phase 2 升级**：后端全文检索
  - 简单方案：数据库 LIKE 查询 + 中文分词（jieba / nodejieba）
  - 进阶方案：Elasticsearch / Meilisearch / Typesense
  - API：
    ```ts
    GET /api/search?q=关键词&page=1&limit=10
    Response: { results: Post[], total: number, page: number }
    ```

#### 2.6 内容管理

**优先级：⭐（锦上添花）**

- **图片管理**：
  - 统一上传、压缩、生成多尺寸
  - 图片 CDN 分发
  - API：`POST /api/upload` → 返回图片 URL

- **友情链接管理**：
  - 在管理面板中添加 / 编辑 / 排序友链
  - 数据库表：
    ```sql
    CREATE TABLE friend_links (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      avatar TEXT,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE
    );
    ```

- **站点设置**：
  - 站点名称、描述、SEO 信息
  - 主题颜色自定义
  - 社交链接管理
  - 数据库表：
    ```sql
    CREATE TABLE site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    ```

- **RSS 订阅**：
  - 自动生成 RSS feed
  - API：`GET /api/rss.xml`

#### 2.7 通知系统

**优先级：⭐（锦上添花）**

- **邮件订阅**：
  - 读者输入邮箱订阅
  - 发新文章时自动发邮件通知
  - 需要邮件发送服务（推荐 [Resend](https://resend.com/)）

---

### API 路由规划（Phase 2 完整版）

```
# 文章
GET    /api/posts                    -- 获取文章列表（分页、筛选）
GET    /api/posts/:slug              -- 获取单篇文章
POST   /api/posts                    -- 创建文章（需要认证）
PUT    /api/posts/:slug              -- 更新文章（需要认证）
DELETE /api/posts/:slug              -- 删除文章（需要认证）
PATCH  /api/posts/:slug/visibility   -- 切换可见性（需要认证）
POST   /api/posts/:slug/view         -- 记录浏览（公开）
PATCH  /api/posts/batch              -- 批量操作（需要认证）

# 评论
GET    /api/posts/:slug/comments     -- 获取评论
POST   /api/posts/:slug/comments     -- 提交评论
DELETE /api/comments/:id             -- 删除评论（需要认证）

# 搜索
GET    /api/search                   -- 全文搜索

# 分类 & 标签
GET    /api/categories               -- 获取所有分类
GET    /api/tags                     -- 获取所有标签

# 用户 & 认证
POST   /api/auth/login               -- 登录
POST   /api/auth/logout              -- 登出
GET    /api/auth/me                  -- 获取当前用户信息

# 订阅
POST   /api/subscribe                -- 邮箱订阅
DELETE /api/subscribe                -- 取消订阅

# 站点
GET    /api/settings                 -- 获取站点设置（公开部分）
PUT    /api/settings                 -- 更新站点设置（需要认证）
GET    /api/friend-links             -- 获取友链
POST   /api/friend-links             -- 添加友链（需要认证）

# 文件
POST   /api/upload                   -- 上传文件（需要认证）

# RSS
GET    /api/rss.xml                  -- RSS feed
```

---

### 数据库 Schema 概览（Phase 2）

```sql
-- 文章表
CREATE TABLE posts (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_en TEXT,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT NOT NULL,
  tags TEXT,                  -- JSON array
  cover_image TEXT,
  featured BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT TRUE,
  published_at DATETIME,
  draft BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 评论表
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  post_slug TEXT NOT NULL REFERENCES posts(slug),
  author_name TEXT NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  parent_id TEXT REFERENCES comments(id),
  is_author_reply BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 友链表
CREATE TABLE friend_links (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  avatar TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- 站点设置表（KV 存储）
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 邮件订阅表
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- 管理员表
CREATE TABLE admins (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### 从 Phase 1 迁移到 Phase 2 的检查清单

- [ ] 创建 Next.js 项目，配置 TypeScript + Tailwind CSS
- [ ] 迁移 `src/components/` 下的所有 React 组件
- [ ] 迁移 `src/pages/` 下的页面为 Next.js 路由
- [ ] 迁移 `src/context/`、`src/hooks/`、`src/utils/`、`src/i18n/`
- [ ] 迁移 `src/index.css` 中的全局样式
- [ ] 将 `src/posts/*.md` 的 frontmatter 导入数据库
- [ ] 用 API Routes 替代 `import.meta.glob` 读取文章
- [ ] 确保 `getAllPosts()` 函数签名兼容（改为异步调用 API）
- [ ] 添加认证系统（NextAuth.js）
- [ ] 添加评论系统
- [ ] 添加访问统计
- [ ] 部署到 Vercel / 自有服务器
- [ ] 配置域名、HTTPS、CDN

---

## 备注

- Phase 1 的 `published` 字段在 frontmatter 中是 `boolean`，迁移到数据库时可以直接映射
- Phase 1 的文章排序（按日期降序）在 Phase 2 中保持不变
- 所有前端组件（PostCard、TableOfContents 等）不需要改动，因为它们只依赖 `Post` 类型的数据
- 国际化（i18n）系统保持不变，后端只负责数据，不涉及翻译
