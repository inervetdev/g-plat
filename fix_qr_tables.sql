-- QR 테이블 스키마 및 RLS 정책 수정

-- 1. short_code 컬럼 타입 수정 (10자에서 20자로 확장)
ALTER TABLE public.qr_codes
ALTER COLUMN short_code TYPE VARCHAR(20);

-- 2. RLS 정책 재설정 (무한 재귀 방지)
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

-- 3. RLS 활성화 확인
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- 4. 새로운 RLS 정책 (단순하고 명확하게)
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

-- 5. 권한 부여
GRANT ALL ON public.qr_codes TO authenticated;
GRANT ALL ON public.qr_scans TO authenticated;
GRANT INSERT ON public.qr_scans TO anon;

-- 6. 시퀀스 권한
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 7. 확인
SELECT
    tablename,
    rowsecurity,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = pg_tables.tablename) as policy_count
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('qr_codes', 'qr_scans');