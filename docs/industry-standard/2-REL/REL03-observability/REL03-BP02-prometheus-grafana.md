# Prometheus & Grafana Monitoring Stack

## References

- [Prometheus Documentation](https://prometheus.io/docs/) - CNCF Graduated Project
- [Grafana Documentation](https://grafana.com/docs/) - Grafana Labs
- [Observability Survey 2025](https://grafana.com/blog/2025/03/25/observability-survey-takeaways/) - Grafana Labs
- [PromQL Best Practices](https://prometheus.io/docs/practices/naming/) - Prometheus
- [Grafana Loki](https://grafana.com/oss/loki/) - Log Aggregation

## Date

2012 (Prometheus at SoundCloud) | 2016 (CNCF) | **2025** | Cập nhật: November 2025

## Tổng quan

Prometheus và Grafana là bộ đôi monitoring tiêu chuẩn cho cloud-native systems. Theo Observability Survey 2025, 75% organizations sử dụng Prometheus trong production, và 70% kết hợp với OpenTelemetry để tạo thành "Kubernetes observability stack".

## Adoption Statistics 2025

| Metric | Value |
|--------|-------|
| Prometheus production usage | 75% |
| Using both Prometheus + OTel | 70% |
| Increased Prometheus usage YoY | 50%+ |
| Centralized observability saves cost | 79% |

## Architecture Overview

```
┌─────────────┐     scrape      ┌─────────────┐
│ Application │◄────────────────│  Prometheus │
│  /metrics   │                 │   Server    │
└─────────────┘                 └──────┬──────┘
                                       │
┌─────────────┐     push        ┌──────▼──────┐
│ Short-lived │────────────────►│ Pushgateway │
│    Jobs     │                 └─────────────┘
└─────────────┘
                                ┌─────────────┐
┌─────────────┐     alert       │ Alertmanager│
│  Prometheus │────────────────►│  (routing)  │
└─────────────┘                 └──────┬──────┘
                                       │
                                ┌──────▼──────┐
                                │ PagerDuty   │
                                │ Slack, etc. │
                                └─────────────┘

┌─────────────┐     query       ┌─────────────┐
│   Grafana   │────────────────►│  Prometheus │
│ Dashboards  │                 │   (PromQL)  │
└─────────────┘                 └─────────────┘
```

## Metric Types

| Type | Description | Example |
|------|-------------|---------|
| **Counter** | Tăng dần, reset = 0 | `http_requests_total` |
| **Gauge** | Giá trị tức thời | `memory_usage_bytes` |
| **Histogram** | Distribution (buckets) | `http_request_duration_seconds` |
| **Summary** | Quantiles pre-calculated | `http_request_duration_summary` |

## Naming Conventions

```
# Format: <namespace>_<name>_<unit>_<suffix>
# Good examples:
http_requests_total
http_request_duration_seconds
process_cpu_seconds_total
node_memory_MemAvailable_bytes

# Bad examples:
requestCount        # No namespace, no unit
http_latency        # Ambiguous unit
memory              # Too vague
```

## PromQL Essentials

```promql
# Rate of requests per second (5m window)
rate(http_requests_total[5m])

# 95th percentile latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate percentage
sum(rate(http_requests_total{status=~"5.."}[5m]))
/ sum(rate(http_requests_total[5m])) * 100

# Memory usage by pod
sum by (pod) (container_memory_usage_bytes{namespace="production"})

# Top 5 endpoints by request count
topk(5, sum by (endpoint) (rate(http_requests_total[5m])))
```

## Instrumentation Example (Node.js)

```javascript
const prometheus = require('prom-client');

// Enable default metrics (CPU, memory, etc.)
prometheus.collectDefaultMetrics();

// Custom counter
const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status']
});

// Custom histogram
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'path'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5]
});

// Middleware
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer({ method: req.method, path: req.path });
  res.on('finish', () => {
    httpRequestsTotal.inc({ method: req.method, path: req.path, status: res.statusCode });
    end();
  });
  next();
});

// Expose /metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});
```

## Alerting Rules

```yaml
# prometheus/alerts.yml
groups:
  - name: application
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m]))
          / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate ({{ $value | humanizePercentage }})"

      - alert: HighLatency
        expr: |
          histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "P95 latency > 1s ({{ $value | humanizeDuration }})"

      - alert: PodMemoryHigh
        expr: |
          container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.85
        for: 5m
        labels:
          severity: warning
```

## Grafana Dashboard Best Practices

| Practice | Description |
|----------|-------------|
| **USE Method** | Utilization, Saturation, Errors cho resources |
| **RED Method** | Rate, Errors, Duration cho services |
| **Golden Signals** | Latency, Traffic, Errors, Saturation |
| **Row Organization** | Group related panels, use variables |
| **Annotations** | Mark deployments, incidents |
| **Version Control** | Dashboard as code (JSON/YAML) |

## Long-term Storage

| Solution | Description |
|----------|-------------|
| **Prometheus** | 15-day default retention |
| **Thanos** | HA + long-term storage (S3/GCS) |
| **Cortex** | Multi-tenant, horizontally scalable |
| **Mimir** | Grafana's long-term storage |
| **VictoriaMetrics** | Cost-effective alternative |

## Checklist

- [ ] **Instrumentation**:
  - [ ] Application metrics exposed (/metrics)
  - [ ] Proper metric naming conventions
  - [ ] Key business metrics defined
  - [ ] Labels used appropriately
- [ ] **Prometheus**:
  - [ ] Scrape configs for all targets
  - [ ] Service discovery (Kubernetes, Consul)
  - [ ] Retention policy configured
  - [ ] High availability (if needed)
- [ ] **Alerting**:
  - [ ] Alert rules defined (USE/RED/Golden)
  - [ ] Alertmanager routing configured
  - [ ] Notification channels setup
  - [ ] Runbooks linked to alerts
- [ ] **Grafana**:
  - [ ] Dashboards for key services
  - [ ] Variables for filtering
  - [ ] Dashboards version controlled
  - [ ] RBAC configured
- [ ] **Operations**:
  - [ ] Long-term storage (Thanos/Mimir)
  - [ ] Backup strategy
  - [ ] Capacity planning
  - [ ] Regular review of unused metrics
