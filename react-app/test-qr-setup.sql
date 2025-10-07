-- Test QR code setup for Edge Function testing

-- Create a test user (using Supabase's UUID format)
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '00000000-0000-0000-0000-000000000000',
    'test@gplat.com',
    '$2a$10$FAKE_HASH_FOR_TESTING_ONLY',
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Test User"}',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Insert test QR codes
INSERT INTO public.qr_codes (
    id,
    user_id,
    short_code,
    target_url,
    target_type,
    campaign,
    is_active,
    created_at,
    updated_at
) VALUES
(
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'test123',
    'https://g-plat.com',
    'static',
    'test',
    true,
    NOW(),
    NOW()
),
(
    'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'dynamic1',
    'https://g-plat.com/dashboard',
    'dynamic',
    'social_media',
    true,
    NOW(),
    NOW()
),
(
    'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'inactive1',
    'https://g-plat.com',
    'static',
    'test',
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;
