-- =====================================================
-- 신청 처리 로그 테이블 생성
-- 상품 신청의 상태 변경 및 처리 이력 추적
-- =====================================================

-- application_logs 테이블 생성
CREATE TABLE IF NOT EXISTS public.application_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 대상 신청
    application_id UUID NOT NULL REFERENCES public.product_applications(id) ON DELETE CASCADE,

    -- 액션 정보
    action VARCHAR(50) NOT NULL, -- created | status_changed | assigned | note_added | reward_set | completed

    -- 이전/이후 상태
    previous_status VARCHAR(20),
    new_status VARCHAR(20),

    -- 상세 정보
    details JSONB DEFAULT '{}',
    note TEXT,

    -- 수행자
    performed_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
    performed_by_name VARCHAR(100),

    -- 타임스탬프
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_application_logs_application_id
    ON public.application_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_application_logs_action
    ON public.application_logs(action);
CREATE INDEX IF NOT EXISTS idx_application_logs_created_at
    ON public.application_logs(created_at DESC);

-- RLS 정책
ALTER TABLE public.application_logs ENABLE ROW LEVEL SECURITY;

-- 관리자는 모든 로그 조회/생성 가능 (admin_users.id = auth.uid())
CREATE POLICY "Admins can do everything with application logs"
    ON public.application_logs
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
        )
    );

-- 추천인/신청자는 관련 로그 조회 가능
CREATE POLICY "Related users can view application logs"
    ON public.application_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.product_applications pa
            WHERE pa.id = application_logs.application_id
            AND (pa.referrer_user_id = auth.uid() OR pa.applicant_user_id = auth.uid())
        )
    );

-- 신청 생성 시 자동 로그 생성 함수
CREATE OR REPLACE FUNCTION log_application_created()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.application_logs (
        application_id,
        action,
        new_status,
        details
    ) VALUES (
        NEW.id,
        'created',
        NEW.status,
        jsonb_build_object(
            'applicant_name', NEW.applicant_name,
            'applicant_email', NEW.applicant_email,
            'template_id', NEW.template_id
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_application_created ON public.product_applications;
CREATE TRIGGER trigger_log_application_created
    AFTER INSERT ON public.product_applications
    FOR EACH ROW
    EXECUTE FUNCTION log_application_created();

-- 상태 변경 시 자동 로그 생성 함수
CREATE OR REPLACE FUNCTION log_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.application_logs (
            application_id,
            action,
            previous_status,
            new_status,
            details
        ) VALUES (
            NEW.id,
            'status_changed',
            OLD.status,
            NEW.status,
            jsonb_build_object(
                'changed_at', NOW()
            )
        );
    END IF;

    -- 담당자 배정 로그
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to AND NEW.assigned_to IS NOT NULL THEN
        INSERT INTO public.application_logs (
            application_id,
            action,
            new_status,
            performed_by,
            details
        ) VALUES (
            NEW.id,
            'assigned',
            NEW.status,
            NEW.assigned_to,
            jsonb_build_object(
                'assigned_to', NEW.assigned_to,
                'assigned_at', NEW.assigned_at
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_application_status_change ON public.product_applications;
CREATE TRIGGER trigger_log_application_status_change
    AFTER UPDATE ON public.product_applications
    FOR EACH ROW
    EXECUTE FUNCTION log_application_status_change();

-- 코멘트
COMMENT ON TABLE public.application_logs IS '신청 처리 로그 테이블 - 상태 변경 및 처리 이력 추적';
COMMENT ON COLUMN public.application_logs.action IS '액션: created(생성) | status_changed(상태변경) | assigned(배정) | note_added(메모추가) | reward_set(보상설정) | completed(완료)';
