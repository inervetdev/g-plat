-- ===================================================
-- G-PLAT Admin App Schema Fix
-- 프로덕션 에러 3가지 해결
-- 실행 위치: Supabase Dashboard → SQL Editor
-- ===================================================

-- 1. users 테이블에 status 컬럼 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN status TEXT DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'suspended'));

        UPDATE public.users SET status = 'active' WHERE status IS NULL;

        CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

        RAISE NOTICE '✅ users.status 컬럼 추가 완료';
    ELSE
        RAISE NOTICE 'ℹ️  users.status 컬럼이 이미 존재합니다';
    END IF;
END $$;

-- 2. visitor_stats 테이블에 business_card_id 컬럼 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'visitor_stats' AND column_name = 'business_card_id'
    ) THEN
        ALTER TABLE public.visitor_stats
        ADD COLUMN business_card_id UUID REFERENCES public.business_cards(id) ON DELETE CASCADE;

        CREATE INDEX IF NOT EXISTS idx_visitor_stats_business_card_id
        ON public.visitor_stats(business_card_id);

        RAISE NOTICE '✅ visitor_stats.business_card_id 컬럼 추가 완료';
    ELSE
        RAISE NOTICE 'ℹ️  visitor_stats.business_card_id 컬럼이 이미 존재합니다';
    END IF;
END $$;

-- 3. 스키마 확인
SELECT 'users 테이블 컬럼:' AS info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name IN ('id', 'status', 'subscription_tier')
ORDER BY ordinal_position;

SELECT 'qr_codes 테이블 컬럼:' AS info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'qr_codes' AND column_name LIKE '%card%'
ORDER BY ordinal_position;

SELECT 'visitor_stats 테이블 컬럼:' AS info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'visitor_stats' AND column_name IN ('user_id', 'business_card_id')
ORDER BY ordinal_position;

-- 완료 메시지
SELECT '✅ Schema fix completed successfully!' AS result;
