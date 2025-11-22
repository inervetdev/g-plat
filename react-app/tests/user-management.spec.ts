import { test, expect } from '@playwright/test';

/**
 * User Management Feature Tests
 * Tests for:
 * 1. Profile image upload when creating business cards (user app)
 * 2. Required field validation (name, phone, email, custom_url)
 * 3. Admin user creation
 * 4. Admin user deletion with reason
 */

test.describe('User App - Card Creation with Profile Image', () => {
  test.beforeEach(async ({ page }) => {
    // Login as regular user
    await page.goto('http://localhost:5173/login');
    // TODO: Add test user credentials or mock auth
  });

  test('should allow profile image upload when creating card', async ({ page }) => {
    test.skip(!process.env.RUN_USER_TESTS, 'Skipping user app tests');

    await page.goto('http://localhost:5173/create-card');

    // Check if profile image upload section exists
    await expect(page.getByText('프로필 사진')).toBeVisible();
    await expect(page.locator('#profile-image-upload')).toBeAttached();

    // Check if company logo upload section exists
    await expect(page.getByText('회사 로고')).toBeVisible();
    await expect(page.locator('#company-logo-upload')).toBeAttached();
  });

  test('should validate required fields (name, phone, email, custom_url)', async ({ page }) => {
    test.skip(!process.env.RUN_USER_TESTS, 'Skipping user app tests');

    await page.goto('http://localhost:5173/create-card');

    // Try to submit without filling required fields
    await page.click('button[type="submit"]');

    // Should show alert for missing name
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('이름을 입력해주세요');
      await dialog.accept();
    });
  });

  test('should show required field indicators', async ({ page }) => {
    test.skip(!process.env.RUN_USER_TESTS, 'Skipping user app tests');

    await page.goto('http://localhost:5173/create-card');

    // Check for asterisk (*) on required fields
    await expect(page.getByText('전화번호 *')).toBeVisible();
    await expect(page.getByText('이메일 *')).toBeVisible();
    await expect(page.getByText('커스텀 URL *')).toBeVisible();
  });

  test('should upload and preview profile image', async ({ page }) => {
    test.skip(!process.env.RUN_USER_TESTS, 'Skipping user app tests');

    await page.goto('http://localhost:5173/create-card');

    // Create a test image file
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

    // Upload profile image
    await page.locator('#profile-image-upload').setInputFiles({
      name: 'profile.png',
      mimeType: 'image/png',
      buffer
    });

    // Check if preview is shown
    await expect(page.locator('img[alt="Profile preview"]')).toBeVisible();
  });

  test('should validate file size (max 5MB)', async ({ page }) => {
    test.skip(!process.env.RUN_USER_TESTS, 'Skipping user app tests');

    await page.goto('http://localhost:5173/create-card');

    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('파일 크기는 5MB 이하여야 합니다');
      await dialog.accept();
    });

    // Note: Actual file size validation happens in handleProfileImageChange
    // This test would need to mock a >5MB file
  });
});

test.describe('Admin App - User Creation', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Login as admin user
    // await page.goto('http://localhost:5174/login'); // Admin app port
  });

  test('should show "신규 사용자 추가" button', async ({ page }) => {
    test.skip(!process.env.RUN_ADMIN_TESTS, 'Skipping admin app tests');

    await page.goto('http://localhost:5174/users');

    await expect(page.getByRole('button', { name: /신규 사용자 추가/ })).toBeVisible();
  });

  test('should open user creation modal', async ({ page }) => {
    test.skip(!process.env.RUN_ADMIN_TESTS, 'Skipping admin app tests');

    await page.goto('http://localhost:5174/users');
    await page.click('button:has-text("신규 사용자 추가")');

    // Check modal is visible
    await expect(page.getByText('신규 사용자 생성')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should have password auto-generation button', async ({ page }) => {
    test.skip(!process.env.RUN_ADMIN_TESTS, 'Skipping admin app tests');

    await page.goto('http://localhost:5174/users');
    await page.click('button:has-text("신규 사용자 추가")');

    await expect(page.getByRole('button', { name: /자동 생성/ })).toBeVisible();
  });

  test('should create new user with admin API', async ({ page }) => {
    test.skip(!process.env.RUN_ADMIN_TESTS, 'Skipping admin app tests');

    // This would require actual API mocking or test database
    // Implementation depends on test environment setup
  });
});

test.describe('Admin App - User Deletion', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Login as admin user
  });

  test('should show delete button on user detail page', async ({ page }) => {
    test.skip(!process.env.RUN_ADMIN_TESTS, 'Skipping admin app tests');

    // Assuming we have a test user with known ID
    await page.goto('http://localhost:5174/users/test-user-id');

    await expect(page.getByRole('button', { name: /사용자 삭제/ })).toBeVisible();
  });

  test('should open deletion modal with required fields', async ({ page }) => {
    test.skip(!process.env.RUN_ADMIN_TESTS, 'Skipping admin app tests');

    await page.goto('http://localhost:5174/users/test-user-id');
    await page.click('button:has-text("사용자 삭제")');

    // Check modal content
    await expect(page.getByText('사용자 삭제')).toBeVisible();
    await expect(page.getByText('삭제 사유')).toBeVisible();
    await expect(page.getByText('이메일 주소 확인')).toBeVisible();

    // Check for warning messages
    await expect(page.getByText(/주의사항/)).toBeVisible();
    await expect(page.getByText(/영구적으로 삭제됩니다/)).toBeVisible();
  });

  test('should require deletion reason', async ({ page }) => {
    test.skip(!process.env.RUN_ADMIN_TESTS, 'Skipping admin app tests');

    await page.goto('http://localhost:5174/users/test-user-id');
    await page.click('button:has-text("사용자 삭제")');

    // Try to submit without reason
    const submitButton = page.locator('button:has-text("영구 삭제")');
    await expect(submitButton).toBeDisabled(); // Should be disabled initially
  });

  test('should require email confirmation', async ({ page }) => {
    test.skip(!process.env.RUN_ADMIN_TESTS, 'Skipping admin app tests');

    await page.goto('http://localhost:5174/users/test-user-id');
    await page.click('button:has-text("사용자 삭제")');

    // Fill deletion reason
    await page.fill('textarea', '테스트 사유');

    // Submit button should still be disabled without email confirmation
    const submitButton = page.locator('button:has-text("영구 삭제")');
    await expect(submitButton).toBeDisabled();

    // Enter wrong email
    await page.fill('input[type="text"][placeholder*="@"]', 'wrong@email.com');
    await expect(submitButton).toBeDisabled();
  });

  test('should enable submit when all validations pass', async ({ page }) => {
    test.skip(!process.env.RUN_ADMIN_TESTS, 'Skipping admin app tests');

    await page.goto('http://localhost:5174/users/test-user-id');

    // Get user email from page
    const userEmail = await page.locator('.user-email').textContent(); // Adjust selector

    await page.click('button:has-text("사용자 삭제")');

    // Fill all required fields
    await page.fill('textarea', '테스트 삭제 사유입니다');
    await page.fill('input[type="text"][placeholder*="@"]', userEmail || 'test@example.com');

    // Submit button should now be enabled
    const submitButton = page.locator('button:has-text("영구 삭제")');
    await expect(submitButton).toBeEnabled();
  });
});

test.describe('Integration Tests', () => {
  test('should complete full user creation flow', async ({ page }) => {
    test.skip(!process.env.RUN_INTEGRATION_TESTS, 'Skipping integration tests');

    // This would test the entire flow:
    // 1. Admin creates user
    // 2. User receives credentials
    // 3. User logs in
    // 4. User creates card with profile image
    // 5. Validation checks pass
  });

  test('should complete full user deletion flow', async ({ page }) => {
    test.skip(!process.env.RUN_INTEGRATION_TESTS, 'Skipping integration tests');

    // This would test:
    // 1. Admin navigates to user detail
    // 2. Admin initiates deletion
    // 3. Admin provides reason and confirms email
    // 4. User is marked as deleted in DB
    // 5. User is removed from Auth
  });
});

/**
 * Manual Test Checklist:
 *
 * User App - Card Creation:
 * [ ] Profile image upload button visible
 * [ ] Profile image preview works
 * [ ] Company logo upload button visible
 * [ ] Company logo preview works
 * [ ] File size validation (>5MB shows alert)
 * [ ] Image type validation (non-images rejected)
 * [ ] Required fields marked with *
 * [ ] Name validation (alert if empty)
 * [ ] Phone validation (alert if empty)
 * [ ] Email validation (alert if empty)
 * [ ] Custom URL validation (alert if empty)
 * [ ] Card creation succeeds with images
 * [ ] Images are uploaded to Supabase Storage
 * [ ] Image URLs are saved to business_cards table
 *
 * Admin App - User Creation:
 * [ ] "신규 사용자 추가" button visible on /users
 * [ ] Modal opens on button click
 * [ ] Email, name, password fields present
 * [ ] Subscription tier dropdown works
 * [ ] Password auto-generation button works
 * [ ] User creation API call succeeds
 * [ ] User appears in users list after creation
 * [ ] User can login with generated credentials
 * [ ] Error handling for duplicate email
 * [ ] Rollback works if profile creation fails
 *
 * Admin App - User Deletion:
 * [ ] "사용자 삭제" button visible on user detail page
 * [ ] Modal opens with warning messages
 * [ ] Deletion reason textarea required
 * [ ] Email confirmation input required
 * [ ] Submit button disabled until validation passes
 * [ ] Email mismatch shows error
 * [ ] Deletion updates users table (status, deleted_at, deletion_reason)
 * [ ] Deletion removes user from Auth
 * [ ] Rollback works if Auth deletion fails
 * [ ] Navigation to /users after successful deletion
 */
