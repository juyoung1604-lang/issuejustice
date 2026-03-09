-- ============================================================
-- Migration 001: 초기 스키마 생성
-- ============================================================

-- ── 확장 ──────────────────────────────────────────────────────

-- ── ENUM 타입 ─────────────────────────────────────────────────
CREATE TYPE issue_status AS ENUM ('접수됨', '검증중', '공론화진행', '기관전달', '종결');
CREATE TYPE issue_conclusion AS ENUM ('개선', '기각', '보류');
CREATE TYPE comment_type AS ENUM ('사실보완', '법률의견', '일반', '운영자코멘트');
CREATE TYPE report_status AS ENUM ('검토중', '처리완료', '기각');

-- ── 사용자 프로필 ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname    TEXT NOT NULL DEFAULT '익명',
  phone_hash  TEXT UNIQUE,               -- 휴대폰 번호 해시 (1인 1회 추천 식별)
  is_admin    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 회원가입 시 프로필 자동 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nickname)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nickname', '익명'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── 이슈 ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS issues (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  summary           TEXT NOT NULL,
  enforcement_type  TEXT NOT NULL,        -- 단속 유형 (예: 교통, 위생, 건축 등)
  field_category    TEXT NOT NULL,        -- 분야 카테고리
  region            TEXT NOT NULL,        -- 지역
  occurred_at       DATE,                 -- 발생일
  status            issue_status NOT NULL DEFAULT '접수됨',
  conclusion        issue_conclusion,
  support_count     INT NOT NULL DEFAULT 0,
  is_published      BOOLEAN NOT NULL DEFAULT FALSE,
  published_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- 공개된 이슈는 누구나 조회
CREATE POLICY "issues_select_published" ON issues
  FOR SELECT USING (is_published = TRUE);

-- 본인 이슈는 비공개도 조회 가능
CREATE POLICY "issues_select_own" ON issues
  FOR SELECT USING (auth.uid() = author_id);

-- 관리자는 전체 조회
CREATE POLICY "issues_select_admin" ON issues
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- 인증된 사용자만 등록
CREATE POLICY "issues_insert_authenticated" ON issues
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 관리자만 수정/삭제
CREATE POLICY "issues_update_admin" ON issues
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "issues_delete_admin" ON issues
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- ── 기관 정보 ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS issue_agencies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id     UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  agency_type  TEXT NOT NULL,   -- 기관 유형 (예: 경찰서, 구청 등)
  agency_name  TEXT NOT NULL,   -- 기관명
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE issue_agencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "issue_agencies_select" ON issue_agencies
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM issues WHERE id = issue_id AND (is_published = TRUE OR author_id = auth.uid()))
  );

CREATE POLICY "issue_agencies_insert" ON issue_agencies
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM issues WHERE id = issue_id AND author_id = auth.uid())
  );

-- ── 상태 이력 ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id    UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  from_status issue_status,
  to_status   issue_status NOT NULL,
  note        TEXT,
  changed_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "status_history_select" ON status_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM issues WHERE id = issue_id AND (is_published = TRUE OR author_id = auth.uid()))
  );

CREATE POLICY "status_history_insert_admin" ON status_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- ── 첨부파일 ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attachments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id      UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  file_url      TEXT NOT NULL,
  file_type     TEXT NOT NULL,          -- 'pdf' | 'image'
  original_name TEXT NOT NULL,
  is_approved   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- 승인된 첨부파일은 누구나 조회
CREATE POLICY "attachments_select_approved" ON attachments
  FOR SELECT USING (is_approved = TRUE);

-- 본인 이슈의 첨부파일은 조회 가능
CREATE POLICY "attachments_select_own" ON attachments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM issues WHERE id = issue_id AND author_id = auth.uid())
  );

-- 관리자 전체 조회
CREATE POLICY "attachments_select_admin" ON attachments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- 인증된 사용자 업로드
CREATE POLICY "attachments_insert" ON attachments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 본인 이슈 미승인 파일 삭제
CREATE POLICY "attachments_delete_own" ON attachments
  FOR DELETE USING (
    is_approved = FALSE AND
    EXISTS (SELECT 1 FROM issues WHERE id = issue_id AND author_id = auth.uid())
  );

-- 관리자 승인 처리
CREATE POLICY "attachments_update_admin" ON attachments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- ── 이슈 추천 ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS issue_supports (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id   UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason     TEXT,                       -- 추천 이유
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (issue_id, user_id)
);

ALTER TABLE issue_supports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "issue_supports_select" ON issue_supports
  FOR SELECT USING (TRUE);

CREATE POLICY "issue_supports_insert" ON issue_supports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "issue_supports_delete" ON issue_supports
  FOR DELETE USING (auth.uid() = user_id);

-- 추천 카운트 자동 동기화
CREATE OR REPLACE FUNCTION sync_issue_support_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE issues SET support_count = support_count + 1 WHERE id = NEW.issue_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE issues SET support_count = GREATEST(0, support_count - 1) WHERE id = OLD.issue_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_issue_support_count
  AFTER INSERT OR DELETE ON issue_supports
  FOR EACH ROW EXECUTE FUNCTION sync_issue_support_count();

-- ── 댓글 ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id        UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  parent_id       UUID REFERENCES comments(id) ON DELETE CASCADE,
  type            comment_type NOT NULL DEFAULT '일반',
  content         TEXT NOT NULL CHECK (char_length(content) <= 1000),
  author_nickname TEXT NOT NULL DEFAULT '익명',
  support_count   INT NOT NULL DEFAULT 0,
  is_hidden       BOOLEAN NOT NULL DEFAULT FALSE,
  is_pinned       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select" ON comments
  FOR SELECT USING (is_hidden = FALSE);

CREATE POLICY "comments_insert" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── 댓글 추천 ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comment_supports (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (comment_id, user_id)
);

ALTER TABLE comment_supports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comment_supports_select" ON comment_supports
  FOR SELECT USING (TRUE);

CREATE POLICY "comment_supports_insert" ON comment_supports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comment_supports_delete" ON comment_supports
  FOR DELETE USING (auth.uid() = user_id);

-- ── 신고 ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id    UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason      TEXT NOT NULL,
  status      report_status NOT NULL DEFAULT '검토중',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_insert" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reports_select_admin" ON reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "reports_update_admin" ON reports
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- ── 인덱스 ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_is_published ON issues(is_published);
CREATE INDEX IF NOT EXISTS idx_issues_support_count ON issues(support_count DESC);
CREATE INDEX IF NOT EXISTS idx_issues_author_id ON issues(author_id);
CREATE INDEX IF NOT EXISTS idx_issue_agencies_issue_id ON issue_agencies(issue_id);
CREATE INDEX IF NOT EXISTS idx_status_history_issue_id ON status_history(issue_id);
CREATE INDEX IF NOT EXISTS idx_attachments_issue_id ON attachments(issue_id);
CREATE INDEX IF NOT EXISTS idx_attachments_is_approved ON attachments(is_approved);
CREATE INDEX IF NOT EXISTS idx_comments_issue_id ON comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_issue_supports_issue_id ON issue_supports(issue_id);
