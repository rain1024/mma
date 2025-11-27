# Policy as Code (PaC)

## References

- [Open Policy Agent (OPA)](https://www.openpolicyagent.org/) - CNCF Graduated Project
- [OPA Best Practices](https://www.cncf.io/blog/2025/03/18/open-policy-agent-best-practices-for-a-secure-deployment/) - CNCF (2025)
- [HashiCorp Sentinel](https://www.hashicorp.com/sentinel) - Policy as Code Framework
- [Kyverno](https://kyverno.io/) - Kubernetes Native Policy Engine
- [Checkov](https://www.checkov.io/) - IaC Security Scanner

## Date

2017 (OPA release) | **2025 (CNCF Graduated)** | Cập nhật: November 2025

## Tổng quan

Policy as Code (PaC) là kỹ thuật quản lý policies dưới dạng code, cho phép version control, testing, và automated enforcement. OPA (Open Policy Agent) là standard de facto cho PaC trong cloud-native environments.

## Tại sao cần Policy as Code?

| Vấn đề | Giải pháp PaC |
|--------|---------------|
| Manual policy enforcement | Automated, consistent enforcement |
| Policy drift | Version-controlled policies |
| Audit complexity | Comprehensive audit trails |
| Slow compliance | Real-time policy evaluation |
| Siloed policies | Unified policy management |

## Tool Landscape 2025

| Tool | Focus | Language | Use Cases |
|------|-------|----------|-----------|
| **OPA** | General-purpose | Rego | K8s, APIs, Terraform, CI/CD |
| **Kyverno** | Kubernetes-native | YAML | K8s admission, mutation |
| **Sentinel** | HashiCorp stack | Sentinel | Terraform, Vault, Consul |
| **Checkov** | IaC scanning | Python | Terraform, CloudFormation |
| **Conftest** | Config testing | Rego | Docker, K8s, Terraform |

## OPA Architecture

```
                    ┌─────────────────┐
                    │   Policy Store  │
                    │   (Rego files)  │
                    └────────┬────────┘
                             │
┌──────────┐    Query   ┌────▼────┐    Decision    ┌──────────┐
│ Service  │───────────►│   OPA   │───────────────►│  Enforce │
│ (K8s,API)│            │ Engine  │                │  Action  │
└──────────┘            └────┬────┘                └──────────┘
                             │
                    ┌────────▼────────┐
                    │  External Data  │
                    │  (LDAP, APIs)   │
                    └─────────────────┘
```

## Rego Language Basics

```rego
# policy.rego - Deny containers without resource limits
package kubernetes.admission

deny[msg] {
    input.request.kind.kind == "Pod"
    container := input.request.object.spec.containers[_]
    not container.resources.limits
    msg := sprintf("Container %v must have resource limits", [container.name])
}

# Allow only approved registries
deny[msg] {
    input.request.kind.kind == "Pod"
    container := input.request.object.spec.containers[_]
    not startswith(container.image, "gcr.io/my-project/")
    not startswith(container.image, "docker.io/library/")
    msg := sprintf("Image %v is not from approved registry", [container.name])
}
```

## Kubernetes Integration (Gatekeeper)

```yaml
# ConstraintTemplate
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequiredlabels
spec:
  crd:
    spec:
      names:
        kind: K8sRequiredLabels
      validation:
        openAPIV3Schema:
          properties:
            labels:
              type: array
              items: { type: string }
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequiredlabels
        violation[{"msg": msg}] {
          provided := {label | input.review.object.metadata.labels[label]}
          required := {label | label := input.parameters.labels[_]}
          missing := required - provided
          count(missing) > 0
          msg := sprintf("Missing labels: %v", [missing])
        }
---
# Constraint
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredLabels
metadata:
  name: require-team-label
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Namespace"]
  parameters:
    labels: ["team", "environment"]
```

## Terraform + Sentinel

```hcl
# sentinel/require-tags.sentinel
import "tfplan/v2" as tfplan

required_tags = ["Environment", "Owner", "CostCenter"]

aws_instances = filter tfplan.resource_changes as _, rc {
    rc.type is "aws_instance" and
    rc.mode is "managed" and
    rc.change.actions contains "create"
}

tags_contain_required = rule {
    all aws_instances as _, instance {
        all required_tags as tag {
            instance.change.after.tags contains tag
        }
    }
}

main = rule { tags_contain_required }
```

## Best Practices 2025

| Practice | Description |
|----------|-------------|
| **Modular Policies** | Break policies into reusable modules |
| **Test Policies** | Unit test với `opa test` trước khi deploy |
| **Version Control** | Policies trong Git, review như code |
| **Gradual Rollout** | warn → deny theo stages |
| **Centralized Management** | Styra DAS cho enterprise scale |
| **Secure Deployment** | Restrict Rego built-ins, validate inputs |

## CI/CD Integration

```yaml
# .github/workflows/policy-check.yml
name: Policy Validation
on: [pull_request]
jobs:
  opa-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup OPA
        uses: open-policy-agent/setup-opa@v2
      - name: Test Policies
        run: opa test policies/ -v
      - name: Check Terraform
        run: conftest test terraform/ --policy policies/terraform/
```

## Checklist

- [ ] **Foundation**:
  - [ ] Policy engine selected (OPA, Kyverno, Sentinel)
  - [ ] Policies in version control
  - [ ] Policy testing framework setup
- [ ] **Kubernetes**:
  - [ ] Gatekeeper/Kyverno deployed
  - [ ] Admission policies defined
  - [ ] Mutation policies (if needed)
- [ ] **IaC**:
  - [ ] Pre-commit policy checks
  - [ ] CI/CD policy gates
  - [ ] Drift detection policies
- [ ] **Governance**:
  - [ ] Policy ownership defined
  - [ ] Exception process documented
  - [ ] Audit logging enabled
  - [ ] Compliance reporting
- [ ] **Operations**:
  - [ ] Gradual rollout (warn → deny)
  - [ ] Alert on policy violations
  - [ ] Regular policy reviews
