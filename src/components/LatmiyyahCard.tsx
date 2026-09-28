import Link from "next/link";
import type { Latmiyyah, Tag } from "@/lib/types";
import { youTubeThumbnail } from "@/lib/youtube";
import FavouriteButton from "./FavouriteButton";

const MAX_VISIBLE_TAGS = 5;

/*
 * Context priority:
 *
 * Lower number = shown earlier.
 *
 * Wiladah and Shahadah are intentionally very high priority.
 * After that, more specific/niche contexts are preferred.
 * Broad/common contexts such as Muharram and Ashura appear later.
 */
const CONTEXT_PRIORITY: Record<string, number> = {
  // Major occasions
  "wiladah-celebration": 0,
  shahadah: 1,

  // Very specific / distinctive contexts
  saqifah: 10,
  fatimiyyah: 11,
  ghadeer: 12,
  ghaybah: 13,
  "wilayah-takwiniyyah-creational-authority": 14,
  wilayah: 15,
  "baraah-disassociation": 16,

  captivity: 20,
  shaam: 21,
  kufa: 22,
  kadhimayn: 23,
  najaf: 24,
  ziyarah: 25,

  bravery: 30,
  loyalty: 31,
  patience: 32,
  repentance: 33,
  service: 34,
  "fadhail-virtues": 35,

  // Important, but broader/common
  arbaeen: 50,
  karbala: 51,
  ashura: 52,
  muharram: 53,

  // Broader time/topic descriptors
  rajab: 60,
  "dhul-hijjah": 61,
  topical: 70,
};

/*
 * Some full tag names are too long for a small card.
 * This ONLY changes how they appear on the card.
 * The real tag name in Supabase stays unchanged.
 */
const CARD_TAG_LABELS: Record<string, string> = {
  "wiladah-celebration": "Wiladah",
  shahadah: "Shahadah",
  "fadhail-virtues": "Fadha'il",
  "wilayah-takwiniyyah-creational-authority":
    "Creational Authority",
  "baraah-disassociation": "Bara'ah",
};

function getTagPriority(tag: Tag) {
  // Holy Personalities always come first.
  if (tag.category === "holy_personality") {
    return 0;
  }

  // Context comes after personalities.
  if (tag.category === "context") {
    return 100 + (CONTEXT_PRIORITY[tag.slug] ?? 80);
  }

  // Speed/style tags come last.
  if (tag.category === "speed") {
    return 1000;
  }

  return 2000;
}

function getVisibleTags(tags: Tag[]) {
  return [...tags]
    .sort((a, b) => {
      const priorityDifference =
        getTagPriority(a) - getTagPriority(b);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      // Makes the order deterministic when two tags
      // have exactly the same priority.
      return a.name.localeCompare(b.name);
    })
    .slice(0, MAX_VISIBLE_TAGS);
}

function getCardTagLabel(tag: Tag) {
  return CARD_TAG_LABELS[tag.slug] ?? tag.name;
}

export default function LatmiyyahCard({
  item,
}: {
  item: Latmiyyah;
}) {
  const thumbnail = youTubeThumbnail(
    item.youtube_url
  );

  const visibleTags = item.tags
    ? getVisibleTags(item.tags)
    : [];

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
        <div className="flex min-w-0 flex-1 self-stretch flex-col">
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

          {visibleTags.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
              {visibleTags.map((tag) => (
                <span
                  key={tag.id}
                  title={tag.name}
                  className="max-w-full truncate whitespace-nowrap rounded-full border border-border px-2 py-0.5 text-[0.68rem] text-muted"
                >
                  {getCardTagLabel(tag)}
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