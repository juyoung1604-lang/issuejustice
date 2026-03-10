import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const commentId = params.id
  const { issueId, reporterEmail, reason } = await request.json()

  if (!commentId || !issueId || !reporterEmail || !reason) {
    return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 })
  }

  const normalizedEmail = reporterEmail.toLowerCase().trim()

  // 1. 해당 이슈의 제보자인지 확인
  const { data: issue, error: issueError } = await supabaseAdmin
    .from('issues')
    .select('submitter_email')
    .eq('id', issueId)
    .single()

  if (issueError || !issue) {
    return NextResponse.json({ error: '이슈 정보를 찾을 수 없습니다.' }, { status: 404 })
  }

  if (issue.submitter_email?.toLowerCase().trim() !== normalizedEmail) {
    return NextResponse.json({ error: '자신이 제보한 이슈의 댓글만 신고할 수 있습니다.' }, { status: 403 })
  }

  // 2. 해당 댓글이 해당 이슈에 속하는지 확인
  const { data: comment, error: commentError } = await supabaseAdmin
    .from('comments')
    .select('id')
    .eq('id', commentId)
    .eq('issue_id', issueId)
    .single()

  if (commentError || !comment) {
    return NextResponse.json({ error: '해당 이슈에 속한 댓글을 찾을 수 없습니다.' }, { status: 404 })
  }

  // 3. 신고 등록
  const { error: reportError } = await supabaseAdmin
    .from('comment_reports')
    .insert({
      comment_id: commentId,
      issue_id: issueId,
      reporter_email: normalizedEmail,
      reason,
      status: '검토중'
    })

  if (reportError) {
    return NextResponse.json({ error: '신고 등록 중 오류가 발생했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
