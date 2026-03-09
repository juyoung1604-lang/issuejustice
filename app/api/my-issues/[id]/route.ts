import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { token, action, data: payload } = body

  if (!token || !action) {
    return NextResponse.json({ error: '토큰과 액션이 필요합니다.' }, { status: 400 })
  }

  // Verify ownership
  const { data: issue, error: fetchError } = await supabaseAdmin
    .from('issues')
    .select('id, status, is_published, supplement_note, submitter_token')
    .eq('id', id)
    .eq('submitter_token', token)
    .single()

  if (fetchError || !issue) {
    return NextResponse.json({ error: '이슈를 찾을 수 없거나 권한이 없습니다.' }, { status: 403 })
  }

  if (action === 'supplement') {
    // Append supplementary note — available for any non-종결 status
    if (issue.status === '종결') {
      return NextResponse.json({ error: '종결된 이슈는 보완할 수 없습니다.' }, { status: 400 })
    }
    const note = (payload?.note || '').trim()
    if (!note) return NextResponse.json({ error: '보완 내용을 입력해 주세요.' }, { status: 400 })

    const timestamp = new Date().toISOString().slice(0, 10)
    const appended = issue.supplement_note
      ? `${issue.supplement_note}\n\n[${timestamp}] ${note}`
      : `[${timestamp}] ${note}`

    const { error } = await supabaseAdmin
      .from('issues')
      .update({ supplement_note: appended })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (action === 'edit') {
    // Edit overview/sense — only when status is '접수됨' and not published
    if (issue.status !== '접수됨' || issue.is_published) {
      return NextResponse.json({ error: '접수됨 상태이고 미공개일 때만 내용을 수정할 수 있습니다.' }, { status: 400 })
    }
    const { overview, sense } = payload || {}
    const updates: Record<string, string> = {}
    if (overview !== undefined) updates.overview = overview
    if (sense !== undefined) updates.sense = sense
    if (overview !== undefined) updates.summary = overview.slice(0, 150)

    const { error } = await supabaseAdmin
      .from('issues')
      .update(updates)
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (action === 'withdraw') {
    // Withdraw — delete if not published, else set withdrawal_requested
    if (issue.status === '종결') {
      return NextResponse.json({ error: '종결된 이슈는 철회할 수 없습니다.' }, { status: 400 })
    }

    if (!issue.is_published) {
      const { error } = await supabaseAdmin
        .from('issues')
        .delete()
        .eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true, deleted: true })
    } else {
      const { error } = await supabaseAdmin
        .from('issues')
        .update({ withdrawal_requested: true })
        .eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true, deleted: false })
    }
  }

  return NextResponse.json({ error: '알 수 없는 액션입니다.' }, { status: 400 })
}
