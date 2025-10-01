-- 사용자 프로필 테이블
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  company TEXT,
  position TEXT,
  phone TEXT,
  domain_name TEXT UNIQUE,
  profile_image_url TEXT,
  bio TEXT,
  address TEXT,
  social_links JSONB DEFAULT '{}',
  theme_settings JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'FREE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 부업 카드 테이블
CREATE TABLE IF NOT EXISTS public.sidejob_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price TEXT,
  cta_text TEXT DEFAULT '자세히 보기',
  cta_link TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 방문자 통계 테이블
CREATE TABLE IF NOT EXISTS public.visitor_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  visitor_ip TEXT,
  user_agent TEXT,
  referrer TEXT,
  page_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 콜백 로그 테이블
CREATE TABLE IF NOT EXISTS public.callback_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  phone_number TEXT,
  message TEXT,
  status TEXT DEFAULT 'PENDING',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) 정책
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sidejob_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.callback_logs ENABLE ROW LEVEL SECURITY;

-- 프로필 정책: 자신의 프로필만 수정 가능
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 부업 카드 정책: 자신의 카드만 수정 가능
CREATE POLICY "Anyone can view active cards" ON public.sidejob_cards
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage own cards" ON public.sidejob_cards
  FOR ALL USING (user_id = auth.uid());

-- 통계는 프로필 소유자만 볼 수 있음
CREATE POLICY "Users can view own stats" ON public.visitor_stats
  FOR SELECT USING (profile_id = auth.uid());

-- 콜백 로그는 본인것만
CREATE POLICY "Users can view own callback logs" ON public.callback_logs
  FOR SELECT USING (user_id = auth.uid());