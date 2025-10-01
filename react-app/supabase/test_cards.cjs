// Test business cards functionality
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://anwwjowwrxdygqyhhckr.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3dqb3d3cnhkeWdxeWhoY2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODg0OTUsImV4cCI6MjA3NDU2NDQ5NX0.uKtcf8jpHuY6JYb2i3bKhmCayvecc4Ezf6go5Luh5gs';

async function testCards() {
  const supabase = createClient(SUPABASE_URL, ANON_KEY);

  console.log('🔍 Testing Business Cards\n');
  console.log('=' .repeat(50));

  try {
    // 1. Check if table exists
    console.log('\n📋 Checking business_cards table...');
    const { data: cards, error: cardsError } = await supabase
      .from('business_cards')
      .select('id, user_id, name, theme, is_primary, is_active, created_at')
      .limit(5);

    if (cardsError) {
      console.log('   ❌ Table error:', cardsError.message);
      console.log('\n💡 Please run the SQL script in Supabase Dashboard first!');
      return;
    }

    console.log('   ✅ Table exists!');

    if (cards && cards.length > 0) {
      console.log(`   📊 Found ${cards.length} card(s):\n`);
      cards.forEach((card, index) => {
        console.log(`   Card ${index + 1}:`);
        console.log(`   - ID: ${card.id}`);
        console.log(`   - Name: ${card.name}`);
        console.log(`   - Theme: ${card.theme}`);
        console.log(`   - Primary: ${card.is_primary ? '✅' : '❌'}`);
        console.log(`   - Active: ${card.is_active ? '✅' : '❌'}`);
        console.log(`   - Created: ${new Date(card.created_at).toLocaleString()}\n`);
      });
    } else {
      console.log('   ℹ️  No cards found yet');
    }

    // 2. Test theme distribution
    console.log('\n🎨 Theme Distribution:');
    const themes = ['trendy', 'apple', 'professional', 'simple'];

    for (const theme of themes) {
      const { count } = await supabase
        .from('business_cards')
        .select('*', { count: 'exact', head: true })
        .eq('theme', theme)
        .eq('is_active', true);

      console.log(`   ${theme}: ${count || 0} cards`);
    }

    // 3. Check users with cards
    console.log('\n👥 Users with Business Cards:');
    const { data: users } = await supabase
      .from('business_cards')
      .select('user_id')
      .eq('is_active', true);

    if (users && users.length > 0) {
      const uniqueUsers = [...new Set(users.map(u => u.user_id))];
      console.log(`   Total users with cards: ${uniqueUsers.length}`);
    } else {
      console.log('   No users with cards yet');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('\n💡 Tips:');
  console.log('   1. Create a card at: /create-card');
  console.log('   2. View card at: /card/{card_id}');
  console.log('   3. Change theme in Dashboard');
}

testCards().catch(console.error);