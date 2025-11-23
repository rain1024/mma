import { test, expect } from '@playwright/test'

test.describe('Events Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/events')
  })

  test('should display events page by default', async ({ page }) => {
    await expect(page.locator('nav a:has-text("Events")')).toHaveClass(/active/)
  })

  test('should display events list page', async ({ page }) => {
    // Wait for page title to load
    await page.waitForSelector('.page-title', { timeout: 5000 })

    await expect(page.locator('.page-title')).toContainText('Events')
  })

  test('should display latest event section', async ({ page }) => {
    await page.waitForSelector('.latest-event-section', { timeout: 5000 })

    await expect(page.locator('.latest-event-card')).toBeVisible()
    await expect(page.locator('.event-logo')).toBeVisible()
  })

  test('should display all events section', async ({ page }) => {
    await page.waitForSelector('.all-events-section', { timeout: 10000 })
    await page.waitForSelector('.events-grid', { timeout: 5000 })

    // Wait a bit for data to load
    await page.waitForTimeout(500)

    const eventCards = page.locator('.event-card')
    const count = await eventCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should navigate to event detail when clicking on event card', async ({ page }) => {
    await page.waitForSelector('.event-card', { timeout: 5000 })

    // Click on the first event card
    const firstEvent = page.locator('.event-card').first()
    await firstEvent.click()

    // Should navigate to event detail page
    await page.waitForURL(/\/events\/lc\d+/, { timeout: 5000 })

    // Should display event detail page
    await expect(page.locator('.event-header')).toBeVisible()
  })

  test('should display event status badges', async ({ page }) => {
    await page.waitForSelector('.event-status', { timeout: 5000 })

    const statusBadges = page.locator('.event-status')
    const count = await statusBadges.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Event Detail Page', () => {
  test('should display event header information', async ({ page }) => {
    await page.goto('/events/lc27')
    await page.waitForSelector('.event-header', { timeout: 5000 })

    await expect(page.locator('.event-logo')).toBeVisible()
    await expect(page.locator('.event-title')).toBeVisible()
    await expect(page.locator('.event-info')).toBeVisible()
    await expect(page.locator('.event-location')).toBeVisible()
  })

  test('should display fight cards', async ({ page }) => {
    await page.goto('/events/lc27')
    await page.waitForSelector('.fight-card', { timeout: 5000 })

    const fightCards = page.locator('.fight-card')
    const count = await fightCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should display fight categories', async ({ page }) => {
    await page.goto('/events/lc26')
    await page.waitForSelector('.fight-category', { timeout: 5000 })

    // Check for category headers
    const categories = page.locator('.fight-category')
    const count = await categories.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should display fighter information in matches', async ({ page }) => {
    await page.goto('/events/lc26')
    await page.waitForSelector('.fight-card', { timeout: 5000 })

    const firstMatch = page.locator('.fight-card').first()

    // Each match should have two fighters
    await expect(firstMatch.locator('.fighter').first()).toBeVisible()

    // Fighter should have name and flag
    const fighter = firstMatch.locator('.fighter').first()
    await expect(fighter.locator('.fighter-name-text')).toBeVisible()
  })

  test('should display winner indicators for completed events', async ({ page }) => {
    await page.goto('/events/lc26')
    await page.waitForSelector('.fight-card', { timeout: 5000 })

    // Look for matches with winners (they have winner-left or winner-right class)
    const matches = page.locator('.fight-card')
    const count = await matches.count()

    // At least one match should have a winner class
    let hasWinner = false
    for (let i = 0; i < count; i++) {
      const match = matches.nth(i)
      const className = await match.getAttribute('class')
      if (className && (className.includes('winner-left') || className.includes('winner-right'))) {
        hasWinner = true
        break
      }
    }

    expect(hasWinner).toBe(true)
  })

  test('should display match rounds/order', async ({ page }) => {
    await page.goto('/events/lc26')
    await page.waitForSelector('.fight-card', { timeout: 5000 })

    const firstMatch = page.locator('.fight-card').first()

    // Should show round information
    await expect(firstMatch.locator('.fight-round')).toBeVisible()
  })

  test('should display weight classes in matches', async ({ page }) => {
    await page.goto('/events/lc26')
    await page.waitForSelector('.fight-card', { timeout: 5000 })

    const firstMatch = page.locator('.fight-card').first()
    const fighterStats = firstMatch.locator('.fighter-stats')

    if (await fighterStats.count() > 0) {
      const statsText = await fighterStats.first().textContent()
      // Should contain weight information (e.g., "66kg")
      expect(statsText).toMatch(/\d+kg/)
    }
  })

  test('should redirect to /events for invalid event ID', async ({ page }) => {
    await page.goto('/events/invalid-id')
    await page.waitForURL('/events', { timeout: 5000 })
  })

  test('should maintain active navigation state on event detail page', async ({ page }) => {
    await page.goto('/events/lc26')
    await page.waitForSelector('nav', { timeout: 5000 })

    await expect(page.locator('nav a:has-text("Events")')).toHaveClass(/active/)
  })

  test('should display "Watch Video" button for matches with video', async ({ page }) => {
    await page.goto('/events/lc27')
    await page.waitForSelector('.fight-card', { timeout: 5000 })

    // Look for the watch video button
    const watchVideoButton = page.locator('.watch-video-btn')

    // Should have at least one watch video button (lc27 has a match with video)
    await expect(watchVideoButton.first()).toBeVisible()

    // Button should have correct text
    await expect(watchVideoButton.first()).toContainText('Watch Video')

    // Button should have href attribute
    const href = await watchVideoButton.first().getAttribute('href')
    expect(href).toBeTruthy()
    expect(href).toContain('http')
  })

  test('should not display "Watch Video" button for matches without video', async ({ page }) => {
    await page.goto('/events/lc27')
    await page.waitForSelector('.fight-card', { timeout: 5000 })

    // Count all fight cards
    const allFightCards = page.locator('.fight-card')
    const totalCards = await allFightCards.count()

    // Count fight cards with video buttons
    const cardsWithVideo = page.locator('.fight-card:has(.watch-video-btn)')
    const cardsWithVideoCount = await cardsWithVideo.count()

    // Not all cards should have video buttons (lc27 has 9 fights but only 1 has video)
    expect(cardsWithVideoCount).toBeLessThan(totalCards)
  })
})
