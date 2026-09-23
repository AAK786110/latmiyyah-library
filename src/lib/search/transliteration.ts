import { normalize } from "./normalize";

/**
 * Produces a loose phonetic key for Arabic words written in Latin letters.
 *
 * This is NOT used as the main search.
 * It is only a fallback after normal/exact matching, so we can afford
 * to be more forgiving here.
 *
 * Examples:
 *   zahra  -> zhr
 *   zehra  -> zhr
 *
 *   dhanbu -> znb
 *   zanb   -> znb
 *
 *   tifli  -> tfl
 *   tefli  -> tfl
 */
export function transliterationTokenKey(
  input: string
): string {
  let s = normalize(input);

  if (!s) return "";

  // Work with a single token.
  s = s.replace(/\s+/g, "");

  // Common Arabic transliteration alternatives.
  //
  // These are intentionally only used for the loose search key,
  // NOT for the actual displayed/search text.
  s = s
    .replace(/dh/g, "z")
    .replace(/ḏ/g, "z")

    // Common transliteration differences.
    .replace(/zh/g, "z")

    // Collapse long vowels before removing vowels.
    .replace(/aa+/g, "a")
    .replace(/ee+/g, "i")
    .replace(/ii+/g, "i")
    .replace(/oo+/g, "u")
    .replace(/uu+/g, "u");

  // Collapse doubled letters.
  //
  // hussain -> husain
  // abbas   -> abas
  s = s.replace(/(.)\1+/g, "$1");

  // Remove vowels.
  //
  // zahra -> zhr
  // zehra -> zhr
  // tifli -> tfl
  // tefli -> tfl
  s = s.replace(/[aeiou]/g, "");

  return s;
}

/**
 * Produces a phonetic key for a whole phrase while preserving word boundaries.
 *
 * Example:
 *
 * "Ma Dhanbu Tifli"
 *      -> "m znb tfl"
 *
 * "Maa Zanb Tifli"
 *      -> "m znb tfl"
 */
export function transliterationKey(
  input: string
): string {
  return normalize(input)
    .split(" ")
    .filter(Boolean)
    .map(transliterationTokenKey)
    .filter(Boolean)
    .join(" ");
}

export function transliterationTokenKeys(
  input: string
): string[] {
  return normalize(input)
    .split(" ")
    .filter(Boolean)
    .map(transliterationTokenKey)
    .filter(Boolean);
}