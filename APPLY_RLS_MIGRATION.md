# RLS 마이그레이션 적용 가이드

## ⚠️ 중요: 삭제된 사용자의 로그인 차단

사용자 삭제 시 Auth 계정은 유지되지만, RLS 정책으로 데이터 접근을 차단합니다.

---

## 📋 Supabase Dashboard에서 실행할 SQL

### 1. 사용자 삭제 추적 컬럼 추가 (이미 완료했다면 skip)

```sql
-- Add user deletion tracking columns
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON public.users(deleted_at)
WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Add comments
COMMENT ON COLUMN public.users.deleted_at IS 'Timestamp when user was deleted by admin';
COMMENT ON COLUMN public.users.deletion_reason IS 'Admin-provided reason for user deletion';
```

---

### 2. 삭제된 사용자의 데이터 접근 차단 RLS (필수!)

```sql
-- Block deleted users from accessing their data via RLS
-- This prevents soft-deleted users from logging in and accessing data

-- 1. Update RLS policy for business_cards to exclude deleted users
DROP POLICY IF EXISTS "Users can view own business cards" ON public.business_cards;

CREATE POLICY "Users can view own business cards" ON public.business_cards
    FOR SELECT USING (
        auth.uid() = user_id
        AND NOT EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND deleted_at IS NOT NULL
        )
    );

-- 2. Update RLS policy for business_cards insert to exclude deleted users
DROP POLICY IF EXISTS "Users can create own business cards" ON public.business_cards;

CREATE POLICY "Users can create own business cards" ON public.business_cards
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND NOT EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND deleted_at IS NOT NULL
        )
    );

-- 3. Update RLS policy for business_cards update to exclude deleted users
DROP POLICY IF EXISTS "Users can update own business cards" ON public.business_cards;

CREATE POLICY "Users can update own business cards" ON public.business_cards
    FOR UPDATE USING (
        auth.uid() = user_id
        AND NOT EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND deleted_at IS NOT NULL
        )
    );

-- 4. Update RLS policy for business_cards delete to exclude deleted users
DROP POLICY IF EXISTS "Users can delete own business cards" ON public.business_cards;

CREATE POLICY "Users can delete own business cards" ON public.business_cards
    FOR DELETE USING (
        auth.uid() = user_id
        AND NOT EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND deleted_at IS NOT NULL
        )
    );

-- 5. Add RLS policy for users table to block deleted users from viewing their profile
DROP POLICY IF EXISTS "Users cannot access deleted profiles" ON public.users;

CREATE POLICY "Users cannot access deleted profiles" ON public.users
    FOR SELECT USING (
        id = auth.uid()
        AND deleted_at IS NULL
    );

-- 6. Add comment for documentation
COMMENT ON COLUMN public.users.deleted_at IS 'Soft delete timestamp. Users with deleted_at set cannot access the system via RLS policies.';
```

---

## 🧪 검증 쿼리

마이그레이션 적용 후 다음 쿼리로 확인:

```sql
-- 1. RLS 정책 확인
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('business_cards', 'users')
ORDER BY tablename, policyname;

-- 2. deleted_at이 있는 사용자 확인
SELECT id, email, name, deleted_at, deletion_reason
FROM users
WHERE deleted_at IS NOT NULL;
```

---

## 📝 적용 절차

1. **Supabase Dashboard 접속**: https://supabase.com/dashboard
2. **프로젝트 선택**: g-plat (anwwjowwrxdygqyhhckr)
3. **SQL Editor** 클릭 (좌측 메뉴)
4. **New Query** 클릭
5. 위 SQL 복사 & 붙여넣기 (섹션 1, 2 순서대로)
6. **Run** 버튼 클릭
7. 검증 쿼리로 확인

---

## ✅ 예상 결과

**적용 전:**
- 삭제된 사용자도 Auth 계정으로 로그인 가능
- 데이터 접근 가능

**적용 후:**
- 삭제된 사용자(deleted_at이 있는 경우) 로그인 시:
  - RLS 정책에 의해 데이터 접근 차단
  - 명함 조회/생성/수정/삭제 불가
  - 사실상 사용 불가능한 상태

---

## 🎯 Soft Delete 동작 방식

### 사용자 삭제 시:
1. `users.deleted_at` = 현재 시각
2. `users.deletion_reason` = 관리자가 입력한 사유
3. Auth 계정은 유지 (auth.users에 그대로 존재)
4. RLS 정책에 의해 모든 데이터 접근 차단

### 사용자 복구 시 (필요한 경우):
```sql
UPDATE users
SET deleted_at = NULL,
    deletion_reason = NULL
WHERE id = '[USER_ID]';
```

### 완전 삭제 시 (선택사항):
Supabase Dashboard → Authentication → Users → 해당 사용자 → Delete User

---

## 🔒 보안 이점

1. **감사 추적**: 삭제 사유와 시각 기록
2. **복구 가능**: 필요 시 deleted_at을 NULL로 설정하여 복구
3. **데이터 보존**: 삭제된 사용자의 데이터 히스토리 유지
4. **접근 차단**: RLS로 강제 차단 (애플리케이션 로직 불필요)

---

**작성일**: 2025-11-22
**버전**: v2.5.2
