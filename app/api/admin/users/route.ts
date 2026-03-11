import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// user_profiles 테이블이 없을 때 반환할 SQL 안내
const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  level integer NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 4),
  display_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON public.user_profiles USING (true) WITH CHECK (true);
`.trim()

export async function GET() {
  try {
    // 1) user_profiles 테이블에서 회원 목록 조회
    const { data: profiles, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, level, display_name, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      // 테이블 없음 → SQL 안내 반환
      const isMissing =
        error.message.includes('does not exist') ||
        error.message.includes('relation') ||
        error.code === '42P01'
      if (isMissing) {
        return NextResponse.json({ data: [], setupSql: CREATE_TABLE_SQL }, { status: 200 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 2) auth.users 에서 가입일/마지막 로그인 보강
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
    const authMap: Record<string, { last_sign_in_at?: string; email_confirmed_at?: string }> = {}
    for (const u of authData?.users ?? []) {
      authMap[u.id] = {
        last_sign_in_at: u.last_sign_in_at ?? undefined,
        email_confirmed_at: u.email_confirmed_at ?? undefined,
      }
    }

    const enriched = (profiles ?? []).map(p => ({
      ...p,
      last_sign_in_at: authMap[p.id]?.last_sign_in_at ?? null,
      email_confirmed_at: authMap[p.id]?.email_confirmed_at ?? null,
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
