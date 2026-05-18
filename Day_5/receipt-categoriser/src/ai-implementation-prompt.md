# AI Implementation Prompt

Prompt sent verbatim to the AI to generate the initial implementation.

---

```
I need you to implement a receipt categoriser in TypeScript following this spec exactly.

## Input (ReceiptInput)
{
  claimId:       string          // claim identifier
  mimeType:      string          // must be "image/jpeg" or "image/png"
  fileSizeBytes: number          // must be <= 5 MB (5,242,880 bytes)
  receiptText:   string          // OCR output of the receipt image
}

## Output (on success — 200)
{
  category:    "Meals" | "Travel" | "Lodging" | "Office supplies" | "Other"
  confidence:  float 0.0–1.0
  source:      "llm" | "rule-based"
  needsReview: boolean   // true when confidence < 0.6
}

## Errors
400 — mimeType is not image/jpeg or image/png
413 — fileSizeBytes > 5 MB
502 — both LLM and rule-based failed

## Architecture rules
- rule-based-categoriser.ts: pure function, zero network calls
- llm-categoriser.ts: ONLY module that calls the LLM; throws on non-2xx
- categoriser.ts: validates input → tries LLM → falls back to rule-based on any error
  Also emits a PII-free "categoriser.suggested" telemetry event via an injected TelemetrySink.

## Acceptance criteria
AC-01: clear receipt → 200, category=Meals, confidence>=0.7, source=llm, needsReview=false
AC-02: ambiguous receipt → 200, needsReview=true, confidence<0.6
AC-03: LLM 503 → 200, source=rule-based, confidence<=0.5
AC-04: OCR failure → 200 source=rule-based OR 502; never unhandled 500
AC-05: file > 5 MB → 413; file = 5 MB exactly → 200
AC-06: telemetry event contains claimId/category/confidence/source/durationMs only — no PII

Produce: rule-based-categoriser.ts, llm-categoriser.ts, categoriser.ts
```
