-- Get actual column names for each table
-- Run each SELECT separately in Supabase Dashboard

-- 1. Check users table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Check qr_codes table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'qr_codes'
ORDER BY ordinal_position;

-- 3. Check visitor_stats table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'visitor_stats'
ORDER BY ordinal_position;

-- 4. Check business_cards table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'business_cards'
ORDER BY ordinal_position;
