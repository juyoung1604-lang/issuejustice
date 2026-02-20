// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'

export const metadata: Metadata = {
  title: {
    default: '시민신문고 - 불합리한 법집행 공론화 플랫폼',
    template: '%s | 시민신문고',
  },
  description: '증거와 구조로 상식을 시각화하는 시민 공론 플랫폼. 불합리한 법집행 사례를 기록하고 공론화하세요.',
  keywords: ['법집행', '과잉단속', '공론화', '시민', '신문고', '행정'],
  openGraph: {
    title: '시민신문고',
    description: '증거와 구조로 상식을 시각화하는 시민 공론 플랫폼',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 min-h-screen flex flex-col">
        <Header />
        <div className="flex-1">
          {children}
        </div>
        <footer className="bg-white border-t border-slate-200 py-8 mt-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <p className="font-bold text-slate-900">시민신문고</p>
                <p className="text-sm text-slate-500 mt-1">
                  증거와 구조로 &apos;상식&apos;을 시각화하는 시민 공론 플랫폼
                </p>
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <p>본 플랫폼은 공익 목적의 의견 개진 플랫폼입니다.</p>
                <p>게시된 내용은 사실로 단정하지 않으며, 다양한 시각이 존재할 수 있습니다.</p>
                <p>© 2024 시민신문고. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
