import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://anwwjowwrxdygqyhhckr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3dqb3d3cnhkeWdxeWhoY2tyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzY1MzY1NCwiZXhwIjoyMDQzMjI5NjU0fQ.y6lE-KvKp_iy9TELcOM6XbjCC-n6AYlTgQRVmrwJKKI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAddressDetailColumn() {
  console.log('🔍 Checking address_detail column in business_cards table...\n')
  
  const { data, error } = await supabase
    .from('business_cards')
    .select('id, name, address, address_detail, latitude, longitude')
    .limit(3)

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  console.log('✅ Query successful! Sample data:\n')
  console.log(JSON.stringify(data, null, 2))
  
  // Check if address_detail column exists
  if (data && data.length > 0) {
    const hasAddressDetail = 'address_detail' in data[0]
    console.log('\n📊 Column check:')
    console.log(`- address_detail column exists: ${hasAddressDetail ? '✅ YES' : '❌ NO'}`)
    console.log(`- Sample values:`)
    data.forEach((card, idx) => {
      console.log(`  ${idx + 1}. ${card.name}: address="${card.address}", address_detail="${card.address_detail || 'null'}"`)
    })
  }
}

checkAddressDetailColumn()
