# BookSwap — SLI/SLO Map

## 1. NFR inventory
| # | NFR (from Day 2) | User-visible behaviour |
|---|------------------|------------------------|
| 1 | Catalogue search response time under 300 ms for p95 when querying a catalogue of 5,000 books | When a user browses the catalog, the catalogue should load quickly |
| 2 | Listing creation continues to work even when email services are down | The listing is created successfully, even if the confirmation email is delayed |
| 3 | Support photo uploads up to 5 MB in JPEG/PNG format | Users can upload and view photos up to 5 MB without failures |
| 4 | In-app notifications are delivered within 2 seconds | After a significant action, users receive confirmation notifications within 2 seconds |
| 5 | Addresses and phone numbers are never returned in API responses | Sensitive contact details are omitted from API responses to protect user privacy |


## 2. SLI / SLO table
| # | SLI definition | Measurement source | SLO target | Window | Error budget |
|---|----------------|---------------------|------------|--------|--------------|
| 1 | p95 catalogue search response time for queries against a 5,000-book index | Application performance monitoring of search API latency | p95 < 300 ms | 30 days | 0.5% of requests |
| 2 | Successful listing creation when email delivery subsystem is unavailable | Backend service logs / transaction success events | 99.5% of listing creations succeed despite email outage | 30 days | 0.5% of listing creation attempts |
| 3 | Successful upload or download of 5 MB JPEG/PNG photos | File upload/download service metrics and error rates | 99.9% success rate for photo uploads/downloads ≤ 5 MB | 30 days | 0.1% of photo transfer attempts |
| 4 | Delivery time for in-app notification events after user actions | Notification service delivery time monitoring | 95% of notifications delivered within 2 seconds | 30 days | 5% of notifications |
| 5 | API responses omit addresses and phone numbers for user/member data | API response validation tests and production response audits | 100% of relevant API responses contain no address or phone fields | 30 days | 0% of audited responses |


## 3. Error budget policy
- What the team stops doing when the budget is exhausted
The error budget makes the teams priorities visible to everyone including the businesses. So if the budget is exhausted, The team should stop shipping new features and start to focus on system reliability. And taking this decision is teams everyones collective responsibility rather than a individual call.


## 4. Out of budget right now
- Listing creation resilience would be hardest to meet right now because the notification and email systems are tightly coupled without a robust message queue, so email service downtime cascades to listing failures.
