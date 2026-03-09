'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Paperclip, Upload, X, CheckCircle, AlertCircle, Loader2, Eye, FileText, Link as LinkIcon, CloudUpload } from 'lucide-react'
import { uploadAttachment, deleteAttachment, addUrlAttachment, UploadError } from '@/lib/api/upload'
import type { Attachment } from '@/types'

const FILE_TYPE_OPTIONS: Attachment['file_type'][] = [
  '판결문', '처분서', '공문', '녹취요약', '언론기사'
]

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp']

type UploadMode = 'remote' | 'local'

export interface UploadedAttachment {
  id: string
  original_name: string
  file_type: Attachment['file_type']
  file_url: string
  mime_type: string
  size_bytes: number
  is_remote: boolean
  source: 'file' | 'url'
}

interface CommonFileUploadProps {
  onUploadComplete?: (attachment: Attachment) => void
  onFilesChange?: (files: UploadedAttachment[]) => void
}

interface RemoteFileUploadProps extends CommonFileUploadProps {
  issueId: string
  mode?: 'remote'
}

interface LocalFileUploadProps extends CommonFileUploadProps {
  mode: 'local'
  issueId?: never
}

export type FileUploadProps = RemoteFileUploadProps | LocalFileUploadProps

type FileStatus = 'idle' | 'uploading' | 'success' | 'error'

interface PendingFile {
  key: string
  file: File
  fileType: Attachment['file_type']
  source: 'file' | 'url'
  status: FileStatus
  error?: string
  attachment?: Attachment
  uploaded?: UploadedAttachment
}

function hasAllowedExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase()
  return ALLOWED_EXTENSIONS.some(ext => lower.endsWith(ext))
}

function inferMimeType(fileName: string): string {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.pdf')) return 'application/pdf'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  return 'application/octet-stream'
}

function normalizeCloudUrl(rawUrl: string): string {
  let parsed: URL
  try {
    parsed = new URL(rawUrl.trim())
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
    const segment = parsed.pathname.split('/').pop()
    if (!segment) return `cloud_link_${Date.now()}`
    return decodeURIComponent(segment) || `cloud_link_${Date.now()}`
  } catch {
    return `cloud_link_${Date.now()}`
  }
}

function isPdf(file: UploadedAttachment): boolean {
  return file.mime_type === 'application/pdf' || file.original_name.toLowerCase().endsWith('.pdf')
}

function validateBeforeUpload(file: File): void {
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadError(`파일 크기가 10MB를 초과합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`)
  }

  const typeAllowed = ALLOWED_TYPES.includes(file.type)
  const extensionAllowed = hasAllowedExtension(file.name)

  if (!typeAllowed && !extensionAllowed) {
    throw new UploadError('PDF, JPG, PNG, WEBP 파일만 업로드 가능합니다.')
  }
}

export function FileUpload(props: FileUploadProps) {
  const mode: UploadMode = props.mode ?? 'remote'
  const issueId = mode === 'remote' ? props.issueId : undefined
  const { onUploadComplete, onFilesChange } = props
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [defaultFileType, setDefaultFileType] = useState<Attachment['file_type']>('처분서')
  const [uploadSource, setUploadSource] = useState<'file' | 'url'>('file')
  const [urlInput, setUrlInput] = useState('')
  const [urlTitle, setUrlTitle] = useState('')
  const [urlFileType, setUrlFileType] = useState<Attachment['file_type']>('처분서')
  const [urlError, setUrlError] = useState<string | null>(null)
  const [isAddingUrl, setIsAddingUrl] = useState(false)
  const [previewFile, setPreviewFile] = useState<UploadedAttachment | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingFilesRef = useRef<PendingFile[]>([])

  useEffect(() => {
    pendingFilesRef.current = pendingFiles
  }, [pendingFiles])

  useEffect(() => {
    return () => {
      for (const pf of pendingFilesRef.current) {
        if (pf.uploaded && !pf.uploaded.is_remote && pf.uploaded.file_url.startsWith('blob:')) {
          URL.revokeObjectURL(pf.uploaded.file_url)
        }
      }
    }
  }, [])

  const uploadedFiles = useMemo(
    () =>
      pendingFiles
        .filter(pf => pf.status === 'success' && pf.uploaded)
        .map(pf => pf.uploaded as UploadedAttachment),
    [pendingFiles]
  )

  useEffect(() => {
    onFilesChange?.(uploadedFiles)
  }, [uploadedFiles, onFilesChange])

  const addFiles = useCallback((files: FileList | File[]) => {
    const newFiles: PendingFile[] = Array.from(files).map(file => ({
      key: `${Date.now()}-${Math.random()}`,
      file,
      fileType: defaultFileType,
      source: 'file',
      status: 'idle' as FileStatus,
    }))
    setPendingFiles(prev => [...prev, ...newFiles])
  }, [defaultFileType])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const updateFile = (key: string, updates: Partial<PendingFile>) => {
    setPendingFiles(prev => prev.map(f => f.key === key ? { ...f, ...updates } : f))
  }

  const handleUpload = async (pf: PendingFile) => {
    updateFile(pf.key, { status: 'uploading', error: undefined })
    try {
      validateBeforeUpload(pf.file)

      if (mode === 'remote') {
        if (!issueId) throw new UploadError('업로드 대상 이슈 정보(issueId)가 없습니다.')

        const attachment = await uploadAttachment(issueId, pf.file, pf.fileType)
        updateFile(pf.key, {
          status: 'success',
          attachment,
          uploaded: {
            id: attachment.id,
            original_name: attachment.original_name,
            file_type: attachment.file_type,
            file_url: attachment.file_url,
            mime_type: pf.file.type || inferMimeType(pf.file.name),
            size_bytes: pf.file.size,
            is_remote: true,
            source: pf.source,
          }
        })
        onUploadComplete?.(attachment)
      } else {
        const localFile: UploadedAttachment = {
          id: `local-${Date.now()}-${Math.random()}`,
          original_name: pf.file.name,
          file_type: pf.fileType,
          file_url: URL.createObjectURL(pf.file),
          mime_type: pf.file.type || inferMimeType(pf.file.name),
          size_bytes: pf.file.size,
          is_remote: false,
          source: pf.source,
        }
        updateFile(pf.key, { status: 'success', uploaded: localFile })
      }
    } catch (e) {
      updateFile(pf.key, {
        status: 'error',
        error: e instanceof UploadError ? e.message : '업로드 실패'
      })
    }
  }

  const handleAddUrl = async () => {
    setUrlError(null)

    try {
      const normalizedUrl = normalizeCloudUrl(urlInput)
      const inferredName = inferNameFromUrl(normalizedUrl)
      const finalName = (urlTitle.trim() || inferredName).slice(0, 120)
      const mimeType = inferMimeType(finalName)

      setIsAddingUrl(true)

      if (mode === 'remote') {
        if (!issueId) throw new UploadError('업로드 대상 이슈 정보(issueId)가 없습니다.')

        const attachment = await addUrlAttachment(issueId, normalizedUrl, urlFileType, finalName)
        const pending: PendingFile = {
          key: `url-${Date.now()}-${Math.random()}`,
          file: new File([], finalName, { type: mimeType }),
          fileType: urlFileType,
          source: 'url',
          status: 'success',
          attachment,
          uploaded: {
            id: attachment.id,
            original_name: attachment.original_name,
            file_type: attachment.file_type,
            file_url: attachment.file_url,
            mime_type: mimeType,
            size_bytes: 0,
            is_remote: true,
            source: 'url',
          }
        }
        setPendingFiles(prev => [...prev, pending])
        onUploadComplete?.(attachment)
      } else {
        const uploaded: UploadedAttachment = {
          id: `local-url-${Date.now()}-${Math.random()}`,
          original_name: finalName,
          file_type: urlFileType,
          file_url: normalizedUrl,
          mime_type: mimeType,
          size_bytes: 0,
          is_remote: true,
          source: 'url',
        }
        const pending: PendingFile = {
          key: `local-url-${Date.now()}-${Math.random()}`,
          file: new File([], finalName, { type: mimeType }),
          fileType: urlFileType,
          source: 'url',
          status: 'success',
          uploaded,
        }
        setPendingFiles(prev => [...prev, pending])
      }

      setUrlInput('')
      setUrlTitle('')
    } catch (e) {
      setUrlError(e instanceof UploadError ? e.message : 'URL 첨부에 실패했습니다.')
    } finally {
      setIsAddingUrl(false)
    }
  }

  const handleRemove = async (pf: PendingFile) => {
    if (pf.status === 'success') {
      if (pf.uploaded && !pf.uploaded.is_remote && pf.uploaded.file_url.startsWith('blob:')) {
        URL.revokeObjectURL(pf.uploaded.file_url)
      }

      if (mode === 'remote' && pf.attachment) {
        try {
          await deleteAttachment(pf.attachment.id)
        } catch {}
      }

      if (previewFile && pf.uploaded?.id === previewFile.id) {
        setPreviewFile(null)
      }
    }
    setPendingFiles(prev => prev.filter(f => f.key !== pf.key))
  }

  const uploadAll = () => {
    pendingFiles
      .filter(f => f.status === 'idle' || f.status === 'error')
      .forEach(handleUpload)
  }

  const pendingCount = pendingFiles.filter(f => f.status === 'idle').length

  return (
    <div className="space-y-4">
      {/* 경고 배너 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex items-start gap-2">
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">개인정보 가림 처리 필수</p>
          <p className="text-xs mt-0.5">이름, 주민번호, 계좌번호 등은 반드시 가림 처리 후 업로드해 주세요. 관리자 검토 후 공개됩니다.</p>
        </div>
      </div>

      {/* 첨부 방식 선택 */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">첨부 방식</label>
        <div className="inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setUploadSource('file')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors inline-flex items-center gap-1.5 ${
              uploadSource === 'file' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Upload size={14} />
            파일 직접 업로드
          </button>
          <button
            type="button"
            onClick={() => setUploadSource('url')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors inline-flex items-center gap-1.5 ${
              uploadSource === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CloudUpload size={14} />
            클라우드 URL 입력
          </button>
        </div>
      </div>

      {uploadSource === 'file' ? (
        <>
          {/* 기본 파일 유형 선택 */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">기본 파일 유형</label>
            <select
              value={defaultFileType}
              onChange={e => setDefaultFileType(e.target.value as Attachment['file_type'])}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              {FILE_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* 드래그앤드롭 영역 */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
            }`}
          >
            <Paperclip size={28} className={`mx-auto mb-2 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
            <p className="font-medium text-slate-700">파일을 드래그하거나 클릭하여 업로드</p>
            <p className="text-sm text-slate-400 mt-1">PDF, JPG, PNG · 최대 10MB</p>
            <p className="text-xs text-slate-300 mt-2">판결문 / 처분서 / 공문 / 녹취요약 / 언론기사</p>
          </div>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={e => e.target.files && addFiles(e.target.files)}
          />
        </>
      ) : (
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">클라우드 파일 URL</label>
            <input
              type="url"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="https://drive.google.com/... 또는 https://onedrive.live.com/..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">표시 파일명 (선택)</label>
              <input
                type="text"
                value={urlTitle}
                onChange={e => setUrlTitle(e.target.value)}
                placeholder="비워두면 URL에서 자동 추출"
                maxLength={120}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">파일 유형</label>
              <select
                value={urlFileType}
                onChange={e => setUrlFileType(e.target.value as Attachment['file_type'])}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                {FILE_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Google Drive, OneDrive, Dropbox 등 공유 링크를 입력할 수 있습니다.
          </p>

          {urlError && <p className="text-xs text-red-600">{urlError}</p>}

          <button
            type="button"
            onClick={handleAddUrl}
            disabled={isAddingUrl}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {isAddingUrl ? <Loader2 size={14} className="animate-spin" /> : <LinkIcon size={14} />}
            URL 첨부 추가
          </button>
        </div>
      )}

      {/* 파일 목록 */}
      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          {pendingFiles.map(pf => (
            <div key={pf.key} className={`rounded-lg border p-3 flex items-center gap-3 ${
              pf.status === 'success' ? 'border-emerald-200 bg-emerald-50' :
              pf.status === 'error' ? 'border-red-200 bg-red-50' :
              'border-slate-200 bg-white'
            }`}>
              {/* 상태 아이콘 */}
              <div className="shrink-0">
                {pf.status === 'uploading' && <Loader2 size={18} className="animate-spin text-blue-500" />}
                {pf.status === 'success' && <CheckCircle size={18} className="text-emerald-500" />}
                {pf.status === 'error' && <AlertCircle size={18} className="text-red-500" />}
                {pf.status === 'idle' && <Paperclip size={18} className="text-slate-400" />}
              </div>

              {/* 파일 정보 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{pf.file.name}</p>
                <p className="text-xs text-slate-400">
                  {pf.source === 'url' ? '클라우드 URL 첨부' : `${(pf.file.size / 1024).toFixed(0)}KB`}
                  {pf.status === 'success' && (mode === 'remote' ? ' · 업로드 완료 (관리자 검토 대기)' : ' · 업로드 완료')}
                  {pf.status === 'error' && ` · 오류: ${pf.error}`}
                </p>
              </div>

              {/* 파일 유형 선택 */}
              {pf.status !== 'success' && (
                <select
                  value={pf.fileType}
                  onChange={e => updateFile(pf.key, { fileType: e.target.value as Attachment['file_type'] })}
                  className="text-xs border border-slate-200 rounded px-2 py-1 shrink-0"
                  disabled={pf.status === 'uploading'}
                >
                  {FILE_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              )}

              {/* 개별 업로드/삭제 버튼 */}
              <div className="flex gap-1 shrink-0">
                {pf.status === 'idle' && (
                  <button
                    type="button"
                    onClick={() => handleUpload(pf)}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    업로드
                  </button>
                )}
                {pf.status === 'error' && (
                  <button
                    type="button"
                    onClick={() => handleUpload(pf)}
                    className="text-xs bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-700"
                  >
                    재시도
                  </button>
                )}
                {pf.status === 'success' && pf.uploaded && (
                  <button
                    type="button"
                    onClick={() => setPreviewFile(pf.uploaded ?? null)}
                    className="text-xs bg-slate-700 text-white px-2 py-1 rounded hover:bg-slate-800 inline-flex items-center gap-1"
                  >
                    <Eye size={12} />
                    보기
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(pf)}
                  disabled={pf.status === 'uploading'}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-30"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* 전체 업로드 버튼 */}
          {pendingCount > 0 && (
            <button
              type="button"
              onClick={uploadAll}
              className="w-full inline-flex items-center justify-center gap-2 mt-2 px-3 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              <Upload size={16} />
              전체 업로드 ({pendingCount}개)
            </button>
          )}
        </div>
      )}

      {/* 업로드 완료 목록 */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50">
          <p className="text-sm font-semibold text-slate-700">업로드된 첨부 자료 ({uploadedFiles.length})</p>
          {uploadedFiles.map(file => (
            <div key={file.id} className="flex items-center justify-between gap-2 p-2 bg-white border border-slate-200 rounded-lg">
              <div className="min-w-0">
                <p className="text-sm text-slate-800 font-medium truncate">{file.original_name}</p>
                <p className="text-xs text-slate-400">
                  {file.file_type} · {file.source === 'url' ? 'URL 링크' : `${(file.size_bytes / 1024).toFixed(0)}KB`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFile(file)}
                className="shrink-0 text-xs px-2 py-1 rounded bg-slate-700 text-white hover:bg-slate-800 inline-flex items-center gap-1"
              >
                <Eye size={12} />
                보기
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 첨부파일 뷰어 */}
      {previewFile && (
        <div
          className="fixed inset-0 z-[70] bg-black/70 p-4 flex items-center justify-center"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="w-full max-w-5xl h-[85vh] bg-white rounded-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{previewFile.original_name}</p>
                <p className="text-xs text-slate-500">
                  {previewFile.file_type} · {previewFile.source === 'url' ? 'URL 링크' : `${(previewFile.size_bytes / 1024).toFixed(0)}KB`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 inline-flex items-center justify-center"
                aria-label="뷰어 닫기"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 bg-slate-100 overflow-auto">
              {previewFile.mime_type.startsWith('image/') ? (
                <div className="h-full w-full p-4 flex items-center justify-center">
                  <img
                    src={previewFile.file_url}
                    alt={previewFile.original_name}
                    className="max-h-full max-w-full object-contain rounded-lg bg-white"
                  />
                </div>
              ) : isPdf(previewFile) ? (
                <iframe title={previewFile.original_name} src={previewFile.file_url} className="w-full h-full" />
              ) : (
                <div className="h-full w-full p-6 flex flex-col items-center justify-center gap-3 text-center">
                  <FileText size={28} className="text-slate-500" />
                  <p className="text-slate-700 font-medium">이 형식은 인라인 미리보기를 지원하지 않습니다.</p>
                  <a
                    href={previewFile.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    새 창에서 열기
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
