import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Latmiyyah } from "@/lib/types";
import LatmiyyahPageClient from "./LatmiyyahPageClient";

const SITE_URL = "https://latmiyyahvault.com";

const getLatmiyyah = cache(async (slug: string) => {
  const supabase = createServerSupabaseClient();

  const { data } = await supabase
    .from("latmiyyahs")
    .select("*, tags:latmiyyah_tags(tag:tags(*))")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    ...data,
    tags: (data.tags || [])
      .map((t: any) => t.tag)
      .filter(Boolean),
  } as Latmiyyah;
});

function createDescription(item: Latmiyyah) {
  const arabicTitle = item.arabic_title
    ? ` (${item.arabic_title})`
    : "";

  const reciter = item.reciter
    ? `, recited by ${item.reciter}`
    : "";

  const arabicSeo = item.arabic_title
    ? ` اقرأ كلمات ${item.arabic_title} بالعربية مع الترجمة الإنجليزية.`
    : " اقرأ كلمات اللطمية بالعربية مع الترجمة الإنجليزية.";

  return (
    `Read the Arabic lyrics and English translation of ` +
    `${item.title}${arabicTitle}${reciter} on Latmiyyah Vault.` +
    arabicSeo
  );
}

function createStructuredData(
  item: Latmiyyah,
  canonicalUrl: string,
  description: string
) {
  const workId = `${canonicalUrl}#work`;
  const breadcrumbId = `${canonicalUrl}#breadcrumb`;
  const websiteId = `${SITE_URL}/#website`;

  return {
    "@context": "https://schema.org",

    "@graph": [
      {
        "@type": "WebPage",
        "@id": canonicalUrl,

        url: canonicalUrl,

        name: item.arabic_title
          ? `${item.title} (${item.arabic_title}) Lyrics & English Translation`
          : `${item.title} Lyrics & English Translation`,

        description,

        inLanguage: ["en", "ar"],

        isPartOf: {
          "@type": "WebSite",
          "@id": websiteId,
          name: "Latmiyyah Vault",
          url: SITE_URL,
        },

        breadcrumb: {
          "@id": breadcrumbId,
        },

        mainEntity: {
          "@id": workId,
        },
      },

      {
        "@type": "CreativeWork",
        "@id": workId,

        name: item.title,

        ...(item.arabic_title
          ? {
              alternateName: item.arabic_title,
            }
          : {}),

        url: canonicalUrl,

        description,

        inLanguage: ["ar", "en"],

        ...(item.poet
          ? {
              creator: {
                "@type": "Person",
                name: item.poet,
              },
            }
          : {}),

        ...(item.reciter
          ? {
              contributor: {
                "@type": "Person",
                name: item.reciter,
              },
            }
          : {}),

        isPartOf: {
          "@type": "WebSite",
          "@id": websiteId,
          name: "Latmiyyah Vault",
          url: SITE_URL,
        },
      },

      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,

        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Latmiyyah Vault",
            item: SITE_URL,
          },

          {
            "@type": "ListItem",
            position: 2,
            name: "Explore Latmiyyahs",
            item: `${SITE_URL}/explore`,
          },

          {
            "@type": "ListItem",
            position: 3,
            name: item.title,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const item = await getLatmiyyah(params.slug);

  if (!item) {
    return {
      title: "Latmiyyah Not Found",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const arabicTitle = item.arabic_title
    ? ` (${item.arabic_title})`
    : "";

  const seoTitle =
    `${item.title}${arabicTitle} Lyrics & English Translation`;

  const description = createDescription(item);

  const canonicalUrl =
    `${SITE_URL}/latmiyyah/${item.slug}`;

  return {
    title: seoTitle,

    description,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      type: "article",
      url: canonicalUrl,
      siteName: "Latmiyyah Vault",
      title: `${seoTitle} | Latmiyyah Vault`,
      description,
    },

    twitter: {
      card: "summary",
      title: `${seoTitle} | Latmiyyah Vault`,
      description,
    },

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export default async function LatmiyyahPage({
  params,
}: {
  params: { slug: string };
}) {
  const item = await getLatmiyyah(params.slug);

  if (!item) {
    notFound();
  }

  const canonicalUrl =
    `${SITE_URL}/latmiyyah/${item.slug}`;

  const description = createDescription(item);

  const structuredData = createStructuredData(
    item,
    canonicalUrl,
    description
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      <LatmiyyahPageClient item={item} />
    </>
  );
}