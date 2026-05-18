# receipt-categoriser

AI-assisted receipt categorisation for expense claims.  
Suggests one of five categories: **Meals · Travel · Lodging · Office supplies · Other**.

## Run the tests

```bash
npm install
npm test
```

All 6 acceptance criteria (AC-01 → AC-06) are exercised in `tests/acceptance.test.ts`.

## Architecture

```
categoriser.ts                ← entry point: validates input, orchestrates, emits telemetry
├── llm-categoriser.ts        ← only module that calls the LLM API; throws on non-2xx
└── rule-based-categoriser.ts ← pure keyword matching, zero network calls
```

| Path | Trigger |
|------|---------|
| LLM | Default — Azure OpenAI gpt-4.1 via OCR text |
| Rule-based fallback | Any LLM error (503, timeout, bad JSON) |

Confidence threshold: `< 0.6` → `needsReview: true`.  
File limits: `> 5 MB` → 413. Only `image/jpeg` / `image/png` accepted (else 400).

## AI session log

See `ai-session/` for verbatim prompts and responses, including two documented deviations
in `response-1.md` (wrong categories + extra field) and `response-2.md` (no deviation).
