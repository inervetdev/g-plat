-- =====================================================
-- Migration: Create Admin Sidejob Instances Table
-- Description: User-specific assignments of admin sidejob templates
-- Handles both individual assignments and group assignments (free/paid/all users)
-- =====================================================

-- Create ENUM for assignment target
DO $$ BEGIN
    CREATE TYPE assignment_target AS ENUM (
        'specific_user',  -- 지정 사용자
        'free_users',     -- 무료 회원 전체
        'paid_users',     -- 유료 회원 전체
        'all_users'       -- 전체 회원
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create ENUM for instance type (paid vs free)
DO $$ BEGIN
    CREATE TYPE sidejob_instance_type AS ENUM (
        'paid',   -- 유료 회원 (개별 URL, 개별 수수료)
        'free'    -- 무료 회원 (공통 URL, 회사 수수료)
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create admin sidejob instances table
CREATE TABLE IF NOT EXISTS public.admin_sidejob_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relationships
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- NULL for group assignments
    business_card_id UUID REFERENCES public.business_cards(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.admin_sidejob_templates(id) ON DELETE CASCADE,

    -- Assignment target (specific user / free users / paid users / all users)
    assignment_target assignment_target NOT NULL DEFAULT 'specific_user',

    -- Instance type (paid vs free) - determines URL and commission behavior
    instance_type sidejob_instance_type NOT NULL DEFAULT 'free',

    -- CTA URL (admin directly inputs unique URL per assignment)
    cta_url TEXT NOT NULL,

    -- Paid user only: Custom overrides (admin can modify individually)
    custom_title TEXT,
    custom_description TEXT,
    custom_image_url TEXT,
    custom_price TEXT,
    custom_cta_text TEXT,

    -- Display settings
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,

    -- Statistics (per-instance tracking)
    view_count INT DEFAULT 0,
    click_count INT DEFAULT 0,
    conversion_count INT DEFAULT 0,

    -- Commission tracking (admin manual input)
    commission_rate DECIMAL(10,2) DEFAULT 0,        -- Commission per conversion for this assignment
    commission_earned DECIMAL(10,2) DEFAULT 0,      -- Total earned commission (admin input)
    commission_pending DECIMAL(10,2) DEFAULT 0,     -- Pending commission

    -- Audit
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES public.admin_users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_instances_user
    ON public.admin_sidejob_instances(user_id)
    WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_instances_template
    ON public.admin_sidejob_instances(template_id);

CREATE INDEX IF NOT EXISTS idx_instances_assignment_target
    ON public.admin_sidejob_instances(assignment_target);

CREATE INDEX IF NOT EXISTS idx_instances_type
    ON public.admin_sidejob_instances(instance_type);

CREATE INDEX IF NOT EXISTS idx_instances_active
    ON public.admin_sidejob_instances(is_active)
    WHERE is_active = TRUE;

-- Unique constraint: For specific_user, one template per user
-- For group assignments (free_users, paid_users, all_users), one per target type per template
CREATE UNIQUE INDEX IF NOT EXISTS idx_instances_unique_specific
    ON public.admin_sidejob_instances(user_id, template_id)
    WHERE assignment_target = 'specific_user' AND user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_instances_unique_group
    ON public.admin_sidejob_instances(template_id, assignment_target)
    WHERE assignment_target != 'specific_user';

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_admin_sidejob_instance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_admin_sidejob_instances_updated_at ON public.admin_sidejob_instances;
CREATE TRIGGER update_admin_sidejob_instances_updated_at
    BEFORE UPDATE ON public.admin_sidejob_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_sidejob_instance_updated_at();

-- Trigger to update template total_instances count
CREATE OR REPLACE FUNCTION update_template_instance_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.admin_sidejob_templates
        SET total_instances = total_instances + 1
        WHERE id = NEW.template_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.admin_sidejob_templates
        SET total_instances = total_instances - 1
        WHERE id = OLD.template_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_template_instance_count ON public.admin_sidejob_instances;
CREATE TRIGGER update_template_instance_count
    AFTER INSERT OR DELETE ON public.admin_sidejob_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_template_instance_count();

-- Comments for documentation
COMMENT ON TABLE public.admin_sidejob_instances IS 'User-specific or group assignments of admin sidejob templates';
COMMENT ON COLUMN public.admin_sidejob_instances.user_id IS 'User ID for specific_user assignments, NULL for group assignments';
COMMENT ON COLUMN public.admin_sidejob_instances.assignment_target IS 'Target type: specific_user, free_users, paid_users, or all_users';
COMMENT ON COLUMN public.admin_sidejob_instances.instance_type IS 'paid (individual tracking) or free (shared company URL)';
COMMENT ON COLUMN public.admin_sidejob_instances.cta_url IS 'Admin-input URL - unique per paid user, shared for free users';
COMMENT ON COLUMN public.admin_sidejob_instances.commission_rate IS 'Commission amount per conversion (admin manual input)';
