'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Lock, LogOut, Plus, Edit2, Trash2, Image,
  Save, X, Eye, Upload, FileText, Calendar
} from 'lucide-react'

// API 基础地址
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Article {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  content?: string
  cover?: string
}

interface ArticleImage {
  filename: string
  url: string
}

export default function BlogAdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [inputApiKey, setInputApiKey] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(true)

  // 文章管理状态
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // 编辑表单状态
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    description: '',
    tags: '',
    content: '',
    cover: ''
  })

  // 图片管理状态
  const [images, setImages] = useState<ArticleImage[]>([])
  const [showImageManager, setShowImageManager] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // 消息提示
  const [message, setMessage] = useState({ type: '', text: '' })

  // 检查登录状态
  useEffect(() => {
    const savedApiKey = localStorage.getItem('blog_admin_api_key')
    if (savedApiKey) {
      setApiKey(savedApiKey)
      verifyApiKey(savedApiKey)
    } else {
      setLoading(false)
    }
  }, [])

  // 验证 API Key
  const verifyApiKey = async (key: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/blog/articles`, {
        headers: { 'X-API-Key': key }
      })
      if (response.ok) {
        setApiKey(key)
        setIsAuthenticated(true)
        localStorage.setItem('blog_admin_api_key', key)
        const data = await response.json()
        setArticles(data)
      } else {
        localStorage.removeItem('blog_admin_api_key')
        setIsAuthenticated(false)
        setLoginError('API Key 无效')
      }
    } catch {
      setLoginError('无法连接到服务器')
    } finally {
      setLoading(false)
    }
  }

  // 登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoading(true)
    await verifyApiKey(inputApiKey)
  }

  // 登出
  const handleLogout = () => {
    localStorage.removeItem('blog_admin_api_key')
    setIsAuthenticated(false)
    setApiKey('')
    setInputApiKey('')
  }

  // 显示消息
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  // 加载文章列表
  const loadArticles = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/blog/articles`, {
        headers: { 'X-API-Key': apiKey }
      })
      if (response.ok) {
        const data = await response.json()
        setArticles(data)
      }
    } catch {
      showMessage('error', '加载文章失败')
    }
  }

  // 加载单篇文章
  const loadArticle = async (slug: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/blog/articles/${slug}`, {
        headers: { 'X-API-Key': apiKey }
      })
      if (response.ok) {
        const data = await response.json()
        setSelectedArticle(data)
        setFormData({
          slug: data.slug,
          title: data.title,
          description: data.description,
          tags: data.tags.join(', '),
          content: data.content,
          cover: data.cover || ''
        })
        // 加载文章图片
        loadArticleImages(slug)
      }
    } catch {
      showMessage('error', '加载文章失败')
    }
  }

  // 加载文章图片
  const loadArticleImages = async (slug: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/blog/articles/${slug}/images`, {
        headers: { 'X-API-Key': apiKey }
      })
      if (response.ok) {
        const data = await response.json()
        setImages(data.images || [])
      }
    } catch {
      console.error('加载图片失败')
    }
  }

  // 创建文章
  const handleCreate = async () => {
    if (!formData.slug || !formData.title) {
      showMessage('error', '请填写文章标识和标题')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/api/blog/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({
          slug: formData.slug,
          title: formData.title,
          description: formData.description,
          tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
          content: formData.content,
          cover: formData.cover || null
        })
      })

      if (response.ok) {
        showMessage('success', '文章创建成功')
        setIsCreating(false)
        resetForm()
        loadArticles()
      } else {
        const error = await response.json()
        showMessage('error', error.detail || '创建失败')
      }
    } catch {
      showMessage('error', '创建文章失败')
    }
  }

  // 更新文章
  const handleUpdate = async () => {
    if (!selectedArticle) return

    try {
      const response = await fetch(`${API_BASE}/api/blog/articles/${selectedArticle.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
          content: formData.content,
          cover: formData.cover || null
        })
      })

      if (response.ok) {
        showMessage('success', '文章更新成功')
        setIsEditing(false)
        loadArticles()
      } else {
        showMessage('error', '更新失败')
      }
    } catch {
      showMessage('error', '更新文章失败')
    }
  }

  // 删除文章
  const handleDelete = async (slug: string) => {
    if (!confirm(`确定要删除文章 "${slug}" 吗？此操作不可恢复。`)) return

    try {
      const response = await fetch(`${API_BASE}/api/blog/articles/${slug}`, {
        method: 'DELETE',
        headers: { 'X-API-Key': apiKey }
      })

      if (response.ok) {
        showMessage('success', '文章已删除')
        if (selectedArticle?.slug === slug) {
          setSelectedArticle(null)
          setIsEditing(false)
        }
        loadArticles()
      } else {
        showMessage('error', '删除失败')
      }
    } catch {
      showMessage('error', '删除文章失败')
    }
  }

  // 上传图片
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedArticle) return

    setUploadingImage(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_BASE}/api/blog/articles/${selectedArticle.slug}/images`, {
        method: 'POST',
        headers: { 'X-API-Key': apiKey },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        showMessage('success', '图片上传成功')
        loadArticleImages(selectedArticle.slug)
        // 复制 Markdown 到剪贴板
        navigator.clipboard.writeText(data.markdown)
        showMessage('success', '图片链接已复制到剪贴板')
      } else {
        showMessage('error', '上传失败')
      }
    } catch {
      showMessage('error', '上传图片失败')
    } finally {
      setUploadingImage(false)
    }
  }

  // 删除图片
  const handleImageDelete = async (filename: string) => {
    if (!selectedArticle || !confirm(`确定要删除图片 "${filename}" 吗？`)) return

    try {
      const response = await fetch(
        `${API_BASE}/api/blog/articles/${selectedArticle.slug}/images/${filename}`,
        {
          method: 'DELETE',
          headers: { 'X-API-Key': apiKey }
        }
      )

      if (response.ok) {
        showMessage('success', '图片已删除')
        loadArticleImages(selectedArticle.slug)
      } else {
        showMessage('error', '删除失败')
      }
    } catch {
      showMessage('error', '删除图片失败')
    }
  }

  // 重置表单
  const resetForm = () => {
    setFormData({
      slug: '',
      title: '',
      description: '',
      tags: '',
      content: '',
      cover: ''
    })
    setSelectedArticle(null)
    setImages([])
  }

  // 开始创建新文章
  const startCreate = () => {
    resetForm()
    setIsCreating(true)
    setIsEditing(false)
  }

  // 开始编辑文章
  const startEdit = (article: Article) => {
    loadArticle(article.slug)
    setIsEditing(true)
    setIsCreating(false)
  }

  // 取消编辑
  const cancelEdit = () => {
    resetForm()
    setIsEditing(false)
    setIsCreating(false)
  }

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-neutral-500">加载中...</div>
      </div>
    )
  }

  // 登录页面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-neutral-600 dark:text-neutral-400" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                博客管理后台
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                请输入 API Key 进行验证
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <input
                  type="password"
                  value={inputApiKey}
                  onChange={(e) => setInputApiKey(e.target.value)}
                  placeholder="输入 API Key"
                  className="input"
                  required
                />
              </div>

              {loginError && (
                <div className="mb-4 text-sm text-red-500 text-center">
                  {loginError}
                </div>
              )}

              <button type="submit" className="btn-primary w-full">
                验证登录
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // 管理面板
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* 消息提示 */}
      {message.text && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
          message.type === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          {message.text}
        </div>
      )}

      {/* 头部 */}
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              博客管理后台
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={startCreate}
                className="btn-primary gap-2"
              >
                <Plus className="w-4 h-4" />
                新建文章
              </button>
              <button
                onClick={handleLogout}
                className="btn-ghost gap-2 text-red-500 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
                退出
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 文章列表 */}
          <div className="lg:col-span-1">
            <div className="card p-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                文章列表 ({articles.length})
              </h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {articles.map((article) => (
                  <div
                    key={article.slug}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedArticle?.slug === article.slug
                        ? 'bg-primary-100 dark:bg-primary-900/30'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                    onClick={() => startEdit(article)}
                  >
                    <div className="font-medium text-neutral-900 dark:text-neutral-100 text-sm truncate">
                      {article.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                      <Calendar className="w-3 h-3" />
                      {article.date}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {article.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="tag-primary text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {articles.length === 0 && (
                  <div className="text-center py-8 text-neutral-500">
                    暂无文章
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 编辑区域 */}
          <div className="lg:col-span-2">
            {(isEditing || isCreating) ? (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {isCreating ? '新建文章' : '编辑文章'}
                  </h2>
                  <div className="flex items-center gap-2">
                    {isEditing && selectedArticle && (
                      <>
                        <button
                          onClick={() => setShowImageManager(!showImageManager)}
                          className="btn-secondary gap-2"
                        >
                          <Image className="w-4 h-4" />
                          图片管理
                        </button>
                        <button
                          onClick={() => handleDelete(selectedArticle.slug)}
                          className="btn-ghost text-red-500 hover:text-red-600 gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          删除
                        </button>
                      </>
                    )}
                    <button onClick={cancelEdit} className="btn-ghost gap-2">
                      <X className="w-4 h-4" />
                      取消
                    </button>
                  </div>
                </div>

                {/* 图片管理器 */}
                {showImageManager && selectedArticle && (
                  <div className="mb-6 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    <h3 className="text-sm font-medium mb-3">图片管理</h3>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {images.map((img) => (
                        <div key={img.filename} className="relative group">
                          <img
                            src={img.url}
                            alt={img.filename}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <button
                            onClick={() => handleImageDelete(img.filename)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`![${img.filename}](${img.url})`)
                              showMessage('success', '已复制')
                            }}
                            className="absolute bottom-1 left-1 right-1 text-xs bg-black/70 text-white py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            复制
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="btn-secondary gap-2 cursor-pointer inline-flex">
                      <Upload className="w-4 h-4" />
                      {uploadingImage ? '上传中...' : '上传图片'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                )}

                {/* 表单 */}
                <div className="space-y-4">
                  {isCreating && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        文章标识 (slug) *
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="my-article-slug"
                        className="input"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        用于URL，只能包含字母、数字和连字符
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      标题 *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="文章标题"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      描述
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="文章简短描述"
                      rows={2}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      标签
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="标签1, 标签2, 标签3"
                      className="input"
                    />
                    <p className="text-xs text-neutral-500 mt-1">多个标签用逗号分隔</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      封面图片URL (可选)
                    </label>
                    <input
                      type="text"
                      value={formData.cover}
                      onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                      placeholder="/images/blog/slug/cover.png"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      内容 (Markdown)
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="使用 Markdown 格式编写文章内容..."
                      rows={15}
                      className="input font-mono text-sm"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button onClick={cancelEdit} className="btn-secondary">
                      取消
                    </button>
                    <button
                      onClick={isCreating ? handleCreate : handleUpdate}
                      className="btn-primary gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {isCreating ? '创建文章' : '保存修改'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <FileText className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                  选择一篇文章进行编辑，或创建新文章
                </p>
                <button onClick={startCreate} className="btn-primary gap-2">
                  <Plus className="w-4 h-4" />
                  新建文章
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
