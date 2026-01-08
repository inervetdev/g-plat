-- =====================================================
-- 상품 신청 테이블 생성
-- 제휴 서비스/부가명함 상품에 대한 가입/구매 신청 관리
-- =====================================================

-- product_applications 테이블 생성
CREATE TABLE IF NOT EXISTS public.product_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 신청 대상 (템플릿 또는 인스턴스)
    template_id UUID REFERENCES public.admin_sidejob_templates(id) ON DELETE SET NULL,
    instance_id UUID REFERENCES public.admin_sidejob_instances(id) ON DELETE SET NULL,

    -- 추천인 트래킹
    referrer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    referrer_card_id UUID REFERENCES public.business_cards(id) ON DELETE SET NULL,
    referrer_card_url VARCHAR(255),

    -- 신청자 정보
    applicant_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    applicant_name VARCHAR(100) NOT NULL,
    applicant_phone VARCHAR(20) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,

    -- 동적 폼 데이터 (JSON 스키마 기반)
    form_data JSONB NOT NULL DEFAULT '{}',

    -- 상태 관리: pending | assigned | processing | completed | cancelled
    status VARCHAR(20) NOT NULL DEFAULT 'pending',

    -- 담당자 배정
    assigned_to UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ,

    -- 처리 정보
    processed_at TIMESTAMPTZ,
    processing_note TEXT,

    -- 추천인 보상
    referrer_reward_type VARCHAR(20), -- commission | points | none
    referrer_reward_amount DECIMAL(10,2) DEFAULT 0,
    referrer_reward_status VARCHAR(20) DEFAULT 'pending', -- pending | approved | paid

    -- 방문자 정보
    visitor_ip INET,
    user_agent TEXT,
    device_type VARCHAR(20), -- mobile | tablet | desktop

    -- 개인정보 동의
    privacy_agreed BOOLEAN DEFAULT false,
    privacy_agreed_at TIMESTAMPTZ,

    -- 타임스탬프
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_product_applications_template_id
    ON public.product_applications(template_id);
CREATE INDEX IF NOT EXISTS idx_product_applications_instance_id
    ON public.product_applications(instance_id);
CREATE INDEX IF NOT EXISTS idx_product_applications_referrer_user_id
    ON public.product_applications(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_product_applications_referrer_card_url
    ON public.product_applications(referrer_card_url);
CREATE INDEX IF NOT EXISTS idx_product_applications_status
    ON public.product_applications(status);
CREATE INDEX IF NOT EXISTS idx_product_applications_assigned_to
    ON public.product_applications(assigned_to);
CREATE INDEX IF NOT EXISTS idx_product_applications_created_at
    ON public.product_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_applications_applicant_email
    ON public.product_applications(applicant_email);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_product_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_product_applications_updated_at ON public.product_applications;
CREATE TRIGGER trigger_product_applications_updated_at
    BEFORE UPDATE ON public.product_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_product_applications_updated_at();

-- RLS 정책
ALTER TABLE public.product_applications ENABLE ROW LEVEL SECURITY;

-- 관리자는 모든 신청 조회/수정 가능 (admin_users.id = auth.uid())
CREATE POLICY "Admins can do everything with applications"
    ON public.product_applications
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

-- 추천인은 자신이 추천한 신청 조회 가능
CREATE POLICY "Referrers can view their referred applications"
    ON public.product_applications
    FOR SELECT
    TO authenticated
    USING (referrer_user_id = auth.uid());

-- 신청자는 자신의 신청 조회 가능
CREATE POLICY "Applicants can view their own applications"
    ON public.product_applications
    FOR SELECT
    TO authenticated
    USING (applicant_user_id = auth.uid());

-- 비회원 신청 허용 (INSERT만)
CREATE POLICY "Anyone can submit applications"
    ON public.product_applications
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 코멘트
COMMENT ON TABLE public.product_applications IS '상품 신청 테이블 - 제휴 서비스/부가명함 상품 가입/구매 신청 관리';
COMMENT ON COLUMN public.product_applications.template_id IS '신청 대상 템플릿 ID';
COMMENT ON COLUMN public.product_applications.instance_id IS '신청 대상 인스턴스 ID (명함에 배포된 부가명함)';
COMMENT ON COLUMN public.product_applications.referrer_user_id IS '추천인 (명함 소유자) user ID';
COMMENT ON COLUMN public.product_applications.referrer_card_url IS '추천 명함 URL (custom_url)';
COMMENT ON COLUMN public.product_applications.form_data IS '동적 폼 데이터 (JSON)';
COMMENT ON COLUMN public.product_applications.status IS '상태: pending(대기) | assigned(배정) | processing(처리중) | completed(완료) | cancelled(취소)';
COMMENT ON COLUMN public.product_applications.referrer_reward_type IS '보상 유형: commission(수수료) | points(포인트) | none(없음)';
COMMENT ON COLUMN public.product_applications.referrer_reward_status IS '보상 상태: pending(대기) | approved(승인) | paid(지급완료)';
