import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { DEFAULT_SITE_THEME, themeStyle } from "@/lib/settings";
import { getSeoText, getSiteUrl, SITE_NAME } from "@/lib/site";
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
  const siteUrl = getSiteUrl();
  const seo = getSeoText(content);
  return {
    metadataBase: siteUrl,
    title: seo.title,
    description: seo.description,
    applicationName: SITE_NAME,
    creator: SITE_NAME,
    publisher: SITE_NAME,
    alternates: {
      canonical: "/",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: "/",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: `${SITE_NAME} VC mark` }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [{ url: "/og.png", alt: `${SITE_NAME} VC mark` }],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      shortcut: "/favicon.ico",
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        { url: "/apple-touch-icon-precomposed.png", sizes: "180x180", type: "image/png" },
      ],
    },
    manifest: "/manifest.webmanifest",
  };
}

export async function generateViewport(): Promise<Viewport> {
  let theme = DEFAULT_SITE_THEME;
  try {
    theme = await getSiteTheme();
  } catch {
    // RootLayout supplies the same fallback theme when storage is unavailable.
  }
  return {
    themeColor: theme.pageBackground,
    width: "device-width",
    initialScale: 1,
  };
}

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
