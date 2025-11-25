-- =====================================================
-- Migration: Create Admin Sidejob Templates Table
-- Description: Store admin-created affiliate/partnership sidejob card templates
-- =====================================================

-- Create ENUM for 12 B2B categories
DO $$ BEGIN
    CREATE TYPE admin_b2b_category AS ENUM (
        'rental',              -- 렌탈
        'card_terminal',       -- 카드단말기
        'internet',            -- 인터넷
        'advertising',         -- 광고
        'liquor',              -- 주류
        'insurance',           -- 보험
        'tax_accounting',      -- 세무기장
        'policy_funds',        -- 정책자금
        'tax_refund',          -- 세금환급
        'flower_delivery',     -- 꽃배달
        'website_development', -- 홈페이지 개발
        'marriage_agency'      -- 결혼정보
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create admin sidejob templates table
CREATE TABLE IF NOT EXISTS public.admin_sidejob_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Basic info
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price TEXT,

    -- Category
    category admin_b2b_category NOT NULL,

    -- CTA (Call to Action)
    cta_text TEXT NOT NULL DEFAULT '자세히 보기',
    base_cta_link TEXT NOT NULL,                    -- Base URL for free users (company URL)

    -- Partner info
    partner_name TEXT,
    partner_id TEXT,                                -- External partner identifier

    -- Commission (for expected revenue calculation)
    commission_rate DECIMAL(10,2) DEFAULT 0,        -- Commission per conversion (manual input)

    -- Display settings
    badge VARCHAR(20),                              -- HOT, NEW, 추천, etc.
    display_priority INT DEFAULT 0,                 -- Higher = shown first
    is_active BOOLEAN DEFAULT TRUE,

    -- Statistics (aggregate)
    total_instances INT DEFAULT 0,                  -- Total user assignments
    total_clicks INT DEFAULT 0,                     -- Total clicks across all users
    total_conversions INT DEFAULT 0,                -- Total conversions

    -- Audit
    created_by UUID REFERENCES public.admin_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_templates_category
    ON public.admin_sidejob_templates(category)
    WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_admin_templates_priority
    ON public.admin_sidejob_templates(display_priority DESC, created_at DESC)
    WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_admin_templates_partner
    ON public.admin_sidejob_templates(partner_id)
    WHERE partner_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_admin_templates_active
    ON public.admin_sidejob_templates(is_active);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_admin_sidejob_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_admin_sidejob_templates_updated_at ON public.admin_sidejob_templates;
CREATE TRIGGER update_admin_sidejob_templates_updated_at
    BEFORE UPDATE ON public.admin_sidejob_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_sidejob_template_updated_at();

-- Comments for documentation
COMMENT ON TABLE public.admin_sidejob_templates IS 'Admin-created affiliate/partnership sidejob card templates';
COMMENT ON COLUMN public.admin_sidejob_templates.category IS '12 B2B categories: rental, card_terminal, internet, advertising, liquor, insurance, tax_accounting, policy_funds, tax_refund, flower_delivery, website_development, marriage_agency';
COMMENT ON COLUMN public.admin_sidejob_templates.base_cta_link IS 'Base URL for free users - company shared tracking URL';
COMMENT ON COLUMN public.admin_sidejob_templates.commission_rate IS 'Commission amount per conversion for expected revenue calculation';
COMMENT ON COLUMN public.admin_sidejob_templates.display_priority IS 'Higher priority templates shown first within category';
