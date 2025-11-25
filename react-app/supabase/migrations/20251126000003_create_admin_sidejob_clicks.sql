-- =====================================================
-- Migration: Create Admin Sidejob Clicks Table
-- Description: Track clicks on admin-provided sidejob cards for analytics
-- =====================================================

-- Create admin sidejob clicks table
CREATE TABLE IF NOT EXISTS public.admin_sidejob_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relationships
    instance_id UUID NOT NULL REFERENCES public.admin_sidejob_instances(id) ON DELETE CASCADE,
    business_card_id UUID REFERENCES public.business_cards(id) ON DELETE SET NULL,

    -- Source tracking (which card page was visited)
    source_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    source_card_url TEXT,

    -- Visitor info
    visitor_ip INET,
    visitor_id UUID,                               -- Cookie-based anonymous visitor tracking
    user_agent TEXT,
    referrer TEXT,

    -- Device info
    device_type VARCHAR(20) CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'other')),
    browser VARCHAR(50),
    os VARCHAR(50),

    -- Geolocation (optional)
    country VARCHAR(2),
    city VARCHAR(100),

    -- Conversion tracking
    is_conversion BOOLEAN DEFAULT FALSE,
    conversion_type VARCHAR(50),                   -- 'signup', 'purchase', 'inquiry', etc.
    conversion_value DECIMAL(10,2),
    converted_at TIMESTAMPTZ,

    -- Timestamps
    clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clicks_instance
    ON public.admin_sidejob_clicks(instance_id);

CREATE INDEX IF NOT EXISTS idx_clicks_time
    ON public.admin_sidejob_clicks(clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_clicks_conversion
    ON public.admin_sidejob_clicks(is_conversion)
    WHERE is_conversion = TRUE;

CREATE INDEX IF NOT EXISTS idx_clicks_visitor
    ON public.admin_sidejob_clicks(visitor_id)
    WHERE visitor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clicks_business_card
    ON public.admin_sidejob_clicks(business_card_id)
    WHERE business_card_id IS NOT NULL;

-- Note: Date-based index removed due to IMMUTABLE requirement
-- Use clicked_at DESC index with date range queries instead

-- Trigger to update instance click count
CREATE OR REPLACE FUNCTION increment_sidejob_instance_click_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update instance statistics
    UPDATE public.admin_sidejob_instances
    SET click_count = click_count + 1
    WHERE id = NEW.instance_id;

    -- Update template aggregate statistics
    UPDATE public.admin_sidejob_templates
    SET total_clicks = total_clicks + 1
    WHERE id = (SELECT template_id FROM public.admin_sidejob_instances WHERE id = NEW.instance_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_sidejob_click_insert ON public.admin_sidejob_clicks;
CREATE TRIGGER after_sidejob_click_insert
    AFTER INSERT ON public.admin_sidejob_clicks
    FOR EACH ROW
    EXECUTE FUNCTION increment_sidejob_instance_click_count();

-- Trigger to update conversion counts
CREATE OR REPLACE FUNCTION update_sidejob_conversion_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_conversion = TRUE AND (OLD IS NULL OR OLD.is_conversion = FALSE) THEN
        -- Update instance conversion count
        UPDATE public.admin_sidejob_instances
        SET conversion_count = conversion_count + 1
        WHERE id = NEW.instance_id;

        -- Update template aggregate
        UPDATE public.admin_sidejob_templates
        SET total_conversions = total_conversions + 1
        WHERE id = (SELECT template_id FROM public.admin_sidejob_instances WHERE id = NEW.instance_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_sidejob_click_conversion_update ON public.admin_sidejob_clicks;
CREATE TRIGGER after_sidejob_click_conversion_update
    AFTER UPDATE OF is_conversion ON public.admin_sidejob_clicks
    FOR EACH ROW
    EXECUTE FUNCTION update_sidejob_conversion_count();

-- Comments for documentation
COMMENT ON TABLE public.admin_sidejob_clicks IS 'Click tracking for admin-provided sidejob cards';
COMMENT ON COLUMN public.admin_sidejob_clicks.visitor_id IS 'Cookie-based anonymous visitor ID for unique visitor tracking';
COMMENT ON COLUMN public.admin_sidejob_clicks.is_conversion IS 'Whether this click resulted in a conversion (signup, purchase, etc.)';
COMMENT ON COLUMN public.admin_sidejob_clicks.conversion_value IS 'Monetary value of the conversion if applicable';
