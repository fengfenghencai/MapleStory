import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import '@/styles/globals.css'

// SEO 元数据
export const metadata: Metadata = {
  title: {
    default: '枫叶物语',
    template: '%s | 枫叶物语',
  },
  description: '分享有趣的工具，记录生活点滴',
  keywords: ['枫叶物语', '博客', '工具', '生活记录', 'LiuFeng'],
  authors: [{ name: 'LiuFeng' }],
  creator: 'LiuFeng',
  icons: {
    icon: '/img.png',
    apple: '/img.png',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: '枫叶物语',
    title: '枫叶物语',
    description: '分享有趣的工具，记录生活点滴',
  },
  twitter: {
    card: 'summary_large_image',
    title: '枫叶物语',
    description: '分享有趣的工具，记录生活点滴',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {/* 导航栏 */}
          <Navbar />

          {/* 主内容区域 */}
          <main className="flex-1 pt-20">
            {children}
          </main>

          {/* 页脚 */}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
