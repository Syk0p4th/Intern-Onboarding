# Receipt Categoriser — Acceptance Criteria

## AC-01 happy path: clear meal receipt
**Given** a receipt image of a restaurant bill totalling LKR 2,400
**When** the claimant uploads it via POST /claims/{id}/receipts/categorise
**Then** the response is 200 OK with `{ "category": "Meals", "confidence": >= 0.7, "source": "llm" }`
**And** an Application Insights customEvent `categoriser.suggested` is emitted within 5 seconds

## AC-02 ambiguous receipt
**Given** a receipt with mixed items (food + stationery)
**When** The claimant uploads it via POST /claims/{id}/receipts/categorise
**Then** the response is 200 OK and needReview is "true" And a category field is still present so the UI can pre-fill the dropdown for the claimant to confirm or override

## AC-03 LLM unavailable — fallback
**Given** Azure OpenAI is returning 503
**When** the claimant uploads a receipt
**Then** the response is 200 OK with `source: "rule-based"` and confidence <= 0.5 And no 502 is surfaced to the caller the degraded-mode response is transparent to the client

## AC-04 OCR failure
**Given** an image that Document Intelligence cannot parse
**When**  the claimant submits it via POST /claims/{id}/receipts/categorise
**Then** the response is 502 Bad Gateway with body { "error": "OCR_FAILURE", "message": "Upstream document parsing failed. Please resubmit a clearer image." } And the response is returned within 5 seconds

## AC-05 oversized payload
**Given** a receipt image exceeding 10 MB (e.g. a 14 MB high-resolution scan)
**When** the claimant submits it via POST /claims/{id}/receipts/categorise
**Then** the response is 413 Request Entity Too Large with body { "error": "FILE_TOO_LARGE", "maxBytes": 10485760 }
And no OCR or LLM call is made (the rejection happens at the API gateway / input-validation layer before any upstream call)
And no Application Insights event is emitted for the rejected request

## AC-06 PII boundary
**Given**  a receipt image containing a customer name, a partial credit card number (last 4 digits), and a mailing address
**When** the request is processed and returns 200 OK
**Then** the Application Insights customEvent payload contains only the fields: claimId, category, confidence, source, needsReview, latencyMs
And none of the following appear anywhere in the event payload or in any application log entry: full or partial card number, customer name, mailing address, or raw OCR text
And the receipt image binary is not persisted to any storage account, cache, or log sink beyond the duration of the HTTP requester


