'use client'

import { useMemo } from 'react'

interface FileViewerModalProps {
  open: boolean
  loading?: boolean
  fileName?: string
  fileUrl?: string
  mimeType?: string
  fileTypeLabel?: string
  onClose: () => void
}

function isImage(fileName: string, mimeType?: string): boolean {
  if (mimeType?.startsWith('image/')) return true
  const lower = fileName.toLowerCase()
  return ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].some(ext => lower.endsWith(ext))
}

function isPdf(fileName: string, mimeType?: string): boolean {
  if (mimeType === 'application/pdf') return true
  return fileName.toLowerCase().endsWith('.pdf')
}

export default function FileViewerModal({
  open,
  loading = false,
  fileName = '',
  fileUrl = '',
  mimeType,
  fileTypeLabel,
  onClose,
}: FileViewerModalProps) {
  const viewMode = useMemo(() => {
    if (isImage(fileName, mimeType)) return 'image'
    if (isPdf(fileName, mimeType)) return 'pdf'
    return 'unsupported'
  }, [fileName, mimeType])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[210] bg-gray-900/75 backdrop-blur-sm p-4 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl h-[88vh] bg-white rounded-[1.8rem] overflow-hidden smooth-shadow-xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-black text-gray-900 truncate">{fileName}</p>
            <p className="text-xs font-bold text-gray-400 mt-1">
              {fileTypeLabel ?? '첨부 자료'}
              {mimeType ? ` · ${mimeType}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center"
            aria-label="뷰어 닫기"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <div className="flex-1 bg-gray-100 relative">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-500">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin" />
              <p className="text-sm font-bold">첨부자료를 불러오는 중입니다...</p>
            </div>
          )}

          {!loading && !fileUrl && (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <i className="ri-error-warning-line text-3xl text-gray-300 mb-3" />
              <p className="text-sm font-bold text-gray-500">첨부 자료 URL이 없어 미리보기를 열 수 없습니다.</p>
            </div>
          )}

          {!loading && fileUrl && viewMode === 'image' && (
            <div className="h-full w-full p-5 flex items-center justify-center">
              <img src={fileUrl} alt={fileName} className="max-h-full max-w-full object-contain rounded-xl bg-white" />
            </div>
          )}

          {!loading && fileUrl && viewMode === 'pdf' && (
            <iframe title={fileName} src={fileUrl} className="w-full h-full" />
          )}

          {!loading && fileUrl && viewMode === 'unsupported' && (
            <div className="h-full flex flex-col items-center justify-center text-center px-6 gap-4">
              <i className="ri-file-line text-3xl text-gray-400" />
              <p className="text-sm font-bold text-gray-600">이 파일 형식은 인라인 뷰어를 지원하지 않습니다.</p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-black hover:bg-red-600 transition-colors"
              >
                새 탭에서 열기
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
