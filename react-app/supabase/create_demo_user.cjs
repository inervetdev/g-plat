// Script to create a demo user for testing
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://anwwjowwrxdygqyhhckr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3dqb3d3cnhkeWdxeWhoY2tyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODk4ODQ5NSwiZXhwIjoyMDc0NTY0NDk1fQ.TRY8xN2wxBj4eTFHnPJ0c3RQMJl5Pp5VKrm1VGzgJ84';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createDemoUser() {
  console.log('🎭 Creating Demo User for Testing\n');
  console.log('=' .repeat(50));

  // Demo user ID (using a fixed UUID for testing)
  const demoUserId = 'demo-user-' + Date.now();

  try {
    // Step 1: Create user in users table
    console.log('📌 Step 1: Creating user in users table...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: demoUserId,
        email: 'demo@gplat.com',
        name: '김대리',
        phone: '010-1234-5678',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      console.log('   ❌ Error creating user:', userError.message);

      // Try to get existing demo user
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'demo@gplat.com')
        .single();

      if (existingUser) {
        console.log('   ✅ Using existing demo user');
        console.log(`   User ID: ${existingUser.id}`);
        console.log(`\n🔗 View demo card at:`);
        console.log(`   http://localhost:5175/card/${existingUser.id}\n`);
        return existingUser.id;
      }
      return;
    }

    console.log('   ✅ User created successfully');
    console.log(`   User ID: ${demoUserId}`);

    // Step 2: Create user profile
    console.log('\n📌 Step 2: Creating user profile...');
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: demoUserId,
        title: 'Full Stack Developer',
        company: 'G-PLAT Tech',
        introduction: '안녕하세요! 풀스택 개발자 김대리입니다. React, Node.js, TypeScript를 주로 사용하며, 모바일 명함 서비스를 개발하고 있습니다.',
        services: ['웹 개발', '앱 개발', 'UI/UX 디자인', '기술 컨설팅'],
        website: 'https://gplat.com',
        theme: 'trendy',
        created_at: new Date().toISOString()
      });

    if (profileError) {
      console.log('   ⚠️  Profile creation failed:', profileError.message);
    } else {
      console.log('   ✅ Profile created successfully');
    }

    // Step 3: Add some sample sidejob cards
    console.log('\n📌 Step 3: Creating sample sidejob cards...');
    const sideJobs = [
      {
        user_id: demoUserId,
        card_name: '프리랜스 개발',
        service_type: '웹/앱 개발',
        description: 'React, Vue, Node.js를 활용한 웹 애플리케이션 개발',
        contact_info: { email: 'dev@gplat.com', phone: '010-1234-5678' },
        is_active: true
      },
      {
        user_id: demoUserId,
        card_name: '기술 멘토링',
        service_type: '교육/컨설팅',
        description: '주니어 개발자를 위한 1:1 멘토링 서비스',
        contact_info: { email: 'mentor@gplat.com', phone: '010-1234-5678' },
        is_active: true
      }
    ];

    for (const job of sideJobs) {
      const { error } = await supabase
        .from('sidejob_cards')
        .insert(job);

      if (error) {
        console.log(`   ⚠️  Failed to create sidejob: ${job.card_name}`);
      } else {
        console.log(`   ✅ Created sidejob: ${job.card_name}`);
      }
    }

    console.log('\n' + '=' .repeat(50));
    console.log('✅ Demo user setup complete!\n');
    console.log('📋 Demo User Details:');
    console.log('   Name: 김대리');
    console.log('   Email: demo@gplat.com');
    console.log('   Phone: 010-1234-5678');
    console.log('   Theme: Trendy (Dark mode with animations)');
    console.log(`\n🔗 View demo card at:`);
    console.log(`   http://localhost:5175/card/${demoUserId}\n`);
    console.log('💡 You can also:');
    console.log('   1. Login to dashboard with this user');
    console.log('   2. Change themes in the dashboard');
    console.log('   3. Edit profile information');

    return demoUserId;
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the setup
createDemoUser().catch(console.error);