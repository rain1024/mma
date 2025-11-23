import { test, expect } from '@playwright/test'

test.describe('Athlete Detail Page', () => {
  test('should display Chelsey Cashwell athlete page', async ({ page }) => {
    // Navigate to the athlete page
    await page.goto('http://localhost:3000/athletes/chelsey-cashwell')

    // Verify the athlete name is displayed (text content is title case)
    await expect(page.locator('.athlete-name')).toContainText('Chelsey Cashwell', { timeout: 10000 })

    // Verify other athlete details
    await expect(page.locator('.stat-value').filter({ hasText: '7-0-0' })).toBeVisible()
    await expect(page.locator('.stat-value').filter({ hasText: 'Bantamweight' })).toBeVisible()
    await expect(page.locator('.stat-value').filter({ hasText: 'USA' })).toBeVisible()
    await expect(page.locator('.stat-value').filter({ hasText: 'Female' })).toBeVisible()

    // Verify back button exists
    await expect(page.locator('.back-button')).toContainText('Back to Athletes')
  })

  test('should navigate back to athletes page', async ({ page }) => {
    await page.goto('http://localhost:3000/athletes/chelsey-cashwell')
    await expect(page.locator('.athlete-name')).toContainText('Chelsey Cashwell', { timeout: 10000 })

    // Click back button
    await page.click('.back-button')

    // Verify we're on the athletes page
    await expect(page).toHaveURL('/athletes')
    await expect(page.locator('h1').filter({ hasText: 'Athletes' })).toBeVisible()
  })
})
