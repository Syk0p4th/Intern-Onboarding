# ADR 0003: Usign Azure SQL for the database for claim management system

## Status
Accepted (date: 2026-05-14)

## Context
The system manages claims submitted by BISTEC employees, reviewed by line managers, audited at every status change, and exported to payroll — every entity is meaningfully related to every other entity
The core data relationships are: Employee → Claim → ClaimStatus (audit trail) → PayrollRecord, with LineManager linked to both Employee and Claim for approval routing
The primary query patterns are cross-entity reports — claims by status, claims by employee, audit history for a given claim, payroll exports joining claims to employee records
We don't yet know the exact volume of claims per month but the system is internal to BISTEC , thousands of records per year, not millions

## Decision
We will use the azure SQL database as the primary data store
Engine: SQL Server 2022 compatibility level, hosted on Azure SQL serverless tier
Schema enforces referential integrity — foreign keys between Employee, Claim, ClaimStatusHistory, and PayrollRecord tables
All approval and status change operations wrapped in transactions — a status update and its audit row are written atomically or not at all
Azure SQL is co-located in the same Azure region as App Service and Blob Storage — no cross-region latency

## Consequences
- Easier
The team writes the queries they already know — joins, aggregates, window functions for audit history ,no new query language or mental model required
Referential integrity is enforced at the database level — an orphaned claim or a missing audit row is caught by the DB, not discovered in production
Transactions make the approval flow safe by default — status update + audit row either both commit or both roll back
Reporting queries (claims by status, payroll export, audit trail) are natural SQL joins — no aggregation pipeline or denormalisation required
Azure SQL integrates natively with Azure Data Studio, Power BI, and Excel — finance team can query directly if needed

- Harder
Schema changes require migrations — adding a new claim type or a new metadata field means a migration file, not just a code change
If a claim type in future needs a genuinely variable structure (e.g. different fields per claim category), storing that in SQL requires either a flexible JSONB column or a schema redesign — not a natural fit
Serverless tier has a cold start (auto-resume latency of ~10–30 seconds after idle period) — first request on Monday morning may be slow; mitigated by a scheduled warm-up ping if needed

- Different
Data integrity guarantees move from application code to the database layer — the DB rejects invalid states, not just the API
Schema is now a first-class artefact versioned in the repository alongside the API code via Prisma migrations

## Alternatives considered
Azure Database for PostgreSQL (Flexible Server) a strong alternative. PostgreSQL is open-source, highly capable, and would give the team a portable engine not tied to Microsoft's SQL Server dialect. Rejected in favour of Azure SQL primarily because the team's existing SQL experience is on SQL Server syntax, Prisma supports both equally well, and Azure SQL's serverless tier offers the auto-pause cost benefit that Flexible Server does not. If the team ever moves away from Azure, this decision should be revisited in favour of PostgreSQL.

Azure Cosmos DB (NoSQL, document model) rejected. Cosmos DB excels when data is naturally document-shaped, query patterns are single-document lookups by partition key, and global distribution or massive write throughput is required. None of these conditions apply here. Our data is strongly relational a claim cannot be meaningfully understood without its employee, manager, status history, and payroll linkage. Modelling this in Cosmos DB would require either duplicating data across documents (denormalisation) or accepting expensive cross-partition queries for every report. The team's NoSQL experience is limited, making the operational risk higher with no compensating benefit.