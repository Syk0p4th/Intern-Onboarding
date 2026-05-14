# ADR 0002: Hosting platform for the Claim management System

## Status
Accepted (date: 2026-05-14)

## Context
The Backend is a Node.js 20 REST API needs to be hosted on Azure app services (Already commited to Azure SQL, Blob Storage, Microsoft Entra)
We need HTTPS, Custom domains, Managed TLS and auto-scaling out of the box
The application is a single backend API — not a collection of microservices that need independent scaling
We don't yet know the peak load profile; traffic is expected to be low-to-moderate initially (internal claims tool for BISTEC employees)
The two hosting candidates evaluated were Azure App Service and Azure Container Apps

## Decision
We will host the Backend on Azure app service
Runtime Node.js 22 LTS on linux app service plan
Github actions CI/CD pipeline deploying directly to app service via Azure
Managed identity enabled on the App Service instance to authenticate to Azure SQL and Blob Storage without storing credentials 
This decision is revisited if a second independently deployable service is introduced

## Consequences
- Easier
Deployment is straightforward, Push it to the main, Github actions deploy it automatically. No container needed
Managed TLS, custom domain binding, and environment variable management are all first-class features with no extra setup
Integrates natively with Azure Monitor, Application Insights, and Log Stream out of the box
Managed identity means no secrets in environment variables for Azure service connections

- Harder
Local development environment differs from production — developers run Node directly, not in a container, so environment-specific bugs are harder to rule out
App Service Plan costs are fixed per month regardless of actual usage — no scale-to-zero for off-hours periods

- Different
Infrastructure is managed via Azure Portal and Bicep rather than Dockerfiles and container manifests
Deployments are code-push-based rather than image-push-based

## Alternatives considered
Azure Functions (Consumption plan) — rejected. The API has long-running operations (CSV import, file uploads to Blob Storage) and a persistent HTTP server model. Functions execution time limits and cold starts make it a poor fit for this request/response profile.

Azure Container Apps — rejected for this phase. Container Apps is the right choice when you have multiple independently scaling services, need scale-to-zero on idle, or want environment parity via Docker. Our notification concern does not meet the bar for a separate service — it is a module, not a microservice. The team's basic Docker knowledge means introducing a container registry, image pipeline, and Container Apps environment adds operational risk without a proportional benefit at this system size. This decision should be revisited explicitly if a second service with an independent scaling or deployment requirement is introduced.