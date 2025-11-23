# Generate Code

## Command Usage
```bash
/generate-code {spec}
```

## Description
Implement feature từ spec file, cập nhật tests và chạy Playwright tests. Fix tất cả các lỗi xảy ra cho đến khi tests pass.

## Workflow

### 1. Đọc và phân tích spec
- Đọc file spec được chỉ định trong `specs/` directory
- Hiểu rõ yêu cầu và tính năng cần implement
- Xác định các files cần thay đổi

### 2. Implement tính năng
- Code implementation theo đúng yêu cầu trong spec
- Tuân thủ architecture và coding patterns hiện tại
- Tạo các files mới nếu cần (routes, components, utilities)
- Cập nhật các files hiện có

### 3. Cập nhật tests
- Thêm test cases mới cho tính năng vừa implement
- Cập nhật existing tests nếu có breaking changes
- Đảm bảo coverage đầy đủ cho các scenarios chính

### 4. Chạy Playwright tests
- Sử dụng command `/run-test` để chạy tests
- Chi tiết xem [run-test.md](run-test.md)
- Phân tích kết quả và identify các lỗi

### 5. Fix tất cả lỗi
- Debug và fix từng lỗi phát sinh từ tests
- Reference troubleshooting guide trong [run-test.md](run-test.md#3-common-issues-và-solutions):
  - **URL Navigation Issues**: router.push(), pathname sync, waitForURL()
  - **Element Not Found**: Component rendering, selectors, waitForLoadState()
  - **Browser Compatibility**: Disable Firefox/Safari nếu không cần
  - **Race Conditions**: Smart waiting strategies
- Re-run tests sau mỗi lần fix
- Lặp lại cho đến khi **ALL TESTS PASS**

### 6. Run Web

**Run web server** on port 3000 to manually verify feature hoạt động

```bash
cd web && PORT=3000 npm run dev
```


## Success Criteria
- ✅ Tất cả tests pass (100%)
- ✅ Không có lỗi runtime
- ✅ Feature hoạt động đúng theo spec
- ✅ Code quality tốt và maintainable

## Example
```bash
/generate-code navigation
```
Sẽ đọc `specs/FEATURES.md`, tìm phần Navigation, implement feature, update tests và fix cho đến khi pass.

## Notes
- Command sẽ tự động create todo list để track progress
- Nếu có nhiều lỗi, sẽ prioritize và fix theo thứ tự
- Có thể disable một số browsers (Firefox, Safari) nếu không cần thiết để tăng tốc độ test
- Luôn verify bằng cách chạy lại tests sau khi fix
