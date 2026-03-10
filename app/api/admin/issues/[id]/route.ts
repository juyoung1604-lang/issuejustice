import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { action, status, note } = body

  if (action === 'approve') {
    const { error } = await supabaseAdmin
      .from('issues')
      .update({
        is_published: true,
        status: '검증중',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (action === 'publish') {
    const { error } = await supabaseAdmin
      .from('issues')
      .update({ is_published: true, published_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (action === 'unpublish') {
    const { error } = await supabaseAdmin
      .from('issues')
      .update({ is_published: false, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (action === 'reject') {
    const { error } = await supabaseAdmin.from('issues').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (action === 'status') {
    if (!status) return NextResponse.json({ error: '상태값이 필요합니다.' }, { status: 400 })

    const { data: current } = await supabaseAdmin
      .from('issues')
      .select('status')
      .eq('id', id)
      .single()

    const { error } = await supabaseAdmin
      .from('issues')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await supabaseAdmin.from('status_history').insert({
      issue_id: id,
      from_status: current?.status || null,
      to_status: status,
      note: note || null,
    })

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: '알 수 없는 액션입니다.' }, { status: 400 })
}
