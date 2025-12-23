'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Lock, LogOut, Plus, Edit2, Trash2, Image,
  Save, X, Upload, Calendar, Star
} from 'lucide-react'

// API 基础地址
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface PhotoImage {
  id: number
  url: string
  is_cover: boolean
  order: number
}

interface Photo {
  id: number
  title: string
  description: string | null
  content: string | null
  date: string
  cover_image: string | null
  images?: PhotoImage[]
}

export default function LifeAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [inputApiKey, setInputApiKey] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(true)

  // 照片管理状态
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // 编辑表单状态
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    date: ''
  })

  // 图片管理状态
  const [images, setImages] = useState<PhotoImage[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 消息提示
  const [message, setMessage] = useState({ type: '', text: '' })

  // 检查登录状态
  useEffect(() => {
    const savedApiKey = localStorage.getItem('life_admin_api_key')
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
      const response = await fetch(`${API_BASE}/api/life/admin/photos`, {
        headers: { 'X-API-Key': key }
      })
      if (response.ok) {
        setApiKey(key)
        setIsAuthenticated(true)
        localStorage.setItem('life_admin_api_key', key)
        const data = await response.json()
        setPhotos(data)
      } else {
        localStorage.removeItem('life_admin_api_key')
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
    localStorage.removeItem('life_admin_api_key')
    setIsAuthenticated(false)
    setApiKey('')
    setInputApiKey('')
  }

  // 显示消息
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  // 加载照片列表
  const loadPhotos = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/life/admin/photos`, {
        headers: { 'X-API-Key': apiKey }
      })
      if (response.ok) {
        const data = await response.json()
        setPhotos(data)
      }
    } catch {
      showMessage('error', '加载照片失败')
    }
  }

  // 加载单张照片详情
  const loadPhoto = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/life/photos/${id}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedPhoto(data)
        setFormData({
          title: data.title,
          description: data.description || '',
          content: data.content || '',
          date: data.date
        })
        setImages(data.images || [])
      }
    } catch {
      showMessage('error', '加载照片详情失败')
    }
  }

  // 创建照片
  const handleCreate = async () => {
    if (!formData.title) {
      showMessage('error', '请填写照片标题')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/api/life/admin/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          content: formData.content || null,
          date: formData.date || null
        })
      })

      if (response.ok) {
        const data = await response.json()
        showMessage('success', '照片创建成功，请上传图片')
        setSelectedPhoto(data)
        setIsCreating(false)
        setIsEditing(true)
        loadPhotos()
      } else {
        const error = await response.json()
        showMessage('error', error.detail || '创建失败')
      }
    } catch {
      showMessage('error', '创建照片失败')
    }
  }

  // 更新照片
  const handleUpdate = async () => {
    if (!selectedPhoto) return

    try {
      const response = await fetch(`${API_BASE}/api/life/admin/photos/${selectedPhoto.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          content: formData.content || null,
          date: formData.date || null
        })
      })

      if (response.ok) {
        showMessage('success', '照片更新成功')
        loadPhotos()
      } else {
        showMessage('error', '更新失败')
      }
    } catch {
      showMessage('error', '更新照片失败')
    }
  }

  // 删除照片
  const handleDelete = async (id: number) => {
    const photo = photos.find(p => p.id === id)
    if (!confirm(`确定要删除照片 "${photo?.title}" 吗？此操作不可恢复。`)) return

    try {
      const response = await fetch(`${API_BASE}/api/life/admin/photos/${id}`, {
        method: 'DELETE',
        headers: { 'X-API-Key': apiKey }
      })

      if (response.ok) {
        showMessage('success', '照片已删除')
        if (selectedPhoto?.id === id) {
          resetForm()
        }
        loadPhotos()
      } else {
        showMessage('error', '删除失败')
      }
    } catch {
      showMessage('error', '删除照片失败')
    }
  }

  // 上传图片
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !selectedPhoto) return

    setUploadingImage(true)
    let successCount = 0
    let failCount = 0

    // 逐个上传图片，等待每个完成后再上传下一个
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      try {
        const response = await fetch(`${API_BASE}/api/life/admin/photos/${selectedPhoto.id}/images`, {
          method: 'POST',
          headers: { 'X-API-Key': apiKey },
          body: uploadFormData
        })

        if (response.ok) {
          successCount++
        } else {
          const error = await response.json()
          console.error(`上传失败: ${file.name}`, error)
          failCount++
        }
      } catch (err) {
        console.error(`上传异常: ${file.name}`, err)
        failCount++
      }
    }

    setUploadingImage(false)

    // 显示结果
    if (successCount > 0 && failCount === 0) {
      showMessage('success', `成功上传 ${successCount} 张图片`)
    } else if (successCount > 0 && failCount > 0) {
      showMessage('success', `成功 ${successCount} 张，失败 ${failCount} 张`)
    } else {
      showMessage('error', `上传失败`)
    }

    // 重新加载照片详情以获取最新图片
    await loadPhoto(selectedPhoto.id)

    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 删除图片
  const handleImageDelete = async (imageId: number) => {
    if (!selectedPhoto || !confirm('确定要删除这张图片吗？')) return

    try {
      const response = await fetch(
        `${API_BASE}/api/life/admin/photos/${selectedPhoto.id}/images/${imageId}`,
        {
          method: 'DELETE',
          headers: { 'X-API-Key': apiKey }
        }
      )

      if (response.ok) {
        showMessage('success', '图片已删除')
        loadPhoto(selectedPhoto.id)
      } else {
        showMessage('error', '删除失败')
      }
    } catch {
      showMessage('error', '删除图片失败')
    }
  }

  // 设置封面
  const handleSetCover = async (imageId: number) => {
    if (!selectedPhoto) return

    try {
      const response = await fetch(
        `${API_BASE}/api/life/admin/photos/${selectedPhoto.id}/images/${imageId}/cover`,
        {
          method: 'PUT',
          headers: { 'X-API-Key': apiKey }
        }
      )

      if (response.ok) {
        showMessage('success', '封面已设置')
        loadPhoto(selectedPhoto.id)
        loadPhotos()
      } else {
        showMessage('error', '设置封面失败')
      }
    } catch {
      showMessage('error', '设置封面失败')
    }
  }

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      date: ''
    })
    setSelectedPhoto(null)
    setImages([])
    setIsEditing(false)
    setIsCreating(false)
  }

  // 开始创建新照片
  const startCreate = () => {
    resetForm()
    setFormData({
      title: '',
      description: '',
      content: '',
      date: new Date().toISOString().split('T')[0]
    })
    setIsCreating(true)
    setIsEditing(false)
  }

  // 开始编辑照片
  const startEdit = (photo: Photo) => {
    loadPhoto(photo.id)
    setIsEditing(true)
    setIsCreating(false)
  }

  // 取消编辑
  const cancelEdit = () => {
    resetForm()
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
                生活管理后台
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
              生活管理后台
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={startCreate}
                className="btn-primary gap-2"
              >
                <Plus className="w-4 h-4" />
                新建照片
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
          {/* 照片列表 */}
          <div className="lg:col-span-1">
            <div className="card p-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                <Image className="w-5 h-5" />
                照片列表 ({photos.length})
              </h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedPhoto?.id === photo.id
                        ? 'bg-primary-100 dark:bg-primary-900/30'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                    onClick={() => startEdit(photo)}
                  >
                    <div className="flex items-start gap-3">
                      {photo.cover_image && (
                        <img
                          src={photo.cover_image}
                          alt={photo.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-neutral-900 dark:text-neutral-100 text-sm truncate">
                          {photo.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                          <Calendar className="w-3 h-3" />
                          {photo.date}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {photos.length === 0 && (
                  <div className="text-center py-8 text-neutral-500">
                    暂无照片
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
                    {isCreating ? '新建照片' : '编辑照片'}
                  </h2>
                  <div className="flex items-center gap-2">
                    {isEditing && selectedPhoto && (
                      <button
                        onClick={() => handleDelete(selectedPhoto.id)}
                        className="btn-ghost text-red-500 hover:text-red-600 gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        删除
                      </button>
                    )}
                    <button onClick={cancelEdit} className="btn-ghost gap-2">
                      <X className="w-4 h-4" />
                      取消
                    </button>
                  </div>
                </div>

                {/* 图片管理器（仅编辑模式） */}
                {isEditing && selectedPhoto && (
                  <div className="mb-6 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      图片管理
                      <span className="text-neutral-500 text-xs">（第一张图片为封面）</span>
                    </h3>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {images.map((img) => (
                        <div key={img.id} className="relative group">
                          <img
                            src={img.url}
                            alt=""
                            className={`w-24 h-24 object-cover rounded ${
                              img.is_cover ? 'ring-2 ring-primary-500' : ''
                            }`}
                          />
                          {img.is_cover && (
                            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary-500 text-white text-xs rounded flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              封面
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
                            {!img.is_cover && (
                              <button
                                onClick={() => handleSetCover(img.id)}
                                className="p-1.5 bg-white/20 hover:bg-white/40 rounded text-white"
                                title="设为封面"
                              >
                                <Star className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleImageDelete(img.id)}
                              className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded text-white"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <label className="btn-secondary gap-2 cursor-pointer inline-flex">
                      <Upload className="w-4 h-4" />
                      {uploadingImage ? '上传中...' : '上传图片（支持多选）'}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                )}

                {/* 表单 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      标题 *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="照片标题"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      日期
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      简短描述
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="简短描述（显示在卡片上）"
                      rows={2}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      详细内容
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="详细内容（显示在详情弹窗中）"
                      rows={6}
                      className="input"
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
                      {isCreating ? '创建照片' : '保存修改'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <Image className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                  选择一张照片进行编辑，或创建新照片
                </p>
                <button onClick={startCreate} className="btn-primary gap-2">
                  <Plus className="w-4 h-4" />
                  新建照片
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
