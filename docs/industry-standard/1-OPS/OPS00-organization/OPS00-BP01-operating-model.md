# Cloud Operating Model

## References

- [AWS OE Pillar - Organization](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/organization.html)
- [AWS Cloud Operating Model](https://docs.aws.amazon.com/prescriptive-guidance/latest/strategy-cloud-operating-model/)
- [Team Topologies](https://teamtopologies.com/) - Matthew Skelton, Manuel Pais (2019)
- [DORA Metrics](https://dora.dev/research/) - DevOps Research and Assessment

## Date

2019 (Team Topologies) | **2025 (AWS OE Update)** | Cập nhật: November 2025

## Tổng quan

Cloud Operating Model định nghĩa cách tổ chức teams, processes và technology để deliver business outcomes. AWS OE Pillar có 3 questions về Organization: priorities (OPS01), structure (OPS02), culture (OPS03).

## AWS OPS Organization Questions

| Question | Focus |
|----------|-------|
| **OPS01** | How do you determine what your priorities are? |
| **OPS02** | How do you structure your organization? |
| **OPS03** | How does your culture support business outcomes? |

## Operating Model Evolution

```
┌─────────────────────────────────────────────────────────────┐
│                    Operating Model Maturity                  │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│   Level 1   │   Level 2   │   Level 3   │     Level 4      │
│  Reactive   │  Proactive  │  Predictive │    Autonomous    │
├─────────────┼─────────────┼─────────────┼──────────────────┤
│ Manual ops  │ Documented  │ Data-driven │ Self-healing     │
│ Tribal      │ Runbooks    │ Metrics/SLO │ AI-assisted      │
│ knowledge   │ Playbooks   │ Automation  │ Platform eng     │
└─────────────┴─────────────┴─────────────┴──────────────────┘
```

## Team Topologies

| Team Type | Responsibility | Example |
|-----------|---------------|---------|
| **Stream-aligned** | End-to-end delivery cho business domain | Product team |
| **Platform** | Internal services, reduce cognitive load | DevOps platform |
| **Enabling** | Coach và support stream-aligned teams | SRE, Security |
| **Complicated-subsystem** | Deep specialist expertise | ML, Database |

### Interaction Modes

| Mode | Description |
|------|-------------|
| **Collaboration** | Teams work together (temporary) |
| **X-as-a-Service** | One team provides service to others |
| **Facilitating** | One team helps another improve |

## Priorities (OPS01)

### Evaluate Business Priorities

```yaml
# Priority Framework
priorities:
  - customer_needs:
      internal: [dev velocity, reliability]
      external: [uptime, features, security]

  - compliance:
      regulatory: [GDPR, SOC2, PCI-DSS]
      governance: [cost controls, audit]

  - risk_management:
      threats: [security, availability, data loss]
      risk_registry: maintain and review quarterly

  - trade_offs:
      speed_vs_safety: [feature flags, canary deploys]
      cost_vs_performance: [right-sizing, spot instances]
```

### Priority Decision Matrix

| Impact | Urgency | Action |
|--------|---------|--------|
| High | High | Immediate - escalate, all hands |
| High | Low | Plan - schedule in sprint |
| Low | High | Delegate - automate if possible |
| Low | Low | Backlog - revisit quarterly |

## Organization Structure (OPS02)

### Define Clear Ownership

```yaml
# RACI Matrix
workload_ownership:
  application:
    responsible: Product Team
    accountable: Product Manager
    consulted: [Platform, Security]
    informed: [Leadership]

  infrastructure:
    responsible: Platform Team
    accountable: Platform Lead
    consulted: [Product Teams]
    informed: [Finance, Security]

  security:
    responsible: All Teams (shift-left)
    accountable: Security Team
    consulted: [Legal, Compliance]
    informed: [Leadership]
```

### Cross-functional Agreements

| Agreement Type | Purpose |
|---------------|---------|
| **SLA** | External commitments to customers |
| **SLO** | Internal targets for service quality |
| **OLA** | Agreements between internal teams |

## Culture (OPS03)

### Psychological Safety

| Practice | Description |
|----------|-------------|
| **Blameless postmortems** | Focus on systems, not individuals |
| **Safe to fail** | Encourage experimentation |
| **Escalation without fear** | Support raising concerns |
| **Dedicated learning time** | 20% time, hackathons |

### DORA Metrics (2024)

| Metric | Elite | High | Medium | Low |
|--------|-------|------|--------|-----|
| **Deployment Frequency** | On-demand | Daily-weekly | Weekly-monthly | Monthly+ |
| **Lead Time** | <1 hour | 1 day-1 week | 1-6 months | 6+ months |
| **Change Failure Rate** | <5% | 10-15% | 16-30% | >45% |
| **MTTR** | <1 hour | <1 day | 1 day-1 week | 1+ week |

### Building Culture

```
1. Leadership commitment
   └── Executive sponsorship for DevOps transformation

2. Psychological safety
   └── Blameless culture, safe to experiment

3. Learning organization
   └── Postmortems, knowledge sharing, communities

4. Cross-functional collaboration
   └── Break down silos, shared goals

5. Continuous improvement
   └── Metrics-driven, iterate on processes
```

## Implementation Example

```yaml
# team-charter.yaml
team:
  name: MMA Backend Team
  type: stream-aligned
  domain: Fighter data and rankings

ownership:
  services: [mma-api, mma-workers]
  on_call: rotational (weekly)
  escalation: platform-team → sre-team

agreements:
  slo:
    availability: 99.9%
    latency_p99: 200ms
  communication:
    sync: daily standup (15min)
    async: Slack #mma-backend

culture:
  practices:
    - blameless postmortems
    - pair programming
    - weekly tech talks
  learning:
    - 10% time for improvement
    - conference budget per person
```

## Checklist

### OPS01 - Priorities
- [ ] Business priorities documented và communicated
- [ ] Compliance requirements identified
- [ ] Risk registry maintained
- [ ] Trade-off decisions documented
- [ ] Priority review process (quarterly)

### OPS02 - Organization Structure
- [ ] Clear ownership for all workloads
- [ ] RACI matrix defined
- [ ] SLOs/OLAs established
- [ ] Escalation paths documented
- [ ] Team interfaces defined (X-as-a-Service)

### OPS03 - Culture
- [ ] Psychological safety promoted
- [ ] Blameless postmortem process
- [ ] Learning time allocated
- [ ] Knowledge sharing mechanisms
- [ ] DORA metrics tracked
- [ ] Cross-team collaboration encouraged
