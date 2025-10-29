-- ===================================================
-- Check RLS Policies for Admin Operations
-- ===================================================

-- 1. Check if RLS is enabled on users table
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'users';

-- 2. Check existing RLS policies on users table
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- 3. Check if current user can update users table
SELECT current_user, current_role;

-- 4. Check admin_users table RLS
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'admin_users'
ORDER BY policyname;

SELECT '✅ RLS policies check completed!' AS result;
