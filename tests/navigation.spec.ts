import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display header with tournament name', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('#logo-text')).toBeVisible()
  })

  test('should switch between tournaments', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Default should be Lion Championship
    await expect(page.locator('button.tournament-btn.active:has-text("Lion Championship")')).toBeVisible()

    // Click UFC button
    await page.click('button:has-text("UFC")')
    await page.waitForTimeout(300)
    await expect(page.locator('button.tournament-btn.active:has-text("UFC")')).toBeVisible()

    // Click Lion Championship button
    await page.click('button:has-text("Lion Championship")')
    await page.waitForTimeout(300)
    await expect(page.locator('button.tournament-btn.active:has-text("Lion Championship")')).toBeVisible()
  })

  test('should navigate between pages', async ({ page }) => {
    // Should redirect to /events
    await page.waitForURL('**/events')
    await expect(page.locator('nav a:has-text("Events")')).toHaveClass(/active/)
    expect(page.url()).toBe('http://localhost:3000/events')

    // Navigate to Athletes
    await page.click('nav a:has-text("Athletes")')
    await page.waitForURL('**/athletes')
    const athletesLink = page.locator('nav').getByText('Athletes', { exact: true })
    await expect(athletesLink).toHaveClass(/active/)
    await expect(page.locator('h1:has-text("Athletes")')).toBeVisible()
    expect(page.url()).toBe('http://localhost:3000/athletes')

    // Navigate to Rankings
    await page.click('nav a:has-text("Rankings")')
    await page.waitForURL('**/rankings')
    const rankingsLink = page.locator('nav').getByText('Rankings', { exact: true })
    await expect(rankingsLink).toHaveClass(/active/)
    expect(page.url()).toBe('http://localhost:3000/rankings')

    // Navigate back to Events
    await page.click('nav a:has-text("Events")')
    await page.waitForURL('**/events')
    const eventsLink = page.locator('nav').getByText('Events', { exact: true })
    await expect(eventsLink).toHaveClass(/active/)
    expect(page.url()).toBe('http://localhost:3000/events')
  })

  test('should have all navigation tabs', async ({ page }) => {
    await expect(page.locator('nav a:has-text("Events")')).toBeVisible()
    await expect(page.locator('nav a:has-text("Athletes")')).toBeVisible()
    await expect(page.locator('nav a:has-text("Rankings")')).toBeVisible()
  })

  test('should apply theme based on tournament', async ({ page }) => {
    // Lion Championship theme (should be default)
    const lionBody = await page.locator('body')
    await expect(lionBody).toHaveClass(/lion-theme/)

    // UFC theme (no lion-theme class)
    await page.click('button:has-text("UFC")')

    // Wait for theme to be removed by checking the body class
    await page.waitForFunction(
      () => !document.body.classList.contains('lion-theme'),
      { timeout: 5000 }
    )

    const ufcBody = await page.locator('body')
    await expect(ufcBody).not.toHaveClass(/lion-theme/)
  })

  test('should load correct page when accessing URL directly', async ({ page }) => {
    // Direct access to /athletes
    await page.goto('/athletes')
    await page.waitForTimeout(200)
    const athletesLink = page.locator('nav').getByText('Athletes', { exact: true })
    await expect(athletesLink).toHaveClass(/active/)
    await expect(page.locator('h1:has-text("Athletes")')).toBeVisible()
    expect(page.url()).toBe('http://localhost:3000/athletes')

    // Direct access to /rankings
    await page.goto('/rankings')
    await page.waitForTimeout(200)
    const rankingsLink = page.locator('nav').getByText('Rankings', { exact: true })
    await expect(rankingsLink).toHaveClass(/active/)
    expect(page.url()).toBe('http://localhost:3000/rankings')

    // Direct access to /events
    await page.goto('/events')
    await page.waitForTimeout(200)
    const eventsLink = page.locator('nav').getByText('Events', { exact: true })
    await expect(eventsLink).toHaveClass(/active/)
    expect(page.url()).toBe('http://localhost:3000/events')

    // Direct access to / should redirect to /events
    await page.goto('/')
    await page.waitForURL('**/events')
    const eventsLink2 = page.locator('nav').getByText('Events', { exact: true })
    await expect(eventsLink2).toHaveClass(/active/)
    expect(page.url()).toBe('http://localhost:3000/events')
  })
})
