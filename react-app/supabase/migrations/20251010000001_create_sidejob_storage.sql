-- Create storage bucket for sidejob card images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sidejob-cards',
  'sidejob-cards',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
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
