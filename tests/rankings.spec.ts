import { test, expect } from '@playwright/test'

test.describe('Rankings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/rankings')
    await page.waitForLoadState('networkidle')
  })

  test('should display Rankings page title', async ({ page }) => {
    await expect(page.locator('h1:has-text("Rankings")')).toBeVisible()
  })

  test('should display Pound-for-Pound rankings section', async ({ page }) => {
    await expect(page.locator('h2:has-text("Pound-for-Pound Top Fighters")')).toBeVisible()
  })

  test('should display P4P rankings table with headers', async ({ page }) => {
    const pfpSection = page.locator('section').filter({ hasText: 'Pound-for-Pound Top Fighters' })
    await expect(pfpSection.locator('.table-header .rank-col')).toContainText('Rank')
    await expect(pfpSection.locator('.table-header .fighter-col')).toContainText('Fighter')
    await expect(pfpSection.locator('.table-header .record-col')).toContainText('Division/Status')
    await expect(pfpSection.locator('.table-header .move-col')).toContainText('Move')
  })

  test('should display P4P ranked fighters', async ({ page }) => {
    // Should have at least one ranked fighter
    const pfpSection = page.locator('section').filter({ hasText: 'Pound-for-Pound Top Fighters' })
    const firstRow = pfpSection.locator('.table-row').first()
    await expect(firstRow.locator('.rank-col')).toContainText('#1')
    await expect(firstRow.locator('.fighter-col')).not.toBeEmpty()
  })

  test('should display Lightweight Division section', async ({ page }) => {
    await expect(page.locator('h2:has-text("Lightweight Division")')).toBeVisible()
  })

  test('should display Lightweight champion', async ({ page }) => {
    const lightweightSection = page.locator('section').filter({ hasText: 'Lightweight Division' })
    await expect(lightweightSection.locator('.champion-card')).toBeVisible()
    await expect(lightweightSection.locator('.champion-badge')).toContainText('Champion')
    await expect(lightweightSection.locator('.champion-name')).not.toBeEmpty()
    await expect(lightweightSection.locator('.champion-record')).not.toBeEmpty()
  })

  test('should display Lightweight division rankings table', async ({ page }) => {
    const lightweightSection = page.locator('section').filter({ hasText: 'Lightweight Division' })
    await expect(lightweightSection.locator('.table-header .rank-col')).toContainText('Rank')
    await expect(lightweightSection.locator('.table-header .fighter-col')).toContainText('Fighter')
    await expect(lightweightSection.locator('.table-header .record-col')).toContainText('Record')
    await expect(lightweightSection.locator('.table-header .move-col')).toContainText('Move')
  })

  test('should display ranked fighters in Lightweight division', async ({ page }) => {
    const lightweightSection = page.locator('section').filter({ hasText: 'Lightweight Division' })
    const firstRow = lightweightSection.locator('.rankings-table .table-row').first()
    await expect(firstRow.locator('.rank-col')).toContainText('#1')
    await expect(firstRow.locator('.fighter-col')).not.toBeEmpty()
    await expect(firstRow.locator('.record-col')).not.toBeEmpty()
  })

  test('should display rankings for both tournaments', async ({ page }) => {
    // Test Lion Championship (default)
    await expect(page.locator('h1:has-text("Rankings")')).toBeVisible()
    await expect(page.locator('.champion-name')).not.toBeEmpty()

    // Switch to UFC
    await page.click('button:has-text("UFC")')
    await page.waitForTimeout(300)

    // Should still show rankings
    await expect(page.locator('h1:has-text("Rankings")')).toBeVisible()
    await expect(page.locator('.champion-name')).not.toBeEmpty()
  })

  test('should maintain rankings page when switching tournaments', async ({ page }) => {
    // Should be on rankings page
    await expect(page.url()).toBe('http://localhost:3000/rankings')

    // Switch tournament
    await page.click('button:has-text("UFC")')
    await page.waitForTimeout(300)

    // Should still be on rankings page
    await expect(page.url()).toBe('http://localhost:3000/rankings')
    await expect(page.locator('h1:has-text("Rankings")')).toBeVisible()
  })
})
