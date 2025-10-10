# Production Deployment Checklist - Sidejob Category System

**Date**: 2025년 10월 10일
**Version**: v1.9
**Features**: 부가명함 카테고리 시스템 + Supabase Storage 통합

---

## ✅ Pre-Deployment Checks

### 1. Source Code Quality
- [x] **TypeScript Build**: ✅ 빌드 성공 (6.47s)
  - No TypeScript errors
  - Bundle size: 228.44 KB (gzipped: 73.59 KB)
  - All lazy-loaded routes working
- [x] **Removed unused code**: `cardTheme`, `cardId` state variables from CardViewPage
- [x] **Migration files cleaned**: Removed duplicate `20251010_add_sidejob_categories.sql`
- [x] **HMR tested**: All changes applied successfully in dev mode

### 2. Database Migrations
**Required migrations for production**:

- [x] `20251010000000_add_sidejob_categories.sql` - Category system
  - Creates `category_primary_type` ENUM
  - Adds columns: category_primary, category_secondary, tags, badge, expiry_date
  - Creates 4 indexes: idx_sidejob_category, idx_sidejob_badge, idx_sidejob_expiry, idx_sidejob_tags

- [x] `20251010000001_create_sidejob_storage.sql` - Storage bucket & RLS
  - Creates `sidejob-cards` storage bucket (public, 5MB limit)
  - Adds 4 RLS policies (INSERT, UPDATE, DELETE, SELECT)
  - User-specific folder structure

**Migration Status**:
- ✅ Local: Applied and tested
- ⏳ Production: **Ready to deploy**

### 3. Storage Configuration
**Production Requirements**:

#### Create Storage Bucket in Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/anwwjowwrxdygqyhhckr/storage/buckets
2. Click "New bucket"
3. Configure:
   - **Name**: `sidejob-cards`
   - **Public bucket**: ✅ Yes
   - **File size limit**: 5 MB (5242880 bytes)
   - **Allowed MIME types**:
     - image/jpeg
     - image/png
     - image/webp
     - image/gif

#### Or Apply via SQL
```sql
-- Execute in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sidejob-cards',
  'sidejob-cards',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;
```

### 4. Environment Variables
**Production .env check** (Vercel):

Required variables:
- [x] `VITE_SUPABASE_URL` - Production Supabase URL
- [x] `VITE_SUPABASE_ANON_KEY` - Production Supabase anon key
- [x] `VITE_APP_NAME` - G-Plat Mobile Business Card
- [x] `VITE_APP_URL` - Production URL

**Note**: No new environment variables required for this release.

### 5. Key Files Modified
**Components**:
- [x] `src/components/CardWithSideJobs.tsx` - Fixed `cta_url` → `cta_link`
- [x] `src/components/CategorySelector.tsx` - New category selection UI
- [x] `src/components/SideJobCardForm.tsx` - Fixed state closure issue, added category support

**Pages**:
- [x] `src/pages/CardViewPage.tsx` - Refactored to use CardWithSideJobs
- [x] `src/pages/DashboardPage.tsx` - Added active sidejob filtering
- [x] `src/pages/SideJobCardsPage.tsx` - Category management

**Types**:
- [x] `src/types/sidejob.ts` - New category types and helpers

**Database**:
- [x] `supabase/migrations/20251010000000_add_sidejob_categories.sql`
- [x] `supabase/migrations/20251010000001_create_sidejob_storage.sql`

---

## 🚀 Deployment Steps

### Step 1: Prepare Database Migration
```bash
# Test migration locally first
cd react-app
npx supabase db reset

# Verify all tables and indexes created
docker exec supabase_db_react-app psql -U postgres -d postgres -c "\d sidejob_cards"
```

### Step 2: Apply to Production Database

**Option A: Using Supabase Dashboard SQL Editor**
1. Go to SQL Editor: https://supabase.com/dashboard/project/anwwjowwrxdygqyhhckr/sql
2. Execute `20251010000000_add_sidejob_categories.sql`
3. Execute `20251010000001_create_sidejob_storage.sql`
4. Verify: `SELECT * FROM storage.buckets WHERE id = 'sidejob-cards';`

**Option B: Using Supabase CLI** (if configured)
```bash
SUPABASE_ACCESS_TOKEN="sbp_..." npx supabase db push --linked
```

### Step 3: Create Storage Bucket
See "Storage Configuration" section above.

### Step 4: Deploy Code to Vercel
```bash
# Commit all changes
git add .
git commit -m "feat: Add sidejob category system and storage integration (v1.9)

- Add 5 primary categories and 16 secondary categories
- Implement category-based CTA auto-suggestion
- Integrate Supabase Storage for image uploads
- Add badge, expiry date, and pricing display
- Refactor CardViewPage to use CardWithSideJobs
- Fix state closure issues in form handling
- Remove duplicate migration files

Database changes:
- sidejob_cards: Add category_primary, category_secondary, tags, badge, expiry_date
- Create 4 new indexes for performance
- Create sidejob-cards storage bucket with RLS policies

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to GitHub
git push origin main
```

### Step 5: Verify Deployment
Wait for Vercel deployment to complete, then test:

**Critical Paths to Test**:
1. ✅ Login/Registration
2. ✅ Dashboard load
3. ✅ Create new sidejob card with category
4. ✅ Upload image to sidejob card
5. ✅ View card in preview modal (sidejobs visible)
6. ✅ View actual card page `/card/:id` (sidejobs visible)
7. ✅ Click sidejob image/CTA (navigates to link)
8. ✅ Edit existing sidejob card
9. ✅ Filter by category (if implemented)

**Database Verification**:
```sql
-- Check category columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'sidejob_cards'
  AND column_name IN ('category_primary', 'category_secondary', 'tags', 'badge', 'expiry_date');

-- Check indexes
SELECT indexname FROM pg_indexes
WHERE tablename = 'sidejob_cards'
  AND indexname LIKE '%category%';

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'sidejob-cards';

-- Check storage policies
SELECT policyname, cmd FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%sidejob%';
```

---

## 🔍 Post-Deployment Verification

### Functional Tests
- [ ] User can select primary category
- [ ] User can select secondary category
- [ ] CTA text auto-suggestion works
- [ ] Image upload works (max 5MB)
- [ ] Image preview displays
- [ ] Badge displays on card
- [ ] Expiry date displays on card
- [ ] Category badge displays with correct color
- [ ] Sidejobs appear on `/card/:id` page
- [ ] Image click opens CTA link in new tab
- [ ] Dashboard preview modal shows active sidejobs only

### Performance Tests
- [ ] Build bundle size acceptable (< 250KB main bundle)
- [ ] Page load time < 3s
- [ ] Image upload completes < 5s
- [ ] No console errors in production

### Database Tests
- [ ] All 4 indexes created
- [ ] ENUM type created successfully
- [ ] RLS policies working (can only edit own images)
- [ ] Storage bucket public URL accessible

---

## 🐛 Known Issues / Limitations

1. **Storage bucket**: Local only - must create manually in production
2. **Migration history**: Duplicate migration removed - track in git history
3. **TypeScript**: Removed unused variables - may need adjustment if theme switching is re-implemented

---

## 📊 Metrics to Monitor

After deployment, monitor:
- **Error Rate**: Should remain < 1%
- **Upload Success Rate**: Should be > 95%
- **Page Load Time**: Should be < 3s
- **Storage Usage**: Track growth rate
- **Category Distribution**: Which categories are most popular

---

## 🔄 Rollback Plan

If issues occur:

1. **Code rollback**:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Database rollback** (if needed):
   ```sql
   -- Remove columns (CAUTION: Data loss)
   ALTER TABLE sidejob_cards
     DROP COLUMN IF EXISTS category_primary,
     DROP COLUMN IF EXISTS category_secondary,
     DROP COLUMN IF EXISTS tags,
     DROP COLUMN IF EXISTS badge,
     DROP COLUMN IF EXISTS expiry_date;

   -- Drop ENUM type
   DROP TYPE IF EXISTS category_primary_type;
   ```

3. **Storage cleanup**:
   - Delete `sidejob-cards` bucket from Supabase Dashboard
   - Or keep for future use (no cost if empty)

---

## ✅ Deployment Approval

- [ ] All pre-deployment checks passed
- [ ] Database migration tested locally
- [ ] Build successful with no errors
- [ ] Storage bucket creation plan confirmed
- [ ] Rollback plan understood
- [ ] Monitoring plan in place

**Deployed by**: _____________
**Date**: _____________
**Vercel Build ID**: _____________
**Supabase Migration Applied**: Yes / No
**Storage Bucket Created**: Yes / No

---

**Next Steps After Deployment**:
1. Monitor error logs for 24 hours
2. Collect user feedback on category system
3. Plan Phase 3 features (SMS, Payment, Korean domains)
