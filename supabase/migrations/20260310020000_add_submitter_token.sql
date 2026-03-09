-- ============================================================
-- Migration 003: 제보자 토큰 및 보완/철회 기능
-- ============================================================

-- 제보자 식별 토큰 (디바이스별 UUID, 비로그인 사용자 추적)
ALTER TABLE issues ADD COLUMN IF NOT EXISTS submitter_token UUID;

-- 보완 내용 (제보자가 추가하는 보충 정보)
ALTER TABLE issues ADD COLUMN IF NOT EXISTS supplement_note TEXT NOT NULL DEFAULT '';

-- 철회 요청 여부
ALTER TABLE issues ADD COLUMN IF NOT EXISTS withdrawal_requested BOOLEAN NOT NULL DEFAULT FALSE;

-- 토큰 기반 빠른 조회용 인덱스
CREATE INDEX IF NOT EXISTS idx_issues_submitter_token ON issues(submitter_token);
