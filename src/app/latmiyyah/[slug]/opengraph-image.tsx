import { ImageResponse } from "next/og";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { extractYouTubeId } from "@/lib/youtube";

export const alt = "Latmiyyah Vault";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

function removeArabic(text: string | null | undefined) {
  if (!text) return "";

  return text
    .replace(
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g,
      ""
    )
    .replace(/\s+/g, " ")
    .replace(/^[\s\-–—·|:]+/, "")
    .replace(/[\s\-–—·|:]+$/, "")
    .trim();
}

export default async function Image({
  params,
}: {
  params:
    | { slug: string }
    | Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = createServerSupabaseClient();

  const { data: item } = await supabase
    .from("latmiyyahs")
    .select("title, reciter, youtube_url")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  const title =
    removeArabic(item?.title) || "Latmiyyah Vault";

  const reciter =
    removeArabic(item?.reciter) || "";

  const videoId = extractYouTubeId(item?.youtube_url);

  const thumbnail = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f8f3eb",
          color: "#2c211b",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: thumbnail ? "62%" : "100%",
            padding: "70px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              fontSize: "30px",
              fontWeight: 700,
            }}
          >
            <img
              src="https://latmiyyahvault.com/icon-light.png"
              width="52"
              height="52"
            />

            <span>Latmiyyah Vault</span>
          </div>

          {/* Main content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "22px",
            }}
          >
            <div
              style={{
                fontSize:
                  title.length > 60
                    ? "44px"
                    : title.length > 40
                    ? "50px"
                    : "58px",
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: "-1px",
              }}
            >
              {title}
            </div>

            {reciter && (
              <div
                style={{
                  fontSize: "25px",
                  color: "#755d4d",
                  lineHeight: 1.3,
                }}
              >
                {reciter}
              </div>
            )}
          </div>

          {/* Description */}
          <div
            style={{
              display: "flex",
              fontSize: "24px",
              color: "#8d2a2e",
              fontWeight: 600,
            }}
          >
            Arabic Lyrics · English Translation
          </div>
        </div>

        {/* YouTube thumbnail */}
        {thumbnail && (
          <div
            style={{
              width: "38%",
              height: "100%",
              display: "flex",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <img
              src={thumbnail}
              width="456"
              height="630"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to right, rgba(248,243,235,0.35), rgba(0,0,0,0.05))",
              }}
            />
          </div>
        )}
      </div>
    ),
    {
      ...size,
    }
  );
}