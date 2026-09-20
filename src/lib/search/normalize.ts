// Normalizes Arabic and English text so search isn't broken by
// diacritics, alef/yeh variants, punctuation, or casing.

const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

export function normalize(input: string): string {
  if (!input) return "";
  let s = input.trim().toLowerCase();

  // Strip Arabic diacritics (tashkeel)
  s = s.replace(ARABIC_DIACRITICS, "");

  // Normalize common Arabic letter variants
  s = s
    .replace(/[إأآا]/g, "ا") // alef variants -> plain alef
    .replace(/ى/g, "ي") // alef maksura -> yeh
    .replace(/ة/g, "ه") // teh marbuta -> heh
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ـ/g, ""); // tatweel/kashida

  // Strip punctuation (keep Arabic + Latin letters, digits, spaces)
  s = s.replace(/[^\p{L}\p{N}\s]/gu, " ");

  // Collapse whitespace
  s = s.replace(/\s+/g, " ").trim();

  return s;
}

export function normalizeTokens(input: string): string[] {
  return normalize(input).split(" ").filter(Boolean);
}
