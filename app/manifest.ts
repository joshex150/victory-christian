import type { MetadataRoute } from "next";
import { DEFAULT_SITE_THEME } from "@/lib/settings";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "VC",
    description: "Victory Christian official website.",
    start_url: "/",
    display: "standalone",
    background_color: DEFAULT_SITE_THEME.pageBackground,
    theme_color: DEFAULT_SITE_THEME.accentDeep,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
