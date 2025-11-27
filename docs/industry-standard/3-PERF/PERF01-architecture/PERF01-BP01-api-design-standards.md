# API Design Standards

## References

- [Google API Design Guide](https://cloud.google.com/apis/design)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
- [OpenAPI Specification 3.1](https://swagger.io/specification/)
- [AsyncAPI 3.0](https://www.asyncapi.com/) - Event-driven APIs
- [JSON:API Specification](https://jsonapi.org/)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [Stripe API Design](https://stripe.com/docs/api)
- [Postman State of the API 2025](https://blog.postman.com/graphql-vs-rest/)
- [AWS Performance Efficiency Pillar](https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/) - **April 2025**

## Date

2000 (REST - Roy Fielding) | 2015 (GraphQL) | **2024 (OpenAPI 3.2, AsyncAPI 3.0)** | Cập nhật: November 2025

## Tổng quan

Standards để thiết kế APIs nhất quán, dễ sử dụng và performant. APIs đang trở thành **execution layer cho AI systems** (2025 State of API Report).

## REST vs GraphQL vs gRPC

| Aspect | REST | GraphQL | gRPC |
|--------|------|---------|------|
| **Use Case** | CRUD, public APIs | Flexible queries, mobile | High-performance, microservices |
| **Data Fetching** | Fixed endpoints | Client-specified fields | Protocol buffers |
| **Caching** | HTTP caching | Custom required | Limited |
| **Learning Curve** | Low | Medium | High |
| **Best For** | Simple, hierarchical data | Complex, nested data | Internal services |

### When to Use

```
REST:
├── Public APIs
├── Simple CRUD operations
├── Caching is important
└── Wide client compatibility

GraphQL:
├── Mobile/low-bandwidth
├── Complex, nested data
├── Avoid over-fetching
└── Real-time subscriptions

gRPC:
├── Service-to-service
├── High performance needed
├── Strong typing required
└── Bi-directional streaming
```

## REST Conventions

| Convention | Correct | Incorrect |
|------------|---------|-----------|
| Nouns, not verbs | `/athletes` | `/getAthletes` |
| Plural resources | `/events` | `/event` |
| Lowercase, hyphens | `/weight-classes` | `/weightClasses` |
| Nested resources | `/events/123/matches` | `/getMatchesByEvent` |

## HTTP Methods

| Method | Action | Idempotent | Response |
|--------|--------|------------|----------|
| GET | Read | Yes | 200 + data |
| POST | Create | No | 201 + Location header |
| PUT | Replace | Yes | 200 + updated resource |
| PATCH | Partial update | No | 200 + updated resource |
| DELETE | Delete | Yes | 204 No Content |

## Response Format

```json
{
  "data": {
    "id": 123,
    "type": "athlete",
    "attributes": {
      "name": "Fighter Name",
      "division": "lightweight"
    }
  },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  },
  "links": {
    "self": "/api/athletes?page=1",
    "next": "/api/athletes?page=2"
  }
}
```

## Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "name", "message": "Required" },
      { "field": "division", "message": "Must be valid division" }
    ],
    "requestId": "req-123-abc"
  }
}
```

## Pagination

```typescript
// Offset-based (simple, but slow for large datasets)
GET /athletes?page=2&limit=20

// Cursor-based (performant, recommended)
GET /athletes?cursor=eyJpZCI6MTAwfQ&limit=20

// Response with cursor
{
  "data": [...],
  "meta": {
    "nextCursor": "eyJpZCI6MTIwfQ",
    "hasMore": true
  }
}
```

## Rate Limiting

```typescript
// Response headers
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
Retry-After: 60  // When 429

// Implementation
app.use(rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  headers: true,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
        retryAfter: 60,
      }
    });
  },
}));
```

## Versioning

```
URL versioning (recommended):
/api/v1/athletes

Header versioning:
Accept: application/vnd.mma.v1+json

Query param (not recommended):
/api/athletes?version=1
```

## GraphQL Best Practices

```graphql
# Schema with good practices
type Query {
  # Use connections for pagination
  athletes(first: Int, after: String): AthleteConnection!

  # Single entity by ID
  athlete(id: ID!): Athlete
}

type AthleteConnection {
  edges: [AthleteEdge!]!
  pageInfo: PageInfo!
}

type AthleteEdge {
  node: Athlete!
  cursor: String!
}
```

## Security Best Practices (2025)

| Practice | REST | GraphQL |
|----------|------|---------|
| **Authentication** | OAuth 2.1, JWT | Same |
| **Rate Limiting** | Per endpoint | Query complexity limits |
| **Input Validation** | Joi, Zod | Same + query depth limits |
| **Introspection** | N/A | Disable in production |

## Checklist

- [ ] **Design**:
  - [ ] Consistent naming conventions
  - [ ] Proper HTTP methods và status codes
  - [ ] Resource-oriented URLs
- [ ] **Features**:
  - [ ] Pagination (cursor-based preferred)
  - [ ] Filtering và sorting support
  - [ ] Field selection (sparse fieldsets)
- [ ] **Security**:
  - [ ] Rate limiting với headers
  - [ ] Input validation
  - [ ] Authentication (OAuth 2.1/JWT)
- [ ] **Documentation**:
  - [ ] OpenAPI/Swagger spec
  - [ ] Interactive documentation
  - [ ] Example requests/responses
- [ ] **Monitoring**:
  - [ ] Request logging
  - [ ] Latency tracking
  - [ ] Error rate monitoring
