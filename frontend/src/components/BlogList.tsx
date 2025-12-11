'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { AnimateIn } from '@/components/AnimateIn'
import { Calendar, Clock, Tag, ChevronDown, ChevronRight } from 'lucide-react'

interface PostMeta {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  cover?: string
  readingTime?: string
}

interface BlogListProps {
  posts: PostMeta[]
  tags: string[]
}

// 按年份分组文章
function groupPostsByYear(posts: PostMeta[]): Record<string, PostMeta[]> {
  const grouped: Record<string, PostMeta[]> = {}

  posts.forEach((post) => {
    const year = new Date(post.date).getFullYear().toString()
    if (!grouped[year]) {
      grouped[year] = []
    }
    grouped[year].push(post)
  })

  return grouped
}

export default function BlogList({ posts, tags }: BlogListProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set())

  // 根据选中的标签筛选文章
  const filteredPosts = useMemo(() => {
    if (!selectedTag) return posts
    return posts.filter((post) =>
      post.tags.map((t) => t.toLowerCase()).includes(selectedTag.toLowerCase())
    )
  }, [posts, selectedTag])

  // 按年份分组
  const groupedPosts = useMemo(() => {
    return groupPostsByYear(filteredPosts)
  }, [filteredPosts])

  // 获取排序后的年份（从新到旧）
  const sortedYears = useMemo(() => {
    return Object.keys(groupedPosts).sort((a, b) => parseInt(b) - parseInt(a))
  }, [groupedPosts])

  // 当筛选条件变化时，自动展开所有年份
  useEffect(() => {
    setExpandedYears(new Set(sortedYears))
  }, [sortedYears])

  // 切换年份展开/折叠
  const toggleYear = (year: string) => {
    setExpandedYears((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(year)) {
        newSet.delete(year)
      } else {
        newSet.add(year)
      }
      return newSet
    })
  }

  // 处理标签点击
  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null)
    } else {
      setSelectedTag(tag)
    }
  }

  return (
    <>
      {/* 标签筛选 */}
      {tags.length > 0 && (
        <AnimateIn delay={0.1}>
          <div className="mb-8 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-neutral-500 dark:text-neutral-400 mr-2 py-1">
              标签：
            </span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`tag transition-colors ${
                !selectedTag
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              全部
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`tag transition-colors ${
                  selectedTag === tag
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </AnimateIn>
      )}

      {/* 筛选结果提示 */}
      {selectedTag && (
        <AnimateIn>
          <div className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
            当前筛选：<span className="tag-primary">{selectedTag}</span>
            <span className="ml-2">共 {filteredPosts.length} 篇文章</span>
          </div>
        </AnimateIn>
      )}

      {/* 按年份分组的文章列表 */}
      {sortedYears.length > 0 ? (
        <div className="space-y-8" key={selectedTag || 'all'}>
          {sortedYears.map((year) => (
            <div key={year} className="relative">
              {/* 年份标题 */}
              <button
                onClick={() => toggleYear(year)}
                className="flex items-center gap-2 mb-4 group cursor-pointer w-full text-left"
              >
                {expandedYears.has(year) ? (
                  <ChevronDown className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
                )}
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {year}
                </h2>
                <span className="text-sm text-neutral-400 dark:text-neutral-500">
                  ({groupedPosts[year].length} 篇)
                </span>
              </button>

              {/* 年份下的文章 */}
              {expandedYears.has(year) && (
                <div className="space-y-4 ml-7 border-l-2 border-neutral-200 dark:border-neutral-800 pl-4">
                  {groupedPosts[year].map((post) => (
                    <article key={post.slug} className="card p-5 group">
                      <Link href={`/blog/${post.slug}`} className="block">
                        {/* 标签 */}
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="tag-primary text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* 标题 */}
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2">
                          {post.title}
                        </h3>

                        {/* 描述 */}
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-3 line-clamp-2">
                          {post.description}
                        </p>

                        {/* 元信息 */}
                        <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(post.date).toLocaleDateString('zh-CN', {
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
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <AnimateIn>
          <div className="text-center py-16">
            <Tag className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400">
              {selectedTag ? `没有找到标签为"${selectedTag}"的文章` : '暂无文章，敬请期待...'}
            </p>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="mt-4 btn-secondary"
              >
                查看全部文章
              </button>
            )}
          </div>
        </AnimateIn>
      )}
    </>
  )
}
