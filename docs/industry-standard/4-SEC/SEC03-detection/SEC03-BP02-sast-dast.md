# SEC03-BP02: SAST và DAST

## References
- [SAST and DAST Tools 2025](https://www.ox.security/blog/sast-and-dast-tools-still-essential-security-solutions-in-2025/) - OX Security
- [SAST vs DAST](https://www.wiz.io/academy/sast-vs-dast) - Wiz
- [Top 10 DAST Tools 2025](https://www.jit.io/resources/appsec-tools/top-dast-tools-for-2024) - Jit
- [Top 10 SAST Tools 2025](https://spectralops.io/blog/top-10-static-application-security-testing-sast-tools-in-2025/) - Spectral

## Date
* 2025-11-27

---

## Tổng quan

SAST (Static Application Security Testing) và DAST (Dynamic Application Security Testing) là hai phương pháp bổ trợ để phát hiện lỗ hổng bảo mật trong ứng dụng. Năm 2025, các công cụ này ngày càng tích hợp AI/ML và trở thành một phần của unified security platforms.

## Xu hướng 2025

| Trend | Mô tả |
|-------|-------|
| AI/ML Integration | Cải thiện phát hiện lỗ hổng, tự động triage, dự đoán exploitability |
| Unified Platforms | Kết hợp SAST, DAST, SCA, IAST trong một nền tảng |
| Auto Remediation | Tự động đề xuất và sửa lỗi, giảm MTTR |
| Shift Left | SAST tích hợp sớm trong CI/CD pipeline |

## SAST vs DAST

| Khía cạnh | SAST | DAST |
|-----------|------|------|
| **Loại testing** | White-box (có source code) | Black-box (không cần source) |
| **Thời điểm** | Trước deploy (build time) | Sau deploy (runtime) |
| **Phạm vi** | Source code, dependencies | Running application, APIs |
| **Ưu điểm** | Phát hiện sớm, CI/CD friendly | Tech-agnostic, runtime issues |
| **Nhược điểm** | False positives cao | Cần running environment |

## Khi nào dùng

**SAST** - Shift Left Security:
- Tích hợp vào CI/CD để catch flaws sớm
- Enforce secure coding standards
- Code review tự động

**DAST** - Runtime Validation:
- Test pre-production/staging
- Kiểm tra third-party components, APIs
- Production security scanning

## Công cụ phổ biến 2025

### SAST Tools
| Tool | Ngôn ngữ | Đặc điểm |
|------|----------|----------|
| Semgrep | Multi | OSS, rule-based, fast |
| CodeQL | Multi | GitHub native, semantic analysis |
| SonarQube | Multi | Enterprise, code quality + security |
| Checkmarx | Multi | Enterprise, comprehensive |

### DAST Tools
| Tool | Đặc điểm |
|------|----------|
| OWASP ZAP | OSS, API scanning, CI integration |
| Burp Suite | Manual + automated, extensive features |
| Nuclei | Template-based, fast, community templates |
| Invicti | Enterprise, low false positives |

## Example: CI/CD Integration

```yaml
# GitHub Actions - SAST with Semgrep
- name: Run Semgrep
  uses: returntocorp/semgrep-action@v1
  with:
    config: p/security-audit

# DAST with OWASP ZAP
- name: OWASP ZAP Scan
  uses: zaproxy/action-baseline@v0.7.0
  with:
    target: 'https://staging.example.com'
    rules_file_name: '.zap/rules.tsv'
```

```javascript
// Pre-commit hook for SAST
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run security:sast"
    }
  },
  "scripts": {
    "security:sast": "semgrep --config=p/security-audit .",
    "security:dast": "zap-cli quick-scan --self-contained https://localhost:3000"
  }
}
```

## Statistics 2025

| Metric | Value | Source |
|--------|-------|--------|
| Vulnerability exploitation rise | +34% | Verizon DBIR 2025 |
| Orgs with API security issues | 99% | Salt Labs 2025 |
| Broken object-level auth | 27% | Salt Labs 2025 |
| Sensitive data exposure | 34% | Salt Labs 2025 |

## Best Practices

1. **Layered Approach**: Dùng cả SAST và DAST, không dựa vào một tool duy nhất
2. **Early Integration**: SAST trong pre-commit hooks, DAST trong staging
3. **Prioritize Findings**: Dùng AI/ML để prioritize theo risk thực tế
4. **Fix at Source**: SAST findings → fix trong code review
5. **Continuous Scanning**: DAST scan định kỳ trên production

---

## Checklist

### SAST Implementation
- [ ] SAST tool được chọn và cấu hình
- [ ] Tích hợp vào CI/CD pipeline
- [ ] Custom rules cho codebase
- [ ] False positive management
- [ ] Developer training

### DAST Implementation
- [ ] DAST tool được chọn
- [ ] Staging environment cho testing
- [ ] API endpoints được scan
- [ ] Authentication testing configured
- [ ] Scan schedule thiết lập

### Unified Security
- [ ] SAST + DAST + SCA integrated
- [ ] Centralized vulnerability dashboard
- [ ] Auto-triage với AI/ML
- [ ] Remediation workflow defined
- [ ] Metrics tracking (MTTR, fix rate)
