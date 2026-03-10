import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const BUCKET = 'attachments'

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9가-힣._-]/g, '_').toLowerCase()
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: issueId } = await params

  // 이슈 존재 확인
  const { data: issue } = await supabaseAdmin
    .from('issues')
    .select('id')
    .eq('id', issueId)
    .single()

  if (!issue) {
    return NextResponse.json({ error: '이슈를 찾을 수 없습니다.' }, { status: 404 })
  }

  const contentType = request.headers.get('content-type') || ''

  // URL 첨부
  if (contentType.includes('application/json')) {
    const body = await request.json()
    const { file_url, file_type, original_name } = body

    if (!file_url || !file_type) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('attachments')
      .insert({
        issue_id: issueId,
        file_url,
        file_type,
        original_name: original_name || file_url,
        is_approved: false,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data }, { status: 201 })
  }

  // 파일 업로드
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const fileType = formData.get('file_type') as string | null

  if (!file || !fileType) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
  }

  const MAX_SIZE_BYTES = 10 * 1024 * 1024
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: `파일 크기가 10MB를 초과합니다.` }, { status: 400 })
  }

  const timestamp = Date.now()
  const safeName = sanitizeFileName(file.name)
  const storagePath = `${issueId}/${timestamp}_${safeName}`

  const arrayBuffer = await file.arrayBuffer()

  const { error: storageError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, new Uint8Array(arrayBuffer), {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (storageError) {
    return NextResponse.json({ error: `업로드 실패: ${storageError.message}` }, { status: 400 })
  }

  const { data: signedUrl } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60 * 60 * 24 * 365)

  if (!signedUrl) {
    await supabaseAdmin.storage.from(BUCKET).remove([storagePath])
    return NextResponse.json({ error: 'URL 생성 실패' }, { status: 500 })
  }

  const { data, error: dbError } = await supabaseAdmin
    .from('attachments')
    .insert({
      issue_id: issueId,
      file_url: signedUrl.signedUrl,
      file_type: fileType,
      original_name: file.name,
      is_approved: false,
    })
    .select()
    .single()

  if (dbError) {
    await supabaseAdmin.storage.from(BUCKET).remove([storagePath])
    return NextResponse.json({ error: '파일 정보 저장 실패' }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
