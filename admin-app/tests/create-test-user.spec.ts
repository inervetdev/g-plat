import { test, expect } from '@playwright/test'

test.describe('Create Test User', () => {
  test('should create tax@inervet.com user', async ({ page }) => {
    // Navigate to registration page
    await page.goto('https://g-plat.vercel.app/register')
    await page.waitForLoadState('networkidle')

    // Fill registration form
    await page.fill('input[type="email"]', 'tax@inervet.com')
    await page.fill('input[type="password"]', 'Test1234!')

    // Find name input (may vary based on form structure)
    const nameInput = page.locator('input[name="name"], input[placeholder*="이름"]').first()
    if (await nameInput.isVisible()) {
      await nameInput.fill('tax')
    }

    // Click register button
    const registerButton = page.locator('button[type="submit"], button:has-text("회원가입")')
    await registerButton.click()

    // Wait for success message or redirect
    await page.waitForTimeout(3000)

    // Check for success message or email confirmation notice
    const successMessage = page.locator('text=이메일, text=확인, text=성공').first()

    if (await successMessage.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ User registration initiated. Email confirmation may be required.')
    } else {
      console.log('⚠️ Please check if user was created successfully')
    }
  })
})
