-- Migration: Create QR codes for existing business cards that don't have one
-- This ensures all business cards have associated QR codes

-- Function to generate random short code
CREATE OR REPLACE FUNCTION generate_short_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
  code_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;

    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.qr_codes WHERE short_code = result) INTO code_exists;

    -- Exit loop if code is unique
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Insert QR codes for business cards that don't have one
INSERT INTO public.qr_codes (
  business_card_id,
  user_id,
  short_code,
  target_url,
  target_type,
  is_active,
  scan_count,
  created_at,
  updated_at
)
SELECT
  bc.id AS business_card_id,
  bc.user_id,
  generate_short_code() AS short_code,
  CASE
    WHEN bc.custom_url IS NOT NULL AND bc.custom_url != ''
    THEN 'https://g-plat.com/card/' || bc.custom_url
    ELSE 'https://g-plat.com/card/' || bc.id
  END AS target_url,
  'static' AS target_type,
  true AS is_active,
  0 AS scan_count,
  NOW() AS created_at,
  NOW() AS updated_at
FROM public.business_cards bc
WHERE NOT EXISTS (
  SELECT 1 FROM public.qr_codes qr
  WHERE qr.business_card_id = bc.id
)
AND bc.is_active = true;

-- Add comment
COMMENT ON FUNCTION generate_short_code() IS 'Generates a unique 6-character alphanumeric code for QR codes';
