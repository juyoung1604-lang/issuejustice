import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// 공개 읽기 전용 — 홈페이지 등 클라이언트에서 사용
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('site_config')
    .select('key, value')
    .in('key', ['sns_facebook', 'sns_twitter', 'sns_instagram', 'sns_youtube'])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const config: Record<string, string> = {}
  for (const row of data ?? []) {
    config[row.key] = row.value
  }
  return NextResponse.json({ data: config })
}
