import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "sonner";
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

export const metadata: Metadata = {
  title: "No Guide to Womanhood",
  description: "A book for women who are done shrinking. Join the waitlist.",
  openGraph: {
    title: "No Guide to Womanhood",
    description: "A book for women who are done shrinking. Join the waitlist.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "No Guide to Womanhood",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "No Guide to Womanhood",
    description: "A book for women who are done shrinking. Join the waitlist.",
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        {children}
        <Toaster
          position="top-center"
          richColors
          theme="light"
          toastOptions={{
            style: {
              fontFamily: "var(--font-sans)",
              border: "1px solid #f4d7dd",
            },
          }}
        />
      </body>
    </html>
  );
}
