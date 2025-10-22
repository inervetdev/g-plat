// Test script for kakao-geocode Edge Function
// Run with: node test-kakao-geocode.js
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

async function testKakaoGeocode(query) {
  console.log(`\n🔍 Testing Kakao address search: "${query}"`)
  console.log('━'.repeat(70))

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/kakao-geocode`, {
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
        if (addr.buildingName) {
          console.log(`   건물명: ${addr.buildingName}`)
        }
        if (addr.zoneNo) {
          console.log(`   우편번호: ${addr.zoneNo}`)
        }
        console.log(`   좌표: (경도: ${addr.x}, 위도: ${addr.y})`)
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
  console.log('\n' + '='.repeat(70))
  console.log('🧪 Kakao Geocoding API Test Suite')
  console.log('='.repeat(70))

  // Test 1: 도로명 주소
  await testKakaoGeocode('서울시 강남구 테헤란로 123')

  // Test 2: 지번 주소
  await testKakaoGeocode('서울시 강남구 역삼동 123-45')

  // Test 3: 건물명
  await testKakaoGeocode('강남역')

  // Test 4: 짧은 주소
  await testKakaoGeocode('청초로 66')

  // Test 5: 판교
  await testKakaoGeocode('판교역로 235')

  // Test 6: 존재하지 않는 주소
  await testKakaoGeocode('존재하지않는주소12345')

  console.log('\n' + '='.repeat(70))
  console.log('✅ Test completed')
  console.log('='.repeat(70) + '\n')
}

runTests()
