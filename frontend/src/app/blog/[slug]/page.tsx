import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllPostSlugs, getPostBySlug } from '@/lib/blog'
import { AnimateIn } from '@/components/AnimateIn'
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react'

interface PageProps {
  params: { slug: string }
}

// 生成静态页面参数
export async function generateStaticParams() {
  const slugs = getAllPostSlugs()
  return slugs.map((item) => ({
    slug: item.slug,
  }))
}

// 生成页面元数据
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    return {
      title: '文章不存在',
    }
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="container-main py-12 md:py-16">
      {/* 返回链接 */}
      <AnimateIn>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          返回博客列表
        </Link>
      </AnimateIn>

      {/* 文章头部 */}
      <AnimateIn delay={0.1}>
        <header className="mb-10">
          {/* 标签 */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${tag}`}
                  className="tag-primary hover:bg-primary-200 dark:hover:bg-primary-800/50 transition-colors"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* 标题 */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-neutral-50 leading-tight mb-4">
            {post.title}
          </h1>

          {/* 描述 */}
          {post.description && (
            <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
              {post.description}
            </p>
          )}

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400 pb-6 border-b border-neutral-200 dark:border-neutral-800">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readingTime}
            </span>
          </div>
        </header>
      </AnimateIn>

      {/* 文章内容 */}
      <AnimateIn delay={0.2}>
        <article
          className="prose prose-neutral dark:prose-invert max-w-none
            prose-headings:font-semibold prose-headings:tracking-tight
            prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
            prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3
            prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2
            prose-h4:text-lg prose-h4:mt-4 prose-h4:mb-2
            prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-p:leading-7
            prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-neutral-900 dark:prose-strong:text-neutral-100
            prose-code:bg-neutral-100 dark:prose-code:bg-neutral-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-neutral-800 dark:prose-code:text-neutral-200
            prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-neutral-900 dark:prose-pre:bg-neutral-950 prose-pre:border prose-pre:border-neutral-700 dark:prose-pre:border-neutral-800
            [&_pre_code]:text-neutral-100 [&_pre_code]:bg-transparent
            prose-blockquote:border-l-primary-500 prose-blockquote:bg-neutral-50 dark:prose-blockquote:bg-neutral-900 prose-blockquote:py-1 prose-blockquote:px-4
            prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto
            prose-hr:border-neutral-200 dark:prose-hr:border-neutral-800
            prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4
            prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4
            prose-li:my-1 prose-li:text-neutral-700 dark:prose-li:text-neutral-300
            prose-table:border-collapse prose-table:w-full
            prose-th:border prose-th:border-neutral-300 dark:prose-th:border-neutral-700 prose-th:px-4 prose-th:py-2 prose-th:bg-neutral-100 dark:prose-th:bg-neutral-800
            prose-td:border prose-td:border-neutral-300 dark:prose-td:border-neutral-700 prose-td:px-4 prose-td:py-2"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </AnimateIn>

      {/* 文章底部 */}
      <AnimateIn delay={0.3}>
        <footer className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/blog"
              className="btn-secondary gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回博客列表
            </Link>

            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              感谢阅读！如有问题，欢迎
              <Link
                href="/contact"
                className="text-primary-600 dark:text-primary-400 hover:underline ml-1"
              >
                联系我
              </Link>
            </div>
          </div>
        </footer>
      </AnimateIn>
    </div>
  )
}
