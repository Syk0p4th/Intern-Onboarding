# GreenChit — Trade-offs and Design Review

## Setup
Option A — Monolith on Azure App Service: Single Node.js application containing all concerns (API, notification logic, payroll import, file handling) deployed directly to App Service without containerisation

Option B — Containerised App Service: Same single Node.js application but packaged as a Docker container, pushed to Azure Container Registry, and deployed to App Service 

## Quality Attributes weighted by the team/business
| Quality Attribute | weight | Rationale |
|--------|--------|----------|
| Security | High | User-uploaded files, JWT auth, sensitive payroll data — a breach has real business consequences |
| Reliability | High | Claims affect employee pay — downtime or data loss is unacceptable |
| Maintainability | High | Small team, long-lived system — code and infrastructure must be easy to understand and change |
| Cost | Medium | Internal tool, limited budget — unnecessary infrastructure spend is waste |
| Scalability | Low | Internal BISTEC tool, hundreds of claims per month — not a high-scale system today | 
| Time to deploy | Medium | Team needs to ship quickly — excessive pipeline complexity slows delivery |


## Results Summary
| Metric | Target | Achieved |
|--------|--------|----------|
| Quality attributes scored | 6 | 6 |
| Cells with a written justification | 12 | 12 |
| Decision-affecting attributes identified | 2-3 | 2 |

## Decision and rationale
| Quality Attribute | Option A - Monolith Application | Option B - App Service Container | Justification |
|-------------------|----------------------------------|----------------------------------|---------------|
| Time to deploy | 5 | 3 | Option A wins clearly — App Service deploy is 3 lines of GitHub Actions YAML, no Dockerfile or container registry needed. Option B requires ACR setup, image build pipeline, and tagging strategy — 3–5 hours of additional setup minimum. |
| Cost | 5 | 2 | Option A has no registry cost. Option B adds Azure Container Registry (~$5–10/month) plus longer CI pipeline runs increasing GitHub Actions minutes consumed. Small individually but unnecessary at this stage. |
| Operability for 10-person team | 4 | 3 | Option A is simpler to operate — logs, restarts, and env vars are all first-class App Service features. Option B adds image management and registry operations the team must learn. Gap narrows as Docker familiarity grows. |
| Independent deploy | 1 | 5 | Option B wins clearly — containers give each service a versioned, independently deployable image. Option A is a single deployable unit; adding a second service means either coupling deployments or splitting the codebase entirely. |
| Future scaling | 2 | 5 | Option B unlocks Container Apps migration with KEDA-driven scale-to-zero and per-service autoscaling. Option A scales only horizontally as a whole — no per-concern scaling, no scale-to-zero. |
| Authn/authz consistency | 3 | 3 | Option A keeps auth middleware in one process — Entra token validation is applied uniformly with no inter-service trust decisions. Option B introduces potential for inconsistent auth if services are split — each container must independently validate tokens. |
| Total | 20 | 21 |

The Scores tells us that neither option dominates since the gap is so close.

While option A wins time-to-deploy, Cost, and auth consistancy. All operational and short term concerns 
And Option B wins on independent deploy and future scalability both are long term architectural concerns that don't matter today but will matter when the system grows


## Design review feedback (received from another pair)
- 3 strengths
- 3 weaknesses or risks
- 2 actionable improvements

## Design review feedback (given to another pair)
- 3 strengths
- 3 weaknesses or risks
- 2 actionable improvements