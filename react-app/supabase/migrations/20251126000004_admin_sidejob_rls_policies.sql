-- =====================================================
-- Migration: RLS Policies for Admin Sidejob Tables
-- Description: Row Level Security policies for templates, instances, and clicks
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.admin_sidejob_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sidejob_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sidejob_clicks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Helper function to check if user is an admin
-- ============================================================================
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid()
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_content_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid()
        AND is_active = TRUE
        AND role IN ('super_admin', 'content_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- admin_sidejob_templates RLS Policies
-- ============================================================================

-- Policy: Anyone can view active templates (for public card display)
DROP POLICY IF EXISTS "Anyone can view active templates" ON public.admin_sidejob_templates;
CREATE POLICY "Anyone can view active templates"
ON public.admin_sidejob_templates FOR SELECT
USING (is_active = TRUE);

-- Policy: Admins can view all templates (including inactive)
DROP POLICY IF EXISTS "Admins can view all templates" ON public.admin_sidejob_templates;
CREATE POLICY "Admins can view all templates"
ON public.admin_sidejob_templates FOR SELECT
TO authenticated
USING (is_admin_user());

-- Policy: Content admins can insert templates
DROP POLICY IF EXISTS "Content admins can insert templates" ON public.admin_sidejob_templates;
CREATE POLICY "Content admins can insert templates"
ON public.admin_sidejob_templates FOR INSERT
TO authenticated
WITH CHECK (is_content_admin());

-- Policy: Content admins can update templates
DROP POLICY IF EXISTS "Content admins can update templates" ON public.admin_sidejob_templates;
CREATE POLICY "Content admins can update templates"
ON public.admin_sidejob_templates FOR UPDATE
TO authenticated
USING (is_content_admin())
WITH CHECK (is_content_admin());

-- Policy: Content admins can delete templates
DROP POLICY IF EXISTS "Content admins can delete templates" ON public.admin_sidejob_templates;
CREATE POLICY "Content admins can delete templates"
ON public.admin_sidejob_templates FOR DELETE
TO authenticated
USING (is_content_admin());

-- ============================================================================
-- admin_sidejob_instances RLS Policies
-- ============================================================================

-- Policy: Users can view instances assigned to them
DROP POLICY IF EXISTS "Users can view own instances" ON public.admin_sidejob_instances;
CREATE POLICY "Users can view own instances"
ON public.admin_sidejob_instances FOR SELECT
TO authenticated
USING (
    -- Direct assignment to this user
    user_id = auth.uid()
    -- OR group assignment matching user's subscription tier
    OR (
        assignment_target = 'all_users'
        OR (assignment_target = 'free_users' AND EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND subscription_tier = 'FREE'
        ))
        OR (assignment_target = 'paid_users' AND EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND subscription_tier IN ('PREMIUM', 'BUSINESS')
        ))
    )
);

-- Policy: Public can view active instances (for card viewing by visitors)
DROP POLICY IF EXISTS "Public can view active instances" ON public.admin_sidejob_instances;
CREATE POLICY "Public can view active instances"
ON public.admin_sidejob_instances FOR SELECT
USING (is_active = TRUE);

-- Policy: Admins can view all instances
DROP POLICY IF EXISTS "Admins can view all instances" ON public.admin_sidejob_instances;
CREATE POLICY "Admins can view all instances"
ON public.admin_sidejob_instances FOR SELECT
TO authenticated
USING (is_admin_user());

-- Policy: Admins can insert instances (assign cards)
DROP POLICY IF EXISTS "Admins can insert instances" ON public.admin_sidejob_instances;
CREATE POLICY "Admins can insert instances"
ON public.admin_sidejob_instances FOR INSERT
TO authenticated
WITH CHECK (is_content_admin());

-- Policy: Admins can update instances
DROP POLICY IF EXISTS "Admins can update instances" ON public.admin_sidejob_instances;
CREATE POLICY "Admins can update instances"
ON public.admin_sidejob_instances FOR UPDATE
TO authenticated
USING (is_content_admin())
WITH CHECK (is_content_admin());

-- Policy: Admins can delete instances
DROP POLICY IF EXISTS "Admins can delete instances" ON public.admin_sidejob_instances;
CREATE POLICY "Admins can delete instances"
ON public.admin_sidejob_instances FOR DELETE
TO authenticated
USING (is_content_admin());

-- ============================================================================
-- admin_sidejob_clicks RLS Policies
-- ============================================================================

-- Policy: Anyone can insert clicks (for tracking)
DROP POLICY IF EXISTS "Anyone can record clicks" ON public.admin_sidejob_clicks;
CREATE POLICY "Anyone can record clicks"
ON public.admin_sidejob_clicks FOR INSERT
WITH CHECK (TRUE);

-- Policy: Users can view clicks on their own instances
DROP POLICY IF EXISTS "Users can view clicks on own instances" ON public.admin_sidejob_clicks;
CREATE POLICY "Users can view clicks on own instances"
ON public.admin_sidejob_clicks FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_sidejob_instances
        WHERE id = admin_sidejob_clicks.instance_id
        AND user_id = auth.uid()
    )
);

-- Policy: Admins can view all clicks
DROP POLICY IF EXISTS "Admins can view all clicks" ON public.admin_sidejob_clicks;
CREATE POLICY "Admins can view all clicks"
ON public.admin_sidejob_clicks FOR SELECT
TO authenticated
USING (is_admin_user());

-- Policy: Admins can update clicks (for conversion tracking)
DROP POLICY IF EXISTS "Admins can update clicks" ON public.admin_sidejob_clicks;
CREATE POLICY "Admins can update clicks"
ON public.admin_sidejob_clicks FOR UPDATE
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- ============================================================================
-- Grant permissions
-- ============================================================================

-- Grant SELECT on templates to anon (for public card viewing)
GRANT SELECT ON public.admin_sidejob_templates TO anon;
GRANT SELECT ON public.admin_sidejob_instances TO anon;
GRANT INSERT ON public.admin_sidejob_clicks TO anon;

-- Grant full access to authenticated users (RLS will filter)
GRANT ALL ON public.admin_sidejob_templates TO authenticated;
GRANT ALL ON public.admin_sidejob_instances TO authenticated;
GRANT ALL ON public.admin_sidejob_clicks TO authenticated;

-- Comments
COMMENT ON FUNCTION is_admin_user() IS 'Check if current user is an active admin';
COMMENT ON FUNCTION is_content_admin() IS 'Check if current user is a super_admin or content_admin';
