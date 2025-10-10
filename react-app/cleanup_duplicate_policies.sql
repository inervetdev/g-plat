-- Clean up duplicate storage policies
-- Run this in Supabase SQL Editor to remove old/duplicate policies

-- ============================================
-- Remove OLD/Duplicate Storage Policies
-- ============================================

-- Keep only the latest 4 policies, remove old ones
DROP POLICY IF EXISTS "Anyone can view sidejob images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload sidejob images" ON storage.objects;
DROP POLICY IF EXISTS "sidejob_cards_delete" ON storage.objects;
DROP POLICY IF EXISTS "sidejob_cards_insert" ON storage.objects;
DROP POLICY IF EXISTS "sidejob_cards_select" ON storage.objects;
DROP POLICY IF EXISTS "sidejob_cards_update" ON storage.objects;

-- The following policies should remain (created by apply_new_migrations_only.sql):
-- ✅ "Authenticated users can upload sidejob images" (INSERT)
-- ✅ "Authenticated users can update their own sidejob images" (UPDATE)
-- ✅ "Authenticated users can delete their own sidejob images" (DELETE)
-- ✅ "Public read access for sidejob images" (SELECT)

-- ============================================
-- Verification: Should show exactly 4 policies
-- ============================================

SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%sidejob%'
ORDER BY policyname;

-- Expected result: 4 rows
-- 1. Authenticated users can delete their own sidejob images (DELETE)
-- 2. Authenticated users can update their own sidejob images (UPDATE)
-- 3. Authenticated users can upload sidejob images (INSERT)
-- 4. Public read access for sidejob images (SELECT)
