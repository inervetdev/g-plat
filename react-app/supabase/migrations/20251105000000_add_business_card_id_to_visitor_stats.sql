-- Add business_card_id to visitor_stats table
-- This allows tracking which specific card was visited, not just which user

ALTER TABLE public.visitor_stats
ADD COLUMN IF NOT EXISTS business_card_id UUID REFERENCES public.business_cards(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_visitor_stats_card_id
ON public.visitor_stats(business_card_id);

-- Create composite index for card stats queries
CREATE INDEX IF NOT EXISTS idx_visitor_stats_card_created
ON public.visitor_stats(business_card_id, created_at DESC);

-- Update existing visitor_stats records to link to business cards
-- This assumes one active card per user (the most common case)
UPDATE public.visitor_stats vs
SET business_card_id = (
    SELECT bc.id
    FROM public.business_cards bc
    WHERE bc.user_id = vs.user_id
    AND bc.is_active = true
    ORDER BY bc.created_at DESC
    LIMIT 1
)
WHERE vs.business_card_id IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.visitor_stats.business_card_id IS 'Links visitor stats to specific business card (optional, for multi-card users)';
