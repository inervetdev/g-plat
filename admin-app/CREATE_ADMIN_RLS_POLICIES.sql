-- ===================================================
-- Create RLS Policies for Admin Users
-- ===================================================

-- Admin users should be able to manage all users and business cards
-- This enables status changes, updates, and other admin operations

-- Helper function: Check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================
-- RLS Policies for 'users' table
-- ===================================================

-- Policy: Admins can view all users
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users"
ON public.users
FOR SELECT
TO authenticated
USING (
  public.is_admin()
);

-- Policy: Admins can update all users
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users"
ON public.users
FOR UPDATE
TO authenticated
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);

-- Policy: Admins can delete users
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users"
ON public.users
FOR DELETE
TO authenticated
USING (
  public.is_admin()
);

-- ===================================================
-- RLS Policies for 'business_cards' table
-- ===================================================

-- Policy: Admins can view all business cards
DROP POLICY IF EXISTS "Admins can view all business cards" ON public.business_cards;
CREATE POLICY "Admins can view all business cards"
ON public.business_cards
FOR SELECT
TO authenticated
USING (
  public.is_admin()
);

-- Policy: Admins can update all business cards
DROP POLICY IF EXISTS "Admins can update all business cards" ON public.business_cards;
CREATE POLICY "Admins can update all business cards"
ON public.business_cards
FOR UPDATE
TO authenticated
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);

-- Policy: Admins can delete business cards
DROP POLICY IF EXISTS "Admins can delete business cards" ON public.business_cards;
CREATE POLICY "Admins can delete business cards"
ON public.business_cards
FOR DELETE
TO authenticated
USING (
  public.is_admin()
);

-- ===================================================
-- RLS Policies for 'sidejob_cards' table
-- ===================================================

-- Policy: Admins can view all sidejob cards
DROP POLICY IF EXISTS "Admins can view all sidejob cards" ON public.sidejob_cards;
CREATE POLICY "Admins can view all sidejob cards"
ON public.sidejob_cards
FOR SELECT
TO authenticated
USING (
  public.is_admin()
);

-- Policy: Admins can update all sidejob cards
DROP POLICY IF EXISTS "Admins can update all sidejob cards" ON public.sidejob_cards;
CREATE POLICY "Admins can update all sidejob cards"
ON public.sidejob_cards
FOR UPDATE
TO authenticated
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);

-- Policy: Admins can delete sidejob cards
DROP POLICY IF EXISTS "Admins can delete sidejob cards" ON public.sidejob_cards;
CREATE POLICY "Admins can delete sidejob cards"
ON public.sidejob_cards
FOR DELETE
TO authenticated
USING (
  public.is_admin()
);

-- ===================================================
-- Verify policies
-- ===================================================

SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename IN ('users', 'business_cards', 'sidejob_cards')
    AND policyname LIKE '%Admin%'
ORDER BY tablename, cmd;

SELECT '✅ Admin RLS policies created successfully!' AS result;
