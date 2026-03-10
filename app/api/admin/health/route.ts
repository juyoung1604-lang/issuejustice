import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// 스토리지 버킷의 전체 파일 사이즈를 재귀적으로 합산
async function getBucketSize(bucketName: string): Promise<{ files: number; bytes: number }> {
  let totalFiles = 0
  let totalBytes = 0

  const listFolder = async (prefix: string) => {
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .list(prefix, { limit: 1000 })
    if (error || !data) return

    for (const item of data) {
      if (item.id === null) {
        // 폴더
        await listFolder(prefix ? `${prefix}/${item.name}` : item.name)
      } else {
        // 파일
        totalFiles++
        totalBytes += (item.metadata?.size as number) ?? 0
      }
    }
  }

  await listFolder('')
  return { files: totalFiles, bytes: totalBytes }
}

export async function GET() {
  const start = Date.now()

  const tables = ['issues', 'comments', 'reports', 'attachments', 'status_history', 'profiles'] as const

  const counts: Record<string, number | string> = {}
  let dbOk = true

  // 테이블 레코드 수 + 스토리지 조회 병렬 실행
  const [, bucketsResult] = await Promise.all([
    Promise.all(
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
    ),
    supabaseAdmin.storage.listBuckets(),
  ])

  const latency = Date.now() - start

  // 스토리지 용량 집계
  let storage: {
    buckets: Array<{ name: string; files: number; bytes: number }>
    totalBytes: number
    error?: string
  } = { buckets: [], totalBytes: 0 }

  if (bucketsResult.error) {
    storage = { buckets: [], totalBytes: 0, error: bucketsResult.error.message }
  } else {
    const bucketStats = await Promise.all(
      (bucketsResult.data ?? []).map(async (b) => {
        const stat = await getBucketSize(b.name)
        return { name: b.name, ...stat }
      })
    )
    storage = {
      buckets: bucketStats,
      totalBytes: bucketStats.reduce((sum, b) => sum + b.bytes, 0),
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? '알 수 없음'
  const maskedUrl = supabaseUrl.replace(/https:\/\/([^.]{4})[^.]+/, 'https://$1****')

  return NextResponse.json({
    ok: dbOk,
    latency,
    projectRef,
    maskedUrl,
    counts,
    storage,
    checkedAt: new Date().toISOString(),
    envVars: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  })
}
