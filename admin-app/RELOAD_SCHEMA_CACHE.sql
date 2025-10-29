-- ===================================================
-- Reload Supabase PostgREST Schema Cache
-- ===================================================

-- PostgREST가 스키마 변경사항을 인식하지 못할 때 실행
-- 외래키 변경 후 관계가 인식되지 않는 경우 필요

-- 방법 1: NOTIFY를 통한 스키마 리로드
NOTIFY pgrst, 'reload schema';

-- 방법 2: 스키마 확인
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name IN ('business_cards', 'users')
    AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, kcu.column_name;

SELECT '✅ Schema cache reload requested!' AS result;
