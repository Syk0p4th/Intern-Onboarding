// ─────────────────────────────────────────────────────────────────────────────
// rule-based-categoriser.ts
// Pure keyword-matching categoriser — zero network calls.
// Categories match Feature_spec.md §2 exactly.
// ─────────────────────────────────────────────────────────────────────────────

export type Category =
  | "Meals"
  | "Travel"
  | "Lodging"
  | "Office supplies"
  | "Other";

export interface CategorizationResult {
  category: Category;
  confidence: number;
  source: "llm" | "rule-based";
  needsReview: boolean;
}

// Confidence cap for rule-based results — AC-03 requires confidence <= 0.5
const RULE_CONFIDENCE = 0.5;

const RULES: Array<{ pattern: RegExp; category: Category }> = [
  {
    // Meals: restaurants, cafes, food delivery, groceries
    pattern:
      /restaurant|cafe|coffee|mcdonald|starbucks|kfc|burger|pizza|sushi|noodle|bakery|deli|grocery|supermarket|tesco|waitrose|sainsbury|aldi|lidl|spar|meal|lunch|dinner|breakfast|takeaway|delivery/i,
    category: "Meals",
  },
  {
    // Travel: ride-share, fuel, airline, public transit, parking
    pattern:
      /uber|lyft|bolt|taxi|cab|fuel|petrol|diesel|gas station|bp |shell |esso|parking|car park|train|tram|bus |metro|oyster|transit|flight|airline|easyjet|ryanair|lufthansa|emirates|pick.?up|drop.?off/i,
    category: "Travel",
  },
  {
    // Lodging: hotels, Airbnb, hostels
    pattern:
      /hotel|airbnb|hostel|motel|inn |lodge|resort|hilton|marriott|hyatt|ibis|premier inn|travelodge|booking\.com|accommodation|room charge/i,
    category: "Lodging",
  },
  {
    // Office supplies: stationery, printing, tech peripherals
    pattern:
      /staples|officeworks|ryman|amazon|printer|toner|cartridge|stationery|notebook|pen |pencil|paper|binder|folder|keyboard|mouse |monitor|usb|cable|office supply/i,
    category: "Office supplies",
  },
];

/**
 * Categorise receipt text using keyword rules only.
 * Returns confidence <= 0.5 (per AC-03) and needsReview: true.
 * Never throws.
 */
export function categoriseByRules(receiptText: string): CategorizationResult {
  for (const rule of RULES) {
    if (rule.pattern.test(receiptText)) {
      return {
        category: rule.category,
        confidence: RULE_CONFIDENCE,
        source: "rule-based",
        needsReview: true,          // confidence 0.5 < 0.6 threshold → always review
      };
    }
  }
  return {
    category: "Other",
    confidence: 0.3,
    source: "rule-based",
    needsReview: true,
  };
}
