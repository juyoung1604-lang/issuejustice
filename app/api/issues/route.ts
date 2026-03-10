import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()
  const { title, enforcement_type, field_category, region, occurred_at, overview, sense, requests, submitter_token, submitter_email } = body

  if (!title || !enforcement_type || !field_category || !region) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
  }

  const summary = (overview || '').slice(0, 150)

  const { data, error } = await supabaseAdmin
    .from('issues')
    .insert({
      title,
      summary,
      enforcement_type,
      field_category,
      region,
      occurred_at: occurred_at || null,
      overview: overview || '',
      problem: '',
      sense: sense || '',
      requests: requests || [],
      status: '접수됨',
      is_published: false,
      submitter_token: submitter_token || null,
      submitter_email: submitter_email || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data }, { status: 201 })
}
