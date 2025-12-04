'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Github, Twitter, Mail, ChevronDown, FileText, Folder, Wrench } from 'lucide-react'

// 社交链接配置
const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/fengfenghencai',
    icon: Github,
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com',
    icon: Twitter,
  },
  {
    name: 'Email',
    href: 'mailto:hello@example.com',
    icon: Mail,
  },
]

// 最新文章示例数据
const latestPosts = [
  { title: '如何搭建个人博客', date: '2024-01-15', slug: '/blog/how-to-build-blog' },
  { title: 'Next.js 14 新特性解析', date: '2024-01-10', slug: '/blog/nextjs-14' },
  { title: 'TailwindCSS 使用技巧', date: '2024-01-05', slug: '/blog/tailwindcss-tips' },
]

// 项目示例数据
const featuredProjects = [
  { title: '枫叶物语网站', description: '个人博客与工具集合', href: '/projects' },
  { title: 'JSON 格式化工具', description: '在线 JSON 美化工具', href: '/tools/json-formatter' },
]

// 工具示例数据
const featuredTool = {
  title: 'JSON 格式化工具',
  description: '快速格式化和验证 JSON 数据，支持压缩和美化',
  href: '/tools/json-formatter',
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - 全屏 */}
      <section className="min-h-screen flex flex-col items-center justify-center relative px-6">
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-center gap-12 md:gap-16">
            {/* 左侧文字内容 */}
            <div>
              {/* 问候语 */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-lg text-neutral-600 dark:text-neutral-400 mb-2"
              >
                Hi, I'm
              </motion.p>

              {/* 名字 */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-neutral-900 dark:text-neutral-50 mb-6"
              >
                LiuFeng
              </motion.h1>

              {/* Welcome */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-medium text-neutral-700 dark:text-neutral-300 mb-4"
              >
                Welcome to My Maple Story
              </motion.h2>

              {/* 描述语 */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg text-neutral-600 dark:text-neutral-400 mb-8"
              >
                Sharing interesting tools and documenting life.
              </motion.p>

              {/* 社交链接 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-center gap-4"
              >
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all hover:scale-110"
                    aria-label={social.name}
                  >
                    <social.icon className="w-6 h-6" />
                  </a>
                ))}
              </motion.div>
            </div>

            {/* 右侧图片 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:block flex-shrink-0"
            >
              <motion.div
                animate={{
                  y: [0, -12, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Image
                  src="/img.png"
                  alt="枫叶物语"
                  width={200}
                  height={200}
                  className="rounded-2xl shadow-2xl"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* 底部提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-12 left-0 right-0 flex flex-col items-center"
        >
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
            别有一番枫味
          </p>
          {/* 动态滚轮图标 */}
          <motion.div
            animate={{
              y: [0, 8, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <ChevronDown className="w-6 h-6 text-neutral-400 dark:text-neutral-500" />
          </motion.div>
        </motion.div>
      </section>

      {/* 三栏内容区 */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 最新文章 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  最新文章
                </h3>
              </div>
              <ul className="space-y-4">
                {latestPosts.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={post.slug}
                      className="block group"
                    >
                      <p className="text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium">
                        {post.title}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {post.date}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/blog"
                className="inline-block mt-6 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                查看全部 →
              </Link>
            </motion.div>

            {/* 精选项目 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Folder className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  精选项目
                </h3>
              </div>
              <ul className="space-y-4">
                {featuredProjects.map((project) => (
                  <li key={project.href}>
                    <Link
                      href={project.href}
                      className="block group"
                    >
                      <p className="text-neutral-800 dark:text-neutral-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors font-medium">
                        {project.title}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {project.description}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/projects"
                className="inline-block mt-6 text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                查看全部 →
              </Link>
            </motion.div>

            {/* 推荐工具 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Wrench className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  推荐工具
                </h3>
              </div>
              <Link
                href={featuredTool.href}
                className="block group"
              >
                <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 transition-colors">
                  <p className="text-neutral-800 dark:text-neutral-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors font-medium mb-2">
                    {featuredTool.title}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {featuredTool.description}
                  </p>
                </div>
              </Link>
              <Link
                href="/tools"
                className="inline-block mt-6 text-sm text-orange-600 dark:text-orange-400 hover:underline"
              >
                查看全部 →
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
