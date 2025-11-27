# Infrastructure as Code (IaC)

## References

- [Terraform by HashiCorp](https://www.terraform.io/) - BSL License (Aug 2023)
- [OpenTofu](https://opentofu.org/) - Open-source Terraform fork (Linux Foundation)
- [Pulumi](https://www.pulumi.com/) - Multi-language IaC
- [AWS CloudFormation](https://aws.amazon.com/cloudformation/)
- [AWS CDK Best Practices](https://docs.aws.amazon.com/cdk/v2/guide/best-practices.html)
- [IaC Tools Comparison 2025](https://toolshelf.tech/blog/terraform-vs-pulumi-vs-opentofu-2025-iac-showdown/)

## Date

2011 (CloudFormation) | 2014 (Terraform) | **2023 (OpenTofu fork)** | Cập nhật: November 2025

## Tổng quan

Quản lý và provisioning infrastructure thông qua code thay vì manual processes. Năm 2023, HashiCorp đổi license Terraform sang BSL, dẫn đến sự ra đời của OpenTofu - fork open-source được Linux Foundation quản lý.

## Market Landscape 2025

| Tool | Market Share | License | Notes |
|------|--------------|---------|-------|
| **Terraform** | ~64% | BSL 1.1 | Dominant, enterprise features |
| **OpenTofu** | ~20% greenfield | MPL 2.0 | Community-driven, HCL compatible |
| **Pulumi** | Growing | Apache 2.0 | Multi-language, 167% contribution growth |
| **CloudFormation** | AWS only | Proprietary | Deep AWS integration |
| **AWS CDK** | AWS only | Apache 2.0 | TypeScript/Python, synthesizes to CFN |

## Nguyên tắc cốt lõi

| Nguyên tắc | Mô tả |
|------------|-------|
| **Declarative** | Khai báo desired state, tool tự tìm cách đạt được |
| **Idempotent** | Chạy nhiều lần cho kết quả giống nhau |
| **Version Control** | Infrastructure code trong Git |
| **Immutable** | Thay thế thay vì modify |
| **Self-documenting** | Code là documentation |

## Tool Selection Guide (2025)

| Scenario | Recommended |
|----------|-------------|
| Enterprise, okay with BSL | Terraform |
| Open-source, Terraform-compatible | OpenTofu |
| Developer-first, familiar languages | Pulumi |
| AWS-only, deep integration | CDK / CloudFormation |
| Multi-IaC orchestration | Terramate, Terragrunt |

## Terraform vs OpenTofu

```
Terraform (HashiCorp)          OpenTofu (Linux Foundation)
├── BSL 1.1 license            ├── MPL 2.0 (always open-source)
├── Terraform Cloud            ├── Community-driven
├── Enterprise features        ├── Rapid feature development
├── Established ecosystem      ├── Growing ecosystem
└── Single vendor              └── Multi-vendor governance
```

## Ví dụ Terraform/OpenTofu

```hcl
# main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "mma-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "ap-southeast-1"
  }
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name        = "mma-web-server"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}
```

## Ví dụ Pulumi (TypeScript)

```typescript
import * as aws from "@pulumi/aws";

const webServer = new aws.ec2.Instance("mma-web", {
  ami: "ami-0c55b159cbfafe1f0",
  instanceType: "t3.micro",
  tags: {
    Name: "mma-web-server",
    Environment: "production",
    ManagedBy: "pulumi",
  },
});

export const publicIp = webServer.publicIp;
```

## 2025 Trends

| Trend | Description |
|-------|-------------|
| **Multi-IaC Adoption** | Organizations using multiple tools per team |
| **AI-Assisted IaC** | 25% of new code written by AI (Google) |
| **GitOps Integration** | IaC managed via GitOps workflows |
| **Policy as Code** | OPA, Sentinel cho compliance |
| **OpenTofu Growth** | 20% greenfield projects starting with OpenTofu |

## Checklist

- [ ] **Foundation**:
  - [ ] Tất cả infrastructure trong version control
  - [ ] Remote state management (S3, Terraform Cloud)
  - [ ] State locking enabled
- [ ] **Organization**:
  - [ ] Sử dụng modules để tái sử dụng
  - [ ] Environment separation (dev/staging/prod)
  - [ ] Consistent naming conventions
- [ ] **CI/CD**:
  - [ ] Automated plan on PR
  - [ ] Manual approval for apply
  - [ ] Code review cho infrastructure changes
- [ ] **Security**:
  - [ ] Secrets không hardcode (use Vault, AWS Secrets Manager)
  - [ ] Least privilege IAM roles
  - [ ] Policy as Code (OPA, Sentinel)
- [ ] **Tool Selection**:
  - [ ] Evaluate Terraform vs OpenTofu vs Pulumi
  - [ ] Consider license implications
  - [ ] Document decision rationale
