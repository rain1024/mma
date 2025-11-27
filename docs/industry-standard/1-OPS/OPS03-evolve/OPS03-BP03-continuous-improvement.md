# Continuous Improvement và Post-Incident Analysis

## References

- [AWS OPS11 - Evolve Operations](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/ops_evolve_ops.html)
- [Google SRE - Postmortem Culture](https://sre.google/sre-book/postmortem-culture/)
- [Etsy Blameless Postmortems](https://www.etsy.com/codeascraft/blameless-postmortems)
- [Learning from Incidents](https://www.learningfromincidents.io/)

## Date

2016 (Google SRE Book) | **2025 (AWS OE Update)** | Cập nhật: November 2025

## Tổng quan

AWS OPS11 question: "How do you evolve operations?" - Continuous improvement đòi hỏi dedicated time, metrics-driven decisions, và blameless postmortem culture. Post-incident analysis là nguồn learning quan trọng nhất.

## AWS OPS11 Best Practices

| Best Practice | Description |
|--------------|-------------|
| Dedicate time for improvement | 10-20% time for operational improvements |
| Perform post-incident analysis | Blameless postmortems for all incidents |
| Implement feedback loops | Metrics → insights → action → measure |
| Share lessons learned | Cross-team knowledge sharing |
| Analyze trends | Pattern recognition across incidents |

## Postmortem Culture

### Blameless Principles

```
┌─────────────────────────────────────────────────────────────┐
│                    Blameless Postmortem                      │
├─────────────────────────────────────────────────────────────┤
│  ✅ Focus on WHAT happened, not WHO did it                  │
│  ✅ Systems failed, not people                              │
│  ✅ Humans make mistakes - design systems to prevent them   │
│  ✅ Psychological safety enables honest reporting           │
│  ✅ Goal: improve systems, not assign blame                 │
└─────────────────────────────────────────────────────────────┘
```

### When to Write Postmortem

| Trigger | Required |
|---------|----------|
| Customer-facing outage | Yes |
| Data loss or corruption | Yes |
| On-call escalation | Yes |
| Security incident | Yes |
| Near-miss (could have been bad) | Recommended |
| Significant operational toil | Optional |

## Postmortem Template

```markdown
# Incident Postmortem: [Title]

## Summary
- **Date**: 2025-11-27
- **Duration**: 2 hours 15 minutes
- **Impact**: 500 users affected, 99.5% availability
- **Severity**: SEV2
- **Author**: [Name]
- **Reviewers**: [Names]

## Timeline (UTC)
| Time | Event |
|------|-------|
| 14:00 | Deployment of v2.3.1 started |
| 14:05 | First error alerts triggered |
| 14:10 | On-call paged, began investigation |
| 14:25 | Root cause identified - DB connection pool exhausted |
| 14:30 | Rollback initiated |
| 14:35 | Service restored |
| 16:15 | Full recovery confirmed |

## Root Cause
Database connection pool exhausted due to:
1. New feature increased DB queries 3x
2. Connection pool size not adjusted
3. No alerting on connection pool usage

## Contributing Factors
- [ ] Load testing did not simulate production scale
- [ ] Connection pool metrics not in dashboard
- [ ] Deployment during peak traffic hours

## Impact
- **Users affected**: ~500 (5% of daily active)
- **Revenue impact**: $X estimated
- **SLO impact**: Monthly availability dropped to 99.85%

## What Went Well
- On-call responded within 5 minutes
- Rollback procedure worked smoothly
- Communication to stakeholders was timely

## What Went Wrong
- Alert fatigue - initial alerts dismissed
- Runbook outdated for this scenario
- No connection pool monitoring

## Action Items
| Action | Owner | Due Date | Priority |
|--------|-------|----------|----------|
| Add connection pool metrics to dashboard | @alice | 2025-12-01 | P1 |
| Update deployment runbook | @bob | 2025-12-05 | P2 |
| Implement load testing in CI | @carol | 2025-12-15 | P2 |
| Review alert thresholds | @dave | 2025-12-10 | P2 |

## Lessons Learned
1. Always load test with production-like data
2. Monitor connection pools explicitly
3. Deploy outside peak hours

## Supporting Data
- [Grafana dashboard link]
- [Log query link]
- [Slack thread link]
```

## Improvement Cycles

### PDCA (Plan-Do-Check-Act)

```
    ┌─────────┐
    │  PLAN   │ ← Identify improvement opportunity
    └────┬────┘
         │
    ┌────▼────┐
    │   DO    │ ← Implement change (small scale)
    └────┬────┘
         │
    ┌────▼────┐
    │  CHECK  │ ← Measure results
    └────┬────┘
         │
    ┌────▼────┐
    │   ACT   │ ← Standardize or iterate
    └─────────┘
```

### Dedicated Improvement Time

| Approach | Allocation | Examples |
|----------|-----------|----------|
| **Google 20%** | 1 day/week | Side projects, tools |
| **Spotify Hack Days** | Quarterly | 2-day hackathons |
| **Toil Budget** | 50% cap | Automate when exceeded |
| **Tech Debt Sprints** | Monthly | Dedicated cleanup sprint |

## Metrics for Improvement

### Operational Metrics

| Metric | Target | Improvement Signal |
|--------|--------|-------------------|
| **MTTR** | < 1 hour | Decreasing trend |
| **Incident Count** | Decreasing | Fewer repeated issues |
| **Toil %** | < 50% | More automation |
| **Change Failure Rate** | < 15% | Better testing |
| **Alert Noise** | Decreasing | Better thresholds |

### Tracking Improvements

```yaml
# improvement-tracker.yaml
improvements:
  - id: IMP-001
    title: Automate database backup verification
    source: Postmortem PM-042
    status: completed
    before:
      metric: manual_checks_per_week
      value: 7
    after:
      metric: manual_checks_per_week
      value: 0
    impact: Saved 2 hours/week

  - id: IMP-002
    title: Add circuit breaker to payment service
    source: Quarterly review
    status: in_progress
    expected_impact: Reduce cascading failures by 80%
```

## Feedback Loops

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Metrics    │────►│   Analysis   │────►│   Action     │
│              │     │              │     │              │
│ - Dashboards │     │ - Weekly     │     │ - Automate   │
│ - Alerts     │     │   reviews    │     │ - Document   │
│ - Logs       │     │ - Trends     │     │ - Train      │
└──────────────┘     └──────────────┘     └──────────────┘
        ▲                                        │
        │                                        │
        └────────────────────────────────────────┘
                     Measure impact
```

## Knowledge Sharing

| Method | Frequency | Audience |
|--------|-----------|----------|
| **Postmortem reviews** | After each incident | Team |
| **Weekly ops review** | Weekly | Engineering |
| **Monthly trends** | Monthly | Leadership |
| **Tech talks** | Bi-weekly | All engineers |
| **Wiki/Docs** | Continuous | Everyone |

## Checklist

### Postmortem Process
- [ ] Blameless culture established
- [ ] Template defined and accessible
- [ ] Timeline within 48 hours of incident
- [ ] Action items tracked to completion
- [ ] Reviews shared cross-team

### Continuous Improvement
- [ ] Dedicated improvement time allocated
- [ ] Operational metrics tracked
- [ ] Regular review cadence (weekly/monthly)
- [ ] Improvement backlog maintained
- [ ] Impact of improvements measured

### Knowledge Management
- [ ] Lessons learned documented
- [ ] Trend analysis performed
- [ ] Knowledge shared cross-team
- [ ] Runbooks/playbooks updated
- [ ] Training based on incidents
