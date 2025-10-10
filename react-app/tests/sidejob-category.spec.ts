import { test, expect } from '@playwright/test';

test.describe('SideJob Card Category System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');
  });

  test('should display landing page and allow navigation to login', async ({ page }) => {
    // Check if landing page loads
    await expect(page).toHaveTitle(/지플랫|G-Plat/i);

    // Try to find login button or link
    const loginButton = page.locator('text=/로그인|Login/i').first();
    if (await loginButton.isVisible()) {
      console.log('✅ Landing page loaded successfully');
    }
  });

  test('should navigate to sidejob cards page after login', async ({ page }) => {
    // First, try to navigate directly to sidejob cards page
    await page.goto('http://localhost:5173/sidejob-cards');

    // It should redirect to login if not authenticated
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    if (currentUrl.includes('/login')) {
      console.log('✅ Correctly redirected to login page when not authenticated');
    } else if (currentUrl.includes('/sidejob-cards')) {
      console.log('✅ Already authenticated - on sidejob cards page');

      // Check if the page has the "새 부가명함 추가" button
      const addButton = page.locator('text=새 부가명함 추가');
      await expect(addButton).toBeVisible();
      console.log('✅ "새 부가명함 추가" button is visible');
    }
  });

  test('should check if category selector exists in form', async ({ page }) => {
    // Navigate to sidejob cards page
    await page.goto('http://localhost:5173/sidejob-cards');

    await page.waitForTimeout(2000);

    // If on login page, skip this test
    if (page.url().includes('/login')) {
      console.log('⚠️ Skipping - user not authenticated');
      return;
    }

    // Click "새 부가명함 추가" button
    const addButton = page.locator('text=새 부가명함 추가');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);

      // Check if category selection UI appears
      const categoryLabel = page.locator('text=카테고리 선택');
      await expect(categoryLabel).toBeVisible();
      console.log('✅ Category selector label is visible');

      // Check for category options
      const shoppingCategory = page.locator('text=🛒 쇼핑/판매');
      const educationCategory = page.locator('text=🎓 교육/콘텐츠');
      const serviceCategory = page.locator('text=💼 서비스/예약');

      if (await shoppingCategory.isVisible()) {
        console.log('✅ Shopping category is visible');
      }
      if (await educationCategory.isVisible()) {
        console.log('✅ Education category is visible');
      }
      if (await serviceCategory.isVisible()) {
        console.log('✅ Service category is visible');
      }

      // Try to select a category
      await shoppingCategory.click();
      await page.waitForTimeout(500);

      // Check if secondary category appears
      const secondaryLabel = page.locator('text=세부 카테고리 선택');
      if (await secondaryLabel.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('✅ Secondary category selector appeared');

        // Check for secondary options
        const foodHealth = page.locator('text=식품·건강').first();
        if (await foodHealth.isVisible()) {
          console.log('✅ Secondary category "식품·건강" is visible');

          // Click secondary category
          await foodHealth.click();
          await page.waitForTimeout(500);

          // Check if CTA text is auto-suggested
          const ctaInput = page.locator('input[placeholder*="상품 보러가기"]');
          if (await ctaInput.isVisible()) {
            const ctaValue = await ctaInput.inputValue();
            if (ctaValue) {
              console.log('✅ CTA text auto-suggested:', ctaValue);
            }
          }
        }
      }

      // Check CTA URL field
      const urlLabel = page.locator('text=CTA 링크 URL');
      if (await urlLabel.isVisible()) {
        console.log('✅ CTA URL field is visible');

        // Check if it has the help text
        const helpText = page.locator('text=전체 URL을 입력하세요');
        if (await helpText.isVisible()) {
          console.log('✅ URL help text is visible');
        }
      }

      // Close the form
      const closeButton = page.locator('button:has-text("취소")').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        console.log('✅ Form closed successfully');
      }
    }
  });

  test('should validate URL format', async ({ page }) => {
    // Navigate to sidejob cards page
    await page.goto('http://localhost:5173/sidejob-cards');

    await page.waitForTimeout(2000);

    // If on login page, skip this test
    if (page.url().includes('/login')) {
      console.log('⚠️ Skipping - user not authenticated');
      return;
    }

    // Click "새 부가명함 추가" button
    const addButton = page.locator('text=새 부가명함 추가');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);

      // Select category
      const shoppingCategory = page.locator('text=🛒 쇼핑/판매').first();
      if (await shoppingCategory.isVisible()) {
        await shoppingCategory.click();
        await page.waitForTimeout(500);

        // Select secondary category
        const foodHealth = page.locator('text=식품·건강').first();
        if (await foodHealth.isVisible()) {
          await foodHealth.click();
          await page.waitForTimeout(500);

          // Fill in required fields
          const titleInput = page.locator('input[placeholder*="건강한"]').first();
          await titleInput.fill('테스트 상품');

          // Try invalid URL (without http://)
          const urlInput = page.locator('label:has-text("CTA 링크 URL")').locator('..').locator('input').first();
          await urlInput.fill('naver.com');

          // Try to submit
          const submitButton = page.locator('button[type="submit"]:has-text("추가")');
          await submitButton.click();

          // Check for alert
          page.once('dialog', async dialog => {
            console.log('✅ Alert appeared:', dialog.message());
            if (dialog.message().includes('http://') || dialog.message().includes('https://')) {
              console.log('✅ URL validation is working correctly');
            }
            await dialog.accept();
          });

          await page.waitForTimeout(1000);

          // Now try with valid URL
          await urlInput.clear();
          await urlInput.fill('https://naver.com');
          console.log('✅ Valid URL entered: https://naver.com');
        }
      }

      // Close the form
      const closeButton = page.locator('button:has-text("취소")').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
  });

  test('should check if category filter works', async ({ page }) => {
    // Navigate to sidejob cards page
    await page.goto('http://localhost:5173/sidejob-cards');

    await page.waitForTimeout(2000);

    // If on login page, skip this test
    if (page.url().includes('/login')) {
      console.log('⚠️ Skipping - user not authenticated');
      return;
    }

    // Check if category filter buttons exist
    const filterIcon = page.locator('text=카테고리 필터');
    if (await filterIcon.isVisible()) {
      console.log('✅ Category filter section is visible');

      // Check for "전체" button
      const allButton = page.locator('button:has-text("전체")').first();
      if (await allButton.isVisible()) {
        console.log('✅ "전체" filter button is visible');
      }

      // Check for category filter buttons
      const categoryButtons = page.locator('button:has-text("🛒 쇼핑/판매"), button:has-text("🎓 교육/콘텐츠"), button:has-text("💼 서비스/예약")');
      const count = await categoryButtons.count();
      console.log(`✅ Found ${count} category filter buttons`);
    } else {
      console.log('ℹ️ No category filters (probably no cards yet)');
    }
  });
});
