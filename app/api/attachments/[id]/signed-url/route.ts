import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const BUCKET = 'attachments'

function extractStoragePath(fileUrl: string): string | null {
  if (!fileUrl) return null

  if (!/^https?:\/\//i.test(fileUrl)) {
    return fileUrl.replace(/^attachments\//, '')
  }

  try {
    const parsed = new URL(fileUrl)
    const path = decodeURIComponent(parsed.pathname)
    const patterns = [
      '/storage/v1/object/sign/attachments/',
      '/storage/v1/object/public/attachments/',
      '/storage/v1/object/authenticated/attachments/',
    ]

    for (const pattern of patterns) {
      const idx = path.indexOf(pattern)
      if (idx >= 0) {
        const extracted = path.slice(idx + pattern.length)
        return extracted || null
      }
    }

    return null
  } catch {
    return null
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: attachment, error } = await supabaseAdmin
    .from('attachments')
    .select('id, file_url, is_approved')
    .eq('id', id)
    .single()

  if (error || !attachment) {
    return NextResponse.json({ error: '첨부자료를 찾을 수 없습니다.' }, { status: 404 })
  }

  if (!attachment.is_approved) {
    return NextResponse.json({ error: '승인되지 않은 첨부자료는 열람할 수 없습니다.' }, { status: 403 })
  }

  const originalUrl = attachment.file_url
  const storagePath = extractStoragePath(originalUrl)

  if (storagePath) {
    const { data: signedData, error: signError } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 60 * 30)

    if (!signError && signedData?.signedUrl) {
      return NextResponse.json({
        url: signedData.signedUrl,
        source: 'signed',
        expires_in_seconds: 1800,
      })
    }
  }

  if (/^https?:\/\//i.test(originalUrl)) {
    return NextResponse.json({
      url: originalUrl,
      source: 'original',
      expires_in_seconds: null,
    })
  }

  return NextResponse.json({ error: '열람 가능한 URL을 생성하지 못했습니다.' }, { status: 400 })
}
