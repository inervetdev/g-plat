-- Add youtube_url column to card_attachments table
ALTER TABLE public.card_attachments
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT DEFAULT 'file' CHECK (attachment_type IN ('file', 'youtube'));

-- Make file-related columns nullable to support YouTube URLs
ALTER TABLE public.card_attachments
ALTER COLUMN filename DROP NOT NULL,
ALTER COLUMN file_url DROP NOT NULL,
ALTER COLUMN file_size DROP NOT NULL,
ALTER COLUMN file_type DROP NOT NULL;

-- Create index for attachment_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_card_attachments_type ON public.card_attachments(attachment_type);

-- Update existing records to have 'file' type
UPDATE public.card_attachments
SET attachment_type = 'file'
WHERE attachment_type IS NULL;
