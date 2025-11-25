# Phân Tích Dự Án

## Cách Sử Dụng
```bash
/project-analyze
```

## Mô Tả
Review toàn bộ code, tài liệu và kiến trúc của dự án để hiểu rõ cấu trúc, patterns, và đưa ra các đề xuất cải thiện.

## Quy Trình Thực Hiện

### 1. Đọc Tài Liệu
- Đọc `CLAUDE.md` để hiểu tổng quan dự án
- Đọc các file `README.md` trong các thư mục
- Đọc các file trong `docs/` nếu có
- Xác định tech stack và dependencies từ `package.json`

### 2. Phân Tích Kiến Trúc
- Review cấu trúc thư mục của dự án
- Xác định các tầng: API (service/), Web (web/), Tests (tests/)
- Hiểu luồng dữ liệu và quản lý state
- Phân tích database schema (nếu có)

### 3. Đánh Giá Chất Lượng Code
- Đánh giá coding patterns và conventions
- Kiểm tra data structures và types đã đúng với thiết kế database chưa
- Xác định code trùng lặp
- Review xử lý lỗi
- Kiểm tra type safety (TypeScript)
- Sử dụng linting và formatting tools đúng cách
- Sử dụng lệnh /run-test để đánh giá chất lượng tests
- Đánh giá độ phủ test

### 4. Kiểm Tra Bảo Mật
- Kiểm tra các vấn đề bảo mật tiềm ẩn
- Review xác thực/phân quyền (nếu có)
- Validate việc xử lý input
- Kiểm tra rò rỉ dữ liệu nhạy cảm

### 5. Phân Tích Hiệu Năng
- Xác định các điểm nghẽn hiệu năng
- Review các truy vấn database
- Phân tích cách xử lý API response
- Kiểm tra bundle size và lazy loading

### 6. Tạo Báo Cáo

Xuất báo cáo với các phần:

#### 📊 Tổng Quan Dự Án
- Tóm tắt tech stack
- Cấu trúc thư mục
- Các dependencies chính

#### 🏗️ Kiến Trúc
- Sơ đồ các tầng
- Luồng dữ liệu
- Mối quan hệ giữa các component

#### ✅ Điểm Mạnh
- Những điểm tốt của codebase
- Các best practices được áp dụng

#### ⚠️ Vấn Đề & Cải Thiện
- Các vấn đề cần sửa
- Đề xuất cải thiện
- Nợ kỹ thuật (technical debt)

#### 🚀 Khuyến Nghị
- Cải thiện ngắn hạn
- Đề xuất lộ trình dài hạn
- Xếp hạng ưu tiên

## Tiêu Chí Hoàn Thành
- ✅ Đã review toàn bộ thư mục chính
- ✅ Đã đọc và hiểu tài liệu
- ✅ Đã xác định ít nhất 3 điểm mạnh
- ✅ Đã xác định ít nhất 3 điểm cần cải thiện
- ✅ Báo cáo rõ ràng và có thể hành động được

## Ví Dụ Báo Cáo

```markdown
# Báo Cáo Phân Tích Dự Án

## 📊 Tổng Quan Dự Án
- **Stack**: Next.js + TypeScript + SQLite
- **Cấu trúc**: Monorepo với web/, service/, tests/
- **Tests**: Playwright E2E

## 🏗️ Kiến Trúc
[Sơ đồ hoặc mô tả]

## ✅ Điểm Mạnh
1. Type safety tốt với TypeScript
2. E2E tests toàn diện
3. Phân tách rõ ràng các concerns

## ⚠️ Vấn Đề
1. Thiếu unit tests cho tầng service
2. Không có error boundaries trong React components
3. Database không có hệ thống migrations

## 🚀 Khuyến Nghị
1. [Cao] Thêm unit tests cho các luồng quan trọng
2. [Trung bình] Triển khai xử lý lỗi đúng cách
3. [Thấp] Thêm hệ thống database migration
```

## Ghi Chú
- Command này chỉ đọc và phân tích, không chỉnh sửa code
- Có thể mất vài phút để review toàn bộ codebase
- Báo cáo nên được lưu hoặc copy để tham khảo sau
