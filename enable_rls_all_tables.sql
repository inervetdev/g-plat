-- ============================================
-- G-Plat 모바일 명함 서비스
-- 전체 테이블 RLS 활성화 및 정책 설정
-- ============================================

-- 1. 모든 기존 RLS 정책 삭제 (깨끗한 시작)
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN (
            'business_cards',
            'sidejob_cards',
            'qr_codes',
            'qr_scans',
            'visitor_stats',
            'callback_logs',
            'user_profiles'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- ============================================
-- 2. RLS 활성화
-- ============================================

ALTER TABLE IF EXISTS public.business_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sidejob_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.qr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.visitor_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.callback_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. business_cards 테이블 RLS 정책
-- ============================================

-- 사용자는 자신의 명함만 조회
CREATE POLICY "business_cards_select_own"
ON public.business_cards
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 공개된 명함은 누구나 조회 가능 (custom_url 또는 id로 접근)
CREATE POLICY "business_cards_select_public"
ON public.business_cards
FOR SELECT
TO anon, authenticated
USING (true);

-- 사용자는 자신의 명함만 생성
CREATE POLICY "business_cards_insert_own"
ON public.business_cards
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 사용자는 자신의 명함만 수정
CREATE POLICY "business_cards_update_own"
ON public.business_cards
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 사용자는 자신의 명함만 삭제
CREATE POLICY "business_cards_delete_own"
ON public.business_cards
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- 4. sidejob_cards 테이블 RLS 정책
-- ============================================

-- 사용자는 자신의 부업 카드만 조회
CREATE POLICY "sidejob_cards_select_own"
ON public.sidejob_cards
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 공개된 부업 카드는 누구나 조회 가능
CREATE POLICY "sidejob_cards_select_public"
ON public.sidejob_cards
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- 사용자는 자신의 부업 카드만 생성
CREATE POLICY "sidejob_cards_insert_own"
ON public.sidejob_cards
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 사용자는 자신의 부업 카드만 수정
CREATE POLICY "sidejob_cards_update_own"
ON public.sidejob_cards
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 사용자는 자신의 부업 카드만 삭제
CREATE POLICY "sidejob_cards_delete_own"
ON public.sidejob_cards
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- 5. qr_codes 테이블 RLS 정책
-- ============================================

-- 사용자는 자신의 QR 코드만 조회
CREATE POLICY "qr_codes_select_own"
ON public.qr_codes
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 활성화된 QR 코드는 누구나 조회 가능 (리다이렉트용)
CREATE POLICY "qr_codes_select_active"
ON public.qr_codes
FOR SELECT
TO anon, authenticated
USING (
    is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
);

-- 사용자는 자신의 QR 코드만 생성
CREATE POLICY "qr_codes_insert_own"
ON public.qr_codes
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 사용자는 자신의 QR 코드만 수정
CREATE POLICY "qr_codes_update_own"
ON public.qr_codes
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Edge Function이 scan_count 업데이트 가능 (service_role)
CREATE POLICY "qr_codes_update_scan_count"
ON public.qr_codes
FOR UPDATE
TO service_role
USING (true);

-- 사용자는 자신의 QR 코드만 삭제
CREATE POLICY "qr_codes_delete_own"
ON public.qr_codes
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- 6. qr_scans 테이블 RLS 정책
-- ============================================

-- 사용자는 자신의 QR 코드 스캔 기록만 조회
CREATE POLICY "qr_scans_select_own"
ON public.qr_scans
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.qr_codes
        WHERE qr_codes.id = qr_scans.qr_code_id
        AND qr_codes.user_id = auth.uid()
    )
);

-- 누구나 스캔 기록을 생성 가능 (추적용)
CREATE POLICY "qr_scans_insert_all"
ON public.qr_scans
FOR INSERT
TO anon, authenticated, service_role
WITH CHECK (true);

-- 사용자는 자신의 QR 코드 스캔 기록만 수정
CREATE POLICY "qr_scans_update_own"
ON public.qr_scans
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.qr_codes
        WHERE qr_codes.id = qr_scans.qr_code_id
        AND qr_codes.user_id = auth.uid()
    )
);

-- ============================================
-- 7. visitor_stats 테이블 RLS 정책
-- ============================================

-- 사용자는 자신의 방문 통계만 조회
CREATE POLICY "visitor_stats_select_own"
ON public.visitor_stats
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 누구나 방문 통계를 생성 가능 (추적용)
CREATE POLICY "visitor_stats_insert_all"
ON public.visitor_stats
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 사용자는 자신의 방문 통계만 수정
CREATE POLICY "visitor_stats_update_own"
ON public.visitor_stats
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- 8. callback_logs 테이블 RLS 정책 (있다면)
-- ============================================

-- 사용자는 자신의 콜백 로그만 조회
CREATE POLICY "callback_logs_select_own"
ON public.callback_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 사용자는 자신의 콜백 로그만 생성
CREATE POLICY "callback_logs_insert_own"
ON public.callback_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 사용자는 자신의 콜백 로그만 수정
CREATE POLICY "callback_logs_update_own"
ON public.callback_logs
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 사용자는 자신의 콜백 로그만 삭제
CREATE POLICY "callback_logs_delete_own"
ON public.callback_logs
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- 9. user_profiles 테이블 RLS 정책 (있다면)
-- ============================================

-- 사용자는 자신의 프로필만 조회
CREATE POLICY "user_profiles_select_own"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 사용자는 자신의 프로필만 생성
CREATE POLICY "user_profiles_insert_own"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 사용자는 자신의 프로필만 수정
CREATE POLICY "user_profiles_update_own"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 사용자는 자신의 프로필만 삭제
CREATE POLICY "user_profiles_delete_own"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- 10. 권한 부여
-- ============================================

GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;

-- business_cards
GRANT SELECT ON public.business_cards TO anon, authenticated;
GRANT ALL ON public.business_cards TO authenticated;

-- sidejob_cards
GRANT SELECT ON public.sidejob_cards TO anon, authenticated;
GRANT ALL ON public.sidejob_cards TO authenticated;

-- qr_codes
GRANT SELECT ON public.qr_codes TO anon, authenticated;
GRANT ALL ON public.qr_codes TO authenticated, service_role;

-- qr_scans
GRANT INSERT, SELECT ON public.qr_scans TO anon, authenticated, service_role;
GRANT UPDATE ON public.qr_scans TO authenticated;

-- visitor_stats
GRANT INSERT, SELECT ON public.visitor_stats TO anon, authenticated;
GRANT UPDATE ON public.visitor_stats TO authenticated;

-- callback_logs
GRANT ALL ON public.callback_logs TO authenticated;

-- user_profiles
GRANT ALL ON public.user_profiles TO authenticated;

-- 시퀀스 권한
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon, service_role;

-- ============================================
-- 11. 확인 쿼리
-- ============================================

-- 모든 테이블의 RLS 상태 확인
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'business_cards',
        'sidejob_cards',
        'qr_codes',
        'qr_scans',
        'visitor_stats',
        'callback_logs',
        'user_profiles'
    )
ORDER BY tablename;

-- 모든 RLS 정책 확인
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN (
        'business_cards',
        'sidejob_cards',
        'qr_codes',
        'qr_scans',
        'visitor_stats',
        'callback_logs',
        'user_profiles'
    )
ORDER BY tablename, policyname;
