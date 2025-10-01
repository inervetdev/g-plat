// Script to check existing users
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://anwwjowwrxdygqyhhckr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3dqb3d3cnhkeWdxeWhoY2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODg0OTUsImV4cCI6MjA3NDU2NDQ5NX0.uKtcf8jpHuY6JYb2i3bKhmCayvecc4Ezf6go5Luh5gs';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkUsers() {
  console.log('📋 Checking existing users...\n');

  try {
    // Get users from public.users table
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .limit(10);

    if (error) {
      console.log('Error fetching users:', error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.log('No users found in the database.');
      console.log('\nCreate a test user first by:');
      console.log('1. Going to http://localhost:5175/register');
      console.log('2. Signing up with a test email');
      return;
    }

    console.log(`Found ${data.length} user(s):\n`);
    data.forEach((user, index) => {
      console.log(`${index + 1}. User ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name || 'Not set'}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleString('ko-KR')}`);
      console.log(`   Card URL: http://localhost:5175/card/${user.id}`);
      console.log('');
    });

    if (data[0]) {
      console.log('✅ To view the first user\'s card, visit:');
      console.log(`   http://localhost:5175/card/${data[0].id}`);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

checkUsers();