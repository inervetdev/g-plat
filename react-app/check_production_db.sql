-- Check if sidejob_cards table has category columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sidejob_cards'
  AND column_name IN ('category_primary', 'category_secondary', 'tags', 'badge', 'expiry_date')
ORDER BY ordinal_position;

-- Check if category ENUM type exists
SELECT typname, typtype
FROM pg_type
WHERE typname = 'category_primary_type';

-- Check storage buckets
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'sidejob-cards';

-- Check storage policies for sidejob-cards
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%sidejob%';

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'sidejob_cards'
  AND indexname LIKE '%category%' OR indexname LIKE '%badge%' OR indexname LIKE '%expiry%' OR indexname LIKE '%tag%';
