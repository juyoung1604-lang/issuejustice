'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  LayoutDashboard, FileText, Paperclip, Flag,
  CheckCircle, XCircle, ChevronDown, RefreshCw,
  Eye, AlertTriangle, TrendingUp, Clock
} from 'lucide-react'
import {
  getDashboardStats, getPendingIssues, approveIssue, rejectIssue,
  updateIssueStatus, getPendingAttachments, approveAttachment,
  getReports, resolveReport
} from '@/lib/api/admin'
import type { IssueStatus, IssueConclusion } from '@/types'
import { STATUS_CONFIG } from '@/types'

type Tab = 'dashboard' | 'pending' | 'attachments' | 'reports'

// ── 상태 변경 모달 ────────────────────────────────────────────
function StatusModal({
  issueId, currentStatus, onClose, onUpdate
}: {
  issueId: string
  currentStatus: IssueStatus
  onClose: () => void
  onUpdate: () => void
}) {
  const [status, setStatus] = useState<IssueStatus>(currentStatus)
  const [note, setNote] = useState('')
  const [conclusion, setConclusion] = useState<IssueConclusion | ''>('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await updateIssueStatus(issueId, status, note || undefined, conclusion || undefined)
      onUpdate()
      onClose()
    } catch (e) {
      alert('상태 변경 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="font-bold text-lg mb-4">이슈 상태 변경</h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">상태 *</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(STATUS_CONFIG) as IssueStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`text-sm px-3 py-2 rounded-lg border text-left transition-colors ${
                    status === s
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {STATUS_CONFIG[s].emoji} {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>

          {status === '종결' && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">종결 결과</label>
              <select
                value={conclusion}
                onChange={e => setConclusion(e.target.value as IssueConclusion | '')}
                className="input"
              >
                <option value="">선택 (선택사항)</option>
                <option value="개선">개선</option>
                <option value="기각">기각</option>
                <option value="보류">보류</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">메모 (선택)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="변경 사유나 참고사항을 입력하세요."
              className="input resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">취소</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
            {loading ? '변경 중...' : '변경 확인'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 거절 모달 ─────────────────────────────────────────────────
function RejectModal({
  issueId, onClose, onUpdate
}: {
  issueId: string
  onClose: () => void
  onUpdate: () => void
}) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReject = async () => {
    setLoading(true)
    try {
      await rejectIssue(issueId, reason)
      onUpdate()
      onClose()
    } catch {
      alert('거절 처리 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="font-bold text-lg mb-2 text-red-600">이슈 게시 거절</h3>
        <p className="text-sm text-slate-500 mb-4">삭제된 이슈는 복구할 수 없습니다.</p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={3}
          placeholder="거절 사유를 입력하세요. (내부용)"
          className="input resize-none mb-4"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1">취소</button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="flex-1 bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
          >
            {loading ? '처리 중...' : '거절 확정'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 메인 관리자 페이지 ────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null)
  const [pendingIssues, setPendingIssues] = useState<any[]>([])
  const [pendingAttachments, setPendingAttachments] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 모달 상태
  const [statusModal, setStatusModal] = useState<{ issueId: string; currentStatus: IssueStatus } | null>(null)
  const [rejectModal, setRejectModal] = useState<string | null>(null) // issueId

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [s, p, a, r] = await Promise.all([
        getDashboardStats(),
        getPendingIssues(),
        getPendingAttachments(),
        getReports(),
      ])
      setStats(s)
      setPendingIssues(p)
      setPendingAttachments(a)
      setReports(r)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleApprove = async (id: string) => {
    await approveIssue(id)
    loadData()
  }

  const handleApproveAttachment = async (id: string) => {
    await approveAttachment(id)
    loadData()
  }

  const handleResolveReport = async (id: string, status: '처리완료' | '기각') => {
    await resolveReport(id, status)
    loadData()
  }

  const TABS = [
    { id: 'dashboard' as Tab, label: '대시보드', icon: LayoutDashboard, badge: 0 },
    { id: 'pending' as Tab, label: '승인 대기', icon: FileText, badge: stats?.pendingApproval ?? 0 },
    { id: 'attachments' as Tab, label: '첨부파일', icon: Paperclip, badge: stats?.pendingAttachments ?? 0 },
    { id: 'reports' as Tab, label: '신고 처리', icon: Flag, badge: stats?.pendingReports ?? 0 },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 관리자 헤더 */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">🔔 시민신문고 관리자</h1>
          <p className="text-slate-400 text-xs mt-0.5">Admin Panel</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          새로고침
        </button>
      </header>

      <div className="flex">
        {/* 사이드바 */}
        <aside className="w-56 bg-white border-r border-slate-200 min-h-[calc(100vh-60px)] p-4">
          <nav className="space-y-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <t.icon size={16} />
                  {t.label}
                </span>
                {t.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {t.badge > 9 ? '9+' : t.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* 콘텐츠 */}
        <main className="flex-1 p-6">

          {/* ── 대시보드 탭 ── */}
          {tab === 'dashboard' && stats && (
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-6">대시보드</h2>

              {/* 통계 카드 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: '전체 이슈', value: stats.totalIssues, icon: FileText, color: 'text-blue-600 bg-blue-50' },
                  { label: '승인 대기', value: stats.pendingApproval, icon: Clock, color: 'text-amber-600 bg-amber-50' },
                  { label: '첨부 미승인', value: stats.pendingAttachments, icon: Paperclip, color: 'text-purple-600 bg-purple-50' },
                  { label: '미처리 신고', value: stats.pendingReports, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
                ].map(card => (
                  <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
                      <card.icon size={18} />
                    </div>
                    <p className="text-2xl font-black text-slate-900">{card.value}</p>
                    <p className="text-sm text-slate-500">{card.label}</p>
                  </div>
                ))}
              </div>

              {/* 상태별 현황 */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp size={16} /> 이슈 상태별 현황
                </h3>
                <div className="space-y-3">
                  {(Object.keys(STATUS_CONFIG) as IssueStatus[]).map(s => {
                    const count = stats.statusCounts[s] ?? 0
                    const max = Math.max(...Object.values(stats.statusCounts), 1)
                    const pct = Math.round((count / max) * 100)
                    return (
                      <div key={s} className="flex items-center gap-3">
                        <span className="text-sm w-24 text-slate-600">{STATUS_CONFIG[s].emoji} {STATUS_CONFIG[s].label}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-700 w-8 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── 승인 대기 탭 ── */}
          {tab === 'pending' && (
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-6">
                승인 대기 이슈 <span className="text-slate-400 font-normal text-base">({pendingIssues.length}건)</span>
              </h2>

              {pendingIssues.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <CheckCircle size={40} className="mx-auto mb-2 opacity-30" />
                  <p>대기 중인 이슈가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingIssues.map(issue => (
                    <div key={issue.id} className="bg-white rounded-xl border border-slate-200 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              {issue.enforcement_type}
                            </span>
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              {issue.field_category}
                            </span>
                            <span className="text-xs text-slate-400">{issue.region}</span>
                          </div>
                          <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{issue.title}</h3>
                          <p className="text-sm text-slate-500 line-clamp-2">{issue.summary}</p>
                          <p className="text-xs text-slate-400 mt-2">
                            제출: {new Date(issue.created_at).toLocaleString('ko-KR')}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                          <a
                            href={`/issues/${issue.id}`}
                            target="_blank"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                          >
                            <Eye size={12} /> 미리보기
                          </a>
                          <button
                            onClick={() => handleApprove(issue.id)}
                            className="flex items-center gap-1 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 font-medium"
                          >
                            <CheckCircle size={13} /> 승인
                          </button>
                          <button
                            onClick={() => setStatusModal({ issueId: issue.id, currentStatus: issue.status })}
                            className="flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 font-medium"
                          >
                            <ChevronDown size={13} /> 상태변경
                          </button>
                          <button
                            onClick={() => setRejectModal(issue.id)}
                            className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 font-medium"
                          >
                            <XCircle size={13} /> 거절
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── 첨부파일 탭 ── */}
          {tab === 'attachments' && (
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-6">
                미승인 첨부파일 <span className="text-slate-400 font-normal text-base">({pendingAttachments.length}건)</span>
              </h2>

              {pendingAttachments.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Paperclip size={40} className="mx-auto mb-2 opacity-30" />
                  <p>승인 대기 중인 파일이 없습니다.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-left text-slate-500">
                        <th className="px-4 py-3 font-medium">파일</th>
                        <th className="px-4 py-3 font-medium">유형</th>
                        <th className="px-4 py-3 font-medium">연결 이슈</th>
                        <th className="px-4 py-3 font-medium">제출일</th>
                        <th className="px-4 py-3 font-medium">액션</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingAttachments.map(att => (
                        <tr key={att.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <a href={att.file_url} target="_blank" className="text-blue-600 hover:underline truncate max-w-[180px] block">
                              {att.original_name}
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{att.file_type}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 truncate max-w-[200px]">
                            {(att as any).issues?.title ?? '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            {new Date(att.created_at).toLocaleDateString('ko-KR')}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleApproveAttachment(att.id)}
                              className="flex items-center gap-1 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 font-medium"
                            >
                              <CheckCircle size={12} /> 승인
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── 신고 처리 탭 ── */}
          {tab === 'reports' && (
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-6">
                신고 처리 <span className="text-slate-400 font-normal text-base">({reports.length}건)</span>
              </h2>

              {reports.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Flag size={40} className="mx-auto mb-2 opacity-30" />
                  <p>처리할 신고가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map(report => (
                    <div key={report.id} className="bg-white rounded-xl border border-red-100 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 mb-1">
                            이슈: {(report as any).issues?.title ?? report.issue_id}
                          </p>
                          <p className="text-sm text-slate-600 mb-2">
                            <span className="text-slate-400">사유:</span> {report.reason}
                          </p>
                          <p className="text-xs text-slate-400">
                            신고자: {(report as any).reporters?.nickname ?? '알 수 없음'} ·
                            {new Date(report.created_at).toLocaleString('ko-KR')}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <a
                            href={`/issues/${(report as any).issues?.id}`}
                            target="_blank"
                            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                          >
                            <Eye size={12} /> 확인
                          </a>
                          <button
                            onClick={() => handleResolveReport(report.id, '처리완료')}
                            className="flex items-center gap-1 text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 font-medium"
                          >
                            <CheckCircle size={12} /> 처리
                          </button>
                          <button
                            onClick={() => handleResolveReport(report.id, '기각')}
                            className="flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 font-medium"
                          >
                            <XCircle size={12} /> 기각
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 모달들 */}
      {statusModal && (
        <StatusModal
          issueId={statusModal.issueId}
          currentStatus={statusModal.currentStatus}
          onClose={() => setStatusModal(null)}
          onUpdate={loadData}
        />
      )}
      {rejectModal && (
        <RejectModal
          issueId={rejectModal}
          onClose={() => setRejectModal(null)}
          onUpdate={loadData}
        />
      )}
    </div>
  )
}
