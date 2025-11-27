# Incident Response

## References

- [NIST SP 800-61r3](https://csrc.nist.gov/pubs/sp/800/61/r3/final) - Incident Response Recommendations (2025)
- [CISA Incident Response Playbooks](https://www.cisa.gov/sites/default/files/2024-08/Federal_Government_Cybersecurity_Incident_and_Vulnerability_Response_Playbooks_508C.pdf)
- [AWS Security Incident Response Guide](https://docs.aws.amazon.com/whitepapers/latest/aws-security-incident-response-guide/)
- [Google SRE - Incident Management](https://sre.google/sre-book/managing-incidents/)
- [PagerDuty Incident Response](https://response.pagerduty.com/)
- [AWS Incident Response Playbooks](https://github.com/aws-samples/aws-incident-response-playbooks)

## Date

2012 (NIST SP 800-61r2) | **April 2025 (NIST SP 800-61r3)** | Cập nhật: November 2025

## Tổng quan

NIST SP 800-61 Revision 3 (released 2025) cung cấp guidance mới cho incident response, aligned với Cybersecurity Framework (CSF) 2.0. **Organizations với tested IR plans tiết kiệm trung bình $2.66 million per breach**.

## NIST IR Lifecycle

```
┌───────────────────────────────────────────────────────────────┐
│                    Incident Response Lifecycle                 │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│   │ Preparation │───>│  Detection  │───>│ Containment │      │
│   │             │    │ & Analysis  │    │ Eradication │      │
│   └─────────────┘    └─────────────┘    │  Recovery   │      │
│          ▲                              └──────┬──────┘      │
│          │                                     │              │
│          │           ┌─────────────┐           │              │
│          └───────────│Post-Incident│<──────────┘              │
│                      │  Activity   │                          │
│                      └─────────────┘                          │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

## Phase 1: Preparation

### IR Team Structure

| Role | Responsibility |
|------|---------------|
| **Incident Commander** | Overall coordination, communication |
| **Technical Lead** | Technical investigation and remediation |
| **Communications Lead** | Internal/external communications |
| **Scribe** | Documentation, timeline |
| **Subject Matter Experts** | Specific technical expertise |

### Essential Preparations

```yaml
IR Preparation Checklist:
  Documentation:
    - [ ] Incident response plan
    - [ ] Contact lists (escalation matrix)
    - [ ] Network diagrams
    - [ ] Asset inventory
    - [ ] Playbooks for common incidents

  Tools:
    - [ ] Monitoring and alerting (PagerDuty, OpsGenie)
    - [ ] Log aggregation (ELK, Datadog)
    - [ ] Communication channels (Slack, Teams)
    - [ ] Incident tracking (Jira, ServiceNow)
    - [ ] Forensics tools

  Training:
    - [ ] Regular tabletop exercises
    - [ ] On-call rotation training
    - [ ] Playbook walkthroughs
```

## Phase 2: Detection & Analysis

### Severity Levels

| Severity | Impact | Response Time | Examples |
|----------|--------|---------------|----------|
| **SEV1** | Critical business impact | Immediate | Production down, data breach |
| **SEV2** | Major functionality affected | < 30 min | Major feature unavailable |
| **SEV3** | Minor functionality affected | < 2 hours | Non-critical feature degraded |
| **SEV4** | Minimal impact | Next business day | Cosmetic issues |

### Detection Sources

| Source | Examples |
|--------|----------|
| **Monitoring** | APM alerts, error rate spikes |
| **Security Tools** | SIEM alerts, WAF blocks |
| **User Reports** | Support tickets, social media |
| **Automated Tests** | Synthetic monitoring, health checks |
| **Third Party** | Bug bounty, partner notification |

### Initial Triage

```typescript
interface IncidentTriage {
  // 1. What is the impact?
  affectedSystems: string[];
  affectedUsers: number;
  revenueImpact: 'high' | 'medium' | 'low' | 'none';

  // 2. What do we know?
  symptoms: string[];
  timelineStart: Date;
  potentialCauses: string[];

  // 3. What actions are needed?
  immediateActions: string[];
  requiredExperts: string[];
  communicationNeeded: boolean;
}
```

## Phase 3: Containment, Eradication, Recovery

### Containment Strategies

| Strategy | When to Use | Example |
|----------|-------------|---------|
| **Short-term** | Immediate threat | Block IP, disable account |
| **Long-term** | Sustained mitigation | Network segmentation |
| **Eradication** | Remove threat completely | Rebuild system |

### Recovery Steps

```yaml
Recovery Process:
  1. Validate Fix:
    - Test in non-production
    - Verify threat eliminated

  2. Restore Systems:
    - Deploy fix to production
    - Restore from clean backups if needed
    - Monitor closely

  3. Verify Normal Operations:
    - Check all functionality
    - Confirm metrics normal
    - Get user confirmation

  4. Communicate:
    - Update status page
    - Notify affected users
    - Close incident communication channels
```

## Phase 4: Post-Incident Activity

### Blameless Postmortem

```markdown
# Incident Postmortem: [Title]

## Summary
- **Date**: YYYY-MM-DD
- **Duration**: X hours Y minutes
- **Severity**: SEV1/2/3/4
- **Impact**: [User/business impact]
- **Root Cause**: [Brief description]

## Timeline
| Time (UTC) | Event |
|------------|-------|
| 14:00 | Alert triggered |
| 14:05 | On-call acknowledged |
| 14:15 | Root cause identified |
| 14:30 | Fix deployed |
| 14:45 | Incident resolved |

## Root Cause Analysis
[Detailed technical explanation]

## What Went Well
- Fast detection
- Clear communication
- Team collaboration

## What Could Be Improved
- Detection could be earlier
- Runbook was outdated

## Action Items
| Item | Owner | Due Date |
|------|-------|----------|
| Update monitoring | @alice | 2025-12-01 |
| Update runbook | @bob | 2025-12-05 |
```

## Playbooks

### Playbook Template

```yaml
# playbook-service-outage.yaml
name: Service Outage
severity: SEV1-SEV2
triggers:
  - Health check failures > 3 consecutive
  - Error rate > 10%
  - Latency p99 > 5s

immediate_actions:
  - Check service health: kubectl get pods -n mma
  - Check recent deployments: kubectl rollout history
  - Check logs: kubectl logs -l app=mma-service --tail=100
  - Check dependencies: curl http://db-host:5432/health

diagnostic_steps:
  - name: Check application logs
    command: kubectl logs -l app=mma-service --since=30m
    look_for: ERROR, Exception, timeout

  - name: Check resource usage
    command: kubectl top pods -n mma
    threshold: CPU > 90% or Memory > 90%

  - name: Check database connectivity
    command: psql -c "SELECT 1"

mitigation_options:
  - name: Rollback deployment
    command: kubectl rollout undo deployment/mma-service
    when: Recent deployment caused issue

  - name: Scale up
    command: kubectl scale deployment/mma-service --replicas=5
    when: Resource exhaustion

  - name: Restart pods
    command: kubectl rollout restart deployment/mma-service
    when: Memory leak or stuck state

escalation:
  - after: 15 min
    to: Engineering Lead
  - after: 30 min
    to: VP Engineering
  - after: 60 min
    to: CTO
```

### Common Playbooks to Create

| Playbook | Triggers |
|----------|----------|
| Service Outage | Health check failures |
| Database Issues | Connection errors, slow queries |
| Security Incident | Unauthorized access, data breach |
| Dependency Failure | Third-party service down |
| Deployment Failure | Failed deployment, error spike |
| Data Corruption | Integrity check failures |

## Communication Templates

### Internal Status Update

```
🔴 INCIDENT IN PROGRESS

Service: MMA API
Status: Investigating
Impact: Users unable to access athlete data
Started: 14:00 UTC

Current Actions:
- Investigating database connectivity
- On-call engineer engaged

Next Update: 14:30 UTC or when status changes
```

### External Status Page

```
Investigating API Issues

We are currently investigating issues affecting the MMA API.
Some users may experience errors when accessing athlete data.

We will provide updates as we learn more.

Posted: Nov 27, 2025 14:00 UTC
```

## Checklist

- [ ] **Preparation**:
  - [ ] IR plan documented
  - [ ] On-call rotation established
  - [ ] Contact lists current
  - [ ] Playbooks for common incidents
  - [ ] Communication channels defined
- [ ] **Detection**:
  - [ ] Monitoring và alerting configured
  - [ ] Log aggregation working
  - [ ] Severity levels defined
  - [ ] Escalation matrix documented
- [ ] **Response**:
  - [ ] Clear roles and responsibilities
  - [ ] Containment procedures documented
  - [ ] Recovery procedures tested
  - [ ] Communication templates ready
- [ ] **Post-Incident**:
  - [ ] Blameless postmortem process
  - [ ] Action item tracking
  - [ ] Knowledge base updates
  - [ ] Regular training and exercises
