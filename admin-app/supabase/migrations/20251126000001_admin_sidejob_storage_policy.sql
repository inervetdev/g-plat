-- Admin users can upload sidejob images to any user's folder
-- This allows admin to modify user-uploaded images

-- Drop existing admin policy if exists
DROP POLICY IF EXISTS "Admin users can upload sidejob images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update sidejob images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete sidejob images" ON storage.objects;

-- RLS Policy: Allow admin users to upload to any folder in sidejob-cards bucket
CREATE POLICY "Admin users can upload sidejob images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'sidejob-cards' AND
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- RLS Policy: Allow admin users to update any image in sidejob-cards bucket
CREATE POLICY "Admin users can update sidejob images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'sidejob-cards' AND
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.is_active = true
  )
)
WITH CHECK (
  bucket_id = 'sidejob-cards' AND
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- RLS Policy: Allow admin users to delete any image in sidejob-cards bucket
CREATE POLICY "Admin users can delete sidejob images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'sidejob-cards' AND
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.is_active = true
  )
);
