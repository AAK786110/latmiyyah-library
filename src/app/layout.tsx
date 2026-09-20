import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Latmiyyah Library",
  description: "A searchable library of Shia latmiyyahs and qasidas with Arabic lyrics and English translations.",
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

// Without this, mobile browsers render the page at desktop width and zoom
// out to fit it, instead of laying it out at the phone's actual width.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Dark mode is the default theme: we add the class server-side so there is
// no flash of light mode before ThemeToggle's client-side effect runs.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
