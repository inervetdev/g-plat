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

**⚠️ 중요: 2025-11-22 업데이트됨 - v2.5.4**

이전 버전의 RLS 정책에 버그가 있었습니다. 아래 수정된 SQL을 사용하세요.

```sql
-- Fix RLS policies to properly block deleted users
-- The issue: previous policy prevented deleted users from reading users table,
-- which caused the NOT EXISTS check in business_cards policies to fail

-- 1. Fix users table SELECT policy to allow deleted users to read their own record
--    (This is needed so the business_cards policies can check deleted_at)
DROP POLICY IF EXISTS "Users cannot access deleted profiles" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (
        id = auth.uid()
        -- Allow users to read their own profile even if deleted
        -- This enables the business_cards RLS checks to work correctly
    );

-- 2. Ensure all business_cards policies properly check deleted_at
--    (Re-applying to ensure correct behavior)

-- SELECT policy
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

-- INSERT policy
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

-- UPDATE policy
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

-- DELETE policy
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

-- 3. Add comments for documentation
COMMENT ON POLICY "Users can view own profile" ON public.users IS
'Allows users to view their own profile even if deleted. This is necessary for business_cards RLS policies to check deleted_at status.';

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

## 🐛 RLS 버그 수정 (v2.5.4)

### 문제점
이전 버전의 RLS 정책에서 삭제된 사용자가 여전히 명함을 생성할 수 있는 버그가 발견되었습니다.

**원인:**
```sql
-- ❌ 문제가 있던 정책 (v2.5.2)
CREATE POLICY "Users cannot access deleted profiles" ON public.users
    FOR SELECT USING (
        id = auth.uid()
        AND deleted_at IS NULL  -- 삭제된 사용자는 자신의 프로필 조회 불가
    );
```

위 정책으로 인해:
1. 삭제된 사용자가 `users` 테이블에서 자신의 레코드를 볼 수 없음
2. `business_cards` INSERT 정책의 `NOT EXISTS` 서브쿼리가 실행될 때도 RLS가 적용됨
3. 서브쿼리에서 아무것도 찾지 못함 (RLS가 차단) → `NOT EXISTS` = TRUE
4. 결과적으로 삭제된 사용자도 명함 생성 가능!

### 해결 방법
삭제된 사용자도 자신의 프로필을 조회할 수 있도록 허용 (단, 명함 생성/조회는 차단):

```sql
-- ✅ 수정된 정책 (v2.5.4)
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (
        id = auth.uid()
        -- deleted_at 체크 제거: 서브쿼리에서 deleted_at을 확인할 수 있도록 허용
    );
```

이제 `business_cards` 정책의 `NOT EXISTS` 서브쿼리가 정상적으로 `deleted_at`을 확인할 수 있습니다.

---

**작성일**: 2025-11-22
**최종 수정일**: 2025-11-22
**버전**: v2.5.4
