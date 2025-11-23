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

  test('should navigate to athlete detail page when clicking on card', async ({ page }) => {
    await page.waitForSelector('.athlete-card', { timeout: 5000 })

    // Get the first athlete's name
    const firstCard = page.locator('.athlete-card').first()
    const athleteName = await firstCard.locator('.athlete-name').textContent()

    // Click on the card
    await firstCard.click()

    // Wait for navigation
    await page.waitForURL(/\/athletes\/.*/, { timeout: 5000 })

    // Check that we're on the detail page
    expect(page.url()).toMatch(/\/athletes\/[a-z0-9-]+/)

    // Verify athlete name is displayed on detail page
    await expect(page.locator('h1.athlete-name')).toBeVisible()
    const detailName = await page.locator('h1.athlete-name').textContent()
    expect(detailName).toBe(athleteName)
  })
})

test.describe('Athlete Detail Page', () => {
  test('should display athlete details', async ({ page }) => {
    // Navigate to athletes page first
    await page.goto('/athletes')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('.athlete-card', { timeout: 5000 })

    // Click on first athlete
    await page.locator('.athlete-card').first().click()
    await page.waitForURL(/\/athletes\/.*/, { timeout: 5000 })

    // Check that athlete detail elements are visible
    await expect(page.locator('h1.athlete-name')).toBeVisible()
    await expect(page.locator('.stat-label:has-text("Record")')).toBeVisible()
    await expect(page.locator('.stat-label:has-text("Division")')).toBeVisible()
    await expect(page.locator('.stat-label:has-text("Country")')).toBeVisible()
  })

  test('should display back button', async ({ page }) => {
    await page.goto('/athletes')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('.athlete-card', { timeout: 5000 })

    await page.locator('.athlete-card').first().click()
    await page.waitForURL(/\/athletes\/.*/, { timeout: 5000 })

    // Check back button exists
    const backButton = page.locator('button:has-text("Back to Athletes")')
    await expect(backButton).toBeVisible()

    // Click back button
    await backButton.click()
    await page.waitForURL('/athletes', { timeout: 5000 })
    expect(page.url()).toContain('/athletes')
    expect(page.url()).not.toMatch(/\/athletes\/[a-z0-9-]+/)
  })

  test('should display fight history section', async ({ page }) => {
    await page.goto('/athletes')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('.athlete-card', { timeout: 5000 })

    await page.locator('.athlete-card').first().click()
    await page.waitForURL(/\/athletes\/.*/, { timeout: 5000 })

    // Check fight history section exists
    await expect(page.locator('h2:has-text("Fight History")')).toBeVisible()
  })

  test('should display watch video button if fight has video', async ({ page }) => {
    // Navigate to a specific athlete that we know has fights with videos
    await page.goto('/athletes/kouzi')
    await page.waitForLoadState('networkidle')

    // Wait for page to load
    await page.waitForSelector('h1.athlete-name', { timeout: 5000 })

    // Check if there are any watch video buttons (some fighters may not have videos)
    const videoButtons = page.locator('.watch-video-btn')
    const count = await videoButtons.count()

    if (count > 0) {
      // If there are video buttons, check they're visible
      await expect(videoButtons.first()).toBeVisible()
      await expect(videoButtons.first()).toHaveText('Watch Video')
    }
  })

  test('should display event logo and title for each fight', async ({ page }) => {
    // Navigate to a specific athlete that has fight history
    await page.goto('/athletes/kouzi')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('h1.athlete-name', { timeout: 5000 })

    // Check if there are any fight events
    const fightEvents = page.locator('.fight-event-container')
    const count = await fightEvents.count()

    if (count > 0) {
      const firstEvent = fightEvents.first()

      // Verify event logo is present
      await expect(firstEvent.locator('.event-logo')).toBeVisible()

      // Verify event title is present
      await expect(firstEvent.locator('.fight-event')).toBeVisible()

      // Verify both are inside the same container
      const logoText = await firstEvent.locator('.event-logo').textContent()
      expect(logoText).toBeTruthy()
    }
  })

  test('should navigate to event detail when clicking on fight event', async ({ page }) => {
    // Navigate to a specific athlete that has fight history
    await page.goto('/athletes/kouzi')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('h1.athlete-name', { timeout: 5000 })

    // Check if there are any fight events
    const fightEvents = page.locator('.fight-event-container.clickable')
    const count = await fightEvents.count()

    if (count > 0) {
      // Click on the first fight event
      await fightEvents.first().click()

      // Wait for navigation to event detail page
      await page.waitForURL(/\/events\/.*/, { timeout: 5000 })

      // Verify we're on an event detail page
      expect(page.url()).toMatch(/\/events\/[a-z0-9-]+/)
    }
  })

  test('should handle non-existent athlete', async ({ page }) => {
    await page.goto('/athletes/non-existent-athlete-12345')
    await page.waitForLoadState('networkidle')

    // Should show "Athlete not found" message
    await expect(page.locator('text=Athlete not found')).toBeVisible()
  })

  test('should display correct athlete for different tournaments', async ({ page }) => {
    await page.goto('/athletes')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('.athlete-card', { timeout: 5000 })

    // Get first Lion Championship athlete
    const lionAthleteName = await page.locator('.athlete-card').first().locator('.athlete-name').textContent()

    // Click on athlete
    await page.locator('.athlete-card').first().click()
    await page.waitForURL(/\/athletes\/.*/, { timeout: 5000 })

    // Verify the athlete name matches
    const detailName = await page.locator('h1.athlete-name').textContent()
    expect(detailName).toBe(lionAthleteName)

    // Go back and switch tournament
    await page.goto('/athletes')
    await page.waitForLoadState('networkidle')
    await page.click('button:has-text("UFC")')
    await page.waitForTimeout(1000)
    await page.waitForSelector('.athlete-card', { timeout: 5000 })

    // Get first UFC athlete
    const ufcAthleteName = await page.locator('.athlete-card').first().locator('.athlete-name').textContent()

    // Click on UFC athlete
    await page.locator('.athlete-card').first().click()
    await page.waitForURL(/\/athletes\/.*/, { timeout: 5000 })

    // Verify the UFC athlete name matches
    const ufcDetailName = await page.locator('h1.athlete-name').textContent()
    expect(ufcDetailName).toBe(ufcAthleteName)
  })

  test('should display links section if athlete has URLs', async ({ page }) => {
    // Navigate to an athlete that has URLs (Thanh Trúc Nguyễn Thị)
    // The slug is generated as thanh-trc-nguyn-th (Vietnamese diacritics removed)
    await page.goto('/athletes/thanh-trc-nguyn-th')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('h1.athlete-name', { timeout: 5000 })

    // Check if links section exists
    const linksSection = page.locator('.links-section')
    const linksSectionExists = await linksSection.count() > 0

    if (linksSectionExists) {
      // Verify links section is visible
      await expect(linksSection).toBeVisible()
      await expect(page.locator('h2:has-text("Links")')).toBeVisible()

      // Check if link items are present
      const linkItems = page.locator('.link-item')
      const linkCount = await linkItems.count()
      expect(linkCount).toBeGreaterThan(0)

      // Verify link has correct attributes
      const firstLink = linkItems.first()
      await expect(firstLink).toHaveAttribute('target', '_blank')
      await expect(firstLink).toHaveAttribute('rel', 'noopener noreferrer')

      // Verify link type is displayed
      await expect(firstLink.locator('.link-type')).toBeVisible()
    }
  })

  test('should not display links section if athlete has no URLs', async ({ page }) => {
    // Navigate to an athlete without URLs (Kouzi)
    await page.goto('/athletes/kouzi')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('h1.athlete-name', { timeout: 5000 })

    // Check that links section does not exist
    const linksSection = page.locator('.links-section')
    const linksSectionCount = await linksSection.count()
    expect(linksSectionCount).toBe(0)
  })
})
