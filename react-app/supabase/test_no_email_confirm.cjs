// 이메일 인증 없이 로그인 테스트
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://anwwjowwrxdygqyhhckr.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3dqb3d3cnhkeWdxeWhoY2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODg0OTUsImV4cCI6MjA3NDU2NDQ5NX0.uKtcf8jpHuY6JYb2i3bKhmCayvecc4Ezf6go5Luh5gs';

async function testNoEmailConfirm() {
  const supabase = createClient(SUPABASE_URL, ANON_KEY);

  console.log('🧪 이메일 인증 비활성화 테스트\n');
  console.log('=' .repeat(50));

  // 테스트용 이메일과 비밀번호
  const testEmail = `test_dev_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  try {
    // 1. 회원가입
    console.log('\n1️⃣ 회원가입 시도...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (signUpError) {
      console.log('   ❌ 회원가입 실패:', signUpError.message);
      return;
    }

    console.log('   ✅ 회원가입 성공');
    console.log('   - User ID:', signUpData.user?.id);
    console.log('   - 이메일 확인됨?:', signUpData.user?.email_confirmed_at ? '✅ Yes' : '❌ No');

    // 2. 즉시 로그인 시도
    console.log('\n2️⃣ 즉시 로그인 시도...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) {
      console.log('   ❌ 로그인 실패:', signInError.message);
      console.log('\n   ⚠️  아직 이메일 인증이 필요합니다!');
      console.log('   📌 Supabase Dashboard에서 설정을 변경하세요:');
      console.log('      Authentication → Providers → Email → "Confirm email" OFF');
    } else {
      console.log('   ✅ 로그인 성공!');
      console.log('   🎉 이메일 인증이 비활성화되었습니다!');
      console.log('   - Session:', signInData.session ? '있음' : '없음');
      console.log('   - Access Token:', signInData.session?.access_token ? '발급됨' : '없음');

      // 3. 로그아웃
      await supabase.auth.signOut();
      console.log('\n3️⃣ 로그아웃 완료');
    }

  } catch (error) {
    console.error('예상치 못한 오류:', error);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('\n💡 다음 단계:');
  console.log('1. Supabase Dashboard에서 이메일 인증 끄기');
  console.log('2. SQL Editor에서 기존 사용자 확인 처리');
  console.log('3. 이 스크립트를 다시 실행하여 확인');
}

testNoEmailConfirm().catch(console.error);