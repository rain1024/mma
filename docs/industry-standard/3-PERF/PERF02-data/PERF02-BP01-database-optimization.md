# Database Optimization

## References

- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
- [PostgreSQL Best Practices 2025](https://www.instaclustr.com/education/postgresql/top-10-postgresql-best-practices-for-2025/)
- [AWS RDS Performance Insights](https://aws.amazon.com/rds/performance-insights/)
- [Query Optimization Guide](https://docs.aws.amazon.com/prescriptive-guidance/latest/postgresql-query-tuning/)
- [SQLite Optimization](https://www.sqlite.org/optoverview.html)
- [Percona PostgreSQL Tuning](https://www.percona.com/blog/tuning-postgresql-database-parameters-to-optimize-performance/)

## Date

1996 (PostgreSQL 6.0) | 2000 (SQLite) | Cập nhật: November 2025

## Tổng quan

Database optimization tập trung vào query performance, indexing, configuration tuning và monitoring. **Lỗi phổ biến nhất**: tối ưu mà không đo lường trước.

## Optimization Hierarchy

```
┌─────────────────────────────────────────┐
│     1. Query Optimization               │  ← Highest Impact
│     (Explain Analyze, Index)            │
├─────────────────────────────────────────┤
│     2. Schema Design                    │
│     (Normalization, Partitioning)       │
├─────────────────────────────────────────┤
│     3. Configuration Tuning             │
│     (Memory, Connections)               │
├─────────────────────────────────────────┤
│     4. Hardware Scaling                 │  ← Last Resort
│     (CPU, RAM, SSD)                     │
└─────────────────────────────────────────┘
```

## Query Optimization

### EXPLAIN ANALYZE

```sql
-- Always use EXPLAIN ANALYZE first
EXPLAIN ANALYZE
SELECT a.name, d.name as division
FROM athletes a
JOIN divisions d ON a.division_id = d.id
WHERE a.tournament = 'ufc'
ORDER BY a.ranking;

-- Look for:
-- - Seq Scan (table scan) on large tables → needs index
-- - High cost numbers
-- - Loops > 1 in nested loops
-- - Sort operations with external disk
```

### Common Query Antipatterns

| Antipattern | Problem | Solution |
|-------------|---------|----------|
| `SELECT *` | Fetch unused columns | Select specific columns |
| `LIKE '%term%'` | Cannot use index | Full-text search |
| `OR` in WHERE | Multiple scans | Use UNION or IN |
| Functions on columns | Index not used | Create functional index |
| N+1 queries | Many round trips | JOIN or batch fetch |

### Query Rewriting Examples

```sql
-- BAD: N+1 queries
SELECT * FROM events WHERE tournament = 'ufc';
-- Then for each event:
SELECT * FROM matches WHERE event_id = ?;

-- GOOD: Single query with JOIN
SELECT e.*, m.*
FROM events e
LEFT JOIN matches m ON e.id = m.event_id
WHERE e.tournament = 'ufc';

-- BAD: Function on indexed column
SELECT * FROM athletes WHERE UPPER(name) = 'FIGHTER NAME';

-- GOOD: Functional index or store normalized
CREATE INDEX idx_athletes_name_upper ON athletes (UPPER(name));
-- Or store name_normalized column
```

## Indexing Strategies

### Index Types

| Type | Use Case | Example |
|------|----------|---------|
| **B-tree** | Default, equality/range | `CREATE INDEX idx ON t(col)` |
| **Hash** | Equality only | `CREATE INDEX idx ON t USING hash(col)` |
| **GIN** | Full-text, arrays, JSONB | `CREATE INDEX idx ON t USING gin(col)` |
| **GiST** | Geometric, range types | `CREATE INDEX idx ON t USING gist(col)` |
| **Partial** | Subset of rows | `CREATE INDEX idx ON t(col) WHERE active = true` |
| **Covering** | Include extra columns | `CREATE INDEX idx ON t(col1) INCLUDE (col2)` |

### Index Best Practices

```sql
-- Composite index: column order matters
-- Filter columns first, then sort columns
CREATE INDEX idx_athletes_tournament_ranking
ON athletes (tournament, ranking);

-- Works for:
SELECT * FROM athletes WHERE tournament = 'ufc' ORDER BY ranking;
SELECT * FROM athletes WHERE tournament = 'ufc' AND ranking < 10;

-- Does NOT work for:
SELECT * FROM athletes WHERE ranking < 10;  -- Needs full scan

-- Partial index for common queries
CREATE INDEX idx_active_events
ON events (date)
WHERE status = 'active';

-- Covering index to avoid table lookup
CREATE INDEX idx_athletes_search
ON athletes (tournament, division)
INCLUDE (name, record, country);
```

### SQLite Specifics

```sql
-- SQLite: Enable query planner output
.eqp on
SELECT * FROM athletes WHERE tournament = 'ufc';

-- Create index
CREATE INDEX idx_athletes_tournament ON athletes(tournament);

-- Analyze tables for query planner
ANALYZE;

-- SQLite optimization pragmas
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000;  -- 64MB cache
PRAGMA temp_store = MEMORY;
```

## Configuration Tuning

### PostgreSQL Key Parameters

| Parameter | OLTP | OLAP | Description |
|-----------|------|------|-------------|
| `shared_buffers` | 25% RAM | 25% RAM | Database cache |
| `work_mem` | 4-16MB | 64-256MB | Sort/hash memory per operation |
| `effective_cache_size` | 75% RAM | 75% RAM | Planner's estimate of OS cache |
| `maintenance_work_mem` | 512MB-1GB | 1GB+ | For VACUUM, INDEX |
| `max_connections` | 100-200 | 20-50 | Connection limit |

### Connection Pooling

```
Without Pooling:
App → 100 connections → Database (100 connections)

With Pooling (PgBouncer):
App → 100 connections → PgBouncer → 20 connections → Database

Benefits:
- Reduced connection overhead
- Better resource utilization
- Handles connection spikes
```

## Schema Design

### Normalization vs Denormalization

| Approach | Pros | Cons | Use When |
|----------|------|------|----------|
| **Normalized** | Data integrity, less storage | More JOINs | Write-heavy, data accuracy |
| **Denormalized** | Faster reads | Redundancy, update anomalies | Read-heavy, reporting |

### Partitioning

```sql
-- Range partitioning by date
CREATE TABLE events (
    id SERIAL,
    name TEXT,
    event_date DATE,
    tournament TEXT
) PARTITION BY RANGE (event_date);

CREATE TABLE events_2024 PARTITION OF events
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE events_2025 PARTITION OF events
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Queries only scan relevant partitions
SELECT * FROM events WHERE event_date >= '2025-06-01';
```

## Monitoring

### Key Metrics

| Metric | Target | Action if Exceeded |
|--------|--------|-------------------|
| Query latency p95 | < 100ms | Optimize slow queries |
| Cache hit rate | > 99% | Increase shared_buffers |
| Connection usage | < 80% | Add pooling or scale |
| Disk I/O | Low | Add indexes or RAM |
| Lock waits | Minimal | Review transaction design |

### PostgreSQL Monitoring Queries

```sql
-- Enable pg_stat_statements
CREATE EXTENSION pg_stat_statements;

-- Find slowest queries
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Check table bloat
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as size,
       n_dead_tup
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
```

## Áp dụng cho dự án MMA

```typescript
// service/src/db.ts

// 1. Use parameterized queries (prevent SQL injection, enable plan caching)
const athlete = db.prepare(`
  SELECT id, name, division, record, country
  FROM athletes
  WHERE id = ?
`).get(id);

// 2. Batch operations
const insertMany = db.transaction((athletes) => {
  const insert = db.prepare(`
    INSERT INTO athletes (name, division, record) VALUES (?, ?, ?)
  `);
  for (const a of athletes) {
    insert.run(a.name, a.division, a.record);
  }
});

// 3. Create appropriate indexes
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_athletes_tournament ON athletes(tournament);
  CREATE INDEX IF NOT EXISTS idx_athletes_division ON athletes(tournament, division);
  CREATE INDEX IF NOT EXISTS idx_events_date ON events(date DESC);
`);
```

## Checklist

- [ ] **Query Optimization**:
  - [ ] Use EXPLAIN ANALYZE on slow queries
  - [ ] Select only needed columns
  - [ ] Avoid N+1 query patterns
  - [ ] Use JOINs instead of subqueries where appropriate
- [ ] **Indexing**:
  - [ ] Index columns used in WHERE, JOIN, ORDER BY
  - [ ] Consider composite indexes for common queries
  - [ ] Use partial indexes for filtered queries
  - [ ] Monitor index usage, remove unused
- [ ] **Configuration**:
  - [ ] Tune shared_buffers and work_mem
  - [ ] Enable connection pooling for high concurrency
  - [ ] Configure appropriate timeouts
- [ ] **Monitoring**:
  - [ ] Enable pg_stat_statements
  - [ ] Monitor slow query log
  - [ ] Track cache hit rate
  - [ ] Alert on connection exhaustion
- [ ] **Maintenance**:
  - [ ] Regular VACUUM and ANALYZE
  - [ ] Monitor table bloat
  - [ ] Plan for data archival
