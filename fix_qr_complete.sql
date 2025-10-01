-- QR 테이블 완전 수정 스크립트
-- 뷰와 의존성을 고려한 순서대로 실행

-- 1. 먼저 뷰 삭제 (의존성 제거)
DROP VIEW IF EXISTS public.qr_code_analytics CASCADE;

-- 2. short_code 컬럼 타입 수정
ALTER TABLE public.qr_codes
ALTER COLUMN short_code TYPE VARCHAR(20);

-- 3. RLS 정책 재설정
-- 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Enable all for authenticated users on qr_codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can read own qr_codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can insert own qr_codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can update own qr_codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can delete own qr_codes" ON public.qr_codes;
DROP POLICY IF EXISTS "qr_codes_authenticated_policy" ON public.qr_codes;

DROP POLICY IF EXISTS "Enable insert for all on qr_scans" ON public.qr_scans;
DROP POLICY IF EXISTS "Enable read for authenticated users on qr_scans" ON public.qr_scans;
DROP POLICY IF EXISTS "Public can insert qr_scans" ON public.qr_scans;
DROP POLICY IF EXISTS "Users can read own qr_scans" ON public.qr_scans;
DROP POLICY IF EXISTS "qr_scans_insert_policy" ON public.qr_scans;
DROP POLICY IF EXISTS "qr_scans_select_policy" ON public.qr_scans;

-- 4. RLS 활성화
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- 5. 새로운 RLS 정책 생성
-- qr_codes 테이블 정책
CREATE POLICY "qr_codes_select_policy"
ON public.qr_codes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "qr_codes_insert_policy"
ON public.qr_codes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "qr_codes_update_policy"
ON public.qr_codes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "qr_codes_delete_policy"
ON public.qr_codes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- qr_scans 테이블 정책
CREATE POLICY "qr_scans_insert_public"
ON public.qr_scans FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "qr_scans_select_owner"
ON public.qr_scans FOR SELECT
TO authenticated
USING (
    qr_code_id IN (
        SELECT id FROM public.qr_codes
        WHERE user_id = auth.uid()
    )
);

-- 6. qr_code_analytics 뷰 재생성
CREATE OR REPLACE VIEW public.qr_code_analytics AS
SELECT
    q.id,
    q.user_id,
    q.business_card_id,
    q.short_code,
    q.target_url,
    q.target_type,
    q.campaign,
    q.created_at,
    COUNT(s.id) as scan_count,
    COUNT(DISTINCT s.ip_address) as unique_visitors,
    MAX(s.scanned_at) as last_scanned_at
FROM public.qr_codes q
LEFT JOIN public.qr_scans s ON q.id = s.qr_code_id
GROUP BY q.id, q.user_id, q.business_card_id, q.short_code, q.target_url, q.target_type, q.campaign, q.created_at;

-- 7. 뷰에 대한 권한 부여
GRANT SELECT ON public.qr_code_analytics TO authenticated;

-- 8. 기타 권한 부여
GRANT ALL ON public.qr_codes TO authenticated;
GRANT ALL ON public.qr_scans TO authenticated;
GRANT INSERT ON public.qr_scans TO anon;

-- 9. 시퀀스 권한
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 10. 확인 쿼리
SELECT
    tablename,
    rowsecurity,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = pg_tables.tablename) as policy_count
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('qr_codes', 'qr_scans');

-- 11. 뷰 확인
SELECT table_name, is_insertable_into
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name = 'qr_code_analytics';