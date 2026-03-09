import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const start = Date.now()

  const tables = ['issues', 'comments', 'reports', 'attachments', 'status_history', 'profiles'] as const

  const counts: Record<string, number | string> = {}
  let dbOk = true

  await Promise.all(
    tables.map(async (table) => {
      const { count, error } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact', head: true })
      if (error) {
        counts[table] = 'err'
        dbOk = false
      } else {
        counts[table] = count ?? 0
      }
    })
  )

  const latency = Date.now() - start

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? '알 수 없음'
  const maskedUrl = supabaseUrl.replace(/https:\/\/([^.]{4})[^.]+/, 'https://$1****')

  return NextResponse.json({
    ok: dbOk,
    latency,
    projectRef,
    maskedUrl,
    counts,
    checkedAt: new Date().toISOString(),
    envVars: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  })
}
