-- Fix Schema Cache Issue for cta_link column
-- Error: Could not find the 'cta_link' column of 'sidejob_cards' in the schema cache

-- ============================================
-- Step 1: Verify column exists
-- ============================================

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sidejob_cards'
  AND column_name = 'cta_link';

-- If this returns a row, the column exists
-- If no rows, the column is missing

-- ============================================
-- Step 2: Check if old column name exists
-- ============================================

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sidejob_cards'
  AND column_name IN ('cta_url', 'cta_link');

-- This will show which column name exists

-- ============================================
-- Step 3: Add cta_link column if missing
-- ============================================

-- This should have been applied by migration 002_rename_cta_url_to_cta_link.sql
-- If it's missing, apply it now:

ALTER TABLE public.sidejob_cards
RENAME COLUMN cta_url TO cta_link;

-- If column already renamed, this will give an error - that's OK

-- ============================================
-- Step 4: Refresh Supabase schema cache
-- ============================================

-- In Supabase Dashboard:
-- 1. Go to Settings > Database
-- 2. Click "Reload schema" or restart API

-- Or run this to invalidate cache:
NOTIFY pgrst, 'reload schema';

-- ============================================
-- Step 5: Verify all columns exist
-- ============================================

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sidejob_cards'
ORDER BY ordinal_position;

-- Expected columns should include:
-- - cta_link (not cta_url)
-- - category_primary
-- - category_secondary
-- - tags
-- - badge
-- - expiry_date
