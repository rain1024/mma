# OpenTelemetry Observability Standard

## References

- [OpenTelemetry Official](https://opentelemetry.io/)
- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)
- [OpenTelemetry Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/)
- [CNCF OpenTelemetry](https://www.cncf.io/projects/opentelemetry/)
- [Dynatrace OpenTelemetry Trends 2025](https://www.dynatrace.com/news/blog/opentelemetry-trends-2025/)

## Date

2019 (OpenTelemetry merger) | **2024 (Profiling signal)** | **2025 (JS SDK 2.0, eBPF alpha)** | Cập nhật: November 2025

## Tổng quan

OpenTelemetry là **de facto standard** cho observability, là dự án CNCF lớn thứ 2 sau Kubernetes. Cung cấp vendor-neutral APIs, SDKs, và tools để collect telemetry data.

Organizations implementing OpenTelemetry reported **52% reduction in MTTR**.

## Four Pillars of Observability

| Signal | Description | OpenTelemetry Status |
|--------|-------------|---------------------|
| **Traces** | Distributed request tracking | Stable |
| **Metrics** | Numerical measurements | Stable |
| **Logs** | Event records | Stable |
| **Profiles** | Performance profiling | **Experimental (2024)** |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Traces  │  │ Metrics  │  │   Logs   │  │ Profiles │    │
│  │   SDK    │  │   SDK    │  │   SDK    │  │   SDK    │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       └──────────────┼──────────────┼──────────────┘        │
│                      ▼                                       │
│            ┌─────────────────────┐                          │
│            │  OpenTelemetry SDK  │                          │
│            └──────────┬──────────┘                          │
└───────────────────────┼─────────────────────────────────────┘
                        │ OTLP (OpenTelemetry Protocol)
                        ▼
              ┌─────────────────────┐
              │  OTel Collector     │
              │  ├── Receivers      │
              │  ├── Processors     │
              │  └── Exporters      │
              └──────────┬──────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│    Jaeger    │ │ Prometheus   │ │   Grafana    │
│   (Traces)   │ │  (Metrics)   │ │   Loki       │
└──────────────┘ └──────────────┘ └──────────────┘
```

## Implementation cho Node.js

### Setup

```bash
yarn add @opentelemetry/api \
         @opentelemetry/sdk-node \
         @opentelemetry/auto-instrumentations-node \
         @opentelemetry/exporter-trace-otlp-http
```

### Basic Configuration

```typescript
// tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'mma-service',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV,
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

### Manual Instrumentation

```typescript
import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('mma-service');

async function getAthlete(id: number) {
  return tracer.startActiveSpan('getAthlete', async (span) => {
    try {
      span.setAttribute('athlete.id', id);

      const athlete = await db.query('SELECT * FROM athletes WHERE id = ?', [id]);

      span.setAttribute('athlete.name', athlete.name);
      span.setStatus({ code: SpanStatusCode.OK });

      return athlete;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

### Custom Metrics

```typescript
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('mma-service');

// Counter
const requestCounter = meter.createCounter('http_requests_total', {
  description: 'Total HTTP requests',
});

// Histogram
const responseTime = meter.createHistogram('http_response_time_ms', {
  description: 'HTTP response time in milliseconds',
});

// Usage
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    requestCounter.add(1, {
      method: req.method,
      route: req.route?.path || 'unknown',
      status: res.statusCode,
    });
    responseTime.record(Date.now() - start, {
      method: req.method,
      route: req.route?.path || 'unknown',
    });
  });
  next();
});
```

## Semantic Conventions

OpenTelemetry defines semantic conventions for consistent attribute naming:

| Category | Attribute Examples |
|----------|-------------------|
| HTTP | `http.method`, `http.status_code`, `http.url` |
| Database | `db.system`, `db.statement`, `db.operation` |
| RPC | `rpc.system`, `rpc.method`, `rpc.service` |
| AI/LLM | `llm.model`, `llm.token_count.*` (draft) |

## 2024-2025 Updates

| Feature | Status | Description |
|---------|--------|-------------|
| **JS SDK 2.0** | Released | Breaking changes, Node.js 18.19+/20.6+ required |
| **eBPF Instrumentation (OBI)** | Alpha | Zero-code instrumentation via eBPF |
| **Demo 2.0** | Released | React Native, Valkey, .NET auto-instrumentation |
| **Profiling Signal** | Experimental | Continuous profiling agent (eBPF-based) |
| **GenAI Observability** | Draft | Semantic conventions for AI/LLM |
| **Collector v1.0** | Expected 2025 | v0.137.0 current |

## Collector Configuration

```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 10s
  memory_limiter:
    check_interval: 1s
    limit_mib: 1000

exporters:
  otlp:
    endpoint: "tempo:4317"
    tls:
      insecure: true
  prometheus:
    endpoint: "0.0.0.0:8889"
  loki:
    endpoint: "http://loki:3100/loki/api/v1/push"

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [otlp]
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [prometheus]
    logs:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [loki]
```

## Checklist

- [ ] **Setup**:
  - [ ] Install OpenTelemetry SDK
  - [ ] Configure auto-instrumentation
  - [ ] Set service name và version
- [ ] **Traces**:
  - [ ] Enable distributed tracing
  - [ ] Add custom spans cho business logic
  - [ ] Follow semantic conventions
- [ ] **Metrics**:
  - [ ] Track request count và latency
  - [ ] Add business metrics
  - [ ] Set up dashboards
- [ ] **Logs**:
  - [ ] Correlate logs với traces (trace_id)
  - [ ] Structured logging
- [ ] **Export**:
  - [ ] Configure OTLP exporter
  - [ ] Deploy OTel Collector (production)
- [ ] **Visualization**:
  - [ ] Grafana dashboards
  - [ ] Alert rules based on SLOs
