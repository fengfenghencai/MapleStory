'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Github, MapPin, Link as LinkIcon, Star, GitFork, Clock, RefreshCw, FileText, Layout, GitBranch, VideoOff, Image, Bot, MessageSquare } from 'lucide-react'

// 配置项
const MAX_RECENT_REPOS = 6
const API_BASE_URL = 'http://localhost:8000'

// 类型定义
interface UserInfo {
  login: string
  name: string | null
  avatar_url: string
  bio: string | null
  location: string | null
  blog: string | null
  public_repos: number
  followers: number
  following: number
  html_url: string
}

interface Repo {
  id: number
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  created_at: string
  updated_at: string
  pushed_at: string
  commit_count: number
}

interface GitHubData {
  user_info: UserInfo
  repos: Repo[]
  total_commits: number
  last_sync_time: string
}

// 预设主题色
const PRESET_COLORS = ['#0F52BA', '#8B0000', '#2E4E3A', '#4B0082', '#8B4513']

// 工具列表
const tools = [
  {
    name: 'PDF 工具',
    description: '在线 PDF 编辑、合并、压缩、转换',
    icon: FileText,
    href: 'https://www.ilovepdf.com/zh-cn',
    external: true,
  },
  {
    name: '网页缩略图',
    description: '多设备网页响应式预览工具',
    icon: Layout,
    href: '/tools/responsive',
    external: false,
  },
  {
    name: '流程图绘制',
    description: '在线绘制流程图、架构图',
    icon: GitBranch,
    href: 'https://app.diagrams.net/',
    external: true,
  },
  {
    name: '视频去背景',
    description: '自动去除视频背景',
    icon: VideoOff,
    href: 'https://www.unscreen.com/',
    external: true,
  },
  {
    name: '图像处理',
    description: '在线图片编辑、压缩、格式转换',
    icon: Image,
    href: 'https://www.iloveimg.com/zh-cn',
    external: true,
  },
  {
    name: 'DeepSeek',
    description: 'DeepSeek AI 对话助手',
    icon: Bot,
    href: 'https://chat.deepseek.com/',
    external: true,
  },
  {
    name: 'ChatGPT',
    description: 'OpenAI ChatGPT 对话助手',
    icon: MessageSquare,
    href: 'https://chatgpt.com/',
    external: true,
  },
]

export default function ProjectsPage() {
  const [githubData, setGithubData] = useState<GitHubData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [currentColor, setCurrentColor] = useState('#8B0000')

  // 获取 GitHub 数据（从后端数据库）
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setErrorMsg('')

      try {
        const response = await fetch(`${API_BASE_URL}/api/github/data`)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || `请求失败: ${response.status}`)
        }
        const data: GitHubData = await response.json()
        setGithubData(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : '未知错误'
        if (message.includes('数据库中无') || message.includes('暂无有效同步')) {
          setErrorMsg('GitHub 数据正在同步中，请稍后刷新页面...')
        } else {
          setErrorMsg(`获取数据失败: ${message}`)
        }
        console.error('GitHub 数据请求错误:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // 计算统计数据
  const totalStars = useMemo(() => {
    if (!githubData?.repos) return 0
    return githubData.repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)
  }, [githubData?.repos])

  const totalForks = useMemo(() => {
    if (!githubData?.repos) return 0
    return githubData.repos.reduce((sum, repo) => sum + repo.forks_count, 0)
  }, [githubData?.repos])

  // 使用后端返回的 total_commits（从数据库获取，已精确计算）
  const totalCommits = githubData?.total_commits || 0

  // 最近活跃仓库（按推送时间排序）
  const recentRepos = useMemo(() => {
    if (!githubData?.repos) return []
    return [...githubData.repos]
      .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
      .slice(0, MAX_RECENT_REPOS)
  }, [githubData?.repos])

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\//g, '-')
  }

  const userInfo = githubData?.user_info

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      {/* 加载状态 */}
      {isLoading && (
        <div className="text-center py-10">
          <div className="inline-block w-10 h-10 border-4 border-neutral-200 dark:border-neutral-700 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-3 text-neutral-600 dark:text-neutral-300">加载 GitHub 数据中...</p>
        </div>
      )}

      {/* 错误提示 */}
      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
          <p>{errorMsg}</p>
        </div>
      )}

      {/* 内容区域 */}
      {!isLoading && !errorMsg && userInfo && (
        <>
          {/* 1. GitHub 用户基本信息区 */}
          <div className="mb-10 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm dark:shadow-neutral-900/50 transition-all duration-300">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* 头像 */}
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-neutral-100 dark:border-neutral-700">
                <img
                  src={userInfo.avatar_url}
                  alt={`${userInfo.login}的GitHub头像`}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* 基本信息 */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  {userInfo.name || userInfo.login}
                </h1>
                {userInfo.bio && (
                  <p className="text-neutral-600 dark:text-neutral-300 mb-4 max-w-2xl">
                    {userInfo.bio}
                  </p>
                )}
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                  <a
                    href={userInfo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Github className="w-4 h-4 mr-1" /> GitHub主页
                  </a>
                  {userInfo.location && (
                    <span className="flex items-center text-neutral-500 dark:text-neutral-400">
                      <MapPin className="w-4 h-4 mr-1" /> {userInfo.location}
                    </span>
                  )}
                  {userInfo.blog && (
                    <a
                      href={userInfo.blog.startsWith('http') ? userInfo.blog : `https://${userInfo.blog}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <LinkIcon className="w-4 h-4 mr-1" /> 个人网站
                    </a>
                  )}
                </div>
              </div>
            </div>
            {/* 数据同步时间 */}
            {githubData?.last_sync_time && (
              <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700 flex items-center justify-end text-xs text-neutral-400 dark:text-neutral-500">
                <RefreshCw className="w-3 h-3 mr-1" />
                数据更新于: {githubData.last_sync_time}
              </div>
            )}
          </div>

          {/* 2. 贡献日历及主题控制区 */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-2 sm:mb-0">
                GitHub 贡献日历
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      style={{ backgroundColor: color }}
                      className={`w-6 h-6 rounded-full cursor-pointer transition-transform hover:scale-110 border border-neutral-200 dark:border-neutral-700 ${
                        currentColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                      }`}
                      title={color}
                      onClick={() => setCurrentColor(color)}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    className="w-8 h-8 p-0 border-0 cursor-pointer rounded"
                  />
                  <input
                    type="text"
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    className="w-24 px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                  />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm dark:shadow-neutral-900/50">
              <img
                src={`https://ghchart.rshah.org/${currentColor.replace('#', '')}/${userInfo.login}`}
                alt="GitHub贡献日历"
                className="w-full h-auto rounded dark:opacity-90"
              />
            </div>
          </div>

          {/* 3. 核心数据统计区 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">
              GitHub 数据统计
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-neutral-800 p-5 rounded-lg shadow-sm dark:shadow-neutral-900/50 text-center transition-all duration-300">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {userInfo.public_repos}
                </div>
                <div className="text-neutral-500 dark:text-neutral-400">总仓库数</div>
              </div>
              <div className="bg-white dark:bg-neutral-800 p-5 rounded-lg shadow-sm dark:shadow-neutral-900/50 text-center transition-all duration-300">
                <div className="text-4xl font-bold text-yellow-500 dark:text-yellow-400 mb-1">
                  {totalStars.toLocaleString()}
                </div>
                <div className="text-neutral-500 dark:text-neutral-400">累计星标</div>
              </div>
              <div className="bg-white dark:bg-neutral-800 p-5 rounded-lg shadow-sm dark:shadow-neutral-900/50 text-center transition-all duration-300">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {totalForks.toLocaleString()}
                </div>
                <div className="text-neutral-500 dark:text-neutral-400">累计分支</div>
              </div>
              <div className="bg-white dark:bg-neutral-800 p-5 rounded-lg shadow-sm dark:shadow-neutral-900/50 text-center transition-all duration-300">
                <div className="text-4xl font-bold text-orange-500 dark:text-orange-400 mb-1">
                  {totalCommits.toLocaleString()}
                </div>
                <div className="text-neutral-500 dark:text-neutral-400">总 Commit 数</div>
              </div>
            </div>
          </div>

          {/* 4. 最近活跃仓库 */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">
              最近活跃仓库
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="bg-white dark:bg-neutral-800 p-5 rounded-lg shadow-sm dark:shadow-neutral-900/50 hover:shadow-md dark:hover:shadow-neutral-700/30 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {repo.name}
                      </a>
                    </h3>
                    {repo.language && (
                      <span className="bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs px-2 py-1 rounded-full">
                        {repo.language}
                      </span>
                    )}
                  </div>
                  {repo.description && (
                    <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-3">
                      {repo.description}
                    </p>
                  )}
                  <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400 gap-4">
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1" /> {repo.stargazers_count}
                    </span>
                    <span className="flex items-center">
                      <GitFork className="w-4 h-4 mr-1" /> {repo.forks_count}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" /> {formatDate(repo.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 5. 实用工具 */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">
          实用工具
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon
            return tool.external ? (
              <a
                key={tool.name}
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-neutral-800 p-5 rounded-lg shadow-sm dark:shadow-neutral-900/50 hover:shadow-md dark:hover:shadow-neutral-700/30 transition-all duration-300 group flex items-start gap-4"
              >
                <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </a>
            ) : (
              <Link
                key={tool.name}
                href={tool.href}
                className="bg-white dark:bg-neutral-800 p-5 rounded-lg shadow-sm dark:shadow-neutral-900/50 hover:shadow-md dark:hover:shadow-neutral-700/30 transition-all duration-300 group flex items-start gap-4"
              >
                <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
