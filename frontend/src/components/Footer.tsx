'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Github, Twitter, Mail, Rss, Heart } from 'lucide-react'

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
  {
    name: 'RSS',
    href: '/rss.xml',
    icon: Rss,
  },
]

// 页脚链接配置
const footerLinks = [
  {
    title: '探索',
    links: [
      { label: '博客', href: '/blog' },
      { label: '项目', href: '/projects' },
      { label: '生活', href: '/life' },
    ],
  },
  {
    title: '关于',
    links: [
      { label: '联系我', href: '/contact' },
      { label: '友情链接', href: '/friends' },
    ],
  },
]

/**
 * 页脚组件
 * 简洁风格，包含logo、导航链接、社交链接和版权信息
 */
export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 品牌区域 */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Image
                src="/img.png"
                alt="枫叶物语"
                width={40}
                height={40}
                className="rounded"
              />
              <span className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                枫叶物语
              </span>
            </Link>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm mb-6">
              分享有趣的工具，记录生活点滴。
              <br />
              Sharing interesting tools and documenting life.
            </p>

            {/* 社交链接 */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* 链接区域 */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 版权信息 */}
        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              © {currentYear} 枫叶物语 · Made with
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              by LiuFeng
            </p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              别有一番枫味
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
