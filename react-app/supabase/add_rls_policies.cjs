// Script to add RLS policies to Supabase tables
const SUPABASE_PROJECT_ID = 'anwwjowwrxdygqyhhckr';
const SUPABASE_ACCESS_TOKEN = 'sbp_af204878a17ac8fdfa0515351c4f0539fb26fddb';
const API_URL = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_ID}/database/query`;

const policies = [
  // Users table policies
  {
    name: 'Users - Enable insert for authenticated users',
    sql: `
      CREATE POLICY "Enable insert for authenticated users" ON public.users
      FOR INSERT WITH CHECK (auth.uid() = id);
    `
  },
  {
    name: 'Users - Enable select for users to view own data',
    sql: `
      CREATE POLICY "Enable select for users to view own data" ON public.users
      FOR SELECT USING (auth.uid() = id);
    `
  },
  {
    name: 'Users - Enable update for users to update own data',
    sql: `
      CREATE POLICY "Enable update for users to update own data" ON public.users
      FOR UPDATE USING (auth.uid() = id);
    `
  },

  // User profiles table policies
  {
    name: 'User profiles - Enable insert for authenticated users',
    sql: `
      CREATE POLICY "Enable insert for authenticated users" ON public.user_profiles
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    `
  },
  {
    name: 'User profiles - Enable select for users to view own data',
    sql: `
      CREATE POLICY "Enable select for users to view own data" ON public.user_profiles
      FOR SELECT USING (auth.uid() = user_id);
    `
  },
  {
    name: 'User profiles - Enable update for users to update own data',
    sql: `
      CREATE POLICY "Enable update for users to update own data" ON public.user_profiles
      FOR UPDATE USING (auth.uid() = user_id);
    `
  },

  // Sidejob cards table policies
  {
    name: 'Sidejob cards - Enable insert for authenticated users',
    sql: `
      CREATE POLICY "Enable insert for authenticated users" ON public.sidejob_cards
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    `
  },
  {
    name: 'Sidejob cards - Enable select for all (public cards)',
    sql: `
      CREATE POLICY "Enable select for all" ON public.sidejob_cards
      FOR SELECT USING (true);
    `
  },
  {
    name: 'Sidejob cards - Enable update for card owners',
    sql: `
      CREATE POLICY "Enable update for card owners" ON public.sidejob_cards
      FOR UPDATE USING (auth.uid() = user_id);
    `
  },
  {
    name: 'Sidejob cards - Enable delete for card owners',
    sql: `
      CREATE POLICY "Enable delete for card owners" ON public.sidejob_cards
      FOR DELETE USING (auth.uid() = user_id);
    `
  },

  // Visitor stats table policies
  {
    name: 'Visitor stats - Enable insert for all',
    sql: `
      CREATE POLICY "Enable insert for all" ON public.visitor_stats
      FOR INSERT WITH CHECK (true);
    `
  },
  {
    name: 'Visitor stats - Enable select for data owners',
    sql: `
      CREATE POLICY "Enable select for data owners" ON public.visitor_stats
      FOR SELECT USING (auth.uid() = user_id);
    `
  },

  // Callback logs table policies
  {
    name: 'Callback logs - Enable insert for authenticated users',
    sql: `
      CREATE POLICY "Enable insert for authenticated users" ON public.callback_logs
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    `
  },
  {
    name: 'Callback logs - Enable select for data owners',
    sql: `
      CREATE POLICY "Enable select for data owners" ON public.callback_logs
      FOR SELECT USING (auth.uid() = user_id);
    `
  }
];

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

async function addPolicies() {
  console.log('🔐 Adding RLS Policies to Supabase tables...\n');
  console.log('=' .repeat(50));

  let successCount = 0;
  let errorCount = 0;

  for (const policy of policies) {
    process.stdout.write(`📝 ${policy.name}... `);

    try {
      const { status, result } = await executeSQL(policy.sql);

      if (status === 200 || status === 201) {
        console.log('✅');
        successCount++;
      } else {
        // Check if policy already exists
        if (result.includes('already exists')) {
          console.log('⏭️  (Already exists)');
          successCount++;
        } else {
          console.log(`❌ (Status: ${status})`);
          console.log(`   Error: ${result}`);
          errorCount++;
        }
      }
    } catch (error) {
      console.log('❌');
      console.log(`   Error: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('📊 SUMMARY');
  console.log('=' .repeat(50));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📈 Total: ${policies.length}`);

  if (errorCount === 0) {
    console.log('\n🎉 All RLS policies added successfully!');
  } else {
    console.log('\n⚠️  Some policies failed to add. Check the errors above.');
  }
}

// Run the script
addPolicies().catch(console.error);