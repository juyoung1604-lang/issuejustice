-- ============================================================
-- Migration 002: 이슈 콘텐츠 필드 추가
-- ============================================================

-- 이슈 상세 내용 컬럼 추가
ALTER TABLE issues ADD COLUMN IF NOT EXISTS overview TEXT NOT NULL DEFAULT '';
ALTER TABLE issues ADD COLUMN IF NOT EXISTS problem  TEXT NOT NULL DEFAULT '';
ALTER TABLE issues ADD COLUMN IF NOT EXISTS sense    TEXT NOT NULL DEFAULT '';
ALTER TABLE issues ADD COLUMN IF NOT EXISTS requests TEXT[] NOT NULL DEFAULT '{}';

-- summary 를 선택 필드로 변경 (개요에서 자동 생성)
ALTER TABLE issues ALTER COLUMN summary DROP NOT NULL;
ALTER TABLE issues ALTER COLUMN summary SET DEFAULT '';

-- 비인증 이슈 제출 허용 (API 라우트에서 서비스 롤로 처리)
DROP POLICY IF EXISTS "issues_insert_authenticated" ON issues;
CREATE POLICY "issues_insert_any" ON issues
  FOR INSERT WITH CHECK (true);
