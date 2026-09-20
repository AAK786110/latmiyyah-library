"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Latmiyyah, Tag, TagCategory } from "@/lib/types";
import { validateAlignment } from "@/lib/validation";
import { youTubeThumbnail } from "@/lib/youtube";
import LyricsView from "./LyricsView";
import TranslationView from "./TranslationView";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function LatmiyyahForm({ existing }: { existing?: Latmiyyah }) {
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState(existing?.title || "");
  const [arabicTitle, setArabicTitle] = useState(existing?.arabic_title || "");
  const [reciter, setReciter] = useState(existing?.reciter || "");
  const [poet, setPoet] = useState(existing?.poet || "");
  const [arabicText, setArabicText] = useState(existing?.arabic_text || "");
  const [englishText, setEnglishText] = useState(existing?.english_translation || "");
  const [youtubeUrl, setYoutubeUrl] = useState(existing?.youtube_url || "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(existing?.tags?.map((t) => t.id) || []);
  const [newTagInputs, setNewTagInputs] = useState<Record<TagCategory, string>>({
    holy_personality: "", context: "", speed: "",
  });

  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [preview, setPreview] = useState<"lyrics" | "translation">("lyrics");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    supabase.from("tags").select("*").order("name").then(({ data }) => setAllTags(data || []));
  }, [supabase]);

  const alignment = validateAlignment(arabicText, englishText);

  async function ensureTag(category: TagCategory, name: string): Promise<string> {
    const trimmed = name.trim();
    const slug = slugify(trimmed);
    const existingTag = allTags.find((t) => t.category === category && t.slug === slug);
    if (existingTag) return existingTag.id;

    const { data, error } = await supabase
      .from("tags")
      .insert({ category, name: trimmed, slug })
      .select()
      .single();
    if (error) throw error;
    setAllTags((prev) => [...prev, data]);
    return data.id;
  }

  async function addNewTag(category: TagCategory) {
    const name = newTagInputs[category];
    if (!name.trim()) return;
    const id = await ensureTag(category, name);
    setSelectedTagIds((prev) => [...prev, id]);
    setNewTagInputs((prev) => ({ ...prev, [category]: "" }));
  }

  async function save(publish: boolean) {
    setSaving(true);
    setSaveError("");

    if (publish && !alignment.valid) {
      setSaveError("Fix Arabic/English alignment errors before publishing.");
      setSaving(false);
      return;
    }

    const slug = existing?.slug || slugify(title) || `latmiyyah-${Date.now()}`;
    const payload = {
      title,
      arabic_title: arabicTitle || null,
      reciter,
      poet: poet || null,
      arabic_text: arabicText,
      english_translation: englishText,
      youtube_url: youtubeUrl || null,
      status: publish ? "published" : "draft",
      slug,
    };

    let latmiyyahId = existing?.id;
    if (existing) {
      const { error } = await supabase.from("latmiyyahs").update(payload).eq("id", existing.id);
      if (error) { setSaveError(error.message); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from("latmiyyahs").insert(payload).select().single();
      if (error) { setSaveError(error.message); setSaving(false); return; }
      latmiyyahId = data.id;
    }

    // Sync tag associations: delete existing, re-insert current selection.
    await supabase.from("latmiyyah_tags").delete().eq("latmiyyah_id", latmiyyahId);
    if (selectedTagIds.length > 0) {
      await supabase.from("latmiyyah_tags").insert(
        selectedTagIds.map((tag_id) => ({ latmiyyah_id: latmiyyahId, tag_id }))
      );
    }

    setSaving(false);
    router.push("/dashboard");
    router.refresh();
  }

  function tagsByCategory(cat: TagCategory) {
    return allTags.filter((t) => t.category === cat);
  }

  function toggleTag(id: string) {
    setSelectedTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <Field label="Title" value={title} onChange={setTitle} required />
        <Field label="Arabic title" value={arabicTitle} onChange={setArabicTitle} arabic />
        <Field label="Reciter" value={reciter} onChange={setReciter} required />
        <Field label="Poet" value={poet} onChange={setPoet} />

        <div>
          <Field
            label="YouTube URL (used for the card thumbnail)"
            value={youtubeUrl}
            onChange={setYoutubeUrl}
          />
          {youtubeUrl && !youTubeThumbnail(youtubeUrl) && (
            <p className="mt-1 text-xs text-red-500">
              That doesn't look like a recognizable YouTube link - double check it.
            </p>
          )}
          {youTubeThumbnail(youtubeUrl) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={youTubeThumbnail(youtubeUrl)!}
              alt="YouTube thumbnail preview"
              className="mt-2 h-24 rounded border border-border object-cover"
            />
          )}
        </div>

        {(["holy_personality", "context", "speed"] as TagCategory[]).map((cat) => (
          <div key={cat} className="rounded-lg border border-border p-3">
            <p className="mb-2 text-sm font-medium capitalize">{cat.replace("_", " ")} tags</p>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {tagsByCategory(cat).map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    selectedTagIds.includes(tag.id)
                      ? "border-accent bg-accent text-accentFg"
                      : "border-border text-muted"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newTagInputs[cat]}
                onChange={(e) => setNewTagInputs((prev) => ({ ...prev, [cat]: e.target.value }))}
                placeholder="New tag name..."
                className="flex-1 rounded border border-border bg-surface px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={() => addNewTag(cat)}
                className="rounded border border-border px-3 text-sm hover:border-accent"
              >
                Add
              </button>
            </div>
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium">Arabic lyrics</label>
          <p className="mb-1 text-xs text-muted">One line per row. Blank line = new stanza. Arabic and English lines must correspond.</p>
          <textarea
            dir="rtl"
            rows={12}
            value={arabicText}
            onChange={(e) => setArabicText(e.target.value)}
            className="arabic-text w-full rounded border border-border bg-surface px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">English translation</label>
          <p className="mb-1 text-xs text-muted">Must mirror the Arabic's stanza/line structure exactly.</p>
          <textarea
            rows={12}
            value={englishText}
            onChange={(e) => setEnglishText(e.target.value)}
            className="w-full rounded border border-border bg-surface px-3 py-2"
          />
        </div>

        {!alignment.valid && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm">
            <p className="mb-1 font-medium text-red-500">Alignment issues found:</p>
            <ul className="list-inside list-disc space-y-0.5 text-red-400">
              {alignment.errors.map((err, i) => (
                <li key={i}>{err.message}</li>
              ))}
            </ul>
          </div>
        )}

        {saveError && <p className="text-sm text-red-500">{saveError}</p>}

        <div className="flex gap-3">
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="rounded border border-border px-4 py-2 text-sm hover:border-accent disabled:opacity-60"
          >
            Save Draft
          </button>
          <button
            onClick={() => save(true)}
            disabled={saving || !alignment.valid}
            className="rounded bg-accent px-4 py-2 text-sm text-accentFg disabled:opacity-60"
          >
            Publish
          </button>
        </div>
      </div>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">Live Preview</h2>
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => setPreview("lyrics")}
              className={preview === "lyrics" ? "text-accent" : "text-muted"}
            >
              Lyrics
            </button>
            <button
              onClick={() => setPreview("translation")}
              className={preview === "translation" ? "text-accent" : "text-muted"}
            >
              Translation
            </button>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-xl font-semibold">{title || "Untitled"}</h3>
          {arabicTitle && <p className="arabic-text mt-1">{arabicTitle}</p>}
          <p className="mt-1 text-sm text-muted">{reciter}{poet ? ` · ${poet}` : ""}</p>
          <div className="mt-4">
            {preview === "lyrics" ? (
              <LyricsView arabicText={arabicText} />
            ) : (
              <TranslationView arabicText={arabicText} englishText={englishText} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, required, arabic,
}: { label: string; value: string; onChange: (v: string) => void; required?: boolean; arabic?: boolean }) {
  return (
    <label className="block text-sm">
      {label}
      <input
        dir={arabic ? "rtl" : "ltr"}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 w-full rounded border border-border bg-surface px-3 py-2 ${arabic ? "arabic-text" : ""}`}
      />
    </label>
  );
}