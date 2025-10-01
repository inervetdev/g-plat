// Script to create demo data using Management API
const SUPABASE_PROJECT_ID = 'anwwjowwrxdygqyhhckr';
const SUPABASE_ACCESS_TOKEN = 'sbp_af204878a17ac8fdfa0515351c4f0539fb26fddb';
const API_URL = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_ID}/database/query`;

async function executeSQL(query) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  const result = await response.text();
  return { status: response.status, result };
}

async function createDemoData() {
  console.log('🎭 Creating Demo Data\n');
  console.log('=' .repeat(50));

  const demoUserId = 'demo-' + Date.now();

  // Step 1: Temporarily disable RLS
  console.log('📌 Step 1: Temporarily disabling RLS...');
  await executeSQL('ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;');
  await executeSQL('ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;');
  await executeSQL('ALTER TABLE public.sidejob_cards DISABLE ROW LEVEL SECURITY;');
  console.log('   ✅ RLS disabled');

  // Step 2: Create demo user
  console.log('\n📌 Step 2: Creating demo user...');
  const userQuery = `
    INSERT INTO public.users (id, email, name, phone, created_at)
    VALUES (
      '${demoUserId}',
      'demo@gplat.com',
      '김대리',
      '010-1234-5678',
      NOW()
    )
    ON CONFLICT (email) DO UPDATE
    SET name = EXCLUDED.name
    RETURNING id;
  `;

  const { status: userStatus, result: userResult } = await executeSQL(userQuery);
  if (userStatus === 200 || userStatus === 201) {
    console.log('   ✅ Demo user created');

    // Try to extract the user ID from result
    try {
      const data = JSON.parse(userResult);
      if (data && data[0] && data[0].id) {
        const actualUserId = data[0].id;
        console.log(`   User ID: ${actualUserId}`);

        // Step 3: Create user profile
        console.log('\n📌 Step 3: Creating user profile...');
        const profileQuery = `
          INSERT INTO public.user_profiles (
            user_id, title, company, introduction, services, website, theme, created_at
          )
          VALUES (
            '${actualUserId}',
            'Full Stack Developer',
            'G-PLAT Tech',
            '안녕하세요! 풀스택 개발자 김대리입니다. React, Node.js, TypeScript를 주로 사용하며, 모바일 명함 서비스를 개발하고 있습니다.',
            ARRAY['웹 개발', '앱 개발', 'UI/UX 디자인', '기술 컨설팅'],
            'https://gplat.com',
            'trendy',
            NOW()
          )
          ON CONFLICT (user_id) DO UPDATE
          SET
            theme = 'trendy',
            title = EXCLUDED.title,
            company = EXCLUDED.company;
        `;

        const { status: profileStatus } = await executeSQL(profileQuery);
        if (profileStatus === 200 || profileStatus === 201) {
          console.log('   ✅ Profile created');
        }

        // Step 4: Create sidejob cards
        console.log('\n📌 Step 4: Creating sidejob cards...');
        const sidejobQuery = `
          INSERT INTO public.sidejob_cards (
            user_id, card_name, service_type, description, is_active, created_at
          )
          VALUES
          (
            '${actualUserId}',
            '프리랜스 개발',
            '웹/앱 개발',
            'React, Vue, Node.js를 활용한 웹 애플리케이션 개발',
            true,
            NOW()
          ),
          (
            '${actualUserId}',
            '기술 멘토링',
            '교육/컨설팅',
            '주니어 개발자를 위한 1:1 멘토링 서비스',
            true,
            NOW()
          )
          ON CONFLICT DO NOTHING;
        `;

        await executeSQL(sidejobQuery);
        console.log('   ✅ Sidejob cards created');

        console.log('\n' + '=' .repeat(50));
        console.log('✅ Demo data setup complete!\n');
        console.log('🔗 View demo card at:');
        console.log(`   http://localhost:5175/card/${actualUserId}\n`);
      }
    } catch (e) {
      console.log('   ✅ Demo user created with ID:', demoUserId);
      console.log('\n🔗 View demo card at:');
      console.log(`   http://localhost:5175/card/${demoUserId}`);
    }
  }

  // Step 5: Re-enable RLS
  console.log('\n📌 Step 5: Re-enabling RLS...');
  await executeSQL('ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;');
  await executeSQL('ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;');
  await executeSQL('ALTER TABLE public.sidejob_cards ENABLE ROW LEVEL SECURITY;');
  console.log('   ✅ RLS re-enabled');

  // Step 6: Get the actual user ID
  console.log('\n📌 Step 6: Getting demo user details...');
  const checkQuery = `
    SELECT id, email, name FROM public.users
    WHERE email = 'demo@gplat.com'
    LIMIT 1;
  `;

  const { status: checkStatus, result: checkResult } = await executeSQL(checkQuery);
  if (checkStatus === 200) {
    try {
      const users = JSON.parse(checkResult);
      if (users && users[0]) {
        console.log('\n📋 Demo User Details:');
        console.log(`   ID: ${users[0].id}`);
        console.log(`   Name: ${users[0].name}`);
        console.log(`   Email: ${users[0].email}`);
        console.log('\n🔗 View card at:');
        console.log(`   http://localhost:5175/card/${users[0].id}`);
      }
    } catch (e) {
      // Silent fail
    }
  }
}

// Run the setup
createDemoData().catch(console.error);