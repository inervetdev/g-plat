-- Add theme column to user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS theme VARCHAR(50) DEFAULT 'trendy';

-- Add comment for documentation
COMMENT ON COLUMN public.user_profiles.theme IS 'User selected theme for their business card (trendy, apple, professional, simple, default)';