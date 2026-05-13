# BookSwap — Mock Smoke Test Report

## Setup

- **Prism command:** `npx @stoplight/prism-cli mock bookswap-openapi.yaml`
- **Mock server:** `http://127.0.0.1:4010`

---

## Results Summary

| Metric | Target | Achieved |
|--------|--------|----------|
| Tests run | 5 | 5 |
| Tests passing (correct status code) | 5 | 5 |
| Endpoints with explicit error responses | 4+ | 4 |

All 5 tests returned the expected HTTP status code. However, 3 tests revealed spec quality issues in the response bodies — documented in Findings below.

---

## Test Results

| # | Endpoint | Method | Body / Params | Expected | Actual | Pass |
|---|----------|--------|---------------|----------|--------|------|
| 1 | /books | GET | page=1&pageSize=20 | 200 | 200 OK | ✓ |
| 2 | /books | POST | valid book payload | 201 | 201 Created | ✓ |
| 3 | /books | POST | missing title | 400 or 422 | 400 Bad Request | ✓ |
| 4 | /books/550e8400-.../borrow-requests | POST | borrower JWT | 201 | 201 Created | ✓ |
| 5 | /books | GET | no Authorization header | 401 | 401 Unauthorized | ✓ |

---

## Findings

### Finding 1 — Pagination fields return zeros despite items being present (Test 1)

**Endpoint:** `GET /books?page=1&pageSize=20`

**Observed response:**

{
  "items": [{ "id": "497f6eca-...", "title": "Harry Potter", ... }],
  "total": 0,
  "page": 0,
  "pageSize": 0
}


**Problem:** The `Page` schema has no `example` values on `total`, `page`, or `pageSize`. Prism generated `0` for all three integer fields while correctly using the Book schema example for `items`. This creates a misleading response — a real client would think the catalogue is empty even though items are returned.

**What the mock revealed that the spec alone did not:** The `Page` schema looks structurally correct in YAML but produces nonsensical data at runtime. A developer reading the spec would not notice this; only running the mock exposed it.



## Spec Changes to Make

### 1. Add example values to the `Page` schema

`total`, `page`, and `pageSize` all lack `example` values, causing Prism to return `0` for each. Fix:

```yaml
Page:
  type: object
  required: [items, total, page, pageSize]
  properties:
    items:
      type: array
      items: {}
    total:
      type: integer
      example: 3
    page:
      type: integer
      example: 1
    pageSize:
      type: integer
      example: 20
```



## Conclusion

All 5 smoke tests passed at the HTTP status code level, confirming the Prism mock server correctly registered all BookSwap routes and enforced auth and request routing.
