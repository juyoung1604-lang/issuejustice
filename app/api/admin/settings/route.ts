import { NextResponse } from 'next/server'
import { loadSiteConfig, saveSiteConfigValue, saveSiteConfigValues, type SiteConfigMap } from '@/lib/site-config'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const result = await loadSiteConfig()
    return NextResponse.json(
      {
        data: result.data,
        source: result.source,
      },
      {
        headers: { 'Cache-Control': 'no-store' },
      }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : '설정을 불러오지 못했습니다.'
    return NextResponse.json(
      { error: message },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const entries = body?.entries
  const { key, value } = body

  if (entries !== undefined) {
    if (!entries || typeof entries !== 'object' || Array.isArray(entries)) {
      return NextResponse.json({ error: 'entries는 key-value 객체여야 합니다.' }, { status: 400 })
    }

    const normalized: SiteConfigMap = {}
    for (const [entryKey, entryValue] of Object.entries(entries as Record<string, unknown>)) {
      if (!entryKey) continue
      if (entryValue === undefined) continue
      normalized[entryKey] = String(entryValue)
    }

    if (Object.keys(normalized).length === 0) {
      return NextResponse.json({ error: '저장할 설정이 없습니다.' }, { status: 400 })
    }

    try {
      const source = await saveSiteConfigValues(normalized)
      return NextResponse.json({ ok: true, source })
    } catch (error) {
      const message = error instanceof Error ? error.message : '설정을 저장하지 못했습니다.'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }

  if (!key || value === undefined) {
    return NextResponse.json({ error: 'key와 value가 필요합니다.' }, { status: 400 })
  }

  try {
    const source = await saveSiteConfigValue(key, String(value))
    return NextResponse.json({ ok: true, source })
  } catch (error) {
    const message = error instanceof Error ? error.message : '설정을 저장하지 못했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
