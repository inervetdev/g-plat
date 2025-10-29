-- ===================================================
-- Fix business_cards → users Foreign Key
-- ===================================================

-- business_cards 테이블이 현재 auth.users만 참조하고 있음
-- public.users와의 관계를 위해 외래키 제약조건 추가

-- 1. 기존 user_id 외래키 제약조건 확인
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'business_cards'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'user_id';

-- 2. 현재 상태 설명
-- business_cards.user_id → auth.users.id (이미 존재)
-- public.users.id → auth.users.id (이미 존재)
-- 따라서: business_cards.user_id는 간접적으로 public.users.id와 매칭됨

-- 3. Supabase PostgREST가 관계를 인식하도록 하는 방법:
-- 옵션 A: business_cards.user_id가 public.users.id를 직접 참조하도록 변경
-- 옵션 B: 코드에서 조인 방식 변경 (권장)

-- 옵션 A 실행 (주의: 이미 데이터가 있는 경우 위험할 수 있음)
DO $$
BEGIN
    -- 기존 auth.users 참조 제약조건 제거
    ALTER TABLE public.business_cards
    DROP CONSTRAINT IF EXISTS business_cards_user_id_fkey;

    -- public.users를 참조하는 새 제약조건 추가
    ALTER TABLE public.business_cards
    ADD CONSTRAINT business_cards_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users(id)
    ON DELETE CASCADE;

    RAISE NOTICE '✅ business_cards → users 외래키 설정 완료';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️  에러 발생: %', SQLERRM;
END $$;

-- 4. 확인
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'business_cards'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'user_id';

SELECT '✅ Foreign key fix completed!' AS result;
