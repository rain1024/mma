# Industry Standard Resources

Tài liệu tổng hợp các industry standards mới nhất, là căn cứ của các khuyến nghị trong dự án.

## Date

2025-11-27

---

## Pillar Overview

| # | Prefix | Pillar | Description | Questions |
|---|--------|--------|-------------|-----------|
| 1 | OPS | Operational Excellence | Khả năng vận hành và giám sát hệ thống | 3 |
| 2 | REL | Reliability | Khả năng phục hồi và đáp ứng yêu cầu | 4 |
| 3 | PERF | Performance Efficiency | Sử dụng tài nguyên hiệu quả | 2 |
| 4 | SEC | Security | Bảo vệ thông tin và hệ thống | 6 |
| 5 | COST | Cost Optimization | Tối ưu chi phí | 2 |
| 6 | SUS | Sustainability | Phát triển bền vững | 1 |

---

## Naming Convention

```
[PILLAR PREFIX][Question Number]-BP[Best Practice Number]
```

**Ví dụ:**
- `OPS02-BP01` → Operational Excellence, Question 2, Best Practice 1
- `REL01-BP02` → Reliability, Question 1, Best Practice 2
- `SEC03-BP05` → Security, Question 3, Best Practice 5
- `COST01-BP03` → Cost Optimization, Question 1, Best Practice 3

---

## 1. OPS - Operational Excellence

### OPS01 - Prepare
| ID | Best Practice | Source |
|----|---------------|--------|
| OPS01-BP01 | Infrastructure as Code | Terraform, OpenTofu, Pulumi |

### OPS02 - Operate
| ID | Best Practice | Source |
|----|---------------|--------|
| OPS02-BP01 | Twelve-Factor App | 12factor.net (Open-sourced Nov 2024) |

### OPS03 - Evolve
| ID | Best Practice | Source |
|----|---------------|--------|
| OPS03-BP01 | GitOps | Argo CD, Flux CD, OpenGitOps |
| OPS03-BP02 | Platform Engineering | CNCF, Backstage |

### References
- [The Twelve-Factor App](https://12factor.net/) - Heroku (2011, Open-sourced 2024)
- [Terraform](https://www.terraform.io/) - HashiCorp (BSL License)
- [OpenTofu](https://opentofu.org/) - Linux Foundation (MPL 2.0)
- [Pulumi](https://www.pulumi.com/) - Multi-language IaC
- [GitOps Principles](https://opengitops.dev/) - OpenGitOps (2021)
- [What is Platform Engineering](https://platformengineering.org/) - Platform Engineering Community
- [Backstage](https://backstage.io/) - Spotify

---

## 2. REL - Reliability

### REL01 - Foundations
| ID | Best Practice | Source |
|----|---------------|--------|
| REL01-BP01 | Google SRE Principles | Google SRE Book, STAMP Framework |

### REL02 - Workload Architecture
| ID | Best Practice | Source |
|----|---------------|--------|
| REL02-BP01 | Circuit Breaker Pattern | Resilience4j, Opossum |

### REL03 - Observability
| ID | Best Practice | Source |
|----|---------------|--------|
| REL03-BP01 | OpenTelemetry | CNCF |

### REL04 - Failure Management (NEW)
| ID | Best Practice | Source |
|----|---------------|--------|
| REL04-BP01 | Chaos Engineering | LitmusChaos, Gremlin |

### References
- [Google SRE Book](https://sre.google/sre-book/table-of-contents/) - Google (2016)
- [STAMP Framework](https://www.usenix.org/publications/loginonline/evolution-sre-google) - Google SRE (2024)
- [Resilience4j](https://resilience4j.readme.io/) - Modern circuit breaker
- [Opossum](https://nodeshift.dev/opossum/) - Node.js circuit breaker
- [OpenTelemetry](https://opentelemetry.io/) - CNCF (2024)
- [LitmusChaos](https://litmuschaos.io/) - CNCF Chaos Engineering
- [Gremlin](https://www.gremlin.com/) - Enterprise Chaos Engineering

---

## 3. PERF - Performance Efficiency

### PERF01 - Architecture Selection
| ID | Best Practice | Source |
|----|---------------|--------|
| PERF01-BP01 | API Design Standards | Google, Microsoft, OpenAPI 3.2 |
| PERF01-BP02 | Caching Strategies | Redis, CDN, Multi-layer |

### PERF02 - Data Management (NEW)
| ID | Best Practice | Source |
|----|---------------|--------|
| PERF02-BP01 | Database Optimization | PostgreSQL, SQLite |

### References
- [Google API Design Guide](https://cloud.google.com/apis/design) - Google Cloud
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines) - Microsoft
- [OpenAPI Specification](https://swagger.io/specification/) - OpenAPI 3.2
- [AsyncAPI](https://www.asyncapi.com/) - Event-driven APIs (3.0)
- [Redis Documentation](https://redis.io/docs/) - Redis
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html) - PostgreSQL

---

## 4. SEC - Security

### SEC01 - Security Foundations
| ID | Best Practice | Source |
|----|---------------|--------|
| SEC01-BP01 | Zero Trust Architecture | NIST SP 800-207, SP 1800-35 |

### SEC02 - Identity and Access Management
| ID | Best Practice | Source |
|----|---------------|--------|
| SEC02-BP01 | Authentication Standards | OAuth 2.1, OIDC |

### SEC03 - Detection
| ID | Best Practice | Source |
|----|---------------|--------|
| SEC03-BP01 | OWASP Top 10 | OWASP Foundation (2025 RC1) |

### SEC04 - Infrastructure Protection
| ID | Best Practice | Source |
|----|---------------|--------|
| SEC04-BP01 | Container Security | CIS Kubernetes Benchmark v1.9 |

### SEC05 - Application Security
| ID | Best Practice | Source |
|----|---------------|--------|
| SEC05-BP01 | Supply Chain Security | SLSA, SBOM (CISA 2025) |
| SEC05-BP02 | AI/ML Security | OWASP LLM Top 10 (2025) |

### SEC06 - Response (NEW)
| ID | Best Practice | Source |
|----|---------------|--------|
| SEC06-BP01 | Incident Response | NIST SP 800-61r3 (2025) |

### References
- [OWASP Top 10:2025 RC1](https://owasp.org/Top10/) - OWASP Foundation (November 2025)
- [NIST SP 800-207 Zero Trust](https://csrc.nist.gov/publications/detail/sp/800-207/final) - NIST (2020)
- [NIST SP 1800-35 ZTA Implementation](https://pages.nist.gov/zero-trust-architecture/) - NIST (2025)
- [OAuth 2.1](https://oauth.net/2.1/) - IETF Draft
- [NIST SP 800-61r3](https://csrc.nist.gov/pubs/sp/800/61/r3/final) - Incident Response (2025)
- [CISA SBOM 2025](https://www.cisa.gov/sbom) - Software Bill of Materials
- [CIS Kubernetes Benchmark](https://www.cisecurity.org/benchmark/kubernetes) - CIS (v1.9)
- [SLSA Framework](https://slsa.dev/) - OpenSSF
- [OWASP LLM Top 10](https://genai.owasp.org/) - OWASP (2025)

---

## 5. COST - Cost Optimization

### COST01 - Cloud Financial Governance
| ID | Best Practice | Source |
|----|---------------|--------|
| COST01-BP01 | FinOps Principles | FinOps Foundation, FOCUS 1.2 |

### COST02 - Cost-Effective Resources
| ID | Best Practice | Source |
|----|---------------|--------|
| COST02-BP01 | Right-Sizing | Cloud providers |

### References
- [FinOps Framework](https://www.finops.org/framework/) - FinOps Foundation (2024)
- [FOCUS Specification](https://focus.finops.org/) - FinOps Open Cost and Usage Spec (v1.2)
- [AWS Cost Optimization](https://aws.amazon.com/aws-cost-management/) - AWS
- [Azure Cost Management](https://azure.microsoft.com/en-us/products/cost-management/) - Microsoft
- [GCP Cost Management](https://cloud.google.com/cost-management) - Google Cloud

---

## 6. SUS - Sustainability

### SUS01 - Software and Architecture
| ID | Best Practice | Source |
|----|---------------|--------|
| SUS01-BP01 | Green Software Principles | ISO/IEC 21031:2024, GSF |

### References
- [ISO/IEC 21031:2024](https://www.iso.org/standard/86612.html) - Software Carbon Intensity
- [Green Software Foundation](https://greensoftware.foundation/)
- [SCI Specification](https://sci.greensoftware.foundation/) - Software Carbon Intensity
- [Carbon Aware SDK](https://github.com/Green-Software-Foundation/carbon-aware-sdk) - GSF (v1.4.0)
- [Green Software Patterns](https://patterns.greensoftware.foundation/) - GSF

---

## Additional Industry Standards (Future)

### Planned Additions

| Pillar | Question | Best Practice | Source |
|--------|----------|---------------|--------|
| COST | COST03 | Reserved Capacity | Cloud providers |
| SUS | SUS02 | Hardware Efficiency | - |

---

## How to Use This Document

1. **Audit**: Sử dụng bảng trên để kiểm tra codebase có tuân thủ các best practices
2. **Research**: Cập nhật references khi có phiên bản mới của standards
3. **Implementation**: Tham khảo chi tiết trong từng file best practice

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-27 | 1.0 | Initial structure following AWS Well-Architected naming |
| 2025-11-27 | 1.1 | Reorder pillars: OPS, REL, PERF, SEC, COST, SUS |
| 2025-11-27 | 1.2 | Research update: Added REL04, PERF02, SEC06. Updated all docs with 2024-2025 information |
