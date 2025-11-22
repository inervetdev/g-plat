-- Add user deletion tracking columns
-- This migration adds columns to track user deletion for admin audit purposes

-- 1. Add deletion tracking columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- 2. Add index for querying deleted users
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON public.users(deleted_at)
WHERE deleted_at IS NOT NULL;

-- 3. Add index for status queries (active, suspended, deleted)
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- 4. Add comment for documentation
COMMENT ON COLUMN public.users.deleted_at IS 'Timestamp when user was deleted by admin';
COMMENT ON COLUMN public.users.deletion_reason IS 'Admin-provided reason for user deletion';
