# Circuit Breaker Pattern

## References

- [Martin Fowler - Circuit Breaker](https://martinfowler.com/bliki/CircuitBreaker.html) - 2014
- [Microsoft - Circuit Breaker Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker) - Azure Architecture
- [Resilience4j Documentation](https://resilience4j.readme.io/docs/circuitbreaker) - Current standard
- [Netflix Hystrix](https://github.com/Netflix/Hystrix) - Archived, historical reference
- [Spring Boot Circuit Breaker Guide](https://www.javacodegeeks.com/2024/11/improving-application-resilience-with-circuit-breaker-patterns-in-spring-boot.html) - 2024
- [Opossum (Node.js)](https://nodeshift.dev/opossum/) - Circuit breaker for Node.js

## Date

2007 (Michael Nygard - Release It!) | 2011 (Netflix Hystrix) | **2024 (Resilience4j v2.x)** | Cập nhật: November 2025

## Tổng quan

Pattern để prevent cascade failures khi một service dependency fail. Resilience4j đã thay thế Netflix Hystrix (archived 2018) như thư viện tiêu chuẩn.

## 3 States (+ 3 Special States)

```
     ┌─────────────┐
     │   CLOSED    │ ←── Normal operation
     │  (Working)  │
     └──────┬──────┘
            │ Failures exceed threshold
            ▼
     ┌─────────────┐
     │    OPEN     │ ←── Fail fast, don't call service
     │  (Failing)  │
     └──────┬──────┘
            │ Timeout expires
            ▼
     ┌─────────────┐
     │ HALF-OPEN   │ ←── Test if service recovered
     │  (Testing)  │
     └─────────────┘
```

### Normal States

| State | Behavior |
|-------|----------|
| **CLOSED** | Requests đi qua bình thường, đếm failures |
| **OPEN** | Requests fail immediately, không gọi service |
| **HALF-OPEN** | Cho phép limited requests để test recovery |

### Special States (Resilience4j)

| State | Behavior |
|-------|----------|
| **DISABLED** | Circuit breaker bị tắt, requests luôn đi qua |
| **FORCED_OPEN** | Circuit luôn open, requests luôn fail |
| **METRICS_ONLY** | Thu thập metrics nhưng không block requests |

## Sliding Window Types

| Type | Description | Use Case |
|------|-------------|----------|
| **COUNT_BASED** | Track N requests gần nhất | Stable traffic |
| **TIME_BASED** | Track requests trong N seconds | Variable traffic |

## Implementation (TypeScript/Node.js với Opossum)

```typescript
import CircuitBreaker from 'opossum';

// Configure circuit breaker
const breaker = new CircuitBreaker(asyncFunction, {
  timeout: 3000,                  // If function takes > 3s, trigger failure
  errorThresholdPercentage: 50,   // When 50% of requests fail
  resetTimeout: 30000,            // After 30s, try again
  volumeThreshold: 5,             // Minimum calls before calculating failure %
});

// Event handlers
breaker.on('success', (result) => console.log('Success:', result));
breaker.on('timeout', () => console.log('Timeout'));
breaker.on('reject', () => console.log('Rejected - circuit open'));
breaker.on('open', () => console.log('Circuit opened'));
breaker.on('halfOpen', () => console.log('Circuit half-open'));
breaker.on('close', () => console.log('Circuit closed'));

// Fallback function
breaker.fallback(() => ({ cached: true, data: 'fallback data' }));

// Usage
const result = await breaker.fire(params);
```

## Custom Implementation

```typescript
class CircuitBreaker {
  private failures = 0;
  private successes = 0;
  private lastFailure: Date | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF-OPEN' = 'CLOSED';

  constructor(
    private options: {
      failureThreshold: number;     // failures before opening
      successThreshold: number;     // successes to close from half-open
      timeout: number;              // ms before trying again
      slowCallThreshold?: number;   // ms to consider slow
    }
  ) {}

  async call<T>(fn: () => Promise<T>, fallback?: () => T): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailure!.getTime() > this.options.timeout) {
        this.state = 'HALF-OPEN';
        this.successes = 0;
      } else {
        if (fallback) return fallback();
        throw new Error('Circuit is OPEN');
      }
    }

    const start = Date.now();
    try {
      const result = await fn();
      this.onSuccess(Date.now() - start);
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) return fallback();
      throw error;
    }
  }

  private onSuccess(duration: number) {
    if (this.options.slowCallThreshold && duration > this.options.slowCallThreshold) {
      this.onFailure();
      return;
    }

    if (this.state === 'HALF-OPEN') {
      this.successes++;
      if (this.successes >= this.options.successThreshold) {
        this.state = 'CLOSED';
        this.failures = 0;
      }
    } else {
      this.failures = 0;
    }
  }

  private onFailure() {
    this.failures++;
    this.lastFailure = new Date();
    if (this.failures >= this.options.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState() {
    return { state: this.state, failures: this.failures };
  }
}
```

## Combining with Other Patterns

```
Request → Bulkhead → Circuit Breaker → Retry → External Service
            │              │             │
            │              │             └── Retry transient failures
            │              └── Prevent cascade failures
            └── Limit concurrent calls
```

## Monitoring & Health Check

```typescript
// Health check endpoint
app.get('/health/dependencies', (req, res) => {
  const status = {
    externalApi: {
      circuit: breaker.stats.state,
      healthy: breaker.stats.state !== 'OPEN',
    },
  };
  const allHealthy = Object.values(status).every(s => s.healthy);
  res.status(allHealthy ? 200 : 503).json(status);
});
```

## Best Practices (2024-2025)

| Practice | Description |
|----------|-------------|
| **Set Realistic Thresholds** | Base on actual service behavior, not assumptions |
| **Always Implement Fallback** | Return cached data, default values, or graceful degradation |
| **Monitor Circuit State** | Alert when circuits open frequently |
| **Test in Non-Prod First** | Verify thresholds before production |
| **Combine with Retry** | Retry transient failures before circuit opens |
| **Use Bulkhead** | Isolate failures to prevent resource exhaustion |

## Checklist

- [ ] **Implementation**:
  - [ ] Circuit breaker cho tất cả external API calls
  - [ ] Fallback responses khi circuit open
  - [ ] Timeout configuration phù hợp
- [ ] **Configuration**:
  - [ ] Sliding window type (count vs time)
  - [ ] Failure rate threshold (typically 50%)
  - [ ] Slow call threshold và duration
  - [ ] Wait duration in open state
- [ ] **Monitoring**:
  - [ ] Circuit state trong health checks
  - [ ] Metrics cho Prometheus/Grafana
  - [ ] Alerts khi circuit opens
- [ ] **Testing**:
  - [ ] Test circuit behavior với chaos engineering
  - [ ] Verify fallback responses
