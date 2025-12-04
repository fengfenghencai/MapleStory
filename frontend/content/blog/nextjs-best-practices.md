---
title: Next.js 14 最佳实践指南
date: 2024-01-20
description: 深入探讨 Next.js 14 的新特性和最佳实践，包括 App Router、Server Components 和性能优化技巧。
tags:
  - Next.js
  - React
  - 前端开发
---

# Next.js 14 最佳实践指南

Next.js 14 带来了许多激动人心的新特性，本文将分享一些在实际项目中的最佳实践。

## App Router vs Pages Router

Next.js 14 推荐使用 App Router，它基于 React Server Components，提供了更好的性能和开发体验。

### 目录结构

```
src/
├── app/
│   ├── layout.tsx      # 根布局
│   ├── page.tsx        # 首页
│   ├── blog/
│   │   ├── page.tsx    # 博客列表
│   │   └── [slug]/
│   │       └── page.tsx # 博客详情
│   └── globals.css
├── components/
│   └── ...
└── lib/
    └── ...
```

## Server Components

默认情况下，App Router 中的组件都是 Server Components，这意味着它们在服务端渲染，不会增加客户端 JavaScript 体积。

```tsx
// app/blog/page.tsx - Server Component
async function BlogPage() {
  const posts = await getPosts() // 直接调用数据库

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

### 何时使用 Client Components？

当你需要：

- 使用 React hooks（useState, useEffect 等）
- 添加事件监听器（onClick, onChange 等）
- 使用浏览器 API
- 使用依赖状态的第三方库

```tsx
'use client'

import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  )
}
```

## 数据获取

### Server Components 中的数据获取

```tsx
async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 } // 缓存 1 小时
  })

  return <div>{/* render data */}</div>
}
```

### 使用 `generateStaticParams` 预生成页面

```tsx
export async function generateStaticParams() {
  const posts = await getPosts()

  return posts.map(post => ({
    slug: post.slug,
  }))
}
```

## 性能优化技巧

1. **使用 Image 组件**：自动优化图片
2. **代码分割**：使用动态导入
3. **字体优化**：使用 next/font
4. **预加载**：使用 Link 组件的 prefetch

```tsx
import Image from 'next/image'
import Link from 'next/link'

function MyComponent() {
  return (
    <>
      <Image
        src="/hero.jpg"
        alt="Hero"
        width={1200}
        height={600}
        priority // 首屏图片
      />
      <Link href="/about" prefetch>
        About
      </Link>
    </>
  )
}
```

## 总结

Next.js 14 的 App Router 提供了强大的功能和优秀的开发体验。合理使用 Server Components 和 Client Components，结合数据获取策略，可以构建出高性能的 Web 应用。
