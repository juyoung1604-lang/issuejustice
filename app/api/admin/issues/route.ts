import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filter = searchParams.get('filter')

  let query = supabaseAdmin
    .from('issues')
    .select('*')
    .order('created_at', { ascending: false })

  if (filter === 'pending') {
    query = query.eq('is_published', false).neq('status', '종결')
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
