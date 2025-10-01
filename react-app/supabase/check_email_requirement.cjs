// Check if email verification is required for login
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://anwwjowwrxdygqyhhckr.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3dqb3d3cnhkeWdxeWhoY2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODg0OTUsImV4cCI6MjA3NDU2NDQ5NX0.uKtcf8jpHuY6JYb2i3bKhmCayvecc4Ezf6go5Luh5gs';
const SERVICE_KEY = 'sb_secret_boEWDPnDyiGvrZs05CY1FQ_2UFUjyLS';

async function checkEmailRequirement() {
  console.log('🔍 Checking Email Verification Requirements\n');
  console.log('=' .repeat(50));

  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  const adminSupabase = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    // 1. Check auth.users table for existing users
    console.log('\n📧 Checking existing users in auth.users:');
    const { data: authUsers, error: authError } = await adminSupabase
      .from('auth.users')
      .select('email, email_confirmed_at, created_at')
      .limit(5);

    if (authError) {
      // Try using RPC function if direct access fails
      console.log('   Direct access failed, trying alternative method...');
      const { data: rpcResult, error: rpcError } = await adminSupabase
        .rpc('get_auth_users', {});

      if (rpcError) {
        console.log('   ❌ Cannot access auth.users:', rpcError.message);
      } else {
        console.log('   Found users via RPC:', rpcResult);
      }
    } else if (authUsers && authUsers.length > 0) {
      authUsers.forEach((user, index) => {
        console.log(`\n   User ${index + 1}:`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Email Confirmed: ${user.email_confirmed_at ? '✅ Yes' : '❌ No'}`);
        console.log(`   - Created: ${new Date(user.created_at).toLocaleString()}`);
      });
    } else {
      console.log('   No users found in auth.users table');
    }

    // 2. Test creating a new user without email confirmation
    console.log('\n🧪 Testing user creation (localhost environment):');
    const testEmail = `test_${Date.now()}@localhost.com`;
    const testPassword = 'TestPassword123!';

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: 'http://localhost:5177/dashboard'
      }
    });

    if (signUpError) {
      console.log('   ❌ Sign up failed:', signUpError.message);
    } else {
      console.log('   ✅ User created successfully');
      console.log('   - User ID:', signUpData.user?.id);
      console.log('   - Email confirmed:', signUpData.user?.email_confirmed_at ? 'Yes' : 'No');
      console.log('   - Confirmation sent:', signUpData.user?.confirmation_sent_at ? 'Yes' : 'No');

      // Try to sign in immediately
      console.log('\n🔑 Testing immediate sign in:');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (signInError) {
        console.log('   ❌ Cannot sign in:', signInError.message);
        console.log('   ⚠️  Email verification is REQUIRED');
      } else {
        console.log('   ✅ Sign in successful!');
        console.log('   ✅ Email verification is NOT required');

        // Clean up test user
        await supabase.auth.signOut();
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('\n💡 LOCALHOST EMAIL VERIFICATION ANALYSIS:');
  console.log('\n1. For localhost development:');
  console.log('   - Supabase usually sends confirmation emails even for localhost');
  console.log('   - The redirect URL in the email will point to your localhost URL');
  console.log('   - This WORKS if you click the link from the same machine');
  console.log('\n2. Common localhost issues:');
  console.log('   - Email might go to spam folder');
  console.log('   - Free tier limited to 3 emails per hour');
  console.log('   - Confirmation link expires after 24 hours');
  console.log('\n3. Solutions:');
  console.log('   a) Disable email confirmation in Supabase Dashboard (recommended for dev)');
  console.log('   b) Use magic link login instead of password');
  console.log('   c) Set up custom SMTP for unlimited emails');
  console.log('   d) Manually confirm users via SQL');
  console.log('\n4. For production with custom domain:');
  console.log('   - Email verification works normally');
  console.log('   - Just update redirect URLs in Supabase Dashboard');
}

checkEmailRequirement().catch(console.error);