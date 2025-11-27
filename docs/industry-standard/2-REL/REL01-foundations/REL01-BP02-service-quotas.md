# Service Quotas Management

## References

- [AWS Well-Architected - Manage Service Quotas](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/manage-service-quotas-and-constraints.html)
- [AWS Service Quotas](https://docs.aws.amazon.com/servicequotas/latest/userguide/intro.html)
- [AWS Trusted Advisor](https://aws.amazon.com/premiumsupport/technology/trusted-advisor/)

## Date

* 2025-11-27

---

## Tổng quan

AWS Well-Architected Reliability Pillar: **"Stop guessing capacity"**. Service quotas (limits) là constraints trên AWS resources. Quản lý quotas đúng cách giúp tránh resource exhaustion và service disruption.

## Common AWS Service Quotas

| Service | Quota | Default | Adjustable |
|---------|-------|---------|------------|
| **EC2** | Running On-Demand instances | Varies by type | Yes |
| **Lambda** | Concurrent executions | 1,000 | Yes |
| **RDS** | DB instances | 40 | Yes |
| **S3** | Buckets per account | 100 | Yes |
| **API Gateway** | Requests per second | 10,000 | Yes |
| **ELB** | Load balancers per region | 50 | Yes |

## Quota Categories

| Category | Examples |
|----------|----------|
| **Resource** | Number of instances, buckets |
| **Rate** | API calls per second |
| **Size** | Max object size, payload size |
| **Time** | Max execution time |

## Monitoring Strategy

```
┌─────────────────────────────────────────────────────┐
│              Quota Monitoring Pipeline              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Service Quotas API → CloudWatch Metrics → Alarms  │
│                              │                      │
│                              ▼                      │
│                      ┌──────────────┐               │
│                      │ Alert at 80% │               │
│                      │ utilization  │               │
│                      └──────────────┘               │
│                              │                      │
│                              ▼                      │
│                    Request Quota Increase           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Example: Lambda Concurrency Monitoring

```typescript
import { CloudWatchClient, PutMetricAlarmCommand } from '@aws-sdk/client-cloudwatch';

const cw = new CloudWatchClient({});

// Create alarm for Lambda concurrency
await cw.send(new PutMetricAlarmCommand({
  AlarmName: 'LambdaConcurrencyHigh',
  MetricName: 'ConcurrentExecutions',
  Namespace: 'AWS/Lambda',
  Statistic: 'Maximum',
  Period: 60,
  EvaluationPeriods: 5,
  Threshold: 800, // 80% of 1000 default
  ComparisonOperator: 'GreaterThanThreshold',
  AlarmActions: ['arn:aws:sns:region:account:alerts'],
}));
```

## Quota Increase Request

```bash
# List current quotas
aws service-quotas list-service-quotas \
  --service-code lambda

# Request increase
aws service-quotas request-service-quota-increase \
  --service-code lambda \
  --quota-code L-B99A9384 \
  --desired-value 5000
```

## Best Practices

| Practice | Description |
|----------|-------------|
| **Monitor proactively** | Alert at 70-80% utilization |
| **Request ahead** | Increases can take days |
| **Document limits** | Track quotas in architecture docs |
| **Test at scale** | Verify quotas before launch |
| **Use Trusted Advisor** | Automated quota checking |

---

## Checklist

### Discovery
- [ ] List all AWS services used
- [ ] Document current quota values
- [ ] Identify adjustable vs fixed quotas

### Monitoring
- [ ] CloudWatch alarms for key quotas
- [ ] Trusted Advisor checks enabled
- [ ] Dashboard for quota utilization

### Planning
- [ ] Capacity planning includes quotas
- [ ] Quota increase requests in advance
- [ ] Multi-region quota distribution

### Automation
- [ ] Automated quota monitoring
- [ ] Alert-to-ticket workflow
- [ ] Runbook for quota issues
