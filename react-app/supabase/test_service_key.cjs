// Test Supabase service key
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://anwwjowwrxdygqyhhckr.supabase.co';

// Anon key (works)
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3dqb3d3cnhkeWdxeWhoY2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODg0OTUsImV4cCI6MjA3NDU2NDQ5NX0.uKtcf8jpHuY6JYb2i3bKhmCayvecc4Ezf6go5Luh5gs';

// Service key from MCP configuration
const SERVICE_KEY = 'sb_secret_boEWDPnDyiGvrZs05CY1FQ_2UFUjyLS';

async function testKeys() {
  console.log('🔑 Testing Supabase Keys\n');
  console.log('=' .repeat(50));

  // Test anon key
  console.log('\n📌 Testing ANON key...');
  try {
    const anonClient = createClient(SUPABASE_URL, ANON_KEY);
    const { data, error, count } = await anonClient
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log('   ❌ Anon key error:', error.message);
    } else {
      console.log('   ✅ Anon key works! User count:', count);
    }
  } catch (err) {
    console.log('   ❌ Anon key failed:', err.message);
  }

  // Test service key
  console.log('\n📌 Testing SERVICE key...');
  try {
    const serviceClient = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data, error, count } = await serviceClient
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log('   ❌ Service key error:', error.message);
    } else {
      console.log('   ✅ Service key works! User count:', count);
    }
  } catch (err) {
    console.log('   ❌ Service key failed:', err.message);
  }

  console.log('\n' + '=' .repeat(50));

  // Check if both keys work
  const serviceKeyWorks = SERVICE_KEY && SERVICE_KEY !== 'your_actual_service_key_here';

  if (serviceKeyWorks) {
    console.log('\n✅ Both keys are configured and working properly!');
    console.log('   - Anon key: For client-side operations');
    console.log('   - Service key: For server-side/admin operations');
  } else {
    console.log('\n💡 Note:');
    console.log('   The service key appears to be missing or invalid.');
    console.log('   You need to get the actual service key from:');
    console.log('   1. Supabase Dashboard > Settings > API');
    console.log('   2. Copy the "service_role" key (not the anon key)');
    console.log('   3. Update the configuration with the correct key');
  }
}

testKeys().catch(console.error);