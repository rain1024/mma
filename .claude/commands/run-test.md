# Run Test

## Command Usage
```bash
/run-test
```

## Description
Chạy Playwright tests và phân tích kết quả. Tự động fix các lỗi phát sinh cho đến khi tất cả tests pass.

## Workflow

### 1. Chạy Playwright Tests
```bash
cd tests && npm test
```
- Tự động start dev server trên localhost:3000
- Chạy **Chromium only** (optimized for speed)
- Parallel execution với **10 workers** (maximized performance)
- Chạy tất cả test suites (navigation, athletes, events)
- Generate HTML report

### 2. Phân tích kết quả
- Kiểm tra số lượng tests passed/failed
- Identify các loại lỗi:
  - **Navigation errors**: URL routing, page transitions
  - **Rendering errors**: Components không hiển thị đúng
  - **Timeout errors**: Element không load kịp
  - **Browser compatibility**: Firefox/Safari issues
  - **Assertion errors**: Expected vs actual values khác nhau

### 3. Common Issues và Solutions

#### A. URL Navigation Issues
**Triệu chứng**:
```
Expected: "http://localhost:3000/rankings"
Received: "http://localhost:3000/athletes"
```

**Giải pháp**:
- Kiểm tra `router.push()` có được gọi đúng
- Verify pathname sync trong useEffect
- Sử dụng `page.waitForURL()` thay vì `waitForTimeout()`
- Đảm bảo href attributes đúng trong Navigation component

#### B. Element Not Found
**Triệu chứng**:
```
Timeout: element(s) not found
```

**Giải pháp**:
- Kiểm tra component có render đúng không
- Verify CSS selectors/text locators
- Thêm `waitForLoadState('networkidle')`
- Tăng timeout nếu cần: `{ timeout: 10000 }`

#### C. Browser Compatibility
**Triệu chứng**:
```
browserType.launch: Executable doesn't exist (Firefox/Safari)
```

**Giải pháp**:
- Disable browsers không cần trong `playwright.config.ts`:
```typescript
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  // Comment out Firefox, Safari, Mobile nếu không cần
],
```

#### D. Race Conditions
**Triệu chứng**: Tests fail ngẫu nhiên (flaky tests)

**Giải pháp**:
- Dùng `waitForURL()` cho navigation
- Dùng `waitForSelector()` cho dynamic content
- Tránh `waitForTimeout()` - chỉ dùng khi cần thiết
- Sử dụng `waitForLoadState('networkidle')`

### 4. Best Practices

#### Test Structure
```typescript
test.beforeEach(async ({ page }) => {
  // Goto trực tiếp URL thay vì navigate
  await page.goto('/athletes')
  await page.waitForLoadState('networkidle')
})
```

#### Waiting Strategies
```typescript
// ✅ Good - wait for URL change
await page.click('nav a:has-text("Athletes")')
await page.waitForURL('**/athletes')

// ❌ Bad - arbitrary timeout
await page.click('nav a:has-text("Athletes")')
await page.waitForTimeout(100)
```

#### Assertions
```typescript
// ✅ Good - auto-retry assertions
await expect(page.locator('.athlete-card')).toBeVisible()

// ❌ Bad - no retry
const isVisible = await page.locator('.athlete-card').isVisible()
expect(isVisible).toBe(true)
```

### 5. Debug Tips

#### View HTML Report
```bash
npx playwright show-report
```

#### Run Specific Test
```bash
npx playwright test navigation.spec.ts
```

#### Run with UI Mode
```bash
npx playwright test --ui
```

#### Run with Headed Browser
```bash
npx playwright test --headed
```

#### Debug Mode
```bash
npx playwright test --debug
```

### 6. Performance Optimization

#### Current Configuration (Optimized)
- **Chromium only**: Nhanh hơn 5x so với all browsers
- **20 workers**: Maximized parallelization
- **Reuse existing server**: `reuseExistingServer: true`
- **Smart waiting**: Dùng waitForURL/waitForSelector thay vì fixed timeouts

#### Configuration in playwright.config.ts
```typescript
export default defineConfig({
  workers: 20, // Parallel execution with 10 workers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Firefox, Safari, Mobile disabled for speed
  ],
})
```

#### Performance Comparison
- **All browsers (Firefox + Safari + Mobile)**: ~60-120s, 130 tests
- **Chromium only (4 workers)**: ~15-20s, 26 tests
- **Chromium only (10 workers)**: ~5-10s, 26 tests ⚡️

## Success Criteria
- ✅ All tests passed (100%)
- ✅ Execution time < 10s (Chromium only, 10 workers)
- ✅ No flaky tests
- ✅ HTML report generated successfully

## Common Commands
```bash
# Run all tests
npm test

# Run specific file
npx playwright test navigation.spec.ts

# Run in UI mode
npm run test:ui

# Run headed
npm run test:headed

# Show last report
npx playwright show-report
```

## Notes
- Tests tự động retry 2 lần nếu fail trong CI
- Trace được bật tự động khi test fail lần đầu
- Dev server phải chạy trên port 3000
- Timeout mặc định: 30s cho mỗi test