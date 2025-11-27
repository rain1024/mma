# Chaos Engineering

## References

- [Principles of Chaos Engineering](https://principlesofchaos.org/) - Netflix
- [LitmusChaos](https://litmuschaos.io/) - CNCF Project
- [Gremlin](https://www.gremlin.com/chaos-engineering) - Commercial platform
- [Chaos Mesh](https://chaos-mesh.org/) - CNCF Project
- [AWS Fault Injection Service](https://aws.amazon.com/fis/)
- [Gartner Chaos Engineering Recommendations](https://www.gremlin.com/blog/4-chaos-engineering-recommendations-from-gartner) - 2025
- [GitHub Chaos Engineering Study](https://arxiv.org/html/2505.13654v1) - 2025

## Date

2011 (Netflix Chaos Monkey) | **2024 (LitmusChaos 3.x, CNCF Graduated)** | Cập nhật: November 2025

## Tổng quan

Chaos Engineering là discipline thử nghiệm để phát hiện điểm yếu trong hệ thống trước khi chúng gây ra sự cố. **67% companies đã delay operations do Kubernetes security/reliability issues** (2024 report).

## Principles of Chaos Engineering

| Principle | Description |
|-----------|-------------|
| **Build a Hypothesis** | Define expected steady state behavior |
| **Vary Real-World Events** | Inject failures that happen in production |
| **Run Experiments in Production** | Test where it matters (safely) |
| **Automate Experiments** | Run continuously, not just once |
| **Minimize Blast Radius** | Start small, expand gradually |

## Chaos Engineering vs Traditional Testing

```
Traditional Testing:
├── Known inputs → Expected outputs
├── Test before deployment
├── Pass/Fail results
└── Validates functionality

Chaos Engineering:
├── Unknown failure modes
├── Test in production (safely)
├── Discovers weaknesses
└── Builds confidence in reliability
```

## Tool Comparison (2024-2025)

| Tool | Type | Best For | Key Features |
|------|------|----------|--------------|
| **LitmusChaos** | Open-source (CNCF) | Kubernetes | ChaosHub, native K8s, 106+ releases |
| **Chaos Mesh** | Open-source (CNCF) | Kubernetes | Lightweight, easy setup |
| **Gremlin** | Commercial | Enterprise | Rich UI, GameDays, support |
| **AWS FIS** | Managed | AWS workloads | Deep AWS integration |
| **Steadybit** | Commercial | Multi-platform | Wide integrations |

### LitmusChaos vs Gremlin

| Aspect | LitmusChaos | Gremlin |
|--------|-------------|---------|
| **License** | Apache 2.0 | Commercial |
| **UI** | ChaosCenter | Rich Web UI |
| **Learning Curve** | Higher | Lower |
| **Customization** | Full | Limited |
| **Support** | Community | Enterprise |
| **Best For** | Platform engineers | Dev teams |

## Experiment Types

### Infrastructure Chaos

| Experiment | Target | Purpose |
|------------|--------|---------|
| **Pod Kill** | Kubernetes pods | Test pod recovery |
| **Node Drain** | Kubernetes nodes | Test node failure handling |
| **Network Latency** | Network | Test timeout handling |
| **Network Partition** | Network | Test split-brain scenarios |
| **CPU Stress** | Compute | Test resource exhaustion |
| **Memory Stress** | Compute | Test OOM handling |
| **Disk Fill** | Storage | Test storage limits |

### Application Chaos

| Experiment | Target | Purpose |
|------------|--------|---------|
| **Service Unavailable** | Dependencies | Test circuit breakers |
| **HTTP Errors** | APIs | Test error handling |
| **Slow Responses** | APIs | Test timeouts |

## LitmusChaos Example

### ChaosExperiment Definition

```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosExperiment
metadata:
  name: pod-delete
  namespace: mma
spec:
  definition:
    scope: Namespaced
    permissions:
      - apiGroups: [""]
        resources: ["pods"]
        verbs: ["delete", "list", "get"]
    image: litmuschaos/go-runner:latest
    args:
      - -c
      - ./experiments -name pod-delete
    env:
      - name: TOTAL_CHAOS_DURATION
        value: "30"
      - name: CHAOS_INTERVAL
        value: "10"
      - name: FORCE
        value: "false"
```

### ChaosEngine (Run Experiment)

```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: mma-chaos
  namespace: mma
spec:
  appinfo:
    appns: mma
    applabel: app=mma-service
    appkind: deployment
  chaosServiceAccount: litmus-admin
  experiments:
    - name: pod-delete
      spec:
        components:
          env:
            - name: TOTAL_CHAOS_DURATION
              value: "30"
            - name: CHAOS_INTERVAL
              value: "10"
        probe:
          - name: check-endpoint-health
            type: httpProbe
            httpProbe/inputs:
              url: http://mma-service:4000/health
              expectedResponseCode: "200"
            mode: Continuous
            runProperties:
              probeTimeout: 5
              interval: 2
              retry: 3
```

## GameDays

GameDays are structured exercises to test incident response:

```
GameDay Structure:
├── 1. Planning (1-2 weeks before)
│   ├── Define scope and objectives
│   ├── Identify participants
│   └── Prepare runbooks
│
├── 2. Pre-Game (Day before)
│   ├── Verify monitoring
│   ├── Confirm rollback procedures
│   └── Brief participants
│
├── 3. Execution (Game day)
│   ├── Inject failures
│   ├── Observe response
│   ├── Document findings
│   └── Rollback if needed
│
└── 4. Post-Game (Week after)
    ├── Review results
    ├── Update runbooks
    └── Plan improvements
```

## Gartner 2025 Recommendations

| Recommendation | Description |
|----------------|-------------|
| **Test GenAI Integrations** | Use chaos engineering for AI API fallback patterns |
| **Run GameDays** | Evaluate system response to specific outages |
| **Start with Critical Services** | Prioritize based on business impact |
| **Get Baseline Metrics** | Measure before experimenting |

## Best Practices

| Practice | Description |
|----------|-------------|
| **Start Small** | Begin with non-production, expand to prod |
| **Limit Blast Radius** | Target single service, not entire system |
| **Have Kill Switch** | Ability to stop experiment immediately |
| **Monitor Everything** | Watch metrics during experiments |
| **Document Results** | Share learnings across teams |
| **Automate** | Run experiments in CI/CD |

## Integration with CI/CD

```yaml
# .github/workflows/chaos.yml
name: Chaos Testing
on:
  schedule:
    - cron: '0 2 * * 1'  # Weekly Monday 2am

jobs:
  chaos-test:
    runs-on: ubuntu-latest
    steps:
      - name: Setup kubectl
        uses: azure/setup-kubectl@v3

      - name: Run Chaos Experiment
        run: |
          kubectl apply -f chaos-experiment.yaml
          kubectl wait --for=condition=complete chaosengine/mma-chaos -n mma --timeout=300s

      - name: Check Results
        run: |
          RESULT=$(kubectl get chaosresult -n mma -o jsonpath='{.items[0].status.experimentstatus.verdict}')
          if [ "$RESULT" != "Pass" ]; then
            echo "Chaos experiment failed"
            exit 1
          fi
```

## Checklist

- [ ] **Foundation**:
  - [ ] Identify critical services
  - [ ] Define steady-state metrics
  - [ ] Set up monitoring and alerting
  - [ ] Create runbooks for common failures
- [ ] **Tool Selection**:
  - [ ] Evaluate LitmusChaos vs Gremlin
  - [ ] Install and configure chosen tool
  - [ ] Train team on usage
- [ ] **Experiments**:
  - [ ] Start with pod/container failures
  - [ ] Progress to network chaos
  - [ ] Test dependency failures
  - [ ] Verify circuit breakers work
- [ ] **GameDays**:
  - [ ] Schedule quarterly GameDays
  - [ ] Document and share learnings
  - [ ] Update runbooks after each
- [ ] **Automation**:
  - [ ] Integrate with CI/CD
  - [ ] Run experiments in staging regularly
  - [ ] Graduate to production (carefully)
