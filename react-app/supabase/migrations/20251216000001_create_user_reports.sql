-- =============================================
-- 신고관리 시스템 테이블 생성
-- 작성일: 2025-12-16
-- =============================================

-- 1. 신고 테이블 (user_reports)
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 신고자 정보
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_email VARCHAR(255),
  reporter_ip INET,

  -- 신고 대상
  target_type TEXT NOT NULL CHECK (target_type IN ('business_card', 'sidejob_card', 'user')),
  target_id UUID NOT NULL,
  target_owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- 신고 내용
  report_type TEXT NOT NULL CHECK (report_type IN ('spam', 'inappropriate', 'fraud', 'copyright', 'privacy', 'other')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  description TEXT,
  evidence_urls TEXT[],

  -- 처리 상태
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'rejected')),

  -- 처리 정보
  resolution_action TEXT CHECK (resolution_action IN ('delete_content', 'disable_content', 'warn_user', 'suspend_user', 'ban_user', 'reject_report')),
  resolution_note TEXT,
  reviewed_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,

  -- 알림 설정
  notify_reporter BOOLEAN DEFAULT true,

  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_reports_status ON user_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_target ON user_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reports_severity ON user_reports(severity, status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON user_reports(created_at DESC);

-- 2. 신고 처리 로그 테이블 (report_action_logs)
CREATE TABLE IF NOT EXISTS report_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES user_reports(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_logs_report ON report_action_logs(report_id, created_at DESC);

-- 3. RLS 정책
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_action_logs ENABLE ROW LEVEL SECURITY;

-- 관리자만 신고 조회 가능 (is_admin_user() 함수 사용)
CREATE POLICY "Admin can view all reports" ON user_reports
  FOR SELECT TO authenticated
  USING (is_admin_user());

-- 관리자만 신고 수정 가능
CREATE POLICY "Admin can update reports" ON user_reports
  FOR UPDATE TO authenticated
  USING (is_admin_user());

-- 누구나 신고 가능 (INSERT) - 비회원도 가능
CREATE POLICY "Anyone can create reports" ON user_reports
  FOR INSERT WITH CHECK (true);

-- 관리자만 로그 조회 가능
CREATE POLICY "Admin can view report logs" ON report_action_logs
  FOR SELECT TO authenticated
  USING (is_admin_user());

-- 관리자만 로그 생성 가능
CREATE POLICY "Admin can create report logs" ON report_action_logs
  FOR INSERT TO authenticated
  WITH CHECK (is_admin_user());

-- 4. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_user_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_reports_updated_at
  BEFORE UPDATE ON user_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_user_reports_updated_at();

-- 완료 메시지
COMMENT ON TABLE user_reports IS '사용자 신고 테이블 - 명함/부가명함/사용자 신고 관리';
COMMENT ON TABLE report_action_logs IS '신고 처리 로그 테이블 - 관리자 조치 이력';
