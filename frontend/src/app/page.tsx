'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Github, Twitter, Mail, ChevronDown, FileText, Folder, Wrench, Star, Layout, GitBranch, Image as ImageIcon, Bot } from 'lucide-react'

// API 配置
const API_BASE_URL = 'http://localhost:8000'

// 类型定义
interface Repo {
  id: number
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
}

interface GitHubData {
  user_info: {
    login: string
    html_url: string
  }
  repos: Repo[]
}

// 社交链接配置（GitHub 链接在组件中动态设置）
const staticSocialLinks = [
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

// 最新文章类型
interface LatestPost {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
}

// 推荐工具数据
const featuredTools = [
  {
    title: '网页缩略图',
    description: '多设备网页响应式预览',
    href: '/tools/responsive',
    icon: Layout,
  },
  {
    title: '流程图绘制',
    description: '在线绘制流程图、架构图',
    href: 'https://app.diagrams.net/',
    external: true,
    icon: GitBranch,
  },
  {
    title: '图像处理',
    description: '在线图片编辑、压缩',
    href: 'https://www.iloveimg.com/zh-cn',
    external: true,
    icon: ImageIcon,
  },
  {
    title: 'DeepSeek',
    description: 'AI 对话助手',
    href: 'https://chat.deepseek.com/',
    external: true,
    icon: Bot,
  },
]

export default function HomePage() {
  const [featuredRepos, setFeaturedRepos] = useState<Repo[]>([])
  const [githubUrl, setGithubUrl] = useState('https://github.com/fengfenghencai')
  const [isLoading, setIsLoading] = useState(true)
  const [latestPosts, setLatestPosts] = useState<LatestPost[]>([])
  const [postsLoading, setPostsLoading] = useState(true)

  // 获取最新文章
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/blog/latest?limit=3`)
        if (response.ok) {
          const data = await response.json()
          setLatestPosts(data)
        }
      } catch (err) {
        console.error('获取最新文章失败:', err)
      } finally {
        setPostsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // 获取 GitHub 数据（从后端数据库）
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/github/data`)
        if (response.ok) {
          const data: GitHubData = await response.json()
          // 按 stars 排序，取前3个作为精选项目
          const sortedRepos = [...data.repos]
            .sort((a: Repo, b: Repo) => b.stargazers_count - a.stargazers_count)
            .slice(0, 3)
          setFeaturedRepos(sortedRepos)
          // 设置 GitHub 主页链接
          if (data.user_info?.html_url) {
            setGithubUrl(data.user_info.html_url)
          }
        }
      } catch (err) {
        console.error('获取 GitHub 数据失败:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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
                {/* GitHub 链接（动态） */}
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all hover:scale-110"
                  aria-label="GitHub"
                >
                  <Github className="w-6 h-6" />
                </a>
                {/* 其他社交链接 */}
                {staticSocialLinks.map((social) => (
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
              {postsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-neutral-200 dark:border-neutral-700 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : latestPosts.length === 0 ? (
                <div className="text-center py-6 text-neutral-500 dark:text-neutral-400 text-sm">
                  暂无文章
                </div>
              ) : (
                <ul className="space-y-4">
                  {latestPosts.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="block group"
                      >
                        <p className="text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium">
                          {post.title}
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {new Date(post.date).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
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
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-neutral-200 dark:border-neutral-700 border-t-green-600 rounded-full animate-spin"></div>
                </div>
              ) : featuredRepos.length === 0 ? (
                <div className="text-center py-6 text-neutral-500 dark:text-neutral-400 text-sm">
                  数据同步中，请稍后...
                </div>
              ) : (
                <ul className="space-y-4">
                  {featuredRepos.map((repo) => (
                    <li key={repo.id}>
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-neutral-800 dark:text-neutral-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors font-medium">
                            {repo.name}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                            <Star className="w-3 h-3" />
                            {repo.stargazers_count}
                          </div>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                          {repo.description || '暂无描述'}
                        </p>
                        {repo.language && (
                          <span className="inline-block mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                            {repo.language}
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
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
              <ul className="space-y-3">
                {featuredTools.map((tool) => {
                  const Icon = tool.icon
                  const isExternal = 'external' in tool && tool.external

                  if (isExternal) {
                    return (
                      <li key={tool.title}>
                        <a
                          href={tool.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors group"
                        >
                          <Icon className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                              {tool.title}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                              {tool.description}
                            </p>
                          </div>
                        </a>
                      </li>
                    )
                  }

                  return (
                    <li key={tool.title}>
                      <Link
                        href={tool.href}
                        className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors group"
                      >
                        <Icon className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            {tool.title}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                            {tool.description}
                          </p>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
              <Link
                href="/projects"
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
