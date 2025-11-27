# FinOps Principles

## References

- [FinOps Foundation](https://www.finops.org/)
- [FOCUS Specification](https://focus.finops.org/) - FinOps Open Cost and Usage Specification
- [State of FinOps 2025](https://www.finops.org/insights/key-priorities-shift-in-2024/)
- [FinOps X 2025 Announcements](https://www.finops.org/insights/finops-x-2025-cloud-announcements/)
- [AWS Cost Optimization Pillar](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/)
- [Spotify Cost Insights](https://backstage.io/docs/features/cost-insights/)

## Date

2019 (FinOps Foundation) | 2024 (FOCUS 1.0 GA) | **May 2025 (FOCUS 1.2 GA)** | Cập nhật: November 2025

## Tổng quan

FinOps (Cloud Financial Operations) là practice quản lý chi phí cloud, kết hợp Finance, Engineering và Business. **FOCUS** (FinOps Open Cost and Usage Specification) đã trở thành chuẩn chung cho cloud billing data.

## FOCUS Specification (MỚI)

### What is FOCUS?

FOCUS là open-source specification chuẩn hóa cloud billing data từ các providers khác nhau:

| Provider | FOCUS Support |
|----------|---------------|
| AWS | GA (re:Invent 2024) |
| Azure | GA |
| Google Cloud | GA |
| Oracle Cloud | GA |
| Tencent Cloud | GA |

### FOCUS 1.2 Updates (May 2025)

- **SaaS/PaaS support** - Unified billing cho cloud, SaaS, và PaaS trong cùng schema
- **7 new columns** - Invoice ID, billing/sub account, national currency conversion
- **Virtual currencies** - Track credits/tokens từ SaaS vendors
- **New providers** - Alibaba Cloud, Databricks, Grafana joined AWS, Azure, GCP, Oracle

### Benefits

```
Before FOCUS:
┌─────────┐  ┌─────────┐  ┌─────────┐
│   AWS   │  │  Azure  │  │   GCP   │
│ CUR/DBR │  │ Billing │  │ Billing │
└────┬────┘  └────┬────┘  └────┬────┘
     │            │            │
     ▼            ▼            ▼
   Different schemas, different queries

After FOCUS:
┌─────────┐  ┌─────────┐  ┌─────────┐
│   AWS   │  │  Azure  │  │   GCP   │
│  FOCUS  │  │  FOCUS  │  │  FOCUS  │
└────┬────┘  └────┬────┘  └────┬────┘
     │            │            │
     └────────────┼────────────┘
                  ▼
         Unified schema, one query
```

## 3 Phases của FinOps

| Phase | Mục tiêu | Activities |
|-------|----------|------------|
| **Inform** | Visibility | Tagging, cost allocation, dashboards |
| **Optimize** | Efficiency | Right-sizing, reserved capacity, waste reduction |
| **Operate** | Governance | Budgets, alerts, policies, automation |

## 6 Principles

| Principle | Mô tả |
|-----------|-------|
| **Teams collaborate** | Finance + Engineering + Business |
| **Decisions based on business value** | Cost vs. value, không chỉ cost |
| **Everyone owns cloud cost** | Shared responsibility |
| **Timely reports** | Near real-time visibility |
| **Centralized team drives FinOps** | FinOps team coordinates |
| **Variable cost model** | Leverage cloud elasticity |

## 2025 Key Priorities

| Priority | % Focus | Notes |
|----------|---------|-------|
| **Workload Optimization** | 40%+ | Top priority |
| **Waste Reduction** | #1 | First time as top priority |
| **AI Cost Management** | Growing | Early stages, focus on visibility |
| **Rate Optimization** | Decreased | Better commitment results achieved |

## Cost Optimization Strategies

```
┌─────────────────────────────────────────────┐
│              Optimization Ladder            │
├─────────────────────────────────────────────┤
│  1. Turn off unused resources               │  ← Quick wins
│  2. Right-size over-provisioned resources   │
│  3. Use Reserved/Savings Plans              │
│  4. Use Spot/Preemptible instances          │
│  5. Architect for cost efficiency           │  ← Strategic
│  6. AI cost optimization                    │  ← 2025 focus
└─────────────────────────────────────────────┘
```

## AI Cost Management (2025)

| Stage | Focus |
|-------|-------|
| **Current** | Visibility - tracking AI spending |
| **Near-term** | Allocation - attributing costs to teams |
| **Future** | Optimization - reducing AI costs |

```typescript
// Tag AI workloads for cost tracking
const aiWorkload = {
  tags: {
    CostCenter: 'ai-ml',
    Project: 'llm-integration',
    Model: 'gpt-4',
    Environment: 'production',
  },
};
```

## Tagging Strategy

```yaml
# Required tags for all resources
Environment: production | staging | development
Team: web | service | data | ai-ml
Project: mma-tournament
CostCenter: engineering
Owner: team-email@company.com
ManagedBy: terraform | manual

# Optional tags
Application: mma-api
Service: athlete-service
```

## Automation

```typescript
// Automated unused resource detection
async function findUnusedResources() {
  const ec2 = new AWS.EC2();

  // Find instances with low CPU utilization
  const metrics = await cloudwatch.getMetricStatistics({
    Namespace: 'AWS/EC2',
    MetricName: 'CPUUtilization',
    Period: 86400 * 7, // 7 days
    Statistics: ['Average'],
  });

  return metrics.Datapoints
    .filter(d => d.Average < 5) // < 5% CPU
    .map(d => d.InstanceId);
}

// Schedule cleanup
cron.schedule('0 0 * * 1', async () => {
  const unused = await findUnusedResources();
  await notifyTeam(unused);
});
```

## Checklist

- [ ] **Visibility**:
  - [ ] 100% resources có tags
  - [ ] Cost dashboards per team/project
  - [ ] FOCUS data export enabled
- [ ] **Optimization**:
  - [ ] Budget alerts (50%, 80%, 100%)
  - [ ] Monthly cost reviews
  - [ ] Unused resources cleanup automation
  - [ ] Reserved capacity cho stable workloads
- [ ] **Governance**:
  - [ ] Cost allocation policies
  - [ ] Approval workflows for large provisions
  - [ ] Regular optimization reviews
- [ ] **AI Costs (2025)**:
  - [ ] Tag AI/ML workloads
  - [ ] Track model costs separately
  - [ ] Monitor token usage
- [ ] **FOCUS**:
  - [ ] Enable FOCUS export từ cloud providers
  - [ ] Unified cost dashboard
  - [ ] Cross-cloud cost analysis
