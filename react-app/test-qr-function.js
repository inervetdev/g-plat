// Test script for QR redirect Edge Function

const SUPABASE_URL = 'http://127.0.0.1:54321';
const ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

async function setupTestData() {
  console.log('🔧 Setting up test data...\n');

  // Create a test user first
  const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
    },
    body: JSON.stringify({
      email: 'test@gplat.com',
      password: 'test123456',
      data: {
        name: 'Test User'
      }
    })
  });

  const authData = await authResponse.json();
  console.log('Auth response:', authData);

  if (authData.access_token) {
    // Insert test QR codes
    const qrResponse = await fetch(`${SUPABASE_URL}/rest/v1/qr_codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${authData.access_token}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify([
        {
          user_id: authData.user.id,
          short_code: 'test123',
          target_url: 'https://g-plat.com',
          target_type: 'static',
          campaign: 'test',
          is_active: true
        },
        {
          user_id: authData.user.id,
          short_code: 'dynamic1',
          target_url: 'https://g-plat.com/dashboard',
          target_type: 'dynamic',
          campaign: 'social_media',
          is_active: true
        },
        {
          user_id: authData.user.id,
          short_code: 'inactive1',
          target_url: 'https://g-plat.com',
          target_type: 'static',
          campaign: 'test',
          is_active: false
        }
      ])
    });

    const qrData = await qrResponse.json();
    console.log('✅ Test QR codes created:', qrData);
    console.log('\n');
  }
}

async function testEdgeFunction() {
  console.log('🧪 Testing Edge Function...\n');

  // Test 1: Valid QR code (should redirect)
  console.log('Test 1: Valid QR code redirect');
  try {
    const response1 = await fetch(`${SUPABASE_URL}/functions/v1/qr-redirect/test123`, {
      method: 'GET',
      redirect: 'manual'
    });
    console.log('  Status:', response1.status);
    console.log('  Location:', response1.headers.get('Location'));
    console.log('  ✅ PASSED\n');
  } catch (error) {
    console.log('  ❌ FAILED:', error.message, '\n');
  }

  // Test 2: Invalid QR code (should return 404)
  console.log('Test 2: Invalid QR code');
  try {
    const response2 = await fetch(`${SUPABASE_URL}/functions/v1/qr-redirect/invalid999`, {
      method: 'GET'
    });
    const data2 = await response2.json();
    console.log('  Status:', response2.status);
    console.log('  Response:', data2);
    console.log(response2.status === 404 ? '  ✅ PASSED\n' : '  ❌ FAILED\n');
  } catch (error) {
    console.log('  ❌ FAILED:', error.message, '\n');
  }

  // Test 3: Inactive QR code (should return 404)
  console.log('Test 3: Inactive QR code');
  try {
    const response3 = await fetch(`${SUPABASE_URL}/functions/v1/qr-redirect/inactive1`, {
      method: 'GET'
    });
    const data3 = await response3.json();
    console.log('  Status:', response3.status);
    console.log('  Response:', data3);
    console.log(response3.status === 404 ? '  ✅ PASSED\n' : '  ❌ FAILED\n');
  } catch (error) {
    console.log('  ❌ FAILED:', error.message, '\n');
  }

  // Test 4: Dynamic routing
  console.log('Test 4: Dynamic routing QR code');
  try {
    const response4 = await fetch(`${SUPABASE_URL}/functions/v1/qr-redirect/dynamic1`, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) Mobile'
      }
    });
    console.log('  Status:', response4.status);
    console.log('  Location:', response4.headers.get('Location'));
    console.log('  ✅ PASSED\n');
  } catch (error) {
    console.log('  ❌ FAILED:', error.message, '\n');
  }

  // Test 5: Missing short code
  console.log('Test 5: Missing short code');
  try {
    const response5 = await fetch(`${SUPABASE_URL}/functions/v1/qr-redirect/`, {
      method: 'GET'
    });
    const data5 = await response5.json();
    console.log('  Status:', response5.status);
    console.log('  Response:', data5);
    console.log(response5.status === 400 ? '  ✅ PASSED\n' : '  ❌ FAILED\n');
  } catch (error) {
    console.log('  ❌ FAILED:', error.message, '\n');
  }

  console.log('✅ All tests completed!');
}

// Run tests
async function main() {
  console.log('═══════════════════════════════════════');
  console.log('QR Redirect Edge Function Test Suite');
  console.log('═══════════════════════════════════════\n');

  await setupTestData();
  await testEdgeFunction();
}

main().catch(console.error);
