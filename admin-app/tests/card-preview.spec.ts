import { test, expect } from '@playwright/test'

/**
 * Card Preview Link Tests
 *
 * Tests the fix for custom_url handling in card preview links.
 * The preview link should use custom_url if available, otherwise fallback to card.id
 */

test.describe('Card Preview Links', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page (will use baseURL from config)
    await page.goto('/')

    // Login with production admin credentials
    await page.fill('input[type="email"]', 'admin@g-plat.com')
    await page.fill('input[type="password"]', 'admin1234!')
    await page.click('button[type="submit"]')

    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 60000 })

    // Navigate to cards page
    await page.click('a[href="/cards"]')
    await page.waitForURL('**/cards')
  })

  test('should display card list', async ({ page }) => {
    // Wait for cards to load - look for card container with specific classes
    await page.waitForSelector('.bg-white.rounded-xl.shadow', { timeout: 10000 })

    // Check that cards are displayed
    const cards = await page.locator('.bg-white.rounded-xl.shadow').count()
    expect(cards).toBeGreaterThan(0)

    console.log(`Found ${cards} cards in the list`)
  })

  test('should open card detail page when clicking a card', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('.aspect-video.bg-gradient-to-br', { timeout: 10000 })

    // Click the first card preview (the colored gradient area)
    await page.locator('.aspect-video.bg-gradient-to-br').first().click()

    // Wait for detail page to load
    await page.waitForURL('**/cards/*')

    // Check that detail page elements are present
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByText('미리보기')).toBeVisible()
  })

  test('should have valid preview link with custom_url', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('.aspect-video.bg-gradient-to-br', { timeout: 10000 })

    // Click the first card
    await page.locator('.aspect-video.bg-gradient-to-br').first().click()
    await page.waitForURL('**/cards/*')

    // Find the preview link
    const previewLink = page.locator('a:has-text("미리보기")')
    await expect(previewLink).toBeVisible()

    // Get the href attribute
    const href = await previewLink.getAttribute('href')
    console.log('Preview link href:', href)

    // Check that href is valid (should not contain 'null')
    expect(href).toBeTruthy()
    expect(href).not.toContain('/null')
    expect(href).toMatch(/https:\/\/g-plat\.com\/card\//)

    // Extract the card identifier from the URL
    const cardId = href?.split('/card/')[1]
    console.log('Card identifier:', cardId)
    expect(cardId).toBeTruthy()
    expect(cardId).not.toBe('null')
    expect(cardId).not.toBe('undefined')
  })

  test('should open preview in new tab', async ({ page, context }) => {
    // Wait for cards to load
    await page.waitForSelector('.aspect-video.bg-gradient-to-br', { timeout: 10000 })

    // Click the first card
    await page.locator('.aspect-video.bg-gradient-to-br').first().click()
    await page.waitForURL('**/cards/*')

    // Find the preview link
    const previewLink = page.locator('a:has-text("미리보기")')

    // Check that link has target="_blank"
    const target = await previewLink.getAttribute('target')
    expect(target).toBe('_blank')

    // Check that link has rel="noopener noreferrer" for security
    const rel = await previewLink.getAttribute('rel')
    expect(rel).toContain('noopener')
    expect(rel).toContain('noreferrer')
  })

  test('should handle multiple cards with different URL types', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('.aspect-video.bg-gradient-to-br', { timeout: 10000 })

    const cardCount = await page.locator('.aspect-video.bg-gradient-to-br').count()
    console.log(`Testing ${Math.min(cardCount, 5)} cards...`)

    const invalidLinks: string[] = []

    // Test up to 5 cards
    for (let i = 0; i < Math.min(cardCount, 5); i++) {
      // Go back to cards list
      if (i > 0) {
        await page.goto('/cards')
        await page.waitForSelector('.aspect-video.bg-gradient-to-br')
      }

      // Click the card
      await page.locator('.aspect-video.bg-gradient-to-br').nth(i).click()
      await page.waitForURL('**/cards/*')

      // Get card name
      const cardName = await page.locator('h1').first().textContent()

      // Check preview link
      const previewLink = page.locator('a:has-text("미리보기")')
      const href = await previewLink.getAttribute('href')

      console.log(`Card ${i + 1}: ${cardName} -> ${href}`)

      // Validate the link
      if (!href || href.includes('/null') || href.includes('/undefined')) {
        invalidLinks.push(`${cardName}: ${href}`)
      }
    }

    // All links should be valid
    expect(invalidLinks).toHaveLength(0)

    if (invalidLinks.length > 0) {
      console.error('Invalid preview links found:', invalidLinks)
    }
  })

  test('should navigate back from detail page', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('.aspect-video.bg-gradient-to-br', { timeout: 10000 })

    // Click a card
    await page.locator('.aspect-video.bg-gradient-to-br').first().click()
    await page.waitForURL('**/cards/*')

    // Click back button
    await page.click('button:has-text("뒤로")')

    // Should be back at cards list
    await page.waitForURL('**/cards')
    await expect(page.locator('.aspect-video.bg-gradient-to-br').first()).toBeVisible()
  })

  test('should display all action buttons', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('.aspect-video.bg-gradient-to-br', { timeout: 10000 })

    // Click a card
    await page.locator('.aspect-video.bg-gradient-to-br').first().click()
    await page.waitForURL('**/cards/*')

    // Check that all action buttons are present
    await expect(page.getByText('미리보기')).toBeVisible()
    await expect(page.getByText('편집')).toBeVisible()
    await expect(page.getByText('QR 생성')).toBeVisible()
    await expect(page.getByText('삭제')).toBeVisible()
  })

  test('should display card information', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('.aspect-video.bg-gradient-to-br', { timeout: 10000 })

    // Click a card
    await page.locator('.aspect-video.bg-gradient-to-br').first().click()
    await page.waitForURL('**/cards/*')

    // Check that tabs are present
    await expect(page.getByText('개요')).toBeVisible()
    await expect(page.getByText('통계')).toBeVisible()
    await expect(page.getByText('QR 코드')).toBeVisible()
    await expect(page.getByText('방문자')).toBeVisible()

    // Check that basic info is displayed
    await expect(page.locator('h1')).toBeVisible() // Card name
  })
})

test.describe('Console Errors', () => {
  test('should not have console errors on card detail page', async ({ page }) => {
    const consoleErrors: string[] = []

    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Navigate and login
    await page.goto('/')
    await page.fill('input[type="email"]', 'admin@g-plat.com')
    await page.fill('input[type="password"]', 'admin1234!')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard', { timeout: 60000 })

    // Go to cards
    await page.click('a[href="/cards"]')
    await page.waitForURL('**/cards')
    await page.waitForSelector('.aspect-video.bg-gradient-to-br', { timeout: 10000 })

    // Open card detail
    await page.locator('.aspect-video.bg-gradient-to-br').first().click()
    await page.waitForURL('**/cards/*')

    // Wait a bit for any async errors
    await page.waitForTimeout(2000)

    // Check for errors
    if (consoleErrors.length > 0) {
      console.log('Console errors found:')
      consoleErrors.forEach(err => console.log('  -', err))
    }

    // We allow some non-critical errors, but fail on specific ones
    const criticalErrors = consoleErrors.filter(err =>
      err.includes('Uncaught') ||
      err.includes('TypeError') ||
      err.includes('ReferenceError')
    )

    expect(criticalErrors).toHaveLength(0)
  })
})
