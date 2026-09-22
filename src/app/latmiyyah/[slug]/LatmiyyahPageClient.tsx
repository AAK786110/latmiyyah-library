"use client";

import Link from "next/link";
import { useState } from "react";
import type { Latmiyyah } from "@/lib/types";
import { extractYouTubeId } from "@/lib/youtube";
import LyricsView from "@/components/LyricsView";
import TranslationView from "@/components/TranslationView";
import FullscreenReader from "@/components/FullscreenReader";
import FavouriteButton from "@/components/FavouriteButton";
import RelatedLatmiyyahs from "@/components/RelatedLatmiyyahs";
import SuggestEditForm from "@/components/SuggestEditForm";
import LiteYouTubeEmbed from "@/components/LiteYouTubeEmbed";

export default function LatmiyyahPageClient({
  item,
}: {
  item: Latmiyyah;
}) {
  const [showTranslation, setShowTranslation] = useState(true);

  const [shareStatus, setShareStatus] =
    useState<"idle" | "copied">("idle");

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${item.title} | Latmiyyah Vault`,
          url,
        });

        return;
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }
      }
    }

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
          <h1 className="text-2xl font-semibold">
            {item.title}
          </h1>

          {item.arabic_title && (
            <p
              lang="ar"
              dir="rtl"
              className="arabic-text mt-1 text-lg !text-fg"
            >
              {item.arabic_title}
            </p>
          )}

          <p className="mt-2 text-sm text-muted">
            {item.reciter}
            {item.poet ? ` · ${item.poet}` : ""}
          </p>

          {/* Visible SEO description */}
          <p className="mt-2 text-sm text-muted">
            Arabic lyrics and English translation of{" "}
            <span className="font-medium text-fg">
              {item.title}
            </span>
            {item.arabic_title && (
              <>
                {" "}
                (
                <span lang="ar" dir="rtl">
                  {item.arabic_title}
                </span>
                )
              </>
            )}
            .
          </p>

          {/* Clickable tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/explore/${tag.category}/${tag.slug}`}
                  className="rounded-full border border-border px-2 py-0.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  {tag.name}
                </Link>
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
            {shareStatus === "copied"
              ? "Copied"
              : "Share"}
          </button>

          <FavouriteButton id={item.id} />
        </div>
      </div>

      {/* Embedded YouTube player */}
      {videoId && (
        <div className="mt-4">
            <LiteYouTubeEmbed
            videoId={videoId}
            title={item.title}
            />
        </div>
        )}

      {/* Translation / fullscreen controls */}
      <div className="mt-6 flex items-center justify-between border-b border-border pb-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showTranslation}
            onChange={(e) =>
              setShowTranslation(e.target.checked)
            }
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