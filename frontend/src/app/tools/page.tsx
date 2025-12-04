import { Metadata } from 'next'
import { AnimateIn, StaggerContainer, StaggerItem } from '@/components/AnimateIn'
import {
  Palette,
  FileJson,
  Hash,
  Clock,
  QrCode,
  Regex,
  Calculator,
  Binary,
  Lock,
  Image,
  FileText,
  Link2,
} from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '工具',
  description: '在线开发工具集 - JSON 格式化、颜色转换、正则测试等实用工具',
}

// 工具列表（示例数据，后续可扩展）
const tools = [
  {
    name: 'JSON 格式化',
    description: '在线 JSON 格式化、压缩、校验工具',
    icon: FileJson,
    href: '/tools/json-formatter',
    category: '开发工具',
    available: true,
  },
  {
    name: '颜色转换',
    description: 'HEX、RGB、HSL 颜色格式互转，支持颜色选择器',
    icon: Palette,
    href: '/tools/color-converter',
    category: '设计工具',
    available: true,
  },
  {
    name: '正则测试',
    description: '在线正则表达式测试和调试工具',
    icon: Regex,
    href: '/tools/regex-tester',
    category: '开发工具',
    available: true,
  },
  {
    name: '时间戳转换',
    description: 'Unix 时间戳与日期时间格式互转',
    icon: Clock,
    href: '/tools/timestamp',
    category: '开发工具',
    available: true,
  },
  {
    name: 'Base64 编解码',
    description: 'Base64 编码和解码工具',
    icon: Binary,
    href: '/tools/base64',
    category: '编码工具',
    available: true,
  },
  {
    name: 'Hash 生成',
    description: 'MD5、SHA-1、SHA-256 等哈希值生成',
    icon: Hash,
    href: '/tools/hash-generator',
    category: '安全工具',
    available: true,
  },
  {
    name: '二维码生成',
    description: '在线二维码生成器，支持自定义样式',
    icon: QrCode,
    href: '/tools/qrcode',
    category: '实用工具',
    available: false,
  },
  {
    name: '密码生成',
    description: '安全随机密码生成器',
    icon: Lock,
    href: '/tools/password-generator',
    category: '安全工具',
    available: false,
  },
  {
    name: '进制转换',
    description: '二进制、八进制、十进制、十六进制互转',
    icon: Calculator,
    href: '/tools/number-converter',
    category: '开发工具',
    available: false,
  },
  {
    name: '图片压缩',
    description: '在线图片压缩工具，支持批量处理',
    icon: Image,
    href: '/tools/image-compress',
    category: '媒体工具',
    available: false,
  },
  {
    name: 'Markdown 预览',
    description: '实时 Markdown 编辑和预览',
    icon: FileText,
    href: '/tools/markdown-preview',
    category: '写作工具',
    available: false,
  },
  {
    name: 'URL 编解码',
    description: 'URL 编码和解码工具',
    icon: Link2,
    href: '/tools/url-encoder',
    category: '编码工具',
    available: false,
  },
]

// 按类别分组
const categories = Array.from(new Set(tools.map((t) => t.category)))

export default function ToolsPage() {
  return (
    <div className="container-main py-12 md:py-16">
      {/* 页面标题 */}
      <AnimateIn>
        <header className="mb-12">
          <h1 className="page-title">工具</h1>
          <p className="page-description">
            在线开发工具集，提升开发效率
          </p>
        </header>
      </AnimateIn>

      {/* 工具列表 */}
      {categories.map((category, categoryIndex) => {
        const categoryTools = tools.filter((t) => t.category === category)

        return (
          <section key={category} className="mb-12">
            <AnimateIn delay={categoryIndex * 0.1}>
              <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-6">
                {category}
              </h2>
            </AnimateIn>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTools.map((tool) => (
                <StaggerItem key={tool.name}>
                  <ToolCard tool={tool} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        )
      })}

      {/* 更多工具提示 */}
      <AnimateIn delay={0.3}>
        <div className="mt-8 text-center p-8 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-neutral-600 dark:text-neutral-400 mb-2">
            更多工具正在开发中...
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            如有工具需求建议，欢迎
            <Link
              href="/contact"
              className="text-primary-600 dark:text-primary-400 hover:underline ml-1"
            >
              联系我
            </Link>
          </p>
        </div>
      </AnimateIn>
    </div>
  )
}

// 工具卡片组件
interface ToolCardProps {
  tool: (typeof tools)[0]
}

function ToolCard({ tool }: ToolCardProps) {
  const Icon = tool.icon

  if (tool.available) {
    return (
      <Link
        href={tool.href}
        className="card p-5 flex items-start gap-4 group h-full"
      >
        <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1">
            {tool.name}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
            {tool.description}
          </p>
        </div>
      </Link>
    )
  }

  return (
    <div className="card p-5 flex items-start gap-4 opacity-60 cursor-not-allowed h-full">
      <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-neutral-500 dark:text-neutral-500">
            {tool.name}
          </h3>
          <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-500">
            开发中
          </span>
        </div>
        <p className="text-sm text-neutral-400 dark:text-neutral-600 line-clamp-2">
          {tool.description}
        </p>
      </div>
    </div>
  )
}
