# Receipt Categoriser — Feature Spec v0.1

## 1. Why

Business spends significant effort manually reviewing expense claims because receipts
arrive without category information. This feature introduces AI-assisted analysis of
uploaded receipt images to suggest one of five standard expense categories. The claimant
reviews and accepts or changes the suggestion before submitting the claim.

### Success metrics (measured over 90 days)
| Metric | Target |
|--------|--------|
| Average manual review time per claim | ≤ 90 seconds (down from 4 min) |
| Claims auto-categorised at confidence ≥ 0.6 | ≥ 70% |
| Category correction rate | < 15% |

---

## 2. Scope

**In scope**
- Real-time image categorisation triggered at claim upload.
- Five canonical categories: `Meals`, `Travel`, `Lodging`, `Office supplies`, `Other`.
- Any prediction with confidence < 0.6 is flagged `needsReview: true` for claimant review.

**Services involved**
| Service | Role |
|---------|------|
| Claims Submission API | New endpoint `POST /claims/{id}/receipts/categorise` |
| Receipt Categoriser | Orchestrates OCR → LLM → rule-based fallback |
| Azure OpenAI (gpt-4.1) | LLM categorisation |
| Azure AI Document Intelligence | Receipt OCR |
| Azure Application Insights | Emits `categoriser.suggested` customEvent |

**Out of scope**
- Multi-receipt batch upload
- Auto-submission without claimant confirmation
- Currency / amount extraction
- Active learning from claimant overrides (v2 candidate)

---

## 3. Contract

### Endpoint
```
POST /claims/{id}/receipts/categorise
Content-Type: multipart/form-data
Body: receipt (image/jpeg or image/png, ≤ 5 MB)
```

### Successful response — 200 OK
```jsonc
{
  "category":    "Meals" | "Travel" | "Lodging" | "Office supplies" | "Other",
  "confidence":  <float 0.0 – 1.0>,
  "source":      "llm" | "rule-based",
  "needsReview": <boolean>   // true when confidence < 0.6
}
```

### Error responses
| Code | Condition |
|------|-----------|
| 400  | File is not jpeg/png (e.g. PDF) |
| 413  | File exceeds 5 MB |
| 502  | Upstream OCR or LLM unavailable and rule-based also failed |

### Side effects
- `categoriser.suggested` customEvent emitted to Application Insights within 5 seconds.
- The customEvent payload must contain **no PII** and **no card numbers**.

---

## 4. Acceptance criteria

See `spec/acceptance.md` for the full Given/When/Then set.

Thresholds:
- `confidence` ∈ [0.0, 1.0] — any value outside is a bug.
- `needsReview = true` iff `confidence < 0.6`.
- `source = "rule-based"` and `confidence ≤ 0.5` when LLM is unavailable.
- 413 triggered only when file > 5 MB.
- 400 triggered only when MIME type is not `image/jpeg` or `image/png`.

---

## 5. Examples

### Happy path
```
Input:  claimId=1472648sfg, taxi_receipt.jpeg (Travel, 2.4 MB)
Output: { "category": "Travel", "confidence": 0.9, "source": "llm", "needsReview": false }
```

### Ambiguous
```
Input:  claimId=123512ahy, blurry_shop.png (1.2 MB)
Output: { "category": "Office supplies", "confidence": 0.4, "source": "llm", "needsReview": true }
```

### Error — oversized
```
Input:  claimId=152372aef, High_res_scan.jpeg (13 MB)
Output: HTTP 413 { "error": "File too large", "maxSize": "5MB" }
```
