# GitOps Principles

## References

- [GitOps Principles - CNCF](https://www.cncf.io/blog/2025/06/09/gitops-in-2025-from-old-school-updates-to-the-modern-way/)
- [Argo CD](https://argo-cd.readthedocs.io/)
- [Flux CD](https://fluxcd.io/)
- [AWS GitOps Guide](https://docs.aws.amazon.com/prescriptive-guidance/latest/eks-gitops-tools/use-cases.html)
- [OpenGitOps](https://opengitops.dev/)

## Date

2017 (GitOps coined by Weaveworks) | **2025 (Argo CD v3.2.0, Flux CNCF Graduated)** | Cập nhật: November 2025

## Tổng quan

GitOps sử dụng Git như single source of truth cho declarative infrastructure và applications. Tools như Argo CD và Flux continuously reconcile live state với desired state trong Git.

**GitOps is mainstream (2025)** - Platform engineering teams standardize on GitOps workflows. Argo CD v3.2.0 available; v2.14.x EOL as of Nov 4, 2025. Flux is CNCF Graduated and categorized as "Adopt" on CNCF CI/CD Tech Radar.

## Core Principles (OpenGitOps)

| Principle | Description |
|-----------|-------------|
| **Declarative** | Desired state declared, not imperative commands |
| **Versioned & Immutable** | Desired state stored in Git with full history |
| **Pulled Automatically** | Agents pull changes (vs CI push) |
| **Continuously Reconciled** | Agents ensure actual = desired state |

## GitOps vs Traditional CI/CD

```
Traditional CI/CD (Push Model):
┌──────┐    ┌────────┐    ┌─────────┐    ┌─────────┐
│ Code │ -> │   CI   │ -> │   CD    │ -> │ Cluster │
│ Push │    │ Build  │    │  Push   │    │         │
└──────┘    └────────┘    └─────────┘    └─────────┘

GitOps (Pull Model):
┌──────┐    ┌────────┐    ┌──────────┐
│ Code │ -> │   CI   │ -> │ Git Repo │
│ Push │    │ Build  │    │ (Config) │
└──────┘    └────────┘    └────┬─────┘
                               │ Pull
                    ┌──────────▼─────────┐
                    │   GitOps Agent     │
                    │ (Argo CD / Flux)   │
                    └──────────┬─────────┘
                               │ Apply
                    ┌──────────▼─────────┐
                    │     Cluster        │
                    └────────────────────┘
```

## ArgoCD vs FluxCD

| Feature | Argo CD | Flux CD |
|---------|---------|---------|
| **UI** | Rich Web UI | CLI-first (optional UI) |
| **Architecture** | Monolithic | Modular (GitOps Toolkit) |
| **Multi-tenancy** | Native support | Via RBAC |
| **Learning Curve** | Lower | Higher |
| **Resource Usage** | Higher | Lower |
| **Helm Support** | Yes | Yes |
| **Kustomize** | Yes | Yes |
| **Best For** | Dev experience, visualization | Platform engineers, automation |

### When to Choose:

- **Argo CD**: Team needs visibility, onboarding developers, managing many apps
- **Flux CD**: Platform engineering, modular workflows, resource-constrained

## Repository Structure

### Recommended: Separate Repos

```
app-repo/              # Application source code
├── src/
├── Dockerfile
└── package.json

infra-repo/            # Infrastructure configs
├── base/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── kustomization.yaml
└── overlays/
    ├── dev/
    │   └── kustomization.yaml
    ├── staging/
    │   └── kustomization.yaml
    └── prod/
        └── kustomization.yaml
```

### Application Manifest Example

```yaml
# base/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mma-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: mma-service
  template:
    metadata:
      labels:
        app: mma-service
    spec:
      containers:
      - name: mma-service
        image: mma-service:latest  # Updated by CI
        ports:
        - containerPort: 4000
        env:
        - name: NODE_ENV
          value: production
```

## Argo CD Configuration

```yaml
# argocd-application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: mma-service
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/org/mma-infra
    targetRevision: HEAD
    path: overlays/prod
  destination:
    server: https://kubernetes.default.svc
    namespace: mma
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

## Flux CD Configuration

```yaml
# flux-gitrepository.yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: mma-infra
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/org/mma-infra
  ref:
    branch: main

---
# flux-kustomization.yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: mma-service
  namespace: flux-system
spec:
  interval: 10m
  sourceRef:
    kind: GitRepository
    name: mma-infra
  path: ./overlays/prod
  prune: true
  targetNamespace: mma
```

## Secrets Management in GitOps

| Tool | Description |
|------|-------------|
| **Mozilla SOPS** | Encrypt secrets, decrypt at deploy |
| **Sealed Secrets** | Encrypt with cluster public key |
| **External Secrets** | Sync from AWS Secrets Manager, Vault |
| **Vault** | Full secrets management |

### SOPS Example

```yaml
# secrets.enc.yaml (encrypted)
apiVersion: v1
kind: Secret
metadata:
  name: mma-secrets
data:
  DATABASE_URL: ENC[AES256_GCM,data:xxx,iv:xxx,tag:xxx]
```

## Benefits

| Benefit | Description |
|---------|-------------|
| **Faster Releases** | Automated deployments |
| **Safer Operations** | Versioned, auditable changes |
| **Easy Rollbacks** | Git revert = cluster revert |
| **Consistent Environments** | Same manifests across dev/staging/prod |
| **Improved Security** | No direct cluster access needed |

## Checklist

- [ ] **Repository Setup**:
  - [ ] Separate app và config repos
  - [ ] Use Kustomize hoặc Helm
  - [ ] Branch strategy (main = prod)
- [ ] **GitOps Agent**:
  - [ ] Deploy Argo CD hoặc Flux
  - [ ] Configure sync policies
  - [ ] Enable auto-sync cho non-prod
- [ ] **Secrets**:
  - [ ] Encrypt secrets (SOPS/Sealed Secrets)
  - [ ] Never commit plain secrets
- [ ] **RBAC**:
  - [ ] Limit who can merge to main
  - [ ] PR reviews required
- [ ] **Monitoring**:
  - [ ] Alert on sync failures
  - [ ] Dashboard cho deployment status
- [ ] **Rollback**:
  - [ ] Test rollback procedure
  - [ ] Document rollback process
