import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Use anon key for basic query
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your_supabase_url'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key'

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables. Create a .env file with:')
  console.error('   VITE_SUPABASE_URL=your_url')
  console.error('   VITE_SUPABASE_ANON_KEY=your_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkSchema() {
  console.log('🔍 Checking production database schema...\n')

  try {
    // Try to select latitude and longitude
    const { data, error } = await supabase
      .from('business_cards')
      .select('id, name, latitude, longitude')
      .limit(1)

    if (error) {
      if (error.message.includes('column') && (error.message.includes('latitude') || error.message.includes('longitude'))) {
        console.log('❌ Columns DO NOT exist in production database')
        console.log('Error:', error.message)
        console.log('\n📝 You need to run this SQL in Supabase Dashboard:')
        console.log('   https://supabase.com/dashboard/project/anwwjowwrxdygqyhhckr/sql/new\n')
        console.log('ALTER TABLE public.business_cards')
        console.log('ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,')
        console.log('ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;')
        console.log('\nCREATE INDEX IF NOT EXISTS idx_business_cards_location')
        console.log('ON public.business_cards(latitude, longitude)')
        console.log('WHERE latitude IS NOT NULL AND longitude IS NOT NULL;')
      } else {
        console.error('❌ Error:', error.message)
      }
    } else {
      console.log('✅ Columns exist in production database!')
      console.log('Sample data:', data)
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

checkSchema()
