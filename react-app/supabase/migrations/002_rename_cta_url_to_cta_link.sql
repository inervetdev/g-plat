-- Rename cta_url to cta_link for consistency with application code
-- This migration aligns the database schema with the TypeScript interface definitions

-- Check if cta_url column exists before renaming
DO $$
BEGIN
    IF EXISTS(SELECT 1 FROM information_schema.columns
              WHERE table_name='sidejob_cards' AND column_name='cta_url') THEN
        ALTER TABLE public.sidejob_cards RENAME COLUMN cta_url TO cta_link;
    END IF;
END $$;

-- Add comment to document the column purpose
COMMENT ON COLUMN public.sidejob_cards.cta_link IS 'Call-to-action link URL for the side job card';