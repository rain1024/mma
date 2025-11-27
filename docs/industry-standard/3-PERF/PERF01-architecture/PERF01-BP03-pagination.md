# PERF01-BP03: Pagination Strategies

## References
- [Cursor Pagination](https://www.merge.dev/blog/cursor-pagination) - Merge
- [Offset vs Cursor vs Keyset](https://blog.faizahmed.in/offset-vs-cursor-vs-keyset-pagination) - Faiz Ahmed
- [Pagination Best Practices](https://www.speakeasy.com/api-design/pagination) - Speakeasy
- [Cursor Pagination Deep Dive](https://www.milanjovanovic.tech/blog/understanding-cursor-pagination-and-why-its-so-fast-deep-dive) - Milan Jovanovic

## Date
* 2025-11-27

---

## Tổng quan

Pagination là kỹ thuật chia dữ liệu thành các trang nhỏ để cải thiện performance và UX. Ba phương pháp chính: **Offset**, **Cursor**, và **Keyset** pagination có ưu nhược điểm khác nhau.

## So sánh các phương pháp

| Khía cạnh | Offset | Cursor | Keyset |
|-----------|--------|--------|--------|
| **Performance** | O(offset) | O(1) | O(1) |
| **Large datasets** | Chậm | Nhanh | Nhanh |
| **Jump to page** | Có | Không | Không |
| **Data consistency** | Kém | Tốt | Tốt |
| **Implementation** | Đơn giản | Trung bình | Phức tạp |
| **Total count** | Dễ | Khó | Khó |

## Performance Benchmark

| Records | Offset (page 1000) | Cursor | Improvement |
|---------|-------------------|--------|-------------|
| 100K | 50ms | 3ms | 17x |
| 1M | 500ms | 3ms | 167x |
| 10M | 5s+ | 3ms | 1600x+ |

## Offset Pagination

```
GET /items?limit=20&offset=40
```

**Pros:**
- Dễ implement
- Support jump to any page
- Dễ hiểu với users

**Cons:**
- Performance giảm khi offset tăng
- Data drift (items lặp/mất khi data thay đổi)
- Không phù hợp cho large datasets

```typescript
// Express + Prisma example
app.get('/items', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.item.findMany({ skip: offset, take: limit }),
    prisma.item.count()
  ]);

  res.json({
    data: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});
```

## Cursor Pagination

```
GET /items?limit=20&cursor=eyJpZCI6MTIzfQ==
```

**Pros:**
- Performance consistent (O(1))
- Không bị data drift
- Ideal for infinite scroll

**Cons:**
- Không jump to page
- Cần indexed cursor field
- Phức tạp hơn để implement

```typescript
// Express + Prisma cursor pagination
app.get('/items', async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const cursor = req.query.cursor;

  const items = await prisma.item.findMany({
    take: limit + 1, // Fetch one extra to check hasMore
    ...(cursor && {
      cursor: { id: decodeCursor(cursor) },
      skip: 1 // Skip cursor item
    }),
    orderBy: { id: 'asc' }
  });

  const hasMore = items.length > limit;
  if (hasMore) items.pop();

  res.json({
    data: items,
    pagination: {
      nextCursor: hasMore ? encodeCursor(items[items.length - 1].id) : null,
      hasMore
    }
  });
});

const encodeCursor = (id) => Buffer.from(JSON.stringify({ id })).toString('base64');
const decodeCursor = (cursor) => JSON.parse(Buffer.from(cursor, 'base64').toString()).id;
```

## Keyset Pagination

```
GET /items?limit=20&after_id=123&after_created=2025-01-01T00:00:00Z
```

**Pros:**
- Tốt nhất cho sorted data
- Performance tốt với compound keys
- Data integrity cao

**Cons:**
- Phức tạp với multi-column sort
- Cần unique compound key
- Harder to implement

```typescript
// Keyset with composite key (created_at + id)
app.get('/items', async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const afterId = req.query.after_id;
  const afterCreated = req.query.after_created;

  let where = {};
  if (afterId && afterCreated) {
    // Tuple comparison for consistent ordering
    where = {
      OR: [
        { createdAt: { gt: new Date(afterCreated) } },
        { createdAt: new Date(afterCreated), id: { gt: parseInt(afterId) } }
      ]
    };
  }

  const items = await prisma.item.findMany({
    where,
    take: limit + 1,
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }]
  });

  const hasMore = items.length > limit;
  if (hasMore) items.pop();

  res.json({ data: items, hasMore });
});
```

## Khi nào dùng

| Scenario | Recommended |
|----------|-------------|
| Admin dashboard với page numbers | Offset |
| Social media feed, infinite scroll | Cursor |
| Large dataset, real-time data | Cursor/Keyset |
| E-commerce product listing | Cursor |
| Report với jump-to-page | Offset (với limit) |
| API public scale lớn | Cursor |

## Best Practices

1. **Choose cursor wisely**: Dùng indexed, immutable, unique fields (timestamp + ID)
2. **Match ORDER BY**: Cursor condition phải match với ORDER BY clause
3. **Stateless cursors**: Encode state trong cursor, không lưu server-side
4. **Handle invalid cursors**: Return 400/410 với message rõ ràng
5. **Document behavior**: Explain cursor expiration, end-of-data behavior
6. **Appropriate indexes**: Ensure proper indexes cho pagination columns

---

## Checklist

### API Design
- [ ] Pagination strategy được chọn phù hợp với use case
- [ ] Consistent API response format
- [ ] Clear documentation về pagination
- [ ] Error handling cho invalid cursors/pages

### Performance
- [ ] Database indexes cho pagination columns
- [ ] Benchmark với production-like data volume
- [ ] Limit max page size để tránh abuse
- [ ] Connection pooling configured

### Implementation
- [ ] Cursor encoding/decoding secure
- [ ] ORDER BY consistent với cursor
- [ ] hasMore/nextCursor trong response
- [ ] Rate limiting cho pagination endpoints
