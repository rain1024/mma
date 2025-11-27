# Authentication & Authorization Standards

## References

- [OAuth 2.1 Draft (draft-ietf-oauth-v2-1-14)](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/) - October 2025
- [OAuth 2.0 - RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749) - Legacy
- [OpenID Connect](https://openid.net/connect/)
- [JWT - RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519)
- [AWS Cognito](https://aws.amazon.com/cognito/)
- [Google Identity Platform](https://cloud.google.com/identity-platform)
- [Auth0](https://auth0.com/docs)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/)
- [OAuth 2.1 Overview](https://oauth.net/2.1/)

## Date

2012 (OAuth 2.0) | 2014 (OpenID Connect) | **2025 (OAuth 2.1 Draft v14)** | Cập nhật: November 2025

## Tổng quan

Standards cho việc xác thực (authentication) và phân quyền (authorization) trong web applications. OAuth 2.1 đang được finalize và consolidate best practices từ OAuth 2.0.

## OAuth 2.1 - Thay đổi quan trọng

OAuth 2.1 không phải rewrite mà là **curation update** - loại bỏ bad practices và bắt buộc best practices.

| Thay đổi | OAuth 2.0 | OAuth 2.1 |
|----------|-----------|-----------|
| **PKCE** | Optional (chỉ public clients) | **Bắt buộc cho tất cả** |
| **Implicit Grant** | Cho phép | **Đã loại bỏ** (token leakage risk) |
| **Password Grant (ROPC)** | Cho phép | **Đã loại bỏ** |
| **Redirect URI** | Pattern matching | **Exact string matching** |
| **Bearer tokens in URL** | Cho phép | **Cấm** (không trong query string) |
| **Refresh Tokens** | Basic | **Sender-constrained hoặc one-time use** |
| **HTTPS** | Recommended | **Bắt buộc** |

### Consolidated Specs trong OAuth 2.1:
- RFC 6749 (OAuth 2.0)
- RFC 6750 (Bearer Token Usage)
- RFC 7636 (PKCE)
- RFC 8252 (OAuth for Native Apps)
- OAuth 2.0 for Browser-Based Apps
- OAuth Security Best Current Practice

## So sánh các phương pháp

| Phương pháp | Use case | Pros | Cons |
|-------------|----------|------|------|
| **Session-based** | Traditional web apps | Simple, server control | Not scalable, CSRF |
| **JWT** | SPAs, APIs, Microservices | Stateless, scalable | Token size, revocation |
| **OAuth 2.1** | Modern apps (recommended) | Secure by default | Requires PKCE |
| **OAuth 2.0** | Legacy apps | Wide adoption | Insecure defaults |
| **API Keys** | Service-to-service | Simple | No user context |

## JWT Best Practices

```typescript
// DO: Short expiry, refresh tokens
const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });
const refreshToken = jwt.sign(payload, secret, { expiresIn: '7d' });

// DO: Verify và validate
const decoded = jwt.verify(token, secret, {
  algorithms: ['HS256'],
  issuer: 'mma-service'
});

// DON'T: Store sensitive data in payload (it's base64, not encrypted)
```

## OAuth 2.0 Flows

| Flow | Use case |
|------|----------|
| Authorization Code | Web apps với backend |
| Authorization Code + PKCE | SPAs, mobile apps |
| Client Credentials | Service-to-service |

## Checklist (Updated for OAuth 2.1)

- [ ] Passwords hashed với bcrypt/argon2 (cost factor ≥ 10)
- [ ] JWT có expiry ngắn (15-60 phút)
- [ ] Refresh token rotation (one-time use)
- [ ] HTTPS only cho tất cả endpoints (**bắt buộc OAuth 2.1**)
- [ ] Rate limiting cho login attempts
- [ ] MFA cho admin accounts
- [ ] **OAuth 2.1 Requirements**:
  - [ ] PKCE cho tất cả authorization code flows
  - [ ] Không sử dụng implicit grant
  - [ ] Không sử dụng password grant
  - [ ] Exact redirect URI matching
  - [ ] Không truyền tokens qua URL query string
  - [ ] Sender-constrained tokens khi có thể
