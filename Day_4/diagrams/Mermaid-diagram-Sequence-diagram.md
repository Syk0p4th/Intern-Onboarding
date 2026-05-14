sequenceDiagram
  participant U as Employee         
  participant FE as Web app(Employee)
  participant EN as Microsoft Entra
  participant API as Backend API  
  participant DB as Azure SQL
  participant BLOB as Blob Storage
  participant SB as Service Bus
  participant TEAMS as Teams webhook
  participant FEM as Web App(LineManager)
  participant MGR as Line manager (Teams)

  Note Over U,EN:Authentication Process
  U->>FE: Open Application
  FE->>EN: Redirect for Login
  EN->>FE: JWT Token
  FE->>U: Web App(Authenticated)

  Note Over U,SB:Request Submission Process
  U->>FE: Submit request and Attach Files
  FE->>+API: POST Request and Files
  API->>DB: INSERT claim (status=Submitted)
  API->>BLOB: Upload receipts (signed URLs)
  API->>-SB: Publish claim.submitted 
  SB->>FE: 201 Created Succeed

  Note Over SB,MGR: Manager Notification   
  SB-->>TEAMS: Adaptive card to manager
  TEAMS-->>MGR: Notification

  Note Over FE,MGR: Claim Approval / Decline Process
  MGR->>FEM:Review claim
  FEM->>+API: POST /claims/{id}/approve (JWT)
  API->>DB: UPDATE status = Approved
  API->>SB: Publish claim.approved
  SB-->>FE: Approval Notification                   
   
  FEM->>API:POST /claims/{id}/decline (JWT)
  API->>DB: UPDATE status = Declined
  API->>SB: Publish claim.decline
  SB-->>FE: Declined Notification
  API-->>-FEM: 200 OK

Note Over U,SB: (Error Path) failed to upload files
  U->>FE: Submit request and attach Files
  FE->>API: Post Request and Files 
  API->>DB:Insert Claim(status=submitted)
  API->>BLOB: Upload FAILED
  BLOB-->>API: Cannot Reach Blob Storage
  API->>DB:Edit Claim(Status=Failed to upload)
  API->>SB: Publish claim.Failed
  SB-->>FE: 500 Error
