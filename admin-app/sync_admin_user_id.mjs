import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anwwjowwrxdygqyhhckr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3dqb3d3cnhkeWdxeWhoY2tyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODk4ODQ5NSwiZXhwIjoyMDc0NTY0NDk1fQ.PMcGNOI6FNPQ7gJSproYa01b-vz6HzwEY2ssSNNefEM';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function syncAdminUserId() {
  try {
    console.log('🔍 현재 데이터 확인 중...\n');

    // 1. auth.users에서 admin 계정 찾기
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const adminAuthUser = authUsers.users.find(u => u.email === 'admin@g-plat.com');
    if (!adminAuthUser) {
      console.error('❌ auth.users에서 admin@g-plat.com을 찾을 수 없습니다.');
      return;
    }

    console.log('✅ auth.users 발견:');
    console.log('   ID:', adminAuthUser.id);
    console.log('   Email:', adminAuthUser.email);

    // 2. admin_users에서 admin 계정 찾기
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@g-plat.com');

    if (adminError) throw adminError;

    if (!adminUsers || adminUsers.length === 0) {
      console.error('❌ admin_users 테이블에서 admin@g-plat.com을 찾을 수 없습니다.');
      return;
    }

    const adminUser = adminUsers[0];
    console.log('\n✅ admin_users 발견:');
    console.log('   ID:', adminUser.id);
    console.log('   Email:', adminUser.email);
    console.log('   Role:', adminUser.role);

    // 3. ID가 다른 경우 동기화
    if (adminUser.id !== adminAuthUser.id) {
      console.log('\n⚠️  ID 불일치 발견!');
      console.log('   auth.users.id:', adminAuthUser.id);
      console.log('   admin_users.id:', adminUser.id);
      console.log('\n🔧 ID 동기화 중...');

      // 기존 레코드 삭제
      const { error: deleteError } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminUser.id);

      if (deleteError) {
        console.error('❌ 기존 레코드 삭제 실패:', deleteError);
        return;
      }

      // auth.users.id와 동일한 ID로 새 레코드 생성
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({
          id: adminAuthUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('❌ 새 레코드 생성 실패:', insertError);
        return;
      }

      console.log('✅ ID 동기화 완료!');
    } else {
      console.log('\n✅ ID가 이미 동기화되어 있습니다.');
    }

    // 4. 최종 확인
    console.log('\n📋 최종 상태 확인:');
    const { data: finalCheck, error: finalError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', adminAuthUser.id)
      .single();

    if (finalError || !finalCheck) {
      console.error('❌ 최종 확인 실패:', finalError);
      return;
    }

    console.log('✅ 동기화 완료!');
    console.log('   auth.users.id:', adminAuthUser.id);
    console.log('   admin_users.id:', finalCheck.id);
    console.log('   Email:', finalCheck.email);
    console.log('   Name:', finalCheck.name);
    console.log('   Role:', finalCheck.role);
    console.log('   Active:', finalCheck.is_active);
    console.log('\n🎉 이제 로그인을 다시 시도해주세요!');
    console.log('   Email: admin@g-plat.com');
    console.log('   Password: admin1234!');

  } catch (error) {
    console.error('❌ 실행 중 오류:', error);
  }
}

syncAdminUserId();
