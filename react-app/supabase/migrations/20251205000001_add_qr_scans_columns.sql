-- Add missing columns to qr_scans table for Edge Function compatibility
-- browser, os columns are needed by qr-redirect Edge Function

-- Add browser column
ALTER TABLE public.qr_scans
ADD COLUMN IF NOT EXISTS browser VARCHAR(50);

-- Add os column
ALTER TABLE public.qr_scans
ADD COLUMN IF NOT EXISTS os VARCHAR(50);

-- Add scan_count column to qr_codes table if not exists
ALTER TABLE public.qr_codes
ADD COLUMN IF NOT EXISTS scan_count INTEGER DEFAULT 0;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_qr_scans_browser ON public.qr_scans(browser);
CREATE INDEX IF NOT EXISTS idx_qr_scans_os ON public.qr_scans(os);

COMMENT ON COLUMN public.qr_scans.browser IS 'Browser name detected from user agent';
COMMENT ON COLUMN public.qr_scans.os IS 'Operating system detected from user agent';
