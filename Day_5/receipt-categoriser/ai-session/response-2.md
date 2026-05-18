# Response 2 — PII Boundary in Telemetry

## Did it match the spec? ✅ Yes — no deviations.

---

## AI's analysis

The AI correctly identified that the current implementation is already safe because:

1. The event properties contain only `claimId`, `category`, `confidence`, `source`,
   and `durationMs` — none of which carry PII.
2. `receiptText` (which may contain names, addresses, card digits from the OCR output)
   is **deliberately excluded** from the event payload.
3. The `claimId` is a system-generated identifier, not a customer name or account number.

The AI produced this comment block (integrated into categoriser.ts):

```ts
// ── Telemetry — PII-free (AC-06) ──────────────────────────────────────────
//
// ALLOWED in event properties: claimId, category, confidence, source, durationMs
// NEVER include: receiptText, customer name, address, card digits, email, phone
//
// receiptText is OCR output and may contain full names, addresses, and partial
// card numbers. It must NEVER appear in telemetry, logs, or error messages.
```

## Verification

AC-06 tests pass:

```
✓ event properties contain exactly the allowed fields
✓ event properties contain no customer name
✓ event properties contain no card digits
```

## No fixes needed
The AI output was integrated directly without modification.
