// ─────────────────────────────────────────────────────────────────────────────
// categoriser.ts
// Entry point. Validates input, orchestrates LLM → rule-based fallback,
// emits Application Insights telemetry (PII-free).
// ─────────────────────────────────────────────────────────────────────────────

import { categoriseByRules } from "./rule-based-categoriser";
import { categoriseWithLLM } from "./llm-categoriser";
import type { CategorizationResult } from "./rule-based-categoriser";

export type { Category, CategorizationResult } from "./rule-based-categoriser";

// ── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB — AC-05
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png"]); // AC-04 / 400

// ── Public types ─────────────────────────────────────────────────────────────

export interface ReceiptInput {
  claimId: string;
  mimeType: string;        // must be "image/jpeg" or "image/png"
  fileSizeBytes: number;   // must be <= 5 MB
  receiptText: string;     // OCR output passed in by the caller
}

export interface CategoriseError {
  httpStatus: 400 | 413 | 502;
  error: string;
  maxSize?: string;
}

export type CategoriseResponse =
  | { ok: true; result: CategorizationResult }
  | { ok: false; error: CategoriseError };

// ── Telemetry (PII-free) ─────────────────────────────────────────────────────

export interface TelemetryEvent {
  name: "categoriser.suggested";
  properties: {
    claimId: string;       // identifier — no name/address/card data
    category: string;
    confidence: number;
    source: "llm" | "rule-based";
    durationMs: number;
  };
}

/** Minimal telemetry sink interface — swap in the real AI SDK in production. */
export interface TelemetrySink {
  trackEvent(event: TelemetryEvent): void;
}

/** No-op sink used when no sink is injected (tests, local dev). */
const noopSink: TelemetrySink = { trackEvent: () => {} };

// ── Main function ─────────────────────────────────────────────────────────────

/**
 * Categorise a receipt.
 *
 * Validation:
 *   - Non-jpeg/png  → 400
 *   - File > 5 MB   → 413
 *
 * Categorisation strategy:
 *   1. Try LLM (network call via llm-categoriser).
 *   2. On any LLM error (503, timeout, bad JSON …) fall back to rule-based.
 *   3. If rule-based also throws (should never happen), return 502.
 *
 * Telemetry:
 *   - Emits `categoriser.suggested` with no PII fields (AC-06).
 */
export async function categorise(
  input: ReceiptInput,
  fetchFn: typeof fetch = fetch,
  telemetry: TelemetrySink = noopSink
): Promise<CategoriseResponse> {
  // ── Input validation ──────────────────────────────────────────────────────

  if (!ALLOWED_MIME_TYPES.has(input.mimeType)) {
    return {
      ok: false,
      error: { httpStatus: 400, error: "Unsupported file type. Only image/jpeg and image/png are accepted." },
    };
  }

  if (input.fileSizeBytes > MAX_FILE_BYTES) {
    return {
      ok: false,
      error: { httpStatus: 413, error: "File too large", maxSize: "5MB" },
    };
  }

  // ── Categorisation ────────────────────────────────────────────────────────

  const startMs = Date.now();
  let result: CategorizationResult;

  try {
    result = await categoriseWithLLM(input.receiptText, fetchFn);
  } catch (llmErr) {
    console.warn(
      "[categoriser] LLM failed, using rule-based fallback:",
      (llmErr as Error).message
    );
    try {
      result = categoriseByRules(input.receiptText);
    } catch (ruleErr) {
      // Both paths failed — extremely unlikely but handled
      return {
        ok: false,
        error: { httpStatus: 502, error: "Both LLM and rule-based categorisation failed." },
      };
    }
  }

  // ── Telemetry — PII-free (AC-06) ──────────────────────────────────────────

  telemetry.trackEvent({
    name: "categoriser.suggested",
    properties: {
      claimId: input.claimId,          // identifier only, no personal data
      category: result.category,
      confidence: result.confidence,
      source: result.source,
      durationMs: Date.now() - startMs,
    },
  });

  return { ok: true, result };
}
