import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: '토큰이 필요합니다.' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('issues')
    .select('id, title, status, is_published, overview, sense, requests, supplement_note, withdrawal_requested, created_at, region, enforcement_type')
    .eq('submitter_token', token)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
