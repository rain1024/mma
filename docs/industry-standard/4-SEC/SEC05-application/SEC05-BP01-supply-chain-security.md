# Software Supply Chain Security

## References

- [CISA 2025 Minimum Elements for SBOM](https://www.cisa.gov/resources-tools/resources/2025-minimum-elements-software-bill-materials-sbom) - 2025
- [CISA SBOM Guidance](https://www.cisa.gov/sbom)
- [SLSA Framework](https://slsa.dev/) - OpenSSF
- [NIST Software Supply Chain Security](https://www.nist.gov/itl/executive-order-14028-improving-nations-cybersecurity/software-security-supply-chains-software-1)
- [CycloneDX SBOM Standard](https://cyclonedx.org/)
- [SPDX Specification](https://spdx.dev/)

## Date

2021 (Executive Order 14028) | 2024 (CISA SBOM Guidance) | **2025 (CISA Minimum Elements)** | Cập nhật: November 2025

## Tổng quan

Software Supply Chain Security bảo vệ toàn bộ lifecycle của software từ development đến deployment. **Gartner dự đoán 45% organizations sẽ bị attack qua supply chain năm 2025** (tăng 3x từ 2021).

OWASP Top 10:2025 đã thêm **Software Supply Chain Failures (A03)** như một category mới.

## SBOM (Software Bill of Materials)

### CISA 2024 Three-Tiered Maturity Model

| Tier | Level | Description |
|------|-------|-------------|
| 1 | **Minimum Expected** | Essential elements for basic compliance |
| 2 | **Recommended Practice** | Enhanced documentation |
| 3 | **Aspirational Goal** | Comprehensive visibility |

### CISA 2025 Required Data Fields (9 fields)

| Field | Description | Format |
|-------|-------------|--------|
| **Author Name** | Entity that created SBOM | String |
| **Timestamp** | Production date/time | ISO 8601 |
| **Component Name** | Software component name | String |
| **Version** | Component version | Semver/String |
| **Component Hash** | Cryptographic hash | SHA-256+ |
| **Unique Identifier** | PURL, CPE, or SWID | Machine-readable |
| **Relationship** | Component relationships | Primary/Dependency |
| **Software Producer** | Original software author | String |
| **SBOM Author** | SBOM creator (if different) | String |

### Supported Formats

| Format | Description | Use Case |
|--------|-------------|----------|
| **CycloneDX** | OWASP standard, lightweight | General purpose, security |
| **SPDX** | Linux Foundation, detailed | License compliance |
| **SWID** | ISO/IEC 19770-2 | Asset management |

### Generating SBOM

```bash
# CycloneDX for Node.js
npx @cyclonedx/cyclonedx-npm --output-file sbom.json

# SPDX for Node.js
npx spdx-sbom-generator -p . -o sbom-spdx.json

# Syft (multi-language)
syft . -o cyclonedx-json > sbom.json
```

## SLSA (Supply-chain Levels for Software Artifacts)

### SLSA Levels

| Level | Requirements | Security Guarantee |
|-------|--------------|-------------------|
| **Level 1** | Document build process, generate provenance | Basic transparency |
| **Level 2** | Hosted build, signed provenance | Tampering detection |
| **Level 3** | Hardened build, source-aware | High integrity |
| **Level 4** | Hermetic build, dependency tracking | Full attestation |

### SLSA Requirements by Level

```
Level 1: Documentation
├── Build script exists
└── Provenance generated

Level 2: Build Service
├── Hosted build platform
├── Signed provenance
└── Source awareness

Level 3: Hardened Build
├── Isolated builds
├── Ephemeral environment
├── Parameterless builds
└── Script from source

Level 4: Complete Attestation
├── Hermetic builds
├── Reproducible builds
├── Dependency provenance
└── Two-person review
```

### SLSA Provenance Example

```json
{
  "_type": "https://in-toto.io/Statement/v1",
  "subject": [
    {
      "name": "mma-service",
      "digest": { "sha256": "abc123..." }
    }
  ],
  "predicateType": "https://slsa.dev/provenance/v1",
  "predicate": {
    "buildDefinition": {
      "buildType": "https://github.com/actions/...",
      "externalParameters": {
        "repository": "https://github.com/user/mma"
      }
    },
    "runDetails": {
      "builder": { "id": "https://github.com/actions/runner" }
    }
  }
}
```

## Implementation cho dự án MMA

### 1. Dependency Scanning

```yaml
# .github/workflows/security.yml
name: Security Scan
on: [push, pull_request]
jobs:
  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run yarn audit
        run: yarn audit --level high
      - name: Run Snyk
        uses: snyk/actions/node@master
```

### 2. SBOM Generation

```yaml
  sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate SBOM
        uses: CycloneDX/gh-node-module-generatebom@v1
        with:
          output: sbom.json
      - name: Upload SBOM
        uses: actions/upload-artifact@v3
        with:
          name: sbom
          path: sbom.json
```

### 3. Lock File Verification

```bash
# Ensure lockfile is committed and synced
yarn install --frozen-lockfile

# Verify integrity
yarn check --integrity
```

## Checklist

- [ ] **SBOM**:
  - [ ] Generate SBOM cho mỗi release
  - [ ] Include trong CI/CD pipeline
  - [ ] Store với artifacts
- [ ] **Dependency Management**:
  - [ ] Lock files committed (`yarn.lock`)
  - [ ] Regular `yarn audit`
  - [ ] Dependabot/Renovate enabled
  - [ ] Review dependency changes
- [ ] **SLSA**:
  - [ ] Level 1: Documented build process
  - [ ] Level 2: Signed provenance (optional)
- [ ] **Verification**:
  - [ ] Verify package integrity
  - [ ] Pin versions where critical
  - [ ] Review transitive dependencies
- [ ] **Secrets**:
  - [ ] No secrets in code
  - [ ] Secrets scanning enabled
  - [ ] Rotate credentials regularly
