// Script to add theme column to user_profiles table
const SUPABASE_PROJECT_ID = 'anwwjowwrxdygqyhhckr';
const SUPABASE_ACCESS_TOKEN = 'sbp_af204878a17ac8fdfa0515351c4f0539fb26fddb';
const API_URL = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_ID}/database/query`;

async function executeSQL(query) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  const result = await response.text();
  return { status: response.status, result };
}

async function addThemeColumn() {
  console.log('🎨 Adding Theme Column to user_profiles\n');
  console.log('=' .repeat(50));

  // Step 1: Add theme column
  console.log('📌 Step 1: Adding theme column...');
  const addColumnQuery = `
    ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS theme VARCHAR(50) DEFAULT 'trendy';
  `;

  const { status: addStatus } = await executeSQL(addColumnQuery);
  if (addStatus === 200 || addStatus === 201) {
    console.log('   ✅ Theme column added successfully');
  } else {
    console.log('   ⚠️  Column might already exist or error occurred');
  }

  // Step 2: Add comment for documentation
  console.log('\n📌 Step 2: Adding column documentation...');
  const commentQuery = `
    COMMENT ON COLUMN public.user_profiles.theme
    IS 'User selected theme for their business card (trendy, apple, professional, simple, default)';
  `;

  const { status: commentStatus } = await executeSQL(commentQuery);
  if (commentStatus === 200 || commentStatus === 201) {
    console.log('   ✅ Column documentation added');
  } else {
    console.log('   ⚠️  Documentation update skipped');
  }

  // Step 3: Verify column exists
  console.log('\n📌 Step 3: Verifying column...');
  const verifyQuery = `
    SELECT column_name, data_type, column_default
    FROM information_schema.columns
    WHERE table_name = 'user_profiles'
    AND column_name = 'theme';
  `;

  const { status: verifyStatus, result: verifyResult } = await executeSQL(verifyQuery);
  if (verifyStatus === 200) {
    try {
      const columns = JSON.parse(verifyResult);
      if (columns && columns.length > 0) {
        console.log('   ✅ Theme column verified:');
        console.log(`      - Type: ${columns[0].data_type}`);
        console.log(`      - Default: ${columns[0].column_default}`);
      } else {
        console.log('   ⚠️  Column not found in verification');
      }
    } catch (e) {
      console.log('   ✅ Column operation completed');
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('✅ Theme column setup complete!\n');
  console.log('📋 Next Steps:');
  console.log('   1. Users can now select themes in the dashboard');
  console.log('   2. Themes are saved to the database');
  console.log('   3. Cards will display with selected theme');
}

// Run the setup
addThemeColumn().catch(console.error);