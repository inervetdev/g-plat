-- 🚀 G-PLAT 모바일 명함 테이블 생성 스크립트
-- Supabase SQL Editor에서 이 전체 내용을 복사/붙여넣기 후 Run 클릭!

-- 1️⃣ business_cards 테이블 생성
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
    services TEXT[],
    skills TEXT[],

    -- 디자인 설정
    theme VARCHAR(50) DEFAULT 'trendy',
    card_color VARCHAR(7),
    font_style VARCHAR(50),

    -- 이미지
    profile_image TEXT,
    company_logo TEXT,
    background_image TEXT,

    -- QR 코드 및 URL
    qr_code TEXT,
    custom_url VARCHAR(100) UNIQUE,
    short_url VARCHAR(50),

    -- 부가 기능
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,

    -- 메타데이터
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2️⃣ RLS (Row Level Security) 활성화
ALTER TABLE public.business_cards ENABLE ROW LEVEL SECURITY;

-- 3️⃣ RLS 정책 생성 (기존 정책 삭제 후 재생성)
DROP POLICY IF EXISTS "Users can view own business cards" ON public.business_cards;
DROP POLICY IF EXISTS "Users can create own business cards" ON public.business_cards;
DROP POLICY IF EXISTS "Users can update own business cards" ON public.business_cards;
DROP POLICY IF EXISTS "Users can delete own business cards" ON public.business_cards;
DROP POLICY IF EXISTS "Anyone can view active business cards" ON public.business_cards;

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

-- 4️⃣ 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5️⃣ 업데이트 트리거 생성
DROP TRIGGER IF EXISTS update_business_cards_updated_at ON public.business_cards;

CREATE TRIGGER update_business_cards_updated_at
    BEFORE UPDATE ON public.business_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6️⃣ 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_business_cards_user_id ON public.business_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_business_cards_custom_url ON public.business_cards(custom_url);
CREATE INDEX IF NOT EXISTS idx_business_cards_is_active ON public.business_cards(is_active);

-- ✅ 완료! 테이블이 성공적으로 생성되었습니다.
-- 이제 /create-card 페이지에서 명함을 만들 수 있습니다!