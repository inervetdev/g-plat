const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://anwwjowwrxdygqyhhckr.supabase.co',
  'sb_secret_boEWDPnDyiGvrZs05CY1FQ_2UFUjyLS',
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

async function verifyDeployment() {
  console.log('🔍 프로덕션 배포 검증 중...\n');

  // 1. Check migration applied
  console.log('1️⃣ 마이그레이션 적용 확인:');
  const { data: columns, error: colError } = await supabase
    .from('users')
    .select('id, deleted_at, deletion_reason')
    .limit(1);

  if (colError) {
    if (colError.message.includes('does not exist')) {
      console.log('❌ 마이그레이션 미적용: deleted_at, deletion_reason 컬럼이 없습니다');
      console.log('   → Supabase SQL Editor에서 마이그레이션 SQL을 실행해주세요');
      console.log('   → 파일: react-app/supabase/migrations/20251122000000_add_user_deletion_tracking.sql\n');
    } else {
      console.log('❌ 에러:', colError.message);
    }
  } else {
    console.log('✅ 마이그레이션 적용 완료 (deleted_at, deletion_reason 컬럼 존재)\n');
  }

  // 2. Check business_cards columns
  console.log('2️⃣ business_cards 테이블 확인:');
  const { data: cards, error: cardError } = await supabase
    .from('business_cards')
    .select('id, profile_image_url, company_logo_url')
    .limit(1);

  if (cardError) {
    console.log('❌ 에러:', cardError.message);
  } else {
    console.log('✅ profile_image_url, company_logo_url 컬럼 존재\n');
  }

  // 3. Check storage bucket
  console.log('3️⃣ Storage 버킷 확인:');
  const { data: buckets } = await supabase.storage.listBuckets();
  const cardBucket = buckets?.find(b => b.name === 'card-attachments');

  if (cardBucket) {
    console.log('✅ card-attachments 버킷 존재');
    console.log(`   - Public: ${cardBucket.public}`);
    console.log(`   - Size limit: ${(cardBucket.file_size_limit / 1024 / 1024).toFixed(0)}MB\n`);
  } else {
    console.log('❌ card-attachments 버킷이 없습니다\n');
  }

  // 4. Check recent data
  console.log('4️⃣ 최근 데이터 확인:');
  const { data: recentCards } = await supabase
    .from('business_cards')
    .select('id, name, created_at, profile_image_url')
    .order('created_at', { ascending: false })
    .limit(3);

  if (recentCards && recentCards.length > 0) {
    console.log(`✅ 최근 명함 ${recentCards.length}개 발견:`);
    recentCards.forEach(card => {
      const hasImage = card.profile_image_url ? '🖼️  O' : '   X';
      console.log(`   ${hasImage} | ${card.name} | ${new Date(card.created_at).toLocaleString('ko-KR')}`);
    });
  } else {
    console.log('ℹ️  최근 생성된 명함 없음');
  }

  console.log('\n✅ 프로덕션 검증 완료!');
  console.log('\n📋 다음 단계:');
  console.log('   1. Vercel 배포 상태 확인: https://vercel.com/dashboard');
  console.log('   2. 사용자 앱 접속: https://g-plat.vercel.app');
  console.log('   3. 명함 생성 페이지에서 프로필 이미지 업로드 테스트');
  console.log('   4. Admin 앱에서 사용자 생성/삭제 테스트');
}

verifyDeployment().catch(console.error);
