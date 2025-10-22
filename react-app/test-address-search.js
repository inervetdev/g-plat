// Test script for naver-geocode Edge Function
// Run with: node test-address-search.js
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'your_supabase_url'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key'

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables. Create a .env file with:')
  console.error('   VITE_SUPABASE_URL=your_url')
  console.error('   VITE_SUPABASE_ANON_KEY=your_key')
  process.exit(1)
}

async function testAddressSearch(query) {
  console.log(`\n🔍 Testing address search: "${query}"`)
  console.log('━'.repeat(60))

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/naver-geocode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ query })
    })

    console.log(`📡 Status: ${response.status} ${response.statusText}`)

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Error:', data)
      return
    }

    if (data.addresses && data.addresses.length > 0) {
      console.log(`✅ Found ${data.addresses.length} result(s):\n`)
      data.addresses.forEach((addr, index) => {
        console.log(`${index + 1}. 도로명: ${addr.roadAddress}`)
        console.log(`   지번: ${addr.jibunAddress}`)
        console.log(`   영문: ${addr.englishAddress}`)
        console.log(`   좌표: (${addr.x}, ${addr.y})`)
        console.log()
      })
    } else {
      console.log('⚠️  No results found')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Run tests
async function runTests() {
  await testAddressSearch('서울시 강남구 테헤란로 123')
  await testAddressSearch('청초로 66')
  await testAddressSearch('판교역로 235')
  await testAddressSearch('존재하지않는주소12345')
}

runTests()
