# ADR 0001: Distributed Expense Claim Management System Architecture

## Status
Accepted (date: 2026-05-14)

## Context
We need to build a scalable, secure expense claim management system that handles:
- Employee authentication and authorization
- Request submission with file attachments
- Real-time manager notifications and approvals
- Asynchronous processing and event-driven workflows
- File storage and management
- Error handling and recovery paths

### Key Constraints:
- Authentication must integrate with Microsoft Entra
- System must handle file uploads securely with signed URLs
- Manager notifications should be delivered via Microsoft Teams
- Multiple concurrent users with different roles (Employee, Line Manager)
- Need to handle failure scenarios

### Forces at Play:
- Need for real-time notifications without tight coupling
- Separation of concerns between web application and backend API
- Secure file handling and storage
- Scalability for enterprise environments
- Asynchronous processing for long-running operations

## Decision
We have adopted a **distributed, event-driven microservices architecture** with the following components:

### 1. **Authentication Layer** (Microsoft Entra Integration)
- Employees authenticate via Azure Entra ID
- Web app receives JWT tokens for API authorization
- Stateless authentication using JWTs

### 2. **Frontend Layer** (Dual Web Applications)
- **Employee Web App**: Allows employees to submit expense claims and attach files
- **Line Manager Web App**: Allows managers to review, approve, or decline claims

### 3. **Backend API**
- RESTful API handling all business logic
- Endpoints for claim submission, approval, and decline operations
- JWT-based request validation and authorization

### 4. **Data Persistence**
- **Azure SQL Database**: Stores claim metadata and status (Submitted, Approved, Declined, Failed)
- **Azure Blob Storage**: Stores file attachments using signed URLs for secure access

### 5. **Event-Driven Communication**
- **Azure Service Bus**: Publishes domain events (claim.submitted, claim.approved, claim.declined, claim.failed)
- Decouples components and enables asynchronous processing

### 6. **Manager Notification System**
- **Teams Webhook Integration**: Service Bus publishes adaptive cards to Microsoft Teams
- Line manager receives notifications without polling

## Consequences

### Positive Outcomes:
- **Scalability**: Event-driven architecture allows independent scaling of components
- **Loose Coupling**: Service Bus decouples the submission process from notifications
- **Security**: JWT-based authentication with Entra ID, signed URLs for file access
- **Real-time Communication**: Immediate manager notifications via Teams
- **Resilience**: Error handling path allows graceful degradation (e.g., blob upload failures)
- **Auditability**: All operations logged in SQL database with status tracking

### Challenges:
- **Complexity**: Multiple moving parts require careful orchestration and monitoring
- **Operational Overhead**: Need to manage Azure services (SQL, Blob, Service Bus, Teams)
- **Data Consistency**: Eventual consistency model due to event-driven nature
- **Error Recovery**: Failed file uploads require database updates and error notifications
- **Cost**: Multiple Azure services increase infrastructure costs

## Sequence Flow Overview
The system follows this sequence:

1. **Authentication**: Employee authenticates via Microsoft Entra
2. **Submission**: Employee submits claim with files through web app → API
3. **Storage**: API stores claim in SQL DB and files in Blob Storage
4. **Publication**: API publishes `claim.submitted` event to Service Bus
5. **Notification**: Service Bus delivers Teams notification to Line Manager
6. **Approval/Decline**: Manager reviews in Teams and approves/declines through web app
7. **Status Update**: API updates DB status and publishes corresponding event
8. **Error Handling**: If Blob Storage is unavailable, claim status is set to "Failed to upload"

## Alternatives Considered

### Alternative A: Monolithic Architecture
- **Why Rejected**: Would create bottlenecks during high load, tight coupling between components, difficult to scale individual features, harder to maintain and deploy

### Alternative B: Synchronous HTTP-only Communication
- **Why Rejected**: Manager notifications would require polling, tight coupling between services, service failures would cascade, poor user experience for real-time updates

### Alternative C: Event Sourcing with In-Memory Cache
- **Why Rejected**: Added complexity without proportional benefits for current use case, higher memory requirements, harder to reason about state changes

### Alternative D: Direct File Upload to Frontend
- **Why Rejected**: Security vulnerability, no server-side validation, client-side file size limits, poor user experience with large files