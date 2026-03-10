-- ============================================================
-- Migration 010: comment_reports 테이블 생성
-- ============================================================

CREATE TABLE IF NOT EXISTS comment_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id      UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  issue_id        UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  reporter_email  TEXT NOT NULL,
  reason          TEXT NOT NULL,
  status          report_status NOT NULL DEFAULT '검토중',
  admin_note      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE comment_reports ENABLE ROW LEVEL SECURITY;

-- 자신의 신고 내역만 조회 (이메일 기반)
-- 실제 상용 환경에서는 auth.email() 혹은 verified_email과 대조해야 하나,
-- 본 프로젝트는 custom OTP와 submitter_email을 사용하므로 API 라우트에서 처리 권장.
-- 여기서는 기본적인 정책만 설정합니다.

-- 관리자는 전체 조회 가능
CREATE POLICY "comment_reports_select_admin" ON comment_reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- 익명 신고는 API를 통해 supabaseAdmin으로 처리하므로 정책 생략 가능.
-- 다만 보안을 위해 기본적인 조회 정책을 이메일 매칭으로 설정.
CREATE POLICY "comment_reports_select_own" ON comment_reports
  FOR SELECT USING (reporter_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_comment_reports_comment_id ON comment_reports(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reports_issue_id ON comment_reports(issue_id);
CREATE INDEX IF NOT EXISTS idx_comment_reports_reporter_email ON comment_reports(reporter_email);
