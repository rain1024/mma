# Runbooks và Playbooks

## References

- [AWS OPS07 - Operational Readiness](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/ops_ready_to_support.html)
- [Google SRE - Runbook](https://sre.google/sre-book/effective-troubleshooting/)
- [PagerDuty Runbook Docs](https://www.pagerduty.com/resources/learn/what-is-a-runbook/)
- [Ansible Automation](https://docs.ansible.com/ansible/latest/getting_started/)

## Date

2016 (Google SRE Book) | **2025 (AWS OE Update)** | Cập nhật: November 2025

## Tổng quan

Runbooks và Playbooks là tài liệu hướng dẫn để thực hiện các tác vụ vận hành. AWS OPS07 question: "How do you know that you are ready to support a workload?" - Runbooks/Playbooks là một phần quan trọng của Operational Readiness.

## Runbook vs Playbook

| Aspect | Runbook | Playbook |
|--------|---------|----------|
| **Purpose** | Routine tasks, procedures | Incident response, troubleshooting |
| **Trigger** | Scheduled, on-demand | Alert, incident |
| **Complexity** | Low-medium | Medium-high |
| **Decision** | Minimal (follow steps) | Requires judgment |
| **Example** | Deploy new version | High CPU investigation |

## Runbook Structure

```yaml
# runbook-template.yaml
runbook:
  title: Deploy New Version
  id: RB-001
  version: 1.2
  last_updated: 2025-11-27
  owner: Platform Team

  metadata:
    frequency: weekly
    duration: 15-30 minutes
    risk: medium
    approval_required: yes (production)

  prerequisites:
    - [ ] All tests passing
    - [ ] Change request approved
    - [ ] Rollback plan ready

  steps:
    - step: 1
      action: Verify pre-deployment checks
      command: npm run test && npm run build
      expected: All tests pass, build succeeds

    - step: 2
      action: Create backup
      command: |
        kubectl get deployment mma-api -o yaml > backup-$(date +%Y%m%d).yaml
      expected: Backup file created

    - step: 3
      action: Deploy new version
      command: |
        kubectl set image deployment/mma-api \
          mma-api=mma-api:${NEW_VERSION}
      expected: Deployment updated

    - step: 4
      action: Monitor rollout
      command: kubectl rollout status deployment/mma-api --timeout=5m
      expected: Rollout completes successfully

    - step: 5
      action: Verify health
      command: curl -f https://api.mma.local/health
      expected: HTTP 200, status healthy

  rollback:
    trigger: Any step fails or health check fails
    steps:
      - kubectl rollout undo deployment/mma-api
      - Verify health after rollback
      - Notify team in #incidents channel
```

## Playbook Structure

```yaml
# playbook-template.yaml
playbook:
  title: High CPU Usage Investigation
  id: PB-001
  severity: P2
  last_updated: 2025-11-27
  owner: SRE Team

  trigger:
    alert: HighCPUUsage
    threshold: CPU > 80% for 5 minutes

  initial_assessment:
    questions:
      - Is this affecting user traffic?
      - When did the issue start?
      - Were there recent deployments?
      - Is it a single pod or multiple?

  investigation_steps:
    - step: 1
      title: Identify affected resources
      actions:
        - Check dashboard: grafana.local/d/cpu-overview
        - command: kubectl top pods -n production --sort-by=cpu
        - Check recent events: kubectl get events --sort-by='.lastTimestamp'

    - step: 2
      title: Analyze patterns
      decision_tree:
        - condition: Single pod affected
          action: Check pod logs, consider restart
        - condition: All pods affected
          action: Check for traffic spike or code regression
        - condition: Gradual increase
          action: Check for memory leak or connection leak

    - step: 3
      title: Correlate with changes
      actions:
        - Check deployment history: kubectl rollout history
        - Check config changes in GitOps repo
        - Review recent PRs merged

  remediation:
    immediate:
      - Scale up if traffic-related: kubectl scale deployment mma-api --replicas=5
      - Restart if single pod: kubectl delete pod <pod-name>

    long_term:
      - Profile application for optimization
      - Review auto-scaling thresholds
      - Update resource requests/limits

  escalation:
    - 15 min: Notify on-call engineer
    - 30 min: Notify tech lead
    - 1 hour: Escalate to management

  post_incident:
    - Update this playbook with new learnings
    - Create ticket for permanent fix
    - Schedule postmortem if customer-impacting
```

## Operational Readiness Review (ORR)

```yaml
# orr-checklist.yaml
orr:
  workload: MMA API
  review_date: 2025-11-27

  categories:
    documentation:
      - [ ] Architecture diagram current
      - [ ] Runbooks for common operations
      - [ ] Playbooks for known failure modes
      - [ ] On-call rotation documented

    observability:
      - [ ] Metrics dashboards configured
      - [ ] Alerts defined with runbook links
      - [ ] Logging adequate for troubleshooting
      - [ ] Distributed tracing enabled

    resilience:
      - [ ] Health checks implemented
      - [ ] Auto-scaling configured
      - [ ] Rollback procedure tested
      - [ ] Chaos tests conducted

    security:
      - [ ] Security review completed
      - [ ] Secrets managed properly
      - [ ] Access controls defined

    operations:
      - [ ] On-call trained on system
      - [ ] Incident response tested
      - [ ] Capacity planning done
      - [ ] Backup/restore tested
```

## Automation Levels

| Level | Description | Example |
|-------|-------------|---------|
| **L0** | Fully manual | Follow written steps |
| **L1** | Script-assisted | One-click scripts |
| **L2** | Semi-automated | Human triggers, auto executes |
| **L3** | Fully automated | Self-healing, no human |

### Example: L1 → L2 Evolution

```bash
# L1: Manual script
#!/bin/bash
# runbook-deploy.sh - Run manually
kubectl set image deployment/mma-api mma-api=$1
kubectl rollout status deployment/mma-api

# L2: Automated with approval
# GitHub Actions workflow triggered by PR merge
# Requires manual approval for production
```

## Tools for Runbooks

| Tool | Type | Features |
|------|------|----------|
| **Notion/Confluence** | Documentation | Templates, versioning |
| **Rundeck** | Automation | Job scheduling, access control |
| **Ansible** | Automation | Playbooks as code |
| **PagerDuty** | Incident | Runbook links in alerts |
| **Backstage** | Portal | TechDocs integration |

## Best Practices

| Practice | Description |
|----------|-------------|
| **Version control** | Store runbooks in Git |
| **Link from alerts** | Every alert → runbook link |
| **Test regularly** | Game days, fire drills |
| **Keep updated** | Review after incidents |
| **Automate progressively** | L0 → L1 → L2 → L3 |

## Checklist

### Runbooks
- [ ] Runbooks for all routine operations
- [ ] Clear step-by-step instructions
- [ ] Expected outcomes documented
- [ ] Rollback procedures included
- [ ] Prerequisites listed
- [ ] Stored in version control

### Playbooks
- [ ] Playbooks for known failure modes
- [ ] Decision trees for investigation
- [ ] Escalation paths defined
- [ ] Links from alerts configured
- [ ] Updated after each incident

### Operational Readiness
- [ ] ORR checklist completed before production
- [ ] On-call team trained
- [ ] Runbooks/playbooks tested
- [ ] Game day exercises scheduled
- [ ] Regular review cycle established
