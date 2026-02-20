'use client'

import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { getComments } from '@/lib/api/comments'
import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'
import type { Comment } from '@/types'

interface CommentListProps {
  issueId: string
  initialComments?: Comment[]
}

export function CommentList({ issueId, initialComments }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments ?? [])
  const [sort, setSort] = useState<'support_count' | 'latest'>('support_count')
  const [loading, setLoading] = useState(!initialComments)

  useEffect(() => {
    if (initialComments) return
    setLoading(true)
    getComments(issueId, sort)
      .then(setComments)
      .finally(() => setLoading(false))
  }, [issueId, sort, initialComments])

  const handleNewComment = (comment: Comment) => {
    setComments(prev => [comment, ...prev])
  }

  const handleReplySubmit = (reply: Comment, parentId: string) => {
    setComments(prev => prev.map(c => {
      if (c.id === parentId) {
        return { ...c, replies: [...(c.replies ?? []), reply] }
      }
      return c
    }))
  }

  const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0)

  return (
    <section className="mt-8">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-slate-900 flex items-center gap-2">
          <MessageCircle size={18} />
          댓글 <span className="text-slate-400 font-normal text-sm">{totalCount}개</span>
        </h2>
        <div className="flex gap-1">
          {(['support_count', 'latest'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                sort === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'support_count' ? '추천순' : '최신순'}
            </button>
          ))}
        </div>
      </div>

      {/* 운영 원칙 안내 */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 text-xs text-slate-500">
        💡 사실 보완 및 법률 의견 중심으로 작성해 주세요. 감정적 비방, 욕설은 운영자에 의해 삭제될 수 있습니다.
      </div>

      {/* 댓글 작성 폼 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <CommentForm issueId={issueId} onSubmit={handleNewComment} />
      </div>

      {/* 댓글 목록 */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg border border-slate-100 p-4 animate-pulse">
              <div className="h-3 bg-slate-200 rounded w-1/4 mb-3" />
              <div className="h-3 bg-slate-200 rounded w-full mb-2" />
              <div className="h-3 bg-slate-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
          <p>아직 댓글이 없습니다. 첫 의견을 남겨보세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              issueId={issueId}
              onReplySubmit={handleReplySubmit}
            />
          ))}
        </div>
      )}
    </section>
  )
}
