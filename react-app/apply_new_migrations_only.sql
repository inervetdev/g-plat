-- Apply ONLY the new migrations (Category + Storage)
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/anwwjowwrxdygqyhhckr/sql

-- ============================================
-- Migration 1: Add Sidejob Categories
-- ============================================

-- Create ENUM type for primary categories
DO $$ BEGIN
    CREATE TYPE category_primary_type AS ENUM (
        'shopping',
        'education',
        'service',
        'subscription',
        'promotion'
    );
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Type category_primary_type already exists, skipping';
END $$;

-- Add new columns to sidejob_cards table
ALTER TABLE public.sidejob_cards
ADD COLUMN IF NOT EXISTS category_primary category_primary_type,
ADD COLUMN IF NOT EXISTS category_secondary VARCHAR(50),
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS badge VARCHAR(20),
ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP WITH TIME ZONE;

-- Add comments
COMMENT ON COLUMN public.sidejob_cards.category_primary IS 'Primary category: shopping, education, service, subscription, promotion';
COMMENT ON COLUMN public.sidejob_cards.category_secondary IS 'Secondary category (specific subcategory name)';
COMMENT ON COLUMN public.sidejob_cards.tags IS 'Additional tags for filtering and search';
COMMENT ON COLUMN public.sidejob_cards.badge IS 'Badge text (e.g., HOT, NEW, SALE)';
COMMENT ON COLUMN public.sidejob_cards.expiry_date IS 'Expiry date for time-limited offers';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sidejob_category
    ON public.sidejob_cards(category_primary, category_secondary);

CREATE INDEX IF NOT EXISTS idx_sidejob_badge
    ON public.sidejob_cards(badge)
    WHERE badge IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sidejob_expiry
    ON public.sidejob_cards(expiry_date)
    WHERE expiry_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sidejob_tags
    ON public.sidejob_cards USING gin(tags);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sidejob_cards TO authenticated;
GRANT SELECT ON public.sidejob_cards TO anon;

-- ============================================
-- Migration 2: Create Storage Bucket & Policies
-- ============================================

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sidejob-cards',
  'sidejob-cards',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing policies if they exist (to avoid duplicates)
DROP POLICY IF EXISTS "Authenticated users can upload sidejob images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their own sidejob images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own sidejob images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for sidejob images" ON storage.objects;

-- RLS Policy: Allow authenticated users to upload to their own folder
CREATE POLICY "Authenticated users can upload sidejob images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'sidejob-cards' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Allow authenticated users to update their own images
CREATE POLICY "Authenticated users can update their own sidejob images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'sidejob-cards' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'sidejob-cards' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Allow authenticated users to delete their own images
CREATE POLICY "Authenticated users can delete their own sidejob images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'sidejob-cards' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Allow public read access to all images
CREATE POLICY "Public read access for sidejob images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'sidejob-cards');

-- ============================================
-- Verification Queries
-- ============================================

-- 1. Check category columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sidejob_cards'
  AND column_name IN ('category_primary', 'category_secondary', 'tags', 'badge', 'expiry_date')
ORDER BY ordinal_position;

-- 2. Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'sidejob_cards'
  AND (indexname LIKE '%category%' OR indexname LIKE '%badge%' OR indexname LIKE '%expiry%' OR indexname LIKE '%tag%');

-- 3. Check storage bucket
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'sidejob-cards';

-- 4. Check storage policies (should return 4 rows)
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%sidejob%'
ORDER BY policyname;

-- Expected results:
-- - 5 new columns in sidejob_cards
-- - 4 new indexes
-- - 1 storage bucket
-- - 4 storage policies
