-- 🔧 RLS 정책 수정 스크립트
-- 명함 생성이 안 되는 문제를 해결합니다

-- 1️⃣ 기존 중복 정책 확인 및 삭제
DROP POLICY IF EXISTS "Anyone can view active business cards" ON public.business_cards;

-- 2️⃣ 정책 재생성 (올바른 순서로)

-- 인증된 사용자는 자신의 명함을 볼 수 있음
DROP POLICY IF EXISTS "Users can view own business cards" ON public.business_cards;
CREATE POLICY "Users can view own business cards" ON public.business_cards
    FOR SELECT
    USING (auth.uid() = user_id);

-- 활성화된 명함은 누구나 볼 수 있음 (공개 프로필)
CREATE POLICY "Public can view active business cards" ON public.business_cards
    FOR SELECT
    USING (is_active = true);

-- 인증된 사용자는 자신의 명함을 생성할 수 있음
DROP POLICY IF EXISTS "Users can create own business cards" ON public.business_cards;
CREATE POLICY "Users can create own business cards" ON public.business_cards
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 인증된 사용자는 자신의 명함을 수정할 수 있음
DROP POLICY IF EXISTS "Users can update own business cards" ON public.business_cards;
CREATE POLICY "Users can update own business cards" ON public.business_cards
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 인증된 사용자는 자신의 명함을 삭제할 수 있음
DROP POLICY IF EXISTS "Users can delete own business cards" ON public.business_cards;
CREATE POLICY "Users can delete own business cards" ON public.business_cards
    FOR DELETE
    USING (auth.uid() = user_id);

-- 3️⃣ 정책 확인 쿼리
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'business_cards'
ORDER BY policyname;

-- 4️⃣ 테스트: 현재 사용자가 명함을 생성할 수 있는지 확인
-- 이 쿼리는 SQL Editor에서 실행 시 현재 로그인한 사용자의 ID를 보여줍니다
SELECT auth.uid() as current_user_id;

-- ✅ 완료! 이제 명함 생성이 정상적으로 작동해야 합니다.