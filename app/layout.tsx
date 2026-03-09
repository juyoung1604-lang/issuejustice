import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '시민신문고 — 상식을 기록합니다',
  description: '증거와 구조로 상식을 시각화하는 시민 공론 플랫폼',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
