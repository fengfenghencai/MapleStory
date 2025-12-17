'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface Picture {
  imageSrc: string
  nameTag: string
  timeTag: string
  description?: string
}

const pictures: Picture[] = [
  {
    imageSrc: '/images/life/1.jpg',
    nameTag: '晨光微熹',
    timeTag: '2024',
    description: '清晨的第一缕阳光，温暖而宁静'
  },
  {
    imageSrc: '/images/life/2.jpg',
    nameTag: '城市印象',
    timeTag: '2024',
    description: '繁华都市中的一隅风景'
  },
  {
    imageSrc: '/images/life/3.jpg',
    nameTag: '自然之美',
    timeTag: '2024',
    description: '大自然的鬼斧神工'
  },
  {
    imageSrc: '/images/life/4.jpg',
    nameTag: '静谧时光',
    timeTag: '2024',
    description: '享受独处的美好瞬间'
  },
  {
    imageSrc: '/images/life/5.jpg',
    nameTag: '旅途风景',
    timeTag: '2024',
    description: '在路上遇见的美丽'
  },
  {
    imageSrc: '/images/life/6.jpg',
    nameTag: '生活片段',
    timeTag: '2024',
    description: '记录平凡日子里的小确幸'
  },
  {
    imageSrc: '/images/life/7.jpg',
    nameTag: '光影交错',
    timeTag: '2024',
    description: '光与影的完美邂逅'
  },
  {
    imageSrc: '/images/life/8.jpg',
    nameTag: '午后漫步',
    timeTag: '2024',
    description: '阳光正好，微风不燥'
  },
  {
    imageSrc: '/images/life/9.jpg',
    nameTag: '四季更迭',
    timeTag: '2024',
    description: '感受时间流转的痕迹'
  },
  {
    imageSrc: '/images/life/10.jpg',
    nameTag: '街角咖啡',
    timeTag: '2024',
    description: '一杯咖啡，一段故事'
  },
  {
    imageSrc: '/images/life/11.jpg',
    nameTag: '夜色温柔',
    timeTag: '2024',
    description: '夜幕降临时的城市光影'
  },
  {
    imageSrc: '/images/life/12.jpg',
    nameTag: '岁月静好',
    timeTag: '2024',
    description: '简单生活的幸福感'
  },
  {
    imageSrc: '/images/life/13.jpg',
    nameTag: '心之所向',
    timeTag: '2024',
    description: '追随内心的指引前行'
  },
]

function getRandom(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function FramedPicture({ picture, index }: { picture: Picture; index: number }) {
  const [rotation] = useState(() => getRandom(-5, 5))

  return (
    <motion.div
      className="bg-white dark:bg-neutral-800 p-4 shadow-xl cursor-pointer"
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
      whileHover={{ scale: 1.05, zIndex: 10 }}
      whileTap={{ scale: 1 }}
      drag
      dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={() => window.open(picture.imageSrc, '_blank')}
    >
      <motion.img
        src={picture.imageSrc}
        alt={picture.nameTag}
        className="max-h-[300px] w-auto mb-4 object-cover"
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, mass: 1 }}
      />

      {picture.nameTag && (
        <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 text-right">
          {picture.nameTag}
        </h3>
      )}

      {picture.description && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 text-right mt-1">
          {picture.description}
        </p>
      )}

      {picture.timeTag && (
        <p className="text-sm font-light text-neutral-400 dark:text-neutral-500 text-right mt-1">
          {picture.timeTag}
        </p>
      )}
    </motion.div>
  )
}

export default function LifePage() {
  return (
    <div className="min-h-screen">
      {/* Background with noise texture effect */}
      <div
        className="min-h-screen bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      >
        {/* Header */}
        <div className="pt-24 pb-8 px-4">
          <motion.div
            className="max-w-7xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">
              生活瞬间
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              用镜头记录生活中的美好时光，每一张照片都是一段珍贵的回忆
            </p>
          </motion.div>
        </div>

        {/* Gallery Wall */}
        <div className="px-4 sm:px-8 lg:px-16 xl:px-24 pb-20">
          <div className="flex flex-wrap justify-center items-start gap-x-8 gap-y-12 md:gap-x-12 md:gap-y-16">
            {pictures.map((picture, index) => (
              <FramedPicture key={picture.imageSrc + index} picture={picture} index={index} />
            ))}
          </div>
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
            点击图片可查看大图 | 拖拽图片可自由移动
          </p>
        </motion.div>
      </div>
    </div>
  )
}
