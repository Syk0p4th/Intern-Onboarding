# Prompt 2 — PII Boundary in Telemetry (AC-06)

**Sent to:** Claude Sonnet  
**Goal:** Ensure the `categoriser.suggested` Application Insights event contains no PII.

---

```
The categoriser.ts currently emits this telemetry event after each categorisation:

  telemetry.trackEvent({
    name: "categoriser.suggested",
    properties: {
      claimId:    input.claimId,
      category:   result.category,
      confidence: result.confidence,
      source:     result.source,
      durationMs: Date.now() - startMs,
    }
  });

The acceptance criterion AC-06 states:

  Given a receipt containing a customer name, address, and credit card last-4
  When the request is processed
  Then the customEvent payload contains no customer name, no address, no card digits.

Questions to answer in code:
1. Is the current implementation safe? Explain why.
2. Should receiptText or any part of the input be included in the event? Why or why not.
3. Confirm the exact allowed property keys: claimId, category, confidence, source, durationMs.

Return updated categoriser.ts with a comment block above trackEvent explaining the PII policy.
```
