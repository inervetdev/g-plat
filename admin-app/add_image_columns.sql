-- Add profile_image_url and company_logo_url columns to business_cards table
-- Run this in Supabase SQL Editor

-- Add profile_image_url column
ALTER TABLE public.business_cards
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Add company_logo_url column
ALTER TABLE public.business_cards
ADD COLUMN IF NOT EXISTS company_logo_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.business_cards.profile_image_url IS 'URL to user profile image stored in Supabase Storage';
COMMENT ON COLUMN public.business_cards.company_logo_url IS 'URL to company logo image stored in Supabase Storage';

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'business_cards'
  AND column_name IN ('profile_image_url', 'company_logo_url');

SELECT '✅ Image URL columns added successfully to business_cards table!' AS result;
