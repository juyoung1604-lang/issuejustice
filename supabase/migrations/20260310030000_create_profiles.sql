-- ============================================================
-- Migration 004: profiles 테이블 생성 및 트리거 안전화
-- ============================================================
-- 이메일 OTP 인증 시 신규 사용자 생성이 실패하는 문제 해결
-- "Database error saving new user" 원인:
--   on_auth_user_created 트리거가 profiles 테이블에 INSERT 시도 → 테이블 없어서 오류 → 사용자 생성 롤백

-- ── profiles 테이블 ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname    TEXT NOT NULL DEFAULT '익명',
  phone_hash  TEXT UNIQUE,
  is_admin    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 기존 정책이 있으면 덮어쓰기
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 트리거 함수가 SECURITY DEFINER 로 INSERT 하므로 별도 INSERT 정책 불필요
-- (단, 혹시 클라이언트가 직접 insert 할 경우를 위해 추가)
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ── 신규 사용자 → profiles 자동 생성 트리거 (안전 버전) ──────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', '익명')
  )
  ON CONFLICT (id) DO NOTHING;   -- 이미 존재하면 무시
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- profiles INSERT 가 어떤 이유로든 실패해도 사용자 생성은 계속 진행
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거가 이미 있으면 삭제 후 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── 기존 auth.users 에 대해 profiles 누락 행 채우기 ──────────
-- (이미 OTP로 가입된 사용자가 있을 경우 대비)
INSERT INTO public.profiles (id, nickname)
SELECT id, '익명'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
