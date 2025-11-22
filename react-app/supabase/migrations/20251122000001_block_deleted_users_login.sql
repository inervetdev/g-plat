-- Block deleted users from accessing their data via RLS
-- This prevents soft-deleted users from logging in and accessing data

-- 1. Update RLS policy for business_cards to exclude deleted users
DROP POLICY IF EXISTS "Users can view own business cards" ON public.business_cards;

CREATE POLICY "Users can view own business cards" ON public.business_cards
    FOR SELECT USING (
        auth.uid() = user_id
        AND NOT EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND deleted_at IS NOT NULL
        )
    );

-- 2. Update RLS policy for business_cards insert to exclude deleted users
DROP POLICY IF EXISTS "Users can create own business cards" ON public.business_cards;

CREATE POLICY "Users can create own business cards" ON public.business_cards
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND NOT EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND deleted_at IS NOT NULL
        )
    );

-- 3. Update RLS policy for business_cards update to exclude deleted users
DROP POLICY IF EXISTS "Users can update own business cards" ON public.business_cards;

CREATE POLICY "Users can update own business cards" ON public.business_cards
    FOR UPDATE USING (
        auth.uid() = user_id
        AND NOT EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND deleted_at IS NOT NULL
        )
    );

-- 4. Update RLS policy for business_cards delete to exclude deleted users
DROP POLICY IF EXISTS "Users can delete own business cards" ON public.business_cards;

CREATE POLICY "Users can delete own business cards" ON public.business_cards
    FOR DELETE USING (
        auth.uid() = user_id
        AND NOT EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND deleted_at IS NOT NULL
        )
    );

-- 5. Add RLS policy for users table to block deleted users from viewing their profile
DROP POLICY IF EXISTS "Users cannot access deleted profiles" ON public.users;

CREATE POLICY "Users cannot access deleted profiles" ON public.users
    FOR SELECT USING (
        id = auth.uid()
        AND deleted_at IS NULL
    );

-- 6. Add comment for documentation
COMMENT ON COLUMN public.users.deleted_at IS 'Soft delete timestamp. Users with deleted_at set cannot access the system via RLS policies.';
