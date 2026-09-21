import Link from "next/link";
import type { Latmiyyah } from "@/lib/types";
import { youTubeThumbnail } from "@/lib/youtube";
import FavouriteButton from "./FavouriteButton";

export default function LatmiyyahCard({ item }: { item: Latmiyyah }) {
  const thumbnail = youTubeThumbnail(item.youtube_url);

  return (
    <Link
      href={`/latmiyyah/${item.slug}`}
      className="group flex min-h-[180px] flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-accent"
    >
      {thumbnail && (
        <img
          src={thumbnail}
          alt=""
          className="aspect-video w-full object-cover"
        />
      )}
      <div className="flex flex-1 items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="line-clamp-2 font-medium group-hover:text-accent">{item.title}</h3>
          {item.arabic_title && (
            <p className="arabic-text !text-fg">
              {item.arabic_title}
            </p>
          )}
          <p className="mt-1 text-sm text-muted">
            {item.reciter}
            {item.poet ? ` · ${item.poet}` : ""}
          </p>
          {item.tags && item.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.tags.slice(0, 4).map((tag) => (
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
        <FavouriteButton id={item.id} size="sm" />
      </div>
    </Link>
  );
}