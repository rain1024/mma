# Industry Standard

## Cách Sử Dụng
```bash
/industry-standard {action}
```

**Actions:**
- `audit` - Phân tích code và đối chiếu với industry standards
- `research` - Cập nhật và cải thiện tài liệu industry standards
- `static` - Phân tích tĩnh tài liệu industry standards

---

## Cấu Trúc Thư Mục

```
docs/industry-standard/
├── 1-OPS/                    # Operational Excellence
├── 2-REL/                    # Reliability
├── 3-PERF/                   # Performance Efficiency
├── 4-SEC/                    # Security
├── 5-COST/                   # Cost Optimization
├── 6-SUS/                    # Sustainability
├── RESEARCH.md               # Research progress tracking
└── RESOURCES.md              # External resources
```

---

## Action: `audit`

### Mô Tả
Phân tích codebase hiện tại và đối chiếu với các industry standards để tìm gaps.

### Workflow (2 bước)

#### Bước 1: Chạy Project Analyze
```bash
/project-analyze
```
- Thực hiện phân tích toàn bộ codebase
- Thu thập kết quả về architecture, code quality, security, performance

#### Bước 2: Đối Chiếu với Industry Standards
- Đọc tất cả files trong `docs/industry-standard/` theo 6 pillars:

| Pillar | Code | Standards |
|--------|------|-----------|
| **Operational Excellence** | 1-OPS | 12-Factor App, IaC, GitOps, Platform Engineering |
| **Reliability** | 2-REL | Google SRE, Circuit Breaker, OpenTelemetry, Chaos Engineering |
| **Performance** | 3-PERF | API Design, Caching, Database Optimization |
| **Security** | 4-SEC | Zero Trust, Auth Standards, OWASP, Container Security, Supply Chain, Incident Response |
| **Cost Optimization** | 5-COST | FinOps, Right-sizing |
| **Sustainability** | 6-SUS | Green Software |

- So sánh kết quả từ bước 1 với checklist trong mỗi standard
- Tạo báo cáo gap analysis theo format:

```markdown
## Industry Standard Audit Report

### Compliance Summary
| Pillar | Category | Standard | Compliant | Gaps | Score |
|--------|----------|----------|-----------|------|-------|
| 1-OPS | Operational Excellence | 12-Factor App | 9/12 | 3 | 75% |
| 1-OPS | Operational Excellence | IaC | 0/6 | 6 | 0% |
| 2-REL | Reliability | Google SRE | 2/8 | 6 | 25% |
| 2-REL | Reliability | Circuit Breaker | 0/4 | 4 | 0% |
| 3-PERF | Performance | API Design | 5/10 | 5 | 50% |
| 3-PERF | Performance | Caching | 0/5 | 5 | 0% |
| 4-SEC | Security | OWASP Top 10 | 3/10 | 7 | 30% |
| 4-SEC | Security | Authentication | 0/8 | 8 | 0% |
| 5-COST | Cost | FinOps | 0/5 | 5 | 0% |
| 6-SUS | Sustainability | Green Software | 2/6 | 4 | 33% |
| | **OVERALL** | | **21/74** | **53** | **28%** |

### Gap Details by Pillar

#### 4-SEC: Security Gaps
| Item | Standard | File | Status | Recommendation |
|------|----------|------|--------|----------------|
| helmet middleware | SEC03 OWASP A02 | app.ts | ❌ | `yarn add helmet` |
| rate limiting | SEC03 OWASP A07 | app.ts | ❌ | `yarn add express-rate-limit` |
| input validation | SEC03 OWASP A05 | routes/*.ts | ❌ | `yarn add express-validator` |

#### 1-OPS: Operational Excellence Gaps
| Item | Standard | Status | Recommendation |
|------|----------|--------|----------------|
| Docker | OPS01 IaC | ❌ | Add Dockerfile |
| CI/CD | OPS03 GitOps | ❌ | Add GitHub Actions |

### Priority Actions
1. [Cao] Security - Add helmet, rate limiting, input validation
2. [Cao] Security - Update dependencies with CVEs
3. [Trung bình] Performance - Add caching layer
4. [Trung bình] Reliability - Add monitoring (OpenTelemetry)
5. [Thấp] Operations - Add Docker, CI/CD
```

---

## Action: `research`

### Mô Tả
Cập nhật và cải thiện tài liệu industry standards với thông tin mới nhất từ internet.

### Workflow (5 bước)

#### Bước 0: Đọc Trạng Thái Nghiên Cứu (Nếu có)
- **QUAN TRỌNG**: Đọc file `docs/industry-standard/RESEARCH.md` trước tiên
- Nếu file tồn tại → tiếp tục từ phần "Các Bước Tiếp Theo"
- Nếu file không tồn tại → bắt đầu từ Bước 1

#### Bước 1: Inspect Industry Standards
- Đọc tất cả files trong `docs/industry-standard/` theo cấu trúc pillars:
  ```
  1-OPS/
  2-REL/
  3-PERF/
  4-SEC/
  5-COST/
  6-SUS/
  ```
- Xác định các topics và phiên bản hiện tại
- Liệt kê các references và ngày cập nhật

#### Bước 2: Chạy static analysis script
```bash
cd scripts/industry-standard-inspect
uv run python static_analysis.py
```
- Phân tích cấu trúc thư mục và định dạng files
- Kiểm tra các sections bắt buộc (References, Date, Checklist)

#### Bước 3: Tìm Kiếm Cập Nhật
- Search trên internet cho mỗi standard
- Tìm kiếm các standards mới cần bổ sung
- Ưu tiên các official sources: AWS/GCP/Azure, OWASP, CNCF docs

#### Bước 4: Cập Nhật Tài Liệu
- Update các files hiện có với thông tin mới
- Thêm files mới cho standards còn thiếu
- Cập nhật references và dates
- **Giới hạn: ~100 lines (khuyến nghị), tối đa 200 lines**

#### Bước 5: Lưu Trạng Thái Nghiên Cứu
- **QUAN TRỌNG**: Cập nhật file `docs/industry-standard/RESEARCH.md`
- Ghi lại tiến độ và các bước tiếp theo
- **Giới hạn: Tối đa 200 dòng** - giữ ngắn gọn, chỉ thông tin cần thiết

**Format file RESEARCH.md (max 200 lines):**
```markdown
# Industry Standard Research Progress

## Cập Nhật Lần Cuối
[Ngày tháng]

## Tiến Độ Theo Pillar

| Pillar | Status | Lần Cuối Cập Nhật | Ghi Chú |
|--------|--------|-------------------|---------|
| 1-OPS | ✅ Hoàn thành | 2025-11-27 | |
| 2-REL | 🔄 Đang làm | 2025-11-27 | REL03 cần bổ sung |
| 3-PERF | ⏳ Chưa bắt đầu | | |
| 4-SEC | ✅ Hoàn thành | 2025-11-26 | |
| 5-COST | ⏳ Chưa bắt đầu | | |
| 6-SUS | ⏳ Chưa bắt đầu | | |

## Các Bước Tiếp Theo
1. [ ] Hoàn thành REL03-observability - thêm Prometheus/Grafana
2. [ ] Bắt đầu 3-PERF - research database optimization
3. [ ] Thêm standard mới: SEC03-BP02-sast-dast.md

## Standards Cần Thêm Mới
| Pillar | File | Mô Tả | Priority |
|--------|------|-------|----------|
| 4-SEC | SEC03-BP02-sast-dast.md | Static/Dynamic Analysis | Cao |
| 3-PERF | PERF01-BP03-pagination.md | Pagination strategies | Trung bình |

## Ghi Chú Nghiên Cứu
- [Ngày]: Ghi chú về findings, links quan trọng, etc.
```

**Naming Convention cho files mới:**
```
{PILLAR}{NN}-{category}/{PILLAR}{NN}-BP{MM}-{standard-name}.md

Ví dụ:
- SEC03-detection/SEC03-BP02-sast-dast.md
- PERF01-architecture/PERF01-BP03-pagination.md
```

**Line Limits:**
| File Type | Khuyến nghị | Tối đa |
|-----------|-------------|--------|
| Standard/Best Practice | ~100 lines | 200 lines |
| RESEARCH.md | ~100 lines | 200 lines |

**Format file standard (~100 lines khuyến nghị, max 200):**
```markdown
# [Standard Name]

## References
- [Link 1](url) - Source (Year)

## Date
* [Original date]
* **[Latest update]**

## Tổng quan
[2-3 câu mô tả]

## Nội dung chính
[Tables, diagrams, key points - ngắn gọn]

## Example
```code
// Ví dụ ngắn gọn minh họa
```

## Checklist
- [ ] Item 1
- [ ] Item 2
```

---

## Action: `static`

### Mô Tả
Phân tích tĩnh tài liệu industry standards để kiểm tra format, đếm số dòng, và đưa ra khuyến nghị.

### Workflow (2 bước)

#### Bước 1: Chạy Static Analysis Script
```bash
cd scripts/industry-standard-inspect
uv run python static_analysis.py
```

Script sẽ phân tích:
- **Directory Structure**: Cấu trúc thư mục theo 6 pillars và số dòng mỗi file
- **Summary Statistics**: Tổng số files, lines, valid/invalid format
- **File Analysis**: Chi tiết từng file theo pillar (1-OPS → 6-SUS)
- **Format Validation**: Kiểm tra required sections (References, Date, Checklist)
- **Naming Convention**: Kiểm tra file names theo pattern `{PILLAR}{NN}-BP{MM}-*.md`

#### Bước 2: Đưa Ra Khuyến Nghị

Dựa trên kết quả phân tích, đưa ra khuyến nghị theo format:

```markdown
## Static Analysis Report

### Summary
| Metric | Value |
|--------|-------|
| Total Pillars | 6 |
| Total Categories | X |
| Total Files | X |
| Total Lines | X |
| Valid Format | X |
| Invalid Format | X |

### Coverage by Pillar
| Pillar | Categories | Files | Lines | Status |
|--------|------------|-------|-------|--------|
| 1-OPS | 3 | 4 | XXX | ✅ |
| 2-REL | 4 | 4 | XXX | ✅ |
| 3-PERF | 2 | 3 | XXX | ✅ |
| 4-SEC | 6 | 7 | XXX | ✅ |
| 5-COST | 2 | 2 | XXX | ✅ |
| 6-SUS | 1 | 1 | XXX | ✅ |

### Issues Found
| Pillar | File | Issue | Recommendation |
|--------|------|-------|----------------|
| 4-SEC | SEC03-BP01-owasp.md | Missing Checklist | Add ## Checklist section |

### Recommendations
1. [Cao] Files thiếu required sections cần được sửa ngay
2. [Trung bình] Files có ít references nên bổ sung thêm
3. [Thấp] Files có ít checklist items nên mở rộng
```

Chú ý sử dụng tiếng Việt trong báo cáo.

---

## Tiêu Chí Hoàn Thành

### Audit
- ✅ Đã chạy /project-analyze
- ✅ Đã đọc tất cả industry standard docs (6 pillars, 21 files)
- ✅ Đã tạo compliance summary với scores theo từng pillar
- ✅ Đã liệt kê tất cả gaps với recommendations và file references
- ✅ Đã xếp hạng priority actions (Cao/Trung bình/Thấp)

### Research
- ✅ Đã đọc `RESEARCH.md` để tiếp tục từ session trước (nếu có)
- ✅ Đã inspect tất cả docs hiện có theo 6 pillars
- ✅ Đã chạy static analysis script
- ✅ Đã search internet cho updates
- ✅ Đã cập nhật docs với thông tin mới
- ✅ Đã thêm standards mới (nếu có) theo naming convention
- ✅ Đã cập nhật dates và references
- ✅ Đã lưu tiến độ vào `docs/industry-standard/RESEARCH.md`

### Static
- ✅ Đã chạy static analysis script
- ✅ Đã hiển thị directory structure theo 6 pillars
- ✅ Đã báo cáo summary statistics với coverage by pillar
- ✅ Đã liệt kê format validation errors (nếu có)
- ✅ Đã đưa ra khuyến nghị cải thiện

---

## Pillar Reference

| Code | Pillar | Focus Areas |
|------|--------|-------------|
| **1-OPS** | Operational Excellence | IaC, 12-Factor, GitOps, Platform Engineering |
| **2-REL** | Reliability | SRE, Circuit Breaker, OpenTelemetry, Chaos Engineering |
| **3-PERF** | Performance Efficiency | API Design, Caching, Database Optimization |
| **4-SEC** | Security | Zero Trust, Auth, OWASP, Container, Supply Chain, Incident Response |
| **5-COST** | Cost Optimization | FinOps, Right-sizing |
| **6-SUS** | Sustainability | Green Software |
