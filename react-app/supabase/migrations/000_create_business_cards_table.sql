-- Business Cards 테이블 생성 및 기능 추가
-- 이미 존재하는 테이블은 수정만 진행

-- 1. business_cards 테이블이 없으면 생성
CREATE TABLE IF NOT EXISTS public.business_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- 기본 정보
    name VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    company VARCHAR(100),
    department VARCHAR(100),

    -- 연락처
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),

    -- 주소
    address TEXT,

    -- 소셜 미디어
    linkedin VARCHAR(255),
    instagram VARCHAR(255),
    facebook VARCHAR(255),
    twitter VARCHAR(255),
    youtube VARCHAR(255),
    github VARCHAR(255),

    -- 소개 및 서비스
    introduction TEXT,
    services TEXT[], -- 제공 서비스 목록
    skills TEXT[],   -- 보유 기술 목록

    -- 디자인 설정
    theme VARCHAR(50) DEFAULT 'trendy', -- trendy, apple, professional, simple, custom
    card_color VARCHAR(7), -- HEX color
    font_style VARCHAR(50),

    -- 이미지
    profile_image TEXT,
    company_logo TEXT,
    background_image TEXT,

    -- QR 코드 및 URL
    qr_code TEXT,
    custom_url VARCHAR(100) UNIQUE, -- 커스텀 URL (예: john-doe)
    short_url VARCHAR(50),

    -- 부가 기능
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false, -- 대표 명함 여부
    view_count INTEGER DEFAULT 0,

    -- 메타데이터
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_business_cards_user_id ON public.business_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_business_cards_custom_url ON public.business_cards(custom_url);
CREATE INDEX IF NOT EXISTS idx_business_cards_is_active ON public.business_cards(is_active);

-- 3. RLS (Row Level Security) 활성화
ALTER TABLE public.business_cards ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 생성
-- 사용자는 자신의 명함만 볼 수 있음
CREATE POLICY "Users can view own business cards" ON public.business_cards
    FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 명함만 생성할 수 있음
CREATE POLICY "Users can create own business cards" ON public.business_cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 명함만 수정할 수 있음
CREATE POLICY "Users can update own business cards" ON public.business_cards
    FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 명함만 삭제할 수 있음
CREATE POLICY "Users can delete own business cards" ON public.business_cards
    FOR DELETE USING (auth.uid() = user_id);

-- 활성화된 명함은 누구나 볼 수 있음 (공개 프로필)
CREATE POLICY "Anyone can view active business cards" ON public.business_cards
    FOR SELECT USING (is_active = true);

-- 5. 명함 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_view_count(card_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.business_cards
    SET view_count = view_count + 1
    WHERE id = card_id AND is_active = true;
END;
$$;

-- 6. 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_cards_updated_at
    BEFORE UPDATE ON public.business_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. 사용자당 명함 개수 제한 함수 (프리미엄 기능용)
CREATE OR REPLACE FUNCTION check_card_limit()
RETURNS TRIGGER AS $$
DECLARE
    card_count INTEGER;
    max_cards INTEGER := 3; -- 무료 사용자는 3개까지
BEGIN
    SELECT COUNT(*) INTO card_count
    FROM public.business_cards
    WHERE user_id = NEW.user_id;

    IF card_count >= max_cards THEN
        RAISE EXCEPTION 'Maximum number of business cards reached';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거는 필요시 활성화
-- CREATE TRIGGER check_card_limit_trigger
--     BEFORE INSERT ON public.business_cards
--     FOR EACH ROW
--     EXECUTE FUNCTION check_card_limit();

-- 8. 대표 명함 설정 함수
CREATE OR REPLACE FUNCTION set_primary_card(card_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 먼저 모든 카드의 is_primary를 false로 설정
    UPDATE public.business_cards
    SET is_primary = false
    WHERE user_id = auth.uid();

    -- 선택한 카드를 primary로 설정
    UPDATE public.business_cards
    SET is_primary = true
    WHERE id = card_id AND user_id = auth.uid();
END;
$$;