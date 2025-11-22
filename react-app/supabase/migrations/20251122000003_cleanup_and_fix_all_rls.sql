-- Comprehensive RLS cleanup and fix for user access control
-- This migration removes all duplicate/conflicting policies and applies
-- strict rules to block both deleted users (deleted_at IS NOT NULL)
-- and suspended users (status = 'suspended')

-- ============================================================================
-- STEP 1: Clean up ALL existing RLS policies on business_cards
-- ============================================================================

-- Remove all duplicate/old policies
DROP POLICY IF EXISTS "business_cards_select_own" ON public.business_cards;
DROP POLICY IF EXISTS "business_cards_insert_own" ON public.business_cards;
DROP POLICY IF EXISTS "business_cards_update_own" ON public.business_cards;
DROP POLICY IF EXISTS "business_cards_delete_own" ON public.business_cards;
DROP POLICY IF EXISTS "business_cards_select_public" ON public.business_cards;

DROP POLICY IF EXISTS "Users can view their own cards" ON public.business_cards;
DROP POLICY IF EXISTS "Users can update their own cards" ON public.business_cards;
DROP POLICY IF EXISTS "Users can delete their own cards" ON public.business_cards;

-- Remove our previous policies (will be recreated with status check)
DROP POLICY IF EXISTS "Users can view own business cards" ON public.business_cards;
DROP POLICY IF EXISTS "Users can create own business cards" ON public.business_cards;
DROP POLICY IF EXISTS "Users can update own business cards" ON public.business_cards;
DROP POLICY IF EXISTS "Users can delete own business cards" ON public.business_cards;

-- Keep admin policies (these are fine)
-- - "Admins can view all business cards"
-- - "Admins can view all business_cards" (duplicate but harmless)
-- - "Admins can update all business cards"
-- - "Admins can delete business cards"

-- Keep public policy (this is fine)
-- - "Anyone can view active business cards"

-- ============================================================================
-- STEP 2: Create new comprehensive RLS policies with deleted_at AND status checks
-- ============================================================================

-- Helper function to check if user is allowed (not deleted AND not suspended)
-- This will be used in all business_cards policies
CREATE OR REPLACE FUNCTION public.is_user_allowed(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id
    AND deleted_at IS NULL
    AND status != 'suspended'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT: Users can view their own business cards (if not deleted/suspended)
CREATE POLICY "Users can view own business cards" ON public.business_cards
    FOR SELECT USING (
        auth.uid() = user_id
        AND public.is_user_allowed(auth.uid())
    );

-- INSERT: Users can create business cards (if not deleted/suspended)
CREATE POLICY "Users can create own business cards" ON public.business_cards
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND public.is_user_allowed(auth.uid())
    );

-- UPDATE: Users can update their own business cards (if not deleted/suspended)
CREATE POLICY "Users can update own business cards" ON public.business_cards
    FOR UPDATE USING (
        auth.uid() = user_id
        AND public.is_user_allowed(auth.uid())
    );

-- DELETE: Users can delete their own business cards (if not deleted/suspended)
CREATE POLICY "Users can delete own business cards" ON public.business_cards
    FOR DELETE USING (
        auth.uid() = user_id
        AND public.is_user_allowed(auth.uid())
    );

-- ============================================================================
-- STEP 3: Update users table RLS policy (already done but ensuring consistency)
-- ============================================================================

DROP POLICY IF EXISTS "Users cannot access deleted profiles" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- Users can view their own profile (even if deleted/suspended)
-- This is needed so the is_user_allowed() function can check deleted_at and status
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (
        id = auth.uid()
    );

-- ============================================================================
-- STEP 4: Add comments for documentation
-- ============================================================================

COMMENT ON FUNCTION public.is_user_allowed(UUID) IS
'Returns TRUE if user is allowed to access system (not deleted AND not suspended). Used by business_cards RLS policies.';

COMMENT ON POLICY "Users can view own business cards" ON public.business_cards IS
'Allows users to view their own business cards only if not deleted and not suspended.';

COMMENT ON POLICY "Users can create own business cards" ON public.business_cards IS
'Allows users to create business cards only if not deleted and not suspended.';

COMMENT ON POLICY "Users can update own business cards" ON public.business_cards IS
'Allows users to update their own business cards only if not deleted and not suspended.';

COMMENT ON POLICY "Users can delete own business cards" ON public.business_cards IS
'Allows users to delete their own business cards only if not deleted and not suspended.';

COMMENT ON POLICY "Users can view own profile" ON public.users IS
'Allows users to view their own profile even if deleted/suspended. Needed for RLS policy checks.';
