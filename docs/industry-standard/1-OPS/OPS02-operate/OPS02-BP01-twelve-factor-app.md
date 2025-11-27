# The Twelve-Factor App

## References

- [12factor.net](https://12factor.net/) - Heroku (Adam Wiggins, 2011) - **Open-sourced November 2024**
- [Beyond the Twelve-Factor App](https://www.oreilly.com/library/view/beyond-the-twelve-factor/9781492042631/) - Kevin Hoffman (O'Reilly)
- [AWS Well-Architected - Operational Excellence](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/) - **Updated April 2025**
- [AWS Well-Architected Framework April 2025](https://aws.amazon.com/about-aws/whats-new/2025/04/new-guidance-well-architected-tool/) - 78 new best practices
- [Google Cloud - Application Modernization](https://cloud.google.com/architecture/application-development)
- [Microsoft Azure - Cloud Design Patterns](https://learn.microsoft.com/en-us/azure/architecture/patterns/)

## Date

2011 (Heroku) | **November 2024 (Open-sourced)** | Cập nhật: November 2025

## Tổng quan

Phương pháp luận xây dựng ứng dụng SaaS hiện đại, portable và scalable trên cloud platforms.

**Update November 2024**: The Twelve-Factor App methodology đã được open-sourced, mở cửa cho community-driven updates để phù hợp với modern practices như Kubernetes, GitOps, và workload identity.

## 12 Nguyên tắc

| # | Factor | Mô tả | Áp dụng |
|---|--------|-------|---------|
| 1 | **Codebase** | Một codebase, nhiều deploys | Git monorepo hoặc polyrepo |
| 2 | **Dependencies** | Khai báo và cô lập dependencies | `package.json`, `requirements.txt` |
| 3 | **Config** | Config trong environment variables | `.env`, AWS Secrets Manager |
| 4 | **Backing Services** | Treat services như attached resources | DB, Redis, S3 là external |
| 5 | **Build, Release, Run** | Tách biệt 3 stages | CI/CD pipeline |
| 6 | **Processes** | Stateless processes | Session trong Redis, không local |
| 7 | **Port Binding** | Export service via port | Express bind port 4000 |
| 8 | **Concurrency** | Scale out via process model | Horizontal scaling |
| 9 | **Disposability** | Fast startup, graceful shutdown | Container-ready |
| 10 | **Dev/Prod Parity** | Keep environments similar | Docker, staging environments |
| 11 | **Logs** | Treat logs as event streams | stdout → CloudWatch/ELK |
| 12 | **Admin Processes** | Run admin tasks as one-off | Migration scripts, seeds |

## Áp dụng cho dự án MMA

```
✅ Factor 1: Git repository với monorepo (web/, service/, shared/)
✅ Factor 2: yarn workspaces, package.json dependencies
✅ Factor 3: .env files, CORS_ORIGIN, PORT variables
✅ Factor 4: SQLite như backing service
✅ Factor 5: yarn build → yarn start
✅ Factor 6: Stateless Express server
✅ Factor 7: Port binding (3000, 4000)
⚠️  Factor 10: Cần Docker để đảm bảo parity
⚠️  Factor 11: Cần centralized logging
```

## Beyond the Twelve-Factor App (3 Additional Factors)

Kevin Hoffman đề xuất 3 factors bổ sung cho cloud-native apps:

| # | Factor | Mô tả | Áp dụng |
|---|--------|-------|---------|
| 13 | **API First** | Thiết kế API trước implementation | OpenAPI spec, contract-first |
| 14 | **Telemetry** | Observable apps từ đầu | OpenTelemetry, metrics, traces |
| 15 | **Security** | Security as first-class concern | AuthN/AuthZ, secrets management |

## AWS Well-Architected OE Alignment (April 2025)

| AWS OE Design Principle | 12-Factor Mapping |
|------------------------|-------------------|
| Organize teams around business outcomes | Factor 1: Codebase organization |
| Implement observability | Factor 11: Logs as event streams |
| Safely automate where possible | Factor 5: Build, Release, Run |
| Make frequent, small, reversible changes | Factor 9: Disposability |
| Refine operations procedures | Factor 12: Admin processes |
| Anticipate failure | Factor 9: Fast startup, graceful shutdown |
| Learn from all operational events | Factor 11: Logs for analysis |
| Use managed services | Factor 4: Backing services |

## Modern Context (2024-2025)

| Original Factor | Modern Evolution |
|-----------------|------------------|
| Config | GitOps, workload identity thay vì env vars |
| Backing Services | Service mesh, sidecar pattern |
| Logs | OpenTelemetry, distributed tracing |
| Dev/Prod Parity | Kubernetes, containers |
| Concurrency | Serverless, auto-scaling |

## Checklist (Updated 2025)

- [ ] Tất cả config trong environment variables
- [ ] Dependencies được lock (yarn.lock)
- [ ] Stateless application design
- [ ] Graceful shutdown handling
- [ ] Logs output to stdout/stderr
- [ ] **Beyond 12-Factor**:
  - [ ] API-first design với OpenAPI
  - [ ] Telemetry (metrics, traces, logs)
  - [ ] Security built-in từ đầu
- [ ] **Modern Practices**:
  - [ ] Container-ready (Dockerfile)
  - [ ] GitOps-friendly manifests
  - [ ] Health check endpoints
