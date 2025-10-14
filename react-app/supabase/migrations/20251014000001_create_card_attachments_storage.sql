-- Create storage bucket for business card attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'card-attachments',
  'card-attachments',
  true,
  10485760, -- 10MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload card attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their own attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own attachments" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for card attachments" ON storage.objects;

-- RLS Policy: Allow authenticated users to upload to their own folder
CREATE POLICY "Authenticated users can upload card attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'card-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Allow authenticated users to update their own attachments
CREATE POLICY "Authenticated users can update their own attachments"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'card-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'card-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Allow authenticated users to delete their own attachments
CREATE POLICY "Authenticated users can delete their own attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'card-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Allow public read access to all attachments
CREATE POLICY "Public read access for card attachments"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'card-attachments');
