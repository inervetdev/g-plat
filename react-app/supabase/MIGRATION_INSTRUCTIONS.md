# Supabase sidejob_cards Table Migration

## Current Situation

### Database Schema (in Supabase)
The `sidejob_cards` table currently has:
- ✅ `cta_text` (TEXT) - exists
- ⚠️ `cta_url` (TEXT) - needs to be renamed to `cta_link`

### Application Code (React/TypeScript)
The application code expects:
- ✅ `cta_text`
- ✅ `cta_link` (not `cta_url`)

**Issue**: There is a naming mismatch between the database (`cta_url`) and the application code (`cta_link`).

## Solution

Rename the `cta_url` column to `cta_link` in the Supabase database.

## Migration Steps

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/anwwjowwrxdygqyhhckr/sql/new

2. **Run the Check Query First**
   ```sql
   -- Check current columns
   SELECT column_name, data_type, character_maximum_length
   FROM information_schema.columns
   WHERE table_schema = 'public'
     AND table_name = 'sidejob_cards'
     AND column_name IN ('cta_text', 'cta_url', 'cta_link')
   ORDER BY column_name;
   ```

3. **If you see `cta_url`, run the migration**
   ```sql
   -- Rename cta_url to cta_link
   ALTER TABLE public.sidejob_cards
   RENAME COLUMN cta_url TO cta_link;

   -- Add helpful comments
   COMMENT ON COLUMN public.sidejob_cards.cta_text IS 'Call-to-action button text';
   COMMENT ON COLUMN public.sidejob_cards.cta_link IS 'Call-to-action link URL';
   ```

4. **Verify the migration**
   ```sql
   -- Check that cta_link now exists
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_schema = 'public'
     AND table_name = 'sidejob_cards'
     AND column_name IN ('cta_text', 'cta_link')
   ORDER BY column_name;
   ```

### Option 2: Run Complete SQL File

You can also run the complete migration script:
- File: `react-app/supabase/check_and_migrate_cta_columns.sql`
- Copy and paste the entire file into Supabase SQL Editor and run it

### Option 3: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Navigate to react-app directory
cd react-app

# Run the migration
npx supabase db push --project-ref anwwjowwrxdygqyhhckr
```

## Expected Results

After successful migration, your `sidejob_cards` table should have:

| Column Name | Data Type | Nullable | Description |
|-------------|-----------|----------|-------------|
| id | uuid | NOT NULL | Primary key |
| user_id | uuid | NOT NULL | Foreign key to users |
| title | text | NOT NULL | Card title |
| description | text | NULL | Card description |
| image_url | text | NULL | Card image URL |
| price | text | NULL | Price information |
| **cta_text** | text | NULL | Call-to-action button text |
| **cta_link** | text | NULL | Call-to-action link URL |
| display_order | integer | NULL | Display order (default: 0) |
| is_active | boolean | NULL | Active status (default: true) |
| view_count | integer | NULL | View counter (default: 0) |
| click_count | integer | NULL | Click counter (default: 0) |
| created_at | timestamptz | NULL | Creation timestamp |
| updated_at | timestamptz | NULL | Last update timestamp |

## Verification

After running the migration, test in your React application:

1. Go to the Side Job Cards page
2. Try to create a new side job card with CTA text and link
3. Verify the data is saved correctly
4. Check that existing cards (if any) display properly

## Troubleshooting

### If you get "column cta_url does not exist"
- The migration has already been run successfully
- No action needed

### If you get "column cta_link already exists"
- The column is already renamed
- No action needed

### If you get permission errors
- Make sure you're logged in as the database owner
- Check that you're using the correct project in Supabase dashboard

## Files Created

1. `migrations/002_rename_cta_url_to_cta_link.sql` - Migration file
2. `check_and_migrate_cta_columns.sql` - Complete check and migration script
3. `execute_rename_migration.cjs` - Node.js script for automated execution
4. `MIGRATION_INSTRUCTIONS.md` - This file

## Contact

If you encounter any issues, refer to:
- Supabase Documentation: https://supabase.com/docs
- Project README: `../README.md`