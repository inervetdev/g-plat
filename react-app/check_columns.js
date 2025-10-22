// Check if location columns exist in production database
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your_supabase_url'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key'

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables. Create a .env file with:')
  console.error('   VITE_SUPABASE_URL=your_url')
  console.error('   VITE_SUPABASE_ANON_KEY=your_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkColumns() {
  console.log('🔍 Checking business_cards table columns...')

  const { data, error } = await supabase
    .from('business_cards')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  if (data && data.length > 0) {
    const columns = Object.keys(data[0])
    console.log('\n📋 Available columns:', columns)
    console.log('\n✅ Has latitude?', columns.includes('latitude'))
    console.log('✅ Has longitude?', columns.includes('longitude'))
  } else {
    console.log('⚠️  No cards found in database')
  }
}

checkColumns()
