-- ============================================================
-- Migration 006: email_otp_codes 테이블 생성
-- ============================================================
-- 커스텀 Gmail OTP 인증을 위한 코드 저장 테이블
-- send-otp API에서 코드를 저장하고, verify-otp API에서 검증 후 used=true로 마킹

CREATE TABLE IF NOT EXISTS email_otp_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  code        TEXT NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 만료된 코드 조회 최적화
CREATE INDEX IF NOT EXISTS idx_email_otp_codes_lookup
  ON email_otp_codes (email, code, used, expires_at);

-- 서버 사이드(supabaseAdmin)에서만 접근하므로 RLS 비활성화
-- (service role key는 RLS를 우회하므로 별도 정책 불필요)
ALTER TABLE email_otp_codes DISABLE ROW LEVEL SECURITY;
