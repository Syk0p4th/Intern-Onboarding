# BookSwap — Reliability Runbook v0.1

## Failure 1: Azure SQL primary unavailable for 5 minutes
### What the user sees
Listings creation won't be completed and returns a 5xx error and request from database like owner details and borrower details won't load and lead to time out 
### Detection
Azure Monitor alerts on SQL connection failures, increased error rates in application logs, and database health metrics showing primary replica unavailability. Automated alerts trigger when connection pool exhaustion exceeds 80% or response times spike above 5 seconds.
### Mitigation in design (timeouts, retries, circuit breaker, fallback)
The error when trying reach database is 5xx error automatically it detect as a trancient error and retries with idempotency keys and time intervals in between after 5 tries it should lead to timeout error and the retries are safer to maintain same request with altering. After that the fallback mechanism should prompt the user to try again in few minutes
### Manual response (who is paged, what they do)
On-call engineer is the person responsible for being called when a critical service is down. They check Azure Portal for SQL health and verify the automatic failsafes are working, and if not, manually initiate the mitigation plan. If issue persists, escalate to Azure support and notify the team.
### Post-incident actions
After this incident happend as a team they should hold an incident review discuss what went wrong and learn from the failure. In the meeting they have to analyze the root cause for this problem and update the reliability measures if needed. Also if the team couldn't find the problem until it was too late the observability needs to be improved using dashboards and alerts for future references. 


## Failure 2: Azure Cache for Redis is down
### What the user sees
The search catalogue and the individual book details takes longer to load and sometimes even timeouts as well
### Detection
Azure moniter should indicate the SQL database getting unusual amount of requests and The cache memory logs should indicate the errors or conflicts they are having. Automated alerts trigger when read ratio becomes higher than a certain threshold or the response time spikes more that 3 seconds for each read request 
### Mitigation in design
Fallback to direct database queries with increased timeouts up to 10 seconds, circuit breaker to prevent further failures, and read-through caching disabled during outage. Application retries cache misses with exponential backoff before falling back to slower database queries .
### Manual response
On-call engineer is called . They check Azure Cache for Redis health in the portal, restart the cache instance if possible, or clear the cache if needed. If data loss is suspected, coordinate with team to rebuild cache from database. Notify users via in-app banner about potential delays.
### Post-incident actions
Review cache configuration and scaling policies, implement better monitoring for cache hit rates, and consider multi cache replication to improve resilience.


## Failure 3: Sunday tabloid spike — 10× sustained traffic
### What the user sees
Users experience slow page loads, timeouts on searches and listings, and occasional 5xx errors due to overwhelmed servers. and photo uploads may fail occationally.
### Detection
Azure Monitor alerts on resources like CPU usage exceeding 80%, request queue depth over 100, and response times above 5 seconds. Automated scaling triggers when traffic exceeds baseline by 5x than usual expected, with manual alerts for much higher spikes.
### Mitigation in design (autoscale, queue depth, throttling)
Auto-scaling enabled for App Service and database tiers, with queue depth monitoring to shed non-critical requests. Rate limiting on API endpoints (e.g., 100 requests/second per user), and CDN caching for static assets to reduce backend load.
### Manual response
On-call engineer is called. They monitor auto-scaling progress, manually increase instance counts if needed, and enable emergency throttling. Communicate status to users via status page and in-app notifications, prioritizing critical features like search over non-essentials.
### Post-incident actions
Analyze traffic patterns to adjust auto-scaling thresholds, implement predictive scaling based on past data, and review scaling policies to balance user experience with system stability.