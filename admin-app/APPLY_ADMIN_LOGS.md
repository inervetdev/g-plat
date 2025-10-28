# Admin Logs 테이블 마이그레이션 가이드

## 1. Supabase Dashboard 접속

1. Supabase Dashboard 접속: https://supabase.com/dashboard
2. g-plat 프로젝트 선택 (`anwwjowwrxdygqyhhckr`)
3. 왼쪽 메뉴에서 **SQL Editor** 선택

## 2. SQL 실행

### 방법 A: 파일에서 복사 (권장)

1. `apply_admin_logs_migration.sql` 파일 열기
2. 전체 내용 복사
3. SQL Editor에 붙여넣기
4. **Run** 버튼 클릭

### 방법 B: 직접 입력

아래 SQL을 SQL Editor에 붙여넣고 실행:

```sql
-- Create admin_logs table for audit trail
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID,
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target ON admin_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);

-- Enable RLS
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Super admins can view all logs" ON admin_logs;
DROP POLICY IF EXISTS "Admins can view their own logs" ON admin_logs;
DROP POLICY IF EXISTS "Admins can insert logs" ON admin_logs;
DROP POLICY IF EXISTS "Super admins can delete logs" ON admin_logs;

CREATE POLICY "Super admins can view all logs"
  ON admin_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can view their own logs"
  ON admin_logs FOR SELECT TO authenticated
  USING (admin_id = auth.uid());

CREATE POLICY "Admins can insert logs"
  ON admin_logs FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Super admins can delete logs"
  ON admin_logs FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
      AND admin_users.is_active = true
    )
  );

SELECT 'admin_logs table created successfully!' AS message;
```

## 3. 확인

실행 후 다음 메시지가 표시되면 성공:

```
message: "admin_logs table created successfully!"
```

## 4. 테이블 확인

왼쪽 메뉴에서 **Table Editor** → **admin_logs** 테이블이 생성되었는지 확인

## 5. 기능 설명

### admin_logs 테이블
- 모든 관리자 작업을 기록하는 감사 로그
- 사용자 상태 변경, 구독 등급 변경 등 자동 기록
- Super Admin은 모든 로그 조회 가능
- 일반 Admin은 본인 로그만 조회 가능

### 컬럼 구조
- `id`: 로그 고유 ID
- `admin_id`: 작업을 수행한 관리자 ID
- `action`: 작업 유형 (예: user_suspended, user_updated)
- `target_type`: 대상 리소스 타입 (user, card, sidejob 등)
- `target_id`: 대상 리소스 ID
- `details`: 추가 정보 (JSON)
- `ip_address`: IP 주소 (향후 구현)
- `user_agent`: User Agent (향후 구현)
- `created_at`: 작업 시각

## 6. 다음 단계

마이그레이션 완료 후:
1. admin.g-plat.com에서 사용자 상태 변경 테스트
2. Table Editor에서 admin_logs 테이블에 로그 기록 확인
3. 정상 작동 확인 후 다음 개발 진행

---

## 문제 해결

### "relation admin_users does not exist" 에러
- admin_users 테이블이 먼저 생성되어야 함
- Week 1-2에서 이미 생성되었는지 확인

### RLS 정책 에러
- 기존 정책이 있으면 DROP POLICY 먼저 실행
- 위 SQL은 이미 DROP POLICY 포함

### 권한 에러
- Supabase 프로젝트 Owner 권한으로 실행
- Service Role Key가 아닌 Dashboard에서 실행
