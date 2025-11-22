# 🚨 최종 RLS 수정 - 중복 정책 제거 및 status 체크 추가 (v2.5.5)

## 문제 상황

**CRITICAL:** 삭제된 사용자와 정지된 사용자가 여전히 명함을 생성할 수 있음!

### 원인 분석

1. **중복 RLS 정책들이 존재**:
   - `Users can create own business cards` (deleted_at 체크 있음) ✅
   - `business_cards_insert_own` (deleted_at 체크 없음!) ❌
   - PostgreSQL RLS는 **OR 로직**: 하나라도 허용하면 접근 가능!

2. **status 체크 누락**:
   - `deleted_at`만 체크하고 `status = 'suspended'` 체크 안 함

### 현재 business_cards 정책 (17개 - 너무 많음!)

```
Users can create own business cards     ← 우리가 만든 것 (deleted_at 체크)
business_cards_insert_own                ← 오래된 것 (체크 없음!) ⚠️
Users can view own business cards        ← 우리가 만든 것
Users can view their own cards           ← 중복!
business_cards_select_own                ← 중복!
business_cards_update_own                ← 중복!
business_cards_delete_own                ← 중복!
... (기타 admin, public 정책들)
```

---

## 📋 즉시 적용할 SQL

### Supabase Dashboard에서 실행:

1. https://supabase.com/dashboard
2. 프로젝트: **g-plat** (anwwjowwrxdygqyhhckr)
3. **SQL Editor** → **New Query**
4. 아래 SQL 실행

```sql
-- Comprehensive RLS cleanup and fix for user access control
-- This migration removes all duplicate/conflicting policies and applies
-- strict rules to block both deleted users (deleted_at IS NOT NULL)
-- and suspended users (status = 'suspended')

-- ============================================================================
-- STEP 1: Clean up ALL existing RLS policies on business_cards
-- ============================================================================

-- Remove all duplicate/old policies
DROP POLICY IF EXISTS "business_cards_select_own" ON public.business_cards;
DROP POLICY IF EXISTS "business_cards_insert_own" ON public.business_cards;
DROP POLICY IF EXISTS "business_cards_update_own" ON public.business_cards;
DROP POLICY IF EXISTS "business_cards_delete_own" ON public.business_cards;
DROP POLICY IF EXISTS "business_cards_select_public" ON public.business_cards;

DROP POLICY IF EXISTS "Users can view their own cards" ON public.business_cards;
DROP POLICY IF EXISTS "Users can update their own cards" ON public.business_cards;
DROP POLICY IF EXISTS "Users can delete their own cards" ON public.business_cards;

-- Remove our previous policies (will be recreated with status check)
DROP POLICY IF EXISTS "Users can view own business cards" ON public.business_cards;
DROP POLICY IF EXISTS "Users can create own business cards" ON public.business_cards;
DROP POLICY IF EXISTS "Users can update own business cards" ON public.business_cards;
DROP POLICY IF EXISTS "Users can delete own business cards" ON public.business_cards;

-- Keep admin policies (these are fine)
-- - "Admins can view all business cards"
-- - "Admins can view all business_cards" (duplicate but harmless)
-- - "Admins can update all business cards"
-- - "Admins can delete business cards"

-- Keep public policy (this is fine)
-- - "Anyone can view active business cards"

-- ============================================================================
-- STEP 2: Create new comprehensive RLS policies with deleted_at AND status checks
-- ============================================================================

-- Helper function to check if user is allowed (not deleted AND not suspended)
-- This will be used in all business_cards policies
CREATE OR REPLACE FUNCTION public.is_user_allowed(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id
    AND deleted_at IS NULL
    AND status != 'suspended'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT: Users can view their own business cards (if not deleted/suspended)
CREATE POLICY "Users can view own business cards" ON public.business_cards
    FOR SELECT USING (
        auth.uid() = user_id
        AND public.is_user_allowed(auth.uid())
    );

-- INSERT: Users can create business cards (if not deleted/suspended)
CREATE POLICY "Users can create own business cards" ON public.business_cards
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND public.is_user_allowed(auth.uid())
    );

-- UPDATE: Users can update their own business cards (if not deleted/suspended)
CREATE POLICY "Users can update own business cards" ON public.business_cards
    FOR UPDATE USING (
        auth.uid() = user_id
        AND public.is_user_allowed(auth.uid())
    );

-- DELETE: Users can delete their own business cards (if not deleted/suspended)
CREATE POLICY "Users can delete own business cards" ON public.business_cards
    FOR DELETE USING (
        auth.uid() = user_id
        AND public.is_user_allowed(auth.uid())
    );

-- ============================================================================
-- STEP 3: Update users table RLS policy (already done but ensuring consistency)
-- ============================================================================

DROP POLICY IF EXISTS "Users cannot access deleted profiles" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- Users can view their own profile (even if deleted/suspended)
-- This is needed so the is_user_allowed() function can check deleted_at and status
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (
        id = auth.uid()
    );

-- ============================================================================
-- STEP 4: Add comments for documentation
-- ============================================================================

COMMENT ON FUNCTION public.is_user_allowed(UUID) IS
'Returns TRUE if user is allowed to access system (not deleted AND not suspended). Used by business_cards RLS policies.';

COMMENT ON POLICY "Users can view own business cards" ON public.business_cards IS
'Allows users to view their own business cards only if not deleted and not suspended.';

COMMENT ON POLICY "Users can create own business cards" ON public.business_cards IS
'Allows users to create business cards only if not deleted and not suspended.';

COMMENT ON POLICY "Users can update own business cards" ON public.business_cards IS
'Allows users to update their own business cards only if not deleted and not suspended.';

COMMENT ON POLICY "Users can delete own business cards" ON public.business_cards IS
'Allows users to delete their own business cards only if not deleted and not suspended.';

COMMENT ON POLICY "Users can view own profile" ON public.users IS
'Allows users to view their own profile even if deleted/suspended. Needed for RLS policy checks.';
```

---

## 🧪 검증 쿼리

### 1. RLS 정책 개수 확인

```sql
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('business_cards', 'users')
GROUP BY tablename;
```

**예상 결과:**
- `business_cards`: 9개 (4개 user policies + 4개 admin policies + 1개 public policy)
- `users`: 7개

### 2. business_cards 정책 상세 확인

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'business_cards'
ORDER BY policyname;
```

**예상 결과 (중복 제거됨):**
```
Admins can delete business cards
Admins can update all business cards
Admins can view all business cards
Admins can view all business_cards
Anyone can view active business cards
Users can create own business cards     ← 새 정책 (is_user_allowed 함수 사용)
Users can delete own business cards     ← 새 정책
Users can update own business cards     ← 새 정책
Users can view own business cards       ← 새 정책
```

**제거된 정책:**
- ❌ `business_cards_insert_own`
- ❌ `business_cards_select_own`
- ❌ `business_cards_update_own`
- ❌ `business_cards_delete_own`
- ❌ `business_cards_select_public`
- ❌ `Users can view their own cards`
- ❌ `Users can update their own cards`
- ❌ `Users can delete their own cards`

### 3. Helper 함수 확인

```sql
SELECT proname, pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname = 'is_user_allowed';
```

---

## 🎯 테스트 시나리오

### Test 1: 삭제된 사용자 (deleted_at IS NOT NULL)

1. tax@inervet.com으로 로그인
2. 명함 생성 페이지 접속
3. **예상:** 명함 생성 실패 또는 빈 화면

### Test 2: 정지된 사용자 (status = 'suspended')

1. 관리자 페이지에서 사용자 status를 'suspended'로 변경
2. 해당 사용자로 로그인
3. 명함 생성 페이지 접속
4. **예상:** 명함 생성 실패 또는 빈 화면

### Test 3: 정상 사용자 (deleted_at IS NULL AND status = 'active')

1. 정상 사용자로 로그인
2. 명함 생성 페이지 접속
3. **예상:** 명함 생성 성공 ✅

---

## 🔍 변경 사항 요약

### Before (v2.5.4)
- ❌ 17개의 business_cards RLS 정책 (중복 많음)
- ❌ `deleted_at`만 체크 (`status` 체크 안 함)
- ❌ 오래된 정책들이 우리 정책을 우회
- ❌ 삭제/정지 사용자도 명함 생성 가능

### After (v2.5.5)
- ✅ 9개의 business_cards RLS 정책 (중복 제거)
- ✅ `deleted_at` AND `status != 'suspended'` 모두 체크
- ✅ Helper 함수 `is_user_allowed()` 사용 (재사용성)
- ✅ 삭제/정지 사용자 명함 생성 차단
- ✅ 깔끔한 정책 구조

---

## ✅ 적용 체크리스트

- [ ] SQL Editor에서 SQL 실행 완료
- [ ] "Success. No rows returned" 확인
- [ ] RLS 정책 개수 확인 (business_cards: 9개)
- [ ] `is_user_allowed` 함수 존재 확인
- [ ] 삭제된 사용자로 테스트 → 명함 생성 차단 확인
- [ ] 정지된 사용자로 테스트 → 명함 생성 차단 확인
- [ ] 정상 사용자로 테스트 → 명함 생성 성공 확인

---

**작성일**: 2025-11-22
**버전**: v2.5.5 (FINAL FIX)
**마이그레이션 파일**: `react-app/supabase/migrations/20251122000003_cleanup_and_fix_all_rls.sql`
