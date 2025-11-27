# Container & Kubernetes Security

## References

- [CIS Kubernetes Benchmarks](https://www.cisecurity.org/benchmark/kubernetes)
- [Kubernetes Security Checklist](https://kubernetes.io/docs/concepts/security/security-checklist/)
- [kube-bench](https://github.com/aquasecurity/kube-bench) - CIS Benchmark scanner
- [Trivy](https://trivy.dev/) - Vulnerability scanner
- [OPA Gatekeeper](https://open-policy-agent.github.io/gatekeeper/)
- [Kyverno](https://kyverno.io/)

## Date

2019 (CIS v1.5) | 2024 (CIS v1.9) | **2025 (CIS v1.10.0)** | Cập nhật: November 2025

## Tổng quan

CIS Kubernetes Benchmark v1.10.0 hỗ trợ K8s v1.29, 1.30, 1.31 với **20+ recommendations mới**. **67% companies đã delay operations do Kubernetes security issues** (2024 report).

## Security Landscape 2024-2025

| Concern | % Organizations |
|---------|-----------------|
| Vulnerabilities | Top concern |
| Misconfigurations | Top concern |
| Runtime threats | Growing |
| Supply chain | Critical |

## CIS Benchmark Levels

| Level | Description | Applicability |
|-------|-------------|---------------|
| **Level 1** | Basic security, minimal impact | Everyone |
| **Level 2** | Defense-in-depth, may impact functionality | High security environments |

## Production Security Checklist

### 1. API Server Security

```yaml
# Restrict API server access
--anonymous-auth=false
--authorization-mode=RBAC,Node
--enable-admission-plugins=NodeRestriction,PodSecurity
```

### 2. RBAC (Role-Based Access Control)

```yaml
# Principle of least privilege
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: mma-service-role
  namespace: mma
rules:
- apiGroups: [""]
  resources: ["configmaps", "secrets"]
  resourceNames: ["mma-config", "mma-secrets"]
  verbs: ["get"]
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]
```

### 3. Pod Security Standards

```yaml
# Pod Security Admission (PSA)
apiVersion: v1
kind: Namespace
metadata:
  name: mma
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

### 4. Secure Pod Configuration

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mma-service
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 1000
    fsGroup: 1000
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: mma-service
    image: mma-service:v1.0.0@sha256:abc123...  # Use digest
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
          - ALL
    resources:
      limits:
        cpu: "500m"
        memory: "256Mi"
      requests:
        cpu: "100m"
        memory: "128Mi"
```

### 5. Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: mma-service-network
  namespace: mma
spec:
  podSelector:
    matchLabels:
      app: mma-service
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: mma
    - podSelector:
        matchLabels:
          app: mma-web
    ports:
    - protocol: TCP
      port: 4000
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: database
    ports:
    - protocol: TCP
      port: 5432
```

## Image Security

### Dockerfile Best Practices

```dockerfile
# Use specific, minimal base image
FROM node:20-alpine3.19

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy only necessary files
COPY --chown=nodejs:nodejs package*.json ./
RUN npm ci --only=production

COPY --chown=nodejs:nodejs dist/ ./dist/

# Switch to non-root user
USER nodejs

EXPOSE 4000

CMD ["node", "dist/index.js"]
```

### Image Scanning

```bash
# Scan with Trivy
trivy image mma-service:latest

# Scan trong CI/CD
trivy image --exit-code 1 --severity HIGH,CRITICAL mma-service:latest
```

## Policy Engines

### OPA Gatekeeper

```yaml
# Require non-root containers
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequireNonRoot
metadata:
  name: require-non-root
spec:
  match:
    kinds:
    - apiGroups: [""]
      kinds: ["Pod"]
```

### Kyverno

```yaml
# Block privileged containers
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: disallow-privileged
spec:
  validationFailureAction: Enforce
  rules:
  - name: deny-privileged
    match:
      any:
      - resources:
          kinds:
          - Pod
    validate:
      message: "Privileged containers are not allowed"
      pattern:
        spec:
          containers:
          - securityContext:
              privileged: "false"
```

## Scanning Tools

| Tool | Purpose | Integration |
|------|---------|-------------|
| **kube-bench** | CIS Benchmark compliance | CLI, CI/CD |
| **Trivy** | Vulnerability scanning | CLI, CI/CD, Operator |
| **Falco** | Runtime security | DaemonSet |
| **Kubescape** | Security posture | CLI, Operator |

### Run kube-bench

```bash
# Run as Job
kubectl apply -f https://raw.githubusercontent.com/aquasecurity/kube-bench/main/job.yaml
kubectl logs job.batch/kube-bench
```

## Secrets Management

```yaml
# BAD: Secret in env var
env:
- name: DATABASE_PASSWORD
  value: "plaintext-password"

# GOOD: Secret from Kubernetes Secret
env:
- name: DATABASE_PASSWORD
  valueFrom:
    secretKeyRef:
      name: mma-secrets
      key: database-password

# BETTER: External Secrets Operator
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: mma-secrets
spec:
  secretStoreRef:
    name: aws-secrets-manager
    kind: ClusterSecretStore
  target:
    name: mma-secrets
  data:
  - secretKey: database-password
    remoteRef:
      key: /mma/database
      property: password
```

## Checklist (Quarterly Review Recommended)

- [ ] **Cluster Security**:
  - [ ] API server restricted to trusted networks
  - [ ] Audit logging enabled
  - [ ] etcd data encrypted at rest
  - [ ] Certificate rotation configured
- [ ] **RBAC**:
  - [ ] Least privilege principle
  - [ ] No cluster-admin for applications
  - [ ] Regular RBAC audit
- [ ] **Pod Security**:
  - [ ] Pod Security Standards enforced
  - [ ] Non-root containers
  - [ ] Read-only root filesystem
  - [ ] Capabilities dropped
- [ ] **Network**:
  - [ ] Network policies defined
  - [ ] Default deny ingress/egress
  - [ ] Service mesh (optional)
- [ ] **Images**:
  - [ ] Trusted registries only
  - [ ] Image signing/verification
  - [ ] Regular vulnerability scanning
  - [ ] No latest tag in production
- [ ] **Secrets**:
  - [ ] Secrets encrypted at rest
  - [ ] External secrets manager
  - [ ] Regular rotation
- [ ] **Monitoring**:
  - [ ] Runtime security (Falco)
  - [ ] Audit log analysis
  - [ ] Anomaly detection
- [ ] **Compliance**:
  - [ ] Regular kube-bench scans
  - [ ] CIS Benchmark Level 1 compliance
