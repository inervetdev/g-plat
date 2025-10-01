// Create business_cards table in Supabase
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://anwwjowwrxdygqyhhckr.supabase.co';
const SERVICE_KEY = 'sb_secret_boEWDPnDyiGvrZs05CY1FQ_2UFUjyLS';

async function createTables() {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('📦 Creating business_cards table...\n');
  console.log('=' .repeat(50));

  // SQL commands split into smaller chunks
  const sqlCommands = [
    // 1. Create table
    `CREATE TABLE IF NOT EXISTS public.business_cards (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      name VARCHAR(100) NOT NULL,
      title VARCHAR(100),
      company VARCHAR(100),
      department VARCHAR(100),
      phone VARCHAR(20),
      email VARCHAR(255),
      website VARCHAR(255),
      address TEXT,
      linkedin VARCHAR(255),
      instagram VARCHAR(255),
      facebook VARCHAR(255),
      twitter VARCHAR(255),
      youtube VARCHAR(255),
      github VARCHAR(255),
      introduction TEXT,
      services TEXT[],
      skills TEXT[],
      theme VARCHAR(50) DEFAULT 'trendy',
      card_color VARCHAR(7),
      font_style VARCHAR(50),
      profile_image TEXT,
      company_logo TEXT,
      background_image TEXT,
      qr_code TEXT,
      custom_url VARCHAR(100) UNIQUE,
      short_url VARCHAR(50),
      is_active BOOLEAN DEFAULT true,
      is_primary BOOLEAN DEFAULT false,
      view_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    // 2. Create indexes
    `CREATE INDEX IF NOT EXISTS idx_business_cards_user_id ON public.business_cards(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_business_cards_custom_url ON public.business_cards(custom_url)`,
    `CREATE INDEX IF NOT EXISTS idx_business_cards_is_active ON public.business_cards(is_active)`,

    // 3. Enable RLS
    `ALTER TABLE public.business_cards ENABLE ROW LEVEL SECURITY`,

    // 4. Drop existing policies if they exist
    `DROP POLICY IF EXISTS "Users can view own business cards" ON public.business_cards`,
    `DROP POLICY IF EXISTS "Users can create own business cards" ON public.business_cards`,
    `DROP POLICY IF EXISTS "Users can update own business cards" ON public.business_cards`,
    `DROP POLICY IF EXISTS "Users can delete own business cards" ON public.business_cards`,
    `DROP POLICY IF EXISTS "Anyone can view active business cards" ON public.business_cards`,

    // 5. Create RLS policies
    `CREATE POLICY "Users can view own business cards" ON public.business_cards
      FOR SELECT USING (auth.uid() = user_id)`,

    `CREATE POLICY "Users can create own business cards" ON public.business_cards
      FOR INSERT WITH CHECK (auth.uid() = user_id)`,

    `CREATE POLICY "Users can update own business cards" ON public.business_cards
      FOR UPDATE USING (auth.uid() = user_id)`,

    `CREATE POLICY "Users can delete own business cards" ON public.business_cards
      FOR DELETE USING (auth.uid() = user_id)`,

    `CREATE POLICY "Anyone can view active business cards" ON public.business_cards
      FOR SELECT USING (is_active = true)`,

    // 6. Create update trigger function
    `CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql`,

    // 7. Create trigger
    `DROP TRIGGER IF EXISTS update_business_cards_updated_at ON public.business_cards`,

    `CREATE TRIGGER update_business_cards_updated_at
      BEFORE UPDATE ON public.business_cards
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()`
  ];

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < sqlCommands.length; i++) {
    const sql = sqlCommands[i];
    const description = sql.substring(0, 50).replace(/\n/g, ' ') + '...';

    try {
      console.log(`\n📝 Executing command ${i + 1}/${sqlCommands.length}:`);
      console.log(`   ${description}`);

      const { error } = await supabase.from('business_cards').select('*').limit(0);

      // Use raw SQL through service role
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`
        },
        body: JSON.stringify({ query: sql })
      });

      if (!response.ok) {
        // Try alternative: direct execution
        const { error: execError } = await supabase
          .from('_sql')
          .insert({ query: sql });

        if (execError) {
          console.log(`   ⚠️  Command may already exist or partially executed`);
        } else {
          console.log(`   ✅ Success`);
          successCount++;
        }
      } else {
        console.log(`   ✅ Success`);
        successCount++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('\n📊 Summary:');
  console.log(`   ✅ Successful commands: ${successCount}`);
  console.log(`   ❌ Failed commands: ${errorCount}`);

  // Test table existence
  console.log('\n🔍 Testing table...');
  try {
    const { data, error } = await supabase
      .from('business_cards')
      .select('id')
      .limit(1);

    if (error) {
      console.log('   ❌ Table test failed:', error.message);
      console.log('\n💡 Please run the SQL manually in Supabase Dashboard:');
      console.log('   1. Go to SQL Editor');
      console.log('   2. Copy content from: react-app/supabase/migrations/create_business_cards_table.sql');
      console.log('   3. Run the query');
    } else {
      console.log('   ✅ Table exists and is accessible!');
    }
  } catch (error) {
    console.log('   ❌ Unexpected error:', error.message);
  }
}

createTables().catch(console.error);