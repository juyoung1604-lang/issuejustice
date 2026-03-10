-- ============================================================
-- Migration 008: advisory_applications 테이블 생성
-- ============================================================
-- 법률자문단 및 시민배심원 신청을 저장

CREATE TABLE IF NOT EXISTS advisory_applications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL CHECK (type IN ('법률자문단', '시민배심원')),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  profession  TEXT NOT NULL,
  experience  TEXT NOT NULL,
  motivation  TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_advisory_type   ON advisory_applications (type);
CREATE INDEX IF NOT EXISTS idx_advisory_status ON advisory_applications (status);
CREATE INDEX IF NOT EXISTS idx_advisory_email  ON advisory_applications (email);

-- supabaseAdmin(service role)에서만 접근하므로 RLS 비활성화
ALTER TABLE advisory_applications DISABLE ROW LEVEL SECURITY;
