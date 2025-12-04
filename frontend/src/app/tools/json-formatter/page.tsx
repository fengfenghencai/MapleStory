'use client'

import { useState } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { AnimateIn } from '@/components/AnimateIn'
import {
  ArrowLeft,
  Copy,
  Check,
  Trash2,
  Minimize2,
  Maximize2,
  AlertCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function JsonFormatterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [indentSize, setIndentSize] = useState(2)

  // 格式化 JSON
  const formatJson = () => {
    if (!input.trim()) {
      setError('请输入 JSON 内容')
      setOutput('')
      return
    }

    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, indentSize)
      setOutput(formatted)
      setError('')
    } catch (e) {
      setError('JSON 格式错误: ' + (e as Error).message)
      setOutput('')
    }
  }

  // 压缩 JSON
  const minifyJson = () => {
    if (!input.trim()) {
      setError('请输入 JSON 内容')
      setOutput('')
      return
    }

    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      setError('')
    } catch (e) {
      setError('JSON 格式错误: ' + (e as Error).message)
      setOutput('')
    }
  }

  // 复制到剪贴板
  const copyToClipboard = async () => {
    if (!output) return

    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('复制失败:', e)
    }
  }

  // 清空内容
  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  // 示例 JSON
  const loadExample = () => {
    const example = {
      name: 'Personal Website',
      version: '1.0.0',
      features: ['Dark Mode', 'Responsive', 'SEO'],
      author: {
        name: 'Liu Feng',
        email: 'hello@example.com',
      },
      dependencies: {
        react: '^18.3.1',
        next: '14.2.3',
      },
    }
    setInput(JSON.stringify(example))
    setOutput('')
    setError('')
  }

  return (
    <div className="container-main py-12 md:py-16">
      {/* 返回链接 */}
      <AnimateIn>
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          返回工具列表
        </Link>
      </AnimateIn>

      {/* 页面标题 */}
      <AnimateIn delay={0.1}>
        <header className="mb-8">
          <h1 className="page-title">JSON 格式化</h1>
          <p className="page-description">
            在线 JSON 格式化、压缩、校验工具
          </p>
        </header>
      </AnimateIn>

      {/* 工具栏 */}
      <AnimateIn delay={0.2}>
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button onClick={formatJson} className="btn-primary gap-2">
            <Maximize2 className="w-4 h-4" />
            格式化
          </button>
          <button onClick={minifyJson} className="btn-secondary gap-2">
            <Minimize2 className="w-4 h-4" />
            压缩
          </button>
          <button onClick={clearAll} className="btn-ghost gap-2">
            <Trash2 className="w-4 h-4" />
            清空
          </button>
          <button
            onClick={loadExample}
            className="btn-ghost text-sm"
          >
            加载示例
          </button>

          {/* 缩进选择 */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              缩进:
            </span>
            <select
              value={indentSize}
              onChange={(e) => setIndentSize(Number(e.target.value))}
              className="px-2 py-1 rounded-md text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            >
              <option value={2}>2 空格</option>
              <option value={4}>4 空格</option>
              <option value={1}>Tab</option>
            </select>
          </div>
        </div>
      </AnimateIn>

      {/* 编辑器区域 */}
      <AnimateIn delay={0.3}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 输入框 */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              输入 JSON
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"key": "value"}'
              className="w-full h-80 p-4 font-mono text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
              spellCheck={false}
            />
          </div>

          {/* 输出框 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                输出结果
              </label>
              {output && (
                <button
                  onClick={copyToClipboard}
                  className="btn-ghost text-xs gap-1.5 py-1 px-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-500" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      复制
                    </>
                  )}
                </button>
              )}
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="格式化结果将显示在这里"
              className="w-full h-80 p-4 font-mono text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none resize-none"
              spellCheck={false}
            />
          </div>
        </div>
      </AnimateIn>

      {/* 错误提示 */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}

      {/* 使用说明 */}
      <AnimateIn delay={0.4}>
        <div className="mt-12 p-6 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            使用说明
          </h2>
          <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            <li>• <strong>格式化</strong>：将压缩的 JSON 转换为易读的格式，带有缩进</li>
            <li>• <strong>压缩</strong>：移除所有空白字符，生成最小化的 JSON</li>
            <li>• <strong>校验</strong>：如果 JSON 格式错误，会显示具体的错误信息</li>
            <li>• 支持自定义缩进大小（2空格、4空格或Tab）</li>
            <li>• 数据仅在本地处理，不会上传到服务器</li>
          </ul>
        </div>
      </AnimateIn>
    </div>
  )
}
