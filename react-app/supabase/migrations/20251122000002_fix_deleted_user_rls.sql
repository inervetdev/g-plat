-- Fix RLS policies to properly block deleted users
-- The issue: previous policy prevented deleted users from reading users table,
-- which caused the NOT EXISTS check in business_cards policies to fail

-- 1. Fix users table SELECT policy to allow deleted users to read their own record
--    (This is needed so the business_cards policies can check deleted_at)
DROP POLICY IF EXISTS "Users cannot access deleted profiles" ON public.users;

CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (
        id = auth.uid()
        -- Allow users to read their own profile even if deleted
        -- This enables the business_cards RLS checks to work correctly
    );

-- 2. Ensure all business_cards policies properly check deleted_at
--    (These should already be in place from previous migration, but re-applying for safety)

-- SELECT policy
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

-- INSERT policy
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

-- UPDATE policy
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

-- DELETE policy
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

-- 3. Add comments for documentation
COMMENT ON POLICY "Users can view own profile" ON public.users IS
'Allows users to view their own profile even if deleted. This is necessary for business_cards RLS policies to check deleted_at status.';
