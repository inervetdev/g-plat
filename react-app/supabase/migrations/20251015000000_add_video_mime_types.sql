-- Add video MIME types to card-attachments bucket
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  -- Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  -- Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  -- Videos (NEW)
  'video/mp4',
  'video/webm',
  'video/quicktime', -- MOV
  'video/x-msvideo',  -- AVI
  'video/mpeg'
]
WHERE id = 'card-attachments';
