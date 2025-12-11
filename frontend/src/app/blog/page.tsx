import { Metadata } from 'next'
import { getAllPosts, getAllTags } from '@/lib/blog'
import { AnimateIn } from '@/components/AnimateIn'
import BlogList from '@/components/BlogList'

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

      {/* 博客列表（含标签筛选和年份分组） */}
      <BlogList posts={posts} tags={tags} />
    </div>
  )
}
