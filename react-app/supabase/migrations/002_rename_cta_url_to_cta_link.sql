-- Rename cta_url to cta_link for consistency with application code
-- This migration aligns the database schema with the TypeScript interface definitions

ALTER TABLE public.sidejob_cards
RENAME COLUMN cta_url TO cta_link;

-- Add comment to document the column purpose
COMMENT ON COLUMN public.sidejob_cards.cta_link IS 'Call-to-action link URL for the side job card';