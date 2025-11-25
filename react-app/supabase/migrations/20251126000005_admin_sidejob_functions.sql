-- =====================================================
-- Migration: Helper Functions and Views for Admin Sidejobs
-- Description: Utility functions for admin sidejob operations
-- =====================================================

-- ============================================================================
-- Function: Record a click on admin sidejob
-- ============================================================================
CREATE OR REPLACE FUNCTION record_admin_sidejob_click(
    p_instance_id UUID,
    p_business_card_id UUID DEFAULT NULL,
    p_source_user_id UUID DEFAULT NULL,
    p_visitor_ip INET DEFAULT NULL,
    p_visitor_id UUID DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL,
    p_device_type VARCHAR(20) DEFAULT NULL,
    p_browser VARCHAR(50) DEFAULT NULL,
    p_os VARCHAR(50) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_click_id UUID;
BEGIN
    INSERT INTO public.admin_sidejob_clicks (
        instance_id,
        business_card_id,
        source_user_id,
        visitor_ip,
        visitor_id,
        user_agent,
        referrer,
        device_type,
        browser,
        os
    ) VALUES (
        p_instance_id,
        p_business_card_id,
        p_source_user_id,
        p_visitor_ip,
        p_visitor_id,
        p_user_agent,
        p_referrer,
        p_device_type,
        p_browser,
        p_os
    )
    RETURNING id INTO v_click_id;

    RETURN v_click_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Function: Get effective sidejob card data (merges template + instance)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_admin_sidejob_for_display(p_instance_id UUID)
RETURNS TABLE (
    instance_id UUID,
    template_id UUID,
    title TEXT,
    description TEXT,
    image_url TEXT,
    price TEXT,
    cta_text TEXT,
    cta_url TEXT,
    category admin_b2b_category,
    badge VARCHAR(20),
    partner_name TEXT,
    instance_type sidejob_instance_type,
    display_order INT,
    click_count INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id AS instance_id,
        i.template_id,
        COALESCE(i.custom_title, t.title) AS title,
        COALESCE(i.custom_description, t.description) AS description,
        COALESCE(i.custom_image_url, t.image_url) AS image_url,
        COALESCE(i.custom_price, t.price) AS price,
        COALESCE(i.custom_cta_text, t.cta_text) AS cta_text,
        i.cta_url,
        t.category,
        t.badge,
        t.partner_name,
        i.instance_type,
        i.display_order,
        i.click_count
    FROM public.admin_sidejob_instances i
    JOIN public.admin_sidejob_templates t ON i.template_id = t.id
    WHERE i.id = p_instance_id
    AND i.is_active = TRUE
    AND t.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Function: Get admin sidejobs for a user (based on assignment target)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_admin_sidejobs_for_user(p_user_id UUID)
RETURNS TABLE (
    instance_id UUID,
    template_id UUID,
    title TEXT,
    description TEXT,
    image_url TEXT,
    price TEXT,
    cta_text TEXT,
    cta_url TEXT,
    category admin_b2b_category,
    badge VARCHAR(20),
    partner_name TEXT,
    instance_type sidejob_instance_type,
    display_order INT,
    click_count INT,
    assignment_target assignment_target
) AS $$
DECLARE
    v_subscription_tier TEXT;
BEGIN
    -- Get user's subscription tier
    SELECT subscription_tier::TEXT INTO v_subscription_tier
    FROM public.users WHERE id = p_user_id;

    RETURN QUERY
    SELECT
        i.id AS instance_id,
        i.template_id,
        COALESCE(i.custom_title, t.title) AS title,
        COALESCE(i.custom_description, t.description) AS description,
        COALESCE(i.custom_image_url, t.image_url) AS image_url,
        COALESCE(i.custom_price, t.price) AS price,
        COALESCE(i.custom_cta_text, t.cta_text) AS cta_text,
        i.cta_url,
        t.category,
        t.badge,
        t.partner_name,
        i.instance_type,
        i.display_order,
        i.click_count,
        i.assignment_target
    FROM public.admin_sidejob_instances i
    JOIN public.admin_sidejob_templates t ON i.template_id = t.id
    WHERE i.is_active = TRUE
    AND t.is_active = TRUE
    AND (
        -- Direct assignment to this user
        i.user_id = p_user_id
        -- OR group assignment matching user's tier
        OR i.assignment_target = 'all_users'
        OR (i.assignment_target = 'free_users' AND v_subscription_tier = 'FREE')
        OR (i.assignment_target = 'paid_users' AND v_subscription_tier IN ('PREMIUM', 'BUSINESS'))
    )
    ORDER BY t.display_priority DESC, i.display_order ASC, t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- View: Admin sidejob display (merges template + instance data)
-- ============================================================================
CREATE OR REPLACE VIEW admin_sidejob_display AS
SELECT
    i.id AS instance_id,
    i.user_id,
    i.business_card_id,
    i.template_id,
    i.assignment_target,
    i.instance_type,
    i.display_order,
    i.is_active AS instance_active,
    i.view_count,
    i.click_count,
    i.conversion_count,
    i.commission_rate AS instance_commission_rate,
    i.commission_earned,
    i.commission_pending,
    i.assigned_at,
    -- Use custom values for paid users if set, otherwise use template
    COALESCE(i.custom_title, t.title) AS title,
    COALESCE(i.custom_description, t.description) AS description,
    COALESCE(i.custom_image_url, t.image_url) AS image_url,
    COALESCE(i.custom_price, t.price) AS price,
    COALESCE(i.custom_cta_text, t.cta_text) AS cta_text,
    i.cta_url,
    t.category,
    t.badge,
    t.partner_name,
    t.partner_id,
    t.display_priority,
    t.is_active AS template_active,
    t.total_clicks AS template_total_clicks,
    t.total_conversions AS template_total_conversions,
    t.commission_rate AS template_commission_rate
FROM public.admin_sidejob_instances i
JOIN public.admin_sidejob_templates t ON i.template_id = t.id;

-- Grant access to the view
GRANT SELECT ON admin_sidejob_display TO authenticated;
GRANT SELECT ON admin_sidejob_display TO anon;

-- ============================================================================
-- View: Template statistics
-- ============================================================================
CREATE OR REPLACE VIEW admin_sidejob_template_stats AS
SELECT
    t.id AS template_id,
    t.title,
    t.category,
    t.partner_name,
    t.is_active,
    t.total_instances,
    t.total_clicks,
    t.total_conversions,
    t.commission_rate,
    -- Calculated fields
    CASE WHEN t.total_clicks > 0
        THEN ROUND((t.total_conversions::DECIMAL / t.total_clicks) * 100, 2)
        ELSE 0
    END AS conversion_rate,
    t.total_conversions * t.commission_rate AS expected_revenue,
    -- Instance breakdown
    COUNT(CASE WHEN i.assignment_target = 'specific_user' THEN 1 END) AS specific_user_count,
    COUNT(CASE WHEN i.assignment_target = 'free_users' THEN 1 END) AS free_users_assignment,
    COUNT(CASE WHEN i.assignment_target = 'paid_users' THEN 1 END) AS paid_users_assignment,
    COUNT(CASE WHEN i.assignment_target = 'all_users' THEN 1 END) AS all_users_assignment,
    t.created_at,
    t.updated_at
FROM public.admin_sidejob_templates t
LEFT JOIN public.admin_sidejob_instances i ON t.id = i.template_id
GROUP BY t.id;

-- Grant access to the view
GRANT SELECT ON admin_sidejob_template_stats TO authenticated;

-- ============================================================================
-- Function: Calculate expected revenue for a template
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_template_expected_revenue(p_template_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_total_conversions INT;
    v_commission_rate DECIMAL;
BEGIN
    SELECT total_conversions, commission_rate
    INTO v_total_conversions, v_commission_rate
    FROM public.admin_sidejob_templates
    WHERE id = p_template_id;

    RETURN COALESCE(v_total_conversions * v_commission_rate, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON FUNCTION record_admin_sidejob_click IS 'Record a click on admin-provided sidejob card';
COMMENT ON FUNCTION get_admin_sidejob_for_display IS 'Get merged template + instance data for display';
COMMENT ON FUNCTION get_admin_sidejobs_for_user IS 'Get all admin sidejobs assigned to a user based on their subscription tier';
COMMENT ON VIEW admin_sidejob_display IS 'View merging template and instance data for display';
COMMENT ON VIEW admin_sidejob_template_stats IS 'Aggregated statistics for admin sidejob templates';
