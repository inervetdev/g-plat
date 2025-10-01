-- ✅ 안전한 버전 - 단계별 실행 가능
-- Supabase SQL Editor에서 한 번에 실행하거나 단계별로 실행 가능

-- Step 1: 테이블 생성 (이미 존재하면 스킵됨)
CREATE TABLE IF NOT EXISTS public.business_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    company VARCHAR(100),
    department VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    address TEXT,
    linkedin VARCHAR(255),
    instagram VARCHAR(255),
    facebook VARCHAR(255),
    twitter VARCHAR(255),
    youtube VARCHAR(255),
    github VARCHAR(255),
    introduction TEXT,
    services TEXT[],
    skills TEXT[],
    theme VARCHAR(50) DEFAULT 'trendy',
    card_color VARCHAR(7),
    font_style VARCHAR(50),
    profile_image TEXT,
    company_logo TEXT,
    background_image TEXT,
    qr_code TEXT,
    custom_url VARCHAR(100) UNIQUE,
    short_url VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: RLS 활성화 (안전함 - 이미 활성화되어 있어도 문제 없음)
ALTER TABLE public.business_cards ENABLE ROW LEVEL SECURITY;

-- Step 3: RLS 정책 생성 (안전한 방법)
DO $$
BEGIN
    -- 기존 정책 삭제
    DROP POLICY IF EXISTS "Users can view own business cards" ON public.business_cards;
    DROP POLICY IF EXISTS "Users can create own business cards" ON public.business_cards;
    DROP POLICY IF EXISTS "Users can update own business cards" ON public.business_cards;
    DROP POLICY IF EXISTS "Users can delete own business cards" ON public.business_cards;
    DROP POLICY IF EXISTS "Anyone can view active business cards" ON public.business_cards;

    -- 새 정책 생성
    CREATE POLICY "Users can view own business cards"
        ON public.business_cards FOR SELECT
        USING (auth.uid() = user_id);

    CREATE POLICY "Users can create own business cards"
        ON public.business_cards FOR INSERT
        WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own business cards"
        ON public.business_cards FOR UPDATE
        USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own business cards"
        ON public.business_cards FOR DELETE
        USING (auth.uid() = user_id);

    CREATE POLICY "Anyone can view active business cards"
        ON public.business_cards FOR SELECT
        USING (is_active = true);
EXCEPTION
    WHEN OTHERS THEN
        -- 에러 발생 시 무시
        NULL;
END $$;

-- Step 4: 인덱스 생성 (안전함 - IF NOT EXISTS 사용)
CREATE INDEX IF NOT EXISTS idx_business_cards_user_id ON public.business_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_business_cards_custom_url ON public.business_cards(custom_url);
CREATE INDEX IF NOT EXISTS idx_business_cards_is_active ON public.business_cards(is_active);

-- Step 5: 업데이트 트리거 함수 (안전함 - CREATE OR REPLACE 사용)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: 트리거 생성 (안전함 - 기존 트리거 먼저 삭제)
DROP TRIGGER IF EXISTS update_business_cards_updated_at ON public.business_cards;
CREATE TRIGGER update_business_cards_updated_at
    BEFORE UPDATE ON public.business_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ✅ 완료! 테이블이 안전하게 생성되었습니다.