"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Latmiyyah } from "@/lib/types";
import { extractYouTubeId } from "@/lib/youtube";
import LyricsView from "@/components/LyricsView";
import TranslationView from "@/components/TranslationView";
import FullscreenReader from "@/components/FullscreenReader";
import FavouriteButton from "@/components/FavouriteButton";
import RelatedLatmiyyahs from "@/components/RelatedLatmiyyahs";
import SuggestEditForm from "@/components/SuggestEditForm";

export default function LatmiyyahPage() {
  const { slug } = useParams<{ slug: string }>();
  const supabase = createClient();
  const [item, setItem] = useState<Latmiyyah | null | undefined>(undefined);
  // Translation is ON by default - visitors see Arabic + English together
  // immediately, and can switch it off if they just want the Arabic.
  const [showTranslation, setShowTranslation] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("latmiyyahs")
        .select("*, tags:latmiyyah_tags(tag:tags(*))")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (!data) {
        setItem(null);
        return;
      }
      setItem({ ...data, tags: (data.tags || []).map((t: any) => t.tag).filter(Boolean) });
    }
    load();
  }, [slug, supabase]);

  if (item === undefined) return <p className="text-muted">Loading...</p>;
  if (item === null) return notFound();

  const content = showTranslation ? (
    <TranslationView arabicText={item.arabic_text} englishText={item.english_translation} />
  ) : (
    <LyricsView arabicText={item.arabic_text} />
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{item.title}</h1>
          {item.arabic_title && <p className="arabic-text mt-1 text-lg">{item.arabic_title}</p>}
          <p className="mt-2 text-sm text-muted">
            {item.reciter}
            {item.poet ? ` · ${item.poet}` : ""}
          </p>
          {item.tags && item.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span key={tag.id} className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <FavouriteButton id={item.id} />
      </div>

      {extractYouTubeId(item.youtube_url) && (
        <a
          href={item.youtube_url!}
          target="_blank"
          rel="noopener noreferrer"
          className="group/yt mt-4 block overflow-hidden rounded-lg border border-border"
        >
          <div className="relative">
            <img
              src={`https://img.youtube.com/vi/${extractYouTubeId(item.youtube_url)}/hqdefault.jpg`}
              alt="Watch on YouTube"
              className="aspect-video w-full object-cover transition-opacity group-hover/yt:opacity-80"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover/yt:bg-black/25">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600/90 shadow-lg transition-transform group-hover/yt:scale-110">
                <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
          <p className="border-t border-border bg-surface px-3 py-2 text-center text-sm font-medium">
            ▶ Watch on YouTube
          </p>
        </a>
      )}

      <div className="mt-6 flex items-center justify-between border-b border-border pb-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showTranslation}
            onChange={(e) => setShowTranslation(e.target.checked)}
          />
          Show English translation
        </label>
        <FullscreenReader>{content}</FullscreenReader>
      </div>

      <div className="mt-6">{content}</div>

      <RelatedLatmiyyahs current={item} />
      <SuggestEditForm latmiyyah={item} />

      {extractYouTubeId(item.youtube_url) && (
        // Fixed so it's always reachable while scrolling through lyrics -
        // and z-[60] puts it above FullscreenReader's overlay (z-50) too,
        // so it stays clickable in fullscreen reading mode as well.
        <a
          href={item.youtube_url!}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accentFg shadow-lg hover:opacity-90"
        >
          ▶ Watch on YouTube
        </a>
      )}
    </div>
  );
}