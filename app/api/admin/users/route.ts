import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Supabase SQL Editor에서 1회 실행 필요한 초기 설정 SQL
const CREATE_TABLE_SQL = `
-- 1) user_profiles 테이블 생성 (이메일 기반, Supabase Auth FK 없음)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  level integer NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 4),
  display_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON public.user_profiles
  USING (true) WITH CHECK (true);

-- 2) Supabase Auth 신규 가입 시 자동 등록 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (email, level, display_name)
  VALUES (
    NEW.email,
    1,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  )
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`.trim()

export async function GET() {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, level, display_name, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      const isMissing =
        error.message.includes('does not exist') ||
        error.message.includes('relation') ||
        error.code === '42P01'
      if (isMissing) {
        return NextResponse.json({ data: [], setupSql: CREATE_TABLE_SQL }, { status: 200 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // auth.users 에서 마지막 로그인 정보 보강 (이메일 키로 매칭)
    let authMap: Record<string, { last_sign_in_at?: string; email_confirmed_at?: string }> = {}
    try {
      const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
      for (const u of authData?.users ?? []) {
        if (u.email) {
          authMap[u.email] = {
            last_sign_in_at: u.last_sign_in_at ?? undefined,
            email_confirmed_at: u.email_confirmed_at ?? undefined,
          }
        }
      }
    } catch { /* auth.admin 권한 없으면 무시 */ }

    const enriched = (profiles ?? []).map(p => ({
      ...p,
      last_sign_in_at: authMap[p.email]?.last_sign_in_at ?? null,
      email_confirmed_at: authMap[p.email]?.email_confirmed_at ?? null,
    }))

    return NextResponse.json({ data: enriched })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, level, display_name } = await request.json()

    if (!id) return NextResponse.json({ error: 'id가 필요합니다.' }, { status: 400 })
    if (level !== undefined && (typeof level !== 'number' || level < 1 || level > 4)) {
      return NextResponse.json({ error: '레벨은 1~4 사이여야 합니다.' }, { status: 400 })
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (level !== undefined) updates.level = level
    if (display_name !== undefined) updates.display_name = display_name

    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update(updates)
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'id가 필요합니다.' }, { status: 400 })

    const { error } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
