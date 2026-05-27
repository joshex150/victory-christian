import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { DEFAULT_SITE_THEME, themeStyle } from "@/lib/settings";
import { DEFAULT_CONTENT, getContent, getSiteTheme } from "@/lib/storage";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  let content = DEFAULT_CONTENT;
  try {
    content = await getContent();
  } catch (err) {
    console.warn("[metadata] using defaults because content could not be loaded:", err);
  }
  return {
    title: content.metadataTitle,
    description: content.metadataDescription,
    openGraph: {
      title: content.metadataTitle,
      description: content.metadataDescription,
      type: "website",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: content.metadataTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: content.metadataTitle,
      description: content.metadataDescription,
    },
    icons: { icon: "/favicon.svg" },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let theme = DEFAULT_SITE_THEME;
  try {
    theme = await getSiteTheme();
  } catch (err) {
    console.warn("[theme] using defaults because saved theme could not be loaded:", err);
  }

  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`} style={themeStyle(theme)}>
      <body>
        {children}
        <Toaster
          className="site-toaster"
          position="top-center"
          richColors
          theme="light"
        />
      </body>
    </html>
  );
}
