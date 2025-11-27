# Industry Standard Research Progress

## Last Updated

2025-11-26

## Progress by Pillar

| Pillar | Status | Last Updated | Notes |
|--------|--------|--------------|-------|
| 1-OPS | ✅ Complete | 2025-11-27 | GitOps updated with Argo CD v3.2.0, Flux Graduated |
| 2-REL | ✅ Complete | 2025-11-27 | OpenTelemetry updated with JS SDK 2.0, eBPF |
| 3-PERF | ✅ Complete | 2025-11-27 | No major updates needed |
| 4-SEC | ✅ Complete | 2025-11-27 | CIS v1.10.0, OWASP 2025 RC1 current |
| 5-COST | ✅ Complete | 2025-11-27 | FOCUS 1.2 updates added |
| 6-SUS | ✅ Complete | 2025-11-27 | ISO/IEC 21031:2024 current |

## Static Analysis Summary

| Metric | Value |
|--------|-------|
| Total Files | 21 |
| Total Lines | 4108 |
| Valid Format | 21/21 |
| Pillars | 6 |
| Questions | 18 |

## Updates Applied (2025-11-26)

### 1-OPS: Operational Excellence
- **OPS03-BP01-gitops.md**: Updated to Argo CD v3.2.0, Flux CNCF Graduated status

### 2-REL: Reliability
- **REL03-BP01-opentelemetry.md**: Added JS SDK 2.0, eBPF Instrumentation (OBI), Demo 2.0

### 4-SEC: Security
- **SEC04-BP01-container-security.md**: Updated to CIS v1.10.0, K8s v1.29/1.30/1.31

### 5-COST: Cost Optimization
- **COST01-BP01-finops-principles.md**: Updated FOCUS 1.2 (May 2025) with 7 new columns

## Key Findings from Research

### OWASP Top 10 2025 (Already Current)
- Two new categories: A03 Supply Chain Failures, A10 Mishandling Exceptional Conditions
- SSRF merged into Broken Access Control
- Security Misconfiguration rose to #2

### OpenTelemetry 2025
- JS SDK 2.0: Node.js 18.19+/20.6+ required, breaking changes
- eBPF Instrumentation (OBI): First alpha for zero-code instrumentation
- Collector v0.137.0, heading to v1.0

### FinOps FOCUS 1.2 (May 2025)
- 7 new columns for SaaS/PaaS support
- New providers: Alibaba Cloud, Databricks, Grafana
- Virtual currency tracking for credits/tokens

### CIS Kubernetes Benchmark v1.10.0
- Supports K8s v1.29, 1.30, 1.31
- 20+ recommendations added/enhanced

### GitOps 2025
- Argo CD v3.2.0 available, v2.14.x EOL (Nov 4, 2025)
- Flux CNCF Graduated, "Adopt" on Tech Radar

### OAuth 2.1
- Still draft (v14 as of Oct 2025), not yet final RFC
- Core specs already adopted by industry

## Next Steps

1. [ ] Update AWS Well Architected Framework references

## Standards to Consider Adding

| Pillar | File | Description | Priority |
|--------|------|-------------|----------|
| 3-PERF | PERF01-BP03-pagination.md | Pagination strategies (cursor vs offset) | Medium |
| 4-SEC | SEC03-BP02-sast-dast.md | Static/Dynamic Analysis tools | Medium |
| 2-REL | REL03-BP02-prometheus-grafana.md | Metrics & dashboards | Low |

## Research Sources

- [AWS Well-Architected](https://aws.amazon.com/architecture/well-architected/)
- [OWASP Top 10 2025](https://owasp.org/Top10/2025/)
- [OpenTelemetry Blog 2025](https://opentelemetry.io/blog/2025/)
- [FinOps FOCUS 1.2](https://www.finops.org/insights/focus-1-2-available/)
- [CIS Kubernetes Benchmarks](https://www.cisecurity.org/benchmark/kubernetes)
- [CNCF GitOps](https://www.cncf.io/blog/2025/06/09/gitops-in-2025/)
- [NIST SP 1800-35](https://pages.nist.gov/zero-trust-architecture/)
- [Green Software Foundation](https://greensoftware.foundation/)
