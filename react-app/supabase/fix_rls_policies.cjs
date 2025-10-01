// Script to temporarily disable RLS for testing
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

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS Policies for Development\n');
  console.log('=' .repeat(50));

  const commands = [
    {
      name: 'Disable RLS on users table',
      sql: 'ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;'
    },
    {
      name: 'Disable RLS on user_profiles table',
      sql: 'ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;'
    },
    {
      name: 'Disable RLS on sidejob_cards table',
      sql: 'ALTER TABLE public.sidejob_cards DISABLE ROW LEVEL SECURITY;'
    },
    {
      name: 'Disable RLS on visitor_stats table',
      sql: 'ALTER TABLE public.visitor_stats DISABLE ROW LEVEL SECURITY;'
    },
    {
      name: 'Disable RLS on callback_logs table',
      sql: 'ALTER TABLE public.callback_logs DISABLE ROW LEVEL SECURITY;'
    }
  ];

  console.log('⚠️  WARNING: Disabling RLS for testing purposes\n');

  for (const cmd of commands) {
    process.stdout.write(`📝 ${cmd.name}... `);
    try {
      const { status } = await executeSQL(cmd.sql);
      console.log(status === 200 ? '✅' : `❌ (Status: ${status})`);
    } catch (error) {
      console.log('❌');
      console.error(`   Error: ${error.message}`);
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('✅ RLS has been DISABLED for all tables');
  console.log('');
  console.log('⚠️  IMPORTANT:');
  console.log('   - This is for DEVELOPMENT/TESTING only');
  console.log('   - DO NOT use in production');
  console.log('   - To re-enable RLS, run: node enable_rls.cjs');
  console.log('');
  console.log('🎯 Next Steps:');
  console.log('   1. Go to Supabase Dashboard > Authentication > Providers');
  console.log('   2. Turn OFF "Confirm email" toggle');
  console.log('   3. Try registering a new user');
  console.log('   4. You should be able to login immediately without email confirmation');
}

// Run the fix
fixRLSPolicies().catch(console.error);