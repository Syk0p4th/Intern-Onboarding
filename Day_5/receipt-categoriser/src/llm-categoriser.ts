// ─────────────────────────────────────────────────────────────────────────────
// llm-categoriser.ts
// Only module that calls the Azure OpenAI LLM API.
// Throws on any non-2xx response so the orchestrator can fall back.
// ─────────────────────────────────────────────────────────────────────────────

import type { Category, CategorizationResult } from "./rule-based-categoriser";

const VALID_CATEGORIES: Category[] = [
  "Meals",
  "Travel",
  "Lodging",
  "Office supplies",
  "Other",
];

const NEEDS_REVIEW_THRESHOLD = 0.6;

function isValidCategory(value: unknown): value is Category {
  return typeof value === "string" && VALID_CATEGORIES.includes(value as Category);
}

/**
 * Call the LLM to categorise receipt text (post-OCR).
 * Throws on any non-2xx HTTP status so the caller falls back to rule-based.
 * Output shape matches spec §3 exactly — no extra fields.
 */
export async function categoriseWithLLM(
  receiptText: string,
  fetchFn: typeof fetch = fetch
): Promise<CategorizationResult> {
  const prompt = `You are an expense-receipt categorisation assistant.
Given the receipt text below, return ONLY a valid JSON object with two fields:
  "category": one of exactly these five values: "Meals", "Travel", "Lodging", "Office supplies", "Other"
  "confidence": a number between 0.0 and 1.0

Rules:
- Do NOT add any other fields.
- Do NOT include markdown fences or any preamble.
- Return raw JSON only.

Receipt text:
"""
${receiptText}
"""`;

  const response = await fetchFn("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 100,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  // Throw immediately on non-2xx so the orchestrator falls back (AC-03)
  if (!response.ok) {
    throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text: string = data?.content?.[0]?.text ?? "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    throw new Error(`LLM returned non-JSON: ${text}`);
  }

  const obj = parsed as Record<string, unknown>;

  if (!isValidCategory(obj.category) || typeof obj.confidence !== "number") {
    throw new Error(`LLM returned unexpected shape: ${JSON.stringify(parsed)}`);
  }

  // Clamp confidence to [0, 1]
  const confidence = Math.min(1, Math.max(0, obj.confidence));

  return {
    category: obj.category,
    confidence,
    source: "llm",
    needsReview: confidence < NEEDS_REVIEW_THRESHOLD,
  };
}
