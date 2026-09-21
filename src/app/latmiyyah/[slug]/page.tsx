import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Latmiyyah } from "@/lib/types";
import LatmiyyahPageClient from "./LatmiyyahPageClient";

const SITE_URL = "https://latmiyyahvault.com";

/*
  Fetch once and reuse the result for both:
  - SEO metadata
  - the actual page

  This means generateMetadata() and the page do not need
  separate database queries during the same request.
*/
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

  return <LatmiyyahPageClient item={item} />;
}