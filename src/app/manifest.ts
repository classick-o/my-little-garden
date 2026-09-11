import type { MetadataRoute } from "next";

/**
 * Manifestul PWA. Next il serveste la /manifest.webmanifest.
 * Legatura se face din metadata din layout.tsx.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "My little garden",
    short_name: "My garden",
    description:
      "Gradina ta digitala. Ai grija de plantele tale, noteaza-le povestea si descopera altele noi.",
    lang: "ro",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf7f2",
    theme_color: "#faf7f2",
    categories: ["lifestyle", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
