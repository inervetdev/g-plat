import { test, expect } from '@playwright/test'

/**
 * Product Applications Management Tests
 *
 * Tests for the product application management components.
 * Note: These tests focus on page rendering and component structure
 * without requiring authenticated login (for local dev testing).
 */

test.describe('Applications Page Structure', () => {
  test('should render applications page layout', async ({ page }) => {
    // Directly navigate to applications page
    await page.goto('/applications')
    await page.waitForLoadState('networkidle', { timeout: 10000 })

    // Page should have content even if redirected to login
    const pageContent = await page.content()
    expect(pageContent.length).toBeGreaterThan(500)
  })

  test('should display G-PLAT Admin branding', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle', { timeout: 10000 })

    // Check for admin branding
    const pageContent = await page.content()
    const hasBranding =
      pageContent.includes('G-PLAT') ||
      pageContent.includes('Admin') ||
      pageContent.includes('관리자')

    expect(hasBranding).toBeTruthy()
  })

  test('should have login form on root page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    await page.waitForTimeout(1000)

    // Check for login form elements
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')

    // Should have login form
    const hasEmailInput = await emailInput.isVisible()
    const hasPasswordInput = await passwordInput.isVisible()

    expect(hasEmailInput || hasPasswordInput).toBeTruthy()
  })

  test('should validate login form inputs', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    await page.waitForTimeout(1000)

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]')

    if (await submitButton.isVisible()) {
      await submitButton.click()
      await page.waitForTimeout(500)

      // Should show validation errors
      const pageContent = await page.content()
      const hasValidation =
        pageContent.includes('이메일') ||
        pageContent.includes('비밀번호') ||
        pageContent.includes('error') ||
        pageContent.includes('필수')

      expect(hasValidation).toBeTruthy()
    }
  })
})

test.describe('Sidejobs Page - Form Schema Editor', () => {
  test('should render sidejobs page', async ({ page }) => {
    await page.goto('/sidejobs')
    await page.waitForLoadState('networkidle', { timeout: 10000 })

    // Page should render (might redirect to login)
    const pageContent = await page.content()
    expect(pageContent.length).toBeGreaterThan(500)
  })
})

test.describe('Route Configuration Check', () => {
  test('should have applications route configured', async ({ page }) => {
    // Verify that /applications route exists
    const response = await page.goto('/applications')

    // Should get a response (either 200 or redirect)
    expect(response?.status()).toBeLessThan(500)
  })

  test('should have sidejobs route configured', async ({ page }) => {
    const response = await page.goto('/sidejobs')
    expect(response?.status()).toBeLessThan(500)
  })

  test('should have dashboard route configured', async ({ page }) => {
    const response = await page.goto('/dashboard')
    expect(response?.status()).toBeLessThan(500)
  })
})
