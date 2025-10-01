// Setup user profile with theme
const SUPABASE_PROJECT_ID = 'anwwjowwrxdygqyhhckr';
const SUPABASE_ACCESS_TOKEN = 'sbp_af204878a17ac8fdfa0515351c4f0539fb26fddb';
const API_URL = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_ID}/database/query`;

const USER_ID = '655f9a43-3af4-4dc6-b234-6fa1049af5e1';

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

async function setupUserProfile() {
  console.log('🎨 Setting up User Profile with Trendy Theme\n');
  console.log('=' .repeat(50));

  // Create or update user profile
  const profileQuery = `
    INSERT INTO public.user_profiles (
      user_id,
      title,
      company,
      introduction,
      services,
      website,
      theme,
      created_at,
      updated_at
    )
    VALUES (
      '${USER_ID}',
      'Full Stack Developer',
      'Inervet',
      '안녕하세요! 이대섭입니다. 풀스택 개발자로 일하고 있으며, React, Node.js, TypeScript를 주로 사용합니다. 혁신적인 웹 서비스 개발에 열정을 가지고 있습니다.',
      ARRAY['웹 개발', '모바일 앱 개발', 'UI/UX 디자인', '기술 컨설팅', '시스템 아키텍처'],
      'https://inervet.com',
      'trendy',
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      title = EXCLUDED.title,
      company = EXCLUDED.company,
      introduction = EXCLUDED.introduction,
      services = EXCLUDED.services,
      website = EXCLUDED.website,
      theme = EXCLUDED.theme,
      updated_at = NOW()
    RETURNING *;
  `;

  console.log('📝 Creating/Updating user profile...');
  const { status, result } = await executeSQL(profileQuery);

  if (status === 200 || status === 201) {
    console.log('✅ Profile setup complete!');

    try {
      const data = JSON.parse(result);
      if (data && data[0]) {
        console.log('\n📋 Profile Details:');
        console.log(`   Theme: ${data[0].theme}`);
        console.log(`   Title: ${data[0].title}`);
        console.log(`   Company: ${data[0].company}`);
      }
    } catch (e) {
      // Silent
    }
  } else {
    console.log('⚠️  Profile update status:', status);
  }

  // Add some sidejob cards
  const sidejobQuery = `
    INSERT INTO public.sidejob_cards (
      user_id,
      card_name,
      service_type,
      description,
      is_active,
      created_at
    )
    VALUES
    (
      '${USER_ID}',
      '프리랜스 웹 개발',
      '웹/앱 개발',
      'React, Next.js를 활용한 웹 애플리케이션 개발. SaaS 플랫폼 구축 전문',
      true,
      NOW()
    ),
    (
      '${USER_ID}',
      'IT 컨설팅',
      '기술 자문',
      '스타트업 기술 스택 선정 및 아키텍처 설계 컨설팅',
      true,
      NOW()
    ),
    (
      '${USER_ID}',
      '개발자 멘토링',
      '교육/멘토링',
      '주니어 개발자를 위한 1:1 커리어 멘토링 및 코드 리뷰',
      true,
      NOW()
    )
    ON CONFLICT DO NOTHING;
  `;

  console.log('\n📝 Adding sidejob cards...');
  const { status: jobStatus } = await executeSQL(sidejobQuery);

  if (jobStatus === 200 || jobStatus === 201) {
    console.log('✅ Sidejob cards added!');
  }

  console.log('\n' + '=' .repeat(50));
  console.log('\n🎉 User profile setup complete!');
  console.log('\n🔗 View the card with Trendy theme at:');
  console.log(`   http://localhost:5175/card/${USER_ID}`);
  console.log('\n💡 You can also:');
  console.log('   1. Visit http://localhost:5175/demo to test all themes');
  console.log('   2. Login to dashboard to change themes');
  console.log('   3. The Trendy theme features:');
  console.log('      - Dark mode background');
  console.log('      - Neon green/cyan gradients');
  console.log('      - Animated effects');
  console.log('      - Glassmorphism design');
}

setupUserProfile().catch(console.error);