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

  // user_profiles 자동 등록 (신규 이메일이면 Lv.1으로 생성, 기존이면 무시)
  await supabaseAdmin
    .from('user_profiles')
    .upsert(
      { email: normalizedEmail, level: 1, updated_at: new Date().toISOString() },
      { onConflict: 'email', ignoreDuplicates: true }
    )
    .select()
    .maybeSingle()
  // 테이블 미존재 등 오류는 무시 (인증 자체는 성공 처리)

  return NextResponse.json({ ok: true })
}
