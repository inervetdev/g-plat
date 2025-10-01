-- ========================================
-- Check and Migrate CTA Columns
-- ========================================
-- This script checks the current structure of sidejob_cards table
-- and migrates cta_url to cta_link if needed

-- Step 1: Check current columns
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sidejob_cards'
  AND column_name IN ('cta_text', 'cta_url', 'cta_link')
ORDER BY column_name;

-- Step 2: Rename cta_url to cta_link (if cta_url exists)
-- Run this only if you see 'cta_url' in the results above
ALTER TABLE public.sidejob_cards
RENAME COLUMN cta_url TO cta_link;

-- Step 3: Add comment to document the column purpose
COMMENT ON COLUMN public.sidejob_cards.cta_text IS 'Call-to-action button text for the side job card';
COMMENT ON COLUMN public.sidejob_cards.cta_link IS 'Call-to-action link URL for the side job card';

-- Step 4: Verify the changes
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    col_description('public.sidejob_cards'::regclass, ordinal_position) as description
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sidejob_cards'
  AND column_name IN ('cta_text', 'cta_link')
ORDER BY column_name;

-- Step 5: Show sample data (if any exists)
SELECT
    id,
    title,
    cta_text,
    cta_link,
    created_at
FROM public.sidejob_cards
LIMIT 5;