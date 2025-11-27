# Serverless Architecture

## References

- [AWS Well-Architected - Use Serverless](https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/use-serverless-architectures.html)
- [AWS Serverless](https://aws.amazon.com/serverless/)
- [Serverless Framework](https://www.serverless.com/)
- [AWS SAM](https://aws.amazon.com/serverless/sam/)

## Date

* 2025-11-27

---

## Tổng quan

AWS Well-Architected Performance Efficiency principle: **"Use serverless architectures"** - loại bỏ operational overhead và tự động scale. Serverless cho phép focus vào business logic thay vì infrastructure.

## Serverless vs Traditional

| Aspect | Traditional | Serverless |
|--------|-------------|------------|
| Scaling | Manual/Auto config | Automatic |
| Billing | Per hour | Per request |
| Maintenance | You manage | Provider manages |
| Cold starts | None | Possible |
| Max duration | Unlimited | Limited (15 min Lambda) |

## AWS Serverless Services

| Service | Use Case |
|---------|----------|
| **Lambda** | Compute (functions) |
| **API Gateway** | HTTP APIs |
| **DynamoDB** | NoSQL database |
| **S3** | Object storage |
| **SQS** | Message queuing |
| **SNS** | Pub/sub messaging |
| **Step Functions** | Orchestration |
| **EventBridge** | Event routing |

## Serverless Architecture Pattern

```
┌─────────────────────────────────────────────────────┐
│                 Serverless API                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│   Client ──► API Gateway ──► Lambda ──► DynamoDB   │
│                   │                                 │
│                   ▼                                 │
│              CloudWatch                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Lambda Best Practices

### Cold Start Optimization

```typescript
// ❌ Bad: Initialize inside handler
export const handler = async (event) => {
  const db = new DynamoDB.DocumentClient();
  return await db.get({ TableName: 'users', Key: { id: event.id } }).promise();
};

// ✅ Good: Initialize outside handler
const db = new DynamoDB.DocumentClient();

export const handler = async (event) => {
  return await db.get({ TableName: 'users', Key: { id: event.id } }).promise();
};
```

### Memory & Timeout Configuration

| Workload | Memory | Timeout |
|----------|--------|---------|
| API handlers | 256-512 MB | 10s |
| Data processing | 1-3 GB | 5 min |
| Image processing | 3+ GB | 5 min |

## Event-Driven Patterns

### 1. Async Processing

```
User Request → API Gateway → Lambda → SQS → Lambda (worker)
                   │                           │
                   ▼                           ▼
             Return 202               Process in background
```

### 2. Fan-out

```
Event → SNS Topic ──┬──► Lambda 1 (email)
                    ├──► Lambda 2 (analytics)
                    └──► Lambda 3 (notification)
```

## Cost Optimization

| Strategy | Description |
|----------|-------------|
| **Right-size memory** | More memory = faster CPU, find sweet spot |
| **Provisioned Concurrency** | Reduce cold starts for critical paths |
| **ARM (Graviton2)** | 20% cheaper, often faster |
| **Reserved Concurrency** | Limit costs, prevent runaway |

## When NOT to Use Serverless

| Scenario | Why | Alternative |
|----------|-----|-------------|
| Long-running tasks (>15 min) | Lambda timeout | ECS, Step Functions |
| Consistent high load | Cost inefficient | Containers |
| Stateful applications | No persistent state | ECS, EC2 |
| WebSockets (complex) | Connection limits | App Runner, ECS |

---

## Checklist

### Design
- [ ] Stateless functions
- [ ] Idempotent handlers
- [ ] Async where possible

### Performance
- [ ] Cold start optimization applied
- [ ] Memory right-sized
- [ ] Provisioned concurrency for critical paths

### Cost
- [ ] ARM/Graviton evaluated
- [ ] Reserved concurrency set
- [ ] Timeout appropriate

### Monitoring
- [ ] CloudWatch Logs configured
- [ ] X-Ray tracing enabled
- [ ] Custom metrics for business logic
