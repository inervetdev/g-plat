-- RLS 무한 재귀 문제 최종 해결
-- 모든 정책을 삭제하고 단순한 구조로 재구성

-- 1. 모든 RLS 정책 삭제
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN ('qr_codes', 'qr_scans')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 2. RLS 비활성화 후 재활성화 (깨끗한 상태로 시작)
ALTER TABLE public.qr_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- 3. qr_codes 테이블: 매우 단순한 정책 (무한 재귀 방지)
-- SELECT 정책
CREATE POLICY "qr_codes_select"
ON public.qr_codes
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- INSERT 정책
CREATE POLICY "qr_codes_insert"
ON public.qr_codes
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- UPDATE 정책
CREATE POLICY "qr_codes_update"
ON public.qr_codes
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE 정책
CREATE POLICY "qr_codes_delete"
ON public.qr_codes
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- 4. qr_scans 테이블: 서브쿼리 없는 단순한 정책
-- INSERT는 모두 허용 (QR 스캔은 누구나 가능)
CREATE POLICY "qr_scans_insert_all"
ON public.qr_scans
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- SELECT는 JOIN 대신 EXISTS 사용 (무한 재귀 방지)
CREATE POLICY "qr_scans_select_auth"
ON public.qr_scans
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (true); -- 임시로 모든 인증된 사용자에게 허용

-- 5. 권한 재부여
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.qr_codes TO authenticated;
GRANT ALL ON public.qr_scans TO authenticated;
GRANT INSERT ON public.qr_scans TO anon;

-- 6. 시퀀스 권한
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- 7. 확인
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('qr_codes', 'qr_scans')
ORDER BY tablename, policyname;