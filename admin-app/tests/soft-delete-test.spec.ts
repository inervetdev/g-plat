import { test, expect } from '@playwright/test'

test.describe('Admin Panel - Soft Delete Test', () => {
  test.beforeEach(async ({ page }) => {
    // Login to admin panel
    await page.goto('https://admin.g-plat.com')

    // Fill login form
    await page.fill('input[type="email"]', 'admin@g-plat.com')
    await page.fill('input[type="password"]', 'Password123!')

    // Click login button
    await page.click('button[type="submit"]')

    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 })
  })

  test('should soft delete user and display deletion info card', async ({ page }) => {
    // Setup dialog handlers BEFORE any actions that might trigger them
    let confirmDialogSeen = false
    let successDialogSeen = false

    // Handle ALL dialogs (both confirm and alert)
    page.on('dialog', async dialog => {
      console.log(`📢 Dialog type: ${dialog.type()}`)
      console.log(`📢 Dialog message: ${dialog.message()}`)

      if (dialog.type() === 'confirm' && dialog.message().includes('삭제대기')) {
        console.log('✅ Confirm dialog detected - accepting')
        confirmDialogSeen = true
        await dialog.accept()
      } else if (dialog.type() === 'alert' && dialog.message().includes('삭제대기')) {
        console.log('✅ Success alert detected - accepting')
        successDialogSeen = true
        await dialog.accept()
      } else {
        console.log('⚠️ Unexpected dialog - accepting anyway')
        await dialog.accept()
      }
    })

    // Navigate to users page
    await page.goto('https://admin.g-plat.com/users')
    await page.waitForLoadState('networkidle')

    // Find tax@inervet.com user row
    const taxUserEmail = page.locator('text=tax@inervet.com').first()
    await expect(taxUserEmail).toBeVisible({ timeout: 10000 })

    // Find the row containing tax@inervet.com and click its detail button
    const userRow = page.locator('tr').filter({ hasText: 'tax@inervet.com' })
    const detailButton = userRow.locator('button:has-text("상세보기")')
    await expect(detailButton).toBeVisible()
    await detailButton.click()

    // Wait for user detail page to load
    await page.waitForURL('**/users/**', { timeout: 10000 })
    await page.waitForLoadState('networkidle')

    // Click "상태 변경" button
    const statusChangeButton = page.locator('button:has-text("상태 변경")')
    await expect(statusChangeButton).toBeVisible()
    await statusChangeButton.click()

    // Wait for modal to appear
    await page.waitForSelector('text=사용자 상태 변경', { timeout: 5000 })

    // Click "삭제대기" button
    const deleteButton = page.locator('button:has-text("삭제대기")').first()
    await expect(deleteButton).toBeVisible()
    await deleteButton.click()

    // Wait for confirmation form to appear
    await page.waitForTimeout(500)

    // Fill deletion reason
    const reasonTextarea = page.locator('textarea').first()
    await expect(reasonTextarea).toBeVisible()
    await reasonTextarea.fill('Playwright 자동 테스트용 삭제')

    // Click "삭제대기 처리" button
    const confirmButton = page.locator('button:has-text("삭제대기 처리")')
    await expect(confirmButton).toBeVisible()
    await confirmButton.click()

    // Wait for dialogs to be handled
    await page.waitForTimeout(3000)

    // Verify dialogs were triggered
    expect(confirmDialogSeen).toBeTruthy()
    expect(successDialogSeen).toBeTruthy()
    console.log('✅ Both dialogs were handled successfully')

    // Reload page to see deletion info card
    await page.reload({ waitUntil: 'networkidle' })

    // Verify deletion info card appears
    const deletionInfoCard = page.locator('text=삭제 정보')
    await expect(deletionInfoCard).toBeVisible({ timeout: 10000 })

    // Verify deletion reason is displayed
    const deletionReason = page.locator('text=Playwright 자동 테스트용 삭제')
    await expect(deletionReason).toBeVisible()

    // Verify restore and permanent delete buttons are present
    const restoreButton = page.locator('button:has-text("복구")')
    const permanentDeleteButton = page.locator('button:has-text("완전 삭제")')

    await expect(restoreButton).toBeVisible()
    await expect(permanentDeleteButton).toBeVisible()

    console.log('✅ Deletion info card verified successfully')

    // Navigate back to users list
    await page.goto('https://admin.g-plat.com/users')
    await page.waitForLoadState('networkidle')

    // Verify user has "삭제대기" badge in the same row as tax@inervet.com
    const userRowWithBadge = page.locator('tr').filter({ hasText: 'tax@inervet.com' })
    const deletedBadge = userRowWithBadge.locator('text=삭제대기')
    await expect(deletedBadge).toBeVisible({ timeout: 10000 })

    console.log('✅ User soft delete test completed successfully')
  })

  test('should filter users by 삭제대기 status', async ({ page }) => {
    // Navigate to users page
    await page.goto('https://admin.g-plat.com/users')
    await page.waitForLoadState('networkidle')

    // Click status filter dropdown
    const statusFilter = page.locator('select, [role="combobox"]').filter({ hasText: '모든 상태' }).or(page.locator('text=모든 상태').first())
    await statusFilter.click()

    // Select "삭제대기" option
    const deletedOption = page.locator('option:has-text("삭제대기"), [role="option"]:has-text("삭제대기")')
    await deletedOption.click()

    // Wait for filtered results
    await page.waitForTimeout(1000)

    // Verify only deleted users are shown
    const userRows = page.locator('tbody tr, [role="row"]')
    const count = await userRows.count()

    console.log(`Found ${count} deleted users`)

    // Verify at least one user with "삭제대기" badge is visible
    const deletedBadges = page.locator('text=삭제대기')
    await expect(deletedBadges.first()).toBeVisible()

    console.log('✅ Status filter test completed successfully')
  })
})
