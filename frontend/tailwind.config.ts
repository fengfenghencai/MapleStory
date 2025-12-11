import type { Config } from 'tailwindcss'

const config: Config = {
  // 深色模式使用 class 策略
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 自定义字体
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      // 自定义颜色 - 极简黑白灰 + 轻微蓝紫点缀
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#dde4fd',
          300: '#c3cffb',
          400: '#a3b3f7',
          500: '#8494f1',
          600: '#6b74e4',
          700: '#5a61ca',
          800: '#4a50a3',
          900: '#404581',
          950: '#26284b',
        },
        // 灰度色调
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          150: '#ededed',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          750: '#333333',
          800: '#262626',
          850: '#1f1f1f',
          900: '#171717',
          950: '#0a0a0a',
        },
      },
      // 自定义动画
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      // 自定义间距
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      // 自定义 Typography 样式
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            h1: {
              fontSize: '2em',
              fontWeight: '700',
              marginTop: '1.5em',
              marginBottom: '0.5em',
            },
            h2: {
              fontSize: '1.5em',
              fontWeight: '600',
              marginTop: '1.5em',
              marginBottom: '0.5em',
            },
            h3: {
              fontSize: '1.25em',
              fontWeight: '600',
              marginTop: '1.25em',
              marginBottom: '0.5em',
            },
            h4: {
              fontSize: '1.1em',
              fontWeight: '600',
              marginTop: '1em',
              marginBottom: '0.5em',
            },
            'ul, ol': {
              paddingLeft: '1.5em',
              marginTop: '0.75em',
              marginBottom: '0.75em',
            },
            'ul': {
              listStyleType: 'disc',
            },
            'ol': {
              listStyleType: 'decimal',
            },
            'li': {
              marginTop: '0.25em',
              marginBottom: '0.25em',
            },
            'li > ul, li > ol': {
              marginTop: '0.25em',
              marginBottom: '0.25em',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config
