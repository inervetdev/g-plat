// Script to verify Supabase schema creation
const SUPABASE_PROJECT_ID = 'anwwjowwrxdygqyhhckr';
const SUPABASE_ACCESS_TOKEN = 'sbp_af204878a17ac8fdfa0515351c4f0539fb26fddb';
const API_URL = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_ID}/database/query`;

const verificationQueries = [
  {
    name: "Tables",
    query: `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `
  },
  {
    name: "Types",
    query: `
      SELECT typname
      FROM pg_type
      WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND typtype = 'e'
      ORDER BY typname;
    `
  },
  {
    name: "Indexes",
    query: `
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY indexname;
    `
  },
  {
    name: "Triggers",
    query: `
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name;
    `
  },
  {
    name: "RLS Status",
    query: `
      SELECT tablename,
             CASE WHEN rowsecurity = true THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `
  },
  {
    name: "Table Columns",
    query: `
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
      LIMIT 30;
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

  if (response.ok) {
    return await response.json();
  } else {
    const error = await response.text();
    throw new Error(`Failed to execute query: ${error}`);
  }
}

async function verifySchema() {
  console.log('🔍 Verifying Supabase Database Schema\n');
  console.log('=' .repeat(50));

  const results = {};

  for (const verification of verificationQueries) {
    console.log(`\n📊 ${verification.name}`);
    console.log('-'.repeat(30));

    try {
      const result = await executeSQL(verification.query);
      results[verification.name] = result;

      if (Array.isArray(result) && result.length > 0) {
        if (verification.name === "Tables") {
          console.log('✅ Tables created:');
          result.forEach(row => console.log(`   - ${row.table_name}`));
        } else if (verification.name === "Types") {
          console.log('✅ Custom types:');
          result.forEach(row => console.log(`   - ${row.typname}`));
        } else if (verification.name === "Indexes") {
          console.log('✅ Indexes created:');
          result.forEach(row => console.log(`   - ${row.indexname}`));
        } else if (verification.name === "Triggers") {
          console.log('✅ Triggers:');
          result.forEach(row => console.log(`   - ${row.trigger_name} on ${row.event_object_table}`));
        } else if (verification.name === "RLS Status") {
          console.log('✅ Row Level Security:');
          result.forEach(row => console.log(`   - ${row.tablename}: ${row.rls_status}`));
        } else if (verification.name === "Table Columns") {
          console.log('✅ Sample columns (first 30):');
          let currentTable = '';
          result.forEach(row => {
            if (currentTable !== row.table_name) {
              currentTable = row.table_name;
              console.log(`\n   Table: ${currentTable}`);
            }
            const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
            console.log(`     - ${row.column_name}: ${row.data_type} ${nullable}`);
          });
        }
      } else {
        console.log('⚠️  No results found');
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📈 VERIFICATION SUMMARY');
  console.log('='.repeat(50));

  const tables = results['Tables'] || [];
  const expectedTables = ['users', 'user_profiles', 'sidejob_cards', 'visitor_stats', 'callback_logs'];
  const createdTables = tables.map(t => t.table_name);

  console.log('\n✅ Created Tables:');
  expectedTables.forEach(table => {
    if (createdTables.includes(table)) {
      console.log(`   ✓ ${table}`);
    } else {
      console.log(`   ✗ ${table} - MISSING`);
    }
  });

  const types = results['Types'] || [];
  const expectedTypes = ['callback_status', 'subscription_tier'];
  const createdTypes = types.map(t => t.typname);

  console.log('\n✅ Created Types:');
  expectedTypes.forEach(type => {
    if (createdTypes.includes(type)) {
      console.log(`   ✓ ${type}`);
    } else {
      console.log(`   ✗ ${type} - MISSING`);
    }
  });

  const successRate = ((createdTables.length + createdTypes.length) /
                      (expectedTables.length + expectedTypes.length) * 100).toFixed(1);

  console.log(`\n🎯 Success Rate: ${successRate}%`);
  console.log('=' .repeat(50));
}

// Run verification
verifySchema().catch(console.error);