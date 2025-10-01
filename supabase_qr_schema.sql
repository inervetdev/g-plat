-- Create qr_codes table
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create qr_scans table
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
    session_duration INTEGER
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON public.qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_short_code ON public.qr_codes(short_code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_business_card_id ON public.qr_codes(business_card_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_is_active ON public.qr_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_qr_scans_qr_code_id ON public.qr_scans(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_scanned_at ON public.qr_scans(scanned_at);
CREATE INDEX IF NOT EXISTS idx_qr_scans_visitor_id ON public.qr_scans(visitor_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for qr_codes updated_at
DROP TRIGGER IF EXISTS update_qr_codes_updated_at ON public.qr_codes;
CREATE TRIGGER update_qr_codes_updated_at
    BEFORE UPDATE ON public.qr_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

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
        AND (max_scans IS NULL OR (
            SELECT COUNT(*) FROM public.qr_scans WHERE qr_code_id = id
        ) < max_scans)
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

-- Create a view for QR code analytics
CREATE OR REPLACE VIEW qr_code_analytics AS
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

COMMENT ON TABLE public.qr_codes IS 'Stores QR code configurations with dynamic routing capabilities';
COMMENT ON TABLE public.qr_scans IS 'Tracks individual QR code scans with visitor analytics';
COMMENT ON VIEW qr_code_analytics IS 'Aggregated analytics for QR code performance tracking';
