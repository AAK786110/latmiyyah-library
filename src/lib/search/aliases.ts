import { normalize } from "./normalize";

// Canonical-name alias system. Add new entries here any time you notice a
// name/spelling that isn't being matched - no code changes needed elsewhere,
// this dictionary is the single source of truth.
//
// Each entry: canonical key -> list of variant spellings/transliterations
// (English and Arabic). All variants map back to the canonical key when
// searching, so "hussain", "hussein" and "حسين" are treated as one thing.
export const ALIASES: Record<string, string[]> = {
  husayn: [
    "husayn", "husain", "hussain", "hussein", "hussayn", "husayni",
    "imam husayn", "imam hussain", "حسين", "الحسين", "امام حسين",
  ],
  abbas: [
    "abbas", "abbās", "hazrat abbas", "abul fadl", "abu al fadl",
    "abolfazl", "abu fadl", "عباس", "العباس", "ابو الفضل", "ابوالفضل",
  ],
  ali: [
    "ali", "imam ali", "haydar", "haider", "hyder", "murtaza",
    "علي", "حيدر", "امام علي",
  ],
  zaynab: [
    "zaynab", "zainab", "sayyida zaynab", "sayyeda zainab",
    "زينب", "السيدة زينب",
  ],
  fatima: [
    "fatima", "fatimah", "zahra", "zahraa", "sayyida fatima",
    "فاطمة", "الزهراء", "زهراء", "فاطمه",
  ],
  karbala: ["karbala", "karbalaa", "karbalā", "كربلاء"],
  arbaeen: ["arbaeen", "arbain", "arba'in", "arbaeen walk", "اربعين", "الأربعين"],
  ashura: ["ashura", "ashoora", "aashura", "عاشوراء", "عاشورا"],
  muharram: ["muharram", "moharram", "محرم"],
  abbasibnali: [], // placeholder to show pattern for future personalities
};

// Reverse lookup map, built once: variant (normalized) -> canonical key.
const VARIANT_TO_CANONICAL: Map<string, string> = (() => {
  const map = new Map<string, string>();
  for (const [canonical, variants] of Object.entries(ALIASES)) {
    map.set(normalize(canonical), canonical);
    for (const v of variants) {
      map.set(normalize(v), canonical);
    }
  }
  return map;
})();

// Given a raw search token, return its canonical form if it (or a close
// variant) matches a known alias; otherwise return the token unchanged.
export function canonicalize(token: string): string {
  const n = normalize(token);
  if (VARIANT_TO_CANONICAL.has(n)) return VARIANT_TO_CANONICAL.get(n)!;

  // Loose match: token is a substring/superstring of a known variant
  // (handles things like "hussainiya" containing "hussain").
  for (const [variant, canonical] of VARIANT_TO_CANONICAL.entries()) {
    if (variant.length >= 3 && (n.includes(variant) || variant.includes(n))) {
      return canonical;
    }
  }
  return n;
}

// Expand a full search query into normalized + canonicalized tokens,
// plus all known alias spellings for any canonical term found - so a
// Postgres ILIKE/full-text query can match any spelling variant.
export function expandQuery(query: string): { canonicalTokens: string[]; expandedTerms: string[] } {
  const tokens = normalize(query).split(" ").filter(Boolean);
  const canonicalTokens = tokens.map(canonicalize);

  const expandedTerms = new Set<string>();
  for (const token of tokens) expandedTerms.add(token);
  for (const canonical of canonicalTokens) {
    expandedTerms.add(canonical);
    const variants = ALIASES[canonical];
    if (variants) variants.forEach((v) => expandedTerms.add(normalize(v)));
  }

  return { canonicalTokens, expandedTerms: Array.from(expandedTerms).filter(Boolean) };
}
