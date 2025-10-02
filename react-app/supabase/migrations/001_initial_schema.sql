-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('FREE', 'PREMIUM', 'BUSINESS');
CREATE TYPE callback_status AS ENUM ('PENDING', 'SENT', 'FAILED');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    domain_name TEXT UNIQUE,
    profile_image_url TEXT,
    subscription_tier subscription_tier DEFAULT 'FREE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    company TEXT,
    position TEXT,
    title TEXT,
    bio TEXT,
    address TEXT,
    social_links JSONB DEFAULT '{}',
    theme_settings JSONB DEFAULT '{"theme": "simple", "primaryColor": "#000000", "fontFamily": "Inter"}',
    callback_settings JSONB DEFAULT '{"enabled": false, "provider": "twilio"}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Sidejob cards table
CREATE TABLE IF NOT EXISTS public.sidejob_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price TEXT,
    cta_text TEXT,
    cta_link TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    click_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visitor stats table
CREATE TABLE IF NOT EXISTS public.visitor_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    visitor_ip INET,
    user_agent TEXT,
    referrer TEXT,
    page_url TEXT,
    visit_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Callback logs table
CREATE TABLE IF NOT EXISTS public.callback_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    phone_number TEXT,
    message TEXT,
    status callback_status DEFAULT 'PENDING',
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_domain ON public.users(domain_name);
CREATE INDEX IF NOT EXISTS idx_sidejob_user_active ON public.sidejob_cards(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_visitor_user_date ON public.visitor_stats(user_id, visit_date);
CREATE INDEX IF NOT EXISTS idx_callback_user_status ON public.callback_logs(user_id, status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sidejob_cards_updated_at BEFORE UPDATE ON public.sidejob_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sidejob_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.callback_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users table policies
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- User profiles policies
CREATE POLICY "Profiles are viewable by everyone"
    ON public.user_profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Sidejob cards policies
CREATE POLICY "Cards are viewable by everyone"
    ON public.sidejob_cards FOR SELECT
    USING (is_active = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own cards"
    ON public.sidejob_cards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards"
    ON public.sidejob_cards FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards"
    ON public.sidejob_cards FOR DELETE
    USING (auth.uid() = user_id);

-- Visitor stats policies
CREATE POLICY "Users can view own stats"
    ON public.visitor_stats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert stats"
    ON public.visitor_stats FOR INSERT
    WITH CHECK (true);

-- Callback logs policies
CREATE POLICY "Users can view own logs"
    ON public.callback_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
    ON public.callback_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create functions for statistics
CREATE OR REPLACE FUNCTION increment_view_count(card_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.sidejob_cards
    SET view_count = view_count + 1
    WHERE id = card_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_click_count(card_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.sidejob_cards
    SET click_count = click_count + 1
    WHERE id = card_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to handle user creation (triggered after auth.users insert)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );

    INSERT INTO public.user_profiles (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- For anonymous users (for public card viewing)
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.user_profiles TO anon;
GRANT SELECT ON public.sidejob_cards TO anon;
GRANT INSERT ON public.visitor_stats TO anon;