-- Deploy QR Tables to Production
-- Run this in Supabase Dashboard > SQL Editor
-- SAFE TO RUN: Uses IF NOT EXISTS and checks before modifying

-- Create qr_codes table (if not exists)
CREATE TABLE IF NOT EXISTS public.qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_card_id UUID REFERENCES public.business_cards(id) ON DELETE SET NULL,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    target_url TEXT NOT NULL,
    target_type VARCHAR(20) NOT NULL DEFAULT 'static' CHECK (target_type IN ('static', 'dynamic')),
    target_rules JSONB,
    campaign VARCHAR(50),
    max_scans INTEGER,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    scan_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add scan_count column if missing (for existing tables)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'qr_codes'
        AND column_name = 'scan_count'
    ) THEN
        ALTER TABLE public.qr_codes ADD COLUMN scan_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added scan_count column to qr_codes table';
    ELSE
        RAISE NOTICE 'scan_count column already exists in qr_codes table';
    END IF;
END $$;

-- Create qr_scans table (if not exists)
CREATE TABLE IF NOT EXISTS public.qr_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visitor_id UUID,
    ip_address INET,
    user_agent TEXT,
    country VARCHAR(2),
    city VARCHAR(100),
    device_type VARCHAR(20) CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'other')),
    referrer TEXT,
    session_duration INTEGER,
    browser VARCHAR(50),
    os VARCHAR(50)
);

-- Add browser and os columns if missing (for existing tables)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'qr_scans'
        AND column_name = 'browser'
    ) THEN
        ALTER TABLE public.qr_scans ADD COLUMN browser VARCHAR(50);
        RAISE NOTICE 'Added browser column to qr_scans table';
    ELSE
        RAISE NOTICE 'browser column already exists in qr_scans table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'qr_scans'
        AND column_name = 'os'
    ) THEN
        ALTER TABLE public.qr_scans ADD COLUMN os VARCHAR(50);
        RAISE NOTICE 'Added os column to qr_scans table';
    ELSE
        RAISE NOTICE 'os column already exists in qr_scans table';
    END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON public.qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_short_code ON public.qr_codes(short_code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_business_card_id ON public.qr_codes(business_card_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_is_active ON public.qr_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_qr_scans_qr_code_id ON public.qr_scans(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_scanned_at ON public.qr_scans(scanned_at);
CREATE INDEX IF NOT EXISTS idx_qr_scans_visitor_id ON public.qr_scans(visitor_id);

-- Create updated_at trigger for qr_codes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'update_qr_codes_updated_at'
    ) THEN
        CREATE TRIGGER update_qr_codes_updated_at
            BEFORE UPDATE ON public.qr_codes
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can insert their own QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can update their own QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can delete their own QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Public can view active QR codes by short_code" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can view scans for their own QR codes" ON public.qr_scans;
DROP POLICY IF EXISTS "Public can insert scan records" ON public.qr_scans;
DROP POLICY IF EXISTS "Users can update scan records for their own QR codes" ON public.qr_scans;

-- RLS Policies for qr_codes table

-- Policy: Users can view their own QR codes
CREATE POLICY "Users can view their own QR codes"
    ON public.qr_codes
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own QR codes
CREATE POLICY "Users can insert their own QR codes"
    ON public.qr_codes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own QR codes
CREATE POLICY "Users can update their own QR codes"
    ON public.qr_codes
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own QR codes
CREATE POLICY "Users can delete their own QR codes"
    ON public.qr_codes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Policy: Public can view active QR codes by short_code (for redirects)
CREATE POLICY "Public can view active QR codes by short_code"
    ON public.qr_codes
    FOR SELECT
    USING (
        is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
    );

-- RLS Policies for qr_scans table

-- Policy: Users can view scans for their own QR codes
CREATE POLICY "Users can view scans for their own QR codes"
    ON public.qr_scans
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.qr_codes
            WHERE qr_codes.id = qr_scans.qr_code_id
            AND qr_codes.user_id = auth.uid()
        )
    );

-- Policy: Public can insert scan records (for tracking)
CREATE POLICY "Public can insert scan records"
    ON public.qr_scans
    FOR INSERT
    WITH CHECK (true);

-- Policy: Users can update scan records for their own QR codes (for session duration)
CREATE POLICY "Users can update scan records for their own QR codes"
    ON public.qr_scans
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.qr_codes
            WHERE qr_codes.id = qr_scans.qr_code_id
            AND qr_codes.user_id = auth.uid()
        )
    );

-- Drop existing view if structure changed (to avoid column name conflicts)
DROP VIEW IF EXISTS qr_code_analytics;

-- Create a view for QR code analytics
CREATE VIEW qr_code_analytics AS
SELECT
    qc.id,
    qc.user_id,
    qc.short_code,
    qc.campaign,
    qc.created_at,
    COUNT(qs.id) as total_scans,
    COUNT(DISTINCT qs.visitor_id) as unique_visitors,
    COUNT(DISTINCT DATE(qs.scanned_at)) as active_days,
    COUNT(CASE WHEN qs.device_type = 'mobile' THEN 1 END) as mobile_scans,
    COUNT(CASE WHEN qs.device_type = 'desktop' THEN 1 END) as desktop_scans,
    COUNT(CASE WHEN qs.device_type = 'tablet' THEN 1 END) as tablet_scans,
    MAX(qs.scanned_at) as last_scanned_at,
    AVG(qs.session_duration) as avg_session_duration
FROM public.qr_codes qc
LEFT JOIN public.qr_scans qs ON qc.id = qs.qr_code_id
GROUP BY qc.id, qc.user_id, qc.short_code, qc.campaign, qc.created_at;

-- Grant access to the view
GRANT SELECT ON qr_code_analytics TO authenticated;

-- RLS policy for the analytics view
ALTER VIEW qr_code_analytics SET (security_invoker = on);

-- Add comments
COMMENT ON TABLE public.qr_codes IS 'Stores QR code configurations with dynamic routing capabilities';
COMMENT ON TABLE public.qr_scans IS 'Tracks individual QR code scans with visitor analytics';
COMMENT ON VIEW qr_code_analytics IS 'Aggregated analytics for QR code performance tracking';
COMMENT ON COLUMN public.qr_scans.browser IS 'Browser name detected from user agent';
COMMENT ON COLUMN public.qr_scans.os IS 'Operating system detected from user agent';
