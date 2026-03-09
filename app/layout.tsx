import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '시민신문고 — 상식을 기록합니다',
  description: '불합리한 법집행 사례를 증거와 구조로 기록하고, 시민의 공감으로 공론화합니다. 개인의 분노가 아닌 데이터로 상식을 시각화합니다.',
  keywords: '시민신문고, 법집행, 공론화, 이슈, 제보',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
