// lib/api/admin.ts
import { supabaseAdmin } from '@/lib/supabase'
import type { IssueStatus, IssueConclusion } from '@/types'

// ── 미승인 이슈 목록 ──────────────────────────────────────────
export async function getPendingIssues() {
  const { data, error } = await supabaseAdmin
    .from('issues')
    .select(`
      id, title, summary, enforcement_type, field_category,
      region, occurred_at, status, support_count, is_published,
      created_at, author_id,
      agencies:issue_agencies(agency_type, agency_name)
    `)
    .eq('is_published', false)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// ── 전체 이슈 (관리자용) ──────────────────────────────────────
export async function getAllIssuesAdmin(page = 1, perPage = 30) {
  const from = (page - 1) * perPage
  const { data, error, count } = await supabaseAdmin
    .from('issues')
    .select(`
      id, title, summary, enforcement_type, field_category,
      region, status, support_count, is_published, created_at
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + perPage - 1)

  if (error) throw error
  return { data: data ?? [], total: count ?? 0 }
}

// ── 이슈 승인 (공개) ─────────────────────────────────────────
export async function approveIssue(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('issues')
    .update({ is_published: true, published_at: new Date().toISOString(), status: '접수됨' })
    .eq('id', id)

  if (error) throw error

  // 상태 이력 기록
  await supabaseAdmin.from('status_history').insert({
    issue_id: id,
    from_status: null,
    to_status: '접수됨',
    note: '관리자 검토 완료 - 공개',
  })
}

// ── 이슈 거절 (삭제) ─────────────────────────────────────────
export async function rejectIssue(id: string, reason: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('issues')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ── 이슈 상태 변경 ───────────────────────────────────────────
export async function updateIssueStatus(
  id: string,
  newStatus: IssueStatus,
  note?: string,
  conclusion?: IssueConclusion
): Promise<void> {
  // 현재 상태 조회
  const { data: current } = await supabaseAdmin
    .from('issues')
    .select('status')
    .eq('id', id)
    .single()

  const updateData: Record<string, unknown> = { status: newStatus }
  if (conclusion) updateData.conclusion = conclusion

  const { error } = await supabaseAdmin
    .from('issues')
    .update(updateData)
    .eq('id', id)

  if (error) throw error

  // 상태 이력 기록
  await supabaseAdmin.from('status_history').insert({
    issue_id: id,
    from_status: current?.status ?? null,
    to_status: newStatus,
    note: note ?? null,
  })
}

// ── 첨부파일 승인 ────────────────────────────────────────────
export async function approveAttachment(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('attachments')
    .update({ is_approved: true })
    .eq('id', id)

  if (error) throw error
}

// ── 미승인 첨부파일 목록 ──────────────────────────────────────
export async function getPendingAttachments() {
  const { data, error } = await supabaseAdmin
    .from('attachments')
    .select(`
      id, issue_id, file_url, file_type, original_name, created_at,
      issues:issue_id (title)
    `)
    .eq('is_approved', false)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// ── 신고 목록 ────────────────────────────────────────────────
export async function getReports() {
  const { data, error } = await supabaseAdmin
    .from('reports')
    .select(`
      id, reason, status, created_at,
      issues:issue_id (id, title),
      reporters:reporter_id (nickname)
    `)
    .eq('status', '검토중')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// ── 신고 처리 ────────────────────────────────────────────────
export async function resolveReport(
  id: string,
  status: '처리완료' | '기각'
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('reports')
    .update({ status })
    .eq('id', id)

  if (error) throw error
}

// ── 댓글 숨김 처리 ───────────────────────────────────────────
export async function hideComment(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('comments')
    .update({ is_hidden: true })
    .eq('id', id)

  if (error) throw error
}

// ── 대시보드 통계 ─────────────────────────────────────────────
export async function getDashboardStats() {
  const [issues, pending, attachments, reports] = await Promise.all([
    supabaseAdmin.from('issues').select('status', { count: 'exact', head: false }),
    supabaseAdmin.from('issues').select('id', { count: 'exact', head: true }).eq('is_published', false),
    supabaseAdmin.from('attachments').select('id', { count: 'exact', head: true }).eq('is_approved', false),
    supabaseAdmin.from('reports').select('id', { count: 'exact', head: true }).eq('status', '검토중'),
  ])

  // 상태별 카운트
  const statusCounts: Record<string, number> = {}
  for (const row of (issues.data ?? [])) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1
  }

  return {
    totalIssues: issues.count ?? 0,
    pendingApproval: pending.count ?? 0,
    pendingAttachments: attachments.count ?? 0,
    pendingReports: reports.count ?? 0,
    statusCounts,
  }
}
