-- Create attachment downloads tracking table
CREATE TABLE IF NOT EXISTS public.attachment_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attachment_id UUID NOT NULL REFERENCES public.card_attachments(id) ON DELETE CASCADE,
  business_card_id UUID NOT NULL REFERENCES public.business_cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Download metadata
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,

  -- Device info (parsed from user_agent)
  device_type TEXT, -- mobile, tablet, desktop
  browser TEXT,
  os TEXT,

  -- Location (optional, can be added later with IP geolocation)
  country TEXT,
  city TEXT,

  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_attachment_downloads_attachment_id ON public.attachment_downloads(attachment_id);
CREATE INDEX IF NOT EXISTS idx_attachment_downloads_business_card_id ON public.attachment_downloads(business_card_id);
CREATE INDEX IF NOT EXISTS idx_attachment_downloads_downloaded_at ON public.attachment_downloads(downloaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_attachment_downloads_device_type ON public.attachment_downloads(device_type);

-- Enable RLS
ALTER TABLE public.attachment_downloads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can create download records"
  ON public.attachment_downloads
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Card owners can view their download stats"
  ON public.attachment_downloads
  FOR SELECT
  TO authenticated
  USING (
    business_card_id IN (
      SELECT id FROM public.business_cards WHERE user_id = auth.uid()
    )
  );

-- Create analytics view for easy querying
CREATE OR REPLACE VIEW public.attachment_download_stats AS
SELECT
  bc.id as business_card_id,
  bc.user_id,
  bc.name as card_name,
  ca.id as attachment_id,
  ca.title as attachment_title,
  ca.filename,
  COUNT(ad.id) as total_downloads,
  COUNT(DISTINCT ad.ip_address) as unique_ips,
  COUNT(CASE WHEN ad.device_type = 'mobile' THEN 1 END) as mobile_downloads,
  COUNT(CASE WHEN ad.device_type = 'desktop' THEN 1 END) as desktop_downloads,
  COUNT(CASE WHEN ad.device_type = 'tablet' THEN 1 END) as tablet_downloads,
  MAX(ad.downloaded_at) as last_download_at,
  MIN(ad.downloaded_at) as first_download_at
FROM public.business_cards bc
LEFT JOIN public.card_attachments ca ON ca.business_card_id = bc.id
LEFT JOIN public.attachment_downloads ad ON ad.attachment_id = ca.id
GROUP BY bc.id, bc.user_id, bc.name, ca.id, ca.title, ca.filename;

-- Grant access to the view
GRANT SELECT ON public.attachment_download_stats TO authenticated;

-- Comment on tables and views
COMMENT ON TABLE public.attachment_downloads IS 'Tracks every download of business card attachments for analytics';
COMMENT ON VIEW public.attachment_download_stats IS 'Aggregated download statistics per attachment';
COMMENT ON COLUMN public.attachment_downloads.device_type IS 'Device type: mobile, tablet, or desktop';
COMMENT ON COLUMN public.attachment_downloads.user_agent IS 'Full user agent string for detailed analysis';
