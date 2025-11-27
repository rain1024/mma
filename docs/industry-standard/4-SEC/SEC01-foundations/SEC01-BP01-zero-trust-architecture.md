# Zero Trust Architecture (ZTA)

## References

- [NIST SP 1800-35 - Implementing ZTA](https://pages.nist.gov/zero-trust-architecture/) - June 2025 (Final)
- [NIST SP 800-207 - Zero Trust Architecture](https://csrc.nist.gov/pubs/sp/800/207/final) - 2020
- [NCCoE ZTA Project](https://www.nccoe.nist.gov/projects/implementing-zero-trust-architecture)
- [Google BeyondCorp](https://cloud.google.com/beyondcorp)
- [Microsoft Zero Trust](https://www.microsoft.com/en-us/security/business/zero-trust)

## Date

2020 (NIST SP 800-207) | **June 2025 (NIST SP 1800-35 Final)** | Cập nhật: November 2025

## Tổng quan

Zero Trust (ZT) là paradigm bảo mật không tin tưởng ngầm định bất kỳ user, asset, hoặc resource nào dựa trên vị trí mạng. "Never trust, always verify."

NIST SP 1800-35 cung cấp **19 example implementations** từ 24 industry collaborators.

## Core Principles

| Principle | Mô tả |
|-----------|-------|
| **Verify Explicitly** | Luôn authenticate và authorize dựa trên tất cả data points |
| **Least Privilege** | Giới hạn access với just-in-time và just-enough |
| **Assume Breach** | Minimize blast radius, segment access, verify end-to-end encryption |

## Key Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Zero Trust Architecture                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐ │
│  │ Identity │   │  Device  │   │ Network  │   │   Data   │ │
│  │  & IAM   │   │  Health  │   │ Segement │   │ Security │ │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Policy Decision Point (PDP)              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Policy Enforcement Point (PEP)           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## ZTA Pillars

| Pillar | Components | Technologies |
|--------|------------|--------------|
| **Identity** | User, service, device identity | IAM, MFA, SSO |
| **Devices** | Device health, compliance | MDM, EDR |
| **Networks** | Microsegmentation | SASE, SD-WAN |
| **Applications** | App-level access control | API Gateway, Service Mesh |
| **Data** | Data classification, encryption | DLP, encryption at rest |
| **Visibility** | Monitoring, analytics | SIEM, XDR |

## NIST SP 1800-35 Key Technologies

| Category | Technologies |
|----------|--------------|
| **EIG** | Enhanced Identity Governance |
| **ICAM** | Identity, Credential, and Access Management |
| **Microsegmentation** | Network isolation at workload level |
| **SASE** | Secure Access Service Edge |

## Áp dụng cho dự án MMA

```typescript
// API-level access control
app.use('/api/admin/*',
  verifyToken,        // Verify identity
  checkDeviceHealth,  // Device compliance
  requireRole('admin'), // Least privilege
  auditLog            // Visibility
);

// Microsegmentation trong Kubernetes
// Network Policy để isolate namespaces
```

## Implementation Roadmap

```
Phase 1: Identity-Centric
├── Implement strong authentication (MFA)
├── Centralize identity management
└── Enable SSO

Phase 2: Device Trust
├── Device inventory
├── Health attestation
└── Conditional access

Phase 3: Network Segmentation
├── Microsegmentation
├── Software-defined perimeter
└── Encrypted communications

Phase 4: Application Security
├── API security
├── Service mesh
└── Runtime protection

Phase 5: Data Protection
├── Data classification
├── Encryption everywhere
└── DLP policies
```

## Checklist

- [ ] **Identity**:
  - [ ] MFA cho tất cả users
  - [ ] Centralized IAM
  - [ ] Service accounts với least privilege
- [ ] **Device**:
  - [ ] Device inventory
  - [ ] Health checks before access
- [ ] **Network**:
  - [ ] Microsegmentation
  - [ ] Encrypted communications (mTLS)
  - [ ] No implicit trust based on network location
- [ ] **Application**:
  - [ ] API authentication
  - [ ] Authorization at every request
- [ ] **Data**:
  - [ ] Data classification
  - [ ] Encryption at rest và in transit
- [ ] **Visibility**:
  - [ ] Centralized logging
  - [ ] Real-time monitoring
  - [ ] Anomaly detection
