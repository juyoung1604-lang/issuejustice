'use client'

import { useState } from 'react'
import { createComment } from '@/lib/api/comments'
import { supabase } from '@/lib/supabase'
import type { Comment, CommentType } from '@/types'

const COMMENT_TYPES: { value: CommentType; label: string; description: string }[] = [
  { value: '사실보완', label: '사실 보완', description: '관련 사실이나 자료 추가' },
  { value: '법률의견', label: '법률 의견', description: '법적 해석 또는 판례 제시' },
  { value: '일반', label: '일반 의견', description: '기타 의견' },
]

interface CommentFormProps {
  issueId: string
  parentId?: string
  parentNickname?: string
  onSubmit: (comment: Comment) => void
  onCancel?: () => void
  placeholder?: string
}

export function CommentForm({
  issueId, parentId, parentNickname,
  onSubmit, onCancel, placeholder
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [type, setType] = useState<CommentType>('일반')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!content.trim()) return
    setError('')
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('로그인이 필요합니다.'); return }

      const comment = await createComment({
        issueId, userId: user.id, content: content.trim(),
        type: parentId ? '일반' : type,
        parentId,
      })
      setContent('')
      onSubmit(comment)
    } catch (e) {
      setError('작성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${parentId ? 'ml-8 mt-2' : ''}`}>
      {/* 답글 대상 표시 */}
      {parentNickname && (
        <p className="text-xs text-blue-600 mb-1">
          @{parentNickname}님께 답글
        </p>
      )}

      {/* 댓글 유형 선택 (최상위 댓글만) */}
      {!parentId && (
        <div className="flex gap-2 mb-3">
          {COMMENT_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              title={t.description}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                type === t.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={placeholder ?? '사실 중심의 의견을 작성해 주세요. 감정적 비방은 삭제될 수 있습니다.'}
        maxLength={1000}
        rows={parentId ? 3 : 4}
        className="input resize-none"
      />

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-slate-400">{content.length}/1000</span>
        <div className="flex gap-2">
          {onCancel && (
            <button onClick={onCancel} className="btn-secondary text-xs px-3 py-1.5">
              취소
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
            className="btn-primary text-xs px-4 py-1.5"
          >
            {loading ? '등록 중...' : (parentId ? '답글 등록' : '댓글 등록')}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
