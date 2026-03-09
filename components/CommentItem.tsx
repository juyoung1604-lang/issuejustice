'use client'

import { useState } from 'react'
import { ThumbsUp, MessageSquare, Pin } from 'lucide-react'
import { toggleCommentSupport } from '@/lib/api/comments'
import { supabase } from '@/lib/supabase'
import { CommentForm } from './CommentForm'
import type { Comment } from '@/types'

const TYPE_STYLES: Record<string, string> = {
  '사실보완':    'bg-emerald-50 text-emerald-700 border-emerald-200',
  '법률의견':    'bg-purple-50 text-purple-700 border-purple-200',
  '운영자코멘트': 'bg-amber-50 text-amber-700 border-amber-200',
  '일반':        'bg-slate-50 text-slate-500 border-slate-200',
}

interface CommentItemProps {
  comment: Comment
  issueId: string
  onReplySubmit: (comment: Comment, parentId: string) => void
  depth?: number
}

export function CommentItem({ comment, issueId, onReplySubmit, depth = 0 }: CommentItemProps) {
  const [supported, setSupported] = useState(false)
  const [supportCount, setSupportCount] = useState(comment.support_count)
  const [showReply, setShowReply] = useState(false)
  const [loading, setLoading] = useState(false)

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return '방금 전'
    if (mins < 60) return `${mins}분 전`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}시간 전`
    return `${Math.floor(hours / 24)}일 전`
  }

  const handleSupport = async () => {
    if (loading) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { alert('로그인이 필요합니다.'); return }
    setLoading(true)
    try {
      const result = await toggleCommentSupport(comment.id, user.id)
      setSupported(result.supported)
      setSupportCount(result.support_count)
    } finally {
      setLoading(false)
    }
  }

  const isOfficialComment = comment.type === '운영자코멘트'

  return (
    <div className={`${depth > 0 ? 'ml-8 pl-4 border-l-2 border-slate-100' : ''}`}>
      <div className={`rounded-lg p-4 ${isOfficialComment ? 'bg-amber-50 border border-amber-200' : 'bg-white border border-slate-100'}`}>
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {comment.is_pinned && (
              <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                <Pin size={11} /> 고정
              </span>
            )}
            {/* 댓글 유형 배지 */}
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TYPE_STYLES[comment.type] ?? TYPE_STYLES['일반']}`}>
              {comment.type}
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {isOfficialComment ? '🔔 운영자' : comment.author_nickname}
            </span>
          </div>
          <time className="text-xs text-slate-400 whitespace-nowrap">
            {timeAgo(comment.created_at)}
          </time>
        </div>

        {/* 본문 */}
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-3">
          {comment.content}
        </p>

        {/* 액션 */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSupport}
            disabled={loading}
            className={`flex items-center gap-1 text-xs font-medium transition-colors ${
              supported ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'
            }`}
          >
            <ThumbsUp size={13} fill={supported ? 'currentColor' : 'none'} />
            {supportCount > 0 ? supportCount : '도움돼요'}
          </button>

          {depth === 0 && (
            <button
              onClick={() => setShowReply(v => !v)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-500 font-medium transition-colors"
            >
              <MessageSquare size={13} />
              답글
            </button>
          )}
        </div>
      </div>

      {/* 답글 폼 */}
      {showReply && (
        <div className="mt-2 ml-8">
          <CommentForm
            issueId={issueId}
            parentId={comment.id}
            parentNickname={comment.author_nickname}
            onSubmit={newComment => {
              onReplySubmit(newComment, comment.id)
              setShowReply(false)
            }}
            onCancel={() => setShowReply(false)}
          />
        </div>
      )}

      {/* 대댓글 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              issueId={issueId}
              onReplySubmit={onReplySubmit}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
