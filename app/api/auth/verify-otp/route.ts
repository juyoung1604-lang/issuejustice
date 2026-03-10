import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const { email, code } = await request.json()

  if (!email || !code) {
    return NextResponse.json({ error: '이메일과 코드를 입력해 주세요.' }, { status: 400 })
  }

  const normalizedEmail = email.toLowerCase().trim()
  const now = new Date().toISOString()

  const { data, error } = await supabaseAdmin
    .from('email_otp_codes')
    .select('id, code, used, expires_at')
    .eq('email', normalizedEmail)
    .eq('code', code.trim())
    .eq('used', false)
    .gt('expires_at', now)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: '코드가 올바르지 않거나 만료되었습니다.' }, { status: 400 })
  }

  // Mark code as used
  await supabaseAdmin
    .from('email_otp_codes')
    .update({ used: true })
    .eq('id', data.id)

  return NextResponse.json({ ok: true })
}
