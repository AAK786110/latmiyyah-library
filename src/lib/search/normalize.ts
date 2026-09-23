// Normalizes Arabic and English/transliterated text so search isn't broken by
// diacritics, apostrophes, transliteration marks, punctuation, casing,
// or common Arabic letter variants.

const ARABIC_DIACRITICS =
  /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

export function normalize(input: string): string {
  if (!input) return "";

  let s = input
    .trim()
    .toLowerCase();

  // Remove Arabic tashkeel / diacritics.
  s = s.replace(ARABIC_DIACRITICS, "");

  // Remove Latin transliteration diacritics:
  // ā -> a, ḥ -> h, ṣ -> s, ṭ -> t, etc.
  s = s
    .normalize("NFD")
    .replace(/\p{M}/gu, "");

  // Normalize common Arabic letter variants.
  s = s
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ـ/g, "");

  // Apostrophes and transliteration marks should disappear,
  // NOT become spaces.
  //
  // na'am   -> naam
  // arba'in -> arbain
  // Qur'an  -> quran
  // shi'a   -> shia
  s = s.replace(
    /['’‘`´ʼʻʿʾ]/g,
    ""
  );

  // Hyphens are usually word separators:
  // al-husayn -> al husayn
  // sayyid-al-shuhada -> sayyid al shuhada
  s = s.replace(
    /[-‐-‒–—_/\\]+/g,
    " "
  );

  // Strip remaining punctuation while keeping
  // Arabic + Latin letters, numbers and spaces.
  s = s.replace(
    /[^\p{L}\p{N}\s]/gu,
    " "
  );

  // Collapse repeated whitespace.
  s = s
    .replace(/\s+/g, " ")
    .trim();

  return s;
}

export function normalizeTokens(
  input: string
): string[] {
  return normalize(input)
    .split(" ")
    .filter(Boolean);
}