'use client'

import { useState, useRef, useCallback } from 'react'
import { Paperclip, Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { uploadAttachment, deleteAttachment, UploadError } from '@/lib/api/upload'
import type { Attachment } from '@/types'

const FILE_TYPE_OPTIONS: Attachment['file_type'][] = [
  '판결문', '처분서', '공문', '녹취요약', '언론기사'
]

interface UploadedFile {
  id: string
  attachment: Attachment
  fileType: Attachment['file_type']
}

interface FileUploadProps {
  issueId: string
  onUploadComplete?: (attachment: Attachment) => void
}

type FileStatus = 'idle' | 'uploading' | 'success' | 'error'

interface PendingFile {
  key: string
  file: File
  fileType: Attachment['file_type']
  status: FileStatus
  error?: string
  attachment?: Attachment
}

export function FileUpload({ issueId, onUploadComplete }: FileUploadProps) {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [defaultFileType, setDefaultFileType] = useState<Attachment['file_type']>('처분서')
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((files: FileList | File[]) => {
    const newFiles: PendingFile[] = Array.from(files).map(file => ({
      key: `${Date.now()}-${Math.random()}`,
      file,
      fileType: defaultFileType,
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
      const attachment = await uploadAttachment(issueId, pf.file, pf.fileType)
      updateFile(pf.key, { status: 'success', attachment })
      onUploadComplete?.(attachment)
    } catch (e) {
      updateFile(pf.key, {
        status: 'error',
        error: e instanceof UploadError ? e.message : '업로드 실패'
      })
    }
  }

  const handleRemove = async (pf: PendingFile) => {
    if (pf.status === 'success' && pf.attachment) {
      try { await deleteAttachment(pf.attachment.id) } catch {}
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

      {/* 기본 파일 유형 선택 */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-1 block">기본 파일 유형</label>
        <select
          value={defaultFileType}
          onChange={e => setDefaultFileType(e.target.value as Attachment['file_type'])}
          className="input !w-auto text-sm"
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
                  {(pf.file.size / 1024).toFixed(0)}KB
                  {pf.status === 'success' && ' · 업로드 완료 (관리자 검토 대기)'}
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
                    onClick={() => handleUpload(pf)}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    업로드
                  </button>
                )}
                {pf.status === 'error' && (
                  <button
                    onClick={() => handleUpload(pf)}
                    className="text-xs bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-700"
                  >
                    재시도
                  </button>
                )}
                <button
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
              onClick={uploadAll}
              className="w-full btn-primary flex items-center justify-center gap-2 mt-2"
            >
              <Upload size={16} />
              전체 업로드 ({pendingCount}개)
            </button>
          )}
        </div>
      )}
    </div>
  )
}
