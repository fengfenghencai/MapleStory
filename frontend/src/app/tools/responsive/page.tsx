'use client'

import { useState } from 'react'
import { Monitor, Laptop, Tablet, Smartphone, RotateCcw } from 'lucide-react'

type DeviceKey = 'desktop' | 'laptop' | 'tablet' | 'mobile'

interface DeviceState {
  key: DeviceKey
  name: string
  visible: boolean
  x: number
  y: number
  zIndex: number
  canRotate: boolean
  isLandscape: boolean
}

const deviceIcons: Record<DeviceKey, React.ComponentType<{ className?: string }>> = {
  desktop: Monitor,
  laptop: Laptop,
  tablet: Tablet,
  mobile: Smartphone,
}

const initialDevices: DeviceState[] = [
  { key: 'desktop', name: 'Desktop', visible: true, x: 300, y: 100, zIndex: 1, canRotate: false, isLandscape: true },
  { key: 'laptop', name: 'Laptop', visible: true, x: 750, y: 380, zIndex: 2, canRotate: false, isLandscape: true },
  { key: 'tablet', name: 'Tablet', visible: true, x: 180, y: 380, zIndex: 3, canRotate: true, isLandscape: false },
  { key: 'mobile', name: 'Mobile', visible: true, x: 380, y: 450, zIndex: 4, canRotate: true, isLandscape: false },
]

export default function ResponsivePage() {
  const [inputUrl, setInputUrl] = useState('https://siyuan.ink')
  const [currentUrl, setCurrentUrl] = useState('')
  const [devices, setDevices] = useState<DeviceState[]>([...initialDevices.map(d => ({ ...d }))])
  const [maxZIndex, setMaxZIndex] = useState(10)
  const [draggedDevice, setDraggedDevice] = useState<DeviceState | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, initialX: 0, initialY: 0 })

  const loadUrl = () => {
    if (!inputUrl) return
    let url = inputUrl
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url
    setCurrentUrl(url)
  }

  const toggleDeviceVisibility = (deviceKey: DeviceKey) => {
    setDevices(prev => prev.map(d => {
      if (d.key === deviceKey) {
        const newVisible = !d.visible
        if (newVisible) {
          setMaxZIndex(z => z + 1)
          return { ...d, visible: newVisible, zIndex: maxZIndex + 1 }
        }
        return { ...d, visible: newVisible }
      }
      return d
    }))
  }

  const resetLayout = () => {
    setDevices([...initialDevices.map(d => ({ ...d }))])
  }

  const rotateDevice = (deviceKey: DeviceKey) => {
    setDevices(prev => prev.map(d =>
      d.key === deviceKey ? { ...d, isLandscape: !d.isLandscape } : d
    ))
  }

  const bringToFront = (deviceKey: DeviceKey) => {
    setMaxZIndex(z => z + 1)
    setDevices(prev => prev.map(d =>
      d.key === deviceKey ? { ...d, zIndex: maxZIndex + 1 } : d
    ))
  }

  const handleMouseDown = (e: React.MouseEvent, device: DeviceState) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    bringToFront(device.key)
    setDraggedDevice(device)
    setDragStart({ x: e.clientX, y: e.clientY, initialX: device.x, initialY: device.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedDevice) return
    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    setDevices(prev => prev.map(d =>
      d.key === draggedDevice.key
        ? { ...d, x: dragStart.initialX + dx, y: dragStart.initialY + dy }
        : d
    ))
  }

  const handleMouseUp = () => {
    setDraggedDevice(null)
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="flex-none z-50 shadow-sm relative bg-white dark:bg-neutral-800">
        <div className="max-w-full px-4 sm:px-6 py-2 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 select-none">
            <div className="p-1 bg-blue-500 rounded-lg shadow-md shadow-blue-500/30">
              <Monitor className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-md font-bold text-neutral-900 dark:text-white hidden sm:block">
              多合一网页<span className="text-blue-500">缩略图</span>
            </h1>
          </div>

          <div className="flex-1 w-full max-w-xl relative group">
            <input
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && loadUrl()}
              type="text"
              placeholder="输入网址 (例如: https://siyuan.ink)"
              className="block w-full pl-4 pr-20 py-1.5 text-sm border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button
              onClick={loadUrl}
              className="absolute inset-y-1 right-1 px-3 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-md transition-colors"
            >
              加载
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg p-0.5">
              {devices.map((device) => {
                const Icon = deviceIcons[device.key]
                return (
                  <button
                    key={device.key}
                    onClick={() => toggleDeviceVisibility(device.key)}
                    className={`p-0 rounded-md bg-white dark:bg-neutral-700 transition-all duration-200 border border-transparent hover:border-neutral-300 dark:hover:border-neutral-600 flex items-center justify-center w-8 h-8 ${
                      device.visible
                        ? 'text-blue-500 shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                    }`}
                    title={device.visible ? `隐藏 ${device.name}` : `显示 ${device.name}`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                )
              })}
            </div>
            <button
              onClick={resetLayout}
              className="p-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition flex items-center gap-1"
              title="重置位置"
            >
              <RotateCcw className="w-3 h-3" />
              重置位置
            </button>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing bg-neutral-100 dark:bg-neutral-900"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {!currentUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <div className="text-center opacity-40">
              <h2 className="text-3xl font-bold text-neutral-400 dark:text-neutral-600">DRAG & DROP CANVAS</h2>
              <p className="mt-2 text-neutral-400">输入网址，拖动设备，自由组合截图</p>
            </div>
          </div>
        )}

        {devices.map((device) => (
          device.visible && (
            <div
              key={device.key}
              className="absolute transition-transform duration-75 ease-linear origin-center select-none will-change-transform"
              style={{
                transform: `translate(${device.x}px, ${device.y}px)`,
                zIndex: device.zIndex
              }}
              onMouseDown={(e) => handleMouseDown(e, device)}
            >
              <div className="group relative flex flex-col items-center">
                {/* Hover Tooltip */}
                <div className="absolute -top-10 left-0 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-default">
                  <div className="bg-neutral-800 text-white text-xs py-1 px-3 rounded-full shadow-lg flex items-center gap-2 pointer-events-auto">
                    <span className="font-bold mr-1">{device.name}</span>
                    <span className="opacity-50">|</span>
                    {device.canRotate && (
                      <>
                        <button
                          onClick={() => rotateDevice(device.key)}
                          className="hover:text-blue-300 transition-colors flex items-center gap-1"
                          title="切换横竖屏"
                        >
                          <RotateCcw className="w-3 h-3" />
                          {device.isLandscape ? '横屏' : '竖屏'}
                        </button>
                        <span className="opacity-50">|</span>
                      </>
                    )}
                    <button
                      onClick={() => toggleDeviceVisibility(device.key)}
                      className="hover:text-red-400 transition-colors"
                    >
                      关闭
                    </button>
                  </div>
                </div>

                {/* Device Frames */}
                {device.key === 'desktop' && (
                  <div className="cursor-move">
                    <div className="relative bg-neutral-800 dark:bg-neutral-700 rounded-t-xl border-[12px] border-neutral-800 dark:border-neutral-700 shadow-2xl">
                      <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-neutral-600 rounded-full z-10"></div>
                      <div className="relative bg-white overflow-hidden w-[640px] h-[360px]">
                        <div className="absolute inset-0 z-20 bg-transparent"></div>
                        <iframe
                          src={currentUrl}
                          className="w-[1920px] h-[1080px] border-0 origin-top-left transform scale-[0.3333]"
                          sandbox="allow-scripts allow-same-origin"
                          loading="lazy"
                        />
                      </div>
                      <div className="bg-neutral-200 dark:bg-neutral-600 h-8 rounded-b-md flex items-center justify-center border-t border-neutral-300 dark:border-neutral-500">
                        <div className="w-4 h-4 rounded-full bg-neutral-400"></div>
                      </div>
                    </div>
                    <div className="w-24 h-12 bg-neutral-300 dark:bg-neutral-600 shadow-inner mx-auto"></div>
                    <div className="w-32 h-2 bg-neutral-300 dark:bg-neutral-600 rounded-full shadow-lg mx-auto"></div>
                  </div>
                )}

                {device.key === 'laptop' && (
                  <div className="cursor-move flex flex-col items-center">
                    <div className="relative bg-neutral-800 rounded-t-xl border-[10px] border-neutral-800 shadow-2xl">
                      <div className="relative bg-white overflow-hidden w-[400px] h-[250px]">
                        <div className="absolute inset-0 z-20 bg-transparent"></div>
                        <iframe
                          src={currentUrl}
                          className="w-[1280px] h-[800px] border-0 origin-top-left transform scale-[0.3125]"
                          sandbox="allow-scripts allow-same-origin"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <div className="w-[460px] h-3 bg-neutral-300 dark:bg-neutral-600 rounded-b-lg shadow-xl border-t border-neutral-400 flex justify-center">
                      <div className="w-16 h-1.5 bg-neutral-400 rounded-b-md mt-[-1px]"></div>
                    </div>
                  </div>
                )}

                {device.key === 'tablet' && (
                  <div className="cursor-move">
                    <div
                      className={`relative bg-neutral-800 rounded-[1rem] p-1.5 shadow-2xl border border-neutral-700 transition-all duration-500 ${
                        device.isLandscape ? 'w-[320px] h-[230px]' : 'w-[230px] h-[320px]'
                      }`}
                    >
                      <div className={`absolute bg-neutral-600 rounded-full z-10 ${
                        device.isLandscape
                          ? 'left-2 top-1/2 -translate-y-1/2 w-3 h-3'
                          : 'top-2 left-1/2 -translate-x-1/2 w-3 h-3'
                      }`}></div>

                      <div className="relative bg-white overflow-hidden w-full h-full rounded-2xl">
                        <div className="absolute inset-0 z-20 bg-transparent"></div>
                        <iframe
                          src={currentUrl}
                          className="border-0 origin-top-left transition-all duration-500"
                          style={{
                            width: device.isLandscape ? '1024px' : '768px',
                            height: device.isLandscape ? '768px' : '1024px',
                            transform: `scale(${230/768})`
                          }}
                          sandbox="allow-scripts allow-same-origin"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {device.key === 'mobile' && (
                  <div className="cursor-move">
                    <div
                      className={`relative bg-neutral-900 shadow-2xl border border-neutral-700 ring-2 ring-black transition-all duration-500 ${
                        device.isLandscape
                          ? 'w-[280px] h-[130px] rounded-[1rem] p-1'
                          : 'w-[130px] h-[280px] rounded-[1rem] p-1'
                      }`}
                    >
                      <div className={`absolute bg-black rounded-full z-30 flex justify-center items-center gap-2 pointer-events-none ${
                        device.isLandscape
                          ? 'left-0 top-1/2 -translate-y-1/2 w-3 h-8 flex-col'
                          : 'top-0 left-1/2 -translate-x-1/2 w-8 h-3'
                      }`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-900/50"></div>
                      </div>

                      <div
                        className={`relative overflow-hidden w-full h-full bg-black transition-all flex flex-col ${
                          device.isLandscape ? 'rounded-[0.8rem] pl-0' : 'rounded-[0.8rem] pt-0 mt-0'
                        }`}
                      >
                        <div className="absolute inset-0 z-20 bg-transparent"></div>

                        <div className="flex-1 w-full bg-white relative overflow-hidden rounded-t-lg">
                          <iframe
                            src={currentUrl}
                            className="border-0 origin-top-left transition-all duration-500"
                            style={{
                              width: device.isLandscape ? '844px' : '390px',
                              height: device.isLandscape ? '390px' : '844px',
                              transform: `scale(${130/390})`
                            }}
                            sandbox="allow-scripts allow-same-origin"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        ))}
      </main>
    </div>
  )
}
