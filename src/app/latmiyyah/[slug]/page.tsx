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

  // Translation is ON by default
  const [showTranslation, setShowTranslation] = useState(true);

  // Used to briefly show "Copied" when the link is copied
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");

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

      setItem({
        ...data,
        tags: (data.tags || [])
          .map((t: any) => t.tag)
          .filter(Boolean),
      });
    }

    load();
  }, [slug, supabase]);

  async function handleShare() {
    if (!item) return;

    const url = window.location.href;

    // On supported phones/browsers, open the normal share menu
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${item.title} | Latmiyyah Vault`,
          url,
        });

        return;
      } catch (error) {
        // If the user simply closes the share menu, do nothing
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    // Otherwise, copy the URL
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("copied");

      setTimeout(() => {
        setShareStatus("idle");
      }, 1500);
    } catch {
      setShareStatus("idle");
    }
  }

  if (item === undefined) {
    return <p className="text-muted">Loading...</p>;
  }

  if (item === null) {
    return notFound();
  }

  const videoId = extractYouTubeId(item.youtube_url);

  const content = showTranslation ? (
    <TranslationView
      arabicText={item.arabic_text}
      englishText={item.english_translation}
    />
  ) : (
    <LyricsView arabicText={item.arabic_text} />
  );

  return (
    <div className="mx-auto max-w-2xl">
      {/* Title / metadata */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{item.title}</h1>

          {item.arabic_title && (
            <p className="arabic-text mt-1 text-lg !text-fg">
              {item.arabic_title}
            </p>
          )}

          <p className="mt-2 text-sm text-muted">
            {item.reciter}
            {item.poet ? ` · ${item.poet}` : ""}
          </p>

          {item.tags && item.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full border border-border px-2 py-0.5 text-xs text-muted"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Share + Favourite */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={handleShare}
            className="rounded-full border border-border px-3 py-1.5 text-sm hover:border-accent"
          >
            {shareStatus === "copied" ? "Copied" : "Share"}
          </button>

          <FavouriteButton id={item.id} />
        </div>
      </div>

      {/* Embedded YouTube player */}
      {videoId && (
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            title={`${item.title} YouTube video`}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      )}

      {/* Translation / fullscreen controls */}
      <div className="mt-6 flex items-center justify-between border-b border-border pb-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showTranslation}
            onChange={(e) => setShowTranslation(e.target.checked)}
          />
          Show English translation
        </label>

        <FullscreenReader>
          {content}
        </FullscreenReader>
      </div>

      {/* Lyrics / translation */}
      <div className="mt-6">
        {content}
      </div>

      <SuggestEditForm latmiyyah={item} />

      <RelatedLatmiyyahs current={item} />
    </div>
  );
}