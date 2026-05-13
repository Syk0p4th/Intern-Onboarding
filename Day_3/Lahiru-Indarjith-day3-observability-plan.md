# BookSwap — Observability Plan

---

## Setup

### Logs — Azure Monitor Logs

- **Retention:** Application Insights dashboard data retains for at least 30 days
   archived to cold storage after 90 days.
- **Schema:** Every log line must contain the following fields:

  | Field | Type | Example |
  |-------|------|---------|
  | timestamp | ISO 8601 datetime | 2026-05-12T14:23:01Z |
  | event | string | auth.failed |
  | requestId | UUID | 550e8400-e29b-41d4-... |
  | durationMs | integer | 142 |
  | severity | string | warning |
  | userId | UUID | ba828041-f5bf-... |

- **Redaction rules:**
  - Member email addresses are hidden before any log is written or displayed.
  - Before any log statement, use only userId (UUID) rather than email or name.
  - JWT payload claims (email, name) are stripped at the middleware
    layer — only (userId) passes through to telemetry.
  - Device push tokens are never logged under any circumstances.
  

---

### Metrics — Azure Application Insights

- **Source:** App Insights SDK auto-collects HTTP requests, dependency calls , and exceptions automatically.

  | Metric name | Emitted when |
  |-------------|--------------|
  | bookswap/listing_created | Successful POST /books → 201 |
  | bookswap/borrow_request_approved | Borrow request status → approved |
  | bookswap/cache_hit_ratio | Every Redis GET in the cache middleware |
  | bookswap/auth_failure | Any auth.failed event |

- **Auto-collected metrics used in alerts:**
  requests/duration, requests/failed, dependencies/duration,
  dependencies/failed, exceptions/count

---

### Traces — Application Insights Distributed Tracing


## SLO Definitions

| SLO | Target | Measurement window |
|-----|--------|--------------------|
| Search availability | Error rate < 1% on GET /books | Rolling 5 min |
| API response time | p95 latency < 2 s on all endpoints | Rolling 10 min |
| Listing creation success | Error rate < 2% on POST /books | Rolling 3 min |
| Auth service availability | Availability ≥ 99% | Rolling 1 min |
| Database connection health | Available connections ≥ 10% of pool | Continuous |

---

## Results Summary

| Metric | Target | Achieved |
|--------|--------|----------|
| SLOs covered by an alert | 100% | 100% |
| Alerts with a clear runbook link | 100% | 100% |
| Dashboards for ops | 1 health, 1 business | 2/2 deployed |

---

## Alert Proposal

| Alert | Condition | Severity | Notification | Runbook |
|-------|-----------|----------|--------------|---------|
| Search SLO burn | Error rate > 1% over 5 min | Sev2 | Pager + Teams | reliability/runbook.md#search |
| Database connection pool exhausted | Available connections < 10% | Sev1 | Pager + Teams | database/runbook.md#connection-pool |
| API response time degradation | p95 latency > 2 s over 10 min | Sev2 | Teams | performance/runbook.md#latency |
| Authentication service failure | Availability < 99% | Sev1 | Pager + Teams | auth/runbook.md#service-health |
| High error rate on book listing | Error rate > 2% over 3 min | Sev3 | Teams | catalog/runbook.md#listing-errors |
| Email digest queue | ActiveMessages > 500 for 5 min | Sev3 | Teams | reliability/runbook.md#queue-depth |


**Severity key:**

| Level | Meaning | 
|-------|---------|
| Sev1 | System down or data loss risk |
| Sev2 | SLO is burning |
| Sev3 | Degraded but not broken |



## What We Are Deliberately NOT Alerting On

1. **Transient network spikes lasting < 1 minute** — monitored via dashboards
   for trend awareness but too short-lived to be actionable. A spike that
   self-resolves before an engineer can open a laptop creates alert fatigue
   without any benefit.

2. **Occasional 4xx errors from client-side issues** — tracked for trends on
   the business health dashboard. A single 404 or 422 is expected user behaviour
   (bad UUID, wrong enum value). We only escalate if the 4xx rate crosses a
   sustained threshold indicating a broken client release.

3. **Cache misses during off-peak hours** — normal behaviour after a deploy or
   Redis restart. We alert only on a sustained hit ratio drop (< 60% over
   10 minutes), which indicates a structural problem rather than normal warm-up.

---

