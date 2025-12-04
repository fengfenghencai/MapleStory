# Personal Website

一个基于 Next.js 14 + TailwindCSS + FastAPI 构建的极简风格个人网站。

## 预览

![Preview](preview.png)

## 特性

- 🎨 **极简设计**：黑白灰主色调，干净、通透、有质感
- 🌓 **深色模式**：支持浅色/深色主题切换，跟随系统偏好
- 📱 **响应式**：完美适配手机和桌面设备
- ✨ **动画效果**：基于 Framer Motion 的轻量优雅动画
- 📝 **Markdown 博客**：支持 Markdown 文章，带有 frontmatter
- 🔍 **SEO 优化**：完善的元数据和 Open Graph 支持
- 🚀 **高性能**：基于 Next.js App Router 和 Server Components

## 技术栈

### 前端

- **[Next.js 14](https://nextjs.org/)** - React 框架，App Router
- **[TypeScript](https://www.typescriptlang.org/)** - 类型安全
- **[TailwindCSS](https://tailwindcss.com/)** - 原子化 CSS 框架
- **[Framer Motion](https://www.framer.com/motion/)** - 动画库
- **[next-themes](https://github.com/pacocoursey/next-themes)** - 主题管理
- **[Lucide React](https://lucide.dev/)** - 图标库

### 后端

- **[FastAPI](https://fastapi.tiangolo.com/)** - Python Web 框架
- **[httpx](https://www.python-httpx.org/)** - 异步 HTTP 客户端

## 项目结构

```
MapleStory/
├── frontend/                   # Next.js 前端
│   ├── src/
│   │   ├── app/               # App Router 页面
│   │   │   ├── page.tsx       # 首页
│   │   │   ├── blog/          # 博客
│   │   │   ├── projects/      # 项目
│   │   │   ├── tools/         # 工具
│   │   │   └── contact/       # 联系
│   │   ├── components/        # React 组件
│   │   │   ├── Navbar.tsx     # 导航栏
│   │   │   ├── Footer.tsx     # 页脚
│   │   │   ├── ThemeToggle.tsx# 主题切换
│   │   │   └── AnimateIn.tsx  # 动画组件
│   │   ├── lib/               # 工具函数
│   │   │   └── blog.ts        # 博客处理
│   │   └── styles/            # 样式文件
│   ├── content/               # 内容
│   │   └── blog/              # 博客 Markdown 文件
│   ├── public/                # 静态资源
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.js
│
├── backend/                   # FastAPI 后端
│   ├── main.py               # 主应用
│   └── requirements.txt      # Python 依赖
│
└── README.md
```

## 快速开始

### 前提条件

- Node.js 18+
- Python 3.10+
- pnpm / npm / yarn

### 前端启动

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install
# 或
pnpm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 后端启动

```bash
# 进入后端目录
cd backend

# 创建虚拟环境（推荐）
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
.\venv\Scripts\activate   # Windows

# 安装依赖
pip install -r requirements.txt

# 启动服务器
python main.py
```

访问 http://localhost:8000/docs 查看 API 文档

## 配置说明

### 自定义个人信息

1. 修改 `frontend/src/app/layout.tsx` 中的 metadata
2. 修改 `frontend/src/components/Footer.tsx` 中的社交链接
3. 修改 `frontend/src/app/page.tsx` 中的个人介绍

### 添加博客文章

在 `frontend/content/blog/` 目录下创建 `.md` 文件：

```markdown
---
title: 文章标题
date: 2024-01-01
description: 文章描述
tags:
  - 标签1
  - 标签2
---

文章内容...
```

### 配置 GitHub API

修改 `backend/main.py` 中的 `GITHUB_USERNAME`：

```python
GITHUB_USERNAME = "your-username"
```

## 深色模式实现

使用 `next-themes` 库实现深色模式：

1. **配置 TailwindCSS**：`darkMode: 'class'`
2. **包装 ThemeProvider**：支持系统偏好检测
3. **使用 `dark:` 变体**：定义深色样式

```tsx
// 示例
<div className="bg-white dark:bg-neutral-900">
  <p className="text-gray-800 dark:text-gray-200">
    Hello World
  </p>
</div>
```

## 动画效果

基于 Framer Motion 实现轻量动画：

```tsx
import { AnimateIn } from '@/components/AnimateIn'

// 淡入向上
<AnimateIn variant="fadeInUp" delay={0.1}>
  <div>内容</div>
</AnimateIn>

// 交错动画
<StaggerContainer>
  {items.map(item => (
    <StaggerItem key={item.id}>
      <Card />
    </StaggerItem>
  ))}
</StaggerContainer>
```

## 部署

### Vercel（推荐）

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com/) 中导入项目
3. 选择 `frontend` 目录作为根目录
4. 点击 Deploy

### 手动部署

```bash
# 构建前端
cd frontend
npm run build

# 启动生产服务器
npm start
```

### 后端部署

推荐使用 Docker 或云服务（如 Railway、Fly.io）部署 FastAPI 后端。

```bash
# 使用 uvicorn 启动
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 设计说明

本项目设计理念参考 [siyuan.ink](https://siyuan.ink/)：

- **极简风格**：去除冗余装饰，聚焦内容本身
- **留白空间**：充足的 padding 和 margin，营造呼吸感
- **克制配色**：黑白灰为主，仅用少量蓝紫作为点缀
- **优雅字体**：Inter + Noto Sans SC，清晰可读
- **流畅动画**：淡入、滑动等轻量动效，不喧宾夺主

## License

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
