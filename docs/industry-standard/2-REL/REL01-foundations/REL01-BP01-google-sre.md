# Google Site Reliability Engineering (SRE)

## References

- [Google SRE Book](https://sre.google/sre-book/table-of-contents/)
- [Google SRE Workbook](https://sre.google/workbook/table-of-contents/)
- [The Evolution of SRE at Google (2024)](https://www.usenix.org/publications/loginonline/evolution-sre-google) - STAMP Framework
- [Google SRE Lessons - 20 Years](https://sre.google/resources/practices-and-processes/twenty-years-of-sre-lessons-learned/)
- [AWS Reliability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/)
- [Microsoft Azure Reliability](https://learn.microsoft.com/en-us/azure/reliability/)
- [Netflix Chaos Engineering](https://netflixtechblog.com/tagged/chaos-engineering)
- [SRE Report 2025](https://www.catchpoint.com/learn/sre-report-2025)

## Date

2003 (Google SRE founded by Ben Treynor) | 2016 (SRE Book) | **2024 (STAMP Framework adoption)** | Cập nhật: November 2025

## Tổng quan

Phương pháp engineering để xây dựng và vận hành hệ thống production có độ tin cậy cao. Google đã tiến hóa SRE với STAMP framework để đối phó với hệ thống ngày càng phức tạp (bao gồm AI).

## Khái niệm cốt lõi

| Khái niệm | Định nghĩa | Ví dụ |
|-----------|------------|-------|
| **SLI** (Service Level Indicator) | Metric đo lường service | Latency p99, Error rate |
| **SLO** (Service Level Objective) | Mục tiêu cho SLI | Latency p99 < 200ms |
| **SLA** (Service Level Agreement) | Cam kết với customer | 99.9% uptime |
| **Error Budget** | 100% - SLO | 0.1% = ~43 phút/tháng |

## Nguyên tắc SRE

| Nguyên tắc | Mô tả |
|------------|-------|
| **Embrace Risk** | Chấp nhận failure, dùng error budget |
| **Eliminate Toil** | Tự động hóa repetitive work |
| **Monitoring** | Alerting based on SLOs |
| **Simplicity** | Simple systems are reliable systems |
| **50% Rule** | 50% ops, 50% engineering |

## Error Budget

```
SLO: 99.9% availability
Error Budget: 0.1% = 43.2 phút downtime/tháng

Nếu đã dùng hết error budget → freeze releases
Nếu còn error budget → có thể ship features mới
```

## Monitoring Pyramid

```
        /\
       /  \  Alerting (pages)
      /----\
     /      \  Dashboards (visibility)
    /--------\
   /          \  Logs (debugging)
  /------------\
 /              \  Metrics (trends)
/----------------\
```

## STAMP Framework (2024 - MỚI)

Google SRE đã áp dụng **STAMP** (Systems-Theoretic Accident Model and Processes) - framework từ MIT dựa trên control theory để anticipate failures thay vì chỉ react.

### Tại sao STAMP?
- Hệ thống ngày càng phức tạp (AI, distributed systems)
- Cần phát hiện hazards TRƯỚC KHI chúng thành incidents
- Reactive approach không đủ cho scale của Google

### STPA (System-Theoretic Process Analysis)
```
1. Define purpose và losses cần tránh
2. Model control structure của system
3. Identify Unsafe Control Actions (UCAs)
4. Identify Loss Scenarios
5. Determine mitigations
```

### Benefits:
- Phát hiện hazardous states trước khi incidents xảy ra
- Hiểu system ở mức holistic thay vì component-by-component
- Better insight vào system conditions

### Kết quả tại Google:
- Platform engineering teams với SRE practices: **50% ít downtime**
- **40% tăng system reliability**

## AI trong SRE (2024-2025)

| Trend | Impact |
|-------|--------|
| Predictive Analytics | Anticipate issues trước khi ảnh hưởng |
| AI-driven Security | Enhanced threat detection |
| Automated Remediation | Giảm MTTR |
| Toil Reduction | Đang đánh giá effectiveness |

## Checklist (Updated 2025)

- [ ] Định nghĩa SLIs cho các endpoints quan trọng
- [ ] Set SLOs phù hợp với business requirements
- [ ] Implement health check endpoints
- [ ] Alerting based on error budget burn rate
- [ ] Runbooks cho common incidents
- [ ] Postmortem culture (blameless)
- [ ] **STAMP/STPA (2024)**:
  - [ ] Identify control structures
  - [ ] Document Unsafe Control Actions
  - [ ] Proactive hazard analysis
- [ ] **AI Integration**:
  - [ ] Evaluate AI-assisted monitoring
  - [ ] Consider predictive analytics cho capacity
