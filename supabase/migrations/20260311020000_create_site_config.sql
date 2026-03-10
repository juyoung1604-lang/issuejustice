-- ============================================================
-- Migration 007: site_config 테이블 생성
-- ============================================================
-- 사이트 전역 설정을 key-value 형태로 저장
-- 관리자 페이지에서 수정, 홈페이지에서 읽어서 적용

CREATE TABLE IF NOT EXISTS site_config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 기본값 삽입: 샘플 이슈 표시 (true)
INSERT INTO site_config (key, value)
VALUES ('show_sample_issues', 'true')
ON CONFLICT (key) DO NOTHING;

-- 서버 사이드(supabaseAdmin)에서만 접근하므로 RLS 비활성화
ALTER TABLE site_config DISABLE ROW LEVEL SECURITY;
