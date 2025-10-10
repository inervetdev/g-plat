-- Test the trigger by creating a test user
-- First check current users
SELECT id, email, name FROM public.users;
SELECT user_id FROM public.user_profiles;

-- Create a test auth user (this will trigger our function)
-- Note: We can't directly insert into auth.users, so we'll verify the trigger exists
SELECT 
  tgname AS trigger_name,
  tgenabled AS enabled,
  pg_get_triggerdef(oid) AS definition
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
