-- RLS 상태 확인 쿼리
-- Supabase SQL Editor에서 실행하세요

-- 1. 모든 테이블의 RLS 활성화 상태 확인
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. RLS 정책 개수 확인
SELECT
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 3. 상세 정책 목록
SELECT
    tablename,
    policyname,
    cmd as command,
    roles,
    CASE
        WHEN qual IS NOT NULL THEN 'USING 조건 있음'
        ELSE 'USING 조건 없음'
    END as using_clause,
    CASE
        WHEN with_check IS NOT NULL THEN 'WITH CHECK 조건 있음'
        ELSE 'WITH CHECK 조건 없음'
    END as check_clause
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
