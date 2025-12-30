-- Add name_en (English name) column to business_cards
ALTER TABLE public.business_cards
ADD COLUMN IF NOT EXISTS name_en character varying(100);

COMMENT ON COLUMN public.business_cards.name_en IS 'English name of the card holder';

-- Add tiktok column to business_cards
ALTER TABLE public.business_cards
ADD COLUMN IF NOT EXISTS tiktok character varying(255);

COMMENT ON COLUMN public.business_cards.tiktok IS 'TikTok profile URL or username';

-- Add threads column to business_cards
ALTER TABLE public.business_cards
ADD COLUMN IF NOT EXISTS threads character varying(255);

COMMENT ON COLUMN public.business_cards.threads IS 'Threads profile URL or username';
