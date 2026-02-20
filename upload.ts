// lib/api/upload.ts
import { supabase } from '@/lib/supabase'
import type { Attachment } from '@/types'

const BUCKET = 'attachments'
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp']

export class UploadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UploadError'
  }
}

// 파일 유효성 검사
function validateFile(file: File): void {
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadError(`파일 크기가 10MB를 초과합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`)
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new UploadError('PDF, JPG, PNG, WEBP 파일만 업로드 가능합니다.')
  }
}

// 파일명 안전하게 처리
function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9가-힣._-]/g, '_').toLowerCase()
}

// ── 파일 업로드 ───────────────────────────────────────────────
export async function uploadAttachment(
  issueId: string,
  file: File,
  fileType: Attachment['file_type']
): Promise<Attachment> {
  validateFile(file)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new UploadError('로그인이 필요합니다.')

  // Storage 경로: attachments/{issueId}/{timestamp}_{filename}
  const timestamp = Date.now()
  const safeName = sanitizeFileName(file.name)
  const storagePath = `${issueId}/${timestamp}_${safeName}`

  // Supabase Storage 업로드
  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (storageError) {
    throw new UploadError(`업로드 실패: ${storageError.message}`)
  }

  // 서명된 URL 생성 (비공개 버킷 - 관리자 승인 전)
  const { data: signedUrl } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60 * 60 * 24 * 365) // 1년 유효

  if (!signedUrl) throw new UploadError('URL 생성 실패')

  // DB에 첨부파일 레코드 삽입 (is_approved: false - 관리자 검토 대기)
  const { data, error: dbError } = await supabase
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
    // DB 실패 시 Storage에서도 삭제
    await supabase.storage.from(BUCKET).remove([storagePath])
    throw new UploadError('파일 정보 저장 실패')
  }

  return data as Attachment
}

// ── 첨부파일 삭제 (본인 것, 미승인 상태만) ──────────────────────
export async function deleteAttachment(attachmentId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new UploadError('로그인이 필요합니다.')

  // 본인 이슈의 미승인 파일인지 확인
  const { data: att } = await supabase
    .from('attachments')
    .select('file_url, is_approved, issues:issue_id(author_id)')
    .eq('id', attachmentId)
    .single()

  if (!att) throw new UploadError('파일을 찾을 수 없습니다.')
  if (att.is_approved) throw new UploadError('승인된 파일은 삭제할 수 없습니다.')
  if ((att as any).issues?.author_id !== user.id) throw new UploadError('권한이 없습니다.')

  await supabase.from('attachments').delete().eq('id', attachmentId)
}
