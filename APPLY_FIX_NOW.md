# 🚨 긴급 RLS 수정 적용 가이드 (v2.5.4)

## 문제 상황
삭제된 사용자(tax@inervet.com)가 로그인 후 명함을 생성할 수 있는 버그 발견

## 즉시 적용할 SQL

### 1단계: Supabase Dashboard 접속
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택: **g-plat** (anwwjowwrxdygqyhhckr)
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. **New Query** 클릭

### 2단계: 아래 SQL 복사 & 실행

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

### 3단계: 실행 및 검증

1. **Run** 버튼 클릭
2. "Success. No rows returned" 메시지 확인
3. 검증 쿼리 실행:

```sql
-- RLS 정책 확인
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('business_cards', 'users')
ORDER BY tablename, policyname;
```

**예상 결과:**
- business_cards: 17개 정책
- users: 7개 정책 (이 중 "Users can view own profile" 확인)

### 4단계: 삭제된 사용자로 테스트

1. tax@inervet.com으로 로그인 시도
2. 명함 생성 페이지 접속
3. **명함 생성 시도 → 실패해야 정상!**

예상 에러:
- "명함을 불러오는데 실패했습니다" 또는
- 빈 화면 (RLS로 차단)
- 명함 생성 버튼 클릭 시 실패

---

## 🔍 버그 설명

### 원인
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
2. `business_cards` INSERT 정책의 서브쿼리 실행 시:
   ```sql
   NOT EXISTS (
       SELECT 1 FROM public.users
       WHERE id = auth.uid()
       AND deleted_at IS NOT NULL
   )
   ```
3. 서브쿼리도 RLS의 영향을 받아 아무것도 찾지 못함 (차단됨)
4. `NOT EXISTS` = TRUE → **명함 생성 허용!** ❌

### 해결
삭제된 사용자도 자신의 프로필을 조회할 수 있도록 허용:
```sql
-- ✅ 수정된 정책 (v2.5.4)
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (
        id = auth.uid()
        -- deleted_at 체크 제거
    );
```

이제 서브쿼리가 정상적으로 `deleted_at`을 확인 가능:
- 삭제된 사용자: `NOT EXISTS` = FALSE → 명함 생성 차단 ✅
- 정상 사용자: `NOT EXISTS` = TRUE → 명함 생성 허용 ✅

---

## ✅ 적용 완료 체크리스트

- [ ] SQL Editor에서 SQL 실행 완료
- [ ] 검증 쿼리로 정책 확인 (24개 정책 존재)
- [ ] "Users can view own profile" 정책 확인
- [ ] tax@inervet.com으로 명함 생성 시도 → 실패 확인
- [ ] 정상 사용자로 명함 생성 → 성공 확인

---

**작성일**: 2025-11-22
**버전**: v2.5.4
**커밋**: f760cb6
