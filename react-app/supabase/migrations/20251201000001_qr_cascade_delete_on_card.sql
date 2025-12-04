-- Migration: Change QR codes foreign key to CASCADE delete when business card is deleted
-- This ensures QR codes are automatically deleted when their associated business card is deleted

-- Step 1: Delete orphaned QR codes (where business_card_id is NULL)
-- These are QR codes whose business cards were previously deleted
DELETE FROM public.qr_codes WHERE business_card_id IS NULL;

-- Step 2: Drop the existing foreign key constraint
ALTER TABLE public.qr_codes
DROP CONSTRAINT IF EXISTS qr_codes_business_card_id_fkey;

-- Step 3: Make business_card_id NOT NULL (since QR codes must always be linked to a card)
ALTER TABLE public.qr_codes
ALTER COLUMN business_card_id SET NOT NULL;

-- Step 4: Add new foreign key constraint with ON DELETE CASCADE
ALTER TABLE public.qr_codes
ADD CONSTRAINT qr_codes_business_card_id_fkey
FOREIGN KEY (business_card_id)
REFERENCES public.business_cards(id)
ON DELETE CASCADE;

-- Add comment explaining the change
COMMENT ON COLUMN public.qr_codes.business_card_id IS 'Foreign key to business_cards. QR codes are deleted when their business card is deleted.';
