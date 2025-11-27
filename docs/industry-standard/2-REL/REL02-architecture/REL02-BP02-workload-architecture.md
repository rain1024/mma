# Workload Architecture

## References

- [AWS Well-Architected - Workload Architecture](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/design-your-workload-to-withstand-component-failures.html)
- [AWS Reliability Pillar April 2025](https://aws.amazon.com/about-aws/whats-new/2025/04/new-guidance-well-architected-tool/)
- [Microsoft - Distributed Systems Design](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/)
- [Martin Fowler - Microservices](https://martinfowler.com/articles/microservices.html)

## Date

* 2025-11-27

---

## Tổng quan

AWS Well-Architected Reliability Pillar nhấn mạnh thiết kế **distributed systems** để giảm thiểu failure points. Key principle: **"Scale horizontally to increase aggregate workload availability"**.

## Architecture Patterns

| Pattern | Use Case | Trade-offs |
|---------|----------|------------|
| **Monolith** | Simple apps, small teams | Easy deploy, hard to scale |
| **Microservices** | Complex domains, large teams | Flexible, operational overhead |
| **Serverless** | Event-driven, variable load | Auto-scale, cold starts |
| **Event-driven** | Async workflows, decoupling | Loose coupling, eventual consistency |

## AWS Reliability Design Principles

| Principle | Implementation |
|-----------|---------------|
| Automatically recover from failure | Auto Scaling, health checks |
| Test recovery procedures | Fault Injection Simulator |
| Scale horizontally | Multiple small resources |
| Stop guessing capacity | Auto Scaling, on-demand |
| Manage change through automation | IaC, CI/CD |

## Distributed System Patterns

### 1. Redundancy

```
┌─────────────┐     ┌─────────────┐
│   App 1     │     │   App 2     │  ← Multiple instances
└──────┬──────┘     └──────┬──────┘
       │                   │
       └─────────┬─────────┘
                 ▼
         ┌─────────────┐
         │     ALB     │  ← Load balancer
         └─────────────┘
```

### 2. Cell-based Architecture

```
┌─────────────────┐  ┌─────────────────┐
│     Cell 1      │  │     Cell 2      │
│  ┌───┐  ┌───┐   │  │  ┌───┐  ┌───┐   │
│  │App│  │DB │   │  │  │App│  │DB │   │
│  └───┘  └───┘   │  │  └───┘  └───┘   │
└─────────────────┘  └─────────────────┘
         │                   │
         └─────────┬─────────┘
                   ▼
            ┌─────────────┐
            │   Router    │
            └─────────────┘
```

### 3. Bulkhead Pattern

```typescript
// Isolate failures to prevent cascade
const pools = {
  database: new ConnectionPool({ max: 10 }),
  externalApi: new ConnectionPool({ max: 5 }),
  cache: new ConnectionPool({ max: 20 }),
};

// Each pool fails independently
async function getUser(id: string) {
  const conn = await pools.database.acquire();
  try {
    return await conn.query('SELECT * FROM users WHERE id = ?', [id]);
  } finally {
    pools.database.release(conn);
  }
}
```

## Failure Domains

| Level | Scope | Mitigation |
|-------|-------|------------|
| **Component** | Single instance | Redundancy, health checks |
| **AZ** | Datacenter | Multi-AZ deployment |
| **Region** | Geographic area | Multi-region, DR |
| **Service** | AWS service | Fallback, caching |

## Graceful Degradation

```typescript
async function getRecommendations(userId: string) {
  try {
    return await recommendationService.get(userId);
  } catch (error) {
    // Fallback to cached/default recommendations
    console.warn('Recommendation service unavailable, using fallback');
    return await cache.get(`recommendations:default`);
  }
}
```

---

## Checklist

### Architecture
- [ ] No single points of failure
- [ ] Components can fail independently
- [ ] Graceful degradation implemented

### Scaling
- [ ] Horizontal scaling configured
- [ ] Auto Scaling policies defined
- [ ] Load testing performed

### Resilience
- [ ] Health checks on all services
- [ ] Circuit breakers for dependencies
- [ ] Timeouts configured appropriately

### Recovery
- [ ] Automated recovery mechanisms
- [ ] Recovery procedures tested
- [ ] RTO/RPO defined and met
