# OWASP Top 10

## References

- [OWASP Top 10:2025 RC1](https://owasp.org/Top10/) - Official OWASP (November 2025)
- [OWASP Top 10:2021](https://owasp.org/Top10/2021/) - Previous version
- [AWS Security Best Practices](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/)
- [Google Cloud Security](https://cloud.google.com/security/best-practices)
- [Microsoft Security Development Lifecycle](https://www.microsoft.com/en-us/securityengineering/sdl)
- [CWE - Common Weakness Enumeration](https://cwe.mitre.org/)

## Date

2003 (OWASP founded) | 2021 (Previous) | **2025 RC1 (November 6, 2025)** | Final expected early 2026

## Tổng quan

Danh sách 10 rủi ro bảo mật web application nghiêm trọng nhất, được cộng đồng security công nhận. Phiên bản 2025 RC1 được công bố tại Global AppSec Conference với 2 category mới.

## Top 10 (2025 RC1) - MỚI NHẤT

| # | Rủi ro | Thay đổi | Mô tả | Phòng chống |
|---|--------|----------|-------|-------------|
| A01 | **Broken Access Control** | ↔️ | Bypass authorization | RBAC, principle of least privilege |
| A02 | **Security Misconfiguration** | ⬆️ từ A05 | Config sai/mặc định | Hardening, remove defaults |
| A03 | **Software Supply Chain Failures** | 🆕 | Dependencies/build bị compromise | SBOM, SLSA, dependency scanning |
| A04 | **Cryptographic Failures** | ⬇️ từ A02 | Lộ dữ liệu nhạy cảm | HTTPS, encrypt at rest |
| A05 | **Injection** | ⬇️ từ A03 | SQL, NoSQL, Command injection | Parameterized queries, input validation |
| A06 | **Insecure Design** | ↔️ | Thiết kế thiếu security | Threat modeling, secure patterns |
| A07 | **Authentication Failures** | ↔️ | Xác thực yếu | MFA, strong passwords, OAuth 2.1 |
| A08 | **Software/Data Integrity Failures** | ↔️ | Không verify data | Signed updates, integrity checks |
| A09 | **Logging & Alerting Failures** | ↔️ | Thiếu audit trail | Centralized logging, alerting |
| A10 | **Mishandling of Exceptional Conditions** | 🆕 | Error handling không đúng | Proper exception handling, graceful degradation |

### Thay đổi quan trọng từ 2021 → 2025:

- **SSRF (A10:2021)** đã được gộp vào các category khác
- **Software Supply Chain Failures (A03:2025)** - Category mới phản ánh tầm quan trọng của supply chain security
- **Mishandling of Exceptional Conditions (A10:2025)** - Category mới về xử lý exception

## So sánh 2021 vs 2025

| 2021 | 2025 | Ghi chú |
|------|------|---------|
| A01 Broken Access Control | A01 Broken Access Control | Không đổi |
| A05 Security Misconfiguration | A02 Security Misconfiguration | ⬆️ Tăng priority |
| - | A03 Software Supply Chain Failures | 🆕 Mới |
| A02 Cryptographic Failures | A04 Cryptographic Failures | ⬇️ |
| A03 Injection | A05 Injection | ⬇️ |
| A04 Insecure Design | A06 Insecure Design | ⬇️ |
| A07 Auth Failures | A07 Authentication Failures | Không đổi |
| A08 Data Integrity Failures | A08 Software/Data Integrity | Mở rộng scope |
| A09 Logging Failures | A09 Logging & Alerting Failures | Thêm Alerting |
| A10 SSRF | - | Gộp vào categories khác |
| - | A10 Mishandling Exceptional Conditions | 🆕 Mới |

## Áp dụng cho dự án MMA

```typescript
// A03: Injection - Sử dụng parameterized queries
const athlete = db.prepare('SELECT * FROM athletes WHERE id = ?').get(id);

// A01: Access Control
app.get('/api/admin/*', requireAdmin, adminRoutes);

// A06: Vulnerable Components
// yarn audit để check vulnerabilities
```

## Checklist (Updated 2025)

- [ ] Input validation cho tất cả user input
- [ ] Parameterized queries (không string concatenation)
- [ ] HTTPS everywhere
- [ ] Security headers (CORS, CSP, X-Frame-Options)
- [ ] Regular dependency updates (`yarn audit`)
- [ ] Authentication & Authorization implemented
- [ ] Logging và alerting cho security events
- [ ] **Supply Chain Security (NEW 2025)**:
  - [ ] SBOM generation (CycloneDX/SPDX)
  - [ ] Dependency scanning trong CI/CD
  - [ ] Lock file (`yarn.lock`) committed
  - [ ] Verify package integrity
- [ ] **Exception Handling (NEW 2025)**:
  - [ ] Graceful error handling
  - [ ] Không leak sensitive info trong error messages
  - [ ] Fallback mechanisms cho critical paths
