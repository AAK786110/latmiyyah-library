"use client";

import { useState } from "react";

export default function LiteYouTubeEmbed({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
          title={`${title} YouTube video`}
          className="aspect-video w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play ${title}`}
      className="group relative block aspect-video w-full overflow-hidden rounded-lg border border-border bg-black"
    >
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt={`${title} video thumbnail`}
        width={480}
        height={360}
        loading="eager"
        fetchPriority="high"
        className="h-full w-full object-cover"
      />

      <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition group-hover:bg-black/20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/75 shadow-lg transition-transform group-hover:scale-105">
          <span
            aria-hidden="true"
            className="ml-1 block h-0 w-0 border-y-[11px] border-l-[18px] border-y-transparent border-l-white"
          />
        </div>
      </div>
    </button>
  );
}