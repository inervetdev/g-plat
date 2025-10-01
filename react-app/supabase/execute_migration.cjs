// Script to execute Supabase migration via API
const fs = require('fs');
const path = require('path');

const SUPABASE_PROJECT_ID = 'anwwjowwrxdygqyhhckr';
const SUPABASE_ACCESS_TOKEN = 'sbp_af204878a17ac8fdfa0515351c4f0539fb26fddb';
const API_URL = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_ID}/database/query`;

// SQL statements to execute in order
const sqlStatements = [
  // 1. Enable UUID extension
  "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";",

  // 2. Create custom types
  "DO $$ BEGIN CREATE TYPE subscription_tier AS ENUM ('FREE', 'PREMIUM', 'BUSINESS'); EXCEPTION WHEN duplicate_object THEN null; END $$;",
  "DO $$ BEGIN CREATE TYPE callback_status AS ENUM ('PENDING', 'SENT', 'FAILED'); EXCEPTION WHEN duplicate_object THEN null; END $$;",

  // 3. Create users table
  `CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    domain_name TEXT UNIQUE,
    profile_image_url TEXT,
    subscription_tier subscription_tier DEFAULT 'FREE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // 4. Create user_profiles table
  `CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    company TEXT,
    position TEXT,
    title TEXT,
    bio TEXT,
    address TEXT,
    social_links JSONB DEFAULT '{}',
    theme_settings JSONB DEFAULT '{"theme": "simple", "primaryColor": "#000000", "fontFamily": "Inter"}',
    callback_settings JSONB DEFAULT '{"enabled": false, "provider": "twilio"}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
  );`,

  // 5. Create sidejob_cards table
  `CREATE TABLE IF NOT EXISTS public.sidejob_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price TEXT,
    cta_text TEXT,
    cta_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    click_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // 6. Create visitor_stats table
  `CREATE TABLE IF NOT EXISTS public.visitor_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    visitor_ip INET,
    user_agent TEXT,
    referrer TEXT,
    page_url TEXT,
    visit_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // 7. Create callback_logs table
  `CREATE TABLE IF NOT EXISTS public.callback_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    phone_number TEXT,
    message TEXT,
    status callback_status DEFAULT 'PENDING',
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // 8. Create indexes
  "CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);",
  "CREATE INDEX IF NOT EXISTS idx_users_domain ON public.users(domain_name);",
  "CREATE INDEX IF NOT EXISTS idx_sidejob_user_active ON public.sidejob_cards(user_id, is_active);",
  "CREATE INDEX IF NOT EXISTS idx_visitor_user_date ON public.visitor_stats(user_id, visit_date);",
  "CREATE INDEX IF NOT EXISTS idx_callback_user_status ON public.callback_logs(user_id, status);",

  // 9. Create updated_at trigger function
  `CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
  END;
  $$ language 'plpgsql';`,

  // 10. Apply triggers
  "DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;",
  "CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();",

  "DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;",
  "CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();",

  "DROP TRIGGER IF EXISTS update_sidejob_cards_updated_at ON public.sidejob_cards;",
  "CREATE TRIGGER update_sidejob_cards_updated_at BEFORE UPDATE ON public.sidejob_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();",

  // 11. Enable RLS
  "ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;",
  "ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;",
  "ALTER TABLE public.sidejob_cards ENABLE ROW LEVEL SECURITY;",
  "ALTER TABLE public.visitor_stats ENABLE ROW LEVEL SECURITY;",
  "ALTER TABLE public.callback_logs ENABLE ROW LEVEL SECURITY;"
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

async function runMigration() {
  console.log('Starting Supabase migration...\n');

  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i];
    const shortSql = sql.substring(0, 50).replace(/\n/g, ' ') + '...';

    process.stdout.write(`[${i+1}/${sqlStatements.length}] Executing: ${shortSql} `);

    try {
      const { status, result } = await executeSQL(sql);
      if (status === 200 || status === 201) {
        console.log('✓');
      } else {
        console.log(`✗ (Status: ${status})`);
        console.log(`  Error: ${result}`);
      }
    } catch (error) {
      console.log('✗');
      console.log(`  Error: ${error.message}`);
    }
  }

  console.log('\nMigration complete!');
}

// Run the migration
runMigration().catch(console.error);