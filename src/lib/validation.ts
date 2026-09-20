import { parseStanzas } from "./types";

export interface AlignmentError {
  message: string;
  stanzaIndex: number; // 1-based, for display
}

export interface AlignmentResult {
  valid: boolean;
  errors: AlignmentError[];
}

// Checks that Arabic and English texts have the same stanza structure and
// the same number of lines within each stanza. This is required before a
// Latmiyyah can be published (drafts may still have mismatches).
export function validateAlignment(arabicRaw: string, englishRaw: string): AlignmentResult {
  const errors: AlignmentError[] = [];
  const arabicStanzas = parseStanzas(arabicRaw);
  const englishStanzas = parseStanzas(englishRaw);

  if (arabicStanzas.length === 0) {
    errors.push({ message: "Arabic lyrics are empty.", stanzaIndex: 0 });
  }
  if (englishStanzas.length === 0) {
    errors.push({ message: "English translation is empty.", stanzaIndex: 0 });
  }
  if (arabicStanzas.length === 0 || englishStanzas.length === 0) {
    return { valid: false, errors };
  }

  if (arabicStanzas.length !== englishStanzas.length) {
    errors.push({
      message: `Arabic has ${arabicStanzas.length} stanza(s) but English has ${englishStanzas.length} stanza(s).`,
      stanzaIndex: 0,
    });
  }

  const maxStanzas = Math.max(arabicStanzas.length, englishStanzas.length);
  for (let i = 0; i < maxStanzas; i++) {
    const arabicLines = arabicStanzas[i] || [];
    const englishLines = englishStanzas[i] || [];
    const stanzaNumber = i + 1;

    if (!arabicStanzas[i]) {
      errors.push({ message: `English stanza ${stanzaNumber} has no matching Arabic stanza.`, stanzaIndex: stanzaNumber });
      continue;
    }
    if (!englishStanzas[i]) {
      errors.push({ message: `Arabic stanza ${stanzaNumber} has no matching English stanza.`, stanzaIndex: stanzaNumber });
      continue;
    }
    if (arabicLines.length !== englishLines.length) {
      errors.push({
        message: `Arabic stanza ${stanzaNumber} contains ${arabicLines.length} line(s) but English stanza ${stanzaNumber} contains ${englishLines.length}.`,
        stanzaIndex: stanzaNumber,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}
