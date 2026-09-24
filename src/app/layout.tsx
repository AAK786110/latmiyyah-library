import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  metadataBase: new URL("https://latmiyyahvault.com"),

  title: {
    default: "Latmiyyah Vault | Arabic Lyrics & English Translations",
    template: "%s | Latmiyyah Vault",
  },

  description:
    "A searchable archive of Shia latmiyyahs and qasidas with original Arabic lyrics, English translations, reciters, poets, and videos.",

  applicationName: "Latmiyyah Vault",

  openGraph: {
    type: "website",
    siteName: "Latmiyyah Vault",
    title: "Latmiyyah Vault | Arabic Lyrics & English Translations",
    description:
      "Explore Shia latmiyyahs and qasidas with original Arabic lyrics, English translations, reciters, poets, and videos.",
  },

  twitter: {
    card: "summary",
    title: "Latmiyyah Vault | Arabic Lyrics & English Translations",
    description:
      "Explore Shia latmiyyahs and qasidas with original Arabic lyrics and English translations.",
  },

  icons: {
    icon: [
      {
        url: "/icon-light.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VB4PZ63EV5"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-VB4PZ63EV5');
          `}
        </Script>

        <Header />

        <main className="mx-auto max-w-6xl px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}