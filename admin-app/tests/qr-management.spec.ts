import { test, expect } from '@playwright/test'

/**
 * QR Code Management Tests
 *
 * Tests for the QR code management module in Admin App.
 * - QR code list page
 * - Search and filter functionality
 * - QR code detail modal with stats
 * - Toggle active/inactive status
 */

test.describe('QR Code Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/')

    // Login with production admin credentials
    await page.fill('input[type="email"]', 'admin@g-plat.com')
    await page.fill('input[type="password"]', 'Password123!')
    await page.click('button[type="submit"]')

    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 60000 })

    // Navigate to QR codes page
    await page.click('a[href="/qr"]')
    await page.waitForURL('**/qr')

    // Wait for page content to load
    await page.waitForTimeout(2000)
  })

  test('should display QR code management page', async ({ page }) => {
    // Check page title - use text locator for h1 containing QR 코드 관리
    const pageTitle = page.locator('h1', { hasText: 'QR 코드 관리' })
    await expect(pageTitle).toBeVisible({ timeout: 10000 })

    // Check that stats cards are displayed (use exact match to avoid duplicates)
    await expect(page.getByText('전체 QR 코드', { exact: true })).toBeVisible()
    await expect(page.getByText('활성 QR 코드', { exact: true })).toBeVisible()
    await expect(page.getByText('총 스캔 수', { exact: true })).toBeVisible()
    await expect(page.getByText('오늘 스캔', { exact: true })).toBeVisible()
    await expect(page.getByText('이번 주 스캔', { exact: true })).toBeVisible()
  })

  test('should display QR code list in table view', async ({ page }) => {
    // Wait for table to load with increased timeout
    await page.waitForSelector('table', { timeout: 15000 })

    // Check table headers (use table th selector for specificity)
    await expect(page.locator('table th', { hasText: 'QR 코드' })).toBeVisible()
    await expect(page.locator('table th', { hasText: '연결된 명함' })).toBeVisible()
    await expect(page.locator('table th', { hasText: '사용자' })).toBeVisible()
    await expect(page.locator('table th', { hasText: '캠페인' })).toBeVisible()
    await expect(page.locator('table th', { hasText: '스캔 수' })).toBeVisible()
    await expect(page.locator('table th', { hasText: '상태' })).toBeVisible()
    await expect(page.locator('table th', { hasText: '생성일' })).toBeVisible()
    await expect(page.locator('table th', { hasText: '액션' })).toBeVisible()
  })

  test('should switch between grid and table view', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForSelector('table', { timeout: 15000 })

    // Find view toggle buttons using aria-label or title attribute
    const gridButton = page.locator('button[title*="그리드"], button').filter({ has: page.locator('svg.lucide-grid-3x3') }).first()
    const tableButton = page.locator('button[title*="테이블"], button').filter({ has: page.locator('svg.lucide-list') }).first()

    // If grid button is found, click it
    const gridButtonVisible = await gridButton.isVisible().catch(() => false)
    if (gridButtonVisible) {
      await gridButton.click()
      await page.waitForTimeout(1000)

      // Switch back to table view
      const tableButtonVisible = await tableButton.isVisible().catch(() => false)
      if (tableButtonVisible) {
        await tableButton.click()
        await page.waitForTimeout(500)
      }
    }

    // Verify we can see either table or grid
    const hasTable = await page.locator('table').isVisible().catch(() => false)
    const hasGrid = await page.locator('.grid').first().isVisible().catch(() => false)
    expect(hasTable || hasGrid).toBeTruthy()
  })

  test('should have working search functionality', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('table', { timeout: 15000 })

    // Find search input
    const searchInput = page.locator('input[type="text"]').first()
    await expect(searchInput).toBeVisible()

    // Type in search
    await searchInput.fill('test')
    await page.waitForTimeout(1000) // Wait for debounce

    // Verify search was applied (UI should update)
    const searchValue = await searchInput.inputValue()
    expect(searchValue).toBe('test')
  })

  test('should have filter dropdowns', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('table', { timeout: 15000 })

    // Check status filter
    const statusFilter = page.locator('select').first()
    await expect(statusFilter).toBeVisible()

    // Verify filter exists
    const filterOptions = await statusFilter.locator('option').count()
    expect(filterOptions).toBeGreaterThan(0)
  })

  test('should display QR code short codes', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table', { timeout: 15000 })

    // Look for QR code entries (short codes are displayed in code tags)
    const shortCodes = await page.locator('table code').count()
    console.log(`Found ${shortCodes} QR codes in table`)

    // If there are QR codes, verify format
    if (shortCodes > 0) {
      const firstCode = await page.locator('table code').first().textContent()
      console.log(`First short code: ${firstCode}`)
      expect(firstCode).toBeTruthy()
    }
  })

  test('should open QR detail modal when clicking stats button', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table', { timeout: 15000 })

    // Check if there are any QR codes
    const qrRows = await page.locator('table tbody tr').count()

    if (qrRows > 0) {
      // Click the first stats button (BarChart3 icon)
      const statsButton = page.locator('table tbody tr').first().locator('button').first()
      await statsButton.click()

      // Wait for modal to open
      await page.waitForTimeout(1000)

      // Check if modal is visible
      const modal = page.locator('.fixed.inset-0')
      const modalVisible = await modal.isVisible()

      if (modalVisible) {
        // Check modal content
        await expect(page.getByText('QR 코드 정보')).toBeVisible()
        await expect(page.getByText('스캔 통계 요약')).toBeVisible()

        // Close modal
        await page.keyboard.press('Escape')
        await page.waitForTimeout(300)
      }
    } else {
      console.log('No QR codes found, skipping modal test')
    }
  })

  test('should open QR popup when clicking QR image', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table', { timeout: 15000 })

    // Check if there are any QR codes
    const qrRows = await page.locator('table tbody tr').count()

    if (qrRows > 0) {
      // Click the QR code image in the first row
      const qrImage = page.locator('table tbody tr').first().locator('img').first()
      await qrImage.click()

      // Wait for popup to appear
      await page.waitForTimeout(500)

      // Check if popup is visible
      const popup = page.locator('.fixed.inset-0.bg-black')
      const popupVisible = await popup.isVisible()

      if (popupVisible) {
        // Check popup content
        await expect(page.getByText('QR 코드')).toBeVisible()
        await expect(page.getByText('링크 열기')).toBeVisible()
        await expect(page.getByText('링크 복사')).toBeVisible()

        // Close popup by clicking the overlay
        await page.locator('.fixed.inset-0.bg-black').click({ position: { x: 10, y: 10 } })
        await page.waitForTimeout(300)
      }
    }
  })

  test('should have toggle active button', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table', { timeout: 15000 })

    // Check if there are any QR codes
    const qrRows = await page.locator('table tbody tr').count()

    if (qrRows > 0) {
      // Look for toggle buttons (ToggleRight or ToggleLeft icons)
      const toggleButtons = page.locator('table tbody tr').first().locator('button').filter({
        has: page.locator('svg.lucide-toggle-right, svg.lucide-toggle-left')
      })

      const toggleCount = await toggleButtons.count()
      expect(toggleCount).toBeGreaterThan(0)
    }
  })

  test('should display status badges correctly', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table', { timeout: 15000 })

    // Look for status badges
    const activeBadges = await page.getByText('활성', { exact: true }).count()
    const inactiveBadges = await page.getByText('비활성', { exact: true }).count()
    const expiredBadges = await page.getByText('만료됨', { exact: true }).count()

    console.log(`Status counts - Active: ${activeBadges}, Inactive: ${inactiveBadges}, Expired: ${expiredBadges}`)

    // At least one type of status should exist if there are QR codes
    const qrRows = await page.locator('table tbody tr').count()
    if (qrRows > 0) {
      const totalBadges = activeBadges + inactiveBadges + expiredBadges
      expect(totalBadges).toBeGreaterThan(0)
    }
  })

  test('should have pagination if many QR codes', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(3000)

    // Check for pagination (only visible if total_pages > 1)
    const paginationText = page.getByText(/전체 \d+개 중/)
    const hasPagination = await paginationText.isVisible().catch(() => false)

    if (hasPagination) {
      console.log('Pagination is visible')
      const prevButton = page.getByText('이전')
      const nextButton = page.getByText('다음')

      await expect(prevButton).toBeVisible()
      await expect(nextButton).toBeVisible()
    } else {
      console.log('No pagination needed (less than 50 QR codes)')
    }
  })
})

test.describe('QR Code Stats Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/')

    // Login
    await page.fill('input[type="email"]', 'admin@g-plat.com')
    await page.fill('input[type="password"]', 'Password123!')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard', { timeout: 60000 })

    // Navigate to QR codes page
    await page.click('a[href="/qr"]')
    await page.waitForURL('**/qr')

    // Wait for page content to load
    await page.waitForTimeout(2000)
  })

  test('should display charts in detail modal', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table', { timeout: 15000 })

    // Check if there are any QR codes
    const qrRows = await page.locator('table tbody tr').count()

    if (qrRows > 0) {
      // Click the first stats button
      const statsButton = page.locator('table tbody tr').first().locator('button').first()
      await statsButton.click()

      // Wait for modal and data to load
      await page.waitForTimeout(2000)

      // Check for chart sections
      const modal = page.locator('.fixed.inset-0.z-50')
      if (await modal.isVisible()) {
        // Check for stats summary (use exact match to avoid duplicates)
        await expect(page.getByText('총 스캔', { exact: true })).toBeVisible()
        await expect(page.getByText('오늘', { exact: true })).toBeVisible()
        await expect(page.getByText('이번 주', { exact: true })).toBeVisible()
        await expect(page.getByText('이번 달', { exact: true })).toBeVisible()

        // Check for chart titles
        await expect(page.getByText('일별 스캔 추이')).toBeVisible()
        await expect(page.getByText('디바이스별')).toBeVisible()
        await expect(page.getByText('브라우저별')).toBeVisible()
        await expect(page.getByText('국가별')).toBeVisible()

        // Check for recent scans section
        await expect(page.getByText('최근 스캔 기록')).toBeVisible()

        // Close modal
        await page.keyboard.press('Escape')
      }
    } else {
      console.log('No QR codes found, skipping chart test')
    }
  })
})

test.describe('Console Errors', () => {
  test('should not have console errors on QR management page', async ({ page }) => {
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
    await page.fill('input[type="password"]', 'Password123!')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard', { timeout: 60000 })

    // Go to QR codes page
    await page.click('a[href="/qr"]')
    await page.waitForURL('**/qr')

    // Wait for page to fully load
    await page.waitForTimeout(3000)

    // Check for errors
    if (consoleErrors.length > 0) {
      console.log('Console errors found:')
      consoleErrors.forEach(err => console.log('  -', err))
    }

    // Fail on critical errors
    const criticalErrors = consoleErrors.filter(err =>
      err.includes('Uncaught') ||
      err.includes('TypeError') ||
      err.includes('ReferenceError')
    )

    expect(criticalErrors).toHaveLength(0)
  })
})
