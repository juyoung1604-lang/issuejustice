// app/issues/[id]/page.tsx
import { notFound } from 'next/navigation'
import { getIssue, getStatusHistory } from '@/lib/api/issues'
import { getComments } from '@/lib/api/comments'
import { SupportButton } from '@/components/issues/SupportButton'
import { CommentList } from '@/components/comments/CommentList'
import { FileUpload } from '@/components/issues/FileUpload'
import { STATUS_CONFIG } from '@/types'
import { supabase } from '@/lib/supabase'
import { Paperclip, Calendar, MapPin } from 'lucide-react'

interface PageProps {
  params: { id: string }
}

export default async function IssueDetailPage({ params }: PageProps) {
  let issue: any, initialComments: any, statusHistory: any
  try {
    const { data: { user } } = await supabase.auth.getUser()
    ;[issue, initialComments, statusHistory] = await Promise.all([
      getIssue(params.id, user?.id),
      getComments(params.id),
      getStatusHistory(params.id),
    ])
  } catch {
    notFound()
  }

  const status = STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG]

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-6">
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${status.color}`}>
            {status.emoji} {status.label}
          </span>
          <span className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
            {issue.enforcement_type}
          </span>
          <span className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
            {issue.field_category}
          </span>
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-3">{issue.title}</h1>
        <p className="text-slate-500 mb-4">{issue.summary}</p>

        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin size={14} /> {issue.region}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {new Date(issue.occurred_at).toLocaleDateString('ko-KR')} 발생
          </span>
        </div>

        {/* 관련 기관 */}
        {issue.agencies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {issue.agencies.map((a: any, i: number) => (
              <span key={i} className="text-xs border border-slate-200 bg-slate-50 text-slate-600 px-2 py-1 rounded">
                {a.agency_name || a.agency_type}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 본문 */}
        <article className="lg:col-span-2 space-y-6">
          <Section title="사건 개요" content={issue.content_overview} />
          <Section title="문제가 된 법집행 내용" content={issue.content_problem} />
          <Section title="상식적으로 문제되는 지점" content={issue.content_common_sense} />
          {issue.content_comparison && (
            <Section title="유사 사례와의 비교" content={issue.content_comparison} />
          )}
          {issue.content_status && (
            <Section title="현재 진행 상황" content={issue.content_status} />
          )}

          {/* 파일 업로드 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">자료 첨부</h2>
            <FileUpload issueId={issue.id} />
          </div>

          {/* 댓글 시스템 */}
          <CommentList issueId={issue.id} initialComments={initialComments} />
        </article>

        {/* 사이드바 */}
        <aside className="space-y-4">
          {/* 추천 버튼 */}
          <SupportButton
            issueId={issue.id}
            initialCount={issue.support_count}
            initialSupported={issue.user_supported ?? false}
          />

          {/* 요청 사항 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-bold text-slate-800 mb-3">요청 사항</h3>
            <ul className="space-y-2">
              {issue.request_types.map((r: string) => (
                <li key={r} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="text-emerald-500">✓</span> {r}
                </li>
              ))}
            </ul>
          </div>

          {/* 첨부 자료 (승인된 것만) */}
          {issue.attachments.filter((a: any) => a.is_approved).length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-bold text-slate-800 mb-3">첨부 자료</h3>
              <ul className="space-y-2">
                {issue.attachments
                  .filter((a: any) => a.is_approved)
                  .map((a: any) => (
                    <li key={a.id}>
                      <a
                        href={a.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                      >
                        <Paperclip size={14} />
                        {a.original_name}
                        <span className="text-xs text-slate-400">({a.file_type})</span>
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* 상태 이력 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-bold text-slate-800 mb-3">진행 상태</h3>
            <ol className="space-y-2">
              {statusHistory.map((h: any, i: number) => (
                <li key={h.id} className="flex items-start gap-2 text-sm">
                  <span className={`mt-0.5 ${i === statusHistory.length - 1 ? 'text-blue-600' : 'text-slate-300'}`}>
                    ●
                  </span>
                  <div>
                    <p className="font-medium text-slate-700">{h.to_status}</p>
                    <p className="text-slate-400 text-xs">
                      {new Date(h.changed_at).toLocaleDateString('ko-KR')}
                      {h.note && ` · ${h.note}`}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </main>
  )
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">{title}</h2>
      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  )
}
