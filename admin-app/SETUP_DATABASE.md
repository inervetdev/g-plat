# Admin Database Setup Guide

관리자 웹 서비스를 위한 Supabase 데이터베이스 설정 가이드입니다.

## 1. admin_users 테이블 생성

Supabase Dashboard → SQL Editor에서 다음 SQL을 실행하세요:

```sql
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
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_active ON admin_users(is_active);

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
CREATE POLICY "Authenticated admins can view all admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS 정책: super_admin만 admin_users 수정 가능
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
```

## 2. 초기 관리자 계정 생성

```sql
-- Super Admin 계정 생성 (먼저 Supabase Auth에서 이메일로 가입 필요)
-- 1. Supabase Dashboard → Authentication → Users 에서 관리자 이메일로 가입
-- 2. 해당 사용자의 UUID를 복사
-- 3. 아래 SQL 실행 (YOUR_USER_UUID를 실제 UUID로 교체)

INSERT INTO admin_users (id, email, name, role, is_active)
VALUES (
  'YOUR_USER_UUID'::20e2f907-ab66-431c-8ea1-50094b5c84d7,  -- Supabase Auth에서 생성된 UUID
  'admin@g-plat.com',       -- 관리자 이메일
  '슈퍼 관리자',             -- 관리자 이름
  'super_admin',            -- 역할
  true                      -- 활성 상태
);
```

## 3. 검증

```sql
-- admin_users 테이블 확인
SELECT * FROM admin_users;

-- RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'admin_users';
```

## 4. 역할 설명

| 역할 | 권한 |
|------|------|
| `super_admin` | 모든 기능 접근 가능 (사용자 관리, 시스템 설정 등) |
| `content_admin` | 콘텐츠 관리 (명함, 부가명함, 신고 처리) |
| `marketing_admin` | 마케팅 기능 (캠페인, 통계) |
| `viewer` | 읽기 전용 (대시보드, 통계 조회만 가능) |

## 5. 다음 단계

데이터베이스 설정이 완료되면:
1. 관리자 로그인 페이지에서 생성한 계정으로 로그인
2. 대시보드 접속 확인
3. 추가 관리자 계정은 "설정 → 관리자 계정 관리"에서 추가 가능

## 트러블슈팅

### 문제: RLS 정책으로 인해 접근 불가
**해결**: Supabase Dashboard → SQL Editor에서 RLS 정책을 확인하고, 인증된 사용자의 UUID가 admin_users 테이블에 존재하는지 확인

### 문제: UUID 불일치
**해결**: Supabase Auth의 사용자 UUID와 admin_users 테이블의 id가 정확히 일치해야 함

### 문제: role 컬럼 에러
**해결**: role 값은 반드시 CHECK 제약조건에 정의된 값 중 하나여야 함 (super_admin, content_admin, marketing_admin, viewer)
