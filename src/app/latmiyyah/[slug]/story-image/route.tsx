import { ImageResponse } from "next/og";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const SITE_URL = "https://latmiyyahvault.com";

function getYouTubeId(url?: string | null) {
  if (!url) return null;

  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&?/]+)/
  );

  return match?.[1] || null;
}

function stripArabic(text?: string | null) {
  if (!text) return "";

  return text
    .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(text?: string | null) {
  return stripArabic(text).replace(/^\-+\s*/, "").trim();
}

function getTitleSize(title: string) {
  if (title.length > 70) return 52;
  if (title.length > 55) return 58;
  if (title.length > 38) return 66;
  return 76;
}

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = createServerSupabaseClient();

  const { data } = await supabase
    .from("latmiyyahs")
    .select("title, reciter, youtube_url")
    .eq("slug", params.slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  const safeTitle = cleanText(data.title) || "Latmiyyah Vault";
  const safeReciter = cleanText(data.reciter);
  const titleSize = getTitleSize(safeTitle);

  const videoId = getYouTubeId(data.youtube_url);
  const thumbnail = videoId
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#faf6ef",
          padding: "0 64px",
          color: "#2b1f1b",
          fontFamily: "Arial",
        }}
      >
        {/* Empty top safe area for Instagram username/UI */}
        <div style={{ height: "220px", display: "flex" }} />

        {/* Small label */}
        <div
          style={{
            display: "flex",
            alignSelf: "center",
            padding: "12px 24px",
            borderRadius: "999px",
            background: "#f3ece3",
            color: "#7a2026",
            fontSize: "24px",
            fontWeight: 700,
            letterSpacing: "2px",
          }}
        >
          NEW RELEASE
        </div>

        <div style={{ height: "34px", display: "flex" }} />

        {/* Main story card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            background: "#fffdf9",
            border: "1px solid #e8ddd0",
            borderRadius: "42px",
            overflow: "hidden",
          }}
        >
          {/* Text section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "34px 34px 28px 34px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                src={`${SITE_URL}/icon-light.png`}
                width="42"
                height="42"
                style={{ display: "flex" }}
              />
              <div
                style={{
                  display: "flex",
                  marginLeft: "14px",
                  fontSize: "30px",
                  fontWeight: 700,
                  color: "#2b1f1b",
                }}
              >
                Latmiyyah Vault
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: "28px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: `${titleSize}px`,
                  lineHeight: 1.05,
                  fontWeight: 700,
                  color: "#7a2026",
                }}
              >
                {safeTitle}
              </div>

              {safeReciter ? (
                <div
                  style={{
                    display: "flex",
                    marginTop: "18px",
                    fontSize: "36px",
                    color: "#6d5a4c",
                  }}
                >
                  {safeReciter}
                </div>
              ) : null}

              <div
                style={{
                  display: "flex",
                  marginTop: "18px",
                  fontSize: "26px",
                  color: "#9b7a68",
                }}
              >
                Arabic Lyrics • English Translation
              </div>
            </div>
          </div>

          {/* Cropped thumbnail */}
          <div
            style={{
              display: "flex",
              padding: "0 34px 34px 34px",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "100%",
                height: "520px",
                borderRadius: "30px",
                overflow: "hidden",
                background: "#e9dfd3",
              }}
            >
              {thumbnail ? (
                <img
                  src={thumbnail}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center center",
                    display: "flex",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "42px",
                    color: "#7a2026",
                    fontWeight: 700,
                  }}
                >
                  Latmiyyah Vault
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom breathing room */}
        <div style={{ flex: 1, display: "flex" }} />
      </div>
    ),
    {
      width: 1080,
      height: 1920,
    }
  );
}