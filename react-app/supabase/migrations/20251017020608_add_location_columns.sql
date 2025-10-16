-- Add latitude and longitude columns to business_cards table
ALTER TABLE public.business_cards
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add index for location-based queries
CREATE INDEX IF NOT EXISTS idx_business_cards_location
ON public.business_cards(latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add comments
COMMENT ON COLUMN public.business_cards.latitude IS '위도 (카카오 맵)';
COMMENT ON COLUMN public.business_cards.longitude IS '경도 (카카오 맵)';
