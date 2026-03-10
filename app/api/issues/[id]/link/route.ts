import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// 이슈의 submitter_token을 인증된 user_id로 교체하여 이메일 계정에 연결
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: issueId } = await params
  const { current_token, user_id } = await request.json()

  if (!current_token || !user_id) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
  }

  // 현재 토큰으로 이슈 소유권 확인
  const { data: issue } = await supabaseAdmin
    .from('issues')
    .select('id, submitter_token')
    .eq('id', issueId)
    .eq('submitter_token', current_token)
    .single()

  if (!issue) {
    return NextResponse.json({ error: '이슈를 찾을 수 없거나 권한이 없습니다.' }, { status: 403 })
  }

  const { error } = await supabaseAdmin
    .from('issues')
    .update({ submitter_token: user_id })
    .eq('id', issueId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
