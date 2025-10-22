-- Admin Users Table Setup
-- This creates the admin_users table with RLS policies for the admin web service

-- admin_users 테이블 생성
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'content_admin', 'marketing_admin', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) 활성화
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 인증된 관리자는 모든 admin_users 조회 가능
DROP POLICY IF EXISTS "Authenticated admins can view all admin_users" ON admin_users;
CREATE POLICY "Authenticated admins can view all admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS 정책: super_admin만 admin_users 수정 가능
DROP POLICY IF EXISTS "Only super_admin can modify admin_users" ON admin_users;
CREATE POLICY "Only super_admin can modify admin_users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
      AND admin_users.is_active = true
    )
  );
