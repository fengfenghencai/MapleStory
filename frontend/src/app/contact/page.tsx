'use client'

import { useState } from 'react'
import { Metadata } from 'next'
import { AnimateIn } from '@/components/AnimateIn'
import {
  Mail,
  Github,
  Twitter,
  Linkedin,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'

// 联系方式配置
const contactInfo = [
  {
    name: 'Email',
    value: 'ltfguardhzt@qq.com',
    href: 'mailto:hello@example.com',
    icon: Mail,
  },
  {
    name: 'GitHub',
    value: 'github.com/fengfenghencai',
    href: 'https://github.com/fengfenghencai',
    icon: Github,
  },
  {
    name: 'Twitter',
    value: '@Xiaoff',
    href: 'https://twitter.com',
    icon: Twitter,
  },
  // {
  //   name: 'LinkedIn',
  //   value: 'linkedin.com/in/username',
  //   href: 'https://linkedin.com',
  //   icon: Linkedin,
  // },
]

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    // 模拟表单提交（实际项目中替换为 API 调用）
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setStatus('success')
      setFormState({ name: '', email: '', subject: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="container-main py-12 md:py-16">
      {/* 页面标题 */}
      <AnimateIn>
        <header className="mb-12">
          <h1 className="page-title">联系我</h1>
          <p className="page-description">
            如有合作意向或问题咨询，欢迎随时联系
          </p>
        </header>
      </AnimateIn>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* 联系方式 */}
        <AnimateIn variant="fadeInLeft" delay={0.1}>
          <div>
            <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-6">
              联系方式
            </h2>

            <div className="space-y-4">
              {contactInfo.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors group"
                >
                  <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {item.name}
                    </p>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {item.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* 位置信息 */}
            <div className="mt-8 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  位置
                </span>
              </div>
              <p className="text-neutral-900 dark:text-neutral-100">
                中国 · 北京
              </p>
            </div>
          </div>
        </AnimateIn>

        {/* 联系表单 */}
        <AnimateIn variant="fadeInRight" delay={0.2}>
          <div>
            <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-6">
              发送消息
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 姓名 */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                >
                  姓名
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="请输入您的姓名"
                />
              </div>

              {/* 邮箱 */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                >
                  邮箱
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="请输入您的邮箱"
                />
              </div>

              {/* 主题 */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                >
                  主题
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formState.subject}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="请输入消息主题"
                />
              </div>

              {/* 消息内容 */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                >
                  消息内容
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="input resize-none"
                  placeholder="请输入您想说的内容..."
                />
              </div>

              {/* 提交按钮 */}
              <motion.button
                type="submit"
                disabled={status === 'loading'}
                className="btn-primary w-full gap-2"
                whileTap={{ scale: 0.98 }}
              >
                {status === 'loading' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    发送中...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    发送消息
                  </>
                )}
              </motion.button>

              {/* 状态提示 */}
              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>消息已发送成功！我会尽快回复您。</span>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>发送失败，请稍后重试或直接发送邮件联系。</span>
                </motion.div>
              )}
            </form>
          </div>
        </AnimateIn>
      </div>
    </div>
  )
}
