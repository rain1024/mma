# Observability Strategy

## References

- [AWS Well-Architected - Implement Observability](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/implement-observability.html)
- [OpenTelemetry](https://opentelemetry.io/) - CNCF standard
- [Google SRE - Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
- [Dynatrace Observability Trends 2025](https://www.dynatrace.com/news/blog/opentelemetry-trends-2025/)

## Date

* 2025-11-27

---

## Tổng quan

Observability strategy là khả năng hiểu trạng thái bên trong của hệ thống thông qua các outputs (metrics, logs, traces). AWS Well-Architected OE Pillar nhấn mạnh: **"Implement observability for actionable insights"**.

## Three Pillars of Observability

| Pillar | Mô tả | Tools |
|--------|-------|-------|
| **Metrics** | Numerical data over time | Prometheus, CloudWatch |
| **Logs** | Discrete events with context | CloudWatch Logs, Loki |
| **Traces** | Request flow across services | X-Ray, Jaeger, Tempo |

## Observability Maturity Model

```
Level 4: Predictive    ─── AI-driven anomaly detection, auto-remediation
Level 3: Proactive     ─── SLO-based alerting, error budgets
Level 2: Reactive      ─── Dashboards, manual investigation
Level 1: Basic         ─── Logs only, no correlation
Level 0: None          ─── No observability
```

## AWS Services Mapping

| Signal | AWS Service | Open Source |
|--------|-------------|-------------|
| Metrics | CloudWatch Metrics | Prometheus |
| Logs | CloudWatch Logs | Loki, ELK |
| Traces | X-Ray | Jaeger, Tempo |
| All-in-one | CloudWatch + X-Ray | OpenTelemetry |

## Key Metrics Categories

| Category | Examples |
|----------|----------|
| **Business** | Revenue, orders, user signups |
| **Application** | Request rate, error rate, latency (RED) |
| **Infrastructure** | CPU, memory, disk, network (USE) |
| **Dependencies** | External API latency, DB connections |

## RED Method (Request-focused)

```
Rate    = requests per second
Errors  = failed requests per second
Duration = latency distribution (p50, p95, p99)
```

## USE Method (Resource-focused)

```
Utilization = % time resource is busy
Saturation  = amount of queued work
Errors      = error events count
```

## Example: Express.js Metrics

```typescript
import { collectDefaultMetrics, Counter, Histogram } from 'prom-client';

collectDefaultMetrics();

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
});

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer({ method: req.method, route: req.path });
  res.on('finish', () => {
    httpRequestsTotal.inc({ method: req.method, route: req.path, status: res.statusCode });
    end();
  });
  next();
});
```

## Alerting Strategy

| Alert Type | Response Time | Example |
|------------|---------------|---------|
| **Page** | Immediate | Service down, error spike |
| **Ticket** | Hours | Disk 80%, cert expiring |
| **Log** | Review later | Debug info, audit trail |

---

## Checklist

### Metrics
- [ ] Business metrics defined
- [ ] RED metrics for all services
- [ ] USE metrics for infrastructure

### Logs
- [ ] Structured logging (JSON)
- [ ] Correlation IDs in all logs
- [ ] Log levels properly used

### Traces
- [ ] Distributed tracing enabled
- [ ] Trace sampling configured
- [ ] Critical paths instrumented

### Alerting
- [ ] SLO-based alerts defined
- [ ] Runbooks linked to alerts
- [ ] On-call rotation established
