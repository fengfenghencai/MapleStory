import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

// 博客文章目录
const postsDirectory = path.join(process.cwd(), 'content/blog')

// 博客文章元数据类型
export interface PostMeta {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  cover?: string
  readingTime?: string
}

// 完整博客文章类型
export interface Post extends PostMeta {
  content: string
}

/**
 * 获取所有博客文章的元数据
 */
export function getAllPosts(): PostMeta[] {
  // 确保目录存在
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      // 从文件名获取 slug
      const slug = fileName.replace(/\.md$/, '')

      // 读取 Markdown 文件
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')

      // 使用 gray-matter 解析 frontmatter
      const { data, content } = matter(fileContents)

      // 计算阅读时间（假设每分钟 200 字）
      const wordCount = content.length
      const readingTime = `${Math.ceil(wordCount / 200)} 分钟`

      return {
        slug,
        title: data.title || slug,
        date: data.date || new Date().toISOString(),
        description: data.description || '',
        tags: data.tags || [],
        cover: data.cover,
        readingTime,
      }
    })

  // 按日期排序（最新的在前）
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1))
}

/**
 * 获取所有文章的 slug（用于静态生成）
 */
export function getAllPostSlugs() {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => ({
      slug: fileName.replace(/\.md$/, ''),
    }))
}

/**
 * 根据 slug 获取单篇文章
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const fullPath = path.join(postsDirectory, `${slug}.md`)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  // 将 Markdown 转换为 HTML
  const processedContent = await remark().use(html).process(content)
  const contentHtml = processedContent.toString()

  // 计算阅读时间
  const wordCount = content.length
  const readingTime = `${Math.ceil(wordCount / 200)} 分钟`

  return {
    slug,
    title: data.title || slug,
    date: data.date || new Date().toISOString(),
    description: data.description || '',
    tags: data.tags || [],
    cover: data.cover,
    readingTime,
    content: contentHtml,
  }
}

/**
 * 获取所有标签
 */
export function getAllTags(): string[] {
  const posts = getAllPosts()
  const tagsSet = new Set<string>()

  posts.forEach((post) => {
    post.tags.forEach((tag) => tagsSet.add(tag))
  })

  return Array.from(tagsSet).sort()
}

/**
 * 根据标签获取文章
 */
export function getPostsByTag(tag: string): PostMeta[] {
  const posts = getAllPosts()
  return posts.filter((post) =>
    post.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
  )
}
