-- ============================================
-- G-Plat 모바일 명함 서비스
-- RLS 활성화 (검증된 테이블만)
-- ============================================

-- 1. 기존 RLS 정책 삭제
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- ============================================
-- 2. RLS 활성화 (존재하는 테이블만)
-- ============================================

-- business_cards 테이블 (있다면)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'business_cards') THEN
        ALTER TABLE public.business_cards ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- sidejob_cards 테이블
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sidejob_cards') THEN
        ALTER TABLE public.sidejob_cards ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- qr_codes 테이블
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'qr_codes') THEN
        ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- qr_scans 테이블
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'qr_scans') THEN
        ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- visitor_stats 테이블
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'visitor_stats') THEN
        ALTER TABLE public.visitor_stats ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- callback_logs 테이블
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'callback_logs') THEN
        ALTER TABLE public.callback_logs ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ============================================
-- 3. business_cards 테이블 RLS 정책
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'business_cards') THEN
        -- 사용자는 자신의 명함만 조회
        EXECUTE 'CREATE POLICY "business_cards_select_own" ON public.business_cards FOR SELECT TO authenticated USING (user_id = auth.uid())';

        -- 공개된 명함은 누구나 조회 가능
        EXECUTE 'CREATE POLICY "business_cards_select_public" ON public.business_cards FOR SELECT TO anon, authenticated USING (true)';

        -- 사용자는 자신의 명함만 생성
        EXECUTE 'CREATE POLICY "business_cards_insert_own" ON public.business_cards FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())';

        -- 사용자는 자신의 명함만 수정
        EXECUTE 'CREATE POLICY "business_cards_update_own" ON public.business_cards FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())';

        -- 사용자는 자신의 명함만 삭제
        EXECUTE 'CREATE POLICY "business_cards_delete_own" ON public.business_cards FOR DELETE TO authenticated USING (user_id = auth.uid())';
    END IF;
END $$;

-- ============================================
-- 4. sidejob_cards 테이블 RLS 정책
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sidejob_cards') THEN
        EXECUTE 'CREATE POLICY "sidejob_cards_select_own" ON public.sidejob_cards FOR SELECT TO authenticated USING (user_id = auth.uid())';
        EXECUTE 'CREATE POLICY "sidejob_cards_select_public" ON public.sidejob_cards FOR SELECT TO anon, authenticated USING (is_active = true)';
        EXECUTE 'CREATE POLICY "sidejob_cards_insert_own" ON public.sidejob_cards FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())';
        EXECUTE 'CREATE POLICY "sidejob_cards_update_own" ON public.sidejob_cards FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())';
        EXECUTE 'CREATE POLICY "sidejob_cards_delete_own" ON public.sidejob_cards FOR DELETE TO authenticated USING (user_id = auth.uid())';
    END IF;
END $$;

-- ============================================
-- 5. qr_codes 테이블 RLS 정책
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'qr_codes') THEN
        EXECUTE 'CREATE POLICY "qr_codes_select_own" ON public.qr_codes FOR SELECT TO authenticated USING (user_id = auth.uid())';
        EXECUTE 'CREATE POLICY "qr_codes_select_active" ON public.qr_codes FOR SELECT TO anon, authenticated USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()))';
        EXECUTE 'CREATE POLICY "qr_codes_insert_own" ON public.qr_codes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())';
        EXECUTE 'CREATE POLICY "qr_codes_update_own" ON public.qr_codes FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())';
        EXECUTE 'CREATE POLICY "qr_codes_update_scan_count" ON public.qr_codes FOR UPDATE TO service_role USING (true)';
        EXECUTE 'CREATE POLICY "qr_codes_delete_own" ON public.qr_codes FOR DELETE TO authenticated USING (user_id = auth.uid())';
    END IF;
END $$;

-- ============================================
-- 6. qr_scans 테이블 RLS 정책
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'qr_scans') THEN
        EXECUTE 'CREATE POLICY "qr_scans_select_own" ON public.qr_scans FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.qr_codes WHERE qr_codes.id = qr_scans.qr_code_id AND qr_codes.user_id = auth.uid()))';
        EXECUTE 'CREATE POLICY "qr_scans_insert_all" ON public.qr_scans FOR INSERT TO anon, authenticated, service_role WITH CHECK (true)';
        EXECUTE 'CREATE POLICY "qr_scans_update_own" ON public.qr_scans FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.qr_codes WHERE qr_codes.id = qr_scans.qr_code_id AND qr_codes.user_id = auth.uid()))';
    END IF;
END $$;

-- ============================================
-- 7. visitor_stats 테이블 RLS 정책
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'visitor_stats') THEN
        EXECUTE 'CREATE POLICY "visitor_stats_select_own" ON public.visitor_stats FOR SELECT TO authenticated USING (user_id = auth.uid())';
        EXECUTE 'CREATE POLICY "visitor_stats_insert_all" ON public.visitor_stats FOR INSERT TO anon, authenticated WITH CHECK (true)';
        EXECUTE 'CREATE POLICY "visitor_stats_update_own" ON public.visitor_stats FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())';
    END IF;
END $$;

-- ============================================
-- 8. callback_logs 테이블 RLS 정책
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'callback_logs') THEN
        EXECUTE 'CREATE POLICY "callback_logs_select_own" ON public.callback_logs FOR SELECT TO authenticated USING (user_id = auth.uid())';
        EXECUTE 'CREATE POLICY "callback_logs_insert_own" ON public.callback_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())';
        EXECUTE 'CREATE POLICY "callback_logs_update_own" ON public.callback_logs FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())';
        EXECUTE 'CREATE POLICY "callback_logs_delete_own" ON public.callback_logs FOR DELETE TO authenticated USING (user_id = auth.uid())';
    END IF;
END $$;

-- ============================================
-- 9. 권한 부여
-- ============================================

GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;

-- 각 테이블에 권한 부여 (존재하는 경우에만)
DO $$
BEGIN
    -- business_cards
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'business_cards') THEN
        GRANT SELECT ON public.business_cards TO anon, authenticated;
        GRANT ALL ON public.business_cards TO authenticated;
    END IF;

    -- sidejob_cards
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sidejob_cards') THEN
        GRANT SELECT ON public.sidejob_cards TO anon, authenticated;
        GRANT ALL ON public.sidejob_cards TO authenticated;
    END IF;

    -- qr_codes
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'qr_codes') THEN
        GRANT SELECT ON public.qr_codes TO anon, authenticated;
        GRANT ALL ON public.qr_codes TO authenticated, service_role;
    END IF;

    -- qr_scans
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'qr_scans') THEN
        GRANT INSERT, SELECT ON public.qr_scans TO anon, authenticated, service_role;
        GRANT UPDATE ON public.qr_scans TO authenticated;
    END IF;

    -- visitor_stats
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'visitor_stats') THEN
        GRANT INSERT, SELECT ON public.visitor_stats TO anon, authenticated;
        GRANT UPDATE ON public.visitor_stats TO authenticated;
    END IF;

    -- callback_logs
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'callback_logs') THEN
        GRANT ALL ON public.callback_logs TO authenticated;
    END IF;
END $$;

-- 시퀀스 권한
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon, service_role;

-- ============================================
-- 10. 확인 쿼리
-- ============================================

-- 모든 테이블의 RLS 상태 확인
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
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
ORDER BY tablename, policyname;
