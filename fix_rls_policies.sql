-- QR 코드 관련 RLS 정책 완전 재설정
-- 1단계: 모든 기존 정책 삭제 및 RLS 비활성화

-- qr_codes 테이블
ALTER TABLE public.qr_codes DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated users on qr_codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can read own qr_codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can insert own qr_codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can update own qr_codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can delete own qr_codes" ON public.qr_codes;

-- qr_scans 테이블
ALTER TABLE public.qr_scans DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable insert for all on qr_scans" ON public.qr_scans;
DROP POLICY IF EXISTS "Enable read for authenticated users on qr_scans" ON public.qr_scans;
DROP POLICY IF EXISTS "Public can insert qr_scans" ON public.qr_scans;
DROP POLICY IF EXISTS "Users can read own qr_scans" ON public.qr_scans;

-- 2단계: 개발 단계에서는 RLS를 비활성화 상태로 유지
-- 나중에 프로덕션에서 다시 활성화할 수 있습니다.

-- 옵션: 만약 RLS를 활성화하고 싶다면 아래 주석을 해제하세요
/*
-- 3단계: RLS 재활성화 및 단순한 정책 적용
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- qr_codes: 인증된 사용자가 자신의 데이터만 접근
CREATE POLICY "qr_codes_authenticated_policy"
ON public.qr_codes
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- qr_scans: 누구나 삽입 가능, 소유자만 조회 가능
CREATE POLICY "qr_scans_insert_policy"
ON public.qr_scans
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "qr_scans_select_policy"
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
*/

-- 4단계: 권한 확인 및 부여
GRANT ALL ON public.qr_codes TO authenticated;
GRANT ALL ON public.qr_scans TO authenticated;
GRANT INSERT ON public.qr_scans TO anon;

-- 5단계: 시퀀스 권한 부여 (ID 생성을 위해)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 확인 쿼리
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('qr_codes', 'qr_scans');