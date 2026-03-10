import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const SELECT_FIELDS = 'id, title, status, is_published, overview, sense, requests, supplement_note, withdrawal_requested, created_at, region, enforcement_type'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  if (!token && !email) {
    return NextResponse.json({ error: '토큰 또는 이메일이 필요합니다.' }, { status: 400 })
  }

  if (email) {
    const normalizedEmail = email.toLowerCase().trim()
    const { data, error } = await supabaseAdmin
      .from('issues')
      .select(SELECT_FIELDS)
      .eq('submitter_email', normalizedEmail)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  }

  const { data, error } = await supabaseAdmin
    .from('issues')
    .select(SELECT_FIELDS)
    .eq('submitter_token', token)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
