import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const SELECT_FIELDS = 'id, title, status, is_published, overview, sense, requests, supplement_note, withdrawal_requested, created_at, region, enforcement_type, submitter_email'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  if (!token && !email) {
    return NextResponse.json({ error: '토큰 또는 이메일이 필요합니다.' }, { status: 400 })
  }

  let query = supabaseAdmin
    .from('issues')
    .select(SELECT_FIELDS)

  if (email) {
    const normalizedEmail = email.toLowerCase().trim()
    query = query.eq('submitter_email', normalizedEmail)
  } else if (token) {
    query = query.eq('submitter_token', token)
  }

  const { data: issues, error } = await query.order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!issues || issues.length === 0) {
    return NextResponse.json({ data: [] })
  }

  // Fetch reports for these issues
  const issueIds = issues.map(i => i.id)
  const { data: reports, error: reportsError } = await supabaseAdmin
    .from('comment_reports')
    .select('*, comment:comments(content, author_nickname)')
    .in('issue_id', issueIds)
    .order('created_at', { ascending: false })

  if (reportsError) {
    console.error('Failed to fetch reports:', reportsError)
  }

  const data = issues.map(issue => ({
    ...issue,
    comment_reports: reports?.filter(r => r.issue_id === issue.id) || []
  }))

  return NextResponse.json({ data })
}
