import { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts, getAllTags } from '@/lib/blog'
import { AnimateIn, StaggerContainer, StaggerItem } from '@/components/AnimateIn'
import { Calendar, Clock, Tag } from 'lucide-react'

export const metadata: Metadata = {
  title: '博客',
  description: '技术博客 - 分享编程技术、开发经验和学习笔记',
}

export default function BlogPage() {
  const posts = getAllPosts()
  const tags = getAllTags()

  return (
    <div className="container-main py-12 md:py-16">
      {/* 页面标题 */}
      <AnimateIn>
        <header className="mb-12">
          <h1 className="page-title">博客</h1>
          <p className="page-description">
            分享技术文章、开发经验和学习笔记
          </p>
        </header>
      </AnimateIn>

      {/* 标签筛选 */}
      {tags.length > 0 && (
        <AnimateIn delay={0.1}>
          <div className="mb-8 flex flex-wrap gap-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400 mr-2 py-1">
              标签：
            </span>
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${tag}`}
                className="tag hover:tag-primary"
              >
                {tag}
              </Link>
            ))}
          </div>
        </AnimateIn>
      )}

      {/* 文章列表 */}
      {posts.length > 0 ? (
        <StaggerContainer className="space-y-6">
          {posts.map((post) => (
            <StaggerItem key={post.slug}>
              <article className="card p-6 group">
                <Link href={`/blog/${post.slug}`} className="block">
                  {/* 标签 */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="tag-primary text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 标题 */}
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2">
                    {post.title}
                  </h2>

                  {/* 描述 */}
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-4 line-clamp-2">
                    {post.description}
                  </p>

                  {/* 元信息 */}
                  <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.date).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readingTime}
                    </span>
                  </div>
                </Link>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <AnimateIn>
          <div className="text-center py-16">
            <Tag className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400">
              暂无文章，敬请期待...
            </p>
          </div>
        </AnimateIn>
      )}
    </div>
  )
}
