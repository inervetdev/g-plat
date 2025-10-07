-- Storage RLS Policies for sidejob-cards bucket

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload sidejob images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view sidejob images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own sidejob images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own sidejob images" ON storage.objects;

-- 1. INSERT policy: Allow authenticated users to upload to sidejob-cards bucket
CREATE POLICY "sidejob_cards_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'sidejob-cards'
);

-- 2. SELECT policy: Allow public to view/download from sidejob-cards bucket
CREATE POLICY "sidejob_cards_select"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'sidejob-cards'
);

-- 3. UPDATE policy: Allow authenticated users to update files in sidejob-cards bucket
CREATE POLICY "sidejob_cards_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'sidejob-cards')
WITH CHECK (bucket_id = 'sidejob-cards');

-- 4. DELETE policy: Allow authenticated users to delete files in sidejob-cards bucket
CREATE POLICY "sidejob_cards_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'sidejob-cards');
