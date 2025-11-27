# Platform Engineering

## References

- [CNCF Platform Engineering](https://tag-app-delivery.cncf.io/blog/proposal-platform-engineering-/)
- [Gartner Platform Engineering](https://www.gartner.com/en/articles/what-is-platform-engineering)
- [Platform Engineering Org](https://platformengineering.org/)
- [Backstage by Spotify](https://backstage.io/)
- [Score Workload Spec](https://score.dev/) - CNCF

## Date

2022 (Gartner recognition) | **2024 (10+ Gartner hype cycles)** | Cập nhật: November 2025

## Tổng quan

Platform Engineering xây dựng Internal Developer Platforms (IDPs) để streamline developer workflows. **Gartner: 80% software engineering orgs sẽ có platform teams by 2026**.

Key attributes: **Standardization, Scalability, Automation, Self-service**.

## Why Platform Engineering?

| Problem | Platform Solution |
|---------|------------------|
| Cognitive overload | Golden paths, abstractions |
| Inconsistent tooling | Standardized platform |
| Slow onboarding | Self-service portals |
| Shadow IT | Governed self-service |
| Manual ops | Automation, GitOps |

## Platform as a Product

```
┌─────────────────────────────────────────────────────────────┐
│                  Internal Developer Platform                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Developer Portal (e.g., Backstage)                         │
│  ├── Service Catalog                                         │
│  ├── Documentation                                           │
│  ├── Templates (Golden Paths)                                │
│  └── Self-service Actions                                    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Platform Capabilities                                       │
│  ├── CI/CD Pipelines          ├── Monitoring & Observability│
│  ├── Infrastructure Provisioning   ├── Security Scanning    │
│  ├── Container Orchestration  ├── Secrets Management        │
│  └── Database Management      └── Cost Management           │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Infrastructure Layer                                        │
│  ├── Kubernetes              ├── Cloud Services             │
│  ├── Terraform/Pulumi        └── Networking                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Developer Portal (Backstage)

```yaml
# catalog-info.yaml (Service definition)
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: mma-service
  description: MMA Tournament API Service
  tags:
    - nodejs
    - typescript
  annotations:
    github.com/project-slug: org/mma
    backstage.io/techdocs-ref: dir:.
spec:
  type: service
  lifecycle: production
  owner: team-mma
  system: mma-platform
  providesApis:
    - mma-api
```

### 2. Golden Paths (Templates)

```yaml
# template.yaml (Backstage Software Template)
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: nodejs-service
  title: Node.js Service
  description: Create a new Node.js microservice
spec:
  owner: platform-team
  type: service
  parameters:
    - title: Service Info
      required:
        - name
        - owner
      properties:
        name:
          title: Name
          type: string
        owner:
          title: Owner
          type: string
          ui:field: OwnerPicker
  steps:
    - id: fetch
      name: Fetch Template
      action: fetch:template
      input:
        url: ./skeleton
        values:
          name: ${{ parameters.name }}
    - id: publish
      name: Publish
      action: publish:github
      input:
        repoUrl: github.com?repo=${{ parameters.name }}&owner=org
```

### 3. Workload Specification (Score)

Score - CNCF sandbox project cho workload specification:

```yaml
# score.yaml
apiVersion: score.dev/v1b1
metadata:
  name: mma-service
containers:
  main:
    image: mma-service:latest
    variables:
      PORT: "4000"
      DATABASE_URL: "${resources.db.connection_string}"
resources:
  db:
    type: postgres
  dns:
    type: dns
```

Convert to Kubernetes:
```bash
score-compose generate score.yaml
score-k8s generate score.yaml
```

## 2025 Trends

| Trend | Description |
|-------|-------------|
| **Security by Design** | Security integrated from start, Zero Trust |
| **AI/GenAI Integration** | Auto-generate pipelines, configs, boilerplate |
| **API-First Development** | Standardized APIs from day one |
| **Cloud-Native** | Kubernetes as default orchestrator |
| **FinOps Integration** | Cost visibility per team/service |

## Platform Team Structure

```
Platform Team
├── Platform Architect
│   └── Overall design, standards
├── Platform Engineers
│   ├── Infrastructure automation
│   ├── CI/CD pipelines
│   └── Kubernetes management
├── Developer Experience (DevEx)
│   ├── Portal development
│   ├── Documentation
│   └── Templates/Golden Paths
└── Security Engineer
    └── Security controls, scanning
```

## Measuring Platform Success

| Metric | Target |
|--------|--------|
| **Developer Satisfaction** | NPS > 50 |
| **Time to First Deploy** | < 1 day |
| **Pipeline Success Rate** | > 95% |
| **Self-service Adoption** | > 80% of provisions |
| **Platform Availability** | > 99.9% |

## Implementation Roadmap

```
Phase 1: Foundation (Month 1-3)
├── Select and deploy developer portal
├── Document existing services
├── Basic CI/CD standardization
└── Team formation

Phase 2: Golden Paths (Month 4-6)
├── Create service templates
├── Standardize deployments
├── Self-service infrastructure
└── Observability stack

Phase 3: Self-service (Month 7-9)
├── Full self-service portal
├── Automated security scanning
├── Cost dashboards
└── Advanced templates

Phase 4: Optimization (Month 10-12)
├── AI-assisted automation
├── FinOps integration
├── Advanced analytics
└── Continuous improvement
```

## Áp dụng cho dự án MMA

```yaml
# Basic service catalog entry
# .backstage/catalog-info.yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: mma-web
  description: MMA Tournament Web Application
spec:
  type: website
  lifecycle: production
  owner: mma-team
  dependsOn:
    - component:mma-service
---
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: mma-service
  description: MMA Tournament API
spec:
  type: service
  lifecycle: production
  owner: mma-team
```

## Checklist

- [ ] **Foundation**:
  - [ ] Define platform vision và scope
  - [ ] Identify platform personas
  - [ ] Choose developer portal (Backstage, etc.)
- [ ] **Developer Experience**:
  - [ ] Create service catalog
  - [ ] Document all services
  - [ ] Build templates/golden paths
- [ ] **Self-service**:
  - [ ] CI/CD self-service
  - [ ] Infrastructure provisioning
  - [ ] Environment creation
- [ ] **Observability**:
  - [ ] Centralized logging
  - [ ] Metrics dashboards
  - [ ] Distributed tracing
- [ ] **Security**:
  - [ ] Automated scanning
  - [ ] Policy enforcement
  - [ ] Secrets management
- [ ] **Metrics**:
  - [ ] Developer satisfaction surveys
  - [ ] Platform adoption tracking
  - [ ] Performance metrics
