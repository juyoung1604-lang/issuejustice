-- ============================================================
-- Migration 002: 댓글 추천 트리거 + Storage 버킷 설정
-- ============================================================

-- ── 댓글 추천 카운트 동기화 함수 ─────────────────────────────
CREATE OR REPLACE FUNCTION increment_comment_support(comment_id UUID)
RETURNS VOID AS $$
  UPDATE comments SET support_count = support_count + 1 WHERE id = comment_id;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION decrement_comment_support(comment_id UUID)
RETURNS VOID AS $$
  UPDATE comments SET support_count = GREATEST(0, support_count - 1) WHERE id = comment_id;
$$ LANGUAGE SQL;

-- ── 댓글 추천 트리거 방식 (RPC 대신 사용 가능) ───────────────
CREATE OR REPLACE FUNCTION update_comment_support_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments SET support_count = support_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments SET support_count = GREATEST(0, support_count - 1) WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_comment_support_count
AFTER INSERT OR DELETE ON comment_supports
FOR EACH ROW EXECUTE FUNCTION update_comment_support_count();

-- ── 이슈 updated_at 자동 갱신 ────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_issues_updated_at
BEFORE UPDATE ON issues
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Storage 버킷 설정 ─────────────────────────────────────────
-- Supabase 대시보드 또는 아래 SQL로 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  false, -- 비공개 버킷 (서명된 URL로만 접근)
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: 인증된 사용자만 업로드, 관리자만 삭제
CREATE POLICY "attachments_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'attachments');

CREATE POLICY "attachments_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'attachments');

-- ── 댓글 RLS 보완 ────────────────────────────────────────────
CREATE POLICY "comments_update_own" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "comments_delete_own" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- ── 인덱스 추가 ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_comment_supports_comment_id ON comment_supports(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_supports_user_id ON comment_supports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
