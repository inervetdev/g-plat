-- Supabase SQL Editor에서 실행
-- 모든 미확인 사용자를 확인 상태로 변경

-- 1. 현재 미확인 사용자 확인
SELECT
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email_confirmed_at IS NULL;

-- 2. 모든 미확인 사용자를 확인 상태로 변경
UPDATE auth.users
SET
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 3. 변경 확인
SELECT
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;