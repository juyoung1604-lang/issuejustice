import { NextResponse } from 'next/server'
import { loadSiteConfig } from '@/lib/site-config'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// 공개 읽기 전용 — 홈페이지 등 클라이언트에서 사용
export async function GET() {
  try {
    const { data, source } = await loadSiteConfig()
    const config: Record<string, string> = {
      sns_facebook: data.sns_facebook ?? '',
      sns_twitter: data.sns_twitter ?? '',
      sns_instagram: data.sns_instagram ?? '',
      sns_youtube: data.sns_youtube ?? '',
    }
    return NextResponse.json(
      { data: config, source },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : '설정을 불러오지 못했습니다.'
    return NextResponse.json(
      { error: message },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
