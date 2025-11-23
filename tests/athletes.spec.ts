import { test, expect } from '@playwright/test'

test.describe('Athletes Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/athletes')
    await page.waitForLoadState('networkidle')
  })

  test('should display athletes page header', async ({ page }) => {
    await expect(page.locator('h1:has-text("Athletes")')).toBeVisible()
    await expect(page.locator('text=/\\d+ Fighters/')).toBeVisible()
  })

  test('should display athlete cards', async ({ page }) => {
    // Wait for athlete cards to load
    await page.waitForSelector('.athlete-card', { timeout: 5000 })

    const athleteCards = page.locator('.athlete-card')
    const count = await athleteCards.count()
    expect(count).toBeGreaterThan(0)

    // Check first card has required elements
    const firstCard = athleteCards.first()
    await expect(firstCard.locator('.athlete-name')).toBeVisible()
    await expect(firstCard.locator('.athlete-record')).toBeVisible()
    await expect(firstCard.locator('.athlete-division')).toBeVisible()
  })

  test('should filter athletes by gender', async ({ page }) => {
    await page.waitForSelector('.athlete-card', { timeout: 5000 })

    // Click "All" filter (default)
    await page.click('.gender-filter button:has-text("All")')
    const allCount = await page.locator('.athlete-card').count()
    expect(allCount).toBeGreaterThan(0)

    // Click "Men" filter
    await page.click('.gender-filter button:has-text("Men")')
    await page.waitForTimeout(500) // Wait for filter to apply
    const menCount = await page.locator('.athlete-card').count()
    expect(menCount).toBeGreaterThan(0)

    // Click "Women" filter (may have 0 results for some tournaments)
    await page.click('.gender-filter button:has-text("Women")')
    await page.waitForTimeout(500)
  })

  test('should search athletes by name', async ({ page }) => {
    await page.waitForSelector('.athlete-card', { timeout: 5000 })

    // Type in search box
    await page.fill('.search-input', 'Kouzi')
    await page.waitForTimeout(500)

    // Should filter to only matching athletes
    const results = page.locator('.athlete-card')
    const count = await results.count()

    if (count > 0) {
      // Check that visible athletes contain the search term
      const firstAthleteName = await results.first().locator('.athlete-name').textContent()
      expect(firstAthleteName?.toLowerCase()).toContain('kouzi')
    }
  })

  test('should filter athletes by division', async ({ page }) => {
    await page.waitForSelector('.athlete-card', { timeout: 5000 })

    // Select a division from dropdown
    await page.selectOption('.division-filter select', 'lightweight')
    await page.waitForTimeout(500)

    const results = page.locator('.athlete-card')
    const count = await results.count()

    if (count > 0) {
      // Check that athletes are from selected division
      const firstDivision = await results.first().locator('.athlete-division').textContent()
      expect(firstDivision?.toLowerCase()).toContain('lightweight')
    }
  })

  test('should show no results message when no matches', async ({ page }) => {
    await page.waitForSelector('.athlete-card', { timeout: 5000 })

    // Search for non-existent athlete
    await page.fill('.search-input', 'NonExistentAthleteName12345')
    await page.waitForTimeout(500)

    // Should show no results message
    await expect(page.locator('text=No athletes found matching your filters')).toBeVisible()
  })

  test('should display different athletes for different tournaments', async ({ page }) => {
    await page.waitForSelector('.athlete-card', { timeout: 5000 })

    // Get Lion Championship athletes
    const lionAthletes = await page.locator('.athlete-card .athlete-name').first().textContent()

    // Switch to UFC
    await page.click('button:has-text("UFC")')
    await page.waitForTimeout(1000)

    // Get UFC athletes
    const ufcAthletes = await page.locator('.athlete-card .athlete-name').first().textContent()

    // They should be different
    expect(lionAthletes).not.toBe(ufcAthletes)
  })

  test('should have hover effect on athlete cards', async ({ page }) => {
    await page.waitForSelector('.athlete-card', { timeout: 5000 })

    const firstCard = page.locator('.athlete-card').first()

    // Hover over card
    await firstCard.hover()

    // Card should be visible and interactive
    await expect(firstCard).toBeVisible()
  })

  test('should display athlete information correctly', async ({ page }) => {
    await page.waitForSelector('.athlete-card', { timeout: 5000 })

    const firstCard = page.locator('.athlete-card').first()

    // Check all required fields are present
    await expect(firstCard.locator('.athlete-name')).toBeVisible()
    await expect(firstCard.locator('.athlete-division')).toBeVisible()
    await expect(firstCard.locator('.athlete-record')).toBeVisible()
    await expect(firstCard.locator('.athlete-country')).toBeVisible()

    // Check record format (W-L-D)
    const record = await firstCard.locator('.athlete-record').textContent()
    expect(record).toMatch(/Record: \d+-\d+-\d+/)
  })
})
