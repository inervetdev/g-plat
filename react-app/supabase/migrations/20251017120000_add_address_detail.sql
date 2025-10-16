-- Add address_detail column to business_cards table
ALTER TABLE public.business_cards
ADD COLUMN IF NOT EXISTS address_detail TEXT;

-- Add comment
COMMENT ON COLUMN public.business_cards.address_detail IS 'Detailed address (apartment number, floor, room number, etc.)';
