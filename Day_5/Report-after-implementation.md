Deviation 1 — added undocumented tags field
The AI returned { category, confidence, source, needsReview, tags: [] } — the spec says the output has exactly four fields. The extra tags array would silently break any consumer validating the shape.
Fix
Removed tags from the return statement. Added a regression test asserting Object.keys(result) has exactly four entries.


Deviation 2 — wrong category names (6 generic → 5 spec values)
AI used prior-iteration category names: "food", "transport", "accommodation", "entertainment", "health", "other". Feature_spec.md defines five business-domain values: "Meals", "Travel", "Lodging", "Office supplies", "Other". Two AI categories have no spec equivalent; "Office supplies" was missing entirely.
Fix
Rewrote the Category type union, all keyword-rule patterns, and the LLM system prompt to use the five spec-defined values.

The categoriser.ts emits a categoriser.suggested event. AC-06 requires: no customer name, address, or card digits in the payload. Is the current implementation safe? Should receiptText be included? Confirm allowed keys: claimId, category, confidence, source, durationMs. Return updated categoriser.ts with a PII policy comment block.

AI correctly identified the implementation is safe — receiptText (OCR output, may contain names/addresses/card digits) is deliberately excluded. Confirmed allowed keys: claimId, category, confidence, source, durationMs. Produced a PII policy comment block integrated into categoriser.ts without modification.    