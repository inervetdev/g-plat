-- Fix Schema Errors for Admin App
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Add status column to users table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'status'
    ) THEN
        ALTER TABLE users
        ADD COLUMN status TEXT DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'suspended'));

        -- Set all existing users to active
        UPDATE users SET status = 'active' WHERE status IS NULL;

        RAISE NOTICE 'Added status column to users table';
    ELSE
        RAISE NOTICE 'status column already exists in users table';
    END IF;
END $$;

-- 2. Check and report qr_codes structure
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_name = 'qr_codes' AND column_name = 'card_id';

    IF col_count = 0 THEN
        RAISE NOTICE 'WARNING: qr_codes.card_id does not exist!';
        RAISE NOTICE 'Please check actual column name in qr_codes table';
    ELSE
        RAISE NOTICE 'qr_codes.card_id exists';
    END IF;
END $$;

-- 3. Check visitor_stats foreign key
DO $$
DECLARE
    fk_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'visitor_stats'
            AND tc.constraint_type = 'FOREIGN KEY'
            AND ccu.table_name = 'business_cards'
    ) INTO fk_exists;

    IF NOT fk_exists THEN
        RAISE NOTICE 'WARNING: No foreign key between visitor_stats and business_cards';
    ELSE
        RAISE NOTICE 'Foreign key exists between visitor_stats and business_cards';
    END IF;
END $$;

-- 4. Display current structure
SELECT 'users columns:' AS info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name IN ('id', 'status', 'account_status')
ORDER BY ordinal_position;

SELECT 'qr_codes columns:' AS info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'qr_codes' AND column_name LIKE '%card%'
ORDER BY ordinal_position;

SELECT 'visitor_stats columns:' AS info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'visitor_stats' AND column_name LIKE '%card%'
ORDER BY ordinal_position;

SELECT 'Schema check completed!' AS result;
