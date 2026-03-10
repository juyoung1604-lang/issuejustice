import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Gmail 일일 발송 한도 (Free: 500, Workspace: 2000)
const GMAIL_FREE_DAILY_LIMIT = 500
const GMAIL_WORKSPACE_DAILY_LIMIT = 2000

export async function GET() {
  // 오늘 00:00:00 (UTC)
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  // 이번 시간 시작
  const hourStart = new Date()
  hourStart.setUTCMinutes(0, 0, 0)

  const [todayResult, hourResult, recentResult] = await Promise.all([
    // 오늘 총 발송 수
    supabaseAdmin
      .from('email_otp_codes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString()),

    // 최근 1시간 발송 수
    supabaseAdmin
      .from('email_otp_codes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', hourStart.toISOString()),

    // 최근 10건 발송 기록 (이메일 도메인 마스킹)
    supabaseAdmin
      .from('email_otp_codes')
      .select('email, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  if (todayResult.error) {
    return NextResponse.json({ error: todayResult.error.message }, { status: 500 })
  }

  const todayCount = todayResult.count ?? 0
  const hourCount = hourResult.count ?? 0

  // 이메일 마스킹: abc@gmail.com → a**@gmail.com
  const recent = (recentResult.data ?? []).map(row => {
    const [local, domain] = (row.email as string).split('@')
    const masked = local.length > 1
      ? local[0] + '*'.repeat(Math.min(local.length - 1, 4)) + (local.length > 5 ? local.slice(-1) : '')
      : local
    return {
      email: `${masked}@${domain}`,
      sentAt: row.created_at as string,
    }
  })

  return NextResponse.json({
    todayCount,
    hourCount,
    freeLimit: GMAIL_FREE_DAILY_LIMIT,
    workspaceLimit: GMAIL_WORKSPACE_DAILY_LIMIT,
    freePct: Math.min((todayCount / GMAIL_FREE_DAILY_LIMIT) * 100, 100),
    workspacePct: Math.min((todayCount / GMAIL_WORKSPACE_DAILY_LIMIT) * 100, 100),
    recent,
    checkedAt: new Date().toISOString(),
  })
}
