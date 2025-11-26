# Do Task

## Command Usage
```bash
/do-task {task}
```

## Description
Thực hiện một task cụ thể, tự động phân tích yêu cầu, implement và verify kết quả. Fix tất cả các lỗi xảy ra cho đến khi task hoàn thành.

## Workflow

### 1. Phân tích task
- Đọc và hiểu rõ yêu cầu của task
- Xác định scope và các files liên quan
- Tạo todo list để track progress

### 2. Nghiên cứu codebase
- Tìm hiểu các files hiện có liên quan đến task
- Xác định patterns và conventions đang sử dụng
- Đánh giá dependencies và impacts

### 3. Implement
- Code implementation theo đúng yêu cầu
- Tuân thủ architecture và coding patterns hiện tại
- Tạo/cập nhật các files cần thiết
- Đảm bảo code quality và maintainability

### 4. Verify và Test
- Chạy build để kiểm tra lỗi compilation
- Sử dụng lệnh /run-tests để chạy toàn bộ tests

### 5. Fix lỗi
- Debug và fix từng lỗi phát sinh
- Re-run tests sau mỗi lần fix
- Lặp lại cho đến khi **TASK HOÀN THÀNH**

## Success Criteria
- Task hoàn thành đúng theo yêu cầu
- Không có lỗi runtime hoặc compilation
- Code tuân thủ conventions của project
- Tests pass (nếu applicable)

## Example
```bash
/do-task Add pagination to Athletes page
```
Sẽ phân tích yêu cầu, tìm hiểu AthletesPage component, implement pagination và verify hoạt động.

```bash
/do-task Fix bug where theme doesn't persist after refresh
```
Sẽ debug, tìm root cause, implement fix và verify bug đã được giải quyết.

## Notes
- Command sẽ tự động create todo list để track progress
- Ưu tiên giải pháp đơn giản và maintainable
- Tuân thủ existing patterns trong codebase
- Không over-engineer hoặc thêm features không cần thiết
