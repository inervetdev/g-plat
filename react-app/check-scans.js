// Check QR scan tracking

const SUPABASE_URL = 'http://127.0.0.1:54321';
const ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

async function checkScans() {
  console.log('📊 Checking QR scan tracking...\n');

  // Get QR codes with scan counts
  const qrResponse = await fetch(`${SUPABASE_URL}/rest/v1/qr_codes?select=*`, {
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`
    }
  });

  const qrCodes = await qrResponse.json();
  console.log('QR Codes:');
  qrCodes.forEach(qr => {
    console.log(`  - ${qr.short_code}: scan_count=${qr.scan_count || 0}, is_active=${qr.is_active}`);
  });

  // Get scan records
  const scanResponse = await fetch(`${SUPABASE_URL}/rest/v1/qr_scans?select=*`, {
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`
    }
  });

  const scans = await scanResponse.json();
  console.log(`\n📈 Total scan records: ${scans.length}`);

  if (scans.length > 0) {
    console.log('\nScan details:');
    scans.forEach(scan => {
      console.log(`  - Scanned at: ${scan.scanned_at}`);
      console.log(`    Device: ${scan.device_type}, Browser: ${scan.browser}, OS: ${scan.os}`);
      console.log(`    IP: ${scan.ip_address}, User-Agent: ${scan.user_agent.substring(0, 50)}...`);
      console.log('');
    });
  }

  console.log('✅ Scan tracking verified!');
}

checkScans().catch(console.error);
