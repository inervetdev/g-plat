-- Add admin policies for qr_codes and qr_scans tables
-- Allows admin_users to manage all QR codes
-- Uses is_admin_user() helper function for consistency

-- Policy: Admins can view all QR codes
DROP POLICY IF EXISTS "Admins can view all QR codes" ON public.qr_codes;
CREATE POLICY "Admins can view all QR codes"
    ON public.qr_codes
    FOR SELECT
    TO authenticated
    USING (is_admin_user());

-- Policy: Admins can update all QR codes
DROP POLICY IF EXISTS "Admins can update all QR codes" ON public.qr_codes;
CREATE POLICY "Admins can update all QR codes"
    ON public.qr_codes
    FOR UPDATE
    TO authenticated
    USING (is_admin_user())
    WITH CHECK (is_admin_user());

-- Policy: Admins can delete all QR codes
DROP POLICY IF EXISTS "Admins can delete all QR codes" ON public.qr_codes;
CREATE POLICY "Admins can delete all QR codes"
    ON public.qr_codes
    FOR DELETE
    TO authenticated
    USING (is_admin_user());

-- Policy: Admins can view all QR scans
DROP POLICY IF EXISTS "Admins can view all QR scans" ON public.qr_scans;
CREATE POLICY "Admins can view all QR scans"
    ON public.qr_scans
    FOR SELECT
    TO authenticated
    USING (is_admin_user());

-- Policy: Admins can delete all QR scans
DROP POLICY IF EXISTS "Admins can delete all QR scans" ON public.qr_scans;
CREATE POLICY "Admins can delete all QR scans"
    ON public.qr_scans
    FOR DELETE
    TO authenticated
    USING (is_admin_user());

COMMENT ON POLICY "Admins can view all QR codes" ON public.qr_codes IS 'Allows active admin users to view all QR codes';
COMMENT ON POLICY "Admins can update all QR codes" ON public.qr_codes IS 'Allows active admin users to update all QR codes';
COMMENT ON POLICY "Admins can delete all QR codes" ON public.qr_codes IS 'Allows active admin users to delete all QR codes';
COMMENT ON POLICY "Admins can view all QR scans" ON public.qr_scans IS 'Allows active admin users to view all QR scan records';
COMMENT ON POLICY "Admins can delete all QR scans" ON public.qr_scans IS 'Allows active admin users to delete QR scan records';
