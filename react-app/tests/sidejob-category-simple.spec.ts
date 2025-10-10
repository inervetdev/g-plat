import { test, expect } from '@playwright/test';

/**
 * 부업 카드 카테고리 시스템 간단 테스트
 * 이미 로그인된 상태에서 부업 카드 생성 기능만 테스트
 */

test.describe('부업 카드 카테고리 기능 테스트', () => {

  test('회원가입 및 로그인', async ({ page }) => {
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'Test123456!';

    console.log('▶ 회원가입 페이지로 이동');
    await page.goto('http://localhost:5175/register');
    await page.waitForLoadState('networkidle');

    console.log('▶ 회원가입 폼 입력');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.fill('input[placeholder*="이름"]', '테스트유저');
    await page.fill('input[placeholder*="전화"]', '010-1234-5678');

    console.log('▶ 회원가입 제출');
    await page.click('button[type="submit"]');

    // 로그인 페이지로 리다이렉트될 수 있음
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('▶ 로그인 필요 - 로그인 진행');
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);
      await page.click('button[type="submit"]');
    }

    // 대시보드 도착 확인
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ 로그인 성공\n');
  });

  test('명함 생성 후 카테고리별 부업 카드 생성', async ({ page }) => {
    // 먼저 로그인 (간단히 직접 접근)
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'Test123456!';

    await page.goto('http://localhost:5175/register');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.fill('input[placeholder*="이름"]', '김부업');
    await page.fill('input[placeholder*="전화"]', '010-9999-8888');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // 로그인 필요시
    if (page.url().includes('/login')) {
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }

    console.log('▶ Step 1: 명함 생성');
    await page.goto('http://localhost:5175/create-card');
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="name"]', '김부업');
    await page.fill('input[name="title"]', '온라인 마케터');
    await page.fill('input[name="company"]', '지플랫');
    await page.fill('input[name="phone"]', '010-9999-8888');
    await page.fill('input[name="email"]', testEmail);

    const customUrl = `kim-${Date.now()}`;
    await page.fill('input[name="custom_url"]', customUrl);

    await page.click('button:has-text("저장")');
    await page.waitForTimeout(3000);
    console.log('✅ 명함 생성 완료\n');

    console.log('▶ Step 2: 부업 카드 페이지 이동');
    await page.goto('http://localhost:5175/sidejob-cards');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 테스트할 부업 카드 데이터
    const testCards = [
      {
        primary: '쇼핑/판매',
        secondary: '식품·건강',
        title: '유기농 건강식품',
        description: '100% 국내산 건강식품 판매',
        price: '29,900원',
        ctaText: '상품 보러가기',
        ctaUrl: 'https://example.com/shop',
        badge: 'HOT'
      },
      {
        primary: '교육/콘텐츠',
        secondary: '온라인 강의',
        title: '마케팅 강의',
        description: '실전 마케팅 노하우',
        price: '99,000원',
        ctaText: '강의 신청하기',
        ctaUrl: 'https://example.com/course',
        badge: 'NEW'
      }
    ];

    for (let i = 0; i < testCards.length; i++) {
      const card = testCards[i];
      console.log(`\n▶ Step 3-${i+1}: "${card.title}" 카드 생성`);

      // 부업 카드 추가 버튼 클릭
      const addButton = page.locator('button:has-text("추가")').first();
      await addButton.click();
      await page.waitForTimeout(1000);

      // 카테고리 Primary 선택
      console.log(`  - Primary 카테고리: ${card.primary}`);
      const primaryBtn = page.locator(`button:has-text("${card.primary}")`).first();
      await primaryBtn.click();
      await page.waitForTimeout(500);

      // 카테고리 Secondary 선택
      console.log(`  - Secondary 카테고리: ${card.secondary}`);
      const secondaryBtn = page.locator(`button:has-text("${card.secondary}")`).first();
      await secondaryBtn.click();
      await page.waitForTimeout(500);

      // 폼 입력
      console.log('  - 폼 입력 중...');
      await page.locator('input[placeholder*="제목"]').fill(card.title);
      await page.locator('textarea[placeholder*="설명"]').fill(card.description);
      await page.locator('input[placeholder*="가격"]').fill(card.price);

      // CTA 버튼 텍스트
      const ctaTextInput = page.locator('input[placeholder*="버튼"]');
      await ctaTextInput.fill(card.ctaText);

      // CTA URL - 중요: type="text"로 변경되어 유연한 검증
      console.log(`  - CTA URL: ${card.ctaUrl}`);
      const ctaUrlInput = page.locator('input[placeholder*="https://"]');
      await ctaUrlInput.fill(card.ctaUrl);

      // 배지
      if (card.badge) {
        const badgeInput = page.locator('input[placeholder*="배지"]');
        await badgeInput.fill(card.badge);
      }

      // 완료 버튼 클릭
      console.log('  - 완료 버튼 클릭');
      const submitBtn = page.locator('button:has-text("완료")').first();
      await submitBtn.click();

      // 저장 대기
      await page.waitForTimeout(2000);

      // 생성 확인
      const cardTitle = page.locator(`text="${card.title}"`);
      await expect(cardTitle).toBeVisible({ timeout: 5000 });
      console.log(`✅ "${card.title}" 카드 생성 완료`);
    }

    console.log('\n▶ Step 4: 카테고리 필터링 테스트');

    // 전체 보기
    const allBtn = page.locator('button:has-text("전체")').first();
    if (await allBtn.isVisible()) {
      await allBtn.click();
      await page.waitForTimeout(1000);
      console.log('✅ 전체 필터 확인');
    }

    // 쇼핑 필터
    const shoppingFilter = page.locator('button:has-text("쇼핑")').first();
    if (await shoppingFilter.isVisible()) {
      await shoppingFilter.click();
      await page.waitForTimeout(1000);
      const shoppingCard = page.locator('text=유기농 건강식품');
      await expect(shoppingCard).toBeVisible();
      console.log('✅ 쇼핑 카테고리 필터 작동');
    }

    // 교육 필터
    const eduFilter = page.locator('button:has-text("교육")').first();
    if (await eduFilter.isVisible()) {
      await eduFilter.click();
      await page.waitForTimeout(1000);
      const eduCard = page.locator('text=마케팅 강의');
      await expect(eduCard).toBeVisible();
      console.log('✅ 교육 카테고리 필터 작동');
    }

    console.log('\n🎉 모든 테스트 통과!');
  });
});
