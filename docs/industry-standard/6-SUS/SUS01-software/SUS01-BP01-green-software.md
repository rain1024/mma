# Green Software Engineering

## References

- [Green Software Foundation](https://greensoftware.foundation/)
- [ISO/IEC 21031:2024 - Software Carbon Intensity](https://www.iso.org/standard/86612.html) - **International Standard**
- [Carbon Aware SDK](https://github.com/Green-Software-Foundation/carbon-aware-sdk) - v1.4.0 (2024)
- [SCI Specification](https://sci.greensoftware.foundation/)
- [AWS Sustainability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/sustainability-pillar/)
- [Green Software Patterns](https://patterns.greensoftware.foundation/)
- [Principles of Green Software](https://learn.greensoftware.foundation/)

## Date

2021 (Green Software Foundation) | **March 2024 (ISO/IEC 21031:2024)** | Cập nhật: November 2025

## Tổng quan

Xây dựng phần mềm với carbon footprint thấp nhất có thể. **ISO/IEC 21031:2024** đã chuẩn hóa Software Carbon Intensity (SCI) thành international standard.

## ISO/IEC 21031:2024 - Software Carbon Intensity (SCI)

### SCI Formula

```
SCI = ((E × I) + M) per R

Where:
E = Energy consumed by software (kWh)
I = Carbon intensity of electricity (gCO2e/kWh)
M = Embodied carbon of hardware (gCO2e)
R = Functional unit (e.g., per user, per request, per minute)
```

### Key Characteristics

| Aspect | Description |
|--------|-------------|
| **Rate-based** | Carbon per functional unit (not total emissions) |
| **Comparable** | Allows comparison between software systems |
| **Actionable** | Guides optimization decisions |
| **Standardized** | ISO international standard |

## Three Pillars of Green Software

| Pillar | Description | Actions |
|--------|-------------|---------|
| **Energy Efficiency** | Use less energy | Optimize code, reduce compute |
| **Hardware Efficiency** | Use fewer physical resources | Extend hardware lifecycle |
| **Carbon Awareness** | Use energy more intelligently | Run when grid is clean |

## Carbon Aware SDK

The Carbon Aware SDK enables carbon-aware applications that do more when electricity comes from clean sources.

### Use Cases

```typescript
// Get carbon intensity for a location
const intensity = await carbonAwareApi.getCurrentIntensity('eastus');

// Get optimal time to run workload
const optimalWindow = await carbonAwareApi.getOptimalWindow({
  location: 'eastus',
  windowSize: '1h',
  dataStartAt: new Date(),
  dataEndAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
});

// Schedule workload during low-carbon period
if (intensity.value < threshold) {
  await runBatchJob();
}
```

### Real-World Results (2024)

| Organization | Implementation | Result |
|--------------|----------------|--------|
| Autostrade | 60 applications optimized | 15.1% CO2 saved per app |
| University of Michigan | Carbon-aware DNN training | 24% reduction in emissions |
| NTT DATA Japan | Carbon-aware K8s scheduler | Lowest carbon footprint locations |

## Green Software Patterns

### Code Optimization

```typescript
// BAD: Fetch all data
const allAthletes = await db.query('SELECT * FROM athletes');
const filtered = allAthletes.filter(a => a.tournament === 'ufc');

// GOOD: Fetch only needed data
const athletes = await db.query(
  'SELECT id, name, division FROM athletes WHERE tournament = ?',
  ['ufc']
);
```

### Efficient Queries

```typescript
// BAD: N+1 queries
for (const event of events) {
  event.matches = await db.query('SELECT * FROM matches WHERE event_id = ?', [event.id]);
}

// GOOD: Single query with join
const eventsWithMatches = await db.query(`
  SELECT e.*, m.*
  FROM events e
  LEFT JOIN matches m ON e.id = m.event_id
`);
```

### Response Optimization

```typescript
import compression from 'compression';

// Enable compression
app.use(compression({
  level: 6, // Balance compression ratio vs CPU
  threshold: 1024, // Only compress > 1KB
}));

// Efficient pagination
app.get('/api/athletes', (req, res) => {
  const { limit = 20, offset = 0 } = req.query;
  const athletes = await db.query(
    'SELECT * FROM athletes LIMIT ? OFFSET ?',
    [limit, offset]
  );
  res.json({ data: athletes, meta: { limit, offset } });
});
```

## AWS Region Carbon Intensity

| Region | Carbon Intensity | Energy Source |
|--------|------------------|---------------|
| eu-north-1 (Stockholm) | Very Low | Hydro, Wind |
| eu-west-1 (Ireland) | Low | Wind |
| ca-central-1 (Canada) | Low | Hydro |
| us-west-2 (Oregon) | Low | Hydro |
| us-east-1 (N. Virginia) | Medium | Mixed |
| ap-southeast-1 (Singapore) | Higher | Mixed |

## Measurement Tools

| Tool | Purpose | Provider |
|------|---------|----------|
| **AWS Carbon Footprint Tool** | AWS emissions dashboard | AWS |
| **Azure Emissions Impact Dashboard** | Azure carbon metrics | Microsoft |
| **Google Carbon Footprint** | GCP emissions | Google |
| **Website Carbon Calculator** | Website carbon estimate | websitecarbon.com |
| **Ecograder** | Website sustainability | ecograder.com |

## Checklist

- [ ] **Measurement**:
  - [ ] Calculate SCI for key services
  - [ ] Monitor energy consumption
  - [ ] Track carbon footprint over time
- [ ] **Code Efficiency**:
  - [ ] Optimize database queries
  - [ ] Implement response compression
  - [ ] Lazy load images và assets
  - [ ] Remove unused code/dependencies
- [ ] **Infrastructure**:
  - [ ] Choose low-carbon regions khi có thể
  - [ ] Right-size resources (giảm idle)
  - [ ] Auto-scaling to match demand
- [ ] **Carbon Awareness**:
  - [ ] Consider Carbon Aware SDK for batch jobs
  - [ ] Schedule non-urgent workloads for low-carbon times
  - [ ] Monitor grid carbon intensity
- [ ] **Reporting**:
  - [ ] Use cloud provider carbon tools
  - [ ] Include in sustainability reports
  - [ ] Set reduction targets
