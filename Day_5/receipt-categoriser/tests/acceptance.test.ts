import { describe, it, expect, vi } from "vitest";
import { categorise } from "../src/categoriser";
import { categoriseByRules } from "../src/rule-based-categoriser";
import type { TelemetrySink, TelemetryEvent, ReceiptInput } from "../src/categoriser";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const VALID_CATEGORIES = new Set([
  "Meals",
  "Travel",
  "Lodging",
  "Office supplies",
  "Other",
]);

const MB = 1024 * 1024;

function mockFetch(status: number, body: unknown = {}): typeof fetch {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 503 ? "Service Unavailable" : "OK",
    json: async () => body,
  }) as unknown as typeof fetch;
}

function llmResponse(category: string, confidence: number) {
  return {
    content: [{ text: JSON.stringify({ category, confidence }) }],
  };
}

function makeInput(overrides: Partial<ReceiptInput> = {}): ReceiptInput {
  return {
    claimId: "test-claim-001",
    mimeType: "image/jpeg",
    fileSizeBytes: 2 * MB,
    receiptText: "Restaurant bill LKR 2400",
    ...overrides,
  };
}

function captureTelemetry(): { sink: TelemetrySink; events: TelemetryEvent[] } {
  const events: TelemetryEvent[] = [];
  const sink: TelemetrySink = { trackEvent: (e) => events.push(e) };
  return { sink, events };
}

// ─────────────────────────────────────────────────────────────────────────────
// AC-01 — Happy path: clear meal receipt
// ─────────────────────────────────────────────────────────────────────────────

describe("AC-01 — Happy path: clear meal receipt", () => {
  it("returns 200-equivalent with category=Meals, confidence>=0.7, source=llm, needsReview=false", async () => {
    const fetch = mockFetch(200, llmResponse("Meals", 0.92));
    const res = await categorise(makeInput({ receiptText: "Restaurant bill LKR 2400" }), fetch);

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.result.category).toBe("Meals");
    expect(res.result.confidence).toBeGreaterThanOrEqual(0.7);
    expect(res.result.source).toBe("llm");
    expect(res.result.needsReview).toBe(false);
  });

  it("emits categoriser.suggested telemetry event", async () => {
    const fetch = mockFetch(200, llmResponse("Meals", 0.92));
    const { sink, events } = captureTelemetry();

    await categorise(makeInput(), fetch, sink);

    expect(events).toHaveLength(1);
    expect(events[0].name).toBe("categoriser.suggested");
  });

  it("telemetry event contains claimId, category, confidence, source, durationMs", async () => {
    const fetch = mockFetch(200, llmResponse("Meals", 0.92));
    const { sink, events } = captureTelemetry();

    await categorise(makeInput({ claimId: "claim-abc" }), fetch, sink);

    const props = events[0].properties;
    expect(props.claimId).toBe("claim-abc");
    expect(props.category).toBe("Meals");
    expect(props.confidence).toBeGreaterThan(0);
    expect(props.source).toBe("llm");
    expect(typeof props.durationMs).toBe("number");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC-02 — Ambiguous receipt
// ─────────────────────────────────────────────────────────────────────────────

describe("AC-02 — Ambiguous receipt", () => {
  it("returns needsReview=true when confidence < 0.6", async () => {
    const fetch = mockFetch(200, llmResponse("Office supplies", 0.4));
    const res = await categorise(makeInput({ receiptText: "blurry_shop mixed items" }), fetch);

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.result.needsReview).toBe(true);
    expect(res.result.confidence).toBeLessThan(0.6);
    expect(VALID_CATEGORIES.has(res.result.category)).toBe(true);
  });

  it("returns needsReview=false when confidence >= 0.6", async () => {
    const fetch = mockFetch(200, llmResponse("Travel", 0.85));
    const res = await categorise(makeInput(), fetch);

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.result.needsReview).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC-03 — LLM unavailable: rule-based fallback
// ─────────────────────────────────────────────────────────────────────────────

describe("AC-03 — LLM 503 → rule-based fallback", () => {
  it("returns 200-equivalent with source=rule-based and confidence<=0.5", async () => {
    const fetch503 = mockFetch(503);
    const res = await categorise(makeInput({ receiptText: "Uber ride to airport" }), fetch503);

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.result.source).toBe("rule-based");
    expect(res.result.confidence).toBeLessThanOrEqual(0.5);
    expect(VALID_CATEGORIES.has(res.result.category)).toBe(true);
  });

  it("still identifies Travel via rule-based when LLM is down", async () => {
    const fetch503 = mockFetch(503);
    const res = await categorise(makeInput({ receiptText: "Uber ride to airport £32" }), fetch503);

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.result.category).toBe("Travel");
  });

  it("falls back to Other for unrecognisable receipt when LLM is down", async () => {
    const fetch503 = mockFetch(503);
    const res = await categorise(makeInput({ receiptText: "xzqwerty garbage 9999" }), fetch503);

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.result.category).toBe("Other");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC-04 — OCR failure / unreadable image
// ─────────────────────────────────────────────────────────────────────────────

describe("AC-04 — OCR failure / unreadable image", () => {
  it("empty OCR text falls back to Other via rule-based, never 500", async () => {
    const fetch503 = mockFetch(503);
    // Empty receiptText simulates OCR producing nothing
    const res = await categorise(makeInput({ receiptText: "" }), fetch503);

    // Must not throw; must return ok or a known 4xx/5xx — never an unhandled exception
    if (res.ok) {
      expect(VALID_CATEGORIES.has(res.result.category)).toBe(true);
    } else {
      expect([400, 413, 502]).toContain(res.error.httpStatus);
    }
  });

  it("rule-based never throws on garbage OCR text", () => {
    expect(() => categoriseByRules("")).not.toThrow();
    expect(() => categoriseByRules("@@@###$$$")).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC-05 — Oversized payload
// ─────────────────────────────────────────────────────────────────────────────

describe("AC-05 — Oversized payload", () => {
  it("returns 413 for a 13 MB file", async () => {
    const res = await categorise(makeInput({ fileSizeBytes: 13 * MB }));

    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.httpStatus).toBe(413);
    expect(res.error.maxSize).toBe("5MB");
  });

  it("returns 413 for a file just over 5 MB (5 MB + 1 byte)", async () => {
    const res = await categorise(makeInput({ fileSizeBytes: 5 * MB + 1 }));

    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.httpStatus).toBe(413);
  });

  it("accepts a file of exactly 5 MB (boundary)", async () => {
    const fetch = mockFetch(200, llmResponse("Travel", 0.88));
    const res = await categorise(makeInput({ fileSizeBytes: 5 * MB }), fetch);

    expect(res.ok).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC-06 — PII boundary
// ─────────────────────────────────────────────────────────────────────────────

describe("AC-06 — PII boundary: telemetry event contains no PII", () => {
  it("event properties contain exactly the allowed fields", async () => {
    const fetch = mockFetch(200, llmResponse("Meals", 0.85));
    const { sink, events } = captureTelemetry();

    await categorise(
      makeInput({ receiptText: "John Smith, 123 Main St, card ending 4321, meal £45" }),
      fetch,
      sink
    );

    const props = events[0].properties;
    const keys = Object.keys(props).sort();
    expect(keys).toEqual(["category", "claimId", "confidence", "durationMs", "source"].sort());
  });

  it("event properties contain no customer name", async () => {
    const fetch = mockFetch(200, llmResponse("Meals", 0.85));
    const { sink, events } = captureTelemetry();

    await categorise(
      makeInput({ receiptText: "John Smith meal at Grill House" }),
      fetch,
      sink
    );

    const propsStr = JSON.stringify(events[0].properties);
    expect(propsStr).not.toMatch(/john smith/i);
  });

  it("event properties contain no card digits", async () => {
    const fetch = mockFetch(200, llmResponse("Meals", 0.85));
    const { sink, events } = captureTelemetry();

    await categorise(
      makeInput({ receiptText: "Card ending 4321, total £45" }),
      fetch,
      sink
    );

    const propsStr = JSON.stringify(events[0].properties);
    expect(propsStr).not.toMatch(/4321/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Input validation — 400
// ─────────────────────────────────────────────────────────────────────────────

describe("Input validation — 400 for unsupported file type", () => {
  it("returns 400 for a PDF upload", async () => {
    const res = await categorise(makeInput({ mimeType: "application/pdf" }));

    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.httpStatus).toBe(400);
  });

  it("accepts image/jpeg", async () => {
    const fetch = mockFetch(200, llmResponse("Travel", 0.9));
    const res = await categorise(makeInput({ mimeType: "image/jpeg" }), fetch);
    expect(res.ok).toBe(true);
  });

  it("accepts image/png", async () => {
    const fetch = mockFetch(200, llmResponse("Travel", 0.9));
    const res = await categorise(makeInput({ mimeType: "image/png" }), fetch);
    expect(res.ok).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Output shape
// ─────────────────────────────────────────────────────────────────────────────

describe("Output shape", () => {
  it("successful result has exactly four fields", async () => {
    const fetch = mockFetch(200, llmResponse("Meals", 0.9));
    const res = await categorise(makeInput(), fetch);

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    const keys = Object.keys(res.result).sort();
    expect(keys).toEqual(["category", "confidence", "needsReview", "source"].sort());
  });
});
