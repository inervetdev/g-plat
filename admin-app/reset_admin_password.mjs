import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anwwjowwrxdygqyhhckr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3dqb3d3cnhkeWdxeWhoY2tyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODk4ODQ5NSwiZXhwIjoyMDc0NTY0NDk1fQ.PMcGNOI6FNPQ7gJSproYa01b-vz6HzwEY2ssSNNefEM';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function resetAdminPassword() {
  try {
    // auth.users에서 admin 계정 찾기
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Auth users 조회 실패:', authError);
      return;
    }

    const adminUser = authUsers.users.find(u => u.email === 'admin@g-plat.com');

    if (!adminUser) {
      console.error('❌ admin@g-plat.com 계정을 찾을 수 없습니다.');
      return;
    }

    console.log('✅ Admin 계정 발견:', {
      id: adminUser.id,
      email: adminUser.email,
      created_at: adminUser.created_at
    });

    // 새 비밀번호 설정: Password123!@#
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { password: 'Password123!@#' }
    );

    if (updateError) {
      console.error('❌ 비밀번호 업데이트 실패:', updateError);
      return;
    }

    console.log('✅ 비밀번호 재설정 성공!');
    console.log('\n📋 로그인 정보:');
    console.log('   이메일: admin@g-plat.com');
    console.log('   비밀번호: Password123!@#');
    console.log('\n🔗 로그인 페이지: http://localhost:5174/login');

  } catch (error) {
    console.error('❌ 실행 중 오류:', error);
  }
}

resetAdminPassword();
