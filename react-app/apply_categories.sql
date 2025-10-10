-- Add category columns to sidejob_cards
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

ALTER TABLE public.sidejob_cards
ADD COLUMN IF NOT EXISTS category_primary category_primary_type,
ADD COLUMN IF NOT EXISTS category_secondary VARCHAR(50),
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS badge VARCHAR(20),
ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_sidejob_category ON public.sidejob_cards(category_primary, category_secondary);
CREATE INDEX IF NOT EXISTS idx_sidejob_badge ON public.sidejob_cards(badge) WHERE badge IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sidejob_expiry ON public.sidejob_cards(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sidejob_tags ON public.sidejob_cards USING gin(tags);
