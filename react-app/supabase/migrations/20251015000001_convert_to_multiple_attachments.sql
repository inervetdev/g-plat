-- Create card_attachments table for multiple file support
CREATE TABLE IF NOT EXISTS public.card_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_card_id UUID NOT NULL REFERENCES public.business_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL, -- MIME type
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_card_attachments_business_card_id ON public.card_attachments(business_card_id);
CREATE INDEX IF NOT EXISTS idx_card_attachments_user_id ON public.card_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_card_attachments_display_order ON public.card_attachments(business_card_id, display_order);

-- Enable RLS
ALTER TABLE public.card_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all attachments"
  ON public.card_attachments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert their own attachments"
  ON public.card_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attachments"
  ON public.card_attachments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own attachments"
  ON public.card_attachments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Migrate existing attachment data from business_cards to card_attachments
INSERT INTO public.card_attachments (
  business_card_id,
  user_id,
  title,
  filename,
  file_url,
  file_size,
  file_type,
  display_order
)
SELECT
  id as business_card_id,
  user_id,
  COALESCE(attachment_title, '첨부파일') as title,
  COALESCE(attachment_filename, 'file') as filename,
  attachment_url as file_url,
  COALESCE(attachment_size, 0) as file_size,
  'application/octet-stream' as file_type,
  0 as display_order
FROM public.business_cards
WHERE attachment_url IS NOT NULL AND attachment_url != '';

-- Comment on table
COMMENT ON TABLE public.card_attachments IS 'Multiple file attachments for business cards (documents, images, videos)';
COMMENT ON COLUMN public.card_attachments.display_order IS 'Order in which attachments are displayed (0-based)';
COMMENT ON COLUMN public.card_attachments.file_type IS 'MIME type of the file (e.g., application/pdf, video/mp4)';

-- Note: We keep the old columns in business_cards for backward compatibility
-- They can be removed in a future migration after confirming everything works
COMMENT ON COLUMN public.business_cards.attachment_title IS 'DEPRECATED: Use card_attachments table instead';
COMMENT ON COLUMN public.business_cards.attachment_url IS 'DEPRECATED: Use card_attachments table instead';
COMMENT ON COLUMN public.business_cards.attachment_filename IS 'DEPRECATED: Use card_attachments table instead';
COMMENT ON COLUMN public.business_cards.attachment_size IS 'DEPRECATED: Use card_attachments table instead';
