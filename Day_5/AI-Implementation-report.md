I need you to implement a receipt categoriser in TypeScript following this spec exactly.

Input: { claimId, mimeType, fileSizeBytes, receiptText }
Output: { category: "Meals"|"Travel"|"Lodging"|"Office supplies"|"Other", confidence: 0–1, source: "llm"|"rule-based", needsReview: boolean }
Errors: 400 bad type, 413 oversized, 502 both paths failed
Architecture: rule-based (no network), llm (only network caller), categoriser (orchestrates + telemetry)
AC-01 → AC-06 must pass.

Produce: rule-based-categoriser.ts, llm-categoriser.ts, categoriser.ts


