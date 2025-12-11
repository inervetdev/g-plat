-- =====================================================
-- Subscription Tier Limits System
-- =====================================================
-- 구독 등급별 명함/부가명함 생성 제한 시스템
--
-- 등급별 제한:
-- FREE: 명함 3개, 부가명함 5개
-- PREMIUM: 명함 10개, 부가명함 30개
-- BUSINESS: 무제한
-- =====================================================

-- =====================================================
-- Step 1: Add grandfathered column to users table
-- =====================================================
-- 기존 사용자 보호를 위한 grandfathered 플래그 추가
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS grandfathered BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.users.grandfathered IS
  '기존 사용자 특별 혜택: true인 경우 등급별 제한 무시';

-- =====================================================
-- Step 2: Mark existing users with excess cards/sidejobs as grandfathered
-- =====================================================
-- FREE 등급이면서 명함 3개 이상 또는 부가명함 5개 이상 보유한 기존 사용자 보호
UPDATE public.users u
SET grandfathered = true
WHERE subscription_tier = 'FREE'
  AND (
    (
      SELECT COUNT(*)
      FROM public.business_cards bc
      WHERE bc.user_id = u.id AND bc.is_active = true
    ) > 3
    OR
    (
      SELECT COUNT(*)
      FROM public.sidejob_cards sc
      WHERE sc.user_id = u.id AND sc.is_active = true
    ) > 5
  );

-- =====================================================
-- Step 3: Function to check business card limit by tier
-- =====================================================
CREATE OR REPLACE FUNCTION check_card_limit_by_tier()
RETURNS TRIGGER AS $$
DECLARE
    card_count INTEGER;
    user_tier subscription_tier;
    is_grandfathered BOOLEAN;
    max_cards INTEGER;
BEGIN
    -- 사용자 등급 및 grandfathered 상태 조회
    SELECT subscription_tier, COALESCE(grandfathered, false)
    INTO user_tier, is_grandfathered
    FROM public.users
    WHERE id = NEW.user_id;

    -- 사용자 정보가 없으면 에러
    IF user_tier IS NULL THEN
        RAISE EXCEPTION 'User not found: %', NEW.user_id;
    END IF;

    -- Grandfathered 사용자는 제한 없음
    IF is_grandfathered THEN
        RETURN NEW;
    END IF;

    -- 등급별 제한 설정
    max_cards := CASE user_tier
        WHEN 'FREE' THEN 3
        WHEN 'PREMIUM' THEN 10
        WHEN 'BUSINESS' THEN 999999  -- 사실상 무제한
        ELSE 3  -- 기본값: FREE와 동일
    END;

    -- 현재 명함 개수 (활성화된 것만 카운트)
    SELECT COUNT(*) INTO card_count
    FROM public.business_cards
    WHERE user_id = NEW.user_id
      AND is_active = true;

    -- 제한 초과 시 에러 발생
    IF card_count >= max_cards THEN
        RAISE EXCEPTION 'TIER_LIMIT: % 플랜은 최대 %개의 명함을 생성할 수 있습니다. 업그레이드가 필요합니다.',
            CASE user_tier
                WHEN 'FREE' THEN '무료'
                WHEN 'PREMIUM' THEN '프리미엄'
                WHEN 'BUSINESS' THEN '비즈니스'
            END,
            max_cards
            USING HINT = '더 많은 명함을 생성하려면 상위 플랜으로 업그레이드하세요.',
                  ERRCODE = '23514'; -- check_violation
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_card_limit_by_tier() IS
  '등급별 명함 생성 제한 체크 함수. Grandfathered 사용자는 제한 없음.';

-- =====================================================
-- Step 4: Function to check sidejob card limit by tier
-- =====================================================
CREATE OR REPLACE FUNCTION check_sidejob_limit_by_tier()
RETURNS TRIGGER AS $$
DECLARE
    sidejob_count INTEGER;
    user_tier subscription_tier;
    is_grandfathered BOOLEAN;
    max_sidejobs INTEGER;
BEGIN
    -- 사용자 등급 및 grandfathered 상태 조회
    SELECT subscription_tier, COALESCE(grandfathered, false)
    INTO user_tier, is_grandfathered
    FROM public.users
    WHERE id = NEW.user_id;

    -- 사용자 정보가 없으면 에러
    IF user_tier IS NULL THEN
        RAISE EXCEPTION 'User not found: %', NEW.user_id;
    END IF;

    -- Grandfathered 사용자는 제한 없음
    IF is_grandfathered THEN
        RETURN NEW;
    END IF;

    -- 등급별 제한 설정
    max_sidejobs := CASE user_tier
        WHEN 'FREE' THEN 5
        WHEN 'PREMIUM' THEN 30
        WHEN 'BUSINESS' THEN 999999  -- 사실상 무제한
        ELSE 5  -- 기본값: FREE와 동일
    END;

    -- 현재 부가명함 개수 (활성화된 것만 카운트)
    SELECT COUNT(*) INTO sidejob_count
    FROM public.sidejob_cards
    WHERE user_id = NEW.user_id
      AND is_active = true;

    -- 제한 초과 시 에러 발생
    IF sidejob_count >= max_sidejobs THEN
        RAISE EXCEPTION 'TIER_LIMIT: % 플랜은 최대 %개의 부가명함을 생성할 수 있습니다. 업그레이드가 필요합니다.',
            CASE user_tier
                WHEN 'FREE' THEN '무료'
                WHEN 'PREMIUM' THEN '프리미엄'
                WHEN 'BUSINESS' THEN '비즈니스'
            END,
            max_sidejobs
            USING HINT = '더 많은 부가명함을 생성하려면 상위 플랜으로 업그레이드하세요.',
                  ERRCODE = '23514'; -- check_violation
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_sidejob_limit_by_tier() IS
  '등급별 부가명함 생성 제한 체크 함수. Grandfathered 사용자는 제한 없음.';

-- =====================================================
-- Step 5: RPC function to get user tier limits (for frontend)
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_tier_limits(p_user_id UUID)
RETURNS TABLE(
    tier subscription_tier,
    max_cards INTEGER,
    max_sidejobs INTEGER,
    has_callbacks BOOLEAN,
    has_advanced_stats BOOLEAN,
    cards_used INTEGER,
    sidejobs_used INTEGER,
    grandfathered BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.subscription_tier AS tier,
        CASE u.subscription_tier
            WHEN 'FREE' THEN 3
            WHEN 'PREMIUM' THEN 10
            WHEN 'BUSINESS' THEN 999999
            ELSE 3
        END AS max_cards,
        CASE u.subscription_tier
            WHEN 'FREE' THEN 5
            WHEN 'PREMIUM' THEN 30
            WHEN 'BUSINESS' THEN 999999
            ELSE 5
        END AS max_sidejobs,
        -- FREE 플랜은 콜백 미제공
        (u.subscription_tier != 'FREE') AS has_callbacks,
        -- FREE 플랜은 고급 통계 미제공
        (u.subscription_tier != 'FREE') AS has_advanced_stats,
        -- 현재 사용 중인 명함 개수 (is_active = true만)
        (
            SELECT COUNT(*)::INTEGER
            FROM public.business_cards bc
            WHERE bc.user_id = p_user_id AND bc.is_active = true
        ) AS cards_used,
        -- 현재 사용 중인 부가명함 개수 (is_active = true만)
        (
            SELECT COUNT(*)::INTEGER
            FROM public.sidejob_cards sc
            WHERE sc.user_id = p_user_id AND sc.is_active = true
        ) AS sidejobs_used,
        COALESCE(u.grandfathered, false) AS grandfathered
    FROM public.users u
    WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_tier_limits(UUID) IS
  '사용자 등급별 제한 정보 및 현재 사용량 조회 (프론트엔드용 RPC)';

-- 인증된 사용자만 실행 가능
GRANT EXECUTE ON FUNCTION get_user_tier_limits(UUID) TO authenticated;

-- =====================================================
-- Step 6: Create triggers (INITIALLY DISABLED)
-- =====================================================
-- 트리거는 처음엔 생성만 하고, 프론트엔드 배포 후 활성화 예정
-- 활성화 시점: 프론트엔드 배포 1주일 후

-- 명함 생성 제한 트리거
DROP TRIGGER IF EXISTS enforce_card_limit_trigger ON public.business_cards;

-- 부가명함 생성 제한 트리거
DROP TRIGGER IF EXISTS enforce_sidejob_limit_trigger ON public.sidejob_cards;

-- 트리거 생성 스크립트 (주석 처리)
-- 활성화 시 아래 주석을 제거하고 실행:

-- CREATE TRIGGER enforce_card_limit_trigger
--     BEFORE INSERT ON public.business_cards
--     FOR EACH ROW
--     EXECUTE FUNCTION check_card_limit_by_tier();

-- CREATE TRIGGER enforce_sidejob_limit_trigger
--     BEFORE INSERT ON public.sidejob_cards
--     FOR EACH ROW
--     EXECUTE FUNCTION check_sidejob_limit_by_tier();

-- =====================================================
-- Step 7: Create violation logging table (for monitoring)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tier_limit_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    violation_type TEXT NOT NULL, -- 'card' or 'sidejob'
    attempted_count INTEGER NOT NULL,
    user_tier subscription_tier NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tier_violations_user
    ON public.tier_limit_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_tier_violations_created
    ON public.tier_limit_violations(created_at DESC);

COMMENT ON TABLE public.tier_limit_violations IS
  '등급 제한 위반 시도 로그 (모니터링용)';

-- RLS 정책: 관리자만 조회 가능
ALTER TABLE public.tier_limit_violations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin users can view violations" ON public.tier_limit_violations;
CREATE POLICY "Admin users can view violations"
    ON public.tier_limit_violations
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- Step 8: (Removed - RLS policy comments not needed)
-- =====================================================
-- 기존 RLS 정책 코멘트는 해당 정책이 존재하지 않으면 에러 발생
-- 트리거 활성화 시점에 별도로 추가 예정

-- =====================================================
-- Migration Summary
-- =====================================================
-- 1. ✅ users.grandfathered 컬럼 추가
-- 2. ✅ 기존 제한 초과 사용자 grandfathered 플래그 설정
-- 3. ✅ check_card_limit_by_tier() 함수 생성
-- 4. ✅ check_sidejob_limit_by_tier() 함수 생성
-- 5. ✅ get_user_tier_limits() RPC 함수 생성
-- 6. ⏳ 트리거 생성 (비활성화 상태)
-- 7. ✅ tier_limit_violations 로깅 테이블 생성
--
-- 다음 단계: 프론트엔드 구현 후 트리거 활성화
-- =====================================================
