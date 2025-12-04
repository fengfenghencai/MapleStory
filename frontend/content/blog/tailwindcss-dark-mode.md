---
title: TailwindCSS 深色模式最佳实践
date: 2024-01-25
description: 探讨如何在 TailwindCSS 项目中优雅地实现深色模式，包括配置、切换逻辑和设计技巧。
tags:
  - TailwindCSS
  - CSS
  - 前端开发
---

# TailwindCSS 深色模式最佳实践

深色模式（Dark Mode）已经成为现代网站的标配功能。本文将分享如何在 TailwindCSS 项目中优雅地实现深色模式。

## 基础配置

首先，在 `tailwind.config.ts` 中启用深色模式：

```typescript
// tailwind.config.ts
const config = {
  darkMode: 'class', // 使用 class 策略
  // ...
}
```

使用 `class` 策略意味着当 `<html>` 标签有 `dark` 类时启用深色模式：

```html
<html class="dark">
  <!-- 深色模式 -->
</html>
```

## 使用 next-themes

在 Next.js 项目中，推荐使用 `next-themes` 库来管理主题：

```tsx
// components/ThemeProvider.tsx
'use client'

import { ThemeProvider } from 'next-themes'

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      {children}
    </ThemeProvider>
  )
}
```

## 主题切换组件

```tsx
'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
    </button>
  )
}
```

## 设计技巧

### 1. 保持对比度

深色模式不只是简单地反转颜色，要确保文字和背景之间有足够的对比度。

```tsx
// 好的做法
<p className="text-gray-700 dark:text-gray-300">
  清晰可读的文字
</p>

// 避免
<p className="text-gray-400 dark:text-gray-600">
  对比度过低
</p>
```

### 2. 使用语义化颜色

定义语义化的颜色变量，而不是硬编码具体颜色：

```css
/* globals.css */
:root {
  --bg-primary: #ffffff;
  --text-primary: #1a1a1a;
}

.dark {
  --bg-primary: #0a0a0a;
  --text-primary: #fafafa;
}
```

### 3. 图片适配

某些图片在深色模式下可能需要调整：

```tsx
<img
  src="/logo.svg"
  className="dark:invert dark:brightness-90"
  alt="Logo"
/>
```

### 4. 阴影处理

深色模式下，阴影效果需要调整：

```tsx
<div className="shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50">
  卡片内容
</div>
```

## 过渡动画

为主题切换添加平滑的过渡效果：

```css
body {
  @apply transition-colors duration-300;
}
```

## 测试清单

- [ ] 文字在两种模式下都清晰可读
- [ ] 图片和图标在两种模式下都能正常显示
- [ ] 表单元素样式在两种模式下都一致
- [ ] 用户偏好能够正确保存

## 总结

实现一个好的深色模式需要关注细节，包括对比度、颜色语义化、图片适配等方面。使用 TailwindCSS 的 `dark:` 变体可以轻松实现大部分样式切换，配合 `next-themes` 库可以处理好主题持久化和系统偏好检测。
