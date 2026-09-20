import { normalize } from "./normalize";
import { expandQuery } from "./aliases";
import type { Latmiyyah } from "../types";

// Small Levenshtein distance implementation - used only as a fallback for
// minor typos once alias matching has already been tried, per spec
// ("do not rely purely on fuzzy spelling").
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

function fieldMatchScore(fieldValue: string | null | undefined, expandedTerms: string[]): number {
  if (!fieldValue) return 0;
  const normalizedField = normalize(fieldValue);
  const fieldTokens = normalizedField.split(" ").filter(Boolean);
  let score = 0;

  for (const term of expandedTerms) {
    if (!term) continue;
    if (normalizedField === term) score += 10;
    else if (normalizedField.includes(term)) score += 5;
    else {
      // Fuzzy fallback: small edit distance to any token in the field
      for (const token of fieldTokens) {
        const dist = levenshtein(term, token);
        const threshold = Math.max(1, Math.floor(Math.min(term.length, token.length) / 4));
        if (dist <= threshold) {
          score += 2;
          break;
        }
      }
    }
  }
  return score;
}

// Ranks a set of already-fetched latmiyyahs against a raw query.
// Used client-side after Supabase returns a candidate set (see the search
// page for how the initial DB-level filter narrows things down first).
export function rankLatmiyyahs(items: Latmiyyah[], query: string): Latmiyyah[] {
  if (!query.trim()) return items;
  const { expandedTerms } = expandQuery(query);

  const scored = items.map((item) => {
    let score = 0;
    score += fieldMatchScore(item.title, expandedTerms) * 3;
    score += fieldMatchScore(item.arabic_title, expandedTerms) * 3;
    score += fieldMatchScore(item.reciter, expandedTerms) * 2;
    score += fieldMatchScore(item.poet, expandedTerms) * 1.5;
    score += (item.tags || []).reduce(
      (acc, t) => acc + fieldMatchScore(t.name, expandedTerms),
      0
    );
    return { item, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .map((s) => s.item);
}

// Terms used to build a Postgres `or(...)` ILIKE filter so the DB does the
// first coarse pass before client-side ranking refines it - this keeps
// search fast even with thousands of rows (no fetching the whole table).
export function buildIlikeTerms(query: string): string[] {
  const { expandedTerms } = expandQuery(query);
  return expandedTerms.filter((t) => t.length >= 2).slice(0, 12);
}
