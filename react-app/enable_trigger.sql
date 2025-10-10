-- Enable the trigger (it was created but disabled)
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- Verify trigger is now enabled
SELECT
  tgname AS trigger_name,
  tgenabled AS enabled,
  CASE tgenabled
    WHEN 'O' THEN 'Enabled'
    WHEN 'D' THEN 'Disabled'
    WHEN 'R' THEN 'Replica'
    WHEN 'A' THEN 'Always'
    ELSE 'Unknown'
  END AS status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Also check if the function exists
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'
  AND routine_schema = 'public';
