// Script to test the authentication flow
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://anwwjowwrxdygqyhhckr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3dqb3d3cnhkeWdxeWhoY2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODg0OTUsImV4cCI6MjA3NDU2NDQ5NX0.uKtcf8jpHuY6JYb2i3bKhmCayvecc4Ezf6go5Luh5gs';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Generate test user data with realistic email format
const timestamp = Math.floor(Date.now() / 1000);
const testEmail = `gplat.test${timestamp}@gmail.com`;
const testPassword = 'Test123456!';
const testName = '테스트 사용자';

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow\n');
  console.log('=' .repeat(50));

  console.log('📧 Test User Details:');
  console.log(`   Email: ${testEmail}`);
  console.log(`   Password: ${testPassword}`);
  console.log(`   Name: ${testName}\n`);

  // Step 1: Test Sign Up
  console.log('📌 Step 1: Testing Sign Up...');
  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName
        }
      }
    });

    if (signUpError) {
      console.log('   ❌ Sign up failed:', signUpError.message);
      return;
    }

    console.log('   ✅ Sign up successful!');
    console.log(`   User ID: ${signUpData.user?.id}`);
    console.log(`   Email confirmed: ${signUpData.user?.email_confirmed_at ? 'Yes' : 'No'}`);

    // Step 2: Check if user was added to users table
    console.log('\n📌 Step 2: Checking users table...');

    // Try to insert user data (will fail if RLS blocks it)
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: signUpData.user.id,
        email: testEmail,
        name: testName
      });

    if (insertError) {
      console.log('   ⚠️  Could not insert into users table (expected before email confirmation)');
      console.log(`      Error: ${insertError.message}`);
    } else {
      console.log('   ✅ User data inserted into users table');
    }

    // Step 3: Check auth.users status
    console.log('\n📌 Step 3: Auth Status...');
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      console.log('   ✅ User authenticated');
      console.log(`   User ID: ${user.id}`);
    } else {
      console.log('   ⚠️  User not authenticated (email confirmation required)');
    }

    // Step 4: Test Sign In (will fail if email not confirmed)
    console.log('\n📌 Step 4: Testing Sign In...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) {
      console.log('   ⚠️  Sign in failed (expected if email not confirmed)');
      console.log(`      Error: ${signInError.message}`);

      if (signInError.message.includes('Invalid login credentials') ||
          signInError.message.includes('Email not confirmed')) {
        console.log('\n   📧 Please check your email to confirm your account');
        console.log('      - Check inbox and spam folder');
        console.log('      - Click the confirmation link');
        console.log('      - Then try logging in');
      }
    } else {
      console.log('   ✅ Sign in successful!');
      console.log(`   Session: ${signInData.session ? 'Active' : 'None'}`);
    }

    // Step 5: Summary
    console.log('\n' + '=' .repeat(50));
    console.log('📊 Test Summary:\n');
    console.log('✅ User registration: SUCCESS');
    console.log(`${insertError ? '⚠️' : '✅'} Database insert: ${insertError ? 'BLOCKED (requires email confirmation)' : 'SUCCESS'}`);
    console.log(`${signInError ? '⚠️' : '✅'} Login: ${signInError ? 'REQUIRES EMAIL CONFIRMATION' : 'SUCCESS'}`);

    console.log('\n💡 Next Steps:');
    console.log('1. Check email for confirmation link');
    console.log('2. Click the link to confirm email');
    console.log('3. Try logging in at http://localhost:5175/login');
    console.log('4. Check Supabase Dashboard > Authentication > Users');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }

  // Clean up - sign out
  await supabase.auth.signOut();
}

// Run the test
console.log('🚀 Starting authentication flow test...\n');
testAuthFlow().catch(console.error);