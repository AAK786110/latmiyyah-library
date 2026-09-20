// Hand-written types matching the Supabase schema in supabase/schema.sql.
// (If you later want auto-generated types, run:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/types.ts
// and then re-add the convenience types below the generated Database type.)

export type TagCategory = "holy_personality" | "context" | "speed";

export interface Tag {
  id: string;
  category: TagCategory;
  name: string; // canonical display name, e.g. "Imam Husayn"
  slug: string; // e.g. "imam-husayn"
}

export type LatmiyyahStatus = "draft" | "published";

export interface Latmiyyah {
  id: string;
  slug: string;
  title: string;
  arabic_title: string | null;
  reciter: string;
  poet: string | null;
  arabic_text: string; // raw text, blank line = new stanza
  english_translation: string; // raw text, same stanza structure as arabic_text
  youtube_url: string | null;
  status: LatmiyyahStatus;
  created_at: string;
  updated_at: string;
  tags?: Tag[]; // populated via join when fetched
}

export interface Submission {
  id: string;
  title: string;
  arabic_title: string | null;
  reciter: string | null;
  poet: string | null;
  arabic_text: string | null;
  english_translation: string | null;
  proposed_tags: string | null;
  notes: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface EditSuggestion {
  id: string;
  latmiyyah_id: string;
  field: string; // e.g. "title", "arabic_text", "reciter", "tags"
  current_value: string | null;
  suggested_value: string;
  note: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

// A stanza is a list of lines. A Latmiyyah's lyrics/translation are
// represented as an array of stanzas once parsed from the raw text.
export type Stanzas = string[][];

export function parseStanzas(raw: string): Stanzas {
  const normalized = raw.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];
  return normalized
    .split(/\n\s*\n/)
    .map((stanza) =>
      stanza
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
    )
    .filter((stanza) => stanza.length > 0);
}

// Minimal Database type so createBrowserClient<Database>() type-checks.
// Extend this if you want full column-level typing from Supabase codegen.
export type Database = any;