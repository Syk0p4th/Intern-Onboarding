# Receipt Categoriser — Acceptance Criteria

Six criteria must all pass before the feature ships.
Each criterion is observable from outside the code (HTTP response / event payload).

---

## AC-01 — Happy path: clear receipt

**Given** a valid jpeg receipt image of 2.4 MB with clearly identifiable meal items
(e.g. restaurant bill totalling LKR 2,400)
**And** the claim exists in the system with `claimId = 1472648sfg`

**When** the claimant sends `POST /claims/1472648sfg/receipts/categorise` with the image

**Then** the response is `200 OK` with body:
```json
{
  "category":    "Meals",
  "confidence":  <number >= 0.7>,
  "source":      "llm",
  "needsReview": false
}
```
**And** a `categoriser.suggested` customEvent is emitted to Application Insights
within **5 seconds** of the request being received

---

## AC-02 — Ambiguous receipt

**Given** a receipt image (png, 1.2 MB) containing a mix of food items and stationery
(confidence expected to be low)

**When** the claimant sends `POST /claims/{id}/receipts/categorise`

**Then** the response is `200 OK`
**And** the body contains `"needsReview": true`
**And** `confidence` is a float in [0.0, 1.0]
**And** `category` is one of the five canonical values
**And** `confidence < 0.6` (the value that triggered the review flag)

---

## AC-03 — LLM unavailable: rule-based fallback

**Given** Azure OpenAI is returning HTTP 503

**When** the claimant uploads a valid jpeg receipt (≤ 5 MB)

**Then** the response is `200 OK` with:
```json
{
  "source":      "rule-based",
  "confidence":  <number <= 0.5>,
  "category":    <one of the five canonical values>,
  "needsReview": true
}
```
**And** no error is surfaced to the claimant

---

## AC-04 — OCR failure / unreadable image

**Given** an image file that Azure AI Document Intelligence cannot parse
(e.g. a completely black image or corrupt jpeg)

**When** the claimant sends `POST /claims/{id}/receipts/categorise`

**Then** the response is `200 OK` with `"source": "rule-based"` and `"category": "Other"`
**Or** the response is `502 Bad Gateway` if both OCR and rule-based fail
**And** the body is never an unhandled 500 with a stack trace

---

## AC-05 — Oversized payload

**Given** a jpeg image of 13 MB (exceeds the 5 MB limit)

**When** the claimant sends `POST /claims/{id}/receipts/categorise`

**Then** the response is `413 Request Entity Too Large` with body:
```json
{ "error": "File too large", "maxSize": "5MB" }
```
**And** a file of exactly 5 MB (boundary) is **accepted** with `200 OK`
**And** a file of 5.1 MB is **rejected** with `413`

---

## AC-06 — PII boundary

**Given** a receipt that contains a customer name, address, and the last 4 digits
of a credit card number

**When** the request is processed and the `categoriser.suggested` event is emitted

**Then** the Application Insights customEvent payload:
- contains **no customer name or address**
- contains **no full or partial card number** (not even last-4)
- contains only: `claimId`, `category`, `confidence`, `source`, `durationMs`

---

## Summary table

| ID | Criterion | Observable signal |
|----|-----------|-------------------|
| AC-01 | Happy path — high-confidence meal receipt | HTTP 200, category=Meals, confidence≥0.7, source=llm, AI event ≤5 s |
| AC-02 | Ambiguous receipt flags needsReview | HTTP 200, needsReview=true, confidence<0.6 |
| AC-03 | LLM 503 → rule-based fallback | HTTP 200, source=rule-based, confidence≤0.5 |
| AC-04 | OCR failure → graceful degradation | HTTP 200 with Other/rule-based, or 502; never 500 stack trace |
| AC-05 | Oversized file → 413 at >5 MB boundary | HTTP 413 for 13 MB; HTTP 200 for 5 MB exact |
| AC-06 | PII stripped from telemetry event | AI event payload contains no name/address/card digits |
