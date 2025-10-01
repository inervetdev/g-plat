// Script to check and fix Supabase Auth settings
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

async function checkAuthSettings() {
  console.log('🔍 Checking Supabase Auth Settings\n');
  console.log('=' .repeat(50));

  // 1. Check auth.users table
  console.log('\n📊 Auth Users:');
  const usersQuery = `
    SELECT id, email, email_confirmed_at, created_at, last_sign_in_at
    FROM auth.users
    ORDER BY created_at DESC
    LIMIT 10
  `;

  try {
    const { status, result } = await executeSQL(usersQuery);
    if (status === 200) {
      const users = JSON.parse(result);
      if (users.length === 0) {
        console.log('   No users found in auth.users');
      } else {
        users.forEach(user => {
          console.log(`   - ${user.email}`);
          console.log(`     ID: ${user.id}`);
          console.log(`     Confirmed: ${user.email_confirmed_at ? '✅' : '❌'}`);
          console.log(`     Created: ${new Date(user.created_at).toLocaleString()}`);
          console.log('');
        });
      }
    }
  } catch (error) {
    console.error('Error fetching users:', error.message);
  }

  // 2. Check public.users table
  console.log('\n📊 Public Users Table:');
  const publicUsersQuery = `
    SELECT id, email, name, created_at
    FROM public.users
    ORDER BY created_at DESC
    LIMIT 10
  `;

  try {
    const { status, result } = await executeSQL(publicUsersQuery);
    if (status === 200) {
      const users = JSON.parse(result);
      if (users.length === 0) {
        console.log('   No users found in public.users');
      } else {
        users.forEach(user => {
          console.log(`   - ${user.email} (${user.name})`);
        });
      }
    }
  } catch (error) {
    console.error('Error fetching public users:', error.message);
  }

  // 3. Check RLS policies
  console.log('\n🔐 RLS Policies Status:');
  const policiesQuery = `
    SELECT schemaname, tablename, policyname, permissive, roles, cmd
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname
  `;

  try {
    const { status, result } = await executeSQL(policiesQuery);
    if (status === 200) {
      const policies = JSON.parse(result);
      const tables = [...new Set(policies.map(p => p.tablename))];

      tables.forEach(table => {
        const tablePolicies = policies.filter(p => p.tablename === table);
        console.log(`\n   Table: ${table}`);
        tablePolicies.forEach(policy => {
          console.log(`     - ${policy.policyname} (${policy.cmd})`);
        });
      });
    }
  } catch (error) {
    console.error('Error fetching policies:', error.message);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('💡 RECOMMENDATIONS:\n');
  console.log('1. If email confirmation is blocking you:');
  console.log('   Go to Supabase Dashboard > Authentication > Providers > Email');
  console.log('   Toggle OFF "Confirm email" temporarily for testing\n');

  console.log('2. To manually confirm a user:');
  console.log('   Run: UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = \'your-email\';\n');

  console.log('3. If users table is empty but auth.users has data:');
  console.log('   The RLS policies might be blocking INSERT operations');
  console.log('   Try temporarily disabling RLS or adjusting policies\n');
}

// Run the check
checkAuthSettings().catch(console.error);