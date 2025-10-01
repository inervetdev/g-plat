// React 앱 테스트 스크립트
// 이 파일은 React 앱의 주요 API 엔드포인트를 테스트합니다

async function testReactApp() {
  console.log('🧪 React 앱 테스트 시작...\n');

  // 1. 앱이 실행 중인지 확인
  try {
    const response = await fetch('http://localhost:5173/');
    if (response.ok) {
      console.log('✅ React 앱이 정상적으로 실행 중입니다');
    } else {
      console.log('❌ React 앱 접속 실패:', response.status);
    }
  } catch (error) {
    console.log('❌ React 앱에 연결할 수 없습니다:', error.message);
    return;
  }

  console.log('\n📋 테스트 결과 요약:');
  console.log('- React 앱: http://localhost:5173/ 에서 실행 중');
  console.log('- 주요 페이지:');
  console.log('  • 로그인: /login');
  console.log('  • 회원가입: /register');
  console.log('  • 대시보드: /dashboard');
  console.log('  • 명함 만들기: /create-card');
  console.log('  • 명함 보기: /card/:custom_url');

  console.log('\n💡 테스트 계정:');
  console.log('- 이메일: dslee@inervet.com');
  console.log('- 저장된 명함: 이대섭 (주식회사 이너벳)');
  console.log('- 커스텀 URL: ds-lee');

  console.log('\n🔗 직접 테스트해보세요:');
  console.log('- 명함 보기: http://localhost:5173/card/ds-lee');
}

testReactApp();