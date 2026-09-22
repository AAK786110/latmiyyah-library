import Link from "next/link";
import type { Latmiyyah } from "@/lib/types";
import { youTubeThumbnail } from "@/lib/youtube";
import FavouriteButton from "./FavouriteButton";

export default function LatmiyyahCard({
  item,
}: {
  item: Latmiyyah;
}) {
  const thumbnail = youTubeThumbnail(
    item.youtube_url
  );

  return (
    <Link
      href={`/latmiyyah/${item.slug}`}
      className="group flex min-h-[180px] flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_12px_30px_rgba(70,45,30,0.06)]"
    >
      {thumbnail && (
        <div className="overflow-hidden bg-bg">
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            width={480}
            height={360}
            className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.015]"
          />
        </div>
      )}

      <div className="flex flex-1 items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="font-display line-clamp-2 text-lg font-medium leading-tight group-hover:text-accent">
            {item.title}
          </h3>

          {item.arabic_title && (
            <p className="arabic-text mt-1 !text-fg">
              {item.arabic_title}
            </p>
          )}

          <p className="mt-2 text-sm text-muted">
            {item.reciter}
            {item.poet
              ? ` · ${item.poet}`
              : ""}
          </p>

          {item.tags &&
            item.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.tags
                  .slice(0, 4)
                  .map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full border border-border px-2 py-0.5 text-[0.68rem] text-muted"
                    >
                      {tag.name}
                    </span>
                  ))}
              </div>
            )}
        </div>

        <FavouriteButton
          id={item.id}
          size="sm"
        />
      </div>
    </Link>
  );
}