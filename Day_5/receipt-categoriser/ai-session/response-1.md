# Response 1 — First Implementation Pass

## Did it match the spec? ❌ Partial — two deviations found.

---

## Deviation 1: Added a `tags` field not in the spec

The AI added an undocumented `tags` field to the output object in `llm-categoriser.ts`:

```ts
// AI-generated (incorrect):
return {
  category: result.category,
  confidence: result.confidence,
  source: "llm",
  needsReview: confidence < 0.6,
  tags: result.tags ?? [],          // ← NOT in the spec
};
```

The spec says output has **exactly four fields**: `category`, `confidence`, `source`, `needsReview`.

### Fix applied
Removed `tags`. Return statement changed to:
```ts
return { category: result.category, confidence, source: "llm", needsReview: confidence < 0.6 };
```
Added a regression test:
```ts
it("successful result has exactly four fields", async () => {
  const keys = Object.keys(res.result).sort();
  expect(keys).toEqual(["category", "confidence", "needsReview", "source"].sort());
});
```

---

## Deviation 2: Used wrong category names

The AI used the generic six-category set from the previous iteration
(`"food"`, `"transport"`, `"accommodation"`, `"entertainment"`, `"health"`, `"other"`)
instead of the five categories from Feature_spec.md:

| Incorrect (AI) | Correct (spec) |
|----------------|----------------|
| `"food"` | `"Meals"` |
| `"transport"` | `"Travel"` |
| `"accommodation"` | `"Lodging"` |
| `"entertainment"` | — (not in scope) |
| `"health"` | — (not in scope) |
| `"other"` | `"Other"` |
| — | `"Office supplies"` |

### Fix applied
Updated `Category` type and all keyword rules in `rule-based-categoriser.ts`,
and the LLM prompt in `llm-categoriser.ts`, to use the five spec-defined values.

---

## What was correct
- The fallback / throw-on-non-2xx pattern was correct.
- The `needsReview` threshold (0.6) was correct.
- The telemetry event name `categoriser.suggested` was correct.
- Confidence clamping to [0, 1] was present.
