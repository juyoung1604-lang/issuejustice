// lib/api/upload.ts
import { supabase } from '@/lib/supabase'
import type { Attachment } from '@/types'

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

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

function normalizeUrl(rawUrl: string): string {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new UploadError('유효한 URL을 입력해 주세요.')
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new UploadError('http 또는 https URL만 입력할 수 있습니다.')
  }

  return parsed.toString()
}

function inferNameFromUrl(fileUrl: string): string {
  try {
    const parsed = new URL(fileUrl)
    const lastSegment = parsed.pathname.split('/').pop()
    if (!lastSegment) return `cloud_link_${Date.now()}`
    return decodeURIComponent(lastSegment).slice(0, 120) || `cloud_link_${Date.now()}`
  } catch {
    return `cloud_link_${Date.now()}`
  }
}

// ── 파일 업로드 ───────────────────────────────────────────────
export async function uploadAttachment(
  issueId: string,
  file: File,
  fileType: Attachment['file_type']
): Promise<Attachment> {
  validateFile(file)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('file_type', fileType)

  const res = await fetch(`/api/issues/${issueId}/upload`, {
    method: 'POST',
    body: formData,
  })

  const json = await res.json()
  if (!res.ok) throw new UploadError(json.error || '업로드 실패')

  return json.data as Attachment
}

// ── 클라우드 URL 첨부 ────────────────────────────────────────
export async function addUrlAttachment(
  issueId: string,
  fileUrl: string,
  fileType: Attachment['file_type'],
  originalName?: string
): Promise<Attachment> {
  const normalizedUrl = normalizeUrl(fileUrl)
  const finalName = (originalName?.trim() || inferNameFromUrl(normalizedUrl)).slice(0, 120)

  const res = await fetch(`/api/issues/${issueId}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_url: normalizedUrl,
      file_type: fileType,
      original_name: finalName,
    }),
  })

  const json = await res.json()
  if (!res.ok) throw new UploadError(json.error || 'URL 첨부 실패')

  return json.data as Attachment
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
