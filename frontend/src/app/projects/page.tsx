import { Metadata } from 'next'
import { AnimateIn, StaggerContainer, StaggerItem } from '@/components/AnimateIn'
import { ExternalLink, Github, Star, GitFork } from 'lucide-react'

export const metadata: Metadata = {
  title: '项目',
  description: '我的开源项目和作品集',
}

// 项目数据（示例数据，后续可接入 GitHub API）
const projects = [
  {
    name: 'Personal Website',
    description: '基于 Next.js 14 和 TailwindCSS 构建的个人网站，支持深色模式和响应式设计。',
    tags: ['Next.js', 'TypeScript', 'TailwindCSS'],
    github: 'https://github.com/username/personal-website',
    demo: 'https://example.com',
    stars: 128,
    forks: 32,
    featured: true,
  },
  {
    name: 'API Gateway',
    description: '高性能 API 网关，支持限流、熔断、负载均衡等功能。使用 Go 语言开发。',
    tags: ['Go', 'API Gateway', 'Microservices'],
    github: 'https://github.com/username/api-gateway',
    stars: 256,
    forks: 48,
    featured: true,
  },
  {
    name: 'CLI Tool',
    description: '命令行工具集，包含文件处理、文本转换、系统监控等实用功能。',
    tags: ['Python', 'CLI', 'Automation'],
    github: 'https://github.com/username/cli-tool',
    stars: 89,
    forks: 15,
    featured: false,
  },
  {
    name: 'Blog Engine',
    description: '轻量级博客引擎，支持 Markdown、代码高亮、SEO 优化等功能。',
    tags: ['Node.js', 'Markdown', 'SSG'],
    github: 'https://github.com/username/blog-engine',
    demo: 'https://blog-demo.example.com',
    stars: 167,
    forks: 28,
    featured: false,
  },
  {
    name: 'Data Visualization',
    description: '数据可视化库，提供多种图表类型，支持响应式和交互动画。',
    tags: ['React', 'D3.js', 'Data Viz'],
    github: 'https://github.com/username/data-viz',
    demo: 'https://dataviz.example.com',
    stars: 203,
    forks: 41,
    featured: true,
  },
  {
    name: 'Auth Service',
    description: '身份认证服务，支持 OAuth2.0、JWT、多因素认证等多种认证方式。',
    tags: ['Python', 'FastAPI', 'Security'],
    github: 'https://github.com/username/auth-service',
    stars: 145,
    forks: 22,
    featured: false,
  },
]

export default function ProjectsPage() {
  const featuredProjects = projects.filter((p) => p.featured)
  const otherProjects = projects.filter((p) => !p.featured)

  return (
    <div className="container-main py-12 md:py-16">
      {/* 页面标题 */}
      <AnimateIn>
        <header className="mb-12">
          <h1 className="page-title">项目</h1>
          <p className="page-description">
            我的开源项目和作品集，涵盖 Web 开发、工具库和系统设计
          </p>
        </header>
      </AnimateIn>

      {/* 精选项目 */}
      {featuredProjects.length > 0 && (
        <section className="mb-16">
          <AnimateIn>
            <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-6">
              精选项目
            </h2>
          </AnimateIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredProjects.map((project) => (
              <StaggerItem key={project.name}>
                <ProjectCard project={project} featured />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}

      {/* 其他项目 */}
      {otherProjects.length > 0 && (
        <section>
          <AnimateIn>
            <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-6">
              更多项目
            </h2>
          </AnimateIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherProjects.map((project) => (
              <StaggerItem key={project.name}>
                <ProjectCard project={project} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}

      {/* GitHub 链接 */}
      <AnimateIn delay={0.3}>
        <div className="mt-16 text-center">
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            查看更多项目
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary gap-2"
          >
            <Github className="w-4 h-4" />
            访问 GitHub
          </a>
        </div>
      </AnimateIn>
    </div>
  )
}

// 项目卡片组件
interface ProjectCardProps {
  project: (typeof projects)[0]
  featured?: boolean
}

function ProjectCard({ project, featured = false }: ProjectCardProps) {
  return (
    <div
      className={`card p-6 h-full flex flex-col ${
        featured ? 'md:p-8' : ''
      }`}
    >
      {/* 标题和链接 */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3
          className={`font-semibold text-neutral-900 dark:text-neutral-100 ${
            featured ? 'text-xl' : 'text-lg'
          }`}
        >
          {project.name}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Demo"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* 描述 */}
      <p
        className={`text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4 flex-grow ${
          featured ? 'text-base' : 'text-sm'
        }`}
      >
        {project.description}
      </p>

      {/* 标签 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {project.tags.map((tag) => (
          <span key={tag} className="tag text-xs">
            {tag}
          </span>
        ))}
      </div>

      {/* 统计 */}
      <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
        <span className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5" />
          {project.stars}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="w-3.5 h-3.5" />
          {project.forks}
        </span>
      </div>
    </div>
  )
}
