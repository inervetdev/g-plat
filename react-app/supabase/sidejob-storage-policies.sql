-- Storage RLS Policies for sidejob-cards bucket
-- Run this in Supabase Dashboard > SQL Editor

-- 1. Drop existing policies if they exist (optional, remove if you want to keep them)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload sidejob images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view sidejob images" ON storage.objects;

-- 2. Create INSERT policy for authenticated users
CREATE POLICY "Allow authenticated uploads for sidejob"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'sidejob-cards'
);

-- 3. Create SELECT policy for public access
CREATE POLICY "Allow public reads for sidejob"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'sidejob-cards'
);

-- 4. (Optional) Create UPDATE policy for authenticated users
CREATE POLICY "Allow authenticated updates for sidejob"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'sidejob-cards')
WITH CHECK (bucket_id = 'sidejob-cards');

-- 5. (Optional) Create DELETE policy for authenticated users
CREATE POLICY "Allow authenticated deletes for sidejob"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'sidejob-cards');
