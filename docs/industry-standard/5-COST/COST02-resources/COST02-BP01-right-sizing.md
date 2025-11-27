# Right-Sizing Resources

## References

- [AWS Compute Optimizer](https://aws.amazon.com/compute-optimizer/)
- [Google Cloud Recommender](https://cloud.google.com/recommender)
- [Azure Advisor](https://learn.microsoft.com/en-us/azure/advisor/)
- [AWS Well-Architected - Cost Optimization](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/)

## Date

2019 (AWS Compute Optimizer) | Cập nhật: 2024

## Tổng quan

Right-sizing là quá trình điều chỉnh resources (CPU, memory, storage) phù hợp với actual workload.

## Khi nào cần Right-size?

| Indicator | Ngưỡng | Action |
|-----------|--------|--------|
| CPU utilization | < 20% | Downsize |
| Memory utilization | < 20% | Downsize |
| CPU utilization | > 80% sustained | Upsize |
| Storage unused | > 50% | Reduce |

## Process

```
1. Collect metrics (2-4 weeks minimum)
         ↓
2. Analyze utilization patterns
         ↓
3. Identify candidates
         ↓
4. Test in non-prod first
         ↓
5. Apply changes
         ↓
6. Monitor & iterate
```

## Instance Family Selection

| Workload | Recommended |
|----------|-------------|
| General purpose | t3, m5, m6i |
| Compute intensive | c5, c6i |
| Memory intensive | r5, r6i |
| Burstable | t3, t3a |

## Example Analysis

```
Current: t3.large (2 vCPU, 8GB RAM) - $61/month
Usage: 15% CPU, 30% memory

Recommendation: t3.small (2 vCPU, 2GB RAM) - $15/month
Savings: $46/month (75%)
```

## Checklist

- [ ] Enable CloudWatch detailed monitoring
- [ ] Collect 2-4 weeks of metrics
- [ ] Use AWS Compute Optimizer recommendations
- [ ] Test changes in staging first
- [ ] Schedule regular right-sizing reviews (quarterly)
