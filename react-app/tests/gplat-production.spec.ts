import { test, expect } from '@playwright/test';

test.describe('G-Plat Production Tests', () => {

  test('홈페이지 접속 및 기본 요소 확인', async ({ page }) => {
    await page.goto('/');

    // 페이지 로드 확인
    await expect(page).toHaveTitle(/G-Plat|지플랫/);

    // 기본 UI 요소 확인
    await page.waitForLoadState('networkidle');

    console.log('✅ 홈페이지 로드 완료');
  });

  test('로그인 페이지 접근', async ({ page }) => {
    await page.goto('/');

    // 로그인 버튼 또는 링크 찾기
    const loginButton = page.getByRole('link', { name: /로그인|login/i }).or(
      page.getByRole('button', { name: /로그인|login/i })
    );

    if (await loginButton.count() > 0) {
      await loginButton.first().click();
      await page.waitForLoadState('networkidle');

      // 로그인 폼 확인
      const emailInput = page.getByRole('textbox', { name: /email|이메일/i }).or(
        page.locator('input[type="email"]')
      );

      await expect(emailInput.first()).toBeVisible({ timeout: 5000 });
      console.log('✅ 로그인 페이지 접근 성공');
    } else {
      console.log('⚠️ 로그인 버튼을 찾을 수 없음');
    }
  });

  test('회원가입 페이지 접근', async ({ page }) => {
    await page.goto('/');

    // 회원가입 버튼 또는 링크 찾기
    const signupButton = page.getByRole('link', { name: /회원가입|가입|signup|sign up/i }).or(
      page.getByRole('button', { name: /회원가입|가입|signup|sign up/i })
    );

    if (await signupButton.count() > 0) {
      await signupButton.first().click();
      await page.waitForLoadState('networkidle');

      console.log('✅ 회원가입 페이지 접근 성공');
    } else {
      console.log('⚠️ 회원가입 버튼을 찾을 수 없음');
    }
  });

  test('모바일 반응형 테스트', async ({ page }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    // 페이지가 정상적으로 렌더링되는지 확인
    const body = page.locator('body');
    await expect(body).toBeVisible();

    console.log('✅ 모바일 반응형 렌더링 확인');
  });

  test('페이지 로딩 성능 체크', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    console.log(`📊 페이지 로딩 시간: ${loadTime}ms`);

    // 5초 이내 로딩 확인
    expect(loadTime).toBeLessThan(5000);
  });

  test('네비게이션 메뉴 확인', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 메뉴나 네비게이션 요소 찾기
    const nav = page.locator('nav').or(
      page.locator('[role="navigation"]')
    );

    if (await nav.count() > 0) {
      await expect(nav.first()).toBeVisible();
      console.log('✅ 네비게이션 메뉴 확인');
    } else {
      console.log('⚠️ 네비게이션 메뉴를 찾을 수 없음');
    }
  });

  test('404 페이지 처리 확인', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345');

    // 404 또는 리다이렉트 확인
    if (response) {
      const status = response.status();
      console.log(`📄 존재하지 않는 페이지 응답 코드: ${status}`);

      // 404 또는 리다이렉트(3xx) 확인
      expect(status === 404 || (status >= 300 && status < 400)).toBeTruthy();
    }
  });

  test('이미지 및 리소스 로딩 확인', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 이미지 로딩 확인
    const images = await page.locator('img').all();

    if (images.length > 0) {
      console.log(`🖼️ 총 ${images.length}개의 이미지 발견`);

      // 첫 번째 이미지가 로드되었는지 확인
      const firstImage = images[0];
      const isVisible = await firstImage.isVisible();

      console.log(`✅ 이미지 렌더링 ${isVisible ? '성공' : '실패'}`);
    } else {
      console.log('⚠️ 이미지를 찾을 수 없음');
    }
  });

  test('JavaScript 에러 체크', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    if (errors.length > 0) {
      console.log('⚠️ JavaScript 에러 발견:');
      errors.forEach((error) => console.log(`  - ${error}`));
    } else {
      console.log('✅ JavaScript 에러 없음');
    }

    // 크리티컬 에러가 없는지 확인 (경고는 허용)
    const criticalErrors = errors.filter(e =>
      !e.includes('Warning') && !e.includes('DevTools')
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('브라우저 콘솔 로그 확인', async ({ page }) => {
    const logs: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    if (logs.length > 0) {
      console.log('⚠️ 콘솔 에러 발견:');
      logs.forEach((log) => console.log(`  - ${log}`));
    } else {
      console.log('✅ 콘솔 에러 없음');
    }
  });
});
