# ADR 000X: Using Azure Blob storage with receipt storage with microsoft defender as the virus scanning tool.

## Status
Accepted (date: 2026-05-14)

## Context
BISTEC employees upload receipt photos and documents (JPEG, PNG, PDF) as attachments to claims
These files are submitted by end users over the internet — they are untrusted input and must be treated as a potential malware vector
The API needs somewhere to durably store these files and a way to ensure a malicious file never reaches a state where another user or the finance team can download it
Three concerns need resolving together: where files are stored, how they are scanned, and what happens to a file between upload and scan completion — this window is called the quarantine gap
The team has no prior experience designing a file upload pipeline with virus scanning
We are already on Azure, Azure Blob Storage and Microsoft Defender for Storage are both native services in the same ecosystem

## Decision
We will store receipt files in Azure Blob Storage and scan them using Microsoft Defender for Storage, with a two-container quarantine pattern to close the gap between upload and scan completion
Two containers in the same Storage Account: receipts-quarantine (private) and receipts-clean (private)
All uploads land in receipts-quarantine first — inaccessible to any user or downstream process
Files are only moved to receipts-clean after Defender confirms they are clean
Microsoft Defender for Storage enabled on the Storage Account — scans every blob on write automatically, no code required in the API
Defender emits a Microsoft.Security.MalwareScanningResult Event Grid event on scan completion

## Consequences
- Easier
Defender for Storage scans every blob automatically — no scanning code to write or maintain in the Node.js API
The two-container pattern means a malicious file is physically isolated from the moment of upload — it never reaches a container that clean files or users touch
Managed identity means the API and the Azure Function authenticate to Blob Storage without any connection strings or SAS tokens stored in code
File type and size validation at the API layer catches the obvious bad inputs before they consume Blob Storage write operations

- Harder
The upload flow is now asynchronous — the employee submits a claim and waits for the receipt to clear scanning before the claim is fully active; the UI must handle and communicate this intermediate state clearly
The Azure Function adds a new deployable unit to the system — it must be monitored, versioned, and included in the CI/CD pipeline
Microsoft Defender for Storage has a per-GB cost on top of standard Blob Storage pricing — needs to be included in the infrastructure budget

- Different
Receipt files are never directly accessible via a URL until they have passed a scan — the system treats all uploaded files as untrusted by default, not trusted by default
The claim lifecycle now has an explicit Pending state that did not exist before designing this pipeline — the sequence diagram and component diagram should reflect this

## Alternatives considered
ClamAV running inside the Node.js API process — rejected. Running an antivirus engine inside the application process couples the scanning concern tightly to the API, consumes significant memory and CPU on the App Service instance, and requires the team to maintain ClamAV signature updates as part of the application deployment. Defender for Storage offloads all of this to a managed Azure service with no operational overhead.

Azure Blob Storage without any virus scanning — rejected outright. User-uploaded files are untrusted input. A malicious file that passes through the system and is downloaded by a finance employee or line manager is a serious security incident. Scanning is non-negotiable for any system accepting file uploads from end users.