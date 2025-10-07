-- Add business_card_id to sidejob_cards table
-- This allows multiple sidejob cards to be attached to different business cards

ALTER TABLE public.sidejob_cards
ADD COLUMN IF NOT EXISTS business_card_id UUID REFERENCES public.business_cards(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_sidejob_business_card ON public.sidejob_cards(business_card_id);

-- Update RLS policy to allow viewing sidejob cards attached to any business card
DROP POLICY IF EXISTS "Cards are viewable by everyone" ON public.sidejob_cards;

CREATE POLICY "Cards are viewable by everyone"
    ON public.sidejob_cards FOR SELECT
    USING (is_active = true OR auth.uid() = user_id);

-- Allow null business_card_id (for sidejob cards not yet assigned to a business card)
COMMENT ON COLUMN public.sidejob_cards.business_card_id IS 'Optional: Business card to which this sidejob card is attached. Can be assigned to multiple business cards.';
