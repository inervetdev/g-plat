// Apply location columns to production database
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://anwwjowwrxdygqyhhckr.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3dqb3d3cnhkeWdxeWhoY2tyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMzcwODQ2MywiZXhwIjoyMDE5Mjg0NDYzfQ.bSYqrYhkQz7hbCVOEbkqiC8fDVKW9x7wZOzJdXg0C6o'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applySchema() {
  console.log('🔧 Applying location columns to business_cards table...')

  const sql = `
    -- Add latitude and longitude columns to business_cards table
    ALTER TABLE public.business_cards
    ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

    -- Add index for location-based queries
    CREATE INDEX IF NOT EXISTS idx_business_cards_location
    ON public.business_cards(latitude, longitude)
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

    -- Add comments
    COMMENT ON COLUMN public.business_cards.latitude IS '위도 (카카오 맵)';
    COMMENT ON COLUMN public.business_cards.longitude IS '경도 (카카오 맵)';
  `

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

  if (error) {
    console.error('❌ Error:', error.message)

    // Try alternative approach - using individual queries
    console.log('Trying individual queries...')

    const queries = [
      'ALTER TABLE public.business_cards ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION',
      'ALTER TABLE public.business_cards ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION',
      'CREATE INDEX IF NOT EXISTS idx_business_cards_location ON public.business_cards(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL',
      "COMMENT ON COLUMN public.business_cards.latitude IS '위도 (카카오 맵)'",
      "COMMENT ON COLUMN public.business_cards.longitude IS '경도 (카카오 맵)'"
    ]

    for (const query of queries) {
      console.log(`Executing: ${query.substring(0, 60)}...`)
      const { error: queryError } = await supabase.rpc('exec_sql', { sql_query: query })
      if (queryError) {
        console.error(`  ❌ Error: ${queryError.message}`)
      } else {
        console.log('  ✅ Success')
      }
    }
  } else {
    console.log('✅ Schema updated successfully!')
    console.log('Data:', data)
  }

  // Verify columns exist
  console.log('\n🔍 Verifying columns...')
  const { data: columns, error: verifyError } = await supabase
    .from('business_cards')
    .select('*')
    .limit(1)

  if (verifyError) {
    console.error('❌ Verification error:', verifyError.message)
  } else {
    console.log('✅ Verification successful')
    if (columns && columns.length > 0) {
      const card = columns[0]
      console.log('Available columns:', Object.keys(card))
      console.log('Has latitude?', 'latitude' in card)
      console.log('Has longitude?', 'longitude' in card)
    }
  }
}

applySchema()
