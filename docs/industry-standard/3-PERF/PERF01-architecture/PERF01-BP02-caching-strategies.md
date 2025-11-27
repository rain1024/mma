# Caching Strategies

## References

- [Redis Documentation](https://redis.io/docs/)
- [AWS ElastiCache Best Practices](https://docs.aws.amazon.com/AmazonElastiCache/latest/mem-ug/best-practices.html)
- [Cloudflare Caching](https://developers.cloudflare.com/cache/)
- [Multi-Level Caching Guide](https://medium.com/@2nick2patel2/caching-beyond-redis-31690cf725ba) - 2025
- [MDN HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)

## Date

2009 (Redis) | **2024 (Redis Stack, Edge caching)** | Cập nhật: November 2025

## Tổng quan

Strategies để cache data nhằm giảm latency và load. Modern architecture sử dụng **multi-layer caching**: CDN → Edge KV → Redis → Database.

## Multi-Layer Caching Architecture (2025)

```
User Request
     │
     ▼
┌─────────────┐
│     CDN     │  Layer 1: Static assets, public API responses
│ (Cloudflare)│  TTL: Long (hours/days)
└──────┬──────┘
       │ Cache miss
       ▼
┌─────────────┐
│   Edge KV   │  Layer 2: Dynamic hot keys, personalized data
│ (Workers KV)│  TTL: Short (seconds/minutes)
└──────┬──────┘
       │ Cache miss
       ▼
┌─────────────┐
│    Redis    │  Layer 3: Application cache, sessions
│  (Origin)   │  TTL: Medium (minutes/hours)
└──────┬──────┘
       │ Cache miss
       ▼
┌─────────────┐
│  Database   │  Source of truth
│  (SQLite)   │
└─────────────┘
```

## Layer Selection Guide

| Layer | Best For | TTL | Example |
|-------|----------|-----|---------|
| **CDN** | Static assets, public APIs | Hours-Days | Images, JS, CSS, public rankings |
| **Edge KV** | Dynamic hot keys, per-region | Seconds-Minutes | User preferences, A/B test flags |
| **Redis** | Session, application cache | Minutes-Hours | Auth tokens, computed data |
| **In-Memory** | Ultra-low latency | Seconds | Request deduplication |

## Caching Patterns

| Pattern | Mô tả | Use case | Consistency |
|---------|-------|----------|-------------|
| **Cache-Aside** | App quản lý cache | General purpose | Eventual |
| **Read-Through** | Cache tự fetch từ DB | Simplified app logic | Eventual |
| **Write-Through** | Write to cache + DB đồng thời | Strong consistency | Strong |
| **Write-Behind** | Write to cache, async to DB | High write throughput | Eventual |
| **Refresh-Ahead** | Proactive refresh before expiry | Predictable access | Eventual |

## Cache-Aside Implementation

```typescript
import Redis from 'ioredis';

const redis = new Redis();

async function getAthlete(id: number): Promise<Athlete> {
  const cacheKey = `athlete:${id}`;

  // 1. Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Cache miss → fetch from DB
  const athlete = await db.query(
    'SELECT * FROM athletes WHERE id = ?',
    [id]
  );

  // 3. Store in cache with TTL
  await redis.setex(cacheKey, 3600, JSON.stringify(athlete));

  return athlete;
}
```

## Cache Invalidation Strategies

### 1. TTL-based (Simple)

```typescript
// Set expiration
await redis.setex('athlete:123', 3600, data); // 1 hour
```

### 2. Event-driven (Precise)

```typescript
// Invalidate on update
async function updateAthlete(id: number, data: Partial<Athlete>) {
  await db.query('UPDATE athletes SET ...', [data]);

  // Invalidate related caches
  await redis.del(`athlete:${id}`);
  await redis.del('athletes:list');
  await redis.del(`athletes:division:${data.division}`);
}
```

### 3. Stale-While-Revalidate

```typescript
async function getWithSWR<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number,
  staleTime: number
): Promise<T> {
  const cached = await redis.get(key);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    // Return stale data, refresh in background
    if (age > staleTime) {
      fetcher().then(fresh => {
        redis.setex(key, ttl, JSON.stringify({
          data: fresh,
          timestamp: Date.now(),
        }));
      });
    }

    return data;
  }

  const fresh = await fetcher();
  await redis.setex(key, ttl, JSON.stringify({
    data: fresh,
    timestamp: Date.now(),
  }));

  return fresh;
}
```

## TTL Guidelines

| Data type | TTL | Lý do |
|-----------|-----|-------|
| Static data (countries, divisions) | 24h+ | Rarely changes |
| Public rankings | 5-15 min | Updates periodically |
| User sessions | 1-24h | Security |
| API responses | 1-5 min | Freshness |
| Computed aggregations | 15-60 min | Expensive to compute |

## HTTP Caching Headers

```typescript
// Static assets - long cache
app.use('/static', express.static('public', {
  maxAge: '1y',
  immutable: true,
}));

// API responses - short cache with revalidation
app.get('/api/rankings', (req, res) => {
  res.set({
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    'ETag': generateETag(data),
  });
  res.json(data);
});
```

## Monitoring

```typescript
// Track cache metrics
const cacheMetrics = {
  hits: 0,
  misses: 0,
};

async function getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = await redis.get(key);

  if (cached) {
    cacheMetrics.hits++;
    return JSON.parse(cached);
  }

  cacheMetrics.misses++;
  const data = await fetcher();
  await redis.setex(key, 3600, JSON.stringify(data));
  return data;
}

// Expose metrics
app.get('/metrics', (req, res) => {
  const hitRate = cacheMetrics.hits / (cacheMetrics.hits + cacheMetrics.misses);
  res.json({
    cache_hit_rate: hitRate,
    cache_hits_total: cacheMetrics.hits,
    cache_misses_total: cacheMetrics.misses,
  });
});
```

## Checklist

- [ ] **Architecture**:
  - [ ] Identify hot data paths
  - [ ] Choose appropriate caching layers
  - [ ] Design cache key structure
- [ ] **Implementation**:
  - [ ] Choose caching pattern (cache-aside recommended)
  - [ ] Set TTL based on data volatility
  - [ ] Implement cache invalidation on writes
- [ ] **Performance**:
  - [ ] Monitor cache hit rate (target: >90%)
  - [ ] Handle cache failures gracefully
  - [ ] Consider multi-layer caching
- [ ] **HTTP Caching**:
  - [ ] Set Cache-Control headers
  - [ ] Use ETags for validation
  - [ ] Configure CDN caching rules
- [ ] **Security**:
  - [ ] Don't cache sensitive data
  - [ ] Use separate cache for authenticated responses
  - [ ] Implement cache key isolation per user/tenant
