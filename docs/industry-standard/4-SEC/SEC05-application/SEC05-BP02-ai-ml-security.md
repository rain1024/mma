# AI/ML Security - OWASP Top 10 for LLM Applications

## References

- [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/) - November 2024
- [OWASP GenAI Security Project](https://genai.owasp.org/)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [EU AI Act](https://artificialintelligenceact.eu/)
- [OpenTelemetry AI Agent Observability](https://opentelemetry.io/blog/2025/ai-agent-observability/)

## Date

2023 (OWASP LLM Top 10 v1.0) | **November 2024 (v2025)** | Cập nhật: November 2025

## Tổng quan

OWASP Top 10 for LLM Applications 2025 xác định các security vulnerabilities quan trọng nhất trong LLM applications (chatbots, RAG systems, AI agents).

## Top 10 LLM Vulnerabilities (2025)

| # | Vulnerability | Mô tả | Impact |
|---|---------------|-------|--------|
| LLM01 | **Prompt Injection** | Manipulate LLM qua crafted inputs | Unauthorized access, data breach |
| LLM02 | **Sensitive Information Disclosure** | LLM leak sensitive data | Privacy violation, data breach |
| LLM03 | **Supply Chain Vulnerabilities** | Compromised models, datasets, plugins | Model integrity |
| LLM04 | **Data and Model Poisoning** | Tampered training data | Biased/malicious outputs |
| LLM05 | **Improper Output Handling** | Không validate LLM outputs | Code execution, XSS |
| LLM06 | **Excessive Agency** | LLM có quá nhiều quyền | Unintended actions |
| LLM07 | **System Prompt Leakage** | Lộ system prompts | Security bypass |
| LLM08 | **Vector and Embedding Weaknesses** | RAG system vulnerabilities | Information leakage |
| LLM09 | **Misinformation** | LLM generate false info | Reputation damage |
| LLM10 | **Unbounded Consumption** | Resource exhaustion | DoS, cost overrun |

## LLM01: Prompt Injection

### Types:
- **Direct**: User trực tiếp inject malicious prompts
- **Indirect**: Malicious content từ external sources (websites, documents)

### Mitigation:
```typescript
// Input validation
function sanitizeUserInput(input: string): string {
  // Remove potential injection patterns
  const sanitized = input
    .replace(/ignore previous instructions/gi, '')
    .replace(/system:/gi, '')
    .trim();
  return sanitized;
}

// Output filtering
function validateLLMOutput(output: string): boolean {
  // Check for sensitive data patterns
  const sensitivePatterns = [
    /api[_-]?key/i,
    /password/i,
    /secret/i
  ];
  return !sensitivePatterns.some(p => p.test(output));
}
```

## LLM07: System Prompt Leakage (NEW)

### Problem:
Developers put sensitive info trong system prompts, users extract chúng.

### Mitigation:
- Không include sensitive info trong system prompts
- Implement guardrails để detect extraction attempts
- Regular testing với adversarial prompts

## LLM08: Vector and Embedding Weaknesses (NEW)

### RAG Security:
```typescript
// BAD: No access control
const results = await vectorDB.query(userQuery);

// GOOD: Access control trong RAG
const results = await vectorDB.query(userQuery, {
  filter: {
    accessLevel: { $lte: user.accessLevel },
    department: { $in: user.departments }
  }
});
```

## AI Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Security Layers                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Input Layer                                                 │
│  ├── Input validation                                        │
│  ├── Prompt injection detection                              │
│  └── Rate limiting                                           │
│                                                              │
│  Processing Layer                                            │
│  ├── Model access control                                    │
│  ├── Resource limits                                         │
│  └── Guardrails                                              │
│                                                              │
│  Output Layer                                                │
│  ├── Output filtering                                        │
│  ├── Sensitive data detection                                │
│  └── Content moderation                                      │
│                                                              │
│  RAG Layer                                                   │
│  ├── Document access control                                 │
│  ├── Embedding isolation                                     │
│  └── Source validation                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## AI Observability (OpenTelemetry)

OpenTelemetry đang develop semantic conventions cho AI agent observability:

```typescript
// Tracing AI requests
const span = tracer.startSpan('llm.completion', {
  attributes: {
    'llm.model': 'gpt-4',
    'llm.token_count.prompt': promptTokens,
    'llm.token_count.completion': completionTokens,
    'llm.request_type': 'chat'
  }
});
```

## Checklist

- [ ] **Input Security**:
  - [ ] Input validation và sanitization
  - [ ] Prompt injection detection
  - [ ] Rate limiting per user
- [ ] **Model Security**:
  - [ ] Model provenance verification
  - [ ] Regular model auditing
  - [ ] Access control cho model endpoints
- [ ] **Output Security**:
  - [ ] Output validation
  - [ ] Sensitive data filtering
  - [ ] Content moderation
- [ ] **RAG Security**:
  - [ ] Document-level access control
  - [ ] Embedding isolation per tenant
  - [ ] Source verification
- [ ] **System Prompts**:
  - [ ] No sensitive data trong prompts
  - [ ] Extraction detection
  - [ ] Regular prompt auditing
- [ ] **Observability**:
  - [ ] Token usage monitoring
  - [ ] Cost tracking
  - [ ] Anomaly detection
