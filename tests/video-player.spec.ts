import { test, expect } from '@playwright/test'

test.describe('Video Player', () => {
  test('should navigate to video player when clicking Watch Video button', async ({ page }) => {
    await page.goto('/events/lc27')
    await page.waitForSelector('.fight-card', { timeout: 5000 })

    // Find the Watch Video button
    const watchVideoButton = page.locator('.watch-video-btn').first()
    await expect(watchVideoButton).toBeVisible()

    // Click the Watch Video button
    await watchVideoButton.click()

    // Should navigate to video player page
    await page.waitForURL(/\/matches\/.*\?type=youtube/, { timeout: 5000 })
  })

  test('should display YouTube embed player for YouTube videos', async ({ page }) => {
    await page.goto('/events/lc27')
    await page.waitForSelector('.watch-video-btn', { timeout: 5000 })

    // Click the Watch Video button
    const watchVideoButton = page.locator('.watch-video-btn').first()
    await watchVideoButton.click()

    // Wait for video player page
    await page.waitForURL(/\/matches\//, { timeout: 5000 })
    await page.waitForSelector('.match-detail-page', { timeout: 5000 })

    // Should display video container
    await expect(page.locator('.video-container')).toBeVisible()

    // Should display iframe for YouTube video
    await expect(page.locator('.video-container iframe')).toBeVisible()
  })

  test('should load correct YouTube video in embed player', async ({ page }) => {
    await page.goto('/events/lc27')
    await page.waitForSelector('.watch-video-btn', { timeout: 5000 })

    // Click the Watch Video button
    const watchVideoButton = page.locator('.watch-video-btn').first()
    await watchVideoButton.click()

    // Wait for video player page
    await page.waitForURL(/\/matches\//, { timeout: 5000 })
    await page.waitForSelector('iframe', { timeout: 5000 })

    // Check iframe src contains YouTube embed URL
    const iframe = page.locator('.video-container iframe')
    const src = await iframe.getAttribute('src')

    expect(src).toBeTruthy()
    expect(src).toContain('youtube.com/embed')
  })

  test('should handle YouTube watch URLs correctly', async ({ page }) => {
    await page.goto('/events/lc27')
    await page.waitForSelector('.watch-video-btn', { timeout: 5000 })

    // Find a Watch Video button for a match with youtube.com/watch URL
    const watchVideoButtons = page.locator('.watch-video-btn')
    const count = await watchVideoButtons.count()

    expect(count).toBeGreaterThan(0)

    // Click the first Watch Video button
    await watchVideoButtons.first().click()

    // Wait for video player page
    await page.waitForURL(/\/matches\//, { timeout: 5000 })
    await page.waitForSelector('iframe', { timeout: 5000 })

    // Verify iframe src is an embed URL
    const iframe = page.locator('.video-container iframe')
    const src = await iframe.getAttribute('src')

    expect(src).toContain('youtube.com/embed')
  })

  test('should handle YouTube short URLs (youtu.be) with timestamps', async ({ page }) => {
    // Navigate directly to a match with youtu.be URL with timestamp
    const matchUrl = '/matches/lc27-0-1?type=youtube&url=https%3A%2F%2Fyoutu.be%2FBsNMsP8seRg%3Ft%3D8894&tournament=lion'
    await page.goto(matchUrl)

    await page.waitForSelector('.match-detail-page', { timeout: 5000 })
    await page.waitForSelector('iframe', { timeout: 5000 })

    // Check iframe src contains YouTube embed URL with timestamp parameter
    const iframe = page.locator('.video-container iframe')
    const src = await iframe.getAttribute('src')

    expect(src).toBeTruthy()
    expect(src).toContain('youtube.com/embed/BsNMsP8seRg')
    expect(src).toContain('start=8894')
  })

  test('should display video player with correct layout', async ({ page }) => {
    await page.goto('/events/lc27')
    await page.waitForSelector('.watch-video-btn', { timeout: 5000 })

    await page.locator('.watch-video-btn').first().click()
    await page.waitForURL(/\/matches\//, { timeout: 5000 })
    await page.waitForSelector('.match-detail-page', { timeout: 5000 })

    // Check video player page elements
    await expect(page.locator('.match-detail-page')).toBeVisible()
    await expect(page.locator('.video-container')).toBeVisible()

    // Video container should have proper dimensions
    const videoContainer = page.locator('.video-container')
    const boundingBox = await videoContainer.boundingBox()

    expect(boundingBox).toBeTruthy()
    if (boundingBox) {
      // Should have aspect ratio close to 16:9
      const ratio = boundingBox.width / boundingBox.height
      expect(ratio).toBeGreaterThan(1.5) // Allow some tolerance
      expect(ratio).toBeLessThan(2.0)
    }
  })

  test('should allow fullscreen on video player', async ({ page }) => {
    await page.goto('/events/lc27')
    await page.waitForSelector('.watch-video-btn', { timeout: 5000 })

    await page.locator('.watch-video-btn').first().click()
    await page.waitForURL(/\/matches\//, { timeout: 5000 })
    await page.waitForSelector('iframe', { timeout: 5000 })

    // Check iframe has allowFullScreen attribute
    const iframe = page.locator('.video-container iframe')
    const allowFullScreen = await iframe.getAttribute('allowfullscreen')

    // The attribute might be empty string or null but should exist
    expect(allowFullScreen !== null).toBeTruthy()
  })

  test('should handle multiple videos on same event page', async ({ page }) => {
    await page.goto('/events/lc27')
    await page.waitForSelector('.watch-video-btn', { timeout: 5000 })

    // Get all Watch Video buttons
    const watchVideoButtons = page.locator('.watch-video-btn')
    const count = await watchVideoButtons.count()

    // lc27 has 2 matches with videos
    expect(count).toBeGreaterThanOrEqual(1)

    // Click first video button
    await watchVideoButtons.first().click()
    await page.waitForURL(/\/matches\/lc27-0-0/, { timeout: 5000 })
    await expect(page.locator('iframe')).toBeVisible()

    // Go back
    await page.goBack()
    await page.waitForURL('/events/lc27', { timeout: 5000 })

    // Click another video button if available
    if (count > 1) {
      await watchVideoButtons.nth(1).click()
      await page.waitForURL(/\/matches\/lc27-.*/, { timeout: 5000 })
      await expect(page.locator('iframe')).toBeVisible()
    }
  })

  test('should display no video message when video URL is missing', async ({ page }) => {
    // Navigate directly to video player without url parameter
    await page.goto('/matches/test-match?type=youtube')
    await page.waitForSelector('.match-detail-page', { timeout: 5000 })

    // Should display "No video available" message
    await expect(page.locator('.no-video')).toBeVisible()
    await expect(page.locator('.no-video p')).toContainText('No video available')
  })
})

test.describe('Match Detail Page', () => {
  test('should display match details section', async ({ page }) => {
    await page.goto('/events/lc27')
    await page.waitForSelector('.watch-video-btn', { timeout: 5000 })

    // Click the Watch Video button
    await page.locator('.watch-video-btn').first().click()
    await page.waitForURL(/\/matches\//, { timeout: 5000 })
    await page.waitForSelector('.match-detail-page', { timeout: 5000 })

    // Should display match info section
    await expect(page.locator('.match-info')).toBeVisible()
    await expect(page.locator('.match-title')).toContainText('Match Details')
  })

  test('should display fighter information', async ({ page }) => {
    await page.goto('/matches/lc27-0-0?type=youtube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DBsNMsP8seRg&tournament=lion')
    await page.waitForSelector('.match-detail-page', { timeout: 5000 })

    // Wait for match data to load
    await page.waitForSelector('.match-info', { timeout: 5000 })

    // Should display fighter cards
    const fighterCards = page.locator('.fighter-card')
    await expect(fighterCards).toHaveCount(2)

    // Should display fighter names
    const fighterNames = page.locator('.fighter-card h3')
    const count = await fighterNames.count()
    expect(count).toBe(2)
  })

  test('should display event information', async ({ page }) => {
    await page.goto('/matches/lc27-0-0?type=youtube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DBsNMsP8seRg&tournament=lion')
    await page.waitForSelector('.match-detail-page', { timeout: 5000 })
    await page.waitForSelector('.event-info', { timeout: 5000 })

    // Should display event info rows
    await expect(page.locator('.info-row').filter({ hasText: 'Event:' })).toBeVisible()
    await expect(page.locator('.info-row').filter({ hasText: 'Date:' })).toBeVisible()
    await expect(page.locator('.info-row').filter({ hasText: 'Location:' })).toBeVisible()
    await expect(page.locator('.info-row').filter({ hasText: 'Category:' })).toBeVisible()
  })

  test('should highlight winner with badge', async ({ page }) => {
    await page.goto('/matches/lc27-0-0?type=youtube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DBsNMsP8seRg&tournament=lion')
    await page.waitForSelector('.match-detail-page', { timeout: 5000 })
    await page.waitForSelector('.fighter-card.winner', { timeout: 5000 })

    // Should have exactly one winner
    const winners = page.locator('.fighter-card.winner')
    await expect(winners).toHaveCount(1)

    // Winner should have WINNER badge
    await expect(page.locator('.winner-badge')).toBeVisible()
    await expect(page.locator('.winner-badge')).toContainText('WINNER')
  })

  test('should have back to events link', async ({ page }) => {
    await page.goto('/matches/lc27-0-0?type=youtube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DBsNMsP8seRg&tournament=lion')
    await page.waitForSelector('.match-detail-page', { timeout: 5000 })

    // Should have back link
    const backLink = page.locator('.back-link')
    await expect(backLink).toBeVisible()
    await expect(backLink).toContainText('Back to Events')

    // Click back link
    await backLink.click()

    // Should navigate back to home page
    await page.waitForURL('/?tournament=lion', { timeout: 5000 })
  })
})
