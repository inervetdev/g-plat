-- Add browser and os columns to qr_scans table

ALTER TABLE public.qr_scans
ADD COLUMN IF NOT EXISTS browser VARCHAR(50),
ADD COLUMN IF NOT EXISTS os VARCHAR(50);

COMMENT ON COLUMN public.qr_scans.browser IS 'Browser name detected from user agent';
COMMENT ON COLUMN public.qr_scans.os IS 'Operating system detected from user agent';
