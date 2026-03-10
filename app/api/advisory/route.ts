import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const status = searchParams.get('status')

  let query = supabaseAdmin
    .from('advisory_applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (type) query = query.eq('type', type)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { type, name, email, phone, profession, experience, motivation } = body

  if (!type || !name || !email || !profession || !experience || !motivation) {
    return NextResponse.json({ error: '필수 항목을 모두 입력해 주세요.' }, { status: 400 })
  }
  if (!['법률자문단', '시민배심원'].includes(type)) {
    return NextResponse.json({ error: '올바른 신청 유형을 선택해 주세요.' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('advisory_applications')
    .insert({ type, name: name.trim(), email: email.trim().toLowerCase(), phone: phone?.trim() || null, profession: profession.trim(), experience: experience.trim(), motivation: motivation.trim() })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id: data.id })
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const { id, status, admin_note } = body

  if (!id || !status) {
    return NextResponse.json({ error: 'id와 status가 필요합니다.' }, { status: 400 })
  }
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: '올바른 상태값이 아닙니다.' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('advisory_applications')
    .update({ status, admin_note: admin_note || null, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
