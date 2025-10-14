-- Add attachment fields to business_cards table
ALTER TABLE public.business_cards
ADD COLUMN IF NOT EXISTS attachment_title TEXT,
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_filename TEXT,
ADD COLUMN IF NOT EXISTS attachment_size INTEGER;

-- Comment on columns
COMMENT ON COLUMN public.business_cards.attachment_title IS 'Display name for the attachment (e.g., "사업계획서", "포트폴리오")';
COMMENT ON COLUMN public.business_cards.attachment_url IS 'Storage URL for the attached file';
COMMENT ON COLUMN public.business_cards.attachment_filename IS 'Original filename of the attachment';
COMMENT ON COLUMN public.business_cards.attachment_size IS 'File size in bytes';
