# Compute Selection

## References

- [AWS Well-Architected - Select Best Compute](https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/selecting-the-right-compute-options.html)
- [AWS Compute Optimizer](https://aws.amazon.com/compute-optimizer/)
- [AWS Instance Types](https://aws.amazon.com/ec2/instance-types/)
- [Choosing Compute Options](https://aws.amazon.com/getting-started/decision-guides/compute-on-aws-guide/)

## Date

* 2025-11-27

---

## Tổng quan

AWS Well-Architected Performance Efficiency: **"Consider mechanical sympathy"** - chọn compute type phù hợp với workload characteristics. Wrong compute choice dẫn đến poor performance và wasted costs.

## Compute Options Comparison

| Option | Best For | Scaling | Operational Overhead |
|--------|----------|---------|---------------------|
| **EC2** | Full control, specific HW | Manual/Auto | High |
| **ECS/EKS** | Containers, microservices | Task-based | Medium |
| **Lambda** | Event-driven, short tasks | Automatic | Low |
| **Fargate** | Containers, no infra mgmt | Task-based | Low |
| **App Runner** | Web apps, APIs | Automatic | Very Low |

## Decision Tree

```
                    Start
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   Need specific   Containers?   Serverless OK?
   hardware?           │              │
        │         ┌────┴────┐    ┌────┴────┐
        ▼         ▼         ▼    ▼         ▼
      EC2       EKS       ECS  Lambda   App Runner
   (bare metal) (K8s)  (Docker) (FaaS)   (PaaS)
```

## EC2 Instance Families

| Family | Type | Use Case |
|--------|------|----------|
| **M** | General purpose | Web servers, small DBs |
| **C** | Compute optimized | Batch, HPC, gaming |
| **R** | Memory optimized | In-memory caches, DBs |
| **I** | Storage optimized | Data warehousing |
| **G/P** | GPU | ML inference, rendering |
| **T** | Burstable | Dev/test, low traffic |

## Right-sizing Strategy

```
┌─────────────────────────────────────────────────────┐
│              Right-sizing Workflow                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Collect Metrics (2+ weeks)                      │
│     └─ CPU, Memory, Network, Disk I/O               │
│                                                     │
│  2. Analyze with Compute Optimizer                  │
│     └─ Get recommendations                          │
│                                                     │
│  3. Test Recommendation                             │
│     └─ Load test with new instance type             │
│                                                     │
│  4. Implement & Monitor                             │
│     └─ Gradual rollout, monitor performance         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Example: Node.js Workload Selection

| Workload Characteristic | Recommendation |
|------------------------|----------------|
| CPU-bound (image processing) | C-family or Lambda |
| Memory-bound (caching) | R-family |
| I/O-bound (API server) | M-family or Fargate |
| Variable traffic | Lambda or App Runner |
| Steady traffic | ECS/Fargate or EC2 |

## Cost Considerations

| Option | Pricing Model | Best For |
|--------|--------------|----------|
| **On-Demand** | Pay per hour | Variable, unpredictable |
| **Reserved** | 1-3 year commit | Steady baseline |
| **Spot** | Up to 90% off | Fault-tolerant batch |
| **Savings Plans** | Flexible commit | Mixed compute |

## Graviton (ARM) Consideration

| Aspect | x86 | Graviton (ARM) |
|--------|-----|----------------|
| Cost | Baseline | 20-40% cheaper |
| Performance | Standard | Often better |
| Compatibility | Universal | Most workloads |
| Recommendation | Legacy apps | New deployments |

---

## Checklist

### Analysis
- [ ] Workload characteristics documented
- [ ] Current utilization measured (2+ weeks)
- [ ] Peak vs average load understood

### Selection
- [ ] Instance family matched to workload
- [ ] Graviton evaluated for new workloads
- [ ] Container vs serverless evaluated

### Optimization
- [ ] Compute Optimizer enabled
- [ ] Right-sizing recommendations reviewed
- [ ] Cost vs performance trade-offs documented

### Ongoing
- [ ] Regular utilization reviews
- [ ] New instance types evaluated
- [ ] Spot/Reserved mix optimized
