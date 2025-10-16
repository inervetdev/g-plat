-- Deploy Card Attachments Feature to Production
-- This script creates all necessary tables and features for attachments and YouTube integration

-- 1. Create card_attachments table for multiple file support
CREATE TABLE IF NOT EXISTS public.card_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_card_id UUID NOT NULL REFERENCES public.business_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  filename TEXT,
  file_url TEXT,
  file_size INTEGER,
  file_type TEXT, -- MIME type
  display_order INTEGER NOT NULL DEFAULT 0,
  attachment_type TEXT DEFAULT 'file' CHECK (attachment_type IN ('file', 'youtube')),
  youtube_url TEXT,
  youtube_display_mode TEXT DEFAULT 'modal' CHECK (youtube_display_mode IN ('modal', 'inline')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_card_attachments_business_card_id ON public.card_attachments(business_card_id);
CREATE INDEX IF NOT EXISTS idx_card_attachments_user_id ON public.card_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_card_attachments_display_order ON public.card_attachments(business_card_id, display_order);

-- 3. Enable RLS
ALTER TABLE public.card_attachments ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
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

-- 5. Create attachment_downloads tracking table
CREATE TABLE IF NOT EXISTS public.attachment_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attachment_id UUID NOT NULL REFERENCES public.card_attachments(id) ON DELETE CASCADE,
  business_card_id UUID NOT NULL REFERENCES public.business_cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET DEFAULT inet_client_addr(),
  user_agent TEXT,
  referrer TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT
);

-- 6. Create indexes for attachment_downloads
CREATE INDEX IF NOT EXISTS idx_attachment_downloads_attachment_id ON public.attachment_downloads(attachment_id);
CREATE INDEX IF NOT EXISTS idx_attachment_downloads_business_card_id ON public.attachment_downloads(business_card_id);
CREATE INDEX IF NOT EXISTS idx_attachment_downloads_downloaded_at ON public.attachment_downloads(downloaded_at DESC);

-- 7. Enable RLS for attachment_downloads
ALTER TABLE public.attachment_downloads ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies for attachment_downloads
CREATE POLICY "Anyone can insert download tracking"
  ON public.attachment_downloads
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view their own attachment downloads"
  ON public.attachment_downloads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.card_attachments
      WHERE card_attachments.id = attachment_downloads.attachment_id
      AND card_attachments.user_id = auth.uid()
    )
  );

-- 9. Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_card_attachments_updated_at
  BEFORE UPDATE ON public.card_attachments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Create storage bucket for card attachments (run this in Supabase dashboard if needed)
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'card-attachments',
--   'card-attachments',
--   true,
--   52428800, -- 50MB
--   ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'video/mp4', 'video/webm']
-- );

-- 11. Add comments for documentation
COMMENT ON TABLE public.card_attachments IS 'Multiple file attachments for business cards (documents, images, videos, YouTube links)';
COMMENT ON COLUMN public.card_attachments.display_order IS 'Order in which attachments are displayed (0-based)';
COMMENT ON COLUMN public.card_attachments.file_type IS 'MIME type of the file (e.g., application/pdf, video/mp4)';
COMMENT ON COLUMN public.card_attachments.attachment_type IS 'Type of attachment: file or youtube';
COMMENT ON COLUMN public.card_attachments.youtube_display_mode IS 'How YouTube videos are displayed: modal or inline';

COMMENT ON TABLE public.attachment_downloads IS 'Tracking table for attachment download analytics';

-- Migration completed successfully
-- Note: You may need to create the storage bucket 'card-attachments' manually in Supabase dashboard