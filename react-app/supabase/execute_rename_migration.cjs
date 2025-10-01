const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://anwwjowwrxdygqyhhckr.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3dqb3d3cnhkeWdxeWhoY2tyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODk4ODQ5NSwiZXhwIjoyMDc0NTY0NDk1fQ.IxW8qTxKBTSBRDmW4rHYVwH_xLYvZWs5eXhrkNm4peo';

async function runMigration() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('🔍 Checking current sidejob_cards table structure...\n');

  // First, check the current columns
  const { data: checkData, error: checkError } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT column_name, data_type, character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'sidejob_cards'
        ORDER BY ordinal_position;
      `
    });

  if (checkError) {
    console.error('❌ Error checking table structure:', checkError.message);
    // Try alternative method
    console.log('\n📋 Attempting to query table directly...');
    const { data: tableData, error: tableError } = await supabase
      .from('sidejob_cards')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Error:', tableError.message);
    } else {
      console.log('✅ Current table columns:', tableData && tableData.length > 0 ? Object.keys(tableData[0]) : 'No data');
    }
  } else {
    console.log('✅ Current columns:');
    console.table(checkData);
  }

  console.log('\n🚀 Running migration: Rename cta_url to cta_link...\n');

  // Read the migration file
  const migrationPath = path.join(__dirname, 'migrations', '002_rename_cta_url_to_cta_link.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('📄 Migration SQL:');
  console.log(migrationSQL);
  console.log('');

  // Execute the migration using raw SQL query
  // Note: Supabase JS client doesn't support DDL operations directly
  // We need to use the SQL Editor or run this through pgAdmin/psql

  console.log('⚠️  IMPORTANT: This migration needs to be executed manually.');
  console.log('   Please run the following SQL in your Supabase SQL Editor:');
  console.log('');
  console.log('   1. Go to: https://supabase.com/dashboard/project/anwwjowwrxdygqyhhckr/sql/new');
  console.log('   2. Copy and paste the SQL from: react-app/supabase/migrations/002_rename_cta_url_to_cta_link.sql');
  console.log('   3. Click "Run" to execute the migration');
  console.log('');
  console.log('   OR use the Supabase CLI:');
  console.log('   $ npx supabase db push --project-ref anwwjowwrxdygqyhhckr');
  console.log('');

  // Verify the migration (if already run)
  console.log('🔍 Verifying migration (checking if cta_link exists)...\n');

  const { data: verifyData, error: verifyError } = await supabase
    .from('sidejob_cards')
    .select('cta_link, cta_text')
    .limit(1);

  if (verifyError) {
    if (verifyError.message.includes('cta_link')) {
      console.log('❌ Column cta_link not found. Migration needs to be run.');
    } else {
      console.error('❌ Error verifying migration:', verifyError.message);
    }
  } else {
    console.log('✅ Migration appears to be complete! Columns cta_link and cta_text are accessible.');
  }
}

runMigration().catch(console.error);