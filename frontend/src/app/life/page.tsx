'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

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

function getRandom(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

// 格式化日期
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

// 详情弹窗组件
function PhotoDetailModal({
  photo,
  onClose
}: {
  photo: Photo
  onClose: () => void
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const images = photo.images && photo.images.length > 0
    ? photo.images.map(img => img.url)
    : [photo.cover_image || '/images/life/1.jpg']

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* 左边：图片区域 */}
          <div className="relative lg:w-3/5 h-64 lg:h-auto bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <img
              src={images[currentImageIndex]}
              alt={photo.title}
              className="max-w-full max-h-full object-contain"
            />

            {/* 图片切换按钮 */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* 图片指示器 */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex
                          ? 'bg-white'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 右边：内容区域 */}
          <div className="lg:w-2/5 p-6 lg:p-8 overflow-y-auto">
            <h2 className="text-2xl lg:text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">
              {photo.title}
            </h2>

            {photo.description && (
              <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                {photo.description}
              </p>
            )}

            {photo.content && (
              <div className="prose dark:prose-invert prose-neutral max-w-none mb-6">
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {photo.content}
                </p>
              </div>
            )}

            {/* 底部信息 */}
            <div className="flex items-center pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{formatDate(photo.date)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// 照片卡片组件
function FramedPicture({
  photo,
  index,
  onClick
}: {
  photo: Photo
  index: number
  onClick: () => void
}) {
  const [rotation] = useState(() => getRandom(-3, 3))

  return (
    <motion.div
      className="bg-white dark:bg-neutral-800 p-4 shadow-xl cursor-pointer group min-w-[200px] max-w-[320px]"
      initial={{ scale: 0.7, rotate: 0, opacity: 0 }}
      whileInView={{ scale: 1, rotate: rotation, opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 20,
        mass: 1,
        delay: index * 0.05
      }}
      whileHover={{ scale: 1.03, zIndex: 10, rotate: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* 图片容器 - 原图缩放，限制最大高度 */}
      <motion.img
        src={photo.cover_image || '/images/life/1.jpg'}
        alt={photo.title}
        className="max-h-[300px] w-full object-contain mb-4"
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, mass: 1 }}
      />

      {/* 标题 */}
      <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 text-right truncate">
        {photo.title}
      </h3>

      {/* 描述 */}
      {photo.description && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 text-right mt-1 line-clamp-2">
          {photo.description}
        </p>
      )}

      {/* 底部信息：日期 */}
      <div className="flex items-center justify-end mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-700">
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          {formatDate(photo.date)}
        </span>
      </div>
    </motion.div>
  )
}

export default function LifePage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [loading, setLoading] = useState(true)

  // 加载照片数据
  useEffect(() => {
    async function fetchPhotos() {
      try {
        const response = await fetch(`${API_BASE}/api/life/photos`)
        if (response.ok) {
          const data = await response.json()
          setPhotos(data)
        }
      } catch (error) {
        console.error('加载照片失败:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPhotos()
  }, [])

  // 加载照片详情
  const loadPhotoDetail = async (photo: Photo) => {
    try {
      const response = await fetch(`${API_BASE}/api/life/photos/${photo.id}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedPhoto(data)
      } else {
        setSelectedPhoto(photo)
      }
    } catch {
      setSelectedPhoto(photo)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Background with noise texture effect */}
      <div
        className="min-h-screen bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      >
        {/* Gallery Wall */}
        <div className="pt-24 px-4 sm:px-8 lg:px-16 xl:px-24 pb-20">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="text-neutral-500">加载中...</div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center items-start gap-x-8 gap-y-12 md:gap-x-12 md:gap-y-16">
              {photos.map((photo, index) => (
                <FramedPicture
                  key={photo.id}
                  photo={photo}
                  index={index}
                  onClick={() => loadPhotoDetail(photo)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer text */}
        <motion.div
          className="pb-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-neutral-400 dark:text-neutral-600 text-sm">
            点击图片查看详情
          </p>
        </motion.div>
      </div>

      {/* 详情弹窗 */}
      <AnimatePresence>
        {selectedPhoto && (
          <PhotoDetailModal
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
