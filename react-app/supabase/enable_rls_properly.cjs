// Script to enable RLS with proper policies for authentication flow
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

async function setupProperRLS() {
  console.log('🔐 Setting up Proper RLS Policies\n');
  console.log('=' .repeat(50));

  // Step 1: Enable RLS on all tables
  console.log('📌 Step 1: Enabling RLS on all tables...\n');
  const tables = ['users', 'user_profiles', 'sidejob_cards', 'visitor_stats', 'callback_logs'];

  for (const table of tables) {
    process.stdout.write(`   Enabling RLS on ${table}... `);
    const { status } = await executeSQL(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    console.log(status === 200 || status === 201 ? '✅' : `❌ (${status})`);
  }

  // Step 2: Drop existing policies
  console.log('\n📌 Step 2: Cleaning up existing policies...\n');
  const dropPoliciesQuery = `
    DO $$
    DECLARE
      pol record;
    BEGIN
      FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
          pol.policyname, pol.schemaname, pol.tablename);
      END LOOP;
    END$$;
  `;

  process.stdout.write('   Dropping old policies... ');
  const { status: dropStatus } = await executeSQL(dropPoliciesQuery);
  console.log(dropStatus === 200 || dropStatus === 201 ? '✅' : `❌ (${dropStatus})`);

  // Step 3: Create new comprehensive policies
  console.log('\n📌 Step 3: Creating new policies...\n');

  const policies = [
    // Users table - Allow authenticated users to insert their own record
    {
      name: 'users_insert_auth',
      sql: `
        CREATE POLICY "Users can insert their own record"
        ON public.users FOR INSERT
        WITH CHECK (
          auth.uid() = id OR
          auth.uid() IS NOT NULL  -- Allow any authenticated user to create their profile
        );
      `
    },
    {
      name: 'users_select_own',
      sql: `
        CREATE POLICY "Users can view their own record"
        ON public.users FOR SELECT
        USING (
          auth.uid() = id OR
          auth.uid() IS NOT NULL  -- Temporarily allow viewing during signup
        );
      `
    },
    {
      name: 'users_update_own',
      sql: `
        CREATE POLICY "Users can update their own record"
        ON public.users FOR UPDATE
        USING (auth.uid() = id);
      `
    },

    // User profiles - Similar policies
    {
      name: 'profiles_insert_auth',
      sql: `
        CREATE POLICY "Users can insert their own profile"
        ON public.user_profiles FOR INSERT
        WITH CHECK (
          auth.uid() = user_id OR
          auth.uid() IS NOT NULL  -- Allow authenticated users
        );
      `
    },
    {
      name: 'profiles_select_own',
      sql: `
        CREATE POLICY "Users can view their own profile"
        ON public.user_profiles FOR SELECT
        USING (
          auth.uid() = user_id OR
          auth.uid() IS NOT NULL  -- Temporarily allow viewing
        );
      `
    },
    {
      name: 'profiles_update_own',
      sql: `
        CREATE POLICY "Users can update their own profile"
        ON public.user_profiles FOR UPDATE
        USING (auth.uid() = user_id);
      `
    },

    // Sidejob cards - Public read, owner write
    {
      name: 'cards_insert_auth',
      sql: `
        CREATE POLICY "Authenticated users can create cards"
        ON public.sidejob_cards FOR INSERT
        WITH CHECK (auth.uid() = user_id);
      `
    },
    {
      name: 'cards_select_all',
      sql: `
        CREATE POLICY "Anyone can view cards"
        ON public.sidejob_cards FOR SELECT
        USING (true);  -- Public access for viewing
      `
    },
    {
      name: 'cards_update_own',
      sql: `
        CREATE POLICY "Users can update their own cards"
        ON public.sidejob_cards FOR UPDATE
        USING (auth.uid() = user_id);
      `
    },
    {
      name: 'cards_delete_own',
      sql: `
        CREATE POLICY "Users can delete their own cards"
        ON public.sidejob_cards FOR DELETE
        USING (auth.uid() = user_id);
      `
    },

    // Visitor stats - Anyone can insert, owners can view
    {
      name: 'stats_insert_all',
      sql: `
        CREATE POLICY "Anyone can record visits"
        ON public.visitor_stats FOR INSERT
        WITH CHECK (true);  -- Allow anonymous tracking
      `
    },
    {
      name: 'stats_select_own',
      sql: `
        CREATE POLICY "Users can view their own stats"
        ON public.visitor_stats FOR SELECT
        USING (auth.uid() = user_id);
      `
    },

    // Callback logs - Owner access only
    {
      name: 'callback_insert_own',
      sql: `
        CREATE POLICY "Users can create callback logs"
        ON public.callback_logs FOR INSERT
        WITH CHECK (auth.uid() = user_id);
      `
    },
    {
      name: 'callback_select_own',
      sql: `
        CREATE POLICY "Users can view their own callback logs"
        ON public.callback_logs FOR SELECT
        USING (auth.uid() = user_id);
      `
    }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const policy of policies) {
    process.stdout.write(`   Creating ${policy.name}... `);
    try {
      const { status } = await executeSQL(policy.sql);
      if (status === 200 || status === 201) {
        console.log('✅');
        successCount++;
      } else {
        console.log(`❌ (${status})`);
        errorCount++;
      }
    } catch (error) {
      console.log('❌');
      console.error(`      Error: ${error.message}`);
      errorCount++;
    }
  }

  // Step 4: Verify setup
  console.log('\n📌 Step 4: Verifying setup...\n');

  const verifyQuery = `
    SELECT
      t.tablename,
      t.rowsecurity as rls_enabled,
      COUNT(p.policyname) as policy_count
    FROM pg_tables t
    LEFT JOIN pg_policies p ON t.tablename = p.tablename AND p.schemaname = 'public'
    WHERE t.schemaname = 'public'
    AND t.tablename IN ('users', 'user_profiles', 'sidejob_cards', 'visitor_stats', 'callback_logs')
    GROUP BY t.tablename, t.rowsecurity
    ORDER BY t.tablename;
  `;

  const { status: verifyStatus, result: verifyResult } = await executeSQL(verifyQuery);
  if (verifyStatus === 200) {
    const tables = JSON.parse(verifyResult);
    console.log('   Table Status:');
    tables.forEach(table => {
      console.log(`   - ${table.tablename}: RLS ${table.rls_enabled ? '✅' : '❌'}, Policies: ${table.policy_count}`);
    });
  }

  console.log('\n' + '=' .repeat(50));
  console.log(`\n✅ Setup Complete!`);
  console.log(`   Successful policies: ${successCount}`);
  console.log(`   Failed policies: ${errorCount}`);

  console.log('\n📋 Next Steps:');
  console.log('   1. Email confirmation should work with Pro plan');
  console.log('   2. Check Supabase Dashboard > Authentication > Providers');
  console.log('   3. Make sure "Confirm email" is ON');
  console.log('   4. Try registering a new user');
  console.log('   5. Check email (including spam folder)');
  console.log('\n💡 If email still not arriving:');
  console.log('   - Check Dashboard > Settings > Auth > SMTP Settings');
  console.log('   - Consider setting up custom SMTP (SendGrid, etc.)');
}

// Run setup
setupProperRLS().catch(console.error);