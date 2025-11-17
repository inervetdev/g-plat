# Supabase Migration Skill

Create and apply database migrations for Supabase PostgreSQL.

## Usage

Invoke when user needs to:
- Add new tables or columns
- Modify schema
- Create RLS policies
- Add indexes

## Migration File Structure

```
react-app/supabase/migrations/
  └── YYYYMMDDHHMMSS_description.sql
```

## Steps

1. **Create migration file**
   - Use timestamp format: `YYYYMMDDHHMMSS`
   - Descriptive name (snake_case)
   - Add IF NOT EXISTS clauses
   - Include rollback comments

2. **Write migration SQL**
   - Schema changes
   - RLS policies
   - Indexes
   - Comments

3. **Test locally** (if Supabase CLI available)
   ```bash
   cd react-app
   npx supabase db reset  # Test with local DB
   ```

4. **Apply to production**
   - Execute in Supabase Dashboard SQL Editor
   - Verify with SELECT queries

## Template

```sql
-- Description of changes
-- Created: YYYY-MM-DD

-- Add new column
ALTER TABLE table_name
ADD COLUMN IF NOT EXISTS column_name TYPE;

-- Create index
CREATE INDEX IF NOT EXISTS idx_name
ON table_name(column_name);

-- RLS Policy
CREATE POLICY IF NOT EXISTS "policy_name"
ON table_name
FOR SELECT
TO authenticated
USING (condition);

-- Verification
SELECT column_name FROM table_name LIMIT 1;
```

## Safety

- Always use IF NOT EXISTS / IF EXISTS
- Test on local first if possible
- Backup before major changes
- Document all changes
