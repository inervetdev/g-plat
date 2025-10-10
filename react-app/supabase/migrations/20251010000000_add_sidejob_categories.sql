-- Add category system columns to sidejob_cards table
-- Migration: Add support for categorized sidejob cards with badges and expiry

-- Create ENUM type for primary categories
DO $$ BEGIN
    CREATE TYPE category_primary_type AS ENUM (
        'shopping',
        'education',
        'service',
        'subscription',
        'promotion'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to sidejob_cards table
ALTER TABLE public.sidejob_cards
ADD COLUMN IF NOT EXISTS category_primary category_primary_type,
ADD COLUMN IF NOT EXISTS category_secondary VARCHAR(50),
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS badge VARCHAR(20),
ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN public.sidejob_cards.category_primary IS 'Primary category: shopping, education, service, subscription, promotion';
COMMENT ON COLUMN public.sidejob_cards.category_secondary IS 'Secondary category (specific subcategory name)';
COMMENT ON COLUMN public.sidejob_cards.tags IS 'Additional tags for filtering and search';
COMMENT ON COLUMN public.sidejob_cards.badge IS 'Badge text (e.g., HOT, NEW, SALE)';
COMMENT ON COLUMN public.sidejob_cards.expiry_date IS 'Expiry date for time-limited offers';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sidejob_category
    ON public.sidejob_cards(category_primary, category_secondary);

CREATE INDEX IF NOT EXISTS idx_sidejob_badge
    ON public.sidejob_cards(badge)
    WHERE badge IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sidejob_expiry
    ON public.sidejob_cards(expiry_date)
    WHERE expiry_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sidejob_tags
    ON public.sidejob_cards USING gin(tags);

-- Grant permissions (maintain existing RLS policies)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sidejob_cards TO authenticated;
GRANT SELECT ON public.sidejob_cards TO anon;
