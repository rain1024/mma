# E2E Tests with Playwright

This directory contains end-to-end tests for the MMA application using Playwright.

The tests are located at the root level of the project to separate E2E testing from the web application code.

## Test Files

- **navigation.spec.ts** - Tests for navigation between pages and tournament switching
- **athletes.spec.ts** - Tests for Athletes page functionality, filtering, and search
- **events.spec.ts** - Tests for Events page display and fight card information

## Running Tests

Navigate to the tests directory (`/Users/anhv/projects/mma/tests`) before running tests.

### Run all tests
```bash
cd tests
yarn test
# or
npx playwright test
```

### Run tests in UI mode
```bash
yarn test:ui
# or
npx playwright test --ui
```

### Run specific test file
```bash
npx playwright test navigation.spec.ts
```

### Run tests in headed mode (see browser)
```bash
yarn test:headed
# or
npx playwright test --headed
```

### Run tests on specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Coverage

### Navigation Tests
- Header and tournament name display
- Tournament switching (UFC ↔ Lion Championship)
- Page navigation (Events, Athletes, Rankings)
- Theme application based on tournament

### Athletes Page Tests
- Page header and athlete count display
- Athlete card rendering
- Gender filtering (All, Men, Women)
- Search functionality
- Division filtering
- No results handling
- Tournament-specific athlete lists
- Athlete information display

### Events Page Tests
- Default page display
- Event header information
- LC26 event display
- Fight card rendering
- Fight categories
- Fighter information
- Winner indicators
- Tournament-specific events
- Match rounds and weight classes

## Configuration

Test configuration is in `playwright.config.ts` in this directory. The config includes:
- Multiple browsers (Chrome, Firefox, Safari)
- Mobile viewport testing (Pixel 5, iPhone 12)
- Automatic dev server startup (runs `cd ../web && yarn dev`)
- Test retry on failure (in CI)
- HTML reporter for results
