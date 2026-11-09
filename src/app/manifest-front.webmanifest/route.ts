import { NextResponse } from "next/server";

// Manifest PWA del sitio público (distinto del manifest del panel admin,
// que arranca en /admin/dashboard). Este arranca en el inicio del sitio.
export function GET() {
  return NextResponse.json(
    {
      name: "Liga 3D Metropolitana",
      short_name: "Liga 3D",
      description: "Torneos, ranking, resultados y más — Liga 3D Metropolitana",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#E8722A",
      icons: [
        { src: "/img/Liga3dLOGOALTA.png", sizes: "192x192", type: "image/png" },
        { src: "/img/Liga3dLOGOALTA.png", sizes: "512x512", type: "image/png" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } }
  );
}
